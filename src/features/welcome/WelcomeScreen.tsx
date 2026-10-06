import React from 'react';
import { HeartPulse, Sparkles, ShieldCheck, ArrowRight, UserCheck, Globe } from 'lucide-react';
import { useTranslation, type Language } from '../../translations';

interface WelcomeScreenProps {
  onCreateAccount: () => void;
  onLogin: () => void;
  onEnterDemo: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCreateAccount,
  onLogin,
  onEnterDemo,
}) => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FCF8F6] text-[#352F35] flex flex-col justify-between px-6 py-8 max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Background Soft Aura Orbs */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-45"
        style={{ background: 'radial-gradient(circle, #F2E1E3 0%, #C98291 50%, transparent 80%)' }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle, #EFEBF4 0%, #B7A6C9 50%, transparent 80%)' }}
      />

      {/* Top Language Switcher Bar */}
      <div className="relative z-10 flex justify-end">
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xs border border-[#E9DFDC] p-1 rounded-2xl shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-[#9F5F6E] ml-1.5 mr-0.5" />
          {(['en', 'ta', 'hi'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                language === lang
                  ? 'bg-[#9F5F6E] text-white shadow-2xs'
                  : 'text-[#766D72] hover:text-[#352F35]'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}
            </button>
          ))}
        </div>
      </div>

      {/* Branding Section */}
      <div className="relative z-10 pt-4 sm:pt-8 flex flex-col items-center text-center">
        {/* MomCare Animated Emblem */}
        <div className="relative mb-5">
          <div className="w-22 h-22 rounded-3xl bg-gradient-to-tr from-[#F2E1E3] via-[#FCF8F6] to-[#FFF0F5] border-2 border-[#E9DFDC] shadow-md flex items-center justify-center text-[#9F5F6E] transition-transform duration-500 hover:scale-105">
            <HeartPulse className="w-11 h-11 stroke-[2.2] text-[#9F5F6E] animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-[#9F5F6E] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Safe Care</span>
          </div>
        </div>

        {/* Title & One-Line Tagline */}
        <h1 className="text-3xl sm:text-4xl font-black text-[#352F35] tracking-tight">
          {t.appName}
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#9F5F6E] mt-2 max-w-xs">
          {t.tagline}
        </p>

        <p className="text-xs text-[#766D72] mt-3 max-w-[290px] leading-relaxed">
          {t.welcomeSubtitle}
        </p>

        {/* 3 Reassuring Micro-Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <span className="px-3 py-1 rounded-full bg-white border border-[#E9DFDC] text-[11px] font-semibold text-[#766D72] shadow-2xs">
            {t.evidenceGrounded}
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-[#E9DFDC] text-[11px] font-semibold text-[#766D72] shadow-2xs">
            {t.privateSecure}
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-[#E9DFDC] text-[11px] font-semibold text-[#766D72] shadow-2xs">
            {t.triageProtocol}
          </span>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="relative z-10 w-full space-y-3 pt-8 pb-4">
        {/* Create Account Button */}
        <button
          onClick={onCreateAccount}
          className="w-full py-4 px-6 rounded-2xl bg-[#9F5F6E] hover:bg-[#8F525F] active:scale-[0.99] text-white text-base font-bold shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>{t.createAccount}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Log In Button */}
        <button
          onClick={onLogin}
          className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-[#F2E1E3] active:scale-[0.99] border-2 border-[#E9DFDC] text-[#352F35] text-base font-bold shadow-2xs transition-all flex items-center justify-center gap-2"
        >
          <span>{t.login}</span>
        </button>

        {/* Discreet Judges / Demo Access Link */}
        <div className="pt-4 text-center">
          <button
            onClick={onEnterDemo}
            className="text-[12px] font-medium text-[#766D72] hover:text-[#9F5F6E] transition-colors underline underline-offset-4 decoration-[#E9DFDC] hover:decoration-[#9F5F6E] flex items-center justify-center gap-1.5 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C98291]" />
            <span>{t.judgesDemo}</span>
          </button>
          <p className="text-[10px] text-[#A2969C] mt-1">
            {t.demoSubtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
