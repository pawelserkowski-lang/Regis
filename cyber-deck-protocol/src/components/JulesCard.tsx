import React from "react";
import { GlassCard } from "./GlassCard";
import { Activity, ShieldCheck, Terminal, Cpu, Loader } from "lucide-react";

interface StatusReport {
  status: string;
  mode: string;
  progress: {
    phase: string;
    eta: string;
    log: string;
  };
  jules?: {
    status: string;
    task: string;
    last_activity: string;
  };
}

interface JulesCardProps {
  report: StatusReport | null;
}

export function JulesCard({ report }: JulesCardProps) {
  if (!report) {
    return (
      <GlassCard className="h-full flex items-center justify-center flex-col gap-4">
        <Loader className="animate-spin text-cyber-primary" size={48} />
        <div className="text-cyber-primary/60 tracking-widest">CONNECTING TO NEURAL NET...</div>
      </GlassCard>
    );
  }

  const jules = report.jules || { status: "offline", task: "N/A", last_activity: "N/A" };

  return (
    <GlassCard className="h-full flex flex-col p-6 gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-primary/30 pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="text-cyber-accent" size={32} />
          <h2 className="text-2xl font-bold text-cyber-accent tracking-widest">JULES AGENT</h2>
        </div>
        <div className={`px-3 py-1 rounded border ${jules.status === 'active' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-gray-500 text-gray-400'}`}>
          {jules.status.toUpperCase()}
        </div>
      </div>

      {/* Main Status */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-cyber-primary/5 p-4 rounded border border-cyber-primary/20">
          <div className="text-xs text-cyber-primary/60 uppercase tracking-widest mb-1">Current Task</div>
          <div className="text-lg text-white font-mono">{jules.task}</div>
        </div>

        <div className="bg-cyber-primary/5 p-4 rounded border border-cyber-primary/20">
           <div className="text-xs text-cyber-primary/60 uppercase tracking-widest mb-1">Activity Log</div>
           <div className="font-mono text-sm text-cyber-accent/80 flex items-start gap-2">
             <Activity size={16} className="mt-1 flex-shrink-0" />
             {jules.last_activity}
           </div>
        </div>
      </div>

      {/* System Status Integration */}
      <div className="mt-4">
        <h3 className="text-cyber-primary/80 font-bold mb-3 flex items-center gap-2">
            <Cpu size={18} /> SYSTEM STATUS
        </h3>
        <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between border-b border-cyber-primary/10 pb-1">
                <span className="text-gray-400">Phase</span>
                <span className="text-cyber-primary">{report.progress.phase}</span>
            </div>
            <div className="flex justify-between border-b border-cyber-primary/10 pb-1">
                <span className="text-gray-400">ETA</span>
                <span className="text-cyber-primary">{report.progress.eta}</span>
            </div>
            <div className="bg-black/40 p-2 rounded text-xs text-gray-300 border-l-2 border-cyber-accent">
                {report.progress.log}
            </div>
        </div>
      </div>

    </GlassCard>
  );
}
