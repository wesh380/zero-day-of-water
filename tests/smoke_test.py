from playwright.sync_api import sync_playwright
import time
import subprocess
import sys
import os

def smoke_test():
    # Start server
    server = subprocess.Popen([sys.executable, "-m", "http.server", "8081", "--directory", "docs"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2) # Wait for server

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            viewports = [
                {"width": 320, "height": 568},
                {"width": 360, "height": 640},
                {"width": 375, "height": 667},
                {"width": 390, "height": 844},
                {"width": 414, "height": 896},
                {"width": 768, "height": 1024},
                {"width": 1024, "height": 768},
            ]

            for vp in viewports:
                context = browser.new_context(viewport=vp)
                page = context.new_page()

                # Abort fonts to speed up
                page.route("**/*.woff2", lambda route: route.abort())
                page.route("**/*.woff", lambda route: route.abort())

                print(f"Testing viewport {vp['width']}x{vp['height']}...")
                page.goto("http://localhost:8081/agrovoltaics/", wait_until="domcontentloaded")

                # Check for React mount
                try:
                    page.wait_for_selector("text=هزینه اولیه ساخت", timeout=5000)
                except:
                    print(f"FAIL: Calculator text not found at {vp['width']}x{vp['height']}")
                    print(page.content())
                    exit(1)

                # Check for horizontal scroll
                scroll_width = page.evaluate("document.documentElement.scrollWidth")
                client_width = page.evaluate("document.documentElement.clientWidth")

                if scroll_width > client_width + 1:
                    print(f"FAIL: Horizontal scroll detected at {vp['width']}x{vp['height']}. Scroll: {scroll_width}, Client: {client_width}")

                    # Try to find element causing overflow
                    overflow_el = page.evaluate("""() => {
                        let width = document.documentElement.clientWidth;
                        let els = document.querySelectorAll('*');
                        for (let el of els) {
                            let rect = el.getBoundingClientRect();
                            if (rect.right > width) {
                                return el.className || el.tagName;
                            }
                        }
                        return null;
                    }""")
                    print(f"Culprit: {overflow_el}")
                    exit(1)
                else:
                    print(f"PASS: No horizontal scroll at {vp['width']}x{vp['height']}")

                context.close()

            print("All viewports passed.")

    finally:
        server.kill()

if __name__ == "__main__":
    smoke_test()
