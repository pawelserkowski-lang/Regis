import React, { useEffect, useState } from "react";
import { GlassCard } from "./components/GlassCard";
import { HistorySidebar } from "./components/HistorySidebar";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Cpu, Save, Sparkles, Menu } from "lucide-react";

export default function App() {
  const [protocol, setProtocol] = useState("Ładowanie protokołu...");
  const [edit, setEdit] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentHistoryFile, setCurrentHistoryFile] = useState<string | null>(null);

  const loadProtocol = async () => {
    try {
      const content = await window.api.readProtocol();
      setProtocol(content);
      setCurrentHistoryFile(null); // Reset selection as we are on "live" protocol
    } catch {
      setProtocol("# Błąd ładowania");
    }
  };

  const loadHistory = async () => {
    try {
      const list = await window.api.listHistory();
      setHistory(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProtocol();
    loadHistory();
  }, []);

  const save = async () => {
    await window.api.saveProtocol(protocol);
    setEdit(false);
    loadHistory(); // Refresh history list
  };

  const onSelectHistory = async (filename: string) => {
    try {
      const content = await window.api.readHistory(filename);
      setProtocol(content);
      setCurrentHistoryFile(filename);
      // If viewing history, maybe default to preview mode?
      // setEdit(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen w-screen bg-cyber-bg text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ease-in-out ${showSidebar ? "w-64" : "w-0"} overflow-hidden`}>
         <HistorySidebar history={history} onSelect={onSelectHistory} currentFile={currentHistoryFile} />
      </div>

      <div className="flex-1 flex flex-col h-full relative">
        {/* Toggle Sidebar Button */}
        <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="absolute top-4 left-4 z-50 text-cyber-primary hover:text-white transition"
        >
            <Menu size={24} />
        </button>

        <div className="flex-1 flex p-8 gap-8 h-full">
            <div className="w-1/2 h-full">
                <GlassCard className="h-full flex flex-col relative">
                <div className="flex justify-between items-center mb-6 pl-8"> {/* pl-8 to make room for menu button */}
                    <div className="flex items-center gap-4">
                    <Cpu className="text-cyber-primary" size={40} />
                    <h1 className="text-4xl font-bold text-cyber-primary tracking-widest">
                        {currentHistoryFile ? "ARCHIWUM" : "CYBERDECK v27.5.1"}
                    </h1>
                    </div>
                    <div className="flex gap-2">
                         {currentHistoryFile && (
                            <button onClick={loadProtocol} className="px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-lg text-sm transition">
                                Wróć do Live
                            </button>
                        )}
                        <button onClick={() => setEdit(!edit)} className="px-5 py-3 bg-cyber-primary/20 hover:bg-cyber-primary/40 rounded-lg flex items-center gap-2 transition">
                        <Sparkles size={22} /> {edit ? "Podgląd" : "Edytuj"}
                        </button>
                    </div>
                </div>

                {edit ? (
                    <div className="flex-1 flex flex-col">
                    <Editor height="100%" defaultLanguage="markdown" value={protocol} onChange={(val) => setProtocol(val || "")}
                        theme="vs-dark" options={{ fontSize: 16, minimap: { enabled: false }, wordWrap: "on" }} />
                    <button onClick={save} className="mt-4 self-end px-8 py-3 bg-cyber-primary text-black font-bold rounded-lg hover:scale-105 transition flex items-center gap-2">
                        <Save size={22} /> {currentHistoryFile ? "Przywróć / Zapisz jako Live" : "Zapisz"}
                    </button>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none overflow-y-auto h-full pb-20 text-lg">
                    <ReactMarkdown>{protocol}</ReactMarkdown>
                    </div>
                )}
                </GlassCard>
            </div>
            <div className="w-1/2 bg-gradient-to-br from-cyber-primary/5 via-transparent to-cyber-accent/5 flex items-center justify-center rounded-2xl border border-cyber-primary/10">
                <div className="text-cyber-primary/30 text-9xl font-bold select-none rotate-90 lg:rotate-0 transition-all">
                    {currentHistoryFile ? "LOG" : "NEON"}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
