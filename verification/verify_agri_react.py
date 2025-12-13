from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 812})

        try:
            page.goto("http://localhost:5173/agrovoltaics/", wait_until="domcontentloaded", timeout=60000)

            # Wait for React content
            try:
                page.wait_for_selector("text=هزینه اولیه ساخت", timeout=10000)
                print("React App Loaded Successfully!")
            except:
                print("React App Failed to Load (Selector timeout)")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
