import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Check, ChevronUp, Repeat } from 'lucide-react';
import { useTranslation } from '../translations';

export type DeviceMode = 'mobile' | 'tablet' | 'desktop';

interface DeviceModeSwitcherProps {
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
}

export const DeviceModeSwitcher: React.FC<DeviceModeSwitcherProps> = ({
  deviceMode,
  onDeviceModeChange,
}) => {
  const { language } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const modes: Array<{
    id: DeviceMode;
    label: string;
    labelTa: string;
    labelHi: string;
    icon: typeof Smartphone;
    badge: string;
  }> = [
    {
      id: 'mobile',
      label: 'Mobile',
      labelTa: 'மொபைல்',
      labelHi: 'मोबाइल',
      icon: Smartphone,
      badge: '412px',
    },
    {
      id: 'tablet',
      label: 'Tablet',
      labelTa: 'டேப்லெட்',
      labelHi: 'टैबलेट',
      icon: Tablet,
      badge: '820px',
    },
    {
      id: 'desktop',
      label: 'Desktop',
      labelTa: 'டெஸ்க்டாப்',
      labelHi: 'डेस्कटॉप',
      icon: Monitor,
      badge: 'Full',
    },
  ];

  const currentModeIndex = modes.findIndex((m) => m.id === deviceMode);
  const currentMode = modes[currentModeIndex >= 0 ? currentModeIndex : 0];
  const nextMode = modes[(currentModeIndex + 1) % modes.length];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCycleNext = () => {
    onDeviceModeChange(nextMode.id);
  };

  const CurrentIcon = currentMode.icon;
  const currentLabel =
    language === 'ta'
      ? currentMode.labelTa
      : language === 'hi'
      ? currentMode.labelHi
      : currentMode.label;

  const nextLabel =
    language === 'ta' ? nextMode.labelTa : language === 'hi' ? nextMode.labelHi : nextMode.label;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 left-4 z-40 select-none animate-in fade-in slide-in-from-bottom-2 duration-300"
      role="region"
      aria-label="Device View Switcher"
    >
      {/* Mini Popup Selection Menu (opens directly above the single button) */}
      {isMenuOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-44 p-1.5 rounded-2xl bg-[var(--mc-surface)]/95 backdrop-blur-xl border-2 border-[var(--mc-card-border)] shadow-[var(--mc-glow)] space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--mc-text-secondary)] border-b border-[var(--mc-card-border)]/60 flex items-center justify-between">
            <span>Device View</span>
            <span className="text-[9px] text-[var(--mc-primary)]">3 Modes</span>
          </div>

          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = deviceMode === m.id;
            const localizedLabel =
              language === 'ta' ? m.labelTa : language === 'hi' ? m.labelHi : m.label;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onDeviceModeChange(m.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--mc-btn-gradient)] text-white shadow-xs font-bold'
                    : 'text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)] hover:bg-[var(--mc-chip-bg)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{localizedLabel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono ${
                      isActive ? 'text-white/80' : 'text-[var(--mc-text-muted)]'
                    }`}
                  >
                    {m.badge}
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* The Single Compact Button Switch */}
      <div className="flex items-center rounded-2xl bg-[var(--mc-surface)]/95 backdrop-blur-md border-2 border-[var(--mc-card-border)] shadow-[var(--mc-glow)] hover:border-[var(--mc-primary)]/80 transition-all p-1">
        {/* Main Switcher Button: 1-click cycles to next mode */}
        <button
          type="button"
          onClick={handleCycleNext}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--mc-btn-gradient)] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 group"
          title={`Currently in ${currentLabel} mode (${currentMode.badge}). Click to switch to ${nextLabel}.`}
        >
          <CurrentIcon className="w-3.5 h-3.5 text-white stroke-[2.4]" />
          <span className="font-mono tracking-tight">{currentLabel}</span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-white/20 text-[9px] font-mono text-white/90 font-medium">
            {currentMode.badge}
          </span>
          <Repeat className="w-3 h-3 text-white/70 group-hover:rotate-180 transition-transform duration-300 ml-0.5" />
        </button>

        {/* Small Chevron to open direct selection menu */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`px-1.5 py-1.5 rounded-xl text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)] hover:bg-[var(--mc-chip-bg)] transition-all cursor-pointer ml-0.5 ${
            isMenuOpen ? 'bg-[var(--mc-chip-bg)] text-[var(--mc-primary)]' : ''
          }`}
          title="Choose specific view mode"
          aria-expanded={isMenuOpen}
        >
          <ChevronUp
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isMenuOpen ? 'rotate-180 text-[var(--mc-primary)]' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
};
