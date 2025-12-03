// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';

// Ładujemy nasz krytyczny fix Monaco workerów
import './monaco-config';

// Ścieżka do pliku GEMINI.md (w folderze z exe)
const protocolPath = path.join(
  process.env.PORTABLE_EXECUTABLE_DIR || process.cwd(),
  'GEMINI.md'
);

// Eksponujemy bezpieczne API do renderera (App.tsx)
contextBridge.exposeInMainWorld('electronAPI', {
  loadProtocol: async (): Promise<string> => {
    try {
      if (fs.existsSync(protocolPath)) {
        return fs.readFileSync(protocolPath, 'utf-8');
      } else {
        // Tworzymy domyślny plik jeśli nie istnieje
        const defaultContent = `# CYBERDECK v27.5.1 — ONLINE

Neural Engine active • No hallucinations • Live editing • Neon interface

Edytuj ten tekst → nacisnij Ctrl+S → Zapisz protokół → odświeża się automatycznie

Ready to jack in, runner?

NEON`;
        fs.writeFileSync(protocolPath, defaultContent, 'utf-8');
        return defaultContent;
      }
    } catch (err) {
      console.error('Błąd odczytu GEMINI.md:', err);
      return '# Błąd ładowania protokołu';
    }
  },

  saveProtocol: async (content: string): Promise<void> => {
    try {
      fs.writeFileSync(protocolPath, content, 'utf-8');
      console.log('Protokół zapisany:', protocolPath);
    } catch (err) {
      console.error('Błąd zapisu GEMINI.md:', err);
    }
  },
});