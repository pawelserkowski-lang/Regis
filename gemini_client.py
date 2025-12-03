import os
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable, InternalServerError
from tenacity import (
    retry,
    wait_random_exponential,
    stop_after_attempt,
    retry_if_exception_type,
    before_sleep_log
)
import logging

# Logger configuration for tenacity
logger = logging.getLogger(__name__)

# API Configuration
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("Missing GEMINI_API_KEY environment variable!")

genai.configure(api_key=API_KEY)

# Default Model
DEFAULT_MODEL = "gemini-2.0-flash-exp" # Using a fast model, switch to Pro if needed

@retry(
    # Wait randomly between 1 and 60 seconds, increasing exponentially (2^x)
    wait=wait_random_exponential(multiplier=1, max=60),
    # Stop trying after 7 failed attempts
    stop=stop_after_attempt(7),
    # Retry only on specific network/limit errors
    retry=retry_if_exception_type((ResourceExhausted, ServiceUnavailable, InternalServerError)),
    # Log before sleeping (so you know Jules is waiting)
    before_sleep=before_sleep_log(logger, logging.WARNING)
)
def generate_content_safe(prompt, model_name=DEFAULT_MODEL, temperature=0.7):
    """
    Safe content generation function with handling for 429 and 503 errors.
    """
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature
            )
        )
        return response.text
    except Exception as e:
        # This exception will be caught by @retry if it is in retry_if_exception_type
        # If not, it will propagate up.
        logger.error(f"Error during content generation: {e}")
        raise

def get_chat_model(model_name=DEFAULT_MODEL):
    """Returns a chat model instance (without initialization-level retry)."""
    return genai.GenerativeModel(model_name)