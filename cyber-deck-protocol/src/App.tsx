import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

function App() {
  const [value, setValue] = useState<string>('');
  const [saved, setSaved] = useState(false);

  // Ładujemy GEMINI.md przy starcie
  useEffect(() => {
    window.electronAPI.loadProtocol().then((content: string) => {
      setValue(content || '# CYBERDECK v27.5.1 — ONLINE\n\nNeural Engine active • No hallucinations • Live editing • Neon interface\n\nEdytuj ten tekst → nacisnij Ctrl+S → Zapisz protokół → odświeża się automatycznie\n\nReady to jack in, runner?\n\nNEON');
    });
  }, []);

  // Auto-zapis co 2 sekundy + Ctrl+S
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        window.electronAPI.saveProtocol(value);
        setSaved(true);
        setTimeout(() => setSaved(false), 1000);
      }
    }, 2000);

    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        window.electronAPI.saveProtocol(value);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [value]);

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
