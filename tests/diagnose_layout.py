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
    {"width": 425, "height": 900},
    {"width": 426, "height": 900},
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


def measure_layout(page):
    return page.evaluate(
        """
() => {
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { width: r.width, left: r.left, right: r.right };
  };
  const style = (el) => (el ? window.getComputedStyle(el) : null);
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const shell = document.querySelector('.agri-calculator-shell');
  const root = document.querySelector('#root');
  const wrapper = document.querySelector('.agri-wrapper');
  const main = document.querySelector('.agri-main');
  const offenders = [];
  const scope = shell || document.body;
  const tolerance = 1.5;
  const hasScrollAncestor = (el) => {
    let current = el.parentElement;
    while (current) {
      const styleX = window.getComputedStyle(current).overflowX;
      if (styleX && styleX !== 'visible') {
        const r = current.getBoundingClientRect();
        if (r && r.left >= -tolerance && r.right <= viewportWidth + tolerance) {
          return true;
        }
      }
      current = current.parentElement;
    }
    return false;
  };

  scope.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r) return;
    const overflowRight = r.right - viewportWidth;
    const overflowLeft = r.left;
    if (overflowRight > tolerance || overflowLeft < -tolerance) {
      if (hasScrollAncestor(el)) return;
      offenders.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        className: (el.className || '').toString().slice(0, 160),
        rect: { left: r.left, right: r.right, width: r.width },
      });
    }
  });

  return {
    viewportWidth,
    viewportHeight,
    shell: rect(shell),
    root: rect(root),
    wrapper: rect(wrapper),
    main: rect(main),
    displays: {
      wrapper: style(wrapper)?.display || null,
      main: style(main)?.display || null,
    },
    mainInHeader: Boolean(main && main.closest('header')),
    mainInFlexRow: Boolean(main && main.closest('[class*=\\"flex-row\\"]')),
    offenders,
  };
}
"""
    )


def assert_layout(layout, viewport):
    width = viewport["width"]
    main_rect = layout.get("main") or {}
    wrapper_rect = layout.get("wrapper") or {}

    if layout.get("mainInHeader"):
        raise AssertionError(".agri-main is nested inside a header; layout is broken")
    if layout.get("mainInFlexRow"):
        raise AssertionError(".agri-main is nested in a flex-row container")
    if layout.get("offenders"):
        offender = layout["offenders"][0]
        raise AssertionError(
            f"Overflow detected by {offender['tag']}#{offender['id']} ({offender['className']})"
        )

    if width in (768, 1024):
        main_width = main_rect.get("width")
        if main_width is None or main_width < width - 12:
            raise AssertionError(
                f".agri-main width too small at {width}px viewport (got {main_width})"
            )
        if main_rect.get("left", 0) < -4:
            raise AssertionError(
                f".agri-main has negative offset ({main_rect.get('left')}) at {width}px"
            )

    if wrapper_rect and wrapper_rect.get("width", 0) > width + 12:
        raise AssertionError(
            f".agri-wrapper wider than viewport ({wrapper_rect.get('width')} > {width})"
        )


def run_viewports(url: str):
    if not PLAYWRIGHT_AVAILABLE:
        print("SKIP: playwright not installed")
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
            page.goto(url, wait_until="networkidle")
            page.wait_for_timeout(400)
            page.wait_for_selector(".agri-wrapper", timeout=8000)
            layout = measure_layout(page)
            print(f"Viewport {size['width']}x{size['height']}: {layout}")
            assert_layout(layout, size)
        browser.close()


def main():
    if not PLAYWRIGHT_AVAILABLE:
        print("SKIP: playwright not installed")
        sys.exit(0)

    repo_root = Path(__file__).resolve().parents[1]
    docs_root = repo_root / "docs"
    with serve_docs(docs_root) as port:
        url = f"http://127.0.0.1:{port}/solar/agrivoltaics/index.html"
        run_viewports(url)
    print("Layout diagnostics PASSED")


if __name__ == "__main__":
    try:
        main()
    except TimeoutError as exc:  # pragma: no cover
        print("Layout diagnostics FAILED: timeout", exc)
        raise
    except Exception as exc:  # pragma: no cover
        print("Layout diagnostics FAILED:", exc)
        raise
