import threading
import logging
from typing import Dict, Any
from memory_manager import MemoryManager
from gemini_client import generate_content_safe

# Definicje błędów (Hierarchia)
class RegisError(Exception): pass
class BrainConnectionError(RegisError): pass
class ContextError(RegisError): pass

logger = logging.getLogger(__name__)
processing_lock = threading.Lock()
memory = MemoryManager()

def process_request(payload: Dict[str, Any]) -> str:
    if processing_lock.locked():
        logger.warning("System zajęty. Oczekiwanie na zwolnienie zasobów...")
    
    with processing_lock:
        return _safe_execute(payload)

def _safe_execute(payload: Dict[str, Any]) -> str:
    mode = payload.get("mode")
    target_file = payload.get("target_file")
    user_context = payload.get("user_context")

    logger.info(f"Processing mode: {mode}")

    # Budowanie promptu z obsługą błędów plikowych
    prompt_parts = [f"Mode: {mode}."]
    
    if target_file:
        try:
            with open(target_file, 'r', encoding='utf-8') as f:
                content = f.read()
            # Używamy eskejpowania backslashy dla newlines w f-stringu zapisanym do pliku
            prompt_parts.append(f"Input file ({target_file}):\n```\n{content}\n```")
        except FileNotFoundError:
            return f"❌ Błąd: Nie znaleziono pliku {target_file}"
        except Exception as e:
            return f"❌ Błąd odczytu pliku: {str(e)}"

    if user_context:
        prompt_parts.append(f"Context: {user_context}")

    final_prompt = "\n".join(prompt_parts)
    memory.add_message("user", final_prompt)

    try:
        response_text = generate_content_safe(final_prompt)
        memory.add_message("model", response_text)
        return response_text

    except Exception as e:
        logger.error(f"Critical Brain Failure: {e}")
        raise BrainConnectionError(f"Nie udało się połączyć z API Gemini: {e}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Regis Core System Loaded.")