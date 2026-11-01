import React from 'react';
import { Home, Sparkles, Users, CalendarCheck2, User, HeartPulse, HelpCircle, Presentation, Phone } from 'lucide-react';
import { useTranslation, type Language } from '../translations';
import type { UserProfile } from '../types';
import { MomCareLogo } from './MomCareLogo';

export type TabType = 'home' | 'pregnancy' | 'community' | 'care' | 'profile';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAiChat: () => void;
  onOpenDemo: () => void;
  pregnancyWeek?: number;
}

export const BottomNavigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pregnancyWeek = 24,
}) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'pregnancy', label: t.navPregnancy, icon: Sparkles },
    { id: 'care', label: t.navCare, icon: CalendarCheck2 },
    { id: 'community', label: t.navCommunity, icon: Users },
    { id: 'profile', label: t.navProfile, icon: User },
  ] as const;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--mc-surface)]/95 backdrop-blur-md border-t border-[var(--mc-card-border)] safe-area-bottom shadow-lg shadow-black/40">
      <div className="max-w-md mx-auto px-3 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-[var(--mc-primary)]' : 'text-[var(--mc-text-muted)] hover:text-[var(--mc-text-secondary)]'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label={tab.label}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'scale-110 bg-[var(--mc-chip-bg)] border border-[var(--mc-primary)] shadow-[0_0_12px_var(--mc-primary-glow)]'
                    : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-[var(--mc-primary)]' : 'stroke-[2]'}`} />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  isActive ? 'font-bold text-[var(--mc-text-primary)]' : 'text-[var(--mc-text-muted)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const TopAppBar: React.FC<{
  title?: string;
  pregnancyWeek?: number;
  profile?: UserProfile | null;
  onOpenAiChat: () => void;
  onOpenDemo: () => void;
  onOpenPresentation?: () => void;
  onOpenEmergency?: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  isDemoMode?: boolean;
  onExitDemo?: () => void;
  onLanguageChange?: (lang: Language) => void;
}> = ({
  pregnancyWeek = 24,
  profile,
  onOpenAiChat,
  onOpenDemo,
  onOpenPresentation,
  onOpenEmergency,
  isDemoMode = false,
  onExitDemo,
  onLanguageChange,
}) => {
  const { language, setLanguage, t } = useTranslation();

  const handleLangSelect = (lang: Language) => {
    setLanguage(lang);
    if (onLanguageChange) onLanguageChange(lang);
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--mc-surface)]/95 backdrop-blur-md border-b border-[var(--mc-card-border)] px-4 py-2.5">
      {/* Demo Evaluation Mode Notice Banner */}
      {isDemoMode && (
        <div className="max-w-md mx-auto mb-1.5 px-3 py-1 rounded-xl bg-[#2A1B0D] border border-[#FFB300]/50 flex items-center justify-between text-[11px] shadow-[0_0_10px_rgba(255,179,0,0.2)]">
          <span className="font-bold text-[#FFB300] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB300] animate-pulse" />
            <span>Judges / Demo Telemetry Mode</span>
          </span>
          {onExitDemo && (
            <button
              onClick={onExitDemo}
              className="text-[var(--mc-primary)] hover:underline font-bold transition-colors"
            >
              Exit to App →
            </button>
          )}
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* MomCare Best Maternal Logo & Brand Title */}
        <div className="flex items-center gap-3">
          <MomCareLogo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-[var(--mc-text-primary)] tracking-tight neon-text-glow leading-none">
                Mom<span className="text-[var(--mc-primary)] drop-shadow-[0_0_8px_var(--mc-primary-glow)]">Care</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] text-[var(--mc-text-primary)] shadow-xs">
                Wk {pregnancyWeek}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Always Visible Emergency Call Button (Safety Rule 5 - Never Changes Color) */}
          {onOpenEmergency && (
            <button
              type="button"
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF003C] to-[#C4002D] hover:from-[#FF1A4D] hover:to-[#E00034] text-white text-xs font-bold transition-all shadow-[0_0_14px_rgba(255,0,60,0.6)] active:scale-95 border border-[#FF8099]/30 cursor-pointer"
              title="Emergency / Call Ambulance"
            >
              <Phone className="w-3.5 h-3.5 fill-current animate-pulse text-white" />
              <span className="hidden sm:inline font-mono">🔴 {t.callAmbulanceBtn}</span>
            </button>
          )}

          {/* Language Switcher in Top Bar */}
          <div className="flex rounded-xl bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] p-0.5 text-[10px] font-bold shadow-inner">
            {(['en', 'ta', 'hi'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangSelect(lang)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  language === lang
                    ? 'bg-[var(--mc-btn-gradient)] text-white font-extrabold shadow-xs'
                    : 'text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)]'
                }`}
                title={`Switch to ${lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}`}
              >
                {lang === 'en' ? 'EN' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}
              </button>
            ))}
          </div>

          {/* Only show Slides and Demo buttons in Demo Mode for Judges */}
          {isDemoMode && (
            <>
              {onOpenPresentation && (
                <button
                  onClick={onOpenPresentation}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--mc-card-border)] bg-[var(--mc-surface)] text-[var(--mc-text-secondary)] text-xs font-semibold hover:border-[var(--mc-primary)] transition-colors shadow-sm"
                  title="Open 15-Slide Presentation Deck"
                >
                  <Presentation className="w-3.5 h-3.5 text-[var(--mc-primary)]" />
                  <span className="hidden sm:inline">Slides</span>
                </button>
              )}

              <button
                onClick={onOpenDemo}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--mc-card-border)] bg-[var(--mc-surface)] text-[var(--mc-text-secondary)] text-xs font-semibold hover:border-[var(--mc-primary)] transition-colors shadow-sm"
                title="Open Demo Scenarios (Routine, Yellow, Urgent)"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[var(--mc-primary)]" />
                <span className="hidden sm:inline">Demo</span>
              </button>
            </>
          )}

          {/* Ask MomCare Quick Action */}
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl cyber-gradient-btn text-white text-xs font-bold border border-white/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{t.askMomCareBtn}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
