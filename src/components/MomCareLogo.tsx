import React from 'react';

interface MomCareLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

export const MomCareLogo: React.FC<MomCareLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  animate = true,
}) => {
  // Dimensions
  const sizeMap = {
    xs: { box: 'w-7 h-7', svg: 28, text: 'text-sm' },
    sm: { box: 'w-9 h-9', svg: 34, text: 'text-base' },
    md: { box: 'w-11 h-11', svg: 42, text: 'text-lg' },
    lg: { box: 'w-16 h-16', svg: 60, text: 'text-2xl' },
    xl: { box: 'w-20 h-20', svg: 76, text: 'text-3xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Emblem Icon */}
      <div
        className={`${currentSize.box} relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--mc-surface-elevated)] via-[var(--mc-card)] to-[var(--mc-surface)] border-2 border-[var(--mc-primary)]/40 shadow-[var(--mc-glow)] shrink-0 overflow-hidden group transition-all duration-300 hover:border-[var(--mc-primary)] hover:scale-105`}
      >
        {/* Ambient background glow orb */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--mc-primary)]/25 to-[var(--mc-primary-accent)]/20 pointer-events-none" />

        {/* Dynamic Vector Emblem */}
        <svg
          width={currentSize.svg}
          height={currentSize.svg}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300"
        >
          <defs>
            <linearGradient id="momcareGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--mc-primary)" />
              <stop offset="100%" stopColor="var(--mc-primary-accent)" />
            </linearGradient>

            <linearGradient id="momcareGradSoft" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--mc-primary)" stopOpacity="0.9" />
            </linearGradient>

            <filter id="neonGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Protective Heart-Womb Outer Halo */}
          <path
            d="M 50 88 C 22 70, 10 50, 16 32 C 20 20, 34 16, 44 24 C 47 26.5, 49 29, 50 31 C 51 29, 53 26.5, 56 24 C 66 16, 80 20, 84 32 C 90 50, 78 70, 50 88 Z"
            fill="none"
            stroke="url(#momcareGradPrimary)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-40"
          />

          {/* Mother Silhouette: Head & Tender Protective Curve */}
          {/* Mother's Head */}
          <circle
            cx="38"
            cy="27"
            r="7"
            fill="url(#momcareGradSoft)"
            filter="url(#neonGlowEffect)"
          />

          {/* Mother's Embracing Neck, Back & Gentle Arm */}
          <path
            d="M 33 34 C 24 40, 20 54, 25 66 C 30 76, 42 82, 50 86 C 53 84, 58 80, 62 76 C 54 75, 42 70, 36 60 C 31 52, 33 42, 39 37 Z"
            fill="url(#momcareGradPrimary)"
            className="opacity-90"
          />

          {/* Baby in Womb: Nestled Head & Body */}
          {/* Baby's Head */}
          <circle
            cx="58"
            cy="46"
            r="5.5"
            fill="url(#momcareGradSoft)"
            filter="url(#neonGlowEffect)"
          />

          {/* Baby's Body Nestled Safely */}
          <path
            d="M 58 52 C 65 54, 69 62, 66 69 C 63 75, 55 77, 48 74 C 43 71, 44 65, 48 61 C 52 57, 56 55, 58 52 Z"
            fill="url(#momcareGradPrimary)"
          />

          {/* Intertwined Heart Arc Connecting Mother & Child */}
          <path
            d="M 39 39 C 48 42, 55 38, 64 34 C 73 30, 82 36, 81 48 C 80 62, 67 74, 50 86"
            fill="none"
            stroke="url(#momcareGradPrimary)"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-80"
          />

          {/* Dynamic Vital Pulse Spark of Life */}
          <g className={animate ? 'animate-pulse' : ''}>
            {/* Sparkle star at the heart center */}
            <path
              d="M 50 40 L 51.5 44 L 56 45.5 L 51.5 47 L 50 51.5 L 48.5 47 L 44 45.5 L 48.5 44 Z"
              fill="#FFFFFF"
              filter="url(#neonGlowEffect)"
            />
            {/* Soft pulsing vital heart dot */}
            <circle cx="50" cy="45.5" r="1.5" fill="var(--mc-primary)" />
          </g>

          {/* Subtle ECG Vital Rhythm Line in Womb Base */}
          <path
            d="M 36 78 L 44 78 L 47 73 L 50 82 L 53 76 L 56 78 L 64 78"
            fill="none"
            stroke="url(#momcareGradSoft)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-75"
          />
        </svg>

        {/* High-tech corner sheen highlight */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-white/20 rounded-bl-xl pointer-events-none" />
      </div>

      {/* Optional Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black ${currentSize.text} tracking-tight text-[var(--mc-text-primary)] neon-text-glow leading-none`}
            >
              Mom<span className="text-[var(--mc-primary)] drop-shadow-[0_0_8px_var(--mc-primary-glow)]">Care</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mc-primary)] animate-ping" />
          </div>
          <span className="text-[9px] font-mono tracking-widest uppercase text-[var(--mc-text-secondary)] font-semibold mt-0.5">
            Maternal Cyber-Care
          </span>
        </div>
      )}
    </div>
  );
};
