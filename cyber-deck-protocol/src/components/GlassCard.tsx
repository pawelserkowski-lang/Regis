import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className = "" }: GlassCardProps) => (
  <div className={twMerge(clsx("bg-cyber-panel/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-neon p-8", className))}>
    {children}
  </div>
);
