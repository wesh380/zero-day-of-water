from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 812})

        try:
            # Use domcontentloaded which is faster
            page.goto("http://localhost:5173/agrovoltaics/", wait_until="domcontentloaded", timeout=60000)

            # Wait a bit for React to hydrate
            time.sleep(5)

            page.screenshot(path="verification/mobile_kpi.png", full_page=True)
            print("Screenshot taken successfully")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
