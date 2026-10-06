import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  loginWithEmail,
  signupWithEmail,
  loginWithGoogle,
  resetPassword,
} from '../../services/firebase/authService';
import { getUserProfile } from '../../services/firebase/userService';
import type { UserProfile } from '../../types';
import { useTranslation } from '../../translations';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onAuthenticated: (profile: UserProfile | null, authUser: { uid: string; email: string }) => void;
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

  React.useEffect(() => {
    setMode(initialMode);
    setAuthError('');
    setResetSuccess(false);
    setPassword('');
    setConfirmPassword('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    const msg = (err?.message || '').toLowerCase();

    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/wrong-password' ||
      msg.includes('invalid-credential') ||
      msg.includes('wrong-password')
    ) {
      return t.wrongCredentials;
    }
    if (code === 'auth/user-not-found' || msg.includes('user-not-found')) {
      return t.noAccountFound;
    }
    if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
      return 'An account already exists with this email.';
    }
    if (code === 'auth/weak-password' || msg.includes('weak-password')) {
      return 'Password should be at least 6 characters.';
    }
    if (code === 'auth/invalid-email' || msg.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (
      code === 'auth/network-request-failed' ||
      msg.includes('network') ||
      msg.includes('offline')
    ) {
      return t.noInternetNotice;
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was cancelled.';
    }
    return t.errSaveGeneral;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError('Please fill in email and password.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setAuthError(t.passwordsMustMatch);
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      if (mode === 'signup') {
        const user = await signupWithEmail(email.trim(), password, '');
        onAuthenticated(null, { uid: user.uid, email: user.email || email.trim() });
      } else {
        const user = await loginWithEmail(email.trim(), password);
        const existingProfile = await getUserProfile(user.uid);
        onAuthenticated(existingProfile, { uid: user.uid, email: user.email || email.trim() });
      }
      onClose();
    } catch (err: any) {
      setAuthError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setAuthError('');
    try {
      const user = await loginWithGoogle();
      const existingProfile = await getUserProfile(user.uid);
      onAuthenticated(existingProfile, { uid: user.uid, email: user.email || '' });
      onClose();
    } catch (err: any) {
      setAuthError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setAuthError('Please enter your email.');
      return;
    }
    setIsLoading(true);
    setAuthError('');
    try {
      await resetPassword(email.trim());
      setResetSuccess(true);
    } catch (err: any) {
      setAuthError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1F24]/75 backdrop-blur-xs p-4 animate-in fade-in duration-300">
      <div className="bg-[#FCF8F6] text-[#352F35] w-full max-w-sm rounded-3xl p-6 sm:p-7 border border-[#E9DFDC] shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white border border-[#E9DFDC] text-[#766D72] hover:text-[#352F35] transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F2E1E3] flex items-center justify-center text-[#9F5F6E] mx-auto mb-3 shadow-2xs">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>

          <h2 className="text-xl font-black text-[#352F35]">
            {mode === 'login' ? t.welcomeBack : mode === 'signup' ? t.createYourAccount : t.resetPasswordTitle}
          </h2>
          <p className="text-xs text-[#766D72] mt-1">
            {mode === 'login'
              ? t.loginSubtitle
              : mode === 'signup'
              ? t.signupSubtitle
              : t.resetPasswordSubtitle}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot' && (
          <div className="flex p-1 rounded-2xl bg-white border border-[#E9DFDC] mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthError('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-[#9F5F6E] text-white shadow-2xs'
                  : 'text-[#766D72] hover:text-[#352F35]'
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
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-[#9F5F6E] text-white shadow-2xs'
                  : 'text-[#766D72] hover:text-[#352F35]'
              }`}
            >
              {t.createAccount}
            </button>
          </div>
        )}

        {/* Auth Error Display */}
        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-[#FFF0F2] border border-[#FADADD] text-xs font-medium text-[#C62828] flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Password Reset Success */}
        {resetSuccess ? (
          <div className="space-y-4 text-center py-2 animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-[#352F35] font-semibold">
              {t.resetSentNotice}
            </p>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setResetSuccess(false);
              }}
              className="w-full py-3 rounded-xl bg-[#9F5F6E] text-white text-xs font-bold"
            >
              {t.backToLogin}
            </button>
          </div>
        ) : mode === 'forgot' ? (
          /* Forgot Password Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#352F35] mb-1">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#766D72]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-[#E9DFDC] text-xs text-[#352F35] focus:outline-hidden focus:border-[#9F5F6E]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-[#9F5F6E] hover:bg-[#8F525F] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <span>{isLoading ? '...' : t.sendResetLink}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthError('');
              }}
              className="w-full text-center text-xs font-semibold text-[#766D72] hover:text-[#9F5F6E] pt-1"
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
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FCF8F6] border border-[#E9DFDC] text-xs font-bold text-[#352F35] shadow-2xs transition-all flex items-center justify-center gap-2.5 disabled:opacity-40"
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

            <div className="flex items-center gap-2 my-2 text-[10px] text-[#A2969C] uppercase font-bold tracking-wider">
              <div className="h-px bg-[#E9DFDC] flex-1" />
              <span>{t.orWithEmail}</span>
              <div className="h-px bg-[#E9DFDC] flex-1" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#352F35] mb-1">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#766D72]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-[#E9DFDC] text-xs text-[#352F35] focus:outline-hidden focus:border-[#9F5F6E]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#352F35]">
                    {t.passwordLabel}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setAuthError('');
                      }}
                      className="text-[10px] text-[#9F5F6E] hover:underline font-semibold"
                    >
                      {t.forgotPassword}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#766D72]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#E9DFDC] text-xs text-[#352F35] focus:outline-hidden focus:border-[#9F5F6E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[#766D72] hover:text-[#352F35]"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password in Sign-up mode */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#352F35] mb-1">
                    {t.confirmPasswordLabel}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#766D72]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#E9DFDC] text-xs text-[#352F35] focus:outline-hidden focus:border-[#9F5F6E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3 text-[#766D72] hover:text-[#352F35]"
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
                className="w-full py-3.5 rounded-2xl bg-[#9F5F6E] hover:bg-[#8F525F] active:scale-[0.99] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 mt-2"
              >
                <span>{isLoading ? '...' : mode === 'login' ? t.login : t.createAccount}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Switch Mode Prompt Link */}
            <div className="pt-2 text-center text-xs text-[#766D72]">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setAuthError('');
                    }}
                    className="text-[#9F5F6E] font-bold hover:underline"
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
                    className="text-[#9F5F6E] font-bold hover:underline"
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
