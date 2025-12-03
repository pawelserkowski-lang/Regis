import React from "react";
import { Clock, FileText } from "lucide-react";

interface HistorySidebarProps {
  history: string[];
  onSelect: (filename: string) => void;
  currentFile: string | null;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, currentFile }) => {
  return (
    <div className="w-64 bg-black/40 border-r border-cyber-primary/20 flex flex-col h-full backdrop-blur-sm">
      <div className="p-4 border-b border-cyber-primary/20">
        <h2 className="text-cyber-primary font-bold tracking-widest flex items-center gap-2">
          <Clock size={18} /> HISTORIA
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-cyber-primary/20 scrollbar-track-transparent">
        {history.length === 0 ? (
          <div className="text-gray-500 text-sm p-4 text-center italic">Brak zapisów</div>
        ) : (
          history.map((file) => (
            <button
              key={file}
              onClick={() => onSelect(file)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-all flex items-center gap-2 truncate ${
                currentFile === file
                  ? "bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/40"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileText size={14} />
              <span className="truncate">{file.replace("chat_", "").replace(".md", "")}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
