import asyncio
import logging
import os
from gemini_client import GeminiGuard
from memory_manager import optimize_context

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SimpleDebate:
    """
    Klasa orkiestratora debaty.
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        # Jeśli brak klucza, GeminiGuard obsłuży to ostrzeżeniem, ale debata może nie mieć sensu.
        self.client = GeminiGuard(self.api_key)

    async def debate_round(self, topic, stance_a, stance_b, round_num, history):
        # Import wewnątrz metody, aby uniknąć cyklicznego importu z io_guard
        from io_guard import IOGuard
        
        logger.info(f"--- Runda {round_num}: {topic} ---")

        # 1. Optymalizacja pamięci
        history = await optimize_context(history, max_tokens=2000, model_client=self.client)

        # 2. Agent A (Pro)
        # Używamy f-stringa z potrójnym cudzysłowem (escaped)
        prompt_a = f"""
        Jesteś Agentem A. Bronisz tezy: {stance_a}.
        Temat: {topic}.
        Historia dyskusji: {history}
        
        Twoja odpowiedź musi być zwięzła (max 3 zdania). Użyj mocnych argumentów.
        """
        response_a = await self.client.generate_content_async(prompt_a)
        history.append({"role": "Agent A", "content": response_a})
        print(f"🔵 Agent A: {response_a}")

        # Zapis statusu
        status_data = await IOGuard.read_json()
        status_data.update({
            'last_message': response_a,
            'current_round': round_num,
            'speaker': 'Agent A'
        })
        await IOGuard.write_json(status_data)

        # 3. Agent B (Contra)
        prompt_b = f"""
        Jesteś Agentem B. Bronisz tezy: {stance_b}.
        Odnieś się krytycznie do argumentu Agenta A: "{response_a}"
        
        Bądź cyniczny i zabawny. Max 3 zdania.
        """
        response_b = await self.client.generate_content_async(prompt_b)
        history.append({"role": "Agent B", "content": response_b})
        print(f"🔴 Agent B: {response_b}")

        # Zapis statusu
        status_data['last_message'] = response_b
        status_data['speaker'] = 'Agent B'
        await IOGuard.write_json(status_data)

        return history

    async def run(self, topic, rounds=3):
        from io_guard import IOGuard
        
        history = []
        await IOGuard.write_json({"status": "active", "topic": topic, "rounds": rounds})
        
        for i in range(rounds):
            history = await self.debate_round(topic, "Jestem ZA", "Jestem PRZECIW", i+1, history)
            await asyncio.sleep(1) # Oddech dla API
            
        await IOGuard.write_json({"status": "finished", "final_history": history})
        logger.info("Debata zakończona sukcesem.")
        return history