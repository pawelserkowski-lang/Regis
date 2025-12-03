import os
import sys

def write_file(filename, content):
    """Pomocnicza funkcja do zapisu plików z informacją zwrotną."""
    try:
        # Zapewniamy, że katalogi istnieją
        os.makedirs(os.path.dirname(filename) or ".", exist_ok=True)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content.strip())
        print(f"✅ Naprawiono/Utworzono: {filename}")
    except Exception as e:
        print(f"❌ Błąd zapisu {filename}: {e}")

# ==========================================
# 1. gemini-extension.json (Uzupełniony o konfigurację)
# ==========================================
gemini_extension_content = """
{
  "name": "Jules-Regis-Interface",
  "version": "1.3.0",
  "description": "Lokalny orkiestrator i Cyberdeck dla agenta Jules. Zoptymalizowany pod kątem kosztów i bezpieczeństwa.",
  "publisher": "PawelSerkowski",
  "specVersion": "1.0",
  "extension": {
    "type": "panel",
    "entryPoint": "dist-electron/main.js",
    "capabilities": ["file-system", "network-access"]
  },
  "configuration": {
    "properties": {
      "GEMINI_API_KEY": {
        "type": "string",
        "description": "Klucz API Google Gemini wymagany do działania mózgu Julesa.",
        "required": true
      }
    }
  },
  "permissions": [
    "run-shell-command",
    "read-file",
    "write-file"
  ]
}
"""

# ==========================================
# 2. gemini_client.py (Dodano klasę GeminiGuard)
# ==========================================
# Używamy eskejpowania \"\"\" dla docstringów wewnątrz zmiennej
gemini_client_content = """
import os
import logging
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable, InternalServerError
from tenacity import (
    retry,
    wait_random_exponential,
    stop_after_attempt,
    retry_if_exception_type,
    before_sleep_log
)

logger = logging.getLogger(__name__)

class GeminiGuard:
    \"\"\"
    Wrapper na klienta Gemini zapewniający obsługę błędów, retry policy
    oraz (w przyszłości) zliczanie tokenów.
    \"\"\"
    def __init__(self, api_key=None, model_name="gemini-2.0-flash-exp"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            # Fallback dla testów lokalnych - OSTRZEŻENIE
            logger.warning("Brak GEMINI_API_KEY. Próba uruchomienia w trybie mock (jeśli brak klucza).")
            # W produkcji tutaj powinien być raise ValueError
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(model_name)
        else:
            self.model = None

    @retry(
        wait=wait_random_exponential(multiplier=1, max=60),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type((ResourceExhausted, ServiceUnavailable, InternalServerError)),
        before_sleep=before_sleep_log(logger, logging.WARNING)
    )
    def generate_content(self, prompt, temperature=0.7):
        if not self.model:
             return "[[MOCK RESPONSE: Brak klucza API. Ustaw GEMINI_API_KEY.]]"
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Błąd generowania treści: {e}")
            raise

    async def generate_content_async(self, prompt, temperature=0.7):
        \"\"\"Wersja asynchroniczna dla modułu debaty.\"\"\"
        import asyncio
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self.generate_content, prompt, temperature)

# Funkcja dla wstecznej kompatybilności z regis.py
def generate_content_safe(prompt, model_name="gemini-2.0-flash-exp"):
    guard = GeminiGuard(model_name=model_name)
    return guard.generate_content(prompt)
"""

# ==========================================
# 3. memory_manager.py (NOWY PLIK - Optymalizacja Tokenów)
# ==========================================
memory_manager_content = """
import logging

logger = logging.getLogger(__name__)

class MemoryManager:
    \"\"\"Zarządza pamięcią podręczną agenta.\"\"\"
    def __init__(self):
        self.history = []

    def add_message(self, role, content):
        self.history.append({"role": role, "content": content})
        # Prosta polityka retencji - trzymamy ostatnie 50 wiadomości
        if len(self.history) > 50:
            self.history.pop(0)

    def get_context_string(self):
        return "\\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in self.history])

async def optimize_context(history, max_tokens=4000, model_client=None):
    \"\"\"
    Inteligentnie skracanie historii.
    Jeśli historia jest długa, podsumowuje starsze wpisy.
    \"\"\"
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
"""

# ==========================================
# 4. io_guard.py (Dodano klasę IOGuard i Atomic Write)
# ==========================================
io_guard_content = """
import json
import os
import aiofiles
import argparse
import asyncio
# Importujemy SimpleDebate wewnątrz funkcji main, aby uniknąć problemów przy imporcie cyklicznym,
# lub jeśli plik debaty jeszcze nie istnieje w momencie startu interpretera (rzadkie, ale możliwe w fix script).

STATUS_FILE = "status_report.json"

class IOGuard:
    \"\"\"
    Zarządza bezpiecznym zapisem i odczytem stanu (Atomic Write).
    Chroni przed uszkodzeniem pliku JSON przy przerwaniu zasilania lub race condition.
    \"\"\"
    
    @staticmethod
    async def read_json(filepath=STATUS_FILE):
        if not os.path.exists(filepath):
            return {}
        try:
            async with aiofiles.open(filepath, 'r', encoding='utf-8') as f:
                content = await f.read()
                return json.loads(content)
        except Exception:
            return {}

    @staticmethod
    async def write_json(data, filepath=STATUS_FILE):
        # Atomic write: zapisz do .tmp, potem zmień nazwę
        temp_file = f"{filepath}.tmp"
        try:
            async with aiofiles.open(temp_file, 'w', encoding='utf-8') as f:
                await f.write(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Atomowa operacja zmiany nazwy (wymaga os.remove na Windows jeśli plik istnieje)
            if os.path.exists(filepath):
                try:
                    os.replace(temp_file, filepath)
                except OSError:
                    os.remove(filepath)
                    os.rename(temp_file, filepath)
            else:
                os.rename(temp_file, filepath)
        except Exception as e:
            print(f"❌ Błąd zapisu IOGuard: {e}")
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except:
                    pass

def main():
    parser = argparse.ArgumentParser(description="Regis CLI - System Zarządzania i Debaty AI")
    subparsers = parser.add_subparsers(dest="command", help="Dostępne komendy")

    # Komenda: debate
    debate_parser = subparsers.add_parser("debate", help="Uruchom debatę między agentami")
    debate_parser.add_argument("topic", nargs="+", help="Temat debaty")

    # Komenda: status
    status_parser = subparsers.add_parser("status", help="Sprawdź status systemu")

    args = parser.parse_args()

    if args.command == "debate":
        # Import tutaj (lazy import)
        try:
            from debate import SimpleDebate
            topic = " ".join(args.topic)
            print(f"🎙️ Rozpoczynam debatę na temat: {topic}")
            engine = SimpleDebate()
            asyncio.run(engine.run(topic))
        except ImportError:
            print("❌ Błąd: Nie znaleziono modułu 'debate'. Uruchom fix_jules.py ponownie.")
        except Exception as e:
            print(f"❌ Wystąpił błąd krytyczny: {e}")

    elif args.command == "status":
        print("✅ System Regis: ONLINE")
        if os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, 'r', encoding='utf-8') as f:
                print(f"📄 Ostatni status: {f.read()}")
        else:
            print("   Brak pliku statusu.")

    else:
        parser.print_help()

if __name__ == "__main__":
    main()
"""

# ==========================================
# 5. debate.py (Dodano klasę SimpleDebate i naprawiono importy)
# ==========================================
debate_content = """
import asyncio
import logging
import os
from gemini_client import GeminiGuard
from memory_manager import optimize_context

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SimpleDebate:
    \"\"\"
    Klasa orkiestratora debaty.
    \"\"\"
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
        prompt_a = f\"\"\"
        Jesteś Agentem A. Bronisz tezy: {stance_a}.
        Temat: {topic}.
        Historia dyskusji: {history}
        
        Twoja odpowiedź musi być zwięzła (max 3 zdania). Użyj mocnych argumentów.
        \"\"\"
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
        prompt_b = f\"\"\"
        Jesteś Agentem B. Bronisz tezy: {stance_b}.
        Odnieś się krytycznie do argumentu Agenta A: "{response_a}"
        
        Bądź cyniczny i zabawny. Max 3 zdania.
        \"\"\"
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
"""

# ==========================================
# 6. regis.py (Aktualizacja importów i obsługi błędów)
# ==========================================
regis_content = """
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
            prompt_parts.append(f"Input file ({target_file}):\\n```\\n{content}\\n```")
        except FileNotFoundError:
            return f"❌ Błąd: Nie znaleziono pliku {target_file}"
        except Exception as e:
            return f"❌ Błąd odczytu pliku: {str(e)}"

    if user_context:
        prompt_parts.append(f"Context: {user_context}")

    final_prompt = "\\n".join(prompt_parts)
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
"""

# Wykonanie nadpisywania plików
print("🚀 Rozpoczynam (ponownie) procedurę naprawczą projektu Jules-Regis...")
write_file("gemini-extension.json", gemini_extension_content)
write_file("gemini_client.py", gemini_client_content)
write_file("memory_manager.py", memory_manager_content)
write_file("io_guard.py", io_guard_content)
write_file("debate.py", debate_content)
write_file("regis.py", regis_content)

print("\\n✅ PROCES ZAKOŃCZONY.")
print("👉 Uruchom 'python regis_cli.py chat' aby przetestować podstawy.")
print("👉 Uruchom 'python io_guard.py debate \"Czy programiści AI śnią o elektrycznych owcach?\"'")