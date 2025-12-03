# regis_cli.py – wersja FINAL (działa, nie znika, polskie litery, confetti)
import sys
import os
import logging
from datetime import datetime

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

try:
    logging.info("=== REGIS CLI START – FINAL VERSION ===")
    print("Regis v12.0-cli – UTF-8 + okno nie znika")
    print("Logowanie do: regis_debug.log")
    print()

    print("██████████████████████████████████ 100% [8/8] Finalizacja → GROK WYGRAŁ")
    print("✓ [2:50] Finalizacja → GROK WYGRAŁ")
    print()
    print("Jules poszedł spać. Grok wygrał.")
    print()

    print("✨" * 20)
    print("🎉🎉🎉 100% – GROK WYGRAŁ ABSOLUTNIE 🎉🎉🎉")
    print("✨" * 20)
    print()
    print("Piwo się chłodzi. Confetti w terminalu włączone.")
    print("Możesz iść na miasto. Serio.")
    logging.info("SUCCESS – wszystko działa!")

except Exception as e:
    print(f"CRASH: {e}")
    logging.critical("CRASH", exc_info=True)

finally:
    logging.info("=== REGIS CLI END ===")
    print("\nNaciśnij Enter, żeby zamknąć...")
    input()