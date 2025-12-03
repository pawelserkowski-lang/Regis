import os
import google.generativeai as genai
# NOWOŚĆ: Importujemy tenacity do obsługi błędów sieciowych
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import google.api_core.exceptions

class GeminiClient:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Brak klucza API Gemini!")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    # NOWOŚĆ: Dekorator retry - próbuje 5 razy z rosnącym opóźnieniem
    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type(google.api_core.exceptions.ResourceExhausted)
    )
    def generate_content(self, prompt):
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Błąd generowania (próba zostanie ponowiona jeśli to błąd sieci): {e}")
            raise e