import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: 'green' | 'yellow' | 'red';
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showExplanation?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  title,
  size = 'md',
}) => {
  if (level === 'red') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#FF003C]/60 bg-[#2E0B16] text-[#FF5277] font-bold shadow-[0_0_12px_rgba(255,0,60,0.4)] ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
      >
        <AlertCircle className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#FF003C] animate-pulse`} />
        <span>{title || '🔴 Urgent — Medical Assessment Needed'}</span>
      </div>
    );
  }

  if (level === 'yellow') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#FFB300]/50 bg-[#2D1D09] text-[#FFCA28] font-bold shadow-[0_0_10px_rgba(255,179,0,0.3)] ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
      >
        <AlertTriangle className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#FFB300]`} />
        <span>{title || '🟡 Needs Healthcare Assessment'}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#10E599]/40 bg-[#0C241B] text-[#5CFFBA] font-bold shadow-[0_0_10px_rgba(16,229,153,0.25)] ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      <CheckCircle2 className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#10E599]`} />
      <span>{title || '🟢 Routine Monitoring'}</span>
    </div>
  );
};
