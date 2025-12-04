import threading
import logging
import json  # [DODANO] Wymagane do serializacji konfiguracji agenta
from typing import Dict, Any
from memory_manager import MemoryManager
from gemini_client import generate_content_safe

# --- WSTRZYKNIĘCIE ARCY-PROMPTU V4.0 (Jules Auditor) ---
_ARCY_DATA = {
  "Meta": { 
      "Rola": "Regis System (Jules)", 
      "Tryb": "DEBATE & NO-INTERRUPTION" 
  },
  "Metaprompting": {
    "Zasada": "Używaj Skeleton-of-Thought. Najpierw plan, potem debata agentów (Architekt, Hacker, PM), na końcu 6 rozwiązań.",
    "Output": "Zawsze zwracaj odpowiedź w formacie Markdown."
  },
  "Agenci": [
      "Agent Architekt (Czystość kodu)", 
      "Agent Hacker (Bezpieczeństwo/Skróty)", 
      "Agent PM (Priorytety/Koszty)"
  ],
  "Nakaz": "Po wygenerowaniu planu NIE PYTAJ o zgodę. Wykonaj analizę."
}

SYSTEM_INSTRUCTION = f"""
JESTEŚ ZAAWANSOWANYM SYSTEMEM 'REGIS'. DZIAŁAJ WEDŁUG KONFIGURACJI:
{json.dumps(_ARCY_DATA, indent=2, ensure_ascii=False)}
"""
# -------------------------------------------------------

# Definicje błędów (Hierarchia)
class RegisError(Exception): pass
class JulesError(RegisError): pass  # Alias for compatibility if needed or separate error
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
    # [ZMODYFIKOWANO] Dodano SYSTEM_INSTRUCTION na początku listy
    prompt_parts = [SYSTEM_INSTRUCTION, f"Mode: {mode}."]
    
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