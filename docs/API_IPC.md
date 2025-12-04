# Interfejsy i IPC (Inter-Process Communication)

## Przegląd
Aplikacja wykorzystuje model bezpieczeństwa Electrona z włączonym `contextIsolation`. Frontend nie ma dostępu do `require()` ani modułów Node.js. Cała komunikacja odbywa się przez most `window.api` zdefiniowany w `preload.ts`.

## Definicja TypeScript (`vite-env.d.ts`)

```typescript
interface Window {
  api: {
    readProtocol: () => Promise<string>;
    saveProtocol: (content: string) => Promise<boolean>;
    startJulesTask: (task: string, file?: string) => Promise<any>;
    askAI: (prompt: string) => Promise<string>;
    readAgentStatus: () => Promise<string>;
    runAgent: (agentName: string, params: any) => Promise<any>;
    runJules: (file: string | null, context: string | null) => Promise<any>;
  }
}
```

## Kanały IPC (Electron Main)

Poniższe kanały są nasłuchiwane w `electron/main.ts`:

| Kanał | Opis | Parametry | Zwraca |
|-------|------|-----------|--------|
| `protocol:read` | Odczytuje plik `GEMINI.md`. | Brak | `string` (treść pliku) |
| `protocol:save` | Zapisuje plik `GEMINI.md`. | `content: string` | `boolean` |
| `agent:status` | Odczytuje `status_report.json`. | Brak | `string` (JSON) |
| `jules:run` | Uruchamia proces `jules_cli.py`. | `{ context: string, file: string }` | `{ success: boolean, pid: number }` |

## Bezpieczeństwo (Allowlist)

W pliku `electron/main.ts` zaimplementowano mechanizmy zabezpieczające przed nieautoryzowanym dostępem do systemu plików:

1.  **Sztywne ścieżki**: `protocol:read` próbuje odczytać plik tylko ze zdefiniowanych lokalizacji (`process.cwd()/GEMINI.md` lub relatywnie do `__dirname`).
2.  **Brak dynamicznych ścieżek**: Nie ma możliwości przekazania dowolnej ścieżki systemowej do odczytu przez IPC (poza parametrem `file` dla Julesa, który jest przekazywany do Pythona, ale nie zwracany bezpośrednio jako treść pliku przez Electron).
3.  **Sanityzacja**: Frontend parsuje JSON z `agent:status` i obsługuje błędy parowania, zapobiegając awariom UI przy uszkodzonym pliku statusu.

## Debugowanie
Logi z procesów Pythona (stdout/stderr) są przekierowywane do konsoli Electrona (terminala, z którego uruchomiono `npm run dev`), co ułatwia debugowanie backendu.
