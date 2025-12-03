from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173")  # Assuming Vite runs on this port
    page.wait_for_selector("text=CYBERDECK")

    # Click DEBATE button
    page.click("text=DEBATE")
    page.wait_for_timeout(1000)

    page.screenshot(path="verification/debate_ui.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
