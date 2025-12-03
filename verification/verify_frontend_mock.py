from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Inject the mock API before the page loads
    page.add_init_script("""
        window.api = {
            readProtocol: async (filename) => {
                if (filename === 'DEBATE.md') {
                    return '# ⚔️ AI DEBATE CLUB ⚔️\\n\\n**Temat:** Test Topic\\n\\n### 🟢 Agęt Teza\\n> To jest testowy argument.';
                }
                return '# Default Protocol\\n\\nThis is the default protocol content.';
            },
            saveProtocol: async (content) => {
                console.log('Saved:', content);
            }
        };
    """)

    # Navigate to the served app
    page.goto("http://localhost:5173")

    # Wait for the app to load (look for the title)
    try:
        page.wait_for_selector("text=CYBERDECK", timeout=5000)
    except:
        print("Timeout waiting for CYBERDECK title. Taking debug screenshot.")
        page.screenshot(path="verification/debug_timeout.png")
        browser.close()
        return

    # Take initial screenshot (GEMINI.md view)
    page.screenshot(path="verification/step1_protocol.png")
    print("Screenshot 1: step1_protocol.png")

    # Click the DEBATE button
    # Based on the code: <button ...>DEBATE</button>
    page.click("text=DEBATE")

    # Wait a bit for the state update
    time.sleep(1)

    # Take second screenshot (DEBATE.md view)
    page.screenshot(path="verification/step2_debate.png")
    print("Screenshot 2: step2_debate.png")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
