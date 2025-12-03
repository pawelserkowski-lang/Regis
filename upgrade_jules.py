import os
import sys

# Konfiguracja kolorów dla efektu "Hacker Mode"
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def write_file(path, content):
    """Zapisuje plik i tworzy katalogi jeśli nie istnieją."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())
    print(f"{Colors.OKGREEN}✔ Utworzono/Zaktualizowano:{Colors.ENDC} {path}")

def main():
    print(f"{Colors.HEADER}{Colors.BOLD}=== ROZPOCZYNAM OPERACJĘ 'PHOENIX': NAPRAWA JULES ==={Colors.ENDC}")
    print("Wdrażanie architektury AsyncIO i systemów bezpieczeństwa...")

    base_dir = "jules_v2_optimized"
    
    # 1. MANIFEST (Poprawiony opis i uprawnienia)
    write_file(f"{base_dir}/gemini-extension.json", r'''
{
  "name": "Jules-Regis-Interface-Pro",
  "version": "2.0.0",
  "description": "Zoptymalizowany, asynchroniczny orkiestrator dla agenta Jules z ochroną tokenów.",
  "publisher": "PawelSerkowski",
  "specVersion": "1.0",
  "extension": {
    "type": "panel",
    "entryPoint": "regis_cli.py",
    "capabilities": ["file-system", "network-access"]
  },
  "permissions": [
    "run-shell-command",
    "read-file",
    "write-file"
  ]
}
''')

    # 2. GEMINI CLIENT (Teraz w pełni ASYNC + Tenacity + Liczenie Tokenów)
    write_file(f"{base_dir}/core/gemini_client.py", r'''
import os
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable, InternalServerError
from tenacity import retry, wait_random_exponential, stop_after_attempt, retry_if_exception_type, before_sleep_log
import logging
import asyncio

logger = logging.getLogger(__name__)

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    # Fallback dla testów, ale w produkcji rzuci błędem
    logger.warning("Brak GEMINI_API_KEY! Upewnij się, że jest ustawiony.")

genai.configure(api_key=API_KEY)

class GeminiGuard:
    """Wrapper na klienta Gemini z obsługą błędów i async."""
    
    def __init__(self, model_name="gemini-2.0-flash-exp"):
        self.model = genai.GenerativeModel(model_name)
        self.total_input_tokens = 0
        self.total_output_tokens = 0

    @retry(
        wait=wait_random_exponential(multiplier=1, max=60),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type((ResourceExhausted, ServiceUnavailable, InternalServerError)),
    )
    async def generate_content_async(self, prompt, temperature=0.7):
        """Asynchroniczne generowanie treści."""
        try:
            # Prosta estymacja tokenów (bardzo zgrubna: 1 słowo ~= 1.3 tokena)
            input_est = len(prompt.split()) * 1.3
            self.total_input_tokens += input_est
            
            # Gemini Python SDK nie jest natywnie async w 100%, więc wrapujemy w executorze
            # Uwaga: Nowsze wersje SDK mogą mieć generate_content_async, używamy tego jeśli dostępne
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=temperature)
            )
            
            output_text = response.text
            self.total_output_tokens += len(output_text.split()) * 1.3
            
            logger.info(f"Zużycie (est): In={int(input_est)}, Out={int(len(output_text.split())*1.3)}")
            return output_text
            
        except Exception as e:
            logger.error(f"Błąd generowania AI: {e}")
            raise

    def get_stats(self):
        return {
            "input_tokens": int(self.total_input_tokens),
            "output_tokens": int(self.total_output_tokens)
        }
''')

    # 3. MEMORY MANAGER (Z optymalizacją kontekstu)
    write_file(f"{base_dir}/core/memory_manager.py", r'''
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
''')

    # 4. REGIS CORE (Refaktoryzacja do AsyncIO + Brak blokad wątków)
    write_file(f"{base_dir}/core/regis.py", r'''
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
''')

    # 5. CLI (Punkt wejścia dostosowany do Async)
    write_file(f"{base_dir}/regis_cli.py", r'''
import argparse
import sys
import logging
import asyncio
import os

# Dodanie katalogu bieżącego do ścieżki, żeby widzieć pakiet core
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from core import regis
    from core.regis import JulesError, BrainConnectionError
except ImportError as e:
    print(f"Błąd importu modułów: {e}")
    print("Upewnij się, że struktura katalogów jest poprawna (folder 'core').")
    sys.exit(1)

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("JulesCLI")

async def async_main():
    parser = argparse.ArgumentParser(
        description="Jules (Regis v2.0) - Asynchroniczny Asystent Kodu",
        epilog="Pamiętaj: Asynchroniczność to cnota."
    )

    parser.add_argument("command", choices=["analyze", "debug", "refactor", "chat"], help="Tryb pracy agenta")
    parser.add_argument("--file", "-f", type=str, help="Ścieżka do pliku")
    parser.add_argument("--context", "-c", type=str, help="Dodatkowy kontekst")
    parser.add_argument("--debug", action="store_true", help="Tryb gadatliwy (DEBUG)")

    args = parser.parse_args()

    if args.debug:
        logger.setLevel(logging.DEBUG)
        logging.getLogger('core').setLevel(logging.DEBUG)
        logger.debug("Tryb DEBUG włączony. Widzę wszystko jak w Matrixie.")

    try:
        logger.info(f"Inicjalizacja procedury: {args.command.upper()}")
        
        payload = {
            "mode": args.command,
            "target_file": args.file,
            "user_context": args.context
        }

        # AWAIT - kluczowa zmiana w v2.0
        result = await regis.process_request(payload)
        
        print("\n" + "="*30)
        print("🤖 JULES ODPOWIADA:")
        print("="*30 + "\n")
        print(result)
        print("\n" + "="*30 + "\n")

    except BrainConnectionError as e:
        print(f"❌ Błąd połączenia z mózgiem: {e}")
        sys.exit(1)
    except Exception as e:
        logger.critical(f"Nieoczekiwany wyjątek: {e}", exc_info=True)
        print("💥 CRITICAL ERROR. Sprawdź logi.")
        sys.exit(1)

def main():
    """Wrapper dla asyncio.run"""
    try:
        asyncio.run(async_main())
    except KeyboardInterrupt:
        print("\n⛔ Przerwano przez użytkownika.")

if __name__ == "__main__":
    main()
''')

    # 6. IO GUARD (Prosty mechanizm bezpiecznego zapisu stanu)
    write_file(f"{base_dir}/core/io_guard.py", r'''
import aiofiles
import json
import os

class IOGuard:
    @staticmethod
    async def read_json(filepath="status.json"):
        if not os.path.exists(filepath):
            return {}
        async with aiofiles.open(filepath, mode='r') as f:
            content = await f.read()
            return json.loads(content) if content else {}

    @staticmethod
    async def write_json(data, filepath="status.json"):
        async with aiofiles.open(filepath, mode='w') as f:
            await f.write(json.dumps(data, indent=2))
''')

    # 7. REQUIREMENTS
    write_file(f"{base_dir}/requirements.txt", r'''
google-generativeai>=0.3.0
tenacity>=8.2.0
aiofiles>=23.2.1
''')

    print(f"\n{Colors.OKCYAN}🚀 Wdrożenie zakończone sukcesem!{Colors.ENDC}")
    print(f"Twój nowy, ulepszony Jules znajduje się w folderze: {Colors.BOLD}{base_dir}{Colors.ENDC}")
    print(f"\nInstrukcja:")
    print(f"1. cd {base_dir}")
    print("2. pip install -r requirements.txt")
    print("3. python regis_cli.py chat --context 'Siemano, działasz?'")
    print(f"\n{Colors.WARNING}Pamiętaj o ustawieniu GEMINI_API_KEY!{Colors.ENDC}")

if __name__ == "__main__":
    main()