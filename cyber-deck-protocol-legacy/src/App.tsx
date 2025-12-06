import React, { useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Terminal, Activity, Save, Cpu } from 'lucide-react';
import './index.css';
// import { CyberPanel } from './components/CyberPanel'; // Not strictly needed if we structure layout directly, but good for panels.

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
      document.body.style.filter = 'invert(1)';
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
      {/* Background & Effects */}
      <div className="scanlines z-50 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 border-b border-cyber-green bg-cyber-black">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-cyber-green" />
          <h1 className="text-2xl font-bold tracking-widest text-glow uppercase">
            Cyberdeck <span className="text-xs align-top opacity-70">v27.5.1</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-cyber-green border border-cyber-dim px-3 py-1 bg-cyber-black">
            <div className={`w-2 h-2 ${saved ? 'bg-cyber-green' : 'bg-cyber-dim'}`} />
            {saved ? 'DATA_SYNCED' : 'SYSTEM_READY'}
          </div>

          {/* Button Style: Transparent, Green Border, Hover Invert, No Transition */}
          <button
            onClick={handleRunJules}
            className="group relative px-5 py-2 border border-cyber-green bg-transparent text-cyber-green font-bold tracking-wider hover:bg-cyber-green hover:text-cyber-black transition-none cursor-pointer active:translate-y-px active:translate-x-px"
          >
            <span className="flex items-center gap-2">
               <Cpu className="w-4 h-4" /> EXEC_JULES
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col p-4 z-10">
        <div className="flex-1 relative border border-cyber-green bg-cyber-black overflow-hidden flex flex-col">
            {/* Top Bar of Editor Panel */}
            <div className="h-6 bg-cyber-green text-cyber-black flex items-center px-2 justify-between pointer-events-none z-20">
                <span className="text-[10px] tracking-widest font-bold">PROTOCOL_EDITOR // MODE: WRITE</span>
                <div className="flex gap-1">
                   {/* Decorative squares instead of circles */}
                    <div className="w-2 h-2 bg-cyber-black" />
                    <div className="w-2 h-2 bg-cyber-black" />
                </div>
            </div>

            <div className="flex-1 h-full">
                <Editor
                    height="100%"
                    defaultLanguage="markdown"
                    theme="cyberpunk"
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
                            verticalScrollbarSize: 12,
                            horizontalScrollbarSize: 12,
                        },
                    }}
                    onMount={(editor, monaco) => {
                        monaco.editor.defineTheme('cyberpunk', {
                            base: 'vs-dark',
                            inherit: true,
                            rules: [
                                { token: 'comment', foreground: '003B00', fontStyle: 'italic' },
                                { token: 'keyword', foreground: '00FF41', fontStyle: 'bold' },
                                { token: 'string', foreground: '00FF41' },
                                { token: 'delimiter', foreground: '00FF41' },
                            ],
                            colors: {
                                'editor.background': '#000000',
                                'editor.foreground': '#00FF41',
                                'editor.lineHighlightBackground': '#003B00',
                                'editorCursor.foreground': '#00FF41',
                                'editorLineNumber.foreground': '#003B00',
                                'editorLineNumber.activeForeground': '#00FF41',
                                'editor.selectionBackground': '#003B00',
                            }
                        });
                        monaco.editor.setTheme('cyberpunk');
                    }}
                />
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 flex justify-between items-center px-6 py-2 border-t border-cyber-green bg-cyber-black text-xs tracking-widest text-cyber-green uppercase">
        <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-green" />
                STATUS: {agentStatus ? agentStatus.status || "IDLE" : "DISCONNECTED"}
            </span>
            <span className="w-px h-3 bg-cyber-dim" />
            <span>MEM: {agentStatus?.progress?.phase || "---"}</span>
        </div>

        <div className="flex items-center gap-4">
            <span>SECURE_CONNECTION: TRUE</span>
            <span>LATENCY: 12ms</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
