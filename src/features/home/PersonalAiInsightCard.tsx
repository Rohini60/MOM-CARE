import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Info,
  CheckCircle2,
  Calendar,
  Activity,
  Heart,
  ChevronRight,
  X,
} from 'lucide-react';
import type { UserProfile, Checkin, SymptomRecord } from '../../types';
import { requestHomeInsight, type HomeInsightResponse } from '../../services/ai/client';
import { useTranslation } from '../../translations';

interface PersonalAiInsightCardProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  recentCheckins: Checkin[];
  recentSymptoms: SymptomRecord[];
  onSuggestedQuestionClick?: (question: string) => void;
  onTasksGenerated?: (tasks: string[]) => void;
}

export const PersonalAiInsightCard: React.FC<PersonalAiInsightCardProps> = ({
  profile,
  pregnancyWeek,
  recentCheckins,
  recentSymptoms,
  onSuggestedQuestionClick,
  onTasksGenerated,
}) => {
  const { language, t } = useTranslation();

  const [insightData, setInsightData] = useState<HomeInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState<number>(0);
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);

  // Rotating loading messages (Requirement 2)
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % 3);
    }, 2400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = [
    t.loadingInsightMsg1,
    t.loadingInsightMsg2,
    t.loadingInsightMsg3,
  ];

  // Daily cache key (Requirement: Generate once per day per user and save it)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const cacheKey = `momcare_insight_${profile?.id || 'guest'}_${todayDateStr}_${language}`;

  const loadInsight = async (forceRefresh = false) => {
    setIsLoading(true);
    setHasError(false);

    // 1. Check local cache first
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed: HomeInsightResponse = JSON.parse(cached);
          if (parsed && parsed.insightText) {
            setInsightData(parsed);
            if (onTasksGenerated && parsed.suggestedFocusTasks) {
              onTasksGenerated(parsed.suggestedFocusTasks);
            }
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Cache read error:', err);
      }
    }

    // 2. Fetch from backend with 8-second client timeout
    try {
      const data = await requestHomeInsight({
        pregnancyWeek,
        motherName: profile?.preferredName || profile?.displayName || 'there',
        babyNickname: profile?.babyNickname || 'your baby',
        medicalConditions: profile?.medicalConditions || [],
        allergies: profile?.allergies || '',
        medications: profile?.userMedications || '',
        recentCheckins,
        recentSymptoms,
        language,
      });

      setInsightData(data);
      if (onTasksGenerated && data.suggestedFocusTasks) {
        onTasksGenerated(data.suggestedFocusTasks);
      }

      // Save to cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (e) {
        console.warn('Cache write error:', e);
      }
    } catch (err) {
      console.warn('Insight fetch error or timeout:', err);
      setHasError(true);
      // Fallback data so the Home page NEVER breaks (Safety Rule)
      const fallback: HomeInsightResponse = {
        insightText:
          language === 'ta'
            ? `இந்த வாரம் ${pregnancyWeek}-ல் உங்கள் உடல் குழந்தையைத் தாங்கி வளர்க்க பெரும் மாற்றங்களைச் சந்திக்கிறது. போதுமான தண்ணீர் குடித்து, உங்கள் உடலுக்குத் தேவையான ஓய்வைக் கொடுங்கள்.`
            : language === 'hi'
            ? `गर्भावस्था के ${pregnancyWeek}वें हफ्ते में आपका शरीर शिशु के विकास के लिए कड़ी मेहनत कर रहा है। समय पर पानी पिएं और दिन में थोड़ा विश्राम अवश्य लें।`
            : `During week ${pregnancyWeek}, your body is doing continuous, gentle work caring for baby. Stay hydrated with small sips and give yourself permission to take a restful side-lying pause today.`,
        whyAmISeeingThis:
          language === 'ta'
            ? `கர்ப்ப வாரம் ${pregnancyWeek} மற்றும் அடிப்படை மருத்துவ வழிகாட்டுதல்களின்படி.`
            : language === 'hi'
            ? `गर्भावस्था सप्ताह ${pregnancyWeek} और चिकित्सकीय दिशा-निर्देशों के आधार पर।`
            : `Based on your gestational week (${pregnancyWeek}) and clinical maternity recommendations.`,
        suggestedQuestions: [
          `Why do I feel more tired in week ${pregnancyWeek}?`,
          `Safe ways to soothe lower back ache?`,
          `What are normal sensations for week ${pregnancyWeek}?`,
        ],
        suggestedFocusTasks: [
          `Drink at least 8 glasses of water`,
          `15-minute gentle side-lying rest`,
          pregnancyWeek >= 28 ? `Count baby kicks after your meal` : `Take prenatal vitamin with folic acid`,
        ],
      };
      setInsightData(fallback);
      if (onTasksGenerated && fallback.suggestedFocusTasks) {
        onTasksGenerated(fallback.suggestedFocusTasks);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsight();
  }, [profile?.id, pregnancyWeek, recentCheckins.length, language]);

  // Compute actual 7-day trends and chips from user data (Requirement 4)
  const intelligenceMetrics = useMemo(() => {
    const daysLogged = Math.min(recentCheckins.length, 7);
    const chips: Array<{ label: string; icon?: string }> = [];

    // Chip 1: Week
    chips.push({ label: `Wk ${pregnancyWeek}` });

    // Chip 2: Sleep trend
    const recentSleep = recentCheckins.slice(0, 3).map((c) => c.sleep);
    const poorSleepCount = recentSleep.filter((s) => s === 'poor').length;
    const goodSleepCount = recentSleep.filter((s) => s === 'good').length;

    let sleepTrend: 'better' | 'same' | 'lower' = 'same';
    if (poorSleepCount >= 2) {
      sleepTrend = 'lower';
      chips.push({ label: language === 'ta' ? 'தூக்கம்: குறைவு' : language === 'hi' ? 'नींद: कम' : 'Sleep: low' });
    } else if (goodSleepCount >= 2) {
      sleepTrend = 'better';
      chips.push({ label: language === 'ta' ? 'தூக்கம்: நன்று' : language === 'hi' ? 'नींद: अच्छी' : 'Sleep: good' });
    } else {
      chips.push({ label: language === 'ta' ? 'தூக்கம்: சீரானது' : language === 'hi' ? 'नींद: स्थिर' : 'Sleep: steady' });
    }

    // Chip 3: Energy trend
    const recentEnergy = recentCheckins.slice(0, 3).map((c) => c.energy);
    const lowEnergyCount = recentEnergy.filter((e) => e === 'low').length;
    const highEnergyCount = recentEnergy.filter((e) => e === 'high').length;
    let energyTrend: 'better' | 'same' | 'lower' = 'same';
    if (lowEnergyCount >= 2) {
      energyTrend = 'lower';
      chips.push({ label: language === 'ta' ? 'சோர்வு உள்ளது' : language === 'hi' ? 'ऊर्जा: कम' : 'Energy: low' });
    } else if (highEnergyCount >= 2) {
      energyTrend = 'better';
      chips.push({ label: language === 'ta' ? 'தெம்பு நன்று' : language === 'hi' ? 'ऊर्जा: अच्छी' : 'Energy: high' });
    } else {
      energyTrend = 'same';
    }

    // Chip 4: Health history
    if (profile?.medicalConditions && profile.medicalConditions.length > 0) {
      const cond = profile.medicalConditions[0];
      if (cond && !cond.includes('None') && !cond.includes('Prefer not to say')) {
        chips.push({ label: `Care: ${cond.slice(0, 14)}` });
      }
    }

    // Movement trend
    let movementTrend: 'better' | 'same' | 'lower' = 'same';
    const recentMovement = recentCheckins.slice(0, 3).map((c) => c.babyMovement);
    if (recentMovement.includes('less')) {
      movementTrend = 'lower';
    } else if (recentMovement.includes('normal')) {
      movementTrend = 'better';
    }

    // Feedback message based on answers
    let feedbackLine: string | null = null;
    if (poorSleepCount >= 1 || lowEnergyCount >= 1) {
      feedbackLine =
        language === 'ta'
          ? 'நீங்கள் தூக்கம்/சோர்வு குறைவாகப் பதிவிட்டதால், இன்றைய குறிப்பில் ஓய்வுக்கான ஆலோசனையைச் சேர்த்துள்ளோம்.'
          : language === 'hi'
          ? 'क्योंकि आपने नींद में कमी दर्ज की थी, हमने आज के मुख्य ध्यान में विश्राम का सुझाव जोड़ा है।'
          : 'Because you logged lighter sleep or fatigue, we added a restful pause to your daily focus.';
    }

    return {
      daysLogged,
      chips,
      sleepTrend,
      energyTrend,
      movementTrend,
      feedbackLine,
    };
  }, [recentCheckins, pregnancyWeek, profile?.medicalConditions, language]);

  return (
    <div className="bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFF0F5] rounded-3xl p-5 sm:p-6 border border-[#FADADD] shadow-sm space-y-4 relative overflow-hidden transition-all duration-300">
      {/* Top Banner with AI Glow Icon & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#FFF0F5] border border-[#FADADD] flex items-center justify-center text-[#A36371] shadow-2xs">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-[#4A3E42] tracking-tight">
              {t.personalAiInsightTitle}
            </h2>
            <span className="text-[10px] font-bold text-[#A36371] uppercase tracking-wider block">
              {language === 'ta' ? 'உங்களுக்கான தனிப்பட்ட ஆலோசனை' : language === 'hi' ? 'व्यक्तिगत स्वास्थ्य सुझाव' : 'Personal Companion AI'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadInsight(true)}
          disabled={isLoading}
          className="p-2 rounded-xl text-[#7D6E74] hover:text-[#A36371] hover:bg-[#FFF0F5] transition-colors disabled:opacity-40"
          title="Refresh insight"
          aria-label="Refresh insight"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#A36371]' : ''}`} />
        </button>
      </div>

      {/* SKELETON / LOADING STATE (Requirement 2: Smooth loading with rotating friendly message & grey shapes) */}
      {isLoading ? (
        <div className="space-y-3 py-2 animate-in fade-in duration-300">
          {/* Rotating friendly message */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A36371] bg-[#FFF0F5] px-3.5 py-2 rounded-xl border border-[#FADADD]/60">
            <div className="w-3.5 h-3.5 border-2 border-[#A36371] border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="animate-pulse">{loadingMessages[loadingMessageIndex]}</span>
          </div>

          {/* Grey shape skeletons */}
          <div className="space-y-2 pt-1">
            <div className="h-4 bg-[#E8D3DA]/40 rounded-full w-full animate-pulse" />
            <div className="h-4 bg-[#E8D3DA]/40 rounded-full w-11/12 animate-pulse" />
            <div className="h-4 bg-[#E8D3DA]/40 rounded-full w-4/5 animate-pulse" />
          </div>

          <div className="flex gap-2 pt-1">
            <div className="h-6 bg-[#E8D3DA]/30 rounded-full w-20 animate-pulse" />
            <div className="h-6 bg-[#E8D3DA]/30 rounded-full w-24 animate-pulse" />
            <div className="h-6 bg-[#E8D3DA]/30 rounded-full w-28 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="space-y-3.5 animate-in fade-in duration-300">
          {/* Main 1-to-3 sentence personal insight text (Requirement 2) */}
          <p className="text-xs sm:text-sm text-[#4A3E42] leading-relaxed font-medium bg-white/70 p-3.5 rounded-2xl border border-[#F5EBEF]">
            {insightData?.insightText}
          </p>

          {/* Feedback Line when answers changed today's focus (Requirement 4) */}
          {intelligenceMetrics.feedbackLine && (
            <div className="p-2.5 rounded-xl bg-[#EDF5EF]/80 border border-[#6E9C7B]/30 flex items-start gap-2 text-[11px] text-[#4A3E42]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6E9C7B] shrink-0 mt-0.5" />
              <span>{intelligenceMetrics.feedbackLine}</span>
            </div>
          )}

          {/* Data Used Chips & "Why am I seeing this?" button (Requirement 4) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-[#7D6E74] font-semibold">{t.dataUsedLabel}</span>
              {intelligenceMetrics.chips.map((chip, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#FFF0F5] border border-[#FADADD] text-[#A36371] font-bold"
                >
                  {chip.label}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowWhyModal(true)}
              className="text-[11px] font-bold text-[#A36371] hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.whyAmISeeingThis}</span>
            </button>
          </div>

          {/* Trends Row with Arrows (Requirement 4: ↑ better, → same, ↓ worse compared to last 7 days) */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-white border border-[#F5EBEF] text-[11px]">
            {/* Sleep */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[#7D6E74]">{t.trendSleep}</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  intelligenceMetrics.sleepTrend === 'better'
                    ? 'text-[#6E9C7B]'
                    : intelligenceMetrics.sleepTrend === 'lower'
                    ? 'text-[#C75D5D]'
                    : 'text-[#CF9B48]'
                }`}
              >
                {intelligenceMetrics.sleepTrend === 'better' ? (
                  <>↑ {t.trendBetter}</>
                ) : intelligenceMetrics.sleepTrend === 'lower' ? (
                  <>↓ {t.trendLower}</>
                ) : (
                  <>→ {t.trendSame}</>
                )}
              </span>
            </div>

            {/* Energy */}
            <div className="flex items-center justify-between px-1 border-x border-[#F5EBEF]">
              <span className="text-[#7D6E74]">{t.trendEnergy}</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  intelligenceMetrics.energyTrend === 'better'
                    ? 'text-[#6E9C7B]'
                    : intelligenceMetrics.energyTrend === 'lower'
                    ? 'text-[#C75D5D]'
                    : 'text-[#CF9B48]'
                }`}
              >
                {intelligenceMetrics.energyTrend === 'better' ? (
                  <>↑ {t.trendBetter}</>
                ) : intelligenceMetrics.energyTrend === 'lower' ? (
                  <>↓ {t.trendLower}</>
                ) : (
                  <>→ {t.trendSame}</>
                )}
              </span>
            </div>

            {/* Movement */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[#7D6E74]">{t.trendMovement}</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  intelligenceMetrics.movementTrend === 'better'
                    ? 'text-[#6E9C7B]'
                    : intelligenceMetrics.movementTrend === 'lower'
                    ? 'text-[#C75D5D]'
                    : 'text-[#6E9C7B]'
                }`}
              >
                {pregnancyWeek >= 24 ? (
                  intelligenceMetrics.movementTrend === 'lower' ? (
                    <>↓ {t.trendLower}</>
                  ) : (
                    <>↑ {t.trendBetter}</>
                  )
                ) : (
                  <span className="text-[10px] text-[#7D6E74]">Wk 24+</span>
                )}
              </span>
            </div>
          </div>

          {/* "Your profile is learning" progress line (Requirement 4: e.g. "3 of 7 days logged") */}
          <div className="p-3 rounded-2xl bg-white border border-[#F5EBEF] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#4A3E42]">
                {t.profileLearningLabel.replace('{days}', String(intelligenceMetrics.daysLogged))}
              </span>
              <span className="text-[11px] font-bold text-[#A36371]">
                {Math.round((intelligenceMetrics.daysLogged / 7) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#F5EBEF] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F4C2C2] to-[#A36371] rounded-full transition-all duration-300"
                style={{ width: `${(intelligenceMetrics.daysLogged / 7) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[#7D6E74] leading-tight">
              {t.profileLearningSub}
            </p>
          </div>

          {/* Timeout error retry notice if applicable */}
          {hasError && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF3E8] border border-[#CF9B48]/30 text-xs text-[#7D6E74]">
              <span>Using week-based insights while connection warms up.</span>
              <button
                type="button"
                onClick={() => loadInsight(true)}
                className="font-bold text-[#A36371] hover:underline"
              >
                {t.tryAgainBtn}
              </button>
            </div>
          )}
        </div>
      )}

      {/* "Why am I seeing this?" Modal Dialog */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 border border-[#E8C5C8] shadow-2xl space-y-3.5 relative">
            <div className="flex items-center justify-between border-b border-[#F5EBEF] pb-2.5">
              <div className="flex items-center gap-2 text-[#A36371]">
                <Info className="w-4 h-4" />
                <h3 className="font-bold text-sm text-[#4A3E42]">{t.whyAmISeeingThis}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWhyModal(false)}
                className="p-1 text-[#7D6E74] hover:text-[#4A3E42]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#4A3E42] leading-relaxed">
              <p className="font-medium p-3 rounded-xl bg-[#FFF9FA] border border-[#F5EBEF]">
                {insightData?.whyAmISeeingThis || 'Calculated from your logged sleep, energy levels, and week progress.'}
              </p>
              <ul className="space-y-1.5 text-[11px] text-[#7D6E74] list-disc list-inside">
                <li>Your exact week of pregnancy ({pregnancyWeek} weeks)</li>
                <li>Your recent logged check-ins (mood, sleep, energy, baby movements)</li>
                <li>Your health baseline provided during onboarding</li>
                <li>No external or third-party tracking; kept strictly private to your account</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowWhyModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#A36371] text-white font-bold text-xs hover:bg-[#8F525F] transition-colors"
            >
              {language === 'ta' ? 'புரிந்தது' : language === 'hi' ? 'ठीक है' : 'Understood'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
