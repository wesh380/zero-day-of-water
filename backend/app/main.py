"""
FastAPI application entrypoint.
"""
from __future__ import annotations

import hashlib
import hmac
import logging
import os
import sys
import time
import uuid
from collections import Counter, defaultdict
from pathlib import Path
from threading import Lock
from typing import Any

import orjson
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse, Response
from jsonschema import Draft202012Validator
from jsonschema.exceptions import SchemaError, ValidationError

try:  # optional Prometheus support
    from prometheus_client import CollectorRegistry, Gauge, generate_latest
    from prometheus_client.exposition import CONTENT_TYPE_LATEST
except ImportError:  # pragma: no cover - optional dependency
    CollectorRegistry = None  # type: ignore
    Gauge = None  # type: ignore
    generate_latest = None  # type: ignore
    CONTENT_TYPE_LATEST = "text/plain; version=0.0.4; charset=utf-8"

load_dotenv()

logger = logging.getLogger("wesh.api")

app = FastAPI(default_response_class=ORJSONResponse)

TOKEN_BUCKET_CAPACITY = 60
TOKEN_REFILL_RATE = 60 / 60  # tokens per second
_rate_limiter_lock = Lock()
_rate_buckets = defaultdict(
    lambda: {
        "tokens": float(TOKEN_BUCKET_CAPACITY),
        "last_refill": time.time(),
    }
)
RATE_LIMIT_EXCLUDED_PATHS = {"/api/health", "/metrics", "/version"}


def _refill_bucket(bucket: dict[str, float]) -> None:
    now = time.time()
    elapsed = now - bucket["last_refill"]
    if elapsed <= 0:
        return
    bucket["tokens"] = min(
        TOKEN_BUCKET_CAPACITY,
        bucket["tokens"] + elapsed * TOKEN_REFILL_RATE,
    )
    bucket["last_refill"] = now


@app.middleware("http")
async def rate_limiter(request: Request, call_next):
    if request.url.path in RATE_LIMIT_EXCLUDED_PATHS:
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"

    with _rate_limiter_lock:
        bucket = _rate_buckets[client_ip]
        _refill_bucket(bucket)
        if bucket["tokens"] < 1:
            retry_after = max(1, int(1 / TOKEN_REFILL_RATE))
            return ORJSONResponse(
                {"detail": "rate limit exceeded"},
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"Retry-After": str(retry_after)},
            )
        bucket["tokens"] -= 1
        remaining = int(bucket["tokens"])

    response = await call_next(request)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response


# Settings
SCHEMA_PATH = Path(__file__).resolve().parent.parent / "schema" / "cld.schema.json"
RUNTIME_DIR = Path(os.getenv("API_RUNTIME_DIR", "C:/wesh360/data/runtime"))
TIME_DRIFT_SECONDS = 30

_validator_lock = Lock()
_validator: Draft202012Validator | None = None


def read_json(path: Path) -> Any:
    """Read JSON content using orjson first, falling back to stdlib."""
    data = path.read_bytes()
    try:
        import orjson as _json

        return _json.loads(data)
    except Exception:
        import json as _json2

        return _json2.loads(data.decode("utf-8-sig"))


def _canonical_json_bytes(payload: Any) -> bytes:
    try:
        return orjson.dumps(payload, option=orjson.OPT_SORT_KEYS)
    except TypeError:
        import json as _json2

        return _json2.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _write_state_file(path: Path, state: str, job_hash: str | None) -> None:
    payload: dict[str, Any] = {"state": state}
    if job_hash:
        payload["job_hash"] = job_hash
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    tmp_path.write_bytes(orjson.dumps(payload))
    os.replace(tmp_path, path)


def _read_state_file(path: Path) -> dict[str, Any]:
    raw = path.read_bytes()
    if not raw:
        return {"state": "", "job_hash": None}
    try:
        data = orjson.loads(raw)
        if isinstance(data, dict):
            state_value = str(data.get("state", ""))
            job_hash = data.get("job_hash")
            if isinstance(job_hash, str):
                return {"state": state_value, "job_hash": job_hash}
            return {"state": state_value, "job_hash": None}
    except orjson.JSONDecodeError:
        pass
    text_content = raw.decode("utf-8", errors="ignore").strip()
    return {"state": text_content, "job_hash": None}


def _find_duplicate_job_id(job_hash: str) -> str | None:
    for state_file in RUNTIME_DIR.glob("*.state"):
        try:
            info = _read_state_file(state_file)
        except (FileNotFoundError, OSError):
            continue
        state_value = str(info.get("state", "")).strip().lower()
        if state_value in {"queued", "processing"} and info.get("job_hash") == job_hash:
            return state_file.stem
    return None


def _load_validator() -> Draft202012Validator:
    """Load and cache the JSON schema validator."""
    global _validator
    if _validator is not None:
        return _validator

    with _validator_lock:
        if _validator is not None:
            return _validator

        try:
            schema_data = read_json(SCHEMA_PATH)
        except FileNotFoundError as exc:  # pragma: no cover - config error handling
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Schema file not found") from exc
        except ValueError as exc:  # pragma: no cover - config error handling
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Schema is not valid JSON") from exc
        except Exception as exc:  # pragma: no cover - config error handling
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Schema could not be loaded") from exc

        try:
            _validator = Draft202012Validator(schema_data)
        except SchemaError as exc:  # pragma: no cover - config error handling
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Schema error: {exc.message}") from exc

        return _validator


DEFAULT_ALLOWED_ORIGINS = [
    "https://wesh360.ir",
    "https://filing-mere-plays-jobs.trycloudflare.com",
    "http://127.0.0.1:8010",
]


def _parse_allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS")
    if raw:
        parsed = [origin.strip() for origin in raw.split(",") if origin.strip()]
        if parsed:
            return list(dict.fromkeys(parsed))
    return DEFAULT_ALLOWED_ORIGINS.copy()


def _collect_job_metrics() -> dict[str, int]:
    counts = {"queued": 0, "processing": 0, "done": 0, "failed": 0}
    for state_file in RUNTIME_DIR.glob("*.state"):
        try:
            info = _read_state_file(state_file)
        except (FileNotFoundError, OSError):
            continue
        state_value = str(info.get("state", "")).strip().lower()
        if state_value in counts:
            counts[state_value] += 1
    return counts


ALLOWED_ORIGINS = _parse_allowed_origins()
if ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )


@app.middleware("http")
async def add_trace_id(request: Request, call_next):
    trace_id = uuid.uuid4().hex
    try:
        response = await call_next(request)
    except HTTPException as exc:
        response = ORJSONResponse({"detail": exc.detail}, status_code=exc.status_code, headers=exc.headers)
    except Exception:  # pragma: no cover - safeguard
        logger.exception("Unhandled error during request")
        response = ORJSONResponse({"detail": "Internal Server Error"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    response.headers["X-Trace-Id"] = trace_id
    return response


@app.get("/api/health")
def health_check() -> dict[str, Any]:
    return {"ok": True, "ts": int(time.time())}


@app.get("/version")
def version() -> dict[str, str]:
    return {"version": "wesh-api-0.1", "python": sys.version.split()[0]}


@app.get("/metrics")
def metrics():  # type: ignore[override]
    counts = _collect_job_metrics()

    metrics_values = {
        "jobs_queued": counts["queued"],
        "jobs_processing": counts["processing"],
        "jobs_done": counts["done"],
        "jobs_failed": counts["failed"],
    }

    if CollectorRegistry and Gauge and generate_latest:
        registry = CollectorRegistry()
        Gauge("app_up", "Application up indicator", registry=registry).set(1)
        for name, value in metrics_values.items():
            Gauge(name, f"Number of jobs in state {name.split('_', 1)[1]}", registry=registry).set(value)
        payload = generate_latest(registry)
        return Response(content=payload, media_type=CONTENT_TYPE_LATEST)

    lines = [
        "# HELP app_up Application up indicator",
        "# TYPE app_up gauge",
        "app_up 1",
    ]
    for name, value in metrics_values.items():
        state = name.split("_", 1)[1]
        lines.append(f"# HELP {name} Number of jobs in state {state}")
        lines.append(f"# TYPE {name} gauge")
        lines.append(f"{name} {value}")
    body = "\n".join(lines) + "\n"
    return Response(content=body, media_type="text/plain; version=0.0.4; charset=utf-8")


def _ensure_runtime_dir() -> None:
    try:
        RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    except Exception as exc:  # pragma: no cover - filesystem edge
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to prepare runtime directory") from exc


def _enforce_signature(secret: str, body: bytes, ts_header: str | None, sign_header: str | None) -> None:
    if not ts_header or not sign_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing signature headers")

    try:
        timestamp = int(ts_header)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid timestamp header") from exc

    now = int(time.time())
    if abs(now - timestamp) > TIME_DRIFT_SECONDS:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Signature timestamp drift exceeded")

    message = ts_header.encode("utf-8") + b"." + body
    expected = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()
    provided = sign_header.strip().lower()
    if not hmac.compare_digest(expected, provided):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")


def _validate_graph_payload(payload: dict[str, Any]) -> None:
    nodes = payload.get("nodes", [])
    edges = payload.get("edges", [])

    node_ids = [node["id"] for node in nodes]
    duplicates = sorted({node_id for node_id, count in Counter(node_ids).items() if count > 1})
    if duplicates:
        dup_str = ", ".join(duplicates)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Duplicate node id(s): {dup_str}")

    node_id_set = set(node_ids)
    missing = set()
    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")
        if source not in node_id_set:
            missing.add(source)
        if target not in node_id_set:
            missing.add(target)

    if missing:
        missing_str = ", ".join(sorted(missing))
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Edge references unknown node(s): {missing_str}")


@app.post("/api/submit")
async def submit(request: Request) -> dict[str, str]:
    raw_body = await request.body()

    try:
        payload = orjson.loads(raw_body)
    except orjson.JSONDecodeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request body must be valid JSON") from exc

    validator = _load_validator()
    try:
        validator.validate(payload)
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.message) from exc

    _validate_graph_payload(payload)

    secret = os.getenv("API_HMAC_SECRET", "")
    if secret:
        _enforce_signature(secret, raw_body, request.headers.get("X-Ts"), request.headers.get("X-Sign"))

    canonical_payload = _canonical_json_bytes(payload)
    job_hash = hashlib.sha256(canonical_payload).hexdigest()

    duplicate_job_id = _find_duplicate_job_id(job_hash)
    if duplicate_job_id:
        return {"job_id": duplicate_job_id}

    job_id = str(uuid.uuid4())
    _ensure_runtime_dir()

    input_path = RUNTIME_DIR / f"{job_id}.in.json"
    state_path = RUNTIME_DIR / f"{job_id}.state"

    try:
        input_path.write_bytes(orjson.dumps(payload, option=orjson.OPT_INDENT_2))
        _write_state_file(state_path, "queued", job_hash)
    except Exception as exc:  # pragma: no cover - filesystem edge
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to persist job") from exc

    return {"job_id": job_id}


@app.get("/api/result/{job_id}")
def get_result(job_id: str) -> Any:
    state_path = RUNTIME_DIR / f"{job_id}.state"
    if not state_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    try:
        info = _read_state_file(state_path)
    except Exception as exc:  # pragma: no cover - filesystem edge
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to read job state") from exc

    state_value = str(info.get("state", "")).strip()

    if state_value.lower() == "done":
        output_path = RUNTIME_DIR / f"{job_id}.out.json"
        if not output_path.exists():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not available")
        try:
            return read_json(output_path)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Result file is not valid JSON") from exc
        except Exception as exc:  # pragma: no cover - filesystem edge
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to read result file") from exc

    return {"status": state_value}
