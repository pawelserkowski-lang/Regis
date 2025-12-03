import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className }: GlassCardProps) => {
  return (
    <div className={`bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden ${className || ""}`}>
      {children}
    </div>
  );
};
