import contextlib
import http.server
import socketserver
import threading
import urllib.request
from functools import partial
from pathlib import Path


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


def fetch(url: str) -> str:
    with urllib.request.urlopen(url, timeout=10) as resp:  # nosec B310
        return resp.read().decode("utf-8", errors="ignore")


def main():
    repo_root = Path(__file__).resolve().parents[1]
    docs_root = repo_root / "docs"
    with serve_docs(docs_root) as port:
        base = f"http://127.0.0.1:{port}/solar/agrivoltaics"
        html = fetch(f"{base}/index.html")
        if "id=\"root\"" not in html:
            raise AssertionError("root element not found in rendered HTML")
        if "overrides.css" not in html:
            raise AssertionError("agrivoltaics overrides stylesheet not referenced")

        app_js = fetch(f"{base}/app.js")
        if "agri-wrapper" not in app_js:
            raise AssertionError("agri-wrapper not found in app.js")
        if "agri-main" not in app_js:
            raise AssertionError("agri-main not found in app.js")
    print("HTTP smoke test PASSED")


if __name__ == "__main__":
    main()
