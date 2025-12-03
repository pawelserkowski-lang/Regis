import React from "react";
import ReactMarkdown from "react-markdown";

interface CyberPreviewProps {
  content: string;
}

export const CyberPreview: React.FC<CyberPreviewProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none overflow-y-auto h-full pb-20 text-lg custom-scrollbar">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};
