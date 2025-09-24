"""
Maintenance utility to purge stale runtime files.
"""
from __future__ import annotations

import argparse
import datetime as dt
import os
from pathlib import Path

DEFAULT_RUNTIME_DIR = Path(r"C:\\wesh360\\data\\runtime")
RUNTIME_DIR = DEFAULT_RUNTIME_DIR
PATTERNS = ("*.state", "*.in.json", "*.out.json", "*.err.txt")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Cleanup runtime directory files older than TTL hours.")
    parser.add_argument("--ttl-hours", type=float, required=True, help="Remove files older than this TTL in hours.")
    return parser.parse_args()


def main() -> None:
    global RUNTIME_DIR

    runtime_env = os.getenv("API_RUNTIME_DIR")
    RUNTIME_DIR = Path(runtime_env) if runtime_env else DEFAULT_RUNTIME_DIR
    print(f"[maintenance] runtime_env={runtime_env!r} resolved={RUNTIME_DIR}", flush=True)
    args = parse_args()
    ttl_hours = args.ttl_hours
    if ttl_hours <= 0:
        raise SystemExit("--ttl-hours must be positive")

    if not RUNTIME_DIR.exists():
        print(f"Runtime directory {RUNTIME_DIR} does not exist; nothing to do.")
        return

    now_utc = dt.datetime.now(tz=dt.timezone.utc)
    cutoff = now_utc - dt.timedelta(hours=ttl_hours)
    removed = 0

    for pattern in PATTERNS:
        for path in RUNTIME_DIR.glob(pattern):
            try:
                mtime = dt.datetime.fromtimestamp(path.stat().st_mtime, tz=dt.timezone.utc)
            except OSError:
                continue
            if mtime >= cutoff:
                continue
            try:
                path.unlink()
                removed += 1
            except OSError as exc:
                print(f"Failed to remove {path}: {exc}")

    print(f"Removed {removed} file(s) older than {ttl_hours} hour(s).")


if __name__ == "__main__":
    main()


