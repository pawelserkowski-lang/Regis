import logging
from typing import List, Dict, Any

# Import safe client for summarization
try:
    from gemini_client import generate_content_safe
except ImportError:
    # Fallback import
    from .gemini_client import generate_content_safe

logger = logging.getLogger(__name__)

class MemoryManager:
    def __init__(self, token_limit: int = 8000, summary_threshold: float = 0.8):
        self.history: List[Dict[str, str]] = []
        self.token_limit = token_limit
        self.summary_threshold = summary_threshold # 80% limit triggers cleanup
        self.summary_model = "gemini-2.0-flash-exp" # Cheap model for note-taking

    def add_message(self, role: str, content: str):
        """Adds a message and checks if memory needs cleaning."""
        self.history.append({"role": role, "parts": [content]})
        self._check_and_compress()

    def get_history(self):
        return self.history

    def _estimate_tokens(self) -> int:
        """
        Rough token estimation (1 word ~ 1.3 tokens).
        For production, use tiktoken or count_tokens method from Gemini API.
        """
        # A very rough approximation: 4 chars per token
        if not self.history:
            return 0
        total_chars = sum(len(str(m.get("parts", [""])[0])) for m in self.history)
        return int(total_chars / 4)

    def _check_and_compress(self):
        current_tokens = self._estimate_tokens()
        logger.debug(f"Current memory usage: {current_tokens}/{self.token_limit} tokens.")

        if current_tokens > (self.token_limit * self.summary_threshold):
            logger.info("⚠️ Memory full. Initiating compression procedure (Summarization)...")
            self._compress_history()

    def _compress_history(self):
        """
        Takes the first half of the history, sends it to AI for summarization,
        and replaces it with a single system message.
        """
        if len(self.history) < 4:
            return # No point compressing 3 messages

        # Split history in half
        split_idx = len(self.history) // 2
        old_messages = self.history[:split_idx]
        recent_messages = self.history[split_idx:]

        # Create summarization prompt
        prompt = (
            "You are an AI agent memory module. Below is a fragment of an older conversation. "
            "Summarize it concisely, keeping key facts, established technical rules, "
            "file paths, and user goals. Skip the pleasantries.\n\n"
            f"CONVERSATION:\n{str(old_messages)}"
        )

        try:
            summary_text = generate_content_safe(prompt, model_name=self.summary_model)
            
            summary_message = {
                "role": "user", # Treating this as system input/injected context
                "parts": [f"[SYSTEM MEMORY: Summary of previous conversation part: {summary_text}]"]
            }

            # New history = Summary + Newer messages
            self.history = [summary_message] + recent_messages
            logger.info("✅ Memory compression successful.")
            
        except Exception as e:
            logger.error(f"Failed to compress memory: {e}")
            # Worst case: just slice off the oldest messages (FIFO)
            self.history = self.history[2:]