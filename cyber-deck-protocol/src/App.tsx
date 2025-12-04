import React, { useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Terminal, Activity, Save, Cpu } from 'lucide-react';
import './index.css';

const DEFAULT_PROTOCOL = `# CYBERDECK v27.5.1 — ONLINE

Neural Engine active • No hallucinations • Live editing • Neon interface

Edytuj ten tekst → nacisnij Ctrl+S → Zapisz protokół → odświeża się automatycznie

Ready to jack in, runner?

NEON`;

function App() {
  const [value, setValue] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const [agentStatus, setAgentStatus] = useState<any>(null);

  const loadStatus = useCallback(async () => {
    if (window.api?.readAgentStatus) {
      try {
        const json = await window.api.readAgentStatus();
        setAgentStatus(JSON.parse(json));
      } catch (err) {
        console.error('Error reading status:', err);
      }
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, [loadStatus]);

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

  const handleRunJules = useCallback(async () => {
      if (window.api?.runJules) {
          console.log("Triggering Google Jules...");
          await window.api.runJules({ file: "GEMINI.md", context: "Full Audit requested by user." });
      }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-cyber-black text-cyber-green font-mono overflow-hidden relative selection:bg-cyber-green selection:text-cyber-black">
      {/* Background Grid & Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="scanline-overlay z-50 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 border-b border-cyber-green/30 bg-cyber-black/80 backdrop-blur-md shadow-neon-sm">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 animate-pulse text-cyber-green" />
          <h1 className="text-2xl font-bold tracking-[0.2em] text-shadow-neon uppercase">
            Cyberdeck <span className="text-xs align-top opacity-70">v27.5.1</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-cyber-green/70 border border-cyber-green/30 px-3 py-1 bg-cyber-dim/30">
            <div className={`w-2 h-2 rounded-full ${saved ? 'bg-green-400 shadow-neon' : 'bg-green-900'}`} />
            {saved ? 'DATA_SYNCED' : 'SYSTEM_READY'}
          </div>

          <button
            onClick={handleRunJules}
            className="group relative px-5 py-2 overflow-hidden border border-cyber-green bg-transparent text-cyber-green font-bold tracking-wider hover:text-black hover:bg-cyber-green transition-all duration-300 shadow-neon-sm hover:shadow-neon"
          >
            <span className="relative z-10 flex items-center gap-2">
               <Cpu className="w-4 h-4" /> EXEC_JULES
            </span>
            <div className="absolute inset-0 bg-cyber-green transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col p-4 z-10">
        <div className="flex-1 relative border border-cyber-green/20 bg-cyber-gray/50 shadow-neon-box backdrop-blur-sm overflow-hidden">
            {/* Top Bar of Editor Panel */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-cyber-dim/80 border-b border-cyber-green/20 flex items-center px-2 justify-between pointer-events-none z-20">
                <span className="text-[10px] tracking-widest opacity-60">PROTOCOL_EDITOR // MODE: WRITE</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-cyber-green/20" />
                    <div className="w-2 h-2 rounded-full bg-cyber-green/20" />
                </div>
            </div>

            <div className="pt-8 h-full">
                <Editor
                    height="100%"
                    defaultLanguage="markdown"
                    theme="vs-dark"
                    value={value}
                    onChange={(v) => setValue(v || '')}
                    options={{
                        fontSize: 14,
                        fontFamily: "'Courier New', Courier, monospace",
                        wordWrap: 'on',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: false,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: 'line',
                        cursorBlinking: 'solid',
                        cursorStyle: 'block',
                        contextmenu: false,
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            useShadows: false,
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                        },
                        // Customizing VS Dark colors via defineTheme is hard here without init,
                        // so we rely on container styling.
                    }}
                    onMount={(editor, monaco) => {
                        monaco.editor.defineTheme('cyberpunk', {
                            base: 'vs-dark',
                            inherit: true,
                            rules: [
                                { token: 'comment', foreground: '008844', fontStyle: 'italic' },
                                { token: 'keyword', foreground: '00ff88', fontStyle: 'bold' },
                                { token: 'string', foreground: '00cc66' },
                            ],
                            colors: {
                                'editor.background': '#0a0f0d', // Matches cyber-gray
                                'editor.foreground': '#00ff88',
                                'editor.lineHighlightBackground': '#003311',
                                'editorCursor.foreground': '#00ff88',
                                'editorLineNumber.foreground': '#005522',
                            }
                        });
                        monaco.editor.setTheme('cyberpunk');
                    }}
                />
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 flex justify-between items-center px-6 py-2 border-t border-cyber-green/30 bg-cyber-black/90 text-xs tracking-widest text-cyber-green/60 uppercase">
        <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-green animate-pulse" />
                STATUS: {agentStatus ? agentStatus.status || "IDLE" : "DISCONNECTED"}
            </span>
            <span className="w-px h-3 bg-cyber-green/30" />
            <span>MEM: {agentStatus?.progress?.phase || "---"}</span>
        </div>

        <div className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
            <span>SECURE_CONNECTION: TRUE</span>
            <span>LATENCY: 12ms</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
