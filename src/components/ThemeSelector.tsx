import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Check, Sun, Moon, Info, HeartPulse } from 'lucide-react';
import type { AppTheme, ColorMode, UserProfile } from '../types';

interface ThemeSelectorProps {
  profile?: UserProfile | null;
  onThemeSelect?: (theme: AppTheme) => void;
  onModeSelect?: (mode: ColorMode) => void;
  isCompact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  profile,
  onThemeSelect,
  onModeSelect,
}) => {
  const { theme, colorMode, setThemeAndSave, setColorModeAndSave } = useTheme();

  const handleSelectTheme = (selectedTheme: AppTheme) => {
    setThemeAndSave(selectedTheme, profile?.id);
    if (onThemeSelect) onThemeSelect(selectedTheme);
  };

  const handleSelectMode = (selectedMode: ColorMode) => {
    setColorModeAndSave(selectedMode, profile?.id);
    if (onModeSelect) onModeSelect(selectedMode);
  };

  return (
    <div className="space-y-4">
      {/* 1. Two Large Preview Cards for Neon Blue and Neon Pink */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* NEON BLUE OPTION */}
        <button
          type="button"
          onClick={() => handleSelectTheme('neon-blue')}
          className={`relative rounded-3xl p-4 text-left transition-all duration-300 border-2 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-98 ${
            theme === 'neon-blue'
              ? 'border-[#00D4FF] shadow-[0_0_25px_rgba(0,212,255,0.45)] ring-2 ring-[#00D4FF]/40 bg-[#111C3D]'
              : 'border-[var(--mc-card-border)] hover:border-[#00D4FF]/40 bg-[#0A1128]/70'
          }`}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4FF]/15 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💙</span>
                <div>
                  <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                    <span>Neon Blue</span>
                    {theme === 'neon-blue' && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[#00D4FF] text-[#0A1128] font-black">
                        ACTIVE ✓
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] font-mono text-[#A8D4FF]">
                    Main: #00D4FF · Accent: #2F6BFF
                  </span>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  theme === 'neon-blue'
                    ? 'border-[#00D4FF] bg-[#00D4FF] text-[#0A1128] shadow-[0_0_8px_#00D4FF]'
                    : 'border-white/30 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            {/* Mini Realistic UI Preview Box */}
            <div className="p-3 rounded-2xl bg-[#09142E] border border-[#00D4FF]/35 space-y-2 text-xs shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-[#00D4FF] text-[#0A1128] flex items-center justify-center text-[10px] shadow-[0_0_8px_rgba(0,212,255,0.6)]">
                    <HeartPulse className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="font-bold text-white text-[11px]">MomCare</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#14234E] text-[#D0E8FF] border border-[#00D4FF]/40">
                  Week 24
                </span>
              </div>

              {/* Sample card & button */}
              <div className="p-2 rounded-xl bg-[#111C3D] border border-[#00D4FF]/30 flex items-center justify-between gap-2">
                <span className="text-[10px] text-[#D0E8FF] font-medium truncate">
                  Today: Baby kicks active
                </span>
                <span className="px-2 py-1 rounded-lg text-[9px] font-bold text-white bg-gradient-to-r from-[#00D4FF] to-[#2F6BFF] shadow-[0_0_8px_rgba(0,212,255,0.5)] shrink-0">
                  Check-in →
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#A8D4FF]">
            <span>Serene cybernetic clarity</span>
            <span className="font-mono text-[10px] text-white font-bold">Tap to Preview</span>
          </div>
        </button>

        {/* NEON PINK OPTION */}
        <button
          type="button"
          onClick={() => handleSelectTheme('neon-pink')}
          className={`relative rounded-3xl p-4 text-left transition-all duration-300 border-2 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-98 ${
            theme === 'neon-pink'
              ? 'border-[#FF3EA5] shadow-[0_0_25px_rgba(255,62,165,0.45)] ring-2 ring-[#FF3EA5]/40 bg-[#26112D]'
              : 'border-[var(--mc-card-border)] hover:border-[#FF3EA5]/40 bg-[#1A0B1F]/70'
          }`}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3EA5]/15 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💗</span>
                <div>
                  <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                    <span>Neon Pink</span>
                    {theme === 'neon-pink' && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[#FF3EA5] text-white font-bold">
                        ACTIVE ✓
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] font-mono text-[#FCA5C6]">
                    Main: #FF3EA5 · Accent: #C13CFF
                  </span>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  theme === 'neon-pink'
                    ? 'border-[#FF3EA5] bg-[#FF3EA5] text-white shadow-[0_0_8px_#FF3EA5]'
                    : 'border-white/30 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            {/* Mini Realistic UI Preview Box */}
            <div className="p-3 rounded-2xl bg-[#180A1C] border border-[#FF3EA5]/35 space-y-2 text-xs shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-[#FF3EA5] text-white flex items-center justify-center text-[10px] shadow-[0_0_8px_rgba(255,62,165,0.6)]">
                    <HeartPulse className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="font-bold text-white text-[11px]">MomCare</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#2A1028] text-[#FFD1E3] border border-[#FF3EA5]/40">
                  Week 24
                </span>
              </div>

              {/* Sample card & button */}
              <div className="p-2 rounded-xl bg-[#26112D] border border-[#FF3EA5]/30 flex items-center justify-between gap-2">
                <span className="text-[10px] text-[#FFD1E3] font-medium truncate">
                  Today: Baby kicks active
                </span>
                <span className="px-2 py-1 rounded-lg text-[9px] font-bold text-white bg-gradient-to-r from-[#FF3EA5] to-[#C13CFF] shadow-[0_0_8px_rgba(255,62,165,0.5)] shrink-0">
                  Check-in →
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#FCA5C6]">
            <span>Radiant cyber-maternal warmth</span>
            <span className="font-mono text-[10px] text-white font-bold">Tap to Preview</span>
          </div>
        </button>
      </div>

      {/* 2. Dark / Light Mode Switch (Below the cards) */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] flex items-center justify-center text-[var(--mc-primary)]">
            {colorMode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--mc-text-primary)] block">
              Display Mode
            </span>
            <span className="text-[10px] text-[var(--mc-text-muted)] font-mono">
              {colorMode === 'dark' ? 'Dark Futuristic Glow (Default)' : 'Clean High-Contrast Light'}
            </span>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)]">
          <button
            type="button"
            onClick={() => handleSelectMode('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              colorMode === 'dark'
                ? 'bg-[var(--mc-btn-gradient)] text-white shadow-xs'
                : 'text-[var(--mc-text-muted)] hover:text-[var(--mc-text-primary)]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
            {colorMode === 'dark' && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              colorMode === 'light'
                ? 'bg-[var(--mc-btn-gradient)] text-white shadow-xs'
                : 'text-[var(--mc-text-muted)] hover:text-[var(--mc-text-primary)]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
            {colorMode === 'light' && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* 3. Explicit User-Requested Ethical Note */}
      <div className="p-3 rounded-2xl bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] flex items-start gap-2.5 text-xs text-[var(--mc-text-secondary)]">
        <Info className="w-4 h-4 text-[var(--mc-primary)] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-[var(--mc-text-primary)] block mb-0.5">
            Color Preference Only
          </span>
          This only changes colors. It has nothing to do with your baby's sex, and MomCare never asks for or shows it.
        </p>
      </div>
    </div>
  );
};
