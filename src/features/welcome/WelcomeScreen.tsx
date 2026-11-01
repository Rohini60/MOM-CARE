import { HeartPulse, Sparkles, ArrowRight, Globe } from 'lucide-react';
import { useTranslation, type Language } from '../../translations';
import { MomCareLogo } from '../../components/MomCareLogo';

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
    <div className="min-h-screen bg-[var(--mc-bg)] text-[var(--mc-text-primary)] flex items-center justify-center p-0 lg:p-8 font-sans cyber-grid-pattern relative overflow-hidden transition-colors duration-300">
      {/* Background ambient futuristic glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--mc-primary)]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--mc-primary-accent)]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Container: Single column on mobile/tablet; Two-panel layout on desktop (>=1024px) */}
      <div className="w-full max-w-5xl bg-[var(--mc-surface)]/90 backdrop-blur-xl lg:rounded-[36px] border border-[var(--mc-card-border)] shadow-[var(--mc-glow)] overflow-hidden min-h-screen lg:min-h-[640px] flex flex-col lg:flex-row relative z-10 transition-colors duration-300">
        
        {/* LEFT PANEL */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-[var(--mc-surface-elevated)] via-[var(--mc-surface)] to-[var(--mc-bg)] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--mc-card-border)]">
          {/* Ambient blur orbs */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ background: 'radial-gradient(circle, var(--mc-primary) 0%, var(--mc-primary-accent) 50%, transparent 80%)' }}
          />

          {/* Top Language Switcher Bar on Mobile & Desktop */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MomCareLogo size="sm" showText={false} />
              <span className="font-black text-lg text-[var(--mc-text-primary)] tracking-tight neon-text-glow leading-none">
                Mom<span className="text-[var(--mc-primary)] drop-shadow-[0_0_8px_var(--mc-primary-glow)]">Care</span>
              </span>
            </div>

            {/* Language Switch */}
            <div className="flex items-center gap-1 bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] p-1 rounded-2xl shadow-inner">
              <Globe className="w-3.5 h-3.5 text-[var(--mc-primary)] ml-1 mr-0.5" />
              {(['en', 'ta', 'hi'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-[var(--mc-btn-gradient)] text-white shadow-xs'
                      : 'text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)]'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}
                </button>
              ))}
            </div>
          </div>

          {/* Central Hero Branding & Tagline */}
          <div className="relative z-10 my-auto py-10 lg:py-6">
            <div className="mb-4">
              <MomCareLogo size="lg" showText={false} />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] text-xs font-mono font-semibold text-[var(--mc-text-primary)] mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[var(--mc-primary)]" />
              <span>NEXT-GEN MATERNAL INTELLIGENCE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--mc-text-primary)] tracking-tight leading-tight">
              Mom<span className="text-[var(--mc-primary)] drop-shadow-[0_0_12px_var(--mc-primary-glow)]">Care</span>
            </h1>

            <p className="text-base sm:text-lg font-bold text-[var(--mc-text-secondary)] mt-2">
              {t.tagline}
            </p>
            <p className="text-xs sm:text-sm text-[var(--mc-text-muted)] mt-3 max-w-sm leading-relaxed">
              {t.welcomeSubtitle}
            </p>

            {/* Desktop feature bullets */}
            <div className="hidden lg:flex flex-col gap-3 mt-8 text-xs font-semibold text-[var(--mc-text-secondary)]">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#10E599]/20 border border-[#10E599]/50 flex items-center justify-center text-[#10E599] text-[11px] shadow-[0_0_6px_#10E599]">✓</div>
                <span>Personal AI companion calibrated to your week and check-ins</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#10E599]/20 border border-[#10E599]/50 flex items-center justify-center text-[#10E599] text-[11px] shadow-[0_0_6px_#10E599]">✓</div>
                <span>Zero-delay clinical emergency triage running without network blocks</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#10E599]/20 border border-[#10E599]/50 flex items-center justify-center text-[#10E599] text-[11px] shadow-[0_0_6px_#10E599]">✓</div>
                <span>Multilingual support in English, எளிய தமிழ், and सरल हिन्दी</span>
              </div>
            </div>
          </div>

          {/* 3 Reassuring Micro-Badges */}
          <div className="relative z-10 flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
            <span className="px-3 py-1 rounded-full bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] text-[11px] font-mono text-[var(--mc-text-secondary)]">
              {t.evidenceGrounded}
            </span>
            <span className="px-3 py-1 rounded-full bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] text-[11px] font-mono text-[var(--mc-text-secondary)]">
              {t.privateSecure}
            </span>
            <span className="px-3 py-1 rounded-full bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] text-[11px] font-mono text-[var(--mc-text-secondary)]">
              {t.triageProtocol}
            </span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center bg-[var(--mc-bg)]">
          <div className="w-full max-w-[440px] space-y-5 bg-[var(--mc-card)] backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[var(--mc-card-border)] shadow-[var(--mc-glow)]">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[var(--mc-text-primary)]">
                Welcome to MomCare
              </h2>
              <p className="text-xs text-[var(--mc-text-secondary)]">
                Sign in to access your personal pregnancy companion
              </p>
            </div>

            {/* Action Buttons Section */}
            <div className="space-y-3 pt-2">
              {/* Create Account Button */}
              <button
                type="button"
                onClick={onCreateAccount}
                className="w-full py-4 px-6 rounded-2xl cyber-gradient-btn active:scale-[0.99] text-white text-base font-bold transition-all flex items-center justify-center gap-2 min-h-[48px] border border-white/20 cursor-pointer"
              >
                <span>{t.createAccount}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Log In Button */}
              <button
                type="button"
                onClick={onLogin}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--mc-chip-bg)] hover:bg-[var(--mc-surface-elevated)] active:scale-[0.99] border border-[var(--mc-card-border)] text-[var(--mc-text-primary)] text-base font-bold shadow-sm transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
              >
                <span>{t.login}</span>
              </button>
            </div>

            {/* Discreet Judges / Demo Access Link */}
            <div className="pt-4 border-t border-[var(--mc-card-border)] text-center">
              <button
                type="button"
                onClick={onEnterDemo}
                className="text-[12px] font-mono text-[var(--mc-text-secondary)] hover:text-[var(--mc-primary)] transition-colors underline underline-offset-4 decoration-[var(--mc-primary)]/40 hover:decoration-[var(--mc-primary)] flex items-center justify-center gap-1.5 mx-auto min-h-[40px] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--mc-primary)]" />
                <span>{t.judgesDemo}</span>
              </button>
              <p className="text-[10px] text-[var(--mc-text-muted)] mt-1 font-mono">
                {t.demoSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
