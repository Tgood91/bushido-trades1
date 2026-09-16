import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, GitBranch, Calendar, Terminal, CheckCircle2 } from 'lucide-react';

interface ProtocolTooltipProps {
  children: React.ReactNode;
  version?: string;
  deploymentDate?: string;
  network?: string;
  chainId?: number;
}

export default function ProtocolTooltip({
  children,
  version = 'v2.4.2-release',
  deploymentDate = 'September 14, 2026 • 14:30 UTC',
  network = 'Base L2 Mainnet',
  chainId = 8453
}: ProtocolTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div 
      className="relative inline-flex items-center group cursor-help"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={isVisible}
      aria-describedby="protocol-version-tooltip"
    >
      {children}

      {/* Floating Tooltip Bubble */}
      {isVisible && (
        <div
          id="protocol-version-tooltip"
          role="tooltip"
          className="absolute left-0 top-full mt-2.5 z-50 w-72 sm:w-80 p-3.5 rounded-xl bg-[#05070d]/95 backdrop-blur-md border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 text-left animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top Arrow Pointer */}
          <div className="absolute -top-1.5 left-6 w-3 h-3 rotate-45 bg-[#05070d] border-t border-l border-cyan-500/30" />

          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wide text-slate-100 uppercase">
                Protocol Telemetry
              </span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded font-medium">
              <CheckCircle2 className="h-3 w-3" />
              <span>Live & Audited</span>
            </div>
          </div>

          {/* Version and Build */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-amber-400" />
                <span>Protocol Version:</span>
              </span>
              <span className="text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded text-[11px]">
                {version}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>Last Deployed:</span>
              </span>
              <span className="text-slate-200 font-semibold text-[11px]">
                {deploymentDate}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-red-400" />
                <span>Deployment Target:</span>
              </span>
              <span className="text-slate-300 text-[11px]">
                {network} (ID: {chainId})
              </span>
            </div>
          </div>

          {/* Brief Protocol Summary */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-relaxed font-sans">
            <p>
              BUSHIDO-20z hybrid token launcher with constant-product AMM bonding curves, automatic 1% creator splits, and on-chain virtue governance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
