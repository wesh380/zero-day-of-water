from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Test 1: Mobile 360px
        page_mobile = browser.new_page(viewport={"width": 360, "height": 800})
        messages = []
        page_mobile.on("console", lambda msg: messages.append(msg.text))

        try:
            print("Navigating to Agrovoltaics (Mobile)...")
            page_mobile.goto("http://localhost:5173/agrovoltaics/", wait_until="domcontentloaded", timeout=60000)

            # Wait for calculator title
            page_mobile.wait_for_selector("text=ماشین‌حساب فوتوکشت", timeout=15000)
            print("✅ Mobile: Calculator Title Found")

            # Wait for input label
            page_mobile.wait_for_selector("text=مساحت زمین", timeout=15000)
            print("✅ Mobile: Input Label Found")

            # Check for ReferenceError
            errors = [m for m in messages if "ReferenceError" in m or "error" in m.lower()]
            if errors:
                print(f"❌ Mobile: Console Errors detected: {errors}")
            else:
                print("✅ Mobile: No Console Errors")

            page_mobile.screenshot(path="verification/mobile_360_fixed.png", full_page=True)
            print("📸 Mobile Screenshot saved")

        except Exception as e:
            print(f"❌ Mobile Test Failed: {e}")

        # Test 2: Desktop
        page_desktop = browser.new_page(viewport={"width": 1280, "height": 800})
        try:
            print("Navigating to Agrovoltaics (Desktop)...")
            page_desktop.goto("http://localhost:5173/agrovoltaics/", wait_until="domcontentloaded", timeout=60000)
            page_desktop.wait_for_selector("text=ماشین‌حساب فوتوکشت", timeout=15000)
            print("✅ Desktop: Calculator Title Found")

            page_desktop.screenshot(path="verification/desktop_fixed.png", full_page=True)
            print("📸 Desktop Screenshot saved")

        except Exception as e:
            print(f"❌ Desktop Test Failed: {e}")

        browser.close()

if __name__ == "__main__":
    run()
