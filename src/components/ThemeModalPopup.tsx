import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Check, X, Moon, Sun, Info, Sparkles } from 'lucide-react';
import type { UserProfile } from '../types';

interface ThemeModalPopupProps {
  profile?: UserProfile | null;
}

export const ThemeModalPopup: React.FC<ThemeModalPopupProps> = ({ profile }) => {
  const {
    theme,
    colorMode,
    isThemeModalOpen,
    closeThemeModal,
    setThemeAndSave,
    setColorModeAndSave,
  } = useTheme();

  if (!isThemeModalOpen) return null;

  const handleSelectTheme = (selectedTheme: 'neon-blue' | 'neon-pink') => {
    setThemeAndSave(selectedTheme, profile?.id);
    closeThemeModal();
  };

  const handleSelectMode = (selectedMode: 'dark' | 'light') => {
    setColorModeAndSave(selectedMode, profile?.id);
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={closeThemeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-[var(--mc-surface)] border-2 border-[var(--mc-primary)]/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_var(--mc-primary-glow)] space-y-4.5 relative animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background orb */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--mc-primary)]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-1 border-b border-[var(--mc-card-border)] relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🎨</span>
            <div>
              <h3 id="theme-modal-title" className="font-black text-base text-[var(--mc-text-primary)] tracking-tight">
                Choose your MomCare look
              </h3>
              <p className="text-[11px] text-[var(--mc-text-secondary)] font-mono">
                Instant live switch across the app
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeThemeModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)] hover:bg-[var(--mc-chip-bg)] transition-colors cursor-pointer"
            aria-label="Close theme selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Two Big Theme Buttons */}
        <div className="space-y-3 relative z-10">
          <span className="text-xs font-bold text-[var(--mc-text-secondary)] block uppercase tracking-wider font-mono">
            Select Color Look
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. 💙 Neon Blue Button */}
            <button
              type="button"
              onClick={() => handleSelectTheme('neon-blue')}
              className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between min-h-[96px] cursor-pointer relative overflow-hidden active:scale-98 ${
                theme === 'neon-blue'
                  ? 'border-[#00D4FF] bg-[#111C3D] text-white shadow-[0_0_24px_rgba(0,212,255,0.55)] ring-2 ring-[#00D4FF]/60 font-bold'
                  : 'border-[var(--mc-card-border)] bg-[var(--mc-card)] text-[var(--mc-text-primary)] hover:border-[#00D4FF]/60 hover:bg-[#111C3D]/40'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💙</span>
                  <span className="text-base font-black">Neon Blue</span>
                </div>
                {theme === 'neon-blue' ? (
                  <div className="w-6 h-6 rounded-full bg-[#00D4FF] text-[#0A1128] flex items-center justify-center font-bold shadow-[0_0_10px_#00D4FF]">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-white/30" />
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono opacity-90">
                <span className="text-[#38E1FF]">#00D4FF</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0A1128] border border-[#00D4FF]/40 text-[#D0E8FF]">
                  {theme === 'neon-blue' ? 'CURRENT' : 'Tap to switch'}
                </span>
              </div>
            </button>

            {/* 2. 💗 Neon Pink Button */}
            <button
              type="button"
              onClick={() => handleSelectTheme('neon-pink')}
              className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between min-h-[96px] cursor-pointer relative overflow-hidden active:scale-98 ${
                theme === 'neon-pink'
                  ? 'border-[#FF3EA5] bg-[#26112D] text-white shadow-[0_0_24px_rgba(255,62,165,0.55)] ring-2 ring-[#FF3EA5]/60 font-bold'
                  : 'border-[var(--mc-card-border)] bg-[var(--mc-card)] text-[var(--mc-text-primary)] hover:border-[#FF3EA5]/60 hover:bg-[#26112D]/40'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💗</span>
                  <span className="text-base font-black">Neon Pink</span>
                </div>
                {theme === 'neon-pink' ? (
                  <div className="w-6 h-6 rounded-full bg-[#FF3EA5] text-white flex items-center justify-center font-bold shadow-[0_0_10px_#FF3EA5]">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-white/30" />
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono opacity-90">
                <span className="text-[#FF80BF]">#FF3EA5</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A0B1F] border border-[#FF3EA5]/40 text-[#FFD1E3]">
                  {theme === 'neon-pink' ? 'CURRENT' : 'Tap to switch'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Dark / Light Mode Switch */}
        <div className="p-3 rounded-2xl bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-base">{colorMode === 'dark' ? '🌙' : '☀️'}</span>
            <div>
              <span className="text-xs font-bold text-[var(--mc-text-primary)] block">
                Display Mode
              </span>
              <span className="text-[10px] text-[var(--mc-text-muted)] font-mono">
                {colorMode === 'dark' ? 'Dark Mode (Default)' : 'High Contrast Light'}
              </span>
            </div>
          </div>

          <div className="flex rounded-xl bg-[var(--mc-surface)] p-1 border border-[var(--mc-card-border)]">
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

        {/* Small Note */}
        <div className="p-2.5 rounded-xl bg-[var(--mc-surface-elevated)] border border-[var(--mc-card-border)] flex items-start gap-2 text-[11px] text-[var(--mc-text-secondary)] relative z-10">
          <Info className="w-3.5 h-3.5 text-[var(--mc-primary)] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            This only changes colors. It has nothing to do with your baby's sex, and MomCare never asks for or shows it.
          </p>
        </div>
      </div>
    </div>
  );
};
