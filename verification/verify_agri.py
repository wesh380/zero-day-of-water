from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile View
        page = browser.new_page(viewport={"width": 375, "height": 812})
        page.goto("http://localhost:5173/agrovoltaics/")

        # Wait for Calculator to mount
        page.wait_for_selector("#root section")

        # Take screenshot of KPI section on Mobile
        page.screenshot(path="verification/mobile_kpi.png", full_page=True)

        # Toggle Advanced Settings
        page.get_by_role("button", name="حالت پیشرفته").click()
        page.screenshot(path="verification/mobile_advanced.png", full_page=True)

        # Desktop View
        page_desktop = browser.new_page(viewport={"width": 1280, "height": 800})
        page_desktop.goto("http://localhost:5173/agrovoltaics/")
        page_desktop.wait_for_selector("#root section")
        page_desktop.screenshot(path="verification/desktop_full.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
