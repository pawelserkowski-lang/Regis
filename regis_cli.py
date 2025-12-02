# regis_cli.py – CLI Wrapper for Regis Agent
import sys
import logging
from regis import RegisAgent

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

        logging.info("Regis finished successfully.")
        print("\n✅ Proces zakończony sukcesem.")

    except Exception as e:
        logging.critical(f"Regis crashed: {e}", exc_info=True)
        print(f"\n❌ Błąd krytyczny: {e}")

if __name__ == "__main__":
    main()
