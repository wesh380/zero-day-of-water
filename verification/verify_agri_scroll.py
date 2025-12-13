from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 1200})

        try:
            page.goto("http://localhost:5173/agrovoltaics/", wait_until="domcontentloaded", timeout=60000)
            time.sleep(5)

            # Scroll to root
            page.evaluate("document.getElementById('root').scrollIntoView()")
            time.sleep(2)

            page.screenshot(path="verification/calculator_view.png")
            print("Calculator screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
