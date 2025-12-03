import argparse
import sys
import logging
from typing import Optional

# Assumption: You have a package structure or files are in the same directory.
# If you refactor into packages, change imports to: from jules.core import regis
try:
    import regis
    from regis import JulesError, BrainConnectionError
except ImportError:
    # Fallback for flat file structure
    import regis
    from regis import JulesError, BrainConnectionError

# Logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """
    Main entry point for Jules CLI.
    Handles command-line arguments and passes control to the core (regis.py).
    """
    parser = argparse.ArgumentParser(
        description="Jules (Regis) - Your Cybernetic Code Assistant",
        epilog="Remember: With great power comes great token responsibility."
    )

    # Main command (analyze, debug, etc.)
    parser.add_argument(
        "command",
        choices=["analyze", "debug", "refactor", "chat"],
        help="Agent operation mode"
    )

    # Optional arguments
    parser.add_argument(
        "--file", "-f",
        type=str,
        help="Path to the file to be analyzed/fixed"
    )
    
    parser.add_argument(
        "--context", "-c",
        type=str,
        help="Additional text context for the agent"
    )

    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enables verbose debug mode"
    )

    args = parser.parse_args()

    if args.debug:
        logger.setLevel(logging.DEBUG)
        logger.debug("DEBUG mode enabled. Jules sees everything.")

    try:
        logger.info(f"Starting procedure: {args.command.upper()}")
        
        # Prepare payload for regis.py
        request_payload = {
            "mode": args.command,
            "target_file": args.file,
            "user_context": args.context
        }

        # Invoke core logic
        result = regis.process_request(request_payload)
        
        print("\n--- JULES OUTPUT ---\n")
        print(result)
        print("\n--------------------\n")

    except BrainConnectionError as e:
        logger.error(f"API Connection Error: {e}")
        print("❌ Jules cannot connect to the cloud. Check your internet and API key.")
        sys.exit(1)
    except JulesError as e:
        logger.error(f"Internal Jules Error: {e}")
        print(f"⚠️ An error occurred in agent logic: {e}")
        sys.exit(1)
    except Exception as e:
        logger.critical(f"Unexpected critical error: {e}", exc_info=True)
        print("💥 CRITICAL ERROR. Check logs.")
        sys.exit(1)

if __name__ == "__main__":
    main()