import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeModalPopup } from './ThemeModalPopup';
import { CheckCircle2, Sparkles } from 'lucide-react';
import type { UserProfile } from '../types';

interface FloatingThemeButtonProps {
  profile?: UserProfile | null;
}

export const FloatingThemeButton: React.FC<FloatingThemeButtonProps> = ({ profile }) => {
  const { openThemeModal, toastMessage, theme } = useTheme();

  return (
    <>
      {/* Toast Notification: "Theme changed ✓" */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-70 px-4 py-2 rounded-full bg-[var(--mc-surface)] border-2 border-[var(--mc-primary)] text-[var(--mc-text-primary)] font-bold text-xs shadow-[0_0_24px_var(--mc-primary-glow)] flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-[#10E599] shrink-0" />
          <span>{toastMessage}</span>
          <span className="text-[10px] font-mono opacity-80 uppercase">
            ({theme === 'neon-blue' ? 'Neon Blue' : 'Neon Pink'})
          </span>
        </div>
      )}

      {/* Floating Theme Button (always visible on every screen) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 print:hidden pointer-events-auto">
        <button
          type="button"
          onClick={openThemeModal}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-[var(--mc-surface)] border-2 border-[var(--mc-primary)] text-[var(--mc-primary)] shadow-[0_0_20px_var(--mc-primary-glow)] hover:shadow-[0_0_30px_var(--mc-primary-glow)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group relative"
          aria-label="Choose MomCare Look (Neon Blue / Neon Pink)"
          title="Change theme look (Neon Blue / Neon Pink)"
        >
          <span className="text-xl sm:text-2xl drop-shadow-md group-hover:rotate-12 transition-transform">
            🎨
          </span>

          {/* Subtle pulse ring around button */}
          <span className="absolute -inset-1 rounded-full border border-[var(--mc-primary)] opacity-40 animate-ping pointer-events-none" />

          {/* Quick badge */}
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[var(--mc-primary)] text-white shadow-xs font-mono">
            {theme === 'neon-blue' ? 'BLUE' : 'PINK'}
          </span>
        </button>
      </div>

      {/* Modal Popup */}
      <ThemeModalPopup profile={profile} />
    </>
  );
};
