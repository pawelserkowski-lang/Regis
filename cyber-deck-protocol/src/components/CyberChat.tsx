import React, { useState } from "react";
import { Send, Bot, Terminal } from "lucide-react";

export function CyberChat() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Gotowy do współpracy. Czekam na instrukcje." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // @ts-ignore
      const res = await window.api.generateAI(userMsg);
      if (res.error) {
        setMessages(prev => [...prev, { role: "ai", text: `[BŁĄD SYSTEMU]: ${res.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", text: res.response }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", text: "[BŁĄD KRYTYCZNY] Utracono połączenie z Neural Engine." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-bg/50 rounded-lg overflow-hidden border border-cyber-primary/20">
      <div className="bg-cyber-primary/10 p-3 flex items-center gap-2 border-b border-cyber-primary/20">
        <Bot size={20} className="text-cyber-primary" />
        <span className="font-mono text-cyber-primary text-sm tracking-wider">NEURAL LINK V1.0 (PL)</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm font-mono ${
              m.role === "user"
                ? "bg-cyber-primary/20 text-white border border-cyber-primary/30"
                : "bg-black/40 text-cyber-primary border border-cyber-primary/10"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-black/40 text-cyber-primary border border-cyber-primary/10 p-3 rounded-lg text-sm font-mono animate-pulse">
              [PRZETWARZANIE...]
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-cyber-primary/20 flex gap-2">
        <div className="flex-1 relative">
          <Terminal size={16} className="absolute left-3 top-3 text-cyber-primary/50" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Wpisz komendę..."
            className="w-full bg-black/50 border border-cyber-primary/30 rounded text-sm p-2 pl-10 text-white focus:outline-none focus:border-cyber-primary font-mono placeholder-cyber-primary/30"
          />
        </div>
        <button
          onClick={send}
          disabled={loading}
          className="bg-cyber-primary/20 hover:bg-cyber-primary/40 text-cyber-primary p-2 rounded transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
