import React, { useEffect, useState } from "react";
import { GlassCard } from "./components/GlassCard";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Cpu, Save, Sparkles } from "lucide-react";

export default function App() {
  const [protocol, setProtocol] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    window.api.readProtocol()
      .then((content) => {
        setProtocol(content);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load protocol:", err);
        setError("Nie udało się załadować protokołu.");
        setProtocol("# Błąd ładowania");
        setIsLoading(false);
      });
  }, []);

  const save = async () => {
    try {
      await window.api.saveProtocol(protocol);
      setEdit(false);
      setError(null);
    } catch (err) {
      console.error("Failed to save protocol:", err);
      setError("Błąd zapisu! Sprawdź logi.");
      // Optional: use a toast notification here instead of alert
      alert("Błąd zapisu protokołu!");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-cyber-bg text-white flex items-center justify-center">
        <div className="text-cyber-primary animate-pulse text-2xl tracking-widest">
          INITIALIZING NEURAL LINK...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-cyber-bg text-white flex">
      <div className="w-1/2 p-8">
        <GlassCard className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Cpu className="text-cyber-primary" size={40} />
              <h1 className="text-4xl font-bold text-cyber-primary tracking-widest">CYBERDECK v27.5.1</h1>
            </div>
            <button onClick={() => setEdit(!edit)} className="px-5 py-3 bg-cyber-primary/20 hover:bg-cyber-primary/40 rounded-lg flex items-center gap-2 transition">
              <Sparkles size={22} /> {edit ? "Podgląd" : "Edytuj"}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200">
              ⚠️ {error}
            </div>
          )}

          {edit ? (
            <div className="flex-1 flex flex-col">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                value={protocol}
                onChange={(val) => setProtocol(val || "")}
                theme="vs-dark"
                options={{ fontSize: 16, minimap: { enabled: false }, wordWrap: "on" }}
              />
              <button onClick={save} className="mt-4 self-end px-8 py-3 bg-cyber-primary text-black font-bold rounded-lg hover:scale-105 transition flex items-center gap-2">
                <Save size={22} /> Zapisz
              </button>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none overflow-y-auto h-full pb-20 text-lg">
              <ReactMarkdown>{protocol}</ReactMarkdown>
            </div>
          )}
        </GlassCard>
      </div>
      <div className="w-1/2 bg-gradient-to-br from-cyber-primary/5 via-transparent to-cyber-accent/5 flex items-center justify-center">
        <div className="text-cyber-primary/30 text-9xl font-bold select-none">NEON</div>
      </div>
    </div>
  );
}
