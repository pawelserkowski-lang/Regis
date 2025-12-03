import React from "react";
import { Cpu, Sparkles } from "lucide-react";

interface CyberHeaderProps {
  onToggleEdit: () => void;
  isEditing: boolean;
  version?: string;
}

export const CyberHeader: React.FC<CyberHeaderProps> = ({ onToggleEdit, isEditing, version = "27.5.1" }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Cpu className="text-cyber-primary" size={40} />
        <h1 className="text-4xl font-bold text-cyber-primary tracking-widest">CYBERDECK v{version}</h1>
      </div>
      <button
        onClick={onToggleEdit}
        className="px-5 py-3 bg-cyber-primary/20 hover:bg-cyber-primary/40 rounded-lg flex items-center gap-2 transition"
      >
        <Sparkles size={22} /> {isEditing ? "Podgląd" : "Edytuj"}
      </button>
    </div>
  );
};
