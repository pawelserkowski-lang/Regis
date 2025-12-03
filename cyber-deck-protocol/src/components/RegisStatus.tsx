import React, { useEffect, useState } from "react";
import { GlassCard } from "./GlassCard";
import { Activity, Terminal, Shield, AlertTriangle, CheckCircle, RefreshCw, Cpu } from "lucide-react";
import clsx from "clsx";

export const RegisStatus = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await window.api.readAgentStatus();
      if (data) {
        setStatus(JSON.parse(data));
      }
    } catch (e) {
      console.error("Failed to load status", e);
    }
  };

  const runAgent = async () => {
    setLoading(true);
    await window.api.runAgent();
    await fetchStatus();
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return <div className="text-white p-8">Ładowanie Agenta Regis...</div>;

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-2">
      <div className="flex gap-6">
        {/* Main Status Card */}
        <GlassCard className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-cyber-primary flex items-center gap-2">
                    <Terminal className="text-cyber-primary" /> REGIS AGENT v9.8
                </h2>
                <div className="text-sm text-gray-400 mt-1">Mode: <span className="text-white">{status.mode}</span></div>
            </div>
            <button
                onClick={runAgent}
                disabled={loading}
                className="p-2 bg-cyber-primary/20 hover:bg-cyber-primary/40 rounded-lg transition disabled:opacity-50"
            >
                <RefreshCw className={clsx("text-cyber-primary", loading && "animate-spin")} />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className={clsx("px-3 py-1 rounded text-sm font-bold border",
                status.status === "Finalna" ? "bg-green-500/20 border-green-500 text-green-400" : "bg-yellow-500/20 border-yellow-500 text-yellow-400"
            )}>
                {status.status}
            </div>
            <div className="text-sm text-gray-300 flex-1 font-mono">{status.progress?.phase}</div>
          </div>

          <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 border border-green-500/30">
            {status.progress?.log}
          </div>
        </GlassCard>

        {/* Stats / Risk */}
        <GlassCard className="w-1/3 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
                <Shield className="text-blue-400" />
                <div>
                    <div className="text-xs text-gray-400">Security</div>
                    <div className="text-sm font-bold">{status.issues?.security}</div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Cpu className="text-purple-400" />
                <div>
                    <div className="text-xs text-gray-400">Confidence</div>
                    <div className="text-sm font-bold">{status.confidence}</div>
                </div>
            </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        <GlassCard className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-cyber-accent flex items-center gap-2">
                <Activity size={20} /> Timeline
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {status.progress?.steps?.map((step: string, i: number) => (
                    <div key={i} className="text-sm text-gray-300 font-mono border-b border-white/5 pb-1">
                        {step}
                    </div>
                ))}
            </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
             <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle size={20} /> Issues & Summary
            </h3>
            <div className="text-sm text-gray-300 space-y-4">
                <div>
                    <div className="text-xs text-red-400 uppercase tracking-widest mb-1">Critical</div>
                    <div>{status.issues?.critical}</div>
                </div>
                <div>
                    <div className="text-xs text-cyber-primary uppercase tracking-widest mb-1">Summary</div>
                    <div>{status.summary}</div>
                </div>
                <div>
                     <div className="text-xs text-purple-400 uppercase tracking-widest mb-1">Jules</div>
                     <div>{status.jules?.status} - {status.jules?.task}</div>
                </div>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};
