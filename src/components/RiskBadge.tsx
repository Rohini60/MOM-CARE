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
  showExplanation = false,
}) => {
  if (level === 'red') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C75D5D]/40 bg-[#FBEAEA] text-[#C75D5D] font-bold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        <AlertCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{title || '🔴 Urgent — Medical Assessment Needed'}</span>
      </div>
    );
  }

  if (level === 'yellow') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CF9B48]/40 bg-[#FAF3E8] text-[#CF9B48] font-bold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        <AlertTriangle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{title || '🟡 Needs Healthcare Assessment'}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#6E9C7B]/40 bg-[#EDF5EF] text-[#6E9C7B] font-bold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <CheckCircle2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{title || '🟢 Routine Monitoring'}</span>
    </div>
  );
};
