from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile View
        page = browser.new_page(viewport={"width": 375, "height": 812})
        # Use simple timeout
        page.goto("http://localhost:5173/agrovoltaics/")

        # Wait for Calculator to mount - check for specific element content
        # Looking for "ماشین‌حساب فوتوکشت" (Photo-Cultivation Calculator)
        try:
            page.wait_for_selector("text=ماشین‌حساب فوتوکشت", timeout=10000)
        except Exception as e:
            print(f"Waiting for title failed: {e}")
            page.screenshot(path="verification/error_title.png", full_page=True)
            return

        # Take screenshot of KPI section on Mobile
        page.screenshot(path="verification/mobile_kpi.png", full_page=True)

        # Toggle Advanced Settings
        try:
            # Click the accordion button
            page.click("button:has-text('حالت پیشرفته')")
            time.sleep(0.5)
            page.screenshot(path="verification/mobile_advanced.png", full_page=True)
        except Exception as e:
            print(f"Click failed: {e}")

        # Desktop View
        page_desktop = browser.new_page(viewport={"width": 1280, "height": 800})
        page_desktop.goto("http://localhost:5173/agrovoltaics/")
        page_desktop.wait_for_selector("text=ماشین‌حساب فوتوکشت", timeout=10000)
        page_desktop.screenshot(path="verification/desktop_full.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
