from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile View
        page = browser.new_page(viewport={"width": 375, "height": 812})
        # Increase timeout for loading
        try:
            page.goto("http://localhost:5173/agrovoltaics/", timeout=60000)
        except Exception as e:
            print(f"Navigation error: {e}")
            return

        # Wait for Calculator to mount
        try:
            page.wait_for_selector("#root section", timeout=60000)
        except Exception as e:
            print(f"Selector timeout: {e}")
            page.screenshot(path="verification/error_state.png", full_page=True)
            return

        # Take screenshot of KPI section on Mobile
        page.screenshot(path="verification/mobile_kpi.png", full_page=True)

        # Toggle Advanced Settings
        # Using get_by_text since the button text might be complex or role button might be ambiguous
        try:
            page.get_by_text("حالت پیشرفته").click()
            time.sleep(1) # Wait for animation
            page.screenshot(path="verification/mobile_advanced.png", full_page=True)
        except Exception as e:
            print(f"Click error: {e}")

        # Desktop View
        page_desktop = browser.new_page(viewport={"width": 1280, "height": 800})
        page_desktop.goto("http://localhost:5173/agrovoltaics/", timeout=60000)
        page_desktop.wait_for_selector("#root section", timeout=60000)
        page_desktop.screenshot(path="verification/desktop_full.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
