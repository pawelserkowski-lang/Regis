import threading
import logging
import time
from typing import Dict, Any

# Error definitions (could be moved to errors.py)
class JulesError(Exception): pass
class BrainConnectionError(JulesError): pass

# Local imports
try:
    from memory_manager import MemoryManager
    from gemini_client import generate_content_safe
except ImportError:
    # Handling case where files are in a package
    import memory_manager
    import gemini_client
    from memory_manager import MemoryManager
    from gemini_client import generate_content_safe

logger = logging.getLogger(__name__)

# GLOBAL LOCK - Protects against thread races (e.g., two requests from Electron at once)
processing_lock = threading.Lock()

# Initialize memory manager
memory = MemoryManager()

def process_request(payload: Dict[str, Any]) -> str:
    """
    Main function processing requests.
    """
    # Check if Jules is busy
    if processing_lock.locked():
        # Optional: Add queuing logic here
        logger.warning("Request received, but Jules is busy.")
        # In this simple version, we wait for the lock (or could return 'Busy')
    
    with processing_lock:
        return _safe_execute(payload)

def _safe_execute(payload: Dict[str, Any]) -> str:
    """
    Internal execution function protected by lock.
    """
    mode = payload.get("mode")
    target_file = payload.get("target_file")
    user_context = payload.get("user_context")

    logger.info(f"Processing in mode: {mode} for file: {target_file}")

    # Build prompt
    prompt = f"Mode: {mode}.\n"
    if target_file:
        try:
            with open(target_file, 'r', encoding='utf-8') as f:
                content = f.read()
            prompt += f"Input file ({target_file}):\n```\n{content}\n```\n"
        except FileNotFoundError:
            return f"Error: File {target_file} not found."
        except Exception as e:
            return f"File read error: {str(e)}"

    if user_context:
        prompt += f"Additional context: {user_context}\n"

    # Add to memory
    memory.add_message("user", prompt)

    try:
        # Call API (with retry implemented in gemini_client)
        response_text = generate_content_safe(prompt)
        
        # Add response to memory
        memory.add_message("model", response_text)
        
        return response_text

    except Exception as e:
        logger.error(f"Error in _safe_execute: {e}")
        # Raise our own error so CLI can handle it gracefully
        raise BrainConnectionError(f"Inference engine failure: {str(e)}")

# Simple test (if running file directly)
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print(process_request({"mode": "chat", "user_context": "Tell a joke about programmers."}))