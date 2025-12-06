import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface CyberPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export const CyberPanel = ({ children, className, title }: CyberPanelProps) => (
  <div className={twMerge(clsx("border border-cyber-green bg-cyber-black p-4 relative", className))}>
    {title && (
      <div className="bg-cyber-green text-cyber-black text-xs font-bold px-2 py-1 inline-block absolute -top-3 left-2 uppercase tracking-wider">
        {title}
      </div>
    )}
    {children}
  </div>
);
