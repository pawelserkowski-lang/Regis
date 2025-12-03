# ... existing code ...
import asyncio
import os
import logging
# Zmieniamy importy na nasze nowe bezpieczne moduły
from gemini_client import GeminiGuard
from memory_manager import optimize_context
from io_guard import IOGuard

# Konfiguracja loggera
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Pobieramy klucz API
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("Brak klucza GEMINI_API_KEY w zmiennych środowiskowych!")

# Inicjalizacja klienta (Singleton-ish)
client = GeminiGuard(API_KEY)

async def debate_round(topic, stance_a, stance_b, round_num, history):
    """
    Przeprowadza jedną rundę debaty.
    """
    logger.info(f"--- Runda {round_num}: {topic} ---")

    # --- Optymalizacja Pamięci (Nowość!) ---
    # Zanim zapytamy model, sprawdzamy czy historia nie jest za gruba
    history = await optimize_context(history, max_tokens=4000, model_client=client)

    # Przygotowanie promptu dla Agenta A
    prompt_a = f"""
    Jesteś Agentem A. Twój cel: {stance_a}.
    Temat: {topic}.
    Historia dyskusji: {history}
    
    Odpowiedz krótko i merytorycznie.
    """
    
    # --- Bezpieczne wywołanie API (Nowość!) ---
    response_a = await client.generate_content(prompt_a)
    
    # Dodajemy odpowiedź do historii
    history.append({"role": "Agent A", "content": response_a})
    
    # Zapisujemy status bezpiecznie (Nowość!)
    status_data = await IOGuard.read_json()
    status_data['last_message'] = response_a
    status_data['current_round'] = round_num
    status_data['history_length'] = len(history)
    await IOGuard.write_json(status_data)

    # --- Tura Agenta B ---
    prompt_b = f"""
    Jesteś Agentem B. Twój cel: {stance_b}.
    Odnieś się do argumentu Agenta A: "{response_a}"
    """
    
    response_b = await client.generate_content(prompt_b)
    history.append({"role": "Agent B", "content": response_b})
    
    # Ponowny bezpieczny zapis
    status_data = await IOGuard.read_json()
    status_data['last_message'] = response_b
    await IOGuard.write_json(status_data)

    return history

async def run_debate(topic, rounds=3):
    history = []
    # Inicjalizacja pliku statusu na start
    await IOGuard.write_json({"status": "active", "topic": topic, "rounds": rounds})
    
    for i in range(rounds):
        history = await debate_round(topic, "Pro", "Contra", i+1, history)
        # Symulacja czasu na przemyślenie (żeby nie zaspamować API w sekundę)
        await asyncio.sleep(2)
        
    await IOGuard.write_json({"status": "finished", "final_history": history})
    return history
# ... existing code ...