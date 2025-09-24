"""
Background worker processing queued jobs for Wesh360.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import time
import traceback
from pathlib import Path
from typing import Any, Tuple

try:
    import orjson
except ImportError:  # pragma: no cover - optional dependency
    orjson = None  # type: ignore

RUNTIME_DIR = Path(os.getenv("API_RUNTIME_DIR", r"C:\\wesh360\\data\\runtime"))
DERIVED_DIR = Path(os.getenv("API_DERIVED_DIR", r"C:\\wesh360\\data\\derived"))
SLEEP_SECONDS = 1


def _utc_now_iso() -> str:
    return dt.datetime.now(tz=dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _log(message: str) -> None:
    print(f"[{_utc_now_iso()}] {message}", flush=True)


def _ensure_directories() -> None:
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    DERIVED_DIR.mkdir(parents=True, exist_ok=True)


def _atomic_write_text(path: Path, content: str) -> None:
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    tmp_path.write_text(content, encoding="utf-8")
    os.replace(tmp_path, path)


def _atomic_write_json(path: Path, payload: Any) -> None:
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    if orjson is not None:
        tmp_path.write_bytes(orjson.dumps(payload, option=orjson.OPT_INDENT_2))
    else:
        tmp_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    os.replace(tmp_path, path)


def _load_json(path: Path) -> Any:
    data = path.read_bytes()
    if orjson is not None:
        return orjson.loads(data)
    return json.loads(data.decode("utf-8"))


def _canonical_json_bytes(payload: Any) -> bytes:
    if orjson is not None:
        return orjson.dumps(payload, option=orjson.OPT_SORT_KEYS)
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _read_state_info(path: Path) -> Tuple[str, str | None]:
    raw = path.read_bytes()
    if not raw:
        return "", None
    data: Any = None
    if orjson is not None:
        try:
            data = orjson.loads(raw)
        except orjson.JSONDecodeError:
            data = None
    if data is None:
        try:
            data = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            data = None
    if isinstance(data, dict):
        state_value = str(data.get("state", ""))
        job_hash = data.get("job_hash")
        return state_value, job_hash if isinstance(job_hash, str) else None
    text_value = raw.decode("utf-8", errors="ignore").strip()
    return text_value, None


def _write_state_info(path: Path, state: str, job_hash: str | None) -> None:
    payload: dict[str, Any] = {"state": state}
    if job_hash:
        payload["job_hash"] = job_hash
    _atomic_write_json(path, payload)


def _has_processing_peer(job_hash: str, current_job_id: str) -> bool:
    for state_file in RUNTIME_DIR.glob("*.state"):
        if state_file.stem == current_job_id:
            continue
        try:
            other_state, other_hash = _read_state_info(state_file)
        except (FileNotFoundError, OSError):
            continue
        if other_hash == job_hash and other_state.strip().lower() == "processing":
            return True
    return False


def _print_trace_with_timestamp(exc: BaseException) -> None:
    timestamp = _utc_now_iso()
    lines = traceback.format_exception(type(exc), exc, exc.__traceback__)
    for line in lines:
        print(f"[{timestamp}] {line.rstrip()}", flush=True)


def _process_job(job_id: str, state_path: Path, job_hash: str | None) -> None:
    transitions = ["queued"]

    input_path = RUNTIME_DIR / f"{job_id}.in.json"
    output_path = RUNTIME_DIR / f"{job_id}.out.json"
    error_path = RUNTIME_DIR / f"{job_id}.err.txt"

    current_hash = job_hash

    try:
        payload = _load_json(input_path)
        if current_hash is None:
            try:
                canonical_bytes = _canonical_json_bytes(payload)
            except Exception:
                canonical_bytes = None
            else:
                current_hash = hashlib.sha256(canonical_bytes).hexdigest()

        _write_state_info(state_path, "processing", current_hash)
        transitions.append("processing")

        used_files: list[str] = []
        for derived_file in DERIVED_DIR.glob("*.json"):
            _ = _load_json(derived_file)
            used_files.append(derived_file.name)

        summary = {
            "nodes": len(payload.get("nodes", [])) if isinstance(payload, dict) else 0,
            "edges": len(payload.get("edges", [])) if isinstance(payload, dict) else 0,
            "has_meta": isinstance(payload, dict) and "meta" in payload,
        }

        result = {
            "job_id": job_id,
            "job_hash": current_hash,
            "generated_at": _utc_now_iso(),
            "summary": summary,
            "used_files": used_files,
        }

        _atomic_write_json(output_path, result)
        _write_state_info(state_path, "done", current_hash)
        transitions.append("done")
    except Exception as exc:  # pragma: no cover - defensive
        transitions.append("failed")
        error_message = f"{type(exc).__name__}: {exc}"
        _atomic_write_text(error_path, error_message)
        _write_state_info(state_path, "failed", current_hash)
        _print_trace_with_timestamp(exc)
    finally:
        _log(f"job={job_id} state={' -> '.join(transitions)}")


def main() -> None:
    _log(f"worker config: runtime={RUNTIME_DIR}")
    _log(f"worker config: derived={DERIVED_DIR}")
    _ensure_directories()
    _log("worker started")

    try:
        while True:
            state_files = list(RUNTIME_DIR.glob("*.state"))
            for state_path in state_files:
                job_id = state_path.stem

                try:
                    state_value, job_hash = _read_state_info(state_path)
                except FileNotFoundError:
                    continue

                if state_value.strip().lower() != "queued":
                    continue

                lock_path = RUNTIME_DIR / f"{job_id}.lock"

                try:
                    lock_fd = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
                except FileExistsError:
                    continue
                except OSError as lock_err:  # pragma: no cover - rare windows permissions
                    _log(f"job={job_id} lock_error={lock_err}")
                    continue

                try:
                    os.close(lock_fd)
                    try:
                        state_value, job_hash = _read_state_info(state_path)
                    except FileNotFoundError:
                        continue

                    if state_value.strip().lower() != "queued":
                        continue

                    if job_hash and _has_processing_peer(job_hash, job_id):
                        _log(f"job={job_id} duplicate hash in-flight; skipping")
                        continue

                    _process_job(job_id, state_path, job_hash)
                finally:
                    try:
                        lock_path.unlink()
                    except FileNotFoundError:
                        pass
            time.sleep(SLEEP_SECONDS)
    except KeyboardInterrupt:
        _log("worker stopping (KeyboardInterrupt)")


if __name__ == "__main__":
    main()


