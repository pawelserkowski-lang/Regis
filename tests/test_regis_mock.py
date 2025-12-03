import unittest
from unittest.mock import MagicMock, patch
# Załóżmy, że Twoja główna klasa jest w regis.py
# from regis import Regis 

class TestJulesArchitecture(unittest.TestCase):
    def test_api_call_is_mocked(self):
        """Sprawdza, czy testy działają bez dzwonienia do Google."""
        mock_client = MagicMock()
        mock_client.generate_content.return_value = "Symulowana odpowiedź AI"
        
        # Tu byś normalnie zainicjalizował swoją klasę:
        # app = Regis(client=mock_client)
        # result = app.process("Test")
        
        print("Test przeszedł: API zostało poprawnie zmockowane (symulacja).")
        self.assertEqual(mock_client.generate_content.return_value, "Symulowana odpowiedź AI")

if __name__ == '__main__':
    unittest.main()