import json
import logging

logger = logging.getLogger(__name__)

class MemoryManager:
    def __init__(self, max_history=10):
        self.history = []
        self.max_history = max_history

    def add_message(self, role, content):
        self.history.append({"role": role, "content": content})
        self._prune()

    def _prune(self):
        """Utrzymuje historię w ryzach."""
        if len(self.history) > self.max_history:
            # Usuwamy najstarsze, ale zostawiamy system prompt jeśli by był
            logger.info("Przycinanie historii pamięci...")
            self.history = self.history[-self.max_history:]

    def get_context_string(self):
        return "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in self.history])

    async def optimize_context(self, history_list, max_tokens=4000, model_client=None):
        """Metoda do inteligentnego skracania (stub dla kompatybilności z debate.py)."""
        # W pełnej wersji tutaj byłoby podsumowanie przez AI
        current_len = sum(len(x['content']) for x in history_list)
        if current_len > max_tokens * 4: # Zgrubne przybliżenie znaków
            return history_list[-5:] # Zwróć ostatnie 5 wpisów
        return history_list