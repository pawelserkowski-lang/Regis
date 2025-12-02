import React, { useEffect, useState } from "react";
import { GlassCard } from "./components/GlassCard";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Cpu, Save, Sparkles, Terminal, Code2, Eye } from "lucide-react";

export default function App() {
  const [protocol, setProtocol] = useState("Ładowanie protokołu...");
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    // Mock API for development if window.api is missing (though in Electron it should be there)
    if (window.api) {
      window.api.readProtocol().then(setProtocol).catch(() => setProtocol("# Błąd ładowania"));
    } else {
      setProtocol("# DEMO MODE\n\nSystem initialization...\n\n- Core: Online\n- Neural Link: Active");
    }
  }, []);

  const save = () => {
    if (window.api) {
      window.api.saveProtocol(protocol).then(() => setEdit(false));
    } else {
      setEdit(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-cyber-bg text-cyber-text flex overflow-hidden font-sans relative selection:bg-cyber-primary/30 selection:text-cyber-primary">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-cyber-bg pointer-events-none opacity-80" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full h-full flex p-6 gap-6">

        {/* Editor/Preview Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <GlassCard className="h-full flex flex-col p-1" intensity="high">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-cyber-primary/10 bg-cyber-bg/20 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyber-primary/10 rounded-lg border border-cyber-primary/20 shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                  <Cpu className="text-cyber-primary animate-pulse" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-cyber-primary tracking-widest font-mono">CYBERDECK <span className="text-cyber-accent text-sm">v3.0.PRO</span></h1>
                  <div className="flex items-center gap-2 text-xs text-cyber-muted font-mono">
                    <span className="w-2 h-2 bg-cyber-primary rounded-full animate-ping" />
                    SYSTEM ONLINE
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                 <button
                  onClick={() => setEdit(!edit)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 border ${
                    edit
                    ? "bg-cyber-bg/50 text-cyber-muted border-transparent hover:text-cyber-primary"
                    : "bg-cyber-primary/20 text-cyber-primary border-cyber-primary/30 shadow-neon-sm"
                  }`}
                >
                  {edit ? <Eye size={18} /> : <Code2 size={18} />}
                  <span className="font-mono text-sm">{edit ? "PREVIEW" : "CODE"}</span>
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden relative bg-cyber-bg/30">
              {edit ? (
                <div className="h-full w-full relative group">
                  <div className="absolute top-0 right-0 p-2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-mono text-cyber-primary/50 bg-cyber-bg/80 px-2 py-1 rounded">EDITOR MODE</span>
                  </div>
                  <Editor
                    height="100%"
                    defaultLanguage="markdown"
                    value={protocol}
                    onChange={(val) => setProtocol(val || "")}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: '"Fira Code", monospace',
                      minimap: { enabled: false },
                      wordWrap: "on",
                      padding: { top: 20, bottom: 20 },
                      lineNumbers: "on",
                      renderLineHighlight: "line",
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: "on",
                      smoothScrolling: true,
                    }}
                    onMount={(editor, monaco) => {
                      monaco.editor.defineTheme('cyber-theme', {
                        base: 'vs-dark',
                        inherit: true,
                        rules: [],
                        colors: {
                          'editor.background': '#020403', // Match our bg
                          'editor.lineHighlightBackground': '#082f1c',
                          'editorCursor.foreground': '#00ff88',
                        }
                      });
                      monaco.editor.setTheme('cyber-theme');
                    }}
                  />
                  <div className="absolute bottom-6 right-8 z-30">
                    <button
                      onClick={save}
                      className="px-6 py-2 bg-cyber-primary text-black font-bold rounded shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <Save size={18} /> SAVE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto p-8 prose prose-invert max-w-none custom-scrollbar">
                  <ReactMarkdown>{protocol}</ReactMarkdown>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Side Panel (Visual/Status) */}
        <div className="w-80 hidden lg:flex flex-col gap-6">
           <GlassCard className="flex-1 flex items-center justify-center relative overflow-hidden" intensity="low">
              <div className="absolute inset-0 bg-cyber-primary/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-primary/10 via-cyber-bg to-cyber-bg" />
              <div className="text-center z-10">
                <div className="text-6xl font-black text-cyber-primary/20 tracking-tighter select-none glitch-effect" style={{ textShadow: "0 0 20px rgba(0,255,136,0.2)" }}>
                  DATA
                </div>
                <div className="text-cyber-accent font-mono text-sm mt-2 tracking-[0.5em] animate-pulse">STREAM</div>
              </div>

              {/* Decorative elements */}
              <div className="absolute bottom-4 left-4 text-[10px] font-mono text-cyber-primary/30">
                 COORD: 45.22.91<br/>
                 SECURE: TRUE
              </div>
           </GlassCard>

           <GlassCard className="h-1/3 p-4 flex flex-col gap-2" intensity="medium">
              <div className="text-xs font-mono text-cyber-muted uppercase border-b border-cyber-primary/10 pb-2 mb-2">System Metrics</div>
              <div className="flex justify-between items-center text-sm font-mono">
                <span className="text-cyber-text/70">CPU Load</span>
                <span className="text-cyber-primary">12%</span>
              </div>
              <div className="w-full bg-cyber-bg h-1 rounded-full overflow-hidden">
                <div className="bg-cyber-primary w-[12%] h-full shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
              </div>

              <div className="flex justify-between items-center text-sm font-mono mt-2">
                <span className="text-cyber-text/70">Memory</span>
                <span className="text-cyber-accent">45%</span>
              </div>
              <div className="w-full bg-cyber-bg h-1 rounded-full overflow-hidden">
                <div className="bg-cyber-accent w-[45%] h-full shadow-[0_0_10px_rgba(204,255,0,0.5)]" />
              </div>

               <div className="flex justify-between items-center text-sm font-mono mt-2">
                <span className="text-cyber-text/70">Net</span>
                <span className="text-cyber-secondary">890 Mb/s</span>
              </div>
               <div className="w-full bg-cyber-bg h-1 rounded-full overflow-hidden">
                <div className="bg-cyber-secondary w-[70%] h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
