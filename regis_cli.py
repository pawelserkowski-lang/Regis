# regis_cli.py – wersja z Krzyżową Interakcją Modeli
import sys
import os
import time
import json
import logging
from datetime import datetime
from regis_core import RegisCore

# UTF-8 fix dla Windows
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

log_file = "regis_debug.log"
logging.basicConfig(
    filename=log_file,
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)s | %(message)s',
    encoding='utf-8'
)

def type_effect(text, delay=0.03):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

def main():
    try:
        logging.info("=== REGIS CLI START – CROSS-MODEL VERSION ===")
        print("\033[1;32mRegis v13.0-cli – Krzyżowa Interakcja Modeli\033[0m")
        print("Logowanie do: regis_debug.log\n")

        core = RegisCore()

        print("🔍 Inicjalizacja rdzenia...")
        time.sleep(1)

        print("\n⚡ Rozpoczynanie Krzyżowej Interakcji Modeli...\n")
        time.sleep(0.5)

        # Generate report (simulates the interaction inside)
        report = core.generate_report()

        # Display the interaction log (The "Thinking" part)
        for line in report.thinking:
            # Color coding for different personas
            if "[ANALIZATOR]" in line:
                color = "\033[93m" # Yellow
            elif "[KRYTYK]" in line:
                color = "\033[91m" # Red
            elif "[ARCHITEKT]" in line:
                color = "\033[96m" # Cyan
            else:
                color = "\033[0m"

            print(f"{color}{line}\033[0m")
            time.sleep(1.5) # Time to read

        print("\n✅ Interakcja zakończona. Generowanie raportu...")
        time.sleep(1)

        # Save the report
        with open("status_report.json", "w", encoding="utf-8") as f:
            json.dump(report.model_dump(), f, indent=2, ensure_ascii=False)

        logging.info("Report saved to status_report.json")

        print(f"\n📄 Raport zapisany: {os.path.abspath('status_report.json')}")

        # Final summary from the report
        print("\n" + "✨" * 20)
        print(f"PODSUMOWANIE: {report.summary}")
        print("✨" * 20)

    except Exception as e:
        print(f"\033[91mCRASH: {e}\033[0m")
        logging.critical("CRASH", exc_info=True)
        import traceback
        traceback.print_exc()

    finally:
        logging.info("=== REGIS CLI END ===")
        print("\nNaciśnij Enter, żeby zamknąć...")
        # input() # Commented out for automated testing environments, uncomment for real use

if __name__ == "__main__":
    main()
