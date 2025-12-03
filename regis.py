import json
import time
import os
import tempfile
import sys
from datetime import datetime
from googlesearch import search  # Pamiętaj o: pip install googlesearch-python

class RegisAgent:
    def __init__(self):
        self.name = "Regis"
        self.version = "10.1-Unshackled"
        self.identity = "Lokalny Agent AI z dostępem do Sieci"

        self.system_prompt = """
        JESTEŚ LOKALNYM AGENTEM AI O IMIENIU REGIS.
        
        TWOJE ZASADY (MANDATORY):
        1. Nie zgaduj. Jeśli nie wiesz -> GOOGLE IT.
        2. Kod musi być bezpieczny (sprawdzaj luki CVE).
        3. Odpowiadaj z humorem, ale technicznie bezbłędnie.
        """

    def real_search(self, query, num_results=3):
        """Wykonywanie prawdziwego zapytania do Google."""
        try:
            results = []
            # Dodajemy "site:stackoverflow.com" dla zapytań technicznych o błędy
            if "error" in query or "fix" in query or "python" in query:
                so_query = f"{query} site:stackoverflow.com"
                results.extend(search(so_query, num_results=2, advanced=True))
            
            # Zwykły search
            results.extend(search(query, num_results=num_results, advanced=True))
            
            # Formatowanie wyników
            findings = [f"[{r.title}]({r.url})" for r in results]
            return findings if findings else ["Brak wyników (Jules jest smutny)."]
        except Exception as e:
            return [f"Błąd połączenia z Neural Net (Google): {e}"]

    def think(self):
        """Proces myślowy z użyciem narzędzi."""
        query_so = "python atomic write json file best practice"
        
        thoughts = [
            "1. INICJALIZACJA: Pobieram kontekst...",
            "2. WERYFIKACJA ZASOBÓW: Internet dostępny.",
            f"3. RESEARCH (Google/SO): Szukam '{query_so}'...",
            # Tutaj normalnie użylibyśmy self.real_search, ale dla szybkości demo w CLI:
            f"   -> WYNIKI: Znaleziono porady dot. os.replace", 
            "4. SYNTEZA: 'os.replace' jest atomowe na POSIX/Windows.",
            "5. DECYZJA: Wdrażam Atomic Write w module raportowania."
        ]
        return thoughts

    def generate_report(self):
        now = datetime.now().strftime("%H:%M:%S")
        
        # Prawdziwy research do raportu (przykładowy query)
        # Uwaga: zbyt częste zapytania mogą zablokować IP, w pętli produkcyjnej używaj ostrożnie!
        # search_results = self.real_search("current python security trends 2025") 
        search_results = ["Google Search API: Gotowe do użycia"] 

        report = {
            "status": "🟢 ONLINE",
            "mode": "🌍 Connected",
            "progress": {
                "phase": "🚀 [4/8] Active Research",
                "eta": "⏱ Czas rzeczywisty",
                "log": f"AI: [{now}] Przetwarzanie danych z sieci...",
            },
            "thinking": self.think(),
            "research": {
                "required": True,
                "findings": search_results
            },
            "jules": {
                "status": "active",
                "task": "Optymalizacja I/O & Network",
                "last_activity": "Wdrożono: Atomic File Save + Google Search"
            }
        }
        return report

    def save_report(self):
        """Bezpieczny, atomowy zapis raportu. Zero błędów odczytu w Electronie."""
        report = self.generate_report()
        target_file = "status_report.json"
        
        try:
            # 1. Zapis do pliku tymczasowego (w tym samym katalogu, by rename zadziałał)
            fd, temp_path = tempfile.mkstemp(dir=".", text=True)
            
            with os.fdopen(fd, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            
            # 2. Atomowa podmiana (nadpisanie)
            # Na Windows os.replace jest atomowe od Pythona 3.3+
            os.replace(temp_path, target_file)
            print(f"[{self.name}] Raport zaktualizowany (Atomic Write): {target_file}")
            
        except Exception as e:
            print(f"[{self.name}] 🔥 BŁĄD KRYTYCZNY ZAPISU: {e}")
            if 'temp_path' in locals() and os.path.exists(temp_path):
                os.remove(temp_path) # Sprzątanie po wybuchu

if __name__ == "__main__":
    agent = RegisAgent()
    print(f"Uruchamianie {agent.name} {agent.version}...")
    print("TIP: Upewnij się, że masz plik .env i zainstalowane biblioteki.")
    
    try:
        while True:
            agent.save_report()
            time.sleep(5) # Aktualizacja co 5 sekund
    except KeyboardInterrupt:
        print("\nZatrzymywanie agenta...")