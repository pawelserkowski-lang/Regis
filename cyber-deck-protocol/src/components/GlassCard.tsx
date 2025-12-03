import { twMerge } from "tailwind-merge";
import clsx from "clsx";
export const GlassCard = ({ children, className }) => (
  <div className={twMerge(clsx("bg-cyber-panel/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-neon p-8", className))}>
    {children}
  </div>
);
