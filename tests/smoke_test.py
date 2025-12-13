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
                {"width": 425, "height": 800},
                {"width": 768, "height": 1024},
                {"width": 1024, "height": 768},
            ]

            failed = False

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
                    failed = True
                    context.close()
                    continue

                # Check for horizontal scroll
                # Allow a small tolerance
                overflow_info = page.evaluate("""() => {
                    let scrollW = document.documentElement.scrollWidth;
                    let clientW = document.documentElement.clientWidth;
                    let overflow = scrollW > clientW + 1;

                    let culprits = [];
                    if (overflow) {
                        let all = document.querySelectorAll('*');
                        for (let el of all) {
                            let rect = el.getBoundingClientRect();
                            if (rect.right > clientW + 1 || rect.left < -1) {
                                // Ignore elements that are usually culprits but legitimate like html/body if configured wrong
                                if (el.tagName === 'HTML' || el.tagName === 'BODY') continue;

                                culprits.push({
                                    tag: el.tagName,
                                    class: el.className,
                                    id: el.id,
                                    rect: {
                                        right: rect.right,
                                        width: rect.width,
                                        left: rect.left
                                    },
                                    text: el.innerText ? el.innerText.substring(0, 20) : ''
                                });
                            }
                        }
                    }
                    return { overflow, scrollW, clientW, culprits };
                }""")

                if overflow_info['overflow']:
                    print(f"FAIL: Overflow at {vp['width']}x{vp['height']}. Scroll: {overflow_info['scrollW']}, Client: {overflow_info['clientW']}")
                    print("Culprits:")
                    for c in overflow_info['culprits']:
                        print(f" - {c['tag']}.{c['class']} (id={c['id']}) rect={c['rect']} text='{c['text']}'")
                    failed = True
                else:
                    print(f"PASS: No horizontal scroll at {vp['width']}x{vp['height']}")

                context.close()

            if failed:
                exit(1)
            print("All viewports passed.")

    finally:
        server.kill()

if __name__ == "__main__":
    smoke_test()
