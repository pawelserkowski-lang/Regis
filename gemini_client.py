import os
import logging
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable, InternalServerError
from tenacity import (
    retry,
    wait_random_exponential,
    stop_after_attempt,
    retry_if_exception_type,
    before_sleep_log
)

logger = logging.getLogger(__name__)

class GeminiGuard:
    """
    Wrapper na klienta Gemini zapewniający obsługę błędów, retry policy
    oraz (w przyszłości) zliczanie tokenów.
    """
    def __init__(self, api_key=None, model_name="gemini-2.0-flash-exp"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            # Fallback dla testów lokalnych - OSTRZEŻENIE
            logger.warning("Brak GEMINI_API_KEY. Próba uruchomienia w trybie mock (jeśli brak klucza).")
            # W produkcji tutaj powinien być raise ValueError
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(model_name)
        else:
            self.model = None

    @retry(
        wait=wait_random_exponential(multiplier=1, max=60),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type((ResourceExhausted, ServiceUnavailable, InternalServerError)),
        before_sleep=before_sleep_log(logger, logging.WARNING)
    )
    def generate_content(self, prompt, temperature=0.7):
        if not self.model:
             return "[[MOCK RESPONSE: Brak klucza API. Ustaw GEMINI_API_KEY.]]"
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Błąd generowania treści: {e}")
            raise

    async def generate_content_async(self, prompt, temperature=0.7):
        """Wersja asynchroniczna dla modułu debaty."""
        import asyncio
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self.generate_content, prompt, temperature)

# Funkcja dla wstecznej kompatybilności z regis.py
def generate_content_safe(prompt, model_name="gemini-2.0-flash-exp"):
    guard = GeminiGuard(model_name=model_name)
    return guard.generate_content(prompt)