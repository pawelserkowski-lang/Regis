import logging

logger = logging.getLogger(__name__)

class MemoryManager:
    """Zarządza pamięcią podręczną agenta."""
    def __init__(self):
        self.history = []

    def add_message(self, role, content):
        self.history.append({"role": role, "content": content})
        # Prosta polityka retencji - trzymamy ostatnie 50 wiadomości
        if len(self.history) > 50:
            self.history.pop(0)

    def get_context_string(self):
        return "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in self.history])

async def optimize_context(history, max_tokens=4000, model_client=None):
    """
    Inteligentnie skracanie historii.
    Jeśli historia jest długa, podsumowuje starsze wpisy.
    """
    # Symulacja liczenia tokenów (1 słowo ~= 1.3 tokena)
    estimated_tokens = sum(len(str(m.get('content', ''))) for m in history) // 3
    
    if estimated_tokens < max_tokens:
        return history

    logger.info("🔪 Wykryto przekroczenie limitu tokenów. Optymalizacja kontekstu...")
    
    # Zachowaj ostatnie 3 wiadomości bez zmian
    recent_history = history[-3:]
    old_history = history[:-3]

    if not old_history:
        return recent_history

    summary_text = f"[System: Poprzednie {len(old_history)} rund debaty zostało zarchiwizowane ze względu na limit pamięci.]"
    
    optimized_history = [{"role": "system", "content": summary_text}] + recent_history
    return optimized_history