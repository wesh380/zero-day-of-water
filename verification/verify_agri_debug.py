from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 360, "height": 800})

        try:
            page.goto("http://localhost:5173/agrovoltaics/", wait_until="domcontentloaded", timeout=60000)
            time.sleep(5) # Wait for render/crash

            page.screenshot(path="verification/debug_mobile.png", full_page=True)
            print("Screenshot taken")

            # Print page content to see if #root is empty
            root_html = page.inner_html("#root")
            print(f"Root content: {root_html[:500]}...")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
