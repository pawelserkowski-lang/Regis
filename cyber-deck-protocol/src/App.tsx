import React, { useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

const DEFAULT_PROTOCOL = `# CYBERDECK v27.5.1 — ONLINE

Neural Engine active • No hallucinations • Live editing • Neon interface

Edytuj ten tekst → nacisnij Ctrl+S → Zapisz protokół → odświeża się automatycznie

Ready to jack in, runner?

NEON`;

function App() {
  const [value, setValue] = useState<string>('');
  const [saved, setSaved] = useState(false);

  const loadProtocol = useCallback(async () => {
    if (window.api?.readProtocol) {
      try {
        const content = await window.api.readProtocol();
        setValue(content || DEFAULT_PROTOCOL);
        return;
      } catch (err) {
        console.error('Błąd ładowania protokołu z Electron:', err);
      }
    }

    const cached = localStorage.getItem('protocol');
    if (cached) {
      setValue(cached);
      return;
    }

    try {
      const response = await fetch('/GEMINI.md');
      if (response.ok) {
        const content = await response.text();
        setValue(content || DEFAULT_PROTOCOL);
        return;
      }
    } catch (err) {
      console.error('Błąd ładowania GEMINI.md przez HTTP:', err);
    }

    setValue(DEFAULT_PROTOCOL);
  }, []);

  useEffect(() => {
    loadProtocol();
  }, [loadProtocol]);

  const persistProtocol = useCallback(async (content: string) => {
    if (window.api?.saveProtocol) {
      try {
        await window.api.saveProtocol(content);
        return;
      } catch (err) {
        console.error('Błąd zapisu w Electron:', err);
      }
    }

    localStorage.setItem('protocol', content);
  }, []);

  // Auto-zapis co 2 sekundy + Ctrl+S
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        void persistProtocol(value).then(() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 1000);
        });
      }
    }, 2000);

    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        void persistProtocol(value).then(() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [persistProtocol, value]);

  // Easter egg – wpisz /regis wake up
  useEffect(() => {
    if (value.includes('/regis wake up')) {
      document.body.style.filter = 'hue-rotate(360deg) brightness(2)';
      setTimeout(() => {
        document.body.style.filter = '';
      }, 3000);
    }
  }, [value]);

  return (
    <div className="h-screen flex flex-col bg-black text-cyan-400 font-mono">
      <header className="bg-gradient-to-r from-purple-900 to-cyan-900 p-4 shadow-lg shadow-cyan-500/50">
        <h1 className="text-3xl font-bold tracking-wider animate-pulse">
          CYBERDECK v27.5.1 <span className="text-green-400">— ONLINE</span>
        </h1>
      </header>

      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          theme="vs-dark"
          value={value}
          onChange={(v) => setValue(v || '')}
          options={{
            fontSize: 16,
            wordWrap: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            unusualLineTerminators: 'off',
            automaticLayout: true,
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            renderLineHighlight: 'none',
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
            },
          }}
        />
        {saved && (
          <div className="absolute top-4 right-4 bg-green-600 text-black px-4 py-2 rounded animate-ping">
            ZAPISANO
          </div>
        )}
      </div>

      <footer className="bg-gradient-to-r from-purple-900 to-cyan-900 p-3 text-center text-sm">
        <span className="animate-pulse">NEON PROTOCOL ACTIVE</span> • Ctrl+S = szybki zapis • /regis wake up = surprise
      </footer>
    </div>
  );
}

export default App;
