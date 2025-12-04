import os
import sys
import json
import time
import logging
import google.generativeai as genai
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
STATUS_FILE = "status_report.json"
PROTOCOL_FILE = "GEMINI.md"

# Load API Key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_KEY")
if not GOOGLE_API_KEY:
    logger.error("Missing Google API Key")
    # We continue, assuming the agent might handle it or fail gracefully later
else:
    genai.configure(api_key=GOOGLE_API_KEY)

# Model Configuration
GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

def update_status(phase: str, percent: int, logs: List[str], thinking: List[str] = None):
    """Updates the status_report.json file for the frontend."""
    status_data = {
        "status": "🟡 W trakcie" if percent < 100 else "🟢 Finalna",
        "mode": "🤖 Generatywny (Jules Auditor)",
        "progress": {
            "phase": f"{phase} – {percent}%",
            "eta": "Obliczanie..." if percent < 100 else "Zakończono",
            "timeline": logs,
            "live_log": logs[-1] if logs else "Inicjalizacja..."
        },
        "thinking": thinking or []
    }

    try:
        with open(STATUS_FILE, 'w', encoding='utf-8') as f:
            json.dump(status_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Failed to update status file: {e}")

def run_gemini(prompt: str) -> str:
    """Runs a single prompt against the Gemini model."""
    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            generation_config=GENERATION_CONFIG,
            safety_settings=SAFETY_SETTINGS
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        return f"❌ Błąd API Gemini: {str(e)}"

def run_jules_audit(target_file: str = None, context: str = None):
    """Main execution flow for Jules Auditor."""
    timeline = []
    thoughts = []

    # --- PHASE 1: INITIALIZATION ---
    timeline.append("✅ [0:00] Inicjalizacja Jules Auditor v4.0")
    update_status("🔬 [1/3] Skeleton", 10, timeline)

    file_content = ""
    if target_file and os.path.exists(target_file):
        try:
            with open(target_file, 'r', encoding='utf-8') as f:
                file_content = f.read()
            timeline.append(f"✅ [0:05] Wczytano plik: {target_file}")
        except Exception as e:
            timeline.append(f"❌ [0:05] Błąd odczytu: {target_file}")

    update_status("🔬 [1/3] Skeleton", 20, timeline)

    # --- PHASE 2: SKELETON OF THOUGHT ---
    skeleton_prompt = f"""
    Jesteś Jules Extension Auditor v4.0.
    Twój cel: Przeprowadzić szybką analizę Skeleton-of-Thought dla podanego kodu/kontekstu.

    KONTEKST UŻYTKOWNIKA: {context or 'Brak dodatkowego kontekstu.'}
    PLIK DOCELOWY:
    ```
    {file_content[:10000]}
    ```
    (Przycięto do 10k znaków jeśli za długi)

    Zadanie: Wypisz w punktach plan głębokiej analizy (Architektura, Bezpieczeństwo, UX).
    Nie rozwiązuj jeszcze problemów. Tylko zarysuj obszary debaty dla Agentów (Architekt, Hacker, PM).
    """

    thoughts.append("Generowanie szkieletu myślowego...")
    update_status("🔬 [1/3] Skeleton", 30, timeline, thoughts)

    skeleton_response = run_gemini(skeleton_prompt)
    timeline.append("✅ [0:20] Szkielet wygenerowany")
    update_status("⚡ [2/3] Debata Agentów", 45, timeline, thoughts)

    # --- PHASE 3: MULTI-AGENT DEBATE ---
    debate_prompt = f"""
    Na podstawie poniższego szkieletu, przeprowadź symulowaną debatę między trzema agentami:
    1. Agent Architekt (The Idealist) - Czystość kodu, wzorce.
    2. Agent Hacker (The Cynic) - Bezpieczeństwo, edge-cases.
    3. Agent PM (The Pragmatist) - Koszty, czas, priorytety.

    SZKIELET:
    {skeleton_response}

    Przeprowadź debatę. Output sformatuj jako dialog lub tabelę w Markdown.
    Na końcu sekcji debaty, PM musi wydać werdykt dla każdego punktu.
    """

    thoughts.append("Uruchamianie symulacji debaty wewnętrznej...")
    update_status("⚡ [2/3] Debata Agentów", 60, timeline, thoughts)

    debate_response = run_gemini(debate_prompt)
    timeline.append("✅ [0:45] Debata zakończona")
    update_status("⏳ [3/3] Finalizacja", 80, timeline, thoughts)

    # --- PHASE 4: SOLUTIONS & REPORT ---
    solution_prompt = f"""
    Na podstawie werdyktów z debaty, wygeneruj finalny raport "Google Jules Audit".

    Wymagania:
    1. 6 Konkretnych Rozwiązań (Gotowy kod/komendy).
    2. Formatowanie Markdown.
    3. Język: Polski (Techniczny).
    4. Styl: Cyberpunk / Professional.

    DEBATA:
    {debate_response}
    """

    thoughts.append("Synteza rozwiązań i generowanie raportu...")
    update_status("⏳ [3/3] Finalizacja", 90, timeline, thoughts)

    final_response = run_gemini(solution_prompt)

    # Combine everything into one report
    full_report = f"""# JULES AUDIT REPORT v4.0
Data: {time.strftime("%Y-%m-%d %H:%M:%S")}

## 1. SKELETON
{skeleton_response}

## 2. AGENT DEBATE
{debate_response}

## 3. FINAL SOLUTIONS
{final_response}
"""

    # Save to PROTOCOL_FILE (GEMINI.md)
    try:
        with open(PROTOCOL_FILE, 'w', encoding='utf-8') as f:
            f.write(full_report)
        timeline.append(f"✅ [1:00] Raport zapisany w {PROTOCOL_FILE}")
    except Exception as e:
        timeline.append(f"❌ Błąd zapisu raportu: {e}")

    thoughts.append("Proces zakończony pomyślnie.")
    timeline.append("🏁 Zakończono.")
    update_status("Gotowe", 100, timeline, thoughts)

    return full_report

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", help="Target file to analyze")
    parser.add_argument("--context", help="User context")
    args = parser.parse_args()

    run_jules_audit(args.file, args.context)
