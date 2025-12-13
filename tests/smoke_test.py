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
                # Mobile
                {"width": 320, "height": 568},
                {"width": 375, "height": 667},
                # Tablet / Desktop range where clipping occurs
                {"width": 426, "height": 800},
                {"width": 480, "height": 800},
                {"width": 640, "height": 800},
                {"width": 768, "height": 1024},
                {"width": 1024, "height": 768},
                {"width": 1280, "height": 800},
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

                # Wait for React mount
                try:
                    page.wait_for_selector("text=هزینه اولیه ساخت", timeout=5000)
                except:
                    print(f"FAIL: Calculator text not found at {vp['width']}x{vp['height']}")
                    failed = True
                    context.close()
                    continue

                # Force overflow visible to detect real layout issues
                page.evaluate("""() => {
                    document.documentElement.style.overflowX = 'visible';
                    document.body.style.overflowX = 'visible';
                }""")

                # Scan for offenders
                offenders = page.evaluate("""() => {
                    let vw = document.documentElement.clientWidth;
                    let offenders = [];
                    let all = document.querySelectorAll('*');

                    for (let el of all) {
                        let r = el.getBoundingClientRect();
                        // Check if element is inside a table scroll wrapper
                        let inTable = el.closest('.overflow-x-auto');

                        if (!inTable && (r.right > vw + 1 || r.left < -1)) {
                            // Filter out html/body usually equal to viewport but might report slightly off if scrollbar
                            if (el.tagName === 'HTML' || el.tagName === 'BODY') continue;
                            // Filter out elements that are just wrappers equal to body width
                            // Actually we want strict check.

                            offenders.push({
                                tag: el.tagName,
                                class: el.className,
                                id: el.id,
                                rect: { right: r.right, left: r.left, width: r.width },
                                text: el.innerText ? el.innerText.substring(0, 30) : ''
                            });
                        }
                    }
                    return offenders;
                }""")

                if offenders:
                    print(f"FAIL: Overflow offenders at {vp['width']}x{vp['height']}:")
                    for o in offenders:
                        print(f" - {o['tag']}.{o['class']} (id={o['id']}) rect={o['rect']} text='{o['text']}'")
                    failed = True
                else:
                    print(f"PASS: No offenders at {vp['width']}x{vp['height']}")

                context.close()

            if failed:
                print("Test Suite FAILED")
                exit(1)
            print("All viewports passed.")

    finally:
        server.kill()

if __name__ == "__main__":
    smoke_test()
