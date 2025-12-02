import json
import os
import sys
from datetime import datetime

class RegisAgent:
    """
    RegisAgent zarządza statusem i raportami w formacie JSON, zgodnym z dostarczonym szablonem.
    """

    def __init__(self, template_path="status_template.json", report_path="status_report.json"):
        self.template_path = template_path
        self.report_path = report_path
        self.data = self._load_template()

    def _load_template(self):
        """Ładuje szablon statusu z pliku JSON."""
        if os.path.exists(self.template_path):
            with open(self.template_path, "r", encoding="utf-8") as f:
                return json.load(f)
        # Jeśli szablon nie istnieje, zwróć pusty słownik lub rzuć błąd
        # Tutaj zwracam minimalną strukturę, ale w praktyce szablon powinien istnieć.
        return {}

    def update_progress(self, phase, steps, eta, log_entry):
        """Aktualizuje sekcję progress."""
        if "progress" not in self.data:
            self.data["progress"] = {}

        self.data["progress"]["phase"] = phase
        self.data["progress"]["steps"] = steps
        self.data["progress"]["eta"] = eta
        self.data["progress"]["log"] = log_entry

    def update_status(self, status, mode):
        """Aktualizuje główne statusy."""
        self.data["status"] = status
        self.data["mode"] = mode

    def update_jules(self, status, task, activity):
        """Aktualizuje sekcję Jules."""
        if "jules" not in self.data:
            self.data["jules"] = {}

        self.data["jules"]["status"] = status
        self.data["jules"]["task"] = task
        self.data["jules"]["last_activity"] = activity

    def save_report(self):
        """Zapisuje aktualny stan do pliku raportu."""
        with open(self.report_path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
        print(f"Raport zapisany do {self.report_path}")

    def generate_default_report(self):
        """Generuje przykładowy raport na start."""
        # Przykładowa aktualizacja na podstawie szablonu
        self.update_status("Draft/W trakcie", "AI wykrywa: Generatywny")

        # Aktualizacja progressu
        steps = [
            "✓ [0:15] Detekcja → Python 3.x",
            "✓ [0:30] Analiza → 1 krytyczny, 2 wysokie",
            "⚙ [0:45] Research → 3/6 wyszukiwań",
            "⏳ [1:30] Agenci → Regis, Jules"
        ]
        self.update_progress(
            phase="AI: [3/8] Research - 65% ███████░░░",
            steps=steps,
            eta="~3m 15s",
            log_entry="AI: Ostatnie: [2:42] ✅ CVSS 9.8 potwierdzony | Teraz: 🔍 Jules analyzing protocol..."
        )

        # Symulacja Julesa
        self.update_jules(
            status="active",
            task="Analiza bezpieczeństwa protokołu",
            activity="Skanowanie zależności pod kątem podatności"
        )

        self.save_report()

if __name__ == "__main__":
    agent = RegisAgent()
    agent.generate_default_report()
