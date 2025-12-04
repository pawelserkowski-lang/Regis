from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Inject mock API to simulate Electron context since we are running in browser
        page.add_init_script("""
            window.api = {
                readProtocol: () => Promise.resolve("# MOCK PROTOCOL\\n\\nSystem Online."),
                saveProtocol: (content) => Promise.resolve(true),
                startJulesTask: () => Promise.resolve("Task started"),
                askAI: () => Promise.resolve("AI response"),
                readAgentStatus: () => Promise.resolve(JSON.stringify({
                    status: "🟢 Finalna",
                    mode: "🤖 Generatywny",
                    progress: { phase: "Test", eta: "0m", timeline: [], live_log: "Testing..." }
                })),
                runAgent: () => Promise.resolve("Agent started")
            };
        """)

        try:
            page.goto("http://localhost:3000")
            page.wait_for_load_state("networkidle")

            # Take a screenshot
            page.screenshot(path="verification/frontend_initial.png")
            print("Screenshot saved to verification/frontend_initial.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
