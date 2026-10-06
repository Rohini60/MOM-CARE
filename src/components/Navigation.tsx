import React from 'react';
import { Home, Sparkles, Users, CalendarCheck2, User, HeartPulse, HelpCircle, Presentation, Globe } from 'lucide-react';
import { useTranslation, type Language } from '../translations';

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
  onOpenAiChat,
  onOpenDemo,
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t border-[#F5EBEF] safe-area-bottom">
      <div className="max-w-md mx-auto px-3 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-[#9F5F6E]' : 'text-[#766D72] hover:text-[#352F35]'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label={tab.label}
            >
              <div className={`p-1 rounded-full transition-transform ${isActive ? 'scale-110 bg-[#F2E1E3]' : ''}`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`text-[11px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-bold' : ''}`}>
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
  onOpenAiChat: () => void;
  onOpenDemo: () => void;
  onOpenPresentation?: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  isDemoMode?: boolean;
  onExitDemo?: () => void;
  onLanguageChange?: (lang: Language) => void;
}> = ({
  title,
  pregnancyWeek = 24,
  onOpenAiChat,
  onOpenDemo,
  onOpenPresentation,
  isPhoneFrame,
  onTogglePhoneFrame,
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
    <header className="sticky top-0 z-30 bg-[#FCF8F6]/95 backdrop-blur-xs border-b border-[#E9DFDC] px-4 py-2">
      {/* Demo Evaluation Mode Notice Banner */}
      {isDemoMode && (
        <div className="max-w-md mx-auto mb-1.5 px-3 py-1 rounded-xl bg-[#FAF3E8] border border-[#CF9B48]/40 flex items-center justify-between text-[11px]">
          <span className="font-bold text-[#CF9B48] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Judges / Demo Evaluation Mode</span>
          </span>
          {onExitDemo && (
            <button
              onClick={onExitDemo}
              className="text-[#9F5F6E] hover:underline font-bold"
            >
              Exit to App →
            </button>
          )}
        </div>
      )}

      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#F2E1E3] flex items-center justify-center text-[#9F5F6E] shadow-2xs">
            <HeartPulse className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-[#352F35] tracking-tight">MomCare</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F2E1E3] border border-[#E9DFDC] text-[#9F5F6E]">
                Wk {pregnancyWeek}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Switcher in Top Bar (Part 2 requirement) */}
          <div className="flex rounded-xl bg-white border border-[#E9DFDC] p-0.5 text-[10px] font-bold shadow-2xs">
            {(['en', 'ta', 'hi'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangSelect(lang)}
                className={`px-1.5 py-1 rounded-lg transition-all ${
                  language === lang
                    ? 'bg-[#9F5F6E] text-white shadow-2xs font-extrabold'
                    : 'text-[#766D72] hover:text-[#352F35]'
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
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[#E9DFDC] bg-white text-[#9F5F6E] text-xs font-semibold hover:bg-[#F2E1E3] transition-colors shadow-2xs"
                  title="Open 15-Slide Presentation Deck"
                >
                  <Presentation className="w-3.5 h-3.5 text-[#C98291]" />
                  <span className="hidden sm:inline">Slides</span>
                </button>
              )}

              <button
                onClick={onOpenDemo}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[#E9DFDC] bg-white text-[#352F35] text-xs font-semibold hover:bg-[#F2E1E3] transition-colors shadow-2xs"
                title="Open Demo Scenarios (Routine, Yellow, Urgent)"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#766D72]" />
                <span className="hidden sm:inline">Demo</span>
              </button>
            </>
          )}

          {/* Ask MomCare Quick Action */}
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#9F5F6E] text-[#FFFFFF] text-xs font-semibold hover:bg-[#8F525F] transition-colors shadow-2xs"
          >
            <Sparkles className="w-3 h-3" />
            <span>{t.askMomCareBtn}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
