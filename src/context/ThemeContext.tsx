import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppTheme, ColorMode } from '../types';
import { updateUserProfile } from '../services/firebase/userService';

interface ThemeContextType {
  theme: AppTheme;
  colorMode: ColorMode;
  setTheme: (theme: AppTheme) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleTheme: () => void;
  toggleColorMode: () => void;
  // Modal & Toast Controls
  isThemeModalOpen: boolean;
  openThemeModal: () => void;
  closeThemeModal: () => void;
  toastMessage: string | null;
  showToast: (msg?: string) => void;
  setThemeAndSave: (theme: AppTheme, profileId?: string) => void;
  setColorModeAndSave: (mode: ColorMode, profileId?: string) => void;
  // Dynamic color tokens for canvases, charts, and SVG illustrations
  colors: {
    primary: string;
    primaryAccent: string;
    primaryGlow: string;
    bg: string;
    surface: string;
    card: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    chipBg: string;
    chipBorder: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_THEME_KEY = 'momcare_theme';
const STORAGE_MODE_KEY = 'momcare_color_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize from localStorage or defaults (Default: Neon Pink & Dark)
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'neon-blue' || saved === 'neon-pink') return saved;
    } catch {}
    return 'neon-pink';
  });

  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MODE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = React.useRef<any>(null);

  const showToast = useCallback((msg = 'Theme changed ✓') => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  const openThemeModal = useCallback(() => setIsThemeModalOpen(true), []);
  const closeThemeModal = useCallback(() => setIsThemeModalOpen(false), []);

  // Apply to DOM attribute instantly with smooth 300ms CSS transitions
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', colorMode);

    if (colorMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
      localStorage.setItem(STORAGE_MODE_KEY, colorMode);
    } catch {}
  }, [theme, colorMode]);

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
    } catch {}
    showToast('Theme changed ✓');
  }, [showToast]);

  const setColorMode = useCallback((newMode: ColorMode) => {
    setColorModeState(newMode);
    try {
      localStorage.setItem(STORAGE_MODE_KEY, newMode);
    } catch {}
    showToast('Theme changed ✓');
  }, [showToast]);

  const setThemeAndSave = useCallback((newTheme: AppTheme, profileId?: string) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
    } catch {}
    if (profileId) {
      updateUserProfile(profileId, { theme: newTheme }).catch(() => {});
    }
    showToast('Theme changed ✓');
  }, [showToast]);

  const setColorModeAndSave = useCallback((newMode: ColorMode, profileId?: string) => {
    setColorModeState(newMode);
    try {
      localStorage.setItem(STORAGE_MODE_KEY, newMode);
    } catch {}
    if (profileId) {
      updateUserProfile(profileId, { colorMode: newMode }).catch(() => {});
    }
    showToast('Theme changed ✓');
  }, [showToast]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'neon-pink' ? 'neon-blue' : 'neon-pink';
      try {
        localStorage.setItem(STORAGE_THEME_KEY, next);
      } catch {}
      showToast('Theme changed ✓');
      return next;
    });
  }, [showToast]);

  const toggleColorMode = useCallback(() => {
    setColorModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_MODE_KEY, next);
      } catch {}
      showToast('Theme changed ✓');
      return next;
    });
  }, [showToast]);

  // Live computed color tokens (exact palette as specified)
  const isDark = colorMode === 'dark';
  const isBlue = theme === 'neon-blue';

  const colors = {
    // Neon Blue: Main #00D4FF, Accent #2F6BFF
    // Neon Pink: Main #FF3EA5, Accent #C13CFF (with #FF1A75 compatibility)
    primary: isBlue ? '#00D4FF' : '#FF3EA5',
    primaryAccent: isBlue ? '#2F6BFF' : '#C13CFF',
    primaryGlow: isBlue ? 'rgba(0, 212, 255, 0.45)' : 'rgba(255, 62, 165, 0.45)',

    // Backgrounds
    bg: isDark
      ? isBlue
        ? '#0A1128' // Neon Blue Dark
        : '#1A0B1F' // Neon Pink Dark
      : isBlue
      ? '#F2F8FF' // Neon Blue Light
      : '#FFF3FA', // Neon Pink Light

    // Cards / Surfaces
    surface: isDark
      ? isBlue
        ? '#0D1736'
        : '#1F0E25'
      : '#FFFFFF',

    card: isDark
      ? isBlue
        ? '#111C3D' // Neon Blue Dark Card
        : '#26112D' // Neon Pink Dark Card
      : '#FFFFFF', // Light mode white card

    cardBorder: isDark
      ? isBlue
        ? 'rgba(0, 212, 255, 0.28)'
        : 'rgba(255, 62, 165, 0.28)'
      : isBlue
      ? '#D0E4FF'
      : '#FADADD',

    // Body Text: WCAG AA Compliant
    textPrimary: isDark
      ? isBlue
        ? '#E8F1FF'
        : '#FFF0F6'
      : isBlue
      ? '#0A1128' // Deep navy
      : '#2A0F2A', // Deep plum

    textSecondary: isDark
      ? isBlue
        ? '#B0C8FF'
        : '#E3BCCC'
      : isBlue
      ? '#2D3E6B'
      : '#5E295E',

    textMuted: isDark
      ? isBlue
        ? '#7088B8'
        : '#A38495'
      : isBlue
      ? '#556A99'
      : '#83577D',

    chipBg: isDark
      ? isBlue
        ? '#14224A'
        : '#2E1536'
      : isBlue
      ? '#E1EFFF'
      : '#FDE7F4',

    chipBorder: isDark
      ? isBlue
        ? 'rgba(0, 212, 255, 0.4)'
        : 'rgba(255, 62, 165, 0.4)'
      : isBlue
      ? 'rgba(0, 160, 220, 0.35)'
      : 'rgba(219, 39, 119, 0.35)',
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorMode,
        setTheme,
        setColorMode,
        toggleTheme,
        toggleColorMode,
        isThemeModalOpen,
        openThemeModal,
        closeThemeModal,
        toastMessage,
        showToast,
        setThemeAndSave,
        setColorModeAndSave,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
