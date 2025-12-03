import os
import sys
import datetime
from openai import OpenAI

# Klasa zarządzająca debatą
class SimpleDebate:
    def __init__(self, config_file="config/agents.md"):
        # Pobieranie klucza ze zmiennych środowiskowych Windows
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            print("❌ BŁĄD KRYTYCZNY: Nie znaleziono zmiennej 'OPENAI_API_KEY'.")
            print("💡 Wpisz w terminalu (Windows): setx OPENAI_API_KEY \"sk-...\" i zrestartuj terminal.")
            sys.exit(1)

        self.client = OpenAI(api_key=api_key)
        self.config_file = config_file
        
        # Wczytanie surowego manifestu
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                self.raw_manifest = f.read()
        except FileNotFoundError:
            print(f"❌ Nie znaleziono pliku konfiguracyjnego: {config_file}")
            sys.exit(1)

    def _prepare_manifest(self):
        """Wstrzykuje dynamiczne dane do prompta systemowego"""
        today = datetime.date.today().strftime("%Y-%m-%d")
        
        # Pobieranie struktury plików (ignoring .git, __pycache__)
        file_list = []
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in [".git", "__pycache__", "node_modules", "venv"]]
            for file in files:
                file_list.append(os.path.join(root, file))
        
        # Limit listy plików (żeby nie zapchać kontekstu)
        file_structure = "\n".join(file_list[:50]) 
        if len(file_list) > 50:
            file_structure += "\n... (i wiele innych plików)"

        # Podmiana zmiennych
        filled_manifest = self.raw_manifest.replace("{current_date}", today)
        filled_manifest = filled_manifest.replace("{file_structure}", file_structure)
        filled_manifest = filled_manifest.replace("{project_name}", os.path.basename(os.getcwd()))
        
        return filled_manifest

    def _call_agent(self, agent_name, prompt, history="", temperature=0.7):
        """Wywołuje konkretną personę"""
        manifest = self._prepare_manifest()
        
        system_prompt = f"""
        {manifest}
        
        ==================================================
        AKTUALNE ZADANIE: JESTEŚ TERAZ AGENTEM: {agent_name}
        ==================================================
        Zachowuj się dokładnie tak, jak opisano w Twojej sekcji.
        Ignoruj instrukcje dla innych agentów.
        Twoim celem jest wygranie tej debaty zgodnie z Twoją rolą.
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"HISTORIA DEBATY:\n{history}\n\nOSTATNI KOMUNIKAT: {prompt}"}
        ]

        print(f"🤖 {agent_name} przetwarza dane...")
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",  # Lub gpt-3.5-turbo
                messages=messages,
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[BŁĄD API]: {str(e)}"

    def run(self, topic):
        print(f"\n🔥 ROZPOCZYNAM DEBATĘ REGIS")
        print(f"TEMAT: {topic}\n" + "="*40)
        
        conversation_log = f"TEMAT GŁÓWNY: {topic}\n"

        # RUNDA 1: ATAK (Innowator) - Wysoka temperatura dla kreatywności
        resp_a = self._call_agent("CYBER_ARCHITECT", 
                                  f"Rozpocznij debatę. Twoim zadaniem jest przedstawić radykalną, nowoczesną wizję dotyczącą: '{topic}'.", 
                                  temperature=0.9)
        print(f"\n🔵 CYBER_ARCHITECT:\n{resp_a}")
        conversation_log += f"\n[CYBER_ARCHITECT]:\n{resp_a}\n"

        # RUNDA 2: KONTRA (Strażnik) - Niska temperatura dla chłodu
        resp_b = self._call_agent("LEGACY_KEEPER", 
                                  f"Oponent właśnie przedstawił swoją wizję. Zmasakruj ją argumentami o bezpieczeństwie i kosztach.", 
                                  history=conversation_log, 
                                  temperature=0.3)
        print(f"\n🟤 LEGACY_KEEPER:\n{resp_b}")
        conversation_log += f"\n[LEGACY_KEEPER]:\n{resp_b}\n"

        # RUNDA 3: WERDYKT (Sędzia) - Zero temperatury dla logiki
        resp_c = self._call_agent("SYNTHESIS_CORE", 
                                  "Przeanalizuj powyższą wymianę zdań. Wygeneruj werdykt w formacie JSON.", 
                                  history=conversation_log, 
                                  temperature=0.0)
        
        print(f"\n⚖️ SYNTHESIS_CORE (WERDYKT):\n{resp_c}")
        print("\n" + "="*40 + "\n✅ Debata zakończona.")

# Obsługa bezpośredniego uruchomienia
if __name__ == "__main__":
    if len(sys.argv) > 1:
        topic = " ".join(sys.argv[1:])
    else:
        topic = "Czy powinniśmy usunąć testy jednostkowe na rzecz testowania na produkcji?"
    
    engine = SimpleDebate()
    engine.run(topic)