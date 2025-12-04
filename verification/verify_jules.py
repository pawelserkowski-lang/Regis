from playwright.sync_api import sync_playwright

def verify_jules_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate browser environment where Electron API might be missing,
        # but we want to see the UI.
        # Note: Since we need to verify the button and maybe the CSS state,
        # we can inject a mock window.api object.
        
        page = browser.new_page()
        
        # Inject mock API
        page.add_init_script("""
            window.api = {
                readProtocol: () => Promise.resolve("# MOCK PROTOCOL"),
                saveProtocol: (c) => Promise.resolve(true),
                readAgentStatus: () => Promise.resolve(JSON.stringify({
                    status: "🟢 Finalna",
                    mode: "🤖 Generatywny (Jules Auditor)",
                    progress: {
                        phase: "Gotowe – 100%",
                        timeline: ["✅ [0:00] Inicjalizacja"],
                        live_log: "Gotowe"
                    }
                })),
                runJules: (payload) => {
                    console.log("Jules Triggered", payload);
                    return Promise.resolve({success: true});
                }
            };
        """)

        # Start dev server if not running, but here we assume we can just build or serve.
        # Actually, running the dev server in background is better.
        # Let's try to access the dev server. I need to start it first.
        # For now, I will assume port 5173 is standard Vite.

        try:
            page.goto("http://localhost:5173")
            page.wait_for_selector("text=CYBERDECK")

            # Check for the new button
            button = page.get_by_text("[ RUN JULES AUDIT ]")
            if button.is_visible():
                print("Button found!")
                # Click it to see if it triggers console log (we can't easily check console in sync,
                # but visual state might change if we added effects, though we didn't add visual feedback on click other than console log in this iteration)
                button.click()

            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_jules_ui()
