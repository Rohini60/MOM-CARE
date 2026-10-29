import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import type { UserProfile } from '../types';
import { updateUserProfile } from '../services/firebase/userService';

interface ThemeQuickToggleProps {
  profile?: UserProfile | null;
  className?: string;
}

export const ThemeQuickToggle: React.FC<ThemeQuickToggleProps> = ({ profile, className = '' }) => {
  const { theme, colorMode, toggleTheme, toggleColorMode } = useTheme();

  const handleToggleTheme = () => {
    const nextTheme = theme === 'neon-pink' ? 'neon-blue' : 'neon-pink';
    toggleTheme();
    if (profile?.id) {
      updateUserProfile(profile.id, { theme: nextTheme });
    }
  };

  const handleToggleMode = () => {
    const nextMode = colorMode === 'dark' ? 'light' : 'dark';
    toggleColorMode();
    if (profile?.id) {
      updateUserProfile(profile.id, { colorMode: nextMode });
    }
  };

  return (
    <div className={`flex items-center gap-1.5 p-1 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] shadow-xs ${className}`}>
      {/* 💙 / 💗 Theme Switcher */}
      <button
        type="button"
        onClick={handleToggleTheme}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)]"
        title={`Current: ${theme === 'neon-pink' ? 'Neon Pink' : 'Neon Blue'}. Click to switch theme.`}
        aria-label="Toggle theme color"
      >
        <span className="text-sm">{theme === 'neon-pink' ? '💗' : '💙'}</span>
        <span className="hidden md:inline font-mono text-[10px] text-[var(--mc-text-primary)]">
          {theme === 'neon-pink' ? 'Pink' : 'Blue'}
        </span>
      </button>

      {/* 🌙 / ☀️ Dark/Light Mode Switcher */}
      <button
        type="button"
        onClick={handleToggleMode}
        className="p-1.5 rounded-lg text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer text-[var(--mc-text-primary)] hover:bg-[var(--mc-chip-bg)]"
        title={`Current: ${colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}. Click to switch.`}
        aria-label="Toggle dark/light mode"
      >
        {colorMode === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-[var(--mc-primary)]" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </button>
    </div>
  );
};
