import sys
import argparse
from debate import SimpleDebate

def main():
    parser = argparse.ArgumentParser(description="Regis CLI - System Zarządzania i Debaty AI")
    subparsers = parser.add_subparsers(dest="command", help="Dostępne komendy")

    # Komenda: debate
    debate_parser = subparsers.add_parser("debate", help="Uruchom debatę między agentami")
    debate_parser.add_argument("topic", nargs="+", help="Temat debaty (np. 'Migracja na Rust')")

    # Komenda: status (przykładowa, dla zachowania ciągłości Twojego projektu)
    status_parser = subparsers.add_parser("status", help="Sprawdź status systemu")

    args = parser.parse_args()

    if args.command == "debate":
        topic = " ".join(args.topic)
        try:
            engine = SimpleDebate()
            engine.run(topic)
        except Exception as e:
            print(f"❌ Wystąpił błąd podczas debaty: {e}")

    elif args.command == "status":
        print("✅ System Regis: ONLINE")
        print("   Moduł debaty: GOTOWY")
        print("   Cyber-deck: OCZEKIWANIE")

    else:
        parser.print_help()

if __name__ == "__main__":
    main()