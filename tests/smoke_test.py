from playwright.sync_api import sync_playwright
import time

def smoke_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Abort fonts to speed up and avoid timeout
        page.route("**/*.woff2", lambda route: route.abort())
        page.route("**/*.woff", lambda route: route.abort())

        try:
            page.goto("http://localhost:8081/agrovoltaics/", wait_until="domcontentloaded")

            # Check for specific text that indicates React mounted and rendered
            try:
                page.wait_for_selector("text=هزینه اولیه ساخت", timeout=5000)
                print("PASS: Calculator text found")
            except:
                print("FAIL: Calculator text not found (React render failed?)")
                print(page.content())
                exit(1)

            # Check for error message
            if page.locator("text=خطایی در بارگذاری").count() > 0:
                print("FAIL: Error boundary triggered")
                exit(1)

            # Check #root content length
            root_html = page.eval_on_selector("#root", "el => el.innerHTML")
            if len(root_html) < 100:
                print(f"FAIL: Root content too short ({len(root_html)} chars), likely empty or partial render")
                exit(1)

            print("PASS: Smoke test complete")

        except Exception as e:
            print(f"FAIL: Exception: {e}")
            exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    smoke_test()
