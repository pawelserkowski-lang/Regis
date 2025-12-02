import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-cyber-bg text-white flex items-center justify-center p-8">
          <GlassCard className="max-w-2xl w-full flex flex-col items-center text-center p-10 border-red-500/50">
            <AlertTriangle className="text-red-500 mb-6" size={64} />
            <h1 className="text-3xl font-bold text-red-500 mb-4">CRITICAL SYSTEM FAILURE</h1>
            <p className="text-xl mb-6">The neural link has been severed.</p>
            <div className="bg-black/50 p-4 rounded text-left font-mono text-sm text-red-300 w-full overflow-auto max-h-40">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 px-6 py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500 rounded text-red-100 transition"
            >
              REBOOT SYSTEM
            </button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
