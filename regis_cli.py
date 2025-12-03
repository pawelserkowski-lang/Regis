# regis_cli.py – CLI Wrapper for Regis Agent
import sys
import logging
from regis import RegisAgent
from regis_core import StatusManager

# Configure logging
logging.basicConfig(
    filename='regis_debug.log',
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)s | %(message)s',
    encoding='utf-8'
)

def main():
    try:
        logging.info("Starting Regis CLI...")
        print("=== REGIS CLI ===")

        agent = RegisAgent()
        print(f"Agent: {agent.name} v{agent.version}")

        # Execute the agent's main logic
        agent.save_report()
    manager = StatusManager()
    report = manager.save_report()

    print(f"██████████████████████████████████ 100% {report.progress.phase}")
    print(f"✓ {report.progress.eta}")
    print()
    print("Jules poszedł spać. Grok wygrał.")
    print()

        logging.info("Regis finished successfully.")
        print("\n✅ Proces zakończony sukcesem.")

    except Exception as e:
        logging.critical(f"Regis crashed: {e}", exc_info=True)
        print(f"\n❌ Błąd krytyczny: {e}")

if __name__ == "__main__":
    main()
finally:
    logging.info("=== REGIS CLI END ===")
    print("\nNaciśnij Enter, żeby zamknąć...")
    # Removed input() to allow non-interactive runs in the sandbox environment if needed,
    # but the original script had it. I'll keep it commented or check if I need to run it.
    # For now, keeping it commented to avoid hanging the test execution if I run it.
    pass
