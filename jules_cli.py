import argparse
import sys
import logging
import subprocess

# Logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """
    CLI wrapper for Jules (jules.py).
    Expected usage from Electron: python jules_cli.py --command analyze --file <path> --context <string>
    """
    parser = argparse.ArgumentParser(description="Jules CLI Wrapper")
    parser.add_argument("--command", choices=["analyze"], default="analyze", help="Command to run")
    parser.add_argument("--file", help="Target file")
    parser.add_argument("--context", help="Context string")

    args = parser.parse_args()

    # For now, we only support the 'analyze' command which runs the audit
    if args.command == "analyze":
        cmd = [sys.executable, "jules.py"]
        if args.file:
            cmd.extend(["--file", args.file])
        if args.context:
            cmd.extend(["--context", args.context])

        logger.info(f"Spawning Jules Process: {cmd}")

        # We run it and let it handle status updates via JSON file
        try:
            subprocess.run(cmd, check=True)
            print("Jules process finished successfully.")
        except subprocess.CalledProcessError as e:
            logger.error(f"Jules process failed: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
