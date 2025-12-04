# Dokumentacja Frontendowa (Cyberdeck UI)

## Struktura Projektu
Aplikacja jest zbudowana w oparciu o **React 18** i **Vite**.

Katalog: `cyber-deck-protocol/src`

```text
src/
├── assets/         # Obrazy i fonty
├── components/     # Komponenty React (GlassCard, CyberJules, itp.)
├── preload/        # Skrypty preload (część Electrona)
├── App.tsx         # Główny komponent i routing (widoki)
├── index.css       # Style globalne i definicje Tailwind
├── main.tsx        # Punkt wejścia React
└── vite-env.d.ts   # Typy globalne
```

## Stylistyka (Cyberpunk Aesthetic)

Interfejs realizuje styl "State of the Art Cyberpunk" z dominacją czerni i neonowej zieleni.

### Kolorystyka (Tailwind Config)
- **Tło**: Deep Black (`#020403`)
- **Akcent**: Neon Green (`#00ff88`)
- **Tekst**: White / Light Gray
- **Efekty**: Glassmorphism (przezroczystość + rozmycie).

### Kluczowe Komponenty

1.  **GlassCard (`GlassCard.tsx`)**
    - Podstawowy kontener z efektem szkła.
    - Używa `backdrop-filter: blur()`, `border`, i gradientów.

2.  **CyberJules (`CyberJules.tsx`)**
    - Główny panel interakcji z agentem.
    - Zawiera formularz wejściowy (Input) oraz wizualizację statusu (pasek postępu, logi).
    - Odpytuje backend o status (`useInterval` lub `useEffect`).

3.  **Monaco Editor**
    - Zintegrowany edytor kodu do podglądu i edycji `GEMINI.md`.

## Stan Aplikacji

Aplikacja zarządza stanem lokalnie w komponentach, z wyjątkiem widoków głównych (`view`, `edit`, `jules`), które są przełączane w `App.tsx`.

### Tryb Deweloperski vs Produkcja
- W trybie dev (`npm run dev`), aplikacja obsługuje Hot Module Replacement (HMR).
- W buildzie produkcyjnym, zasoby są serwowane statycznie z katalogu `dist`, a `electron/main.ts` ładuje `index.html`.

## Wymagania
- Node.js v16+
- npm / yarn / pnpm

## Uruchomienie (Frontend Only)
Aby uruchomić sam frontend bez Electrona (np. do testów w przeglądarce):
```bash
npm run dev:headless
```
(Wymaga odpowiedniej konfiguracji `vite.headless.config.ts` i mockowania `window.api`).

## Uruchomienie Aplikacji (Desktop)

W katalogu głównym projektu znajdują się skrypty ułatwiające uruchomienie pełnego środowiska (Electron + React):

1.  **Skrypt startowy**:
    ```bash
    ./run_linux.sh
    ```
    Uruchamia aplikację w trybie deweloperskim.

2.  **Skrót Pulpitowy**:
    Aby wygenerować skrót `.desktop` (np. do umieszczenia na pulpicie lub w menu aplikacji), uruchom:
    ```bash
    ./generate_shortcut.sh
    ```
    Skrypt utworzy plik `CyberDeck.desktop` w głównym katalogu, który można przenieść w dowolne miejsce (np. `~/Desktop`).
