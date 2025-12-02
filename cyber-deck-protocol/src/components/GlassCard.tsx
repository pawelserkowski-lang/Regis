import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => (
  <div className={twMerge(clsx("bg-cyber-panel/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-neon p-8", className))}>
    {children}
  </div>
);
