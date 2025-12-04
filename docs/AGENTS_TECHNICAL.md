# Dokumentacja Techniczna Agentów AI

## Wprowadzenie
System wykorzystuje dwa główne byty AI: **Regis** (Zarządca/Executor) oraz **Jules** (Audytor/Analityk). Działają one w oparciu o model Google Gemini (gemini-2.0-flash).

## 1. Jules (The Auditor)
Jules jest wyspecjalizowanym agentem do analizy kodu i generowania raportów technicznych. Jego działanie opiera się na zaawansowanym łańcuchu promptów.

### Metodologia: Skeleton-of-Thought + Debate
Jules nie generuje odpowiedzi w jednym kroku. Proces jest podzielony na fazy:

1.  **Skeleton (Szkielet Myślowy)**
    - Szybka analiza problemu.
    - Wygenerowanie punktów do dyskusji, bez wchodzenia w szczegóły implementacyjne.
    - Cel: Redukcja latencji myślowej i uniknięcie "halucynacji" na wczesnym etapie.

2.  **Multi-Agent Debate (Symulacja Wewnętrzna)**
    - Model wciela się w trzy role:
        - **Agent Architekt**: Dba o czystość kodu, wzorce (SOLID, DRY).
        - **Agent Hacker**: Szuka luk bezpieczeństwa, wycieków pamięci, błędów logicznych.
        - **Agent PM (Product Manager)**: Balansuje jakość z kosztem i czasem wdrożenia. Decyduje o priorytetach.
    - Wynikiem jest zsyntezowany werdykt.

3.  **Final Solutions (Rozwiązania)**
    - Generowanie konkretnego kodu i komend na podstawie werdyktu PM-a.

### Pliki Źródłowe
- `jules.py`: Główna logika agenta.
- `jules_cli.py`: Wrapper CLI do uruchamiania przez Electron.

### Dane Wyjściowe
- `GEMINI.md`: Główny raport (Protocol).
- `status_report.json`: Status na żywo (używany przez UI do wyświetlania paska postępu).

---

## 2. Regis (The Executor)
Regis jest agentem "operacyjnym", zaprojektowanym do wykonywania zadań, zarządzania pamięcią i interakcji z systemem plików (w przyszłości).

### Kluczowe Cechy
- **Memory Manager**: System pamięci krótkotrwałej (kontekst rozmowy).
- **Safe Execution**: Wrapper `_safe_execute` przechwytujący błędy API i systemu plików.
- **Hierarchia Błędów**: Zdefiniowane klasy `RegisError`, `BrainConnectionError`, `ContextError`.

### Konfiguracja (Arcy-Prompt)
Regis jest inicjowany z `SYSTEM_INSTRUCTION` zawierającym JSON z metapromptem:
```json
{
  "Meta": { "Rola": "Regis System (Jules)", "Tryb": "DEBATE & NO-INTERRUPTION" },
  "Nakaz": "Po wygenerowaniu planu NIE PYTAJ o zgodę."
}
```

## Modele Danych (Pydantic / JSON Schema)

### Status Report (`status_template.json`)
Struktura używana do komunikacji z Frontendem:
```json
{
  "status": "🟡 W trakcie | 🟢 Finalna",
  "mode": "Nazwa trybu",
  "progress": {
    "phase": "Opis fazy",
    "percent": 0-100,
    "timeline": ["Log 1", "Log 2"]
  },
  "thinking": ["Myśl 1", "Myśl 2"]
}
```
Dokładne przestrzeganie tego schematu jest krytyczne dla poprawnego renderowania komponentu `AgentStatus`.
