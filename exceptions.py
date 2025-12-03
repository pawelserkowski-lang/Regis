# Wygenerowano automatycznie przez upgrade_jules.py
# Ten plik służy do ładnego raportowania błędów użytkownikowi.

class JulesError(Exception):
    """Bazowa klasa błędów dla Julesa."""
    pass

class APIConnectionError(JulesError):
    """Błąd połączenia z Gemini (Internet/Google)."""
    def user_message(self):
        return "🔌 Nie mogę połączyć się z mózgiem (API Gemini). Sprawdź internet lub klucz API."

class SecurityRiskError(JulesError):
    """Próba dostępu do niedozwolonych plików."""
    def user_message(self):
        return "🛡️ IO Guard zablokował tę operację. Nie dotykaj plików systemowych!"

class ContextLimitError(JulesError):
    """Przekroczono limit tokenów."""
    def user_message(self):
        return "🧠 Mój mózg paruje (Context Window Exceeded). Spróbuj skrócić konwersację."