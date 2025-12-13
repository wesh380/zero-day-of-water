from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile View
        page = browser.new_page(viewport={"width": 375, "height": 812})
        page.goto("http://localhost:5173/agrovoltaics/")

        # Just take a screenshot after a fixed delay since selectors are timing out
        time.sleep(5)

        # Take screenshot of KPI section on Mobile
        page.screenshot(path="verification/mobile_kpi.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
