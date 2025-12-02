import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export const GlassCard = ({ children, className, intensity = "medium" }: GlassCardProps) => {
  const intensityMap = {
    low: "bg-cyber-panel/40 backdrop-blur-md",
    medium: "bg-cyber-panel/60 backdrop-blur-xl",
    high: "bg-cyber-panel/80 backdrop-blur-2xl",
  };

  return (
    <div className={twMerge(clsx(
      intensityMap[intensity],
      "border border-cyber-primary/20 rounded-xl shadow-neon transition-all duration-300",
      "hover:border-cyber-primary/40 hover:shadow-neon-strong",
      className
    ))}>
      {children}
    </div>
  );
};
