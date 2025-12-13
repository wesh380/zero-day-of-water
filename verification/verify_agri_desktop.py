from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        try:
            page.goto("http://localhost:5173/agrovoltaics/", wait_until="domcontentloaded", timeout=60000)
            time.sleep(5) # Wait for React mount

            # Scroll to calculator
            element = page.locator("#root")
            element.scroll_into_view_if_needed()
            time.sleep(1)

            page.screenshot(path="verification/desktop_results.png", full_page=False)
            print("Desktop screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
