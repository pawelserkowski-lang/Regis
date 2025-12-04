# Regis (Cyberdeck Protocol)

Lokalny agent silnika zarządzającego modelami AI, zintegrowany z interfejsem Cyberdeck.

## Dokumentacja Techniczna

Kompletna dokumentacja techniczna projektu znajduje się w katalogu `docs/`:

- [Architektura Systemu](docs/ARCHITECTURE.md) - Przegląd integracji Electron, React i Python.
- [Agenci AI (Regis & Jules)](docs/AGENTS_TECHNICAL.md) - Szczegóły implementacji "Skeleton-of-Thought" i "Multi-Agent Debate".
- [API i IPC](docs/API_IPC.md) - Opis komunikacji między frontendem a backendem.
- [Frontend Guide](docs/FRONTEND_GUIDE.md) - Przewodnik po interfejsie użytkownika i stylach.

## Szybki Start

1.  Zainstaluj zależności:
    ```bash
    ./setup.sh
    ```
2.  Uruchom aplikację (Linux):
    ```bash
    ./run_linux.sh
    ```
    Lub użyj skrótu na pulpicie (patrz niżej).

    (Windows):
    ```bash
    ./cyber-deck-protocol/run.bat
    ```

## Skrót Pulpitowy (Linux)

Aby utworzyć skrót uruchamiający aplikację z poziomu pulpitu, wykonaj:

```bash
./generate_shortcut.sh
```

Utworzony plik `CyberDeck.desktop` możesz przenieść na pulpit.
