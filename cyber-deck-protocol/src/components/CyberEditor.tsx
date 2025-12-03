import React from "react";
import Editor from "@monaco-editor/react";
import { Save, Loader2 } from "lucide-react";

interface CyberEditorProps {
  content: string;
  onChange: (value: string | undefined) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const CyberEditor: React.FC<CyberEditorProps> = ({ content, onChange, onSave, isSaving }) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 border border-cyber-primary/20 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          value={content}
          onChange={onChange}
          theme="vs-dark"
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            wordWrap: "on",
            padding: { top: 16 }
          }}
        />
      </div>
      <button
        onClick={onSave}
        disabled={isSaving}
        className="mt-4 self-end px-8 py-3 bg-cyber-primary text-black font-bold rounded-lg hover:scale-105 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
        {isSaving ? "Zapisywanie..." : "Zapisz"}
      </button>
    </div>
  );
};
