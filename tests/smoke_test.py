import contextlib
import http.server
import os
import socketserver
import sys
import threading
from functools import partial
from pathlib import Path

try:
    from playwright.sync_api import TimeoutError, sync_playwright

    PLAYWRIGHT_AVAILABLE = True
except ImportError:  # pragma: no cover - playwright may not be installed
    PLAYWRIGHT_AVAILABLE = False
    sync_playwright = None

    class TimeoutError(Exception):
        """Fallback TimeoutError placeholder when playwright is missing."""

VIEWPORTS = [
    {"width": 360, "height": 740},
    {"width": 390, "height": 844},
    {"width": 425, "height": 900},
    {"width": 768, "height": 1024},
    {"width": 1024, "height": 1366},
    {"width": 1280, "height": 800},
]


@contextlib.contextmanager
def serve_docs(directory: Path):
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=str(directory))
    with socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler) as httpd:
        httpd.allow_reuse_address = True
        port = httpd.server_address[1]
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            yield port
        finally:
            httpd.shutdown()
            thread.join()


def assert_page_ready(page):
    page.wait_for_selector("text=هزینه اولیه ساخت", timeout=8000)
    if page.locator(".agri-wrapper").count() == 0:
        raise AssertionError("agri-wrapper not found; layout may be broken")
    if page.locator(".agri-error-fallback").count() > 0:
        raise AssertionError("error fallback is visible")
    root_html = page.locator("#root").inner_html().strip()
    if not root_html:
        raise AssertionError("root element is empty")


def run_viewports(url: str):
    if not PLAYWRIGHT_AVAILABLE:
        print("Playwright not installed; skipping browser smoke test.")
        return

    with sync_playwright() as p:
        executable = os.environ.get("PLAYWRIGHT_CHROMIUM")
        launch_kwargs = {"headless": True}
        if executable:
            launch_kwargs["executable_path"] = executable
        browser = p.chromium.launch(**launch_kwargs)
        page = browser.new_page()
        for size in VIEWPORTS:
            page.set_viewport_size(size)
            page.goto(url, wait_until="domcontentloaded")
            page.wait_for_timeout(300)
            assert_page_ready(page)
        browser.close()


def main():
    if not PLAYWRIGHT_AVAILABLE:
        print("SKIP: Playwright is not available; smoke test not run.")
        return

    repo_root = Path(__file__).resolve().parents[1]
    docs_root = repo_root / "docs"
    with serve_docs(docs_root) as port:
        url = f"http://127.0.0.1:{port}/solar/agrivoltaics/index.html"
        run_viewports(url)
    print("Smoke test PASSED")


if __name__ == "__main__":
    try:
        main()
    except TimeoutError as exc:
        print("Smoke test FAILED: timeout", exc)
        raise
    except Exception as exc:  # pragma: no cover
        print("Smoke test FAILED:", exc)
        raise
