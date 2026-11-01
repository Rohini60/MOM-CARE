import React from 'react';
import {
  Home,
  Sparkles,
  Users,
  User,
  HeartPulse,
  Activity,
  FileText,
  Stethoscope,
  BookOpen,
  MessageCircle,
  Phone,
  LogOut,
  Globe,
  ChevronRight,
  FolderLock,
} from 'lucide-react';
import { useTranslation, type Language } from '../translations';
import type { UserProfile } from '../types';
import { ThemeQuickToggle } from './ThemeQuickToggle';
import { MomCareLogo } from './MomCareLogo';

export type DesktopNavTarget =
  | 'home'
  | 'vitals'
  | 'vault'
  | 'checkin'
  | 'baby'
  | 'ask'
  | 'reports'
  | 'doctor_summary'
  | 'circle'
  | 'learn'
  | 'profile';

interface DesktopSidebarProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  activeTarget: DesktopNavTarget;
  onNavigate: (target: DesktopNavTarget) => void;
  onOpenAiChat: () => void;
  onOpenEmergency: () => void;
  onLogout: () => void;
  isDemoMode?: boolean;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  profile,
  pregnancyWeek,
  activeTarget,
  onNavigate,
  onOpenAiChat,
  onOpenEmergency,
  onLogout,
  isDemoMode = false,
}) => {
  const { language, setLanguage, t } = useTranslation();

  const motherName = profile?.preferredName || profile?.displayName || 'Mom';
  const babyNickname = profile?.babyNickname || t.yourBaby;

  const menuItems = [
    { id: 'home' as DesktopNavTarget, label: t.navHome, icon: Home },
    { id: 'vault' as DesktopNavTarget, label: 'Health Vault', icon: FolderLock, badge: 'Lock' },
    { id: 'vitals' as DesktopNavTarget, label: 'Vitals Check', icon: HeartPulse, badge: 'ML' },
    { id: 'checkin' as DesktopNavTarget, label: t.navDailyCheckin, icon: Activity },
    { id: 'baby' as DesktopNavTarget, label: t.navBabyDev, icon: Sparkles },
    { id: 'ask' as DesktopNavTarget, label: t.navAskMomCare, icon: MessageCircle, badge: 'AI' },
    { id: 'reports' as DesktopNavTarget, label: t.navReports, icon: FileText },
    { id: 'doctor_summary' as DesktopNavTarget, label: t.navDoctorSummary, icon: Stethoscope },
    { id: 'circle' as DesktopNavTarget, label: t.navCommunity, icon: Users },
    { id: 'learn' as DesktopNavTarget, label: t.navLearn, icon: BookOpen },
    { id: 'profile' as DesktopNavTarget, label: t.navProfile, icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-[var(--mc-surface)] border-r border-[var(--mc-card-border)] h-screen sticky top-0 z-30 select-none shadow-xl">
      {/* Brand & User Profile Card */}
      <div className="p-5 border-b border-[var(--mc-card-border)] bg-[var(--mc-surface)] relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--mc-primary)]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <MomCareLogo size="md" showText={false} />
            <div>
              <span className="font-black text-lg text-[var(--mc-text-primary)] tracking-tight block leading-tight neon-text-glow">
                Mom<span className="text-[var(--mc-primary)] drop-shadow-[0_0_8px_var(--mc-primary-glow)]">Care</span>
              </span>
              <span className="text-[10px] text-[var(--mc-text-secondary)] font-mono tracking-widest uppercase">
                AI Cyber-Companion
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--mc-chip-bg)] text-[var(--mc-text-primary)] border border-[var(--mc-chip-border)] shadow-xs">
            Wk {pregnancyWeek}
          </span>
        </div>

        {/* User Mini Profile */}
        <div className="p-3 rounded-2xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] shadow-inner flex items-center justify-between relative z-10 backdrop-blur-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={motherName}
                className="w-8 h-8 rounded-xl object-cover border border-[var(--mc-primary)]/50 shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[var(--mc-btn-gradient)] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {motherName.charAt(0) || 'M'}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-xs text-[var(--mc-text-primary)] truncate">{motherName}</p>
              <p className="text-[11px] text-[var(--mc-text-muted)] truncate font-mono">Baby: {babyNickname}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0" title="Companion Active">
            <span className="w-2 h-2 rounded-full bg-[#10E599] shadow-[0_0_6px_#10E599] animate-pulse" />
            <span className="text-[9px] font-mono text-[#10E599]">ONLINE</span>
          </div>
        </div>

        {isDemoMode && (
          <div className="mt-2 text-center relative z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2D1C08] border border-[#FFB300]/50 text-[#FFB300] shadow-[0_0_8px_rgba(255,179,0,0.25)]">
              Judges / Demo Mode
            </span>
          </div>
        )}
      </div>

      {/* Emergency Always-Visible Call Button (Safety Rule 5 - Never Changes Color) */}
      <div className="px-4 pt-3.5 pb-1.5">
        <button
          type="button"
          onClick={onOpenEmergency}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF003C] to-[#C4002D] hover:from-[#FF1A4D] hover:to-[#E00034] text-white text-xs font-bold shadow-[0_0_16px_rgba(255,0,60,0.55)] flex items-center justify-center gap-2 transition-all active:scale-98 border border-[#FF8099]/40 cursor-pointer"
        >
          <Phone className="w-4 h-4 fill-current animate-pulse text-white" />
          <span className="tracking-wide font-mono">🔴 {t.callAmbulanceBtn}</span>
        </button>
      </div>

      {/* Navigation Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTarget === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'ask') {
                  onOpenAiChat();
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-[var(--mc-chip-bg)] text-[var(--mc-text-primary)] border border-[var(--mc-primary)] shadow-[0_0_12px_var(--mc-primary-glow)] font-bold'
                  : 'text-[var(--mc-text-secondary)] hover:bg-[var(--mc-chip-bg)] hover:text-[var(--mc-text-primary)] hover:border hover:border-[var(--mc-card-border)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[var(--mc-primary)] drop-shadow-[0_0_6px_var(--mc-primary-glow)]' : 'text-[var(--mc-text-muted)] group-hover:text-[var(--mc-primary)]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge ? (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-extrabold bg-[var(--mc-btn-gradient)] text-white shadow-xs">
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-[var(--mc-primary)]" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer: Quick Theme Toggle, Language Switcher and Log Out */}
      <div className="p-4 border-t border-[var(--mc-card-border)] space-y-2.5 bg-[var(--mc-surface)]">
        {/* Quick Theme & Mode Switcher */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-[var(--mc-text-secondary)] mb-1 font-mono">
            <span>Look & Mode</span>
          </div>
          <ThemeQuickToggle profile={profile} className="w-full justify-between" />
        </div>

        {/* Language switcher */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--mc-text-secondary)] mb-1 font-mono">
            <Globe className="w-3.5 h-3.5 text-[var(--mc-primary)]" />
            <span>Language</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-[var(--mc-chip-bg)] p-1 rounded-xl border border-[var(--mc-chip-border)]">
            {[
              { code: 'en' as Language, label: 'EN' },
              { code: 'ta' as Language, label: 'தமிழ்' },
              { code: 'hi' as Language, label: 'हिन्दी' },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === lang.code
                    ? 'bg-[var(--mc-btn-gradient)] text-white shadow-xs'
                    : 'text-[var(--mc-text-muted)] hover:text-[var(--mc-text-primary)]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Log Out button */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2 px-3 rounded-xl border border-[var(--mc-card-border)] hover:border-[#FF003C] text-[var(--mc-text-muted)] hover:text-[#FF003C] text-xs font-semibold hover:bg-[#FF003C]/10 transition-all flex items-center justify-center gap-1.5 font-mono cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.logoutBtn}</span>
        </button>
      </div>
    </aside>
  );
};
