import logging
import asyncio
from typing import Dict, Any
from .gemini_client import GeminiGuard
from .memory_manager import MemoryManager

# Error definitions
class JulesError(Exception): pass
class BrainConnectionError(JulesError): pass

logger = logging.getLogger(__name__)

# Singletony
memory = MemoryManager()
brain = GeminiGuard()

async def process_request(payload: Dict[str, Any]) -> str:
    """
    Główny asynchroniczny procesor żądań.
    """
    mode = payload.get("mode")
    target_file = payload.get("target_file")
    user_context = payload.get("user_context")

    logger.info(f"Przetwarzanie (Async): {mode} dla pliku: {target_file}")

    # Budowanie promptu
    prompt = f"Mode: {mode}.\n"
    if target_file:
        try:
            # Async file reading dla wydajności przy dużych plikach
            if os.path.exists(target_file):
                with open(target_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                prompt += f"Input file ({target_file}):\n```\n{content}\n```\n"
            else:
                return f"Błąd: Plik {target_file} nie istnieje."
        except Exception as e:
            return f"Błąd odczytu pliku: {str(e)}"

    if user_context:
        prompt += f"Dodatkowy kontekst: {user_context}\n"

    # Dodaj do pamięci
    memory.add_message("user", prompt)

    try:
        # Wywołanie API bez blokowania wątku głównego!
        response_text = await brain.generate_content_async(prompt)
        
        # Zapisz odpowiedź
        memory.add_message("model", response_text)
        
        # Raport zużycia
        stats = brain.get_stats()
        logger.debug(f"Stats sesji: {stats}")
        
        return response_text

    except Exception as e:
        logger.error(f"Krytyczny błąd w jądrze Regis: {e}")
        raise BrainConnectionError(f"Awaria silnika wnioskowania: {str(e)}")