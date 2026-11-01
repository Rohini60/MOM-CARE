import React, { useState } from 'react';
import { Sparkles, Brain, CheckCircle2, ThumbsUp, RotateCcw, AlertCircle, X, ShieldCheck } from 'lucide-react';
import type { UserBanditState } from '../../services/habits/banditEngine';
import { VETTED_HABIT_LIBRARY } from '../../services/habits/habitLibrary';
import { resetUserBanditPersonalization } from '../../services/habits/banditEngine';
import { useTranslation } from '../../translations';

interface HowMomCareLearnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  banditState: UserBanditState;
  onStateUpdated: (newState: UserBanditState) => void;
}

export const HowMomCareLearnsModal: React.FC<HowMomCareLearnsModalProps> = ({
  isOpen,
  onClose,
  banditState,
  onStateUpdated,
}) => {
  const { language } = useTranslation();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  // Find top habits that work best for her (highest completions + helpful count)
  const habitRankings = Object.values(banditState.arms)
    .map((arm) => {
      const def = VETTED_HABIT_LIBRARY.find((h) => h.id === arm.habitId);
      const score = arm.completionsCount * 1.0 + arm.helpfulCount * 0.5 - arm.unhelpfulCount * 0.5;
      return { arm, def, score };
    })
    .filter((item) => item.def && (item.arm.completionsCount > 0 || item.arm.helpfulCount > 0))
    .sort((a, b) => b.score - a.score);

  const handleReset = () => {
    const fresh = resetUserBanditPersonalization(banditState.userId);
    onStateUpdated(fresh);
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--mc-primary)]/20 border border-[var(--mc-primary)] text-[var(--mc-primary)] flex items-center justify-center font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--mc-text-primary)]">
                {language === 'ta' ? 'MomCare உங்களை எப்படி புரிந்து கொள்கிறது' : language === 'hi' ? 'MomCare आपकी पसंद कैसे सीखता है' : 'How MomCare Learns You'}
              </h2>
              <p className="text-xs text-[var(--mc-text-secondary)]">
                {language === 'ta' ? 'தனிப்பயனாக்கப்பட்ட தினசரி பழக்கங்கள்' : language === 'hi' ? 'व्यक्तिगत आदत इंजन' : 'Personalized Learning Habit Engine'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--mc-surface)] flex items-center justify-center text-[var(--mc-text-secondary)] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explainability Banner */}
        <div className="p-3.5 rounded-2xl bg-[var(--mc-surface-elevated)] border border-[var(--mc-card-border)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--mc-primary)]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              {language === 'ta' ? 'மருத்துவ ரீதியாக பாதுகாப்பான பழக்கங்கள் மட்டுமே' : language === 'hi' ? 'केवल चिकित्सकीय रूप से सुरक्षित आदतें' : 'Doctor-Vetted & Safe Actions Only'}
            </span>
          </div>
          <p className="text-xs text-[var(--mc-text-secondary)] leading-relaxed">
            {language === 'ta'
              ? 'MomCare உங்களின் வார நிலை மற்றும் சுகாதார விதிகளுக்கு ஏற்ப எளிய பழக்கங்களை மட்டுமே பரிந்துரைக்கும். MomCare எப்போதாவது மட்டுமே ஒரு புதிய பழக்கத்தை முயற்சிக்கும், மேலும் உங்கள் மருத்துவரின் ஆலோசனையுடன் முரண்படும் எதையும் பரிந்துரைக்காது.'
              : language === 'hi'
              ? 'MomCare कभी-कभी ही कोई नई आदत आजमाता है, और कभी भी ऐसा कुछ नहीं सुझाता जो आपके डॉक्टर की सलाह के विपरीत हो।'
              : 'MomCare tries a new habit only sometimes, and never one that conflicts with your doctor’s advice.'}
          </p>
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--mc-text-secondary)] pt-1 border-t border-[var(--mc-card-border)]">
            <span>Logged Days: <strong>{banditState.totalDaysLogged}</strong></span>
            <span>Learning Mode: <strong>{banditState.totalDaysLogged <= 7 ? 'Cold Start (Learning You)' : 'Thompson Sampling (Active)'}</strong></span>
          </div>
        </div>

        {/* Habits that work best for her */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono uppercase text-[var(--mc-text-secondary)] tracking-wider">
            {language === 'ta' ? 'உங்களுக்கு மிகவும் பயனுள்ள பழக்கங்கள்' : language === 'hi' ? 'आपके लिए सबसे उपयोगी आदतें' : 'Habits That Work Best For You'}
          </h3>

          {habitRankings.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-center text-xs text-[var(--mc-text-secondary)] space-y-1">
              <Sparkles className="w-5 h-5 mx-auto text-[var(--mc-primary)]" />
              <p>MomCare is still learning you. Complete habits in Today’s Focus to build your profile.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {habitRankings.slice(0, 5).map(({ arm, def }) => {
                const text = language === 'ta' ? def?.textTa : language === 'hi' ? def?.textHi : def?.textEn;
                return (
                  <div
                    key={arm.habitId}
                    className="p-3 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 flex-1">
                      <p className="font-semibold text-[var(--mc-text-primary)]">{text}</p>
                      <p className="text-[10px] text-[var(--mc-text-secondary)] font-mono">
                        Completed {arm.completionsCount} times • {arm.helpfulCount} marked helpful
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--mc-chip-bg)] border border-[var(--mc-primary)]/40 text-[var(--mc-primary)] font-mono text-[10px] font-bold shrink-0">
                      Top Match
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset Personalization Button / Dialog */}
        <div className="pt-2 border-t border-[var(--mc-card-border)] space-y-2">
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 px-4 rounded-2xl border border-[var(--mc-card-border)] hover:border-red-500/50 text-[var(--mc-text-secondary)] hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'எனது தனிப்பயனாக்கத்தை மீட்டமைக்க' : language === 'hi' ? 'मेरा वैयक्तिकरण रीसेट करें' : 'Reset my personalization'}</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-3">
              <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'ta' ? 'தனிப்பயனாக்கத்தை மீட்டமைக்கவா?' : language === 'hi' ? 'क्या आप वैयक्तिकरण रीसेट करना चाहते हैं?' : 'Reset all learned habit preferences?'}
                </span>
              </div>
              <p className="text-xs text-red-200">
                {language === 'ta'
                  ? 'இது உங்கள் முந்தைய பழக்க விருப்பங்களை அழித்து புதிதாக தொடங்கும்.'
                  : language === 'hi'
                  ? 'यह आपकी सीखी गई प्राथमिकताओं को हटाकर नई शुरुआत करेगा।'
                  : 'This will reset learned preferences and return MomCare to the initial learning phase.'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {language === 'ta' ? 'ஆம், மீட்டமைக்கவும்' : language === 'hi' ? 'हाँ, रीसेट करें' : 'Yes, Reset'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="py-2 px-3 rounded-xl bg-[var(--mc-surface)] text-[var(--mc-text-secondary)] hover:text-white font-semibold text-xs cursor-pointer"
                >
                  {language === 'ta' ? 'இல்லை, ரத்து செய்' : language === 'hi' ? 'नहीं, रद्द करें' : 'No, Keep'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
