import json
import os
import aiofiles
import argparse
import asyncio
# Importujemy SimpleDebate wewnątrz funkcji main, aby uniknąć problemów przy imporcie cyklicznym,
# lub jeśli plik debaty jeszcze nie istnieje w momencie startu interpretera (rzadkie, ale możliwe w fix script).

STATUS_FILE = "status_report.json"

class IOGuard:
    """
    Zarządza bezpiecznym zapisem i odczytem stanu (Atomic Write).
    Chroni przed uszkodzeniem pliku JSON przy przerwaniu zasilania lub race condition.
    """
    
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