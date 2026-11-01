import React, { useState } from 'react';
import {
  HeartPulse,
  Mail,
  Lock,
  ArrowRight,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import {
  loginWithGoogle,
  loginWithEmail,
  signupWithEmail,
  resetPassword,
} from '../../services/firebase/authService';
import { getUserProfile } from '../../services/firebase/userService';
import { useTranslation } from '../../translations';
import type { UserProfile } from '../../types';
import { MomCareLogo } from '../../components/MomCareLogo';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onAuthenticated: (
    profile: UserProfile | null,
    authUser: { uid: string; email: string }
  ) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onAuthenticated,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Sync mode if changed from outside
  React.useEffect(() => {
    setMode(initialMode);
    setAuthError('');
    setResetSuccess(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleFriendlyError = (code: string) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return t.wrongCredentials;
      case 'auth/user-not-found':
        return t.noAccountFound;
      case 'auth/email-already-in-use':
        return 'An account already exists with this email.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/network-request-failed':
        return t.noInternetNotice;
      default:
        return 'Authentication failed. Please check your details and try again.';
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setAuthError('');
      const user = await loginWithGoogle();
      const existingProfile = await getUserProfile(user.uid);
      onAuthenticated(existingProfile, { uid: user.uid, email: user.email || '' });
      onClose();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setAuthError(handleFriendlyError(err?.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (mode === 'signup' && password !== confirmPassword) {
      setAuthError(t.passwordsMustMatch);
      return;
    }

    try {
      setIsLoading(true);
      setAuthError('');

      if (mode === 'login') {
        const user = await loginWithEmail(email, password);
        const existingProfile = await getUserProfile(user.uid);
        onAuthenticated(existingProfile, { uid: user.uid, email: user.email || '' });
      } else {
        const user = await signupWithEmail(email, password, '');
        // New account: profile does not exist yet
        onAuthenticated(null, { uid: user.uid, email: user.email || '' });
      }
      onClose();
    } catch (err: any) {
      console.error('Email auth error:', err);
      setAuthError(handleFriendlyError(err?.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      setAuthError('');
      await resetPassword(email);
      setResetSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setAuthError(handleFriendlyError(err?.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-[440px] bg-[var(--mc-surface)]/95 backdrop-blur-xl border border-[var(--mc-card-border)] rounded-3xl p-6 sm:p-8 shadow-[var(--mc-glow)] relative overflow-hidden">
        {/* Glow accent orb */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[var(--mc-primary)]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)] hover:bg-[var(--mc-chip-bg)] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="text-center mb-6 relative z-10 flex flex-col items-center">
          <MomCareLogo size="md" showText={false} className="mb-3" />

          <h2 className="text-xl font-black text-[var(--mc-text-primary)] neon-text-glow">
            {mode === 'login' ? t.welcomeBack : mode === 'signup' ? t.createYourAccount : t.resetPasswordTitle}
          </h2>
          <p className="text-xs text-[var(--mc-text-secondary)] mt-1">
            {mode === 'login'
              ? t.loginSubtitle
              : mode === 'signup'
              ? t.signupSubtitle
              : t.resetPasswordSubtitle}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot' && (
          <div className="flex p-1 rounded-2xl bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] mb-5 text-xs font-bold relative z-10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthError('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[var(--mc-btn-gradient)] text-white shadow-xs font-bold'
                  : 'text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)]'
              }`}
            >
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setAuthError('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[var(--mc-btn-gradient)] text-white shadow-xs font-bold'
                  : 'text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)]'
              }`}
            >
              {t.createAccount}
            </button>
          </div>
        )}

        {/* Auth Error Display */}
        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-[#2E0B16] border border-[#FF003C]/50 text-xs font-medium text-[#FF5277] flex items-start gap-2 animate-in fade-in shadow-[0_0_10px_rgba(255,0,60,0.3)]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF003C]" />
            <span>{authError}</span>
          </div>
        )}

        {/* Password Reset Success */}
        {resetSuccess ? (
          <div className="space-y-4 text-center py-2 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[#0C241B] border border-[#10E599]/50 text-[#10E599] flex items-center justify-center mx-auto shadow-[0_0_12px_rgba(16,229,153,0.3)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-[#FFF0F6] font-semibold">
              {t.resetSentNotice}
            </p>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setResetSuccess(false);
              }}
              className="w-full py-3 rounded-xl cyber-gradient-btn text-white text-xs font-bold"
            >
              {t.backToLogin}
            </button>
          </div>
        ) : mode === 'forgot' ? (
          /* Forgot Password Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#FFF0F6] mb-1 font-mono">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#A38495]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#1D0D24] border border-[#FF1A75]/30 text-xs text-[#FFF0F6] placeholder-[#A38495] focus:outline-hidden focus:border-[#FF1A75] focus:shadow-[0_0_10px_rgba(255,26,117,0.3)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl cyber-gradient-btn text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <span>{isLoading ? '...' : t.sendResetLink}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthError('');
              }}
              className="w-full text-center text-xs font-semibold text-[#E3BCCC] hover:text-[#FF1A75] pt-1"
            >
              {t.backToLogin}
            </button>
          </form>
        ) : (
          /* Login / Signup Form */
          <div className="space-y-4">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              type="button"
              className="w-full py-3 px-4 rounded-2xl bg-[#23122A] hover:bg-[#2C1736] border border-[#FF1A75]/35 text-xs font-bold text-[#FFF0F6] shadow-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-40"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t.continueWithGoogle}</span>
            </button>

            <div className="flex items-center gap-2 my-2 text-[10px] text-[#A38495] uppercase font-bold tracking-wider font-mono">
              <div className="h-px bg-[#FF1A75]/20 flex-1" />
              <span>{t.orWithEmail}</span>
              <div className="h-px bg-[#FF1A75]/20 flex-1" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#FFF0F6] mb-1 font-mono">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#A38495]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#1D0D24] border border-[#FF1A75]/30 text-xs text-[#FFF0F6] placeholder-[#A38495] focus:outline-hidden focus:border-[#FF1A75]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#FFF0F6] font-mono">
                    {t.passwordLabel}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setAuthError('');
                      }}
                      className="text-[10px] text-[#FF1A75] hover:underline font-semibold"
                    >
                      {t.forgotPassword}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#A38495]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#1D0D24] border border-[#FF1A75]/30 text-xs text-[#FFF0F6] placeholder-[#A38495] focus:outline-hidden focus:border-[#FF1A75]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-[#A38495] hover:text-[#FFF0F6]"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password in Sign-up mode */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#FFF0F6] mb-1 font-mono">
                    {t.confirmPasswordLabel}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#A38495]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#1D0D24] border border-[#FF1A75]/30 text-xs text-[#FFF0F6] placeholder-[#A38495] focus:outline-hidden focus:border-[#FF1A75]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-2.5 text-[#A38495] hover:text-[#FFF0F6]"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl cyber-gradient-btn active:scale-[0.99] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 mt-3 border border-[#FFD1E3]/30"
              >
                <span>{isLoading ? '...' : mode === 'login' ? t.login : t.createAccount}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Switch Mode Prompt Link */}
            <div className="pt-2 text-center text-xs text-[#E3BCCC]">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setAuthError('');
                    }}
                    className="text-[#FF1A75] font-bold hover:underline"
                  >
                    {t.createAccount}
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setAuthError('');
                    }}
                    className="text-[#FF1A75] font-bold hover:underline"
                  >
                    {t.login}
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
