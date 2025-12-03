import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Bot, Play, Terminal } from 'lucide-react';

export const CyberJules = () => {
  const [repo, setRepo] = useState('username/repo');
  const [task, setTask] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const startTask = async () => {
    if (!task.trim()) return;
    setLoading(true);
    addLog(`> Initiating Jules task for ${repo}...`);
    addLog(`> Task: "${task}"`);

    try {
      // @ts-ignore - api is injected
      const result = await window.api.startJulesTask({ repoName: repo, taskDescription: task });

      const content = result.content?.[0];
      if (content?.type === 'text') {
        const parsed = JSON.parse(content.text);
        if (parsed.error) {
           addLog(`[ERROR] ${parsed.error}`);
        } else if (parsed.stderr) {
           addLog(`[STDERR] ${parsed.stderr}`);
        } else {
           addLog(`[STDOUT] ${parsed.stdout}`);
           addLog(`[SUCCESS] Jules task started successfully.`);
        }
      } else {
         addLog(`[UNKNOWN] Received unexpected response format.`);
      }
    } catch (err: any) {
      addLog(`[CRITICAL] Failed to communicate with Jules Agent: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  return (
    <GlassCard className="h-full flex flex-col p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-cyber-primary/30 pb-4">
        <Bot className="text-cyber-accent" size={32} />
        <h2 className="text-2xl font-bold text-cyber-accent tracking-widest">JULES AGENT LINK</h2>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto mb-4">
        <div>
          <label className="block text-cyber-primary text-sm mb-1">Target Repository</label>
          <input
            type="text"
            value={repo}
            onChange={e => setRepo(e.target.value)}
            className="w-full bg-black/50 border border-cyber-primary/30 rounded p-3 text-white focus:outline-none focus:border-cyber-primary transition"
          />
        </div>

        <div>
          <label className="block text-cyber-primary text-sm mb-1">Task Description</label>
          <textarea
            value={task}
            onChange={e => setTask(e.target.value)}
            rows={4}
            placeholder="Describe the bug to fix or feature to add..."
            className="w-full bg-black/50 border border-cyber-primary/30 rounded p-3 text-white focus:outline-none focus:border-cyber-primary transition resize-none"
          />
        </div>

        <div className="bg-black/80 border border-white/10 rounded p-4 font-mono text-sm h-64 overflow-y-auto">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Terminal size={14} />
                <span>Console Output</span>
            </div>
            {logs.length === 0 && <span className="text-gray-600 italic">Ready for input...</span>}
            {logs.map((log, i) => (
                <div key={i} className={`mb-1 ${log.includes('[ERROR]') || log.includes('[CRITICAL]') ? 'text-red-400' : 'text-green-400'}`}>
                    {log}
                </div>
            ))}
        </div>
      </div>

      <button
        onClick={startTask}
        disabled={loading}
        className={`w-full py-4 rounded font-bold flex items-center justify-center gap-2 transition uppercase tracking-widest
            ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-cyber-accent hover:bg-cyber-accent/80 text-black'}`}
      >
        {loading ? 'Transmitting...' : <><Play size={20} /> Execute Protocol</>}
      </button>
    </GlassCard>
  );
};
