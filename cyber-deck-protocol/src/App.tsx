import React, { useEffect, useState } from "react";
import { GlassCard } from "./components/GlassCard";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Cpu, Save, Sparkles } from "lucide-react";

export default function App() {
  const [protocol, setProtocol] = useState("Initializing Protocol...");
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    window.api.readProtocol().then(setProtocol).catch(() => setProtocol("# Protocol Error\nFailed to load GEMINI.md"));
  }, []);

  const save = () => window.api.saveProtocol(protocol).then(() => setEdit(false));

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
              <Sparkles size={22} /> {edit ? "View Mode" : "Override"}
            </button>
          </div>

          {edit ? (
            <div className="flex-1 flex flex-col">
              <Editor height="100%" defaultLanguage="markdown" value={protocol} onChange={(val) => setProtocol(val || "")}
                theme="vs-dark" options={{ fontSize: 16, minimap: { enabled: false }, wordWrap: "on" }} />
              <button onClick={save} className="mt-4 self-end px-8 py-3 bg-cyber-primary text-black font-bold rounded-lg hover:scale-105 transition flex items-center gap-2">
                <Save size={22} /> Commit Changes
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
