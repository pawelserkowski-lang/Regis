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