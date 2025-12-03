import argparse
import asyncio
import sys
import logging
import os
from dotenv import load_dotenv

# Nasze nowe zabawki
from debate import run_debate
from io_guard import IOGuard

# Ładowanie .env
load_dotenv()

# Konfiguracja logowania
logging.basicConfig(
    filename='regis_debug.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def server_loop():
    """
    Pętla główna serwera CLI. 
    Nasłuchuje zmian w pliku statusu (lub czeka na komendy - zależnie od logiki).
    Tutaj symulujemy pracę serwera, który co jakiś czas sprawdza stan.
    """
    logger.info("Regis Server Loop Started 🚀")
    print("Regis Server is running... Press Ctrl+C to stop.")
    
    while True:
        try:
            # 1. Bezpieczny odczyt statusu
            status = await IOGuard.read_json()
            
            # Przykładowa logika: Jeśli Electron ustawił flagę "start_debate", ruszamy
            if status.get("command") == "start_debate":
                logger.info("Otrzymano polecenie rozpoczęcia debaty!")
                
                # Czyścimy komendę, żeby nie odpalić dwa razy
                status["command"] = None
                status["status"] = "running"
                await IOGuard.write_json(status)
                
                topic = status.get("topic", "Przyszłość AI")
                
                # Uruchamiamy debatę asynchronicznie
                # Uwaga: w prawdziwej aplikacji warto użyć asyncio.create_task, 
                # żeby nie blokować pętli sprawdzania statusu
                await run_debate(topic)
                
            # Czekamy chwilę przed kolejnym sprawdzeniem (polling)
            # Dzięki asyncio.sleep nie blokujemy CPU
            await asyncio.sleep(1)
            
        except KeyboardInterrupt:
            logger.info("Zatrzymywanie serwera...")
            break
        except Exception as e:
            logger.error(f"Błąd w pętli serwera: {e}")
            await asyncio.sleep(5) # Odczekaj dłużej po błędzie

def main():
    parser = argparse.ArgumentParser(description="Regis CLI Tool")
    parser.add_argument('--server-mode', action='store_true', help='Uruchamia tryb serwera dla Electrona')
    parser.add_argument('--debate', type=str, help='Uruchamia pojedynczą debatę na zadany temat')
    
    args = parser.parse_args()

    if args.server_mode:
        try:
            asyncio.run(server_loop())
        except KeyboardInterrupt:
            print("\nSerwer zatrzymany.")
    elif args.debate:
        print(f"Uruchamianie debaty na temat: {args.debate}")
        asyncio.run(run_debate(args.debate))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()