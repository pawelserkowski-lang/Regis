import os
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable, InternalServerError
from tenacity import retry, wait_random_exponential, stop_after_attempt, retry_if_exception_type, before_sleep_log
import logging
import asyncio

logger = logging.getLogger(__name__)

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    # Fallback dla testów, ale w produkcji rzuci błędem
    logger.warning("Brak GEMINI_API_KEY! Upewnij się, że jest ustawiony.")

genai.configure(api_key=API_KEY)

class GeminiGuard:
    """Wrapper na klienta Gemini z obsługą błędów i async."""
    
    def __init__(self, model_name="gemini-2.0-flash-exp"):
        self.model = genai.GenerativeModel(model_name)
        self.total_input_tokens = 0
        self.total_output_tokens = 0

    @retry(
        wait=wait_random_exponential(multiplier=1, max=60),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type((ResourceExhausted, ServiceUnavailable, InternalServerError)),
    )
    async def generate_content_async(self, prompt, temperature=0.7):
        """Asynchroniczne generowanie treści."""
        try:
            # Prosta estymacja tokenów (bardzo zgrubna: 1 słowo ~= 1.3 tokena)
            input_est = len(prompt.split()) * 1.3
            self.total_input_tokens += input_est
            
            # Gemini Python SDK nie jest natywnie async w 100%, więc wrapujemy w executorze
            # Uwaga: Nowsze wersje SDK mogą mieć generate_content_async, używamy tego jeśli dostępne
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=temperature)
            )
            
            output_text = response.text
            self.total_output_tokens += len(output_text.split()) * 1.3
            
            logger.info(f"Zużycie (est): In={int(input_est)}, Out={int(len(output_text.split())*1.3)}")
            return output_text
            
        except Exception as e:
            logger.error(f"Błąd generowania AI: {e}")
            raise

    def get_stats(self):
        return {
            "input_tokens": int(self.total_input_tokens),
            "output_tokens": int(self.total_output_tokens)
        }