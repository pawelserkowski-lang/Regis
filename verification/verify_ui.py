from playwright.sync_api import sync_playwright

def verify_cyberdeck_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a large desktop screen
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Inject mock window.api for Electron since we are running in browser mode
        page.add_init_script("""
            window.api = {
                readAgentStatus: async () => JSON.stringify({
                    status: "ACTIVE",
                    progress: { phase: "AUDIT_PROTOCOL", eta: "10s" }
                }),
                readProtocol: async () => "# CYBERDECK v27.5.1 — ONLINE\\n\\nPROTOCOL LOADED.",
                saveProtocol: async () => {},
                runJules: async () => {}
            };
        """)

        try:
            # Wait for server to start
            page.goto("http://localhost:3000")

            # Wait for key elements to be visible
            page.wait_for_selector("text=CYBERDECK")
            page.wait_for_selector("text=SYSTEM_READY")

            # Take a screenshot of the main UI
            page.screenshot(path="verification/ui_screenshot.png", full_page=True)
            print("Screenshot saved to verification/ui_screenshot.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_cyberdeck_ui()
