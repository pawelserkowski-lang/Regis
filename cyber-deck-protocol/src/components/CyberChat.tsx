import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Cpu, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface CyberChatProps {
  protocol: string;
}

export function CyberChat({ protocol }: CyberChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "System ready. Select a model and initiate link." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<"openai" | "grok" | "claude">("openai");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const contextPrompt = `You are a helper AI in the Cyberdeck environment.
Current Protocol Content:
\`\`\`markdown
${protocol}
\`\`\`
Answer the user's questions based on this protocol or general knowledge.`;

    const apiMessages = [
        { role: "system", content: contextPrompt },
        ...messages.filter(m => m.role !== 'system').slice(-10),
        userMsg
    ];

    try {
      if (!window.api || !window.api.askAI) {
          // Fallback for browser testing (mock response)
          console.warn("API not available, mocking response");
           setTimeout(() => {
                setMessages(prev => [...prev, { role: "assistant", content: "[MOCK] AI response (API not connected)" }]);
                setLoading(false);
           }, 1000);
           return;
      }

      const response = await window.api.askAI(provider, apiMessages);
      if (response.startsWith("Error:")) {
         setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${response}` }]);
      } else {
         setMessages(prev => [...prev, { role: "assistant", content: response }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Critical Link Failure." }]);
    } finally {
      if (window.api) setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-cyber-text">
        <div className="flex items-center justify-between mb-4 border-b border-cyber-primary/20 pb-2">
            <div className="flex items-center gap-2 text-cyber-primary">
                <Terminal size={20} />
                <span className="font-mono text-lg tracking-wider">NEURAL LINK</span>
            </div>
            <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="bg-black/50 border border-cyber-primary/40 text-cyber-primary rounded px-2 py-1 outline-none focus:border-cyber-primary transition font-mono text-sm"
            >
                <option value="openai">ChatGPT (OpenAI)</option>
                <option value="grok">Grok (xAI)</option>
                <option value="claude">Claude (Anthropic)</option>
            </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg ${
                        msg.role === 'user'
                        ? 'bg-cyber-primary/10 border border-cyber-primary/30 text-white'
                        : 'bg-black/40 border border-cyber-accent/30 text-cyber-text/90'
                    }`}>
                        <div className="flex items-center gap-2 mb-1 opacity-50 text-xs font-mono uppercase">
                            {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                            {msg.role === 'user' ? 'OPERATOR' : provider.toUpperCase()}
                        </div>
                        <div className="prose prose-invert prose-sm">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            ))}
             {loading && (
                <div className="flex justify-start animate-pulse">
                    <div className="bg-black/40 border border-cyber-accent/30 p-3 rounded-lg flex items-center gap-2 text-cyber-accent">
                        <Cpu size={16} className="animate-spin" />
                        <span className="font-mono text-xs">PROCESSING...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 flex gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Enter command..."
                className="flex-1 bg-black/30 border border-cyber-primary/30 rounded-lg px-4 py-3 text-white placeholder-cyber-text/30 outline-none focus:border-cyber-primary focus:bg-black/50 transition font-mono"
                disabled={loading}
            />
            <button
                onClick={handleSend}
                disabled={loading}
                className="bg-cyber-primary/20 hover:bg-cyber-primary/40 text-cyber-primary border border-cyber-primary/40 rounded-lg px-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send size={20} />
            </button>
        </div>
    </div>
  );
}
