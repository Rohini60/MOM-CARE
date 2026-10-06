import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Heart,
  Share2,
  Copy,
  Check,
  Wind,
  ChevronRight,
  RefreshCw,
  Sun,
  Moon,
  Smile,
} from 'lucide-react';
import type { UserProfile } from '../types';

interface Affirmation {
  id: string;
  trimester: 1 | 2 | 3 | 'all';
  theme: 'strength' | 'connection' | 'body_trust' | 'peace' | 'nurture';
  tag: string;
  template: (name: string, babyName: string, week: number) => string;
  reflectionPrompt?: string;
}

const AFFIRMATION_LIBRARY: Affirmation[] = [
  // Trimester 1 (Weeks 4-13)
  {
    id: 't1_1',
    trimester: 1,
    theme: 'body_trust',
    tag: 'Quiet Creation',
    template: (name, babyName, week) =>
      `${name}, even when you are resting quietly, your body is doing the miraculous work of creating ${babyName}'s heart, mind, and soul at week ${week}.`,
    reflectionPrompt: 'Take a soft breath and thank your body for working so hard in secret today.',
  },
  {
    id: 't1_2',
    trimester: 1,
    theme: 'nurture',
    tag: 'Gentle Grace',
    template: (name) =>
      `${name}, give yourself radical permission to slow down. Rest is not a luxury right now—it is essential nutrition for you and your baby.`,
    reflectionPrompt: 'What is one pressure you can gently release from your shoulders today?',
  },
  {
    id: 't1_3',
    trimester: 1,
    theme: 'peace',
    tag: 'Patience & Calm',
    template: (name, babyName, week) =>
      `At ${week} weeks, every cell of ${babyName} is forming with infinite wisdom. Trust the unseen journey taking place within you, ${name}.`,
    reflectionPrompt: 'Place your hand softly on your lower abdomen and send a warm wave of peace to your baby.',
  },
  {
    id: 't1_4',
    trimester: 1,
    theme: 'strength',
    tag: 'Inner Resilience',
    template: (name) =>
      `${name}, you are capable, resilient, and already an extraordinary mother. Your intuition is your compass.`,
  },

  // Trimester 2 (Weeks 14-27)
  {
    id: 't2_1',
    trimester: 2,
    theme: 'connection',
    tag: 'Maternal Bond',
    template: (name, babyName, week) =>
      `${name}, as you navigate week ${week}, every flutter and gentle movement from ${babyName} is a sweet whisper saying: "I know you, and I feel safe with you."`,
    reflectionPrompt: 'Pause for 10 seconds to feel your baby’s warmth and acknowledge the beautiful bond between you.',
  },
  {
    id: 't2_2',
    trimester: 2,
    theme: 'body_trust',
    tag: 'Bodily Harmony',
    template: (name, babyName, week) =>
      `Your body is an intelligent, generous sanctuary. At ${week} weeks, you are providing everything ${babyName} needs to flourish and thrive, ${name}.`,
    reflectionPrompt: 'Notice the changes in your posture and thank your back, hips, and heart for supporting new life.',
  },
  {
    id: 't2_3',
    trimester: 2,
    theme: 'peace',
    tag: 'Golden Trimester',
    template: (name, babyName) =>
      `${name}, let today be filled with joy and gentle wonder. You and ${babyName} are blooming together in sacred rhythm.`,
    reflectionPrompt: 'What is one moment of simple delight you can share with your baby today?',
  },
  {
    id: 't2_4',
    trimester: 2,
    theme: 'nurture',
    tag: 'Deep Energy',
    template: (name, babyName, week) =>
      `At ${week} weeks gestation, ${name}, you carry the strength of generations. Breathe in peace; breathe out all self-doubt.`,
  },
  {
    id: 't2_5',
    trimester: 2,
    theme: 'connection',
    tag: 'Shared Heartbeat',
    template: (name, babyName) =>
      `${babyName} hears the soothing rhythm of your voice and the steady beat of your loving heart, ${name}. You are your baby's entire world.`,
  },

  // Trimester 3 (Weeks 28-40+)
  {
    id: 't3_1',
    trimester: 3,
    theme: 'strength',
    tag: 'Strength & Readiness',
    template: (name, babyName, week) =>
      `${name}, as you reach week ${week}, your body is preparing with instinctual perfection to welcome ${babyName} into your loving arms.`,
    reflectionPrompt: 'Inhale courage, exhale any tension in your jaw and shoulders.',
  },
  {
    id: 't3_2',
    trimester: 3,
    theme: 'peace',
    tag: 'Surrender & Breath',
    template: (name, babyName) =>
      `You do not have to carry everything alone today, ${name}. Rest into the present moment and trust the final countdown with ${babyName}.`,
    reflectionPrompt: 'Softly relax your belly, lengthen your spine, and let your body sink into comfortable support.',
  },
  {
    id: 't3_3',
    trimester: 3,
    theme: 'body_trust',
    tag: 'Natural Wisdom',
    template: (name, babyName, week) =>
      `Your body knows exactly how to shelter, nourish, and gently bring ${babyName} earthside when the time is right, ${name}.`,
  },
  {
    id: 't3_4',
    trimester: 3,
    theme: 'nurture',
    tag: 'Nesting Peace',
    template: (name, babyName) =>
      `The love you feel for ${babyName} already surrounds your home like a warm, comforting blanket, ${name}. You are ready.`,
  },

  // Universal
  {
    id: 'u_1',
    trimester: 'all',
    theme: 'peace',
    tag: 'Maternal Grace',
    template: (name, babyName) =>
      `There is no single "perfect" way to experience pregnancy, ${name}. Your unique journey with ${babyName} is meaningful, valid, and worthy of tenderness.`,
  },
];

interface DailyAffirmationWidgetProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
}

export const DailyAffirmationWidget: React.FC<DailyAffirmationWidgetProps> = ({
  profile,
  pregnancyWeek,
}) => {
  const motherName = profile?.displayName || 'Mama';
  const babyNickname = profile?.babyNickname || 'your baby';

  // Determine Trimester
  const trimester: 1 | 2 | 3 = useMemo(() => {
    if (pregnancyWeek < 14) return 1;
    if (pregnancyWeek < 28) return 2;
    return 3;
  }, [pregnancyWeek]);

  // Filter affirmations matching the trimester or universal
  const eligibleAffirmations = useMemo(() => {
    const list = AFFIRMATION_LIBRARY.filter(
      (a) => a.trimester === trimester || a.trimester === 'all'
    );
    return list.length > 0 ? list : AFFIRMATION_LIBRARY;
  }, [trimester]);

  // Index state with daily deterministic seed + manual shuffle
  const [currentIndex, setCurrentIndex] = useState(() => {
    const today = new Date();
    const daySeed = today.getDate() + today.getMonth() * 31;
    return daySeed % eligibleAffirmations.length;
  });

  const [isCopied, setIsCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);

  const activeAffirmation = eligibleAffirmations[currentIndex % eligibleAffirmations.length];
  const storageFavKey = `momcare_fav_affirmations`;

  // Check favorite status on mount / index change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageFavKey);
      if (stored) {
        const favIds: string[] = JSON.parse(stored);
        setIsFavorited(favIds.includes(activeAffirmation.id));
      } else {
        setIsFavorited(false);
      }
    } catch {
      setIsFavorited(false);
    }
  }, [activeAffirmation.id]);

  const toggleFavorite = () => {
    try {
      const stored = localStorage.getItem(storageFavKey);
      let favIds: string[] = stored ? JSON.parse(stored) : [];
      if (favIds.includes(activeAffirmation.id)) {
        favIds = favIds.filter((id) => id !== activeAffirmation.id);
        setIsFavorited(false);
      } else {
        favIds.push(activeAffirmation.id);
        setIsFavorited(true);
      }
      localStorage.setItem(storageFavKey, JSON.stringify(favIds));
    } catch (e) {
      console.warn('Favorite storage error:', e);
    }
  };

  const handleNextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % eligibleAffirmations.length);
  };

  const handleCopy = () => {
    const text = activeAffirmation.template(motherName, babyNickname, pregnancyWeek);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // 12-second mindful breathing loop (4s Inhale, 4s Hold, 4s Exhale)
  useEffect(() => {
    if (!isBreathingOpen) return;

    let secondsInCycle = 0;
    const interval = setInterval(() => {
      secondsInCycle = (secondsInCycle + 1) % 12;

      if (secondsInCycle < 4) {
        setBreathPhase('Inhale');
        setBreathTimer(4 - secondsInCycle);
      } else if (secondsInCycle < 8) {
        setBreathPhase('Hold');
        setBreathTimer(8 - secondsInCycle);
      } else {
        setBreathPhase('Exhale');
        setBreathTimer(12 - secondsInCycle);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingOpen]);

  const formattedText = activeAffirmation.template(motherName, babyNickname, pregnancyWeek);

  return (
    <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#FFF9FA] via-[#FCF8F6] to-[#F2E1E3]/50 border border-[#E9DFDC] shadow-sm relative overflow-hidden transition-all">
      {/* Background Soft Glow Aura */}
      <div
        className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full blur-2xl pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, #F2E1E3 0%, #C98291 40%, transparent 70%)' }}
      />
      <div
        className="absolute -left-8 -top-8 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, #EFEBF4 0%, #B7A6C9 40%, transparent 70%)' }}
      />

      <div className="relative z-10 space-y-3">
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white text-[#9F5F6E] border border-[#E9DFDC] shadow-2xs flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#C98291]" />
              <span>Daily Affirmation</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#EFEBF4] text-[#7E699B]">
              Trimester {trimester} • Wk {pregnancyWeek}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Next Affirmation / Shuffle */}
            <button
              onClick={handleNextAffirmation}
              className="p-1.5 rounded-xl bg-white hover:bg-[#F2E1E3] border border-[#E9DFDC] text-[#766D72] hover:text-[#9F5F6E] transition-all shadow-2xs"
              title="Next positive affirmation"
              aria-label="Next affirmation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              className={`p-1.5 rounded-xl border transition-all shadow-2xs ${
                isFavorited
                  ? 'bg-[#F2E1E3] border-[#C98291] text-[#9F5F6E]'
                  : 'bg-white border-[#E9DFDC] text-[#766D72] hover:text-[#9F5F6E]'
              }`}
              title={isFavorited ? 'Saved in favorites' : 'Save to favorites'}
              aria-label="Save affirmation"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current text-[#9F5F6E]' : ''}`} />
            </button>

            {/* Copy / Share Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl bg-white hover:bg-[#F2E1E3] border border-[#E9DFDC] text-[#766D72] hover:text-[#9F5F6E] transition-all shadow-2xs"
              title="Copy affirmation to clipboard"
              aria-label="Copy affirmation"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Main Affirmation Card Quote */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#E9DFDC]/80 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C98291]">
              {activeAffirmation.tag}
            </span>
          </div>

          <p className="text-sm sm:text-base font-serif italic text-[#352F35] leading-relaxed">
            "{formattedText}"
          </p>

          {activeAffirmation.reflectionPrompt && (
            <p className="text-[11px] font-sans text-[#766D72] pt-1.5 border-t border-[#E9DFDC]/50 flex items-start gap-1.5">
              <span className="text-[#9F5F6E] font-bold">Today’s gentle thought:</span>
              <span>{activeAffirmation.reflectionPrompt}</span>
            </p>
          )}
        </div>

        {/* Bottom Bar: Mindful Breath Toggle & Copied Notification */}
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => setIsBreathingOpen(!isBreathingOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              isBreathingOpen
                ? 'bg-[#9F5F6E] text-white shadow-2xs'
                : 'bg-white hover:bg-[#F2E1E3] text-[#9F5F6E] border border-[#E9DFDC]'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>{isBreathingOpen ? 'Close Breath' : '10s Calming Breath'}</span>
          </button>

          {isCopied ? (
            <span className="text-[11px] font-semibold text-[#2E7D32] animate-in fade-in">
              Copied to clipboard ✨
            </span>
          ) : (
            <span className="text-[11px] text-[#766D72]">
              Personalized for {motherName} & {babyNickname}
            </span>
          )}
        </div>

        {/* Expandable Mindful Breathing Bubble */}
        {isBreathingOpen && (
          <div className="mt-2 p-4 rounded-2xl bg-white border border-[#E9DFDC] shadow-inner text-center space-y-3 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#9F5F6E] uppercase tracking-wide">
                Mindful Maternal Centering
              </span>
              <p className="text-[11px] text-[#766D72]">
                Inhale peace, cradle your baby with your breath, and let your body relax.
              </p>
            </div>

            {/* Breathing Animation Circle */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'scale-110 bg-[#F2E1E3]/80 border-2 border-[#C98291]'
                    : breathPhase === 'Hold'
                    ? 'scale-110 bg-[#EFEBF4]/80 border-2 border-[#7E699B]'
                    : 'scale-90 bg-[#FFF9FA]/80 border-2 border-[#E9DFDC]'
                }`}
              />
              <div className="relative z-10 text-center">
                <span className="text-base font-extrabold text-[#352F35] block">
                  {breathPhase}
                </span>
                <span className="text-xs font-semibold text-[#9F5F6E]">
                  {breathTimer}s
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#766D72] italic">
              "With every breath, you and your baby grow closer."
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
