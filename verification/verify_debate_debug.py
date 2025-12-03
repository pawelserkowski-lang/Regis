from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173")

    # Take a screenshot to see what is happening
    page.screenshot(path="verification/debug_page.png")

    # Try waiting for something simpler
    try:
        page.wait_for_selector("text=CYBERDECK", timeout=5000)
        # Click DEBATE button
        page.click("text=DEBATE")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/debate_ui.png")
    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
