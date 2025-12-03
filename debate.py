import os
import sys
import google.generativeai as genai
from pydantic import BaseModel
from typing import List, Optional
import time

# --- Konfiguracja ---
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ BŁĄD: Brak klucza GEMINI_API_KEY w zmiennych środowiskowych.")
    sys.exit(1)

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

DEBATE_FILE = os.path.join("cyber-deck-protocol", "DEBATE.md")

# --- Modele Pydantic ---

class Argument(BaseModel):
    speaker: str
    content: str
    timestamp: str

class DebateLog(BaseModel):
    topic: str
    status: str
    rounds: List[Argument] = []

# --- System Prompty ---

SYSTEM_PROMPT_MODERATOR = """
Jesteś Moderatorem AI w podziemnym klubie debackim Cyberdeck.
Twoim zadaniem jest wprowadzenie do tematu, wyznaczanie głosu i podsumowanie debaty.
Jesteś chłodny, logiczny i bezstronny.
"""

SYSTEM_PROMPT_PRO = """
Jesteś Agęt Teza (Proponent).
Jesteś optymistycznym wizjonerem technologii, ale z nutą cyberpunkowego cynizmu wobec korporacji.
Bronisz zadanego tematu. Twoje argumenty są ostre, błyskotliwe i merytoryczne.
Używasz polskiego slangu technicznego.
"""

SYSTEM_PROMPT_CON = """
Jesteś Agęt Antyteza (Oponent).
Jesteś sceptykiem, hackerem starej daty, który widział upadek systemów.
Atakujesz zadany temat. Szukasz dziur w logice, zagrożeń bezpieczeństwa i etycznych pułapek.
Jesteś sarkastyczny i nieustępliwy.
"""

# --- Logika Debaty ---

def generate_response(role_prompt: str, context: str, topic: str) -> str:
    full_prompt = f"{role_prompt}\n\nTEMAT: {topic}\n\nKONTEKST DYSKUSJI:\n{context}\n\nTwoja odpowiedź (krótka, max 3 zdania, konkretna):"
    try:
        response = model.generate_content(full_prompt)
        return response.text.strip()
    except Exception as e:
        return f"[BŁĄD GENERACJI: {e}]"

from datetime import datetime

def save_debate_to_md(debate: DebateLog):
    """Zapisuje debatę do pliku Markdown z ładnym formatowaniem."""
    md_content = f"""# ⚔️ AI DEBATE CLUB ⚔️

**Temat:** {debate.topic}
**Status:** {debate.status}
**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

"""
    for arg in debate.rounds:
        color = "green" if "Teza" in arg.speaker else "red" if "Antyteza" in arg.speaker else "blue"
        align = "right" if "Antyteza" in arg.speaker else "left"

        # Formatowanie a'la czat
        md_content += f"### {arg.speaker}\n"
        md_content += f"> {arg.content}\n\n"
        md_content += f"_{arg.timestamp}_\n\n---\n\n"

    # Ensure directory exists
    os.makedirs(os.path.dirname(DEBATE_FILE), exist_ok=True)

    with open(DEBATE_FILE, "w", encoding="utf-8") as f:
        f.write(md_content)

def run_debate(topic: str, rounds: int = 3):
    print(f"🎤 Rozpoczynam debatę: {topic}")

    debate = DebateLog(topic=topic, status="🔥 W TOKU")

    # 1. Moderator otwiera
    print("🤖 Moderator otwiera dyskusję...")
    intro = generate_response(SYSTEM_PROMPT_MODERATOR, "Otwórz debatę na podany temat.", topic)
    debate.rounds.append(Argument(speaker="🤖 Moderator", content=intro, timestamp=datetime.now().strftime("%H:%M:%S")))
    save_debate_to_md(debate)

    context = f"Moderator: {intro}\n"

    for i in range(1, rounds + 1):
        print(f"🥊 Runda {i}/{rounds}")

        # Proponent
        print("🟢 Teza atakuje...")
        arg_pro = generate_response(SYSTEM_PROMPT_PRO, context, topic)
        debate.rounds.append(Argument(speaker="🟢 Agęt Teza", content=arg_pro, timestamp=datetime.now().strftime("%H:%M:%S")))
        context += f"Teza: {arg_pro}\n"
        save_debate_to_md(debate)
        time.sleep(1)

        # Opponent
        print("🔴 Antyteza kontruje...")
        arg_con = generate_response(SYSTEM_PROMPT_CON, context, topic)
        debate.rounds.append(Argument(speaker="🔴 Agęt Antyteza", content=arg_con, timestamp=datetime.now().strftime("%H:%M:%S")))
        context += f"Antyteza: {arg_con}\n"
        save_debate_to_md(debate)
        time.sleep(1)

    # Podsumowanie
    print("🤖 Moderator podsumowuje...")
    outro = generate_response(SYSTEM_PROMPT_MODERATOR, f"Podsumuj debatę i ogłoś wynik (remis lub wskazanie zwycięzcy). Kontekst:\n{context}", topic)
    debate.rounds.append(Argument(speaker="🤖 Moderator", content=outro, timestamp=datetime.now().strftime("%H:%M:%S")))

    debate.status = "🏁 ZAKOŃCZONA"
    save_debate_to_md(debate)
    print("✅ Debata zakończona. Wynik zapisano w DEBATE.md")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        topic = " ".join(sys.argv[1:])
    else:
        topic = "Czy sztuczna inteligencja powinna mieć prawa obywatelskie?"

    run_debate(topic)
