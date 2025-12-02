
from playwright.sync_api import sync_playwright
import time

def verify_cyber_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # We need to wait for the Vite server to start.
        # Since I'm not parsing the log, I'll sleep a bit and try connecting.
        # Default Vite port is 5173.

        page = browser.new_page()

        # Try to connect, retrying if necessary
        for i in range(10):
            try:
                page.goto("http://localhost:5173")
                break
            except Exception as e:
                print(f"Waiting for server... ({i+1}/10)")
                time.sleep(2)

        # Wait for the main content to load
        page.wait_for_selector("text=CYBERDECK", timeout=10000)

        # Take a screenshot of the main state
        page.screenshot(path="verification/ui_main.png")
        print("Screenshot taken: verification/ui_main.png")

        # Click the "CODE" / "Edit" button to switch mode
        page.get_by_text("CODE").click()
        time.sleep(1) # Animation
        page.screenshot(path="verification/ui_editor.png")
        print("Screenshot taken: verification/ui_editor.png")

        browser.close()

if __name__ == "__main__":
    verify_cyber_ui()
