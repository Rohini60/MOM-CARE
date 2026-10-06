import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Heart,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  RotateCcw,
  Check,
  Droplet,
  Pill,
  Calendar,
  Smile,
  Meh,
  Frown,
  Activity,
  ShieldAlert,
  Edit3,
} from 'lucide-react';
import type { UserProfile, Checkin, CareTask, SymptomRecord } from '../../types';
import { calculatePregnancyProgress } from '../../utils/pregnancy';
import { getPregnancyWeekData } from '../../config/pregnancyWeeks';
import { saveDailyCheckin } from '../../services/firebase/checkinService';
import { updateUserProfile } from '../../services/firebase/userService';
import { requestHomeInsight, type HomeInsightResponse } from '../../services/ai/client';
import { UrgentSafetyModal } from '../../components/UrgentSafetyModal';
import { useTranslation } from '../../translations';

interface HomeScreenProps {
  profile: UserProfile | null;
  recentCheckins: Checkin[];
  careTasks: CareTask[];
  recentSymptoms: SymptomRecord[];
  onRefreshData: () => void;
  onOpenJourney: (week?: number) => void;
  onOpenSymptomCenter: () => void;
  onOpenAiChat: (prompt?: string) => void;
  onOpenReports: () => void;
}

type MoodOption = 'good' | 'okay' | 'not_well' | 'pain';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  recentCheckins,
  careTasks,
  recentSymptoms,
  onRefreshData,
  onOpenJourney,
  onOpenSymptomCenter,
  onOpenAiChat,
  onOpenReports,
}) => {
  const { language, t } = useTranslation();
  const progress = calculatePregnancyProgress(profile?.dueDate);
  const weekData = getPregnancyWeekData(progress.weeks);

  // Today checkin check
  const todayStr = new Date().toDateString();
  const todayCheckin = useMemo(() => {
    return recentCheckins.find((c) => new Date(c.createdAt).toDateString() === todayStr);
  }, [recentCheckins, todayStr]);

  const hasCheckedInToday = !!todayCheckin;

  // Guided check-in wizard state
  const [isCheckinFlowOpen, setIsCheckinFlowOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<number>(1);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Guided check-in answers
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [followupSymptom, setFollowupSymptom] = useState<string | null>(null);
  const [followupLocation, setFollowupLocation] = useState<string | null>(null);
  const [followupPainLevel, setFollowupPainLevel] = useState<number | null>(null);
  const [sleepAnswer, setSleepAnswer] = useState<'poor' | 'okay' | 'good' | null>(null);
  const [energyAnswer, setEnergyAnswer] = useState<'low' | 'normal' | 'high' | null>(null);
  const [movementAnswer, setMovementAnswer] = useState<'normal' | 'less' | 'concerned' | null>(null);

  // Safety trigger state (bypasses AI)
  const [urgentEmergencyReason, setUrgentEmergencyReason] = useState<string | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // AI Insight State with 1/day caching per user
  const [insightData, setInsightData] = useState<HomeInsightResponse | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [showWhyModal, setShowWhyModal] = useState(false);

  // "Today's Focus" 3 tasks with tick persistence in localStorage per day
  const todayDateKey = new Date().toISOString().slice(0, 10);
  const focusStorageKey = `momcare_focus_${profile?.id || 'guest'}_${todayDateKey}`;

  const [completedFocusIndices, setCompletedFocusIndices] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(focusStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFocusTask = (index: number) => {
    setCompletedFocusIndices((prev) => {
      const updated = prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index];
      try {
        localStorage.setItem(focusStorageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Missing details state (1 item at a time)
  const [missingFieldAnswered, setMissingFieldAnswered] = useState(false);
  const [tempMissingInput, setTempMissingInput] = useState('');
  const [savingMissingField, setSavingMissingField] = useState(false);

  // Loading animation message cycler
  useEffect(() => {
    if (!isLoadingInsight) return;
    const interval = setInterval(() => {
      setLoadingMessageIdx((prev) => (prev + 1) % 3);
    }, 2400);
    return () => clearInterval(interval);
  }, [isLoadingInsight]);

  // Load / Generate Insight (1 per day per user cache)
  const loadDailyInsight = async (forceRefresh = false) => {
    if (!profile) return;
    const cacheKey = `momcare_insight_${profile.id}_${todayDateKey}_${language}`;

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.insightText) {
            setInsightData(parsed);
            return;
          }
        }
      } catch {}
    }

    setIsLoadingInsight(true);
    setInsightError(false);

    try {
      const res = await requestHomeInsight({
        pregnancyWeek: progress.weeks,
        motherName: profile.preferredName || profile.displayName,
        babyNickname: profile.babyNickname || t.yourBaby,
        medicalConditions: profile.medicalConditions,
        allergies: profile.allergies || undefined,
        medications: profile.userMedications || undefined,
        recentCheckins,
        recentSymptoms,
        language,
      });

      setInsightData(res);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(res));
      } catch {}
    } catch (err) {
      console.warn('Insight fetch error or timeout, applying week fallback:', err);
      setInsightError(true);
      // Fallback week-based insight
      const fallback: HomeInsightResponse = {
        insightText:
          language === 'ta'
            ? `வணக்கம் ${profile.preferredName || profile.displayName || ''}. ${progress.weeks}-வது வாரத்தில் போதுமான தண்ணீர் குடித்து, உங்கள் உடலுக்குத் தேவையான ஓய்வு கொடுங்கள்.`
            : language === 'hi'
            ? `नमस्ते ${profile.preferredName || profile.displayName || ''}। ${progress.weeks}वें हफ्ते में दिन भर में पर्याप्त पानी पिएं और जब भी थकान महसूस हो थोड़ा आराम करें।`
            : `Welcome, ${profile.preferredName || profile.displayName || 'Mom'}. At week ${progress.weeks}, stay hydrated and take a restful 15-minute pause on your side when tired.`,
        whyAmISeeingThis:
          language === 'ta'
            ? `உங்கள் கர்ப்ப வாரம் (${progress.weeks}) மற்றும் பொதுவான வழிகாட்டுதலின் அடிப்படையில்.`
            : language === 'hi'
            ? `आपकी गर्भावस्था के ${progress.weeks}वें हफ्ते के सामान्य दिशानिर्देशों के आधार पर।`
            : `Based on your week ${progress.weeks} guidelines while your daily logs build.`,
        suggestedQuestions: [
          language === 'ta' ? `${progress.weeks}-வது வாரத்தில் என்ன மாற்றங்கள் நிகழும்?` : language === 'hi' ? `${progress.weeks}वें हफ्ते में क्या शारीरिक बदलाव होते हैं?` : `What changes happen in week ${progress.weeks}?`,
          language === 'ta' ? `முதுகு வலியை இயற்கை முறையில் சரி செய்வது எப்படி?` : language === 'hi' ? `पीठ दर्द कम करने के घरेलू तरीके क्या हैं?` : `How can I gently soothe backache?`,
          language === 'ta' ? `உணவில் என்னென்ன சத்துக்கள் அதிகம் சேர்க்க வேண்டும்?` : language === 'hi' ? `खान-पान में किन पोषक तत्वों पर ध्यान दें?` : `Which nutrients are key this week?`,
        ],
        suggestedFocusTasks: [
          language === 'ta' ? '8 டம்ளர் தண்ணீர் குடிக்கவும்' : language === 'hi' ? 'दिन भर में 8 गिलास पानी पिएं' : 'Drink 8 glasses of water today',
          language === 'ta' ? '15 நிமிடம் இடது பக்கம் சாய்ந்து அமைதியாக ஓய்வெடுக்கவும்' : language === 'hi' ? '15 मिनट बाईं करवट लेटकर आराम करें' : '15-minute side-lying rest pause',
          progress.weeks >= 28
            ? (language === 'ta' ? 'குழந்தையின் அசைவுகளை கவனிக்கவும்' : language === 'hi' ? 'शिशु की हलचल गिनें' : 'Count baby active movements after meals')
            : (language === 'ta' ? 'இரும்புச்சத்து / ஃபோலிக் ஆசிட் மாத்திரை எடுக்கவும்' : language === 'hi' ? 'आयरन और फोलिक एसिड लें' : 'Take prenatal vitamin with folic acid'),
        ],
      };
      setInsightData(fallback);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  useEffect(() => {
    loadDailyInsight();
  }, [profile?.id, recentCheckins.length, language]);

  // Handle Red Emergency Trigger
  const triggerEmergency = (reason: string) => {
    setUrgentEmergencyReason(reason);
    setIsEmergencyModalOpen(true);
    setIsCheckinFlowOpen(false);
  };

  // Determine Total Checkin Flow Steps
  const isAfter28 = progress.weeks >= 28;
  const totalFlowSteps = useMemo(() => {
    let steps = 1; // Step 1: Mood
    if (selectedMood === 'not_well' || selectedMood === 'pain') {
      steps += 1; // Step 2: Followup details
    }
    steps += 1; // Energy / Sleep
    if (isAfter28) {
      steps += 1; // Baby movement after week 28
    }
    return steps;
  }, [selectedMood, isAfter28]);

  // Start guided check-in
  const handleStartCheckin = (moodChoice?: MoodOption) => {
    if (moodChoice) {
      setSelectedMood(moodChoice);
      setFlowStep(2);
    } else {
      setSelectedMood(null);
      setFlowStep(1);
    }
    setFollowupSymptom(null);
    setFollowupLocation(null);
    setFollowupPainLevel(null);
    setSleepAnswer(null);
    setEnergyAnswer(null);
    setMovementAnswer(null);
    setIsCheckinFlowOpen(true);
  };

  // Save the checkin at end of flow
  const handleFinishCheckin = async () => {
    if (!profile) return;
    setSavingCheckin(true);

    try {
      const checkinMoodMapped =
        selectedMood === 'good'
          ? 'good'
          : selectedMood === 'okay'
          ? 'okay'
          : selectedMood === 'not_well'
          ? 'not_great'
          : 'worried';

      const checkin: Checkin = {
        id: todayCheckin?.id || `chk_${Date.now()}`,
        userId: profile.id,
        week: progress.weeks,
        mood: checkinMoodMapped,
        energy: energyAnswer || 'normal',
        sleep: sleepAnswer || 'okay',
        babyMovement: movementAnswer || (isAfter28 ? 'normal' : 'not_felt_yet'),
        discomfortLocations: followupLocation ? [followupLocation] : undefined,
        painLevel: followupPainLevel || undefined,
        symptoms: followupSymptom || undefined,
        createdAt: todayCheckin?.createdAt || new Date().toISOString(),
      };

      await saveDailyCheckin(checkin);
      setSaveSuccessNotice(true);
      setIsCheckinFlowOpen(false);
      onRefreshData();

      // Refresh daily insight after new check-in
      loadDailyInsight(true);

      setTimeout(() => {
        setSaveSuccessNotice(false);
      }, 4000);
    } catch (err) {
      console.error('Error saving check-in:', err);
    } finally {
      setSavingCheckin(false);
    }
  };

  // 7-day trend calculations (sleep, energy, movement)
  const trends = useMemo(() => {
    if (recentCheckins.length < 2) {
      return { sleep: 'same', energy: 'same', movement: 'same' };
    }
    const recent = recentCheckins.slice(0, 3);
    const older = recentCheckins.slice(3, 7);

    const scoreSleep = (val?: string) => (val === 'good' ? 3 : val === 'okay' ? 2 : 1);
    const scoreEnergy = (val?: string) => (val === 'high' ? 3 : val === 'normal' ? 2 : 1);
    const scoreMov = (val?: string) => (val === 'normal' ? 3 : val === 'less' ? 1 : 2);

    const avg = (arr: Checkin[], scorer: (val?: string) => number) => {
      if (arr.length === 0) return 2;
      return arr.reduce((acc, c) => acc + scorer((c as any)[scorer.name]), 0) / arr.length;
    };

    const sRecent = recent.reduce((a, c) => a + scoreSleep(c.sleep), 0) / recent.length;
    const sOlder = older.length ? older.reduce((a, c) => a + scoreSleep(c.sleep), 0) / older.length : sRecent;

    const eRecent = recent.reduce((a, c) => a + scoreEnergy(c.energy), 0) / recent.length;
    const eOlder = older.length ? older.reduce((a, c) => a + scoreEnergy(c.energy), 0) / older.length : eRecent;

    const mRecent = recent.reduce((a, c) => a + scoreMov(c.babyMovement), 0) / recent.length;
    const mOlder = older.length ? older.reduce((a, c) => a + scoreMov(c.babyMovement), 0) / older.length : mRecent;

    const toTrend = (diff: number) => (diff > 0.3 ? 'better' : diff < -0.3 ? 'lower' : 'same');

    return {
      sleep: toTrend(sRecent - sOlder),
      energy: toTrend(eRecent - eOlder),
      movement: toTrend(mRecent - mOlder),
    };
  }, [recentCheckins]);

  // Data chips used in insight
  const dataChips = useMemo(() => {
    const chips: string[] = [];
    chips.push(`Week ${progress.weeks}`);

    if (profile?.medicalConditions && profile.medicalConditions.length > 0 && !profile.medicalConditions.includes('Prefer not to say')) {
      chips.push(`Baseline: ${profile.medicalConditions[0]}`);
    }

    if (todayCheckin) {
      if (todayCheckin.sleep) chips.push(`Sleep: ${todayCheckin.sleep}`);
      if (todayCheckin.energy) chips.push(`Energy: ${todayCheckin.energy}`);
      if (todayCheckin.discomfortLocations?.length) chips.push(todayCheckin.discomfortLocations[0]);
    } else if (recentCheckins.length > 0) {
      const last = recentCheckins[0];
      if (last.sleep) chips.push(`Recent sleep: ${last.sleep}`);
    }

    return chips.slice(0, 3);
  }, [progress.weeks, profile?.medicalConditions, todayCheckin, recentCheckins]);

  // Smart Nudges (max 2)
  const smartNudges = useMemo(() => {
    const nudges: Array<{ id: string; text: string; icon: string; action?: () => void }> = [];

    // Nudge 1: No check-in today
    if (!hasCheckedInToday) {
      nudges.push({
        id: 'no_checkin',
        text: t.nudgeCheckin,
        icon: '📝',
        action: () => handleStartCheckin(),
      });
    }

    // Nudge 2: Baby movement not logged after week 28
    if (isAfter28 && (!todayCheckin || !todayCheckin.babyMovement || todayCheckin.babyMovement === 'not_felt_yet')) {
      nudges.push({
        id: 'movement',
        text: t.nudgeMovement,
        icon: '👶',
        action: () => handleStartCheckin('good'),
      });
    }

    // Nudge 3: Water reminder
    if (nudges.length < 2) {
      nudges.push({
        id: 'water',
        text: t.nudgeWater,
        icon: '💧',
      });
    }

    return nudges.slice(0, 2);
  }, [hasCheckedInToday, isAfter28, todayCheckin, t]);

  // Gentle missing detail item (1 only)
  const missingDetailItem = useMemo(() => {
    if (missingFieldAnswered || !profile) return null;

    if (!profile.doctorPhone && !profile.doctorName) {
      return {
        key: 'doctorPhone',
        label: language === 'ta' ? 'உங்கள் மருத்துவமனை அல்லது மருத்துவர் தொலைபேசி எண்?' : language === 'hi' ? 'अपने डॉक्टर या अस्पताल का फोन नंबर जोड़ें:' : "Add your doctor or maternity clinic phone number:",
        placeholder: 'e.g. 98401 23456',
        type: 'tel',
      };
    }

    if (!profile.familyContactPhone) {
      return {
        key: 'familyContactPhone',
        label: language === 'ta' ? 'அவசரத்திற்கு தொடர்பு கொள்ள வேண்டிய குடும்ப உறுப்பினர் எண்:' : language === 'hi' ? 'आपातकालीन परिवार संपर्क नंबर:' : "Add an emergency family contact phone:",
        placeholder: 'e.g. 98765 43210',
        type: 'tel',
      };
    }

    if (!profile.babyNickname) {
      return {
        key: 'babyNickname',
        label: language === 'ta' ? 'பாப்பாவை நீங்கள் அன்போடு அழைக்கும் பெயர்:' : language === 'hi' ? 'शिशु का प्यार भरा उपनाम:' : "What nickname do you call baby?",
        placeholder: 'e.g. Chinnu, Peanut, Kanna...',
        type: 'text',
      };
    }

    return null;
  }, [profile, missingFieldAnswered, language]);

  const handleSaveMissingField = async () => {
    if (!profile || !missingDetailItem || !tempMissingInput.trim()) return;
    setSavingMissingField(true);
    try {
      await updateUserProfile(profile.id, {
        [missingDetailItem.key]: tempMissingInput.trim(),
      });
      setMissingFieldAnswered(true);
      setTempMissingInput('');
      onRefreshData();
    } catch (err) {
      console.error('Error saving missing detail:', err);
    } finally {
      setSavingMissingField(false);
    }
  };

  // Loading animation messages
  const loadingMessages = [t.loadingInsightMsg1, t.loadingInsightMsg2, t.loadingInsightMsg3];

  // Dynamic greeting based on recent state
  const dynamicGreeting = useMemo(() => {
    const name = profile?.preferredName || profile?.displayName || 'Mom';
    const baby = profile?.babyNickname || t.yourBaby;

    if (todayCheckin) {
      if (todayCheckin.mood === 'good') {
        return language === 'ta'
          ? `இனிய வணக்கம், ${name}! இன்று நீங்கள் உற்சாகமாக உள்ளீர்கள். ${baby}-யும் மகிழ்ச்சியாக இருக்கிறது.`
          : language === 'hi'
          ? `नमस्ते, ${name}! आज आप अच्छा महसूस कर रही हैं। ${baby} और आप स्वस्थ रहें।`
          : `Good morning, ${name}. You logged a bright feeling today. Let's keep you and ${baby} feeling wonderful.`;
      }
    }

    if (recentCheckins.length > 0) {
      const prev = recentCheckins[0];
      if (prev.sleep === 'good') {
        return language === 'ta'
          ? `இனிய வணக்கம், ${name}! நீங்கள் நன்றாகத் தூங்கி ஓய்வெடுத்துள்ளீர்கள். நீங்களும் ${baby}-யும் நலமாக இருக்க வாழ்த்துகள்.`
          : language === 'hi'
          ? `नमस्ते, ${name}! कल आपकी नींद अच्छी रही। आइए आपके और ${baby} के दिन को आरामदायक बनाएं।`
          : `Good morning, ${name}. You rested well recently. Let's check in on you and ${baby}.`;
      }
    }

    return language === 'ta'
      ? `இனிய வணக்கம், ${name}! ${progress.weeks}-வது வாரத்தில் நீங்களும் ${baby}-யும் எப்படி இருக்கிறீர்கள்?`
      : language === 'hi'
      ? `नमस्ते, ${name}! गर्भावस्था के ${progress.weeks}वें हफ्ते में आपका और ${baby} का स्वागत है।`
      : `Good morning, ${name}. Let's check in on you and ${baby} today.`;
  }, [profile, todayCheckin, recentCheckins, progress.weeks, language, t]);

  // Tasks for Today's Focus
  const focusTasksList = useMemo(() => {
    if (insightData?.suggestedFocusTasks && insightData.suggestedFocusTasks.length >= 3) {
      return insightData.suggestedFocusTasks.slice(0, 3);
    }
    return [
      language === 'ta' ? 'இன்று குறைந்தது 8 டம்ளர் தண்ணீர் குடிக்கவும்' : language === 'hi' ? 'दिन भर में 8 गिलास पानी पिएं' : 'Drink 8 glasses of fresh water today',
      language === 'ta' ? '15 நிமிடம் இடது பக்கம் சாய்ந்து அமைதியாக ஓய்வெடுக்கவும்' : language === 'hi' ? '15 मिनट बाईं करवट लेटकर आराम करें' : '15-minute side-lying rest or quiet pause',
      progress.weeks >= 28
        ? (language === 'ta' ? 'சாப்பிட்ட பிறகு பாப்பாவின் அசைவுகளை கவனிக்கவும்' : language === 'hi' ? 'भोजन के बाद शिशु की सक्रिय हलचल गिनें' : 'Count baby kicks after lunch or dinner')
        : (language === 'ta' ? 'இரும்புச்சத்து / ஃபோலிக் ஆசிட் மாத்திரை எடுக்கவும்' : language === 'hi' ? 'आयरन और फोलिक एसिड की गोली लें' : 'Take prenatal vitamin with folic acid'),
    ];
  }, [insightData, language, progress.weeks]);

  // Suggested shortcuts for Ask MomCare
  const suggestedShortcuts = useMemo(() => {
    if (insightData?.suggestedQuestions && insightData.suggestedQuestions.length >= 3) {
      return insightData.suggestedQuestions.slice(0, 3);
    }
    return [
      language === 'ta' ? `${progress.weeks}-வது வாரத்தில் அதிக சோர்வு ஏற்படுவது ஏன்?` : language === 'hi' ? `${progress.weeks}वें हफ्ते में इतनी थकान क्यों लगती है?` : `Why am I feeling tired in week ${progress.weeks}?`,
      language === 'ta' ? `மருந்து இல்லாமல் முதுகு வலியை எப்படி குறைக்கலாம்?` : language === 'hi' ? `बिना दवा के कमर दर्द से आराम पाने के तरीके?` : `How can I soothe lower back discomfort gently?`,
      language === 'ta' ? `பாப்பாவின் அசைவை எப்போது கவனிக்க வேண்டும்?` : language === 'hi' ? `शिशु की हलचल पर कब और कैसे ध्यान दें?` : `When should I track baby active kicks?`,
    ];
  }, [insightData, language, progress.weeks]);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in transition-all duration-300">
      {/* Save Success Banner */}
      {saveSuccessNotice && (
        <div className="p-3 rounded-2xl bg-[#EDF5EF] border border-[#6E9C7B]/40 text-[#2E7D32] text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span>{t.savedSuccessCheck}</span>
          </div>
          <span className="text-[11px] font-normal">MomCare updated</span>
        </div>
      )}

      {/* 1. GREETING - Personalized to mother, baby, and recent state */}
      <div className="bg-gradient-to-r from-[#FFF5F7] via-[#FFF0F5] to-[#FCF8F6] p-4 sm:p-5 rounded-3xl border border-[#FADADD] shadow-xs space-y-1.5 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💗</span>
            <span className="text-xs font-bold text-[#A36371] uppercase tracking-wider">
              {profile?.babyNickname ? `${profile.babyNickname} & Mom` : 'MomCare Companion'}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/90 border border-[#FADADD] text-[11px] font-bold text-[#A36371]">
            Wk {progress.weeks} + {progress.days}d
          </span>
        </div>
        <h1 className="text-base sm:text-lg font-bold text-[#4A3E42] leading-snug">
          {dynamicGreeting}
        </h1>
      </div>

      {/* 2. "HOW ARE YOU TODAY?" CARD - One-tap mood row & Guided Step-by-Step Flow */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F5EBEF] shadow-xs space-y-3 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#A36371] flex items-center justify-center font-bold">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#4A3E42]">
                {t.howAreYouToday}
              </h2>
              <p className="text-[11px] text-[#7D6E74]">{t.howAreYouSub}</p>
            </div>
          </div>

          {hasCheckedInToday && !isCheckinFlowOpen && (
            <button
              onClick={() => handleStartCheckin()}
              className="text-xs font-semibold text-[#A36371] hover:underline flex items-center gap-1 bg-[#FFF0F5] px-2.5 py-1 rounded-xl border border-[#FADADD]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t.editCheckin}</span>
            </button>
          )}
        </div>

        {/* If already checked in today and not editing, show summary badge with re-selectable mood buttons */}
        {!isCheckinFlowOpen && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'good', emoji: '😊', label: t.good, desc: 'Energized' },
                { key: 'okay', emoji: '😐', label: t.okay, desc: 'Normal' },
                { key: 'not_well', emoji: '😟', label: language === 'ta' ? 'சோர்வு' : language === 'hi' ? 'थकान' : 'Not well', desc: 'Tired / Queasy' },
                { key: 'pain', emoji: '😣', label: language === 'ta' ? 'வலி/பயம்' : language === 'hi' ? 'दर्द/चिंता' : 'Pain / Worried', desc: 'Ache / Distress' },
              ].map((item) => {
                const isCurrent =
                  todayCheckin &&
                  ((item.key === 'good' && todayCheckin.mood === 'good') ||
                    (item.key === 'okay' && todayCheckin.mood === 'okay') ||
                    (item.key === 'not_well' && todayCheckin.mood === 'not_great') ||
                    (item.key === 'pain' && todayCheckin.mood === 'worried'));

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleStartCheckin(item.key as MoodOption)}
                    className={`py-3 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 min-h-[72px] active:scale-95 ${
                      isCurrent
                        ? 'bg-[#FFF0F5] border-[#A36371] text-[#A36371] shadow-2xs ring-2 ring-[#A36371]/30 font-bold'
                        : 'bg-[#FFF9FA] border-[#F5EBEF] text-[#4A3E42] hover:bg-[#FFF0F5] hover:border-[#FADADD]'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-[#A36371] stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {hasCheckedInToday && (
              <div className="p-3 rounded-2xl bg-[#FFF9FA] border border-[#F5EBEF] flex items-center justify-between text-xs text-[#7D6E74]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6E9C7B]" />
                  <span>
                    {t.doneToday} • {todayCheckin?.mood === 'good' ? '😊 Good' : todayCheckin?.mood === 'okay' ? '😐 Okay' : todayCheckin?.mood === 'not_great' ? '😟 Not well' : '😣 Pain'}
                    {todayCheckin?.sleep && ` • ${t.trendSleep}: ${todayCheckin.sleep}`}
                  </span>
                </div>
                <button
                  onClick={() => handleStartCheckin()}
                  className="text-[#A36371] font-semibold hover:underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        )}

        {/* GUIDED CHECK-IN STEP-BY-STEP DIALOG / FLOW (one question per screen) */}
        {isCheckinFlowOpen && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9FA] border border-[#FADADD] space-y-4 animate-in fade-in transition-all">
            {/* Header progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#7D6E74]">
                <span className="text-[#A36371] font-bold">
                  {t.questionProgress.replace('{current}', String(flowStep)).replace('{total}', String(totalFlowSteps))}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCheckinFlowOpen(false)}
                  className="text-[#7D6E74] hover:text-[#4A3E42] underline text-[11px]"
                >
                  Cancel
                </button>
              </div>
              <div className="w-full bg-[#E9DFDC] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#A36371] h-full transition-all duration-300"
                  style={{ width: `${(flowStep / totalFlowSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: HOW ARE YOU FEELING */}
            {flowStep === 1 && (
              <div className="space-y-3 animate-in fade-in">
                <h3 className="font-bold text-sm sm:text-base text-[#4A3E42]">
                  {t.howAreYouToday}
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: 'good', emoji: '😊', label: t.good, desc: 'Feeling well & energized' },
                    { key: 'okay', emoji: '😐', label: t.okay, desc: 'Normal pregnancy day' },
                    { key: 'not_well', emoji: '😟', label: language === 'ta' ? 'சோர்வு / உடல்நிலை சரியில்லை' : language === 'hi' ? 'तबीयत ठीक नहीं है' : 'Not well', desc: 'Nausea, tiredness, dizzy' },
                    { key: 'pain', emoji: '😣', label: language === 'ta' ? 'வலி / பயமாக உள்ளது' : language === 'hi' ? 'दर्द या घबराहट' : 'Pain / Worried', desc: 'Aches, cramps, worries' },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSelectedMood(m.key as MoodOption)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[80px] active:scale-95 ${
                        selectedMood === m.key
                          ? 'bg-white border-[#A36371] ring-2 ring-[#A36371]/30 shadow-2xs text-[#A36371]'
                          : 'bg-white border-[#E9DFDC] text-[#4A3E42] hover:bg-[#FFF0F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{m.emoji}</span>
                        {selectedMood === m.key && <Check className="w-4 h-4 text-[#A36371] stroke-[3]" />}
                      </div>
                      <span className="font-bold text-xs mt-1">{m.label}</span>
                      <span className="text-[10px] text-[#7D6E74]">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: FOLLOW-UP QUESTIONS BASED ON MOOD */}
            {flowStep === 2 && (selectedMood === 'not_well' || selectedMood === 'pain') && (
              <div className="space-y-3 animate-in fade-in">
                <h3 className="font-bold text-sm sm:text-base text-[#4A3E42]">
                  {selectedMood === 'pain'
                    ? (language === 'ta' ? 'எங்கே வலிக்கிறது மற்றும் எவ்வளவு தீவிரமாக உள்ளது?' : language === 'hi' ? 'कहाँ दर्द हो रहा है और कितना तेज है?' : 'Where is the pain and how strong is it?')
                    : (language === 'ta' ? 'உடலில் என்ன மாதிரியான அசௌகரியம் உள்ளது?' : language === 'hi' ? 'आपको क्या परेशानी महसूस हो रही है?' : 'What part or symptom feels bad?')}
                </h3>

                {/* Safety Red Flag Check (Instant trigger without AI) */}
                <div className="p-3 rounded-2xl bg-[#FFF0F2] border border-[#C62828]/30 space-y-2 text-xs">
                  <span className="font-bold text-[#C62828] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Safety Check: Tap if you notice any red signs:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'bleeding', label: language === 'ta' ? 'இரத்தக்கசிவு' : language === 'hi' ? 'रक्तस्राव (Bleeding)' : 'Vaginal bleeding' },
                      { key: 'severe_headache', label: language === 'ta' ? 'கடுமையான தலைவலி / மங்கலான பார்வை' : language === 'hi' ? 'तेज सिरदर्द / धुंधली दृष्टि' : 'Severe headache with blurred vision' },
                      { key: 'fluid_leak', label: language === 'ta' ? 'தண்ணீர் வெளியேறுதல்' : language === 'hi' ? 'पानी छूटना' : 'Water or fluid leak' },
                      { key: 'severe_belly', label: language === 'ta' ? 'கடுமையான வயிற்று வலி' : language === 'hi' ? 'तेज पेट दर्द' : 'Severe abdominal pain' },
                    ].map((rf) => (
                      <button
                        key={rf.key}
                        type="button"
                        onClick={() => triggerEmergency(rf.label)}
                        className="px-2.5 py-1 rounded-xl bg-white border border-[#C62828] text-[#C62828] text-[11px] font-bold hover:bg-[#C62828] hover:text-white transition-colors"
                      >
                        ⚠️ {rf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Common Tappable Locations */}
                <div>
                  <label className="block text-xs font-semibold text-[#7D6E74] mb-1.5">
                    Location:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Lower back',
                      'Lower belly / pelvis',
                      'Head / temples',
                      'Legs / swollen ankles',
                      'Stomach / heartburn',
                      'Hips / pelvic bone',
                    ].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setFollowupLocation(followupLocation === loc ? null : loc)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all min-h-[44px] ${
                          followupLocation === loc
                            ? 'bg-[#FFF0F5] border-[#A36371] text-[#A36371] font-bold ring-1 ring-[#A36371]'
                            : 'bg-white border-[#E9DFDC] text-[#4A3E42] hover:bg-[#FFF0F5]'
                        }`}
                      >
                        {followupLocation === loc && '✓ '}
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pain Intensity Level (1 to 5) */}
                <div>
                  <label className="block text-xs font-semibold text-[#7D6E74] mb-1.5">
                    Strength:
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { lvl: 1, label: 'Mild' },
                      { lvl: 2, label: 'Moderate' },
                      { lvl: 3, label: 'Noticeable' },
                      { lvl: 4, label: 'Strong' },
                    ].map((p) => (
                      <button
                        key={p.lvl}
                        type="button"
                        onClick={() => setFollowupPainLevel(followupPainLevel === p.lvl ? null : p.lvl)}
                        className={`py-2 rounded-xl border font-semibold transition-all min-h-[44px] ${
                          followupPainLevel === p.lvl
                            ? 'bg-[#A36371] text-white border-[#A36371]'
                            : 'bg-white border-[#E9DFDC] text-[#4A3E42]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP: SLEEP AND ENERGY */}
            {((flowStep === 2 && selectedMood !== 'not_well' && selectedMood !== 'pain') ||
              (flowStep === 3 && (selectedMood === 'not_well' || selectedMood === 'pain'))) && (
              <div className="space-y-3 animate-in fade-in">
                <h3 className="font-bold text-sm sm:text-base text-[#4A3E42]">
                  {language === 'ta' ? 'உங்கள் தூக்கம் மற்றும் உடலின் தெம்பு எப்படி உள்ளது?' : language === 'hi' ? 'आपकी नींद और ऊर्जा का स्तर कैसा है?' : 'How were your sleep and energy?'}
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#7D6E74] mb-1.5">
                    {t.trendSleep}:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'poor', label: 'Poor / Restless' },
                      { key: 'okay', label: 'Average' },
                      { key: 'good', label: 'Rested well' },
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setSleepAnswer(sleepAnswer === s.key ? null : (s.key as any))}
                        className={`p-2.5 rounded-2xl border text-xs text-center transition-all min-h-[48px] font-semibold ${
                          sleepAnswer === s.key
                            ? 'bg-[#FFF0F5] border-[#A36371] text-[#A36371] ring-2 ring-[#A36371]/30'
                            : 'bg-white border-[#E9DFDC] text-[#4A3E42] hover:bg-[#FFF0F5]'
                        }`}
                      >
                        {sleepAnswer === s.key && '✓ '}
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7D6E74] mb-1.5">
                    {t.trendEnergy}:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'low', label: 'Low / Fatigued' },
                      { key: 'normal', label: 'Normal' },
                      { key: 'high', label: 'High / Active' },
                    ].map((e) => (
                      <button
                        key={e.key}
                        type="button"
                        onClick={() => setEnergyAnswer(energyAnswer === e.key ? null : (e.key as any))}
                        className={`p-2.5 rounded-2xl border text-xs text-center transition-all min-h-[48px] font-semibold ${
                          energyAnswer === e.key
                            ? 'bg-[#FFF0F5] border-[#A36371] text-[#A36371] ring-2 ring-[#A36371]/30'
                            : 'bg-white border-[#E9DFDC] text-[#4A3E42] hover:bg-[#FFF0F5]'
                        }`}
                      >
                        {energyAnswer === e.key && '✓ '}
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP: BABY MOVEMENT (AFTER WEEK 28) */}
            {flowStep === totalFlowSteps && isAfter28 && (
              <div className="space-y-3 animate-in fade-in">
                <h3 className="font-bold text-sm sm:text-base text-[#4A3E42]">
                  {language === 'ta'
                    ? '28 வாரங்களுக்குப் பிறகு: இன்று பாப்பாவின் அசைவுகள் எப்படி உள்ளன?'
                    : language === 'hi'
                    ? '28वें हफ्ते के बाद: आज शिशु की हलचल कैसी रही?'
                    : 'Week 28+: How are baby kicks & movements today?'}
                </h3>
                <p className="text-xs text-[#7D6E74]">
                  {language === 'ta'
                    ? 'அசைவு சற்றும் தெரியவில்லை என்றால் உடனே மருத்துவரை தொடர்பு கொள்ளுங்கள்.'
                    : language === 'hi'
                    ? 'यदि बिल्कुल हलचल न हो तो तुरंत डॉक्टर से संपर्क करें।'
                    : 'If you feel zero movement, contact your maternity unit immediately.'}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'normal', label: 'Active & Normal 👶' },
                    { key: 'less', label: 'Slower than usual' },
                    { key: 'concerned', label: 'Worried / Not felt' },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => {
                        if (m.key === 'concerned') {
                          triggerEmergency('No or severely decreased baby movement in third trimester');
                          return;
                        }
                        setMovementAnswer(movementAnswer === m.key ? null : (m.key as any));
                      }}
                      className={`p-3 rounded-2xl border text-xs text-center transition-all min-h-[52px] font-semibold ${
                        movementAnswer === m.key
                          ? 'bg-[#FFF0F5] border-[#A36371] text-[#A36371] ring-2 ring-[#A36371]/30'
                          : m.key === 'concerned'
                          ? 'bg-[#FFF0F2] border-[#C62828] text-[#C62828]'
                          : 'bg-white border-[#E9DFDC] text-[#4A3E42] hover:bg-[#FFF0F5]'
                      }`}
                    >
                      {movementAnswer === m.key && '✓ '}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation buttons: Back / Skip / Next / Save */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F5EBEF]">
              {flowStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setFlowStep((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#7D6E74] hover:bg-white flex items-center gap-1 transition-colors min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {flowStep < totalFlowSteps ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setFlowStep((prev) => prev + 1)}
                      className="px-3 py-2 text-xs text-[#7D6E74] hover:underline min-h-[44px]"
                    >
                      {t.skipQuestion}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlowStep((prev) => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-[#A36371] text-white text-xs font-bold hover:bg-[#8F525F] transition-colors shadow-2xs min-h-[44px]"
                    >
                      Continue →
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={savingCheckin}
                    onClick={handleFinishCheckin}
                    className="px-5 py-2.5 rounded-xl bg-[#A36371] text-white text-xs font-bold hover:bg-[#8F525F] transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50 min-h-[44px]"
                  >
                    {savingCheckin ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Check-in</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. PERSONAL AI INSIGHT CARD - With data chips, 'Why am I seeing this?', and 7-day trends */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F5EBEF] shadow-xs space-y-3.5 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FAF3E8] to-[#FFF0F5] border border-[#FADADD] text-[#A36371] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#4A3E42]">
                {t.personalAiInsightTitle}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-[#7D6E74]">
                <span>
                  {t.profileLearningLabel.replace('{days}', String(Math.min(7, recentCheckins.length)))}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowWhyModal(true)}
            className="text-[11px] font-semibold text-[#A36371] hover:underline flex items-center gap-1 bg-[#FFF0F5] px-2 py-0.5 rounded-lg border border-[#FADADD]"
          >
            <HelpCircle className="w-3 h-3" />
            <span>{t.whyAmISeeingThis}</span>
          </button>
        </div>

        {/* Loading skeleton / friendly state with animated text if waiting */}
        {isLoadingInsight ? (
          <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5EBEF] space-y-3 animate-pulse">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#A36371]">
              <div className="w-4 h-4 border-2 border-[#A36371] border-t-transparent rounded-full animate-spin" />
              <span>{loadingMessages[loadingMessageIdx]}</span>
            </div>
            <div className="h-3 bg-[#F2E1E3] rounded-md w-3/4" />
            <div className="h-3 bg-[#F2E1E3] rounded-md w-full" />
            <div className="h-3 bg-[#F2E1E3] rounded-md w-2/3" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* The Main Insight (Maximum 3 sentences) */}
            <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FADADD]/80 space-y-2">
              <p className="text-xs sm:text-sm text-[#4A3E42] leading-relaxed">
                {insightData?.insightText ||
                  `At week ${progress.weeks}, your body is doing wonderful work. Stay hydrated and take a restful 15-minute side-lying break when tired.`}
              </p>

              {/* Data tags used in this insight */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-[#7D6E74] font-medium">{t.dataUsedLabel}</span>
                {dataChips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#E9DFDC] text-[10px] text-[#7D6E74] font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* 7-day Trend Row with arrows */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#FFF9FA] border border-[#F5EBEF]">
                <span className="text-[10px] text-[#7D6E74] block">{t.trendSleep}</span>
                <span className="font-bold flex items-center justify-center gap-0.5 text-[#4A3E42]">
                  {trends.sleep === 'better' ? (
                    <span className="text-[#6E9C7B] flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" /> {t.trendBetter}
                    </span>
                  ) : trends.sleep === 'lower' ? (
                    <span className="text-[#A36371] flex items-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" /> {t.trendLower}
                    </span>
                  ) : (
                    <span className="text-[#7D6E74] flex items-center gap-0.5">
                      <Minus className="w-3.5 h-3.5" /> {t.trendSame}
                    </span>
                  )}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-[#FFF9FA] border border-[#F5EBEF]">
                <span className="text-[10px] text-[#7D6E74] block">{t.trendEnergy}</span>
                <span className="font-bold flex items-center justify-center gap-0.5 text-[#4A3E42]">
                  {trends.energy === 'better' ? (
                    <span className="text-[#6E9C7B] flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" /> {t.trendBetter}
                    </span>
                  ) : trends.energy === 'lower' ? (
                    <span className="text-[#A36371] flex items-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" /> {t.trendLower}
                    </span>
                  ) : (
                    <span className="text-[#7D6E74] flex items-center gap-0.5">
                      <Minus className="w-3.5 h-3.5" /> {t.trendSame}
                    </span>
                  )}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-[#FFF9FA] border border-[#F5EBEF]">
                <span className="text-[10px] text-[#7D6E74] block">{t.trendMovement}</span>
                <span className="font-bold flex items-center justify-center gap-0.5 text-[#4A3E42]">
                  {trends.movement === 'better' ? (
                    <span className="text-[#6E9C7B] flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" /> {t.trendBetter}
                    </span>
                  ) : trends.movement === 'lower' ? (
                    <span className="text-[#A36371] flex items-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" /> {t.trendLower}
                    </span>
                  ) : (
                    <span className="text-[#7D6E74] flex items-center gap-0.5">
                      <Minus className="w-3.5 h-3.5" /> {t.trendSame}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {insightError && (
              <div className="flex items-center justify-between text-xs text-[#7D6E74] pt-1">
                <span>Week-based guidance displayed</span>
                <button
                  onClick={() => loadDailyInsight(true)}
                  className="text-[#A36371] font-semibold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.tryAgainBtn}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. TODAY'S FOCUS (3 tasks based on her situation) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F5EBEF] shadow-xs space-y-3 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-[#4A3E42]">
              {t.todaysFocusTitle}
            </h2>
            <p className="text-[11px] text-[#7D6E74]">
              {t.todaysFocusCount.replace('{completed}', String(completedFocusIndices.length))}
            </p>
          </div>
          <span className="text-xs font-bold text-[#6E9C7B] bg-[#EDF5EF] px-2.5 py-1 rounded-full border border-[#CFE3D5]">
            {completedFocusIndices.length === 3 ? '3/3 Done 🌸' : `${completedFocusIndices.length}/3`}
          </span>
        </div>

        <div className="space-y-2">
          {focusTasksList.map((taskText, idx) => {
            const isDone = completedFocusIndices.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleFocusTask(idx)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 min-h-[48px] active:scale-98 ${
                  isDone
                    ? 'bg-[#EDF5EF]/60 border-[#6E9C7B] text-[#7D6E74]'
                    : 'bg-[#FFF9FA] border-[#F5EBEF] text-[#4A3E42] hover:bg-[#FFF0F5]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-[#6E9C7B] border-[#6E9C7B] text-white'
                        : 'border-[#E9DFDC] bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <span className={`text-xs font-medium leading-snug ${isDone ? 'line-through text-[#7D6E74]' : 'text-[#4A3E42]'}`}>
                    {taskText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {completedFocusIndices.length === 3 && (
          <p className="text-xs text-[#2E7D32] font-semibold text-center bg-[#EDF5EF] p-2.5 rounded-xl">
            {t.allTasksDone}
          </p>
        )}
      </div>

      {/* 5. SMART NUDGES (Max 2 reminders) */}
      {smartNudges.length > 0 && (
        <div className="bg-[#FFF0F5]/50 rounded-3xl p-4 sm:p-5 border border-[#FADADD] shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#A36371]">
            <span>🔔</span>
            <span>{t.smartNudgesTitle}</span>
          </div>

          <div className="space-y-2">
            {smartNudges.map((nudge) => (
              <div
                key={nudge.id}
                onClick={nudge.action}
                className={`p-3 rounded-2xl bg-white border border-[#FADADD] flex items-center justify-between gap-3 text-xs shadow-2xs transition-all ${
                  nudge.action ? 'cursor-pointer hover:border-[#A36371]' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg shrink-0">{nudge.icon}</span>
                  <p className="text-[#4A3E42] font-medium leading-relaxed">{nudge.text}</p>
                </div>
                {nudge.action && (
                  <button className="text-[#A36371] font-bold shrink-0 text-xs hover:underline">
                    Take action →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ASK FOR MISSING DETAILS GENTLY (1 small card at a time with quick answer & skip) */}
      {missingDetailItem && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F5EBEF] shadow-xs space-y-2.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A36371] flex items-center gap-1.5">
              <span>🌸</span>
              <span>{t.knowYouBetterTitle}</span>
            </span>
            <button
              onClick={() => setMissingFieldAnswered(true)}
              className="text-[11px] text-[#7D6E74] hover:underline"
            >
              {t.skipForNow}
            </button>
          </div>

          <p className="text-xs text-[#4A3E42] font-medium leading-snug">
            {missingDetailItem.label}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <input
              type={missingDetailItem.type}
              value={tempMissingInput}
              onChange={(e) => setTempMissingInput(e.target.value)}
              placeholder={missingDetailItem.placeholder}
              className="flex-1 bg-[#FFF9FA] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#4A3E42] focus:outline-hidden focus:border-[#A36371]"
            />
            <button
              disabled={savingMissingField || !tempMissingInput.trim()}
              onClick={handleSaveMissingField}
              className="px-4 py-2 rounded-xl bg-[#A36371] text-white text-xs font-bold hover:bg-[#8F525F] transition-colors disabled:opacity-40 shadow-2xs shrink-0"
            >
              {savingMissingField ? '...' : t.saveAnswer}
            </button>
          </div>
        </div>
      )}

      {/* 7. ASK MOMCARE SHORTCUTS (3 questions made from her own situation) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F5EBEF] shadow-xs space-y-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#A36371] mb-0.5">
            <Sparkles className="w-4 h-4" />
            <span>{t.askMomCareShortcutsTitle}</span>
          </div>
          <p className="text-[11px] text-[#7D6E74]">{t.askMomCareShortcutsSub}</p>
        </div>

        <div className="space-y-2">
          {suggestedShortcuts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenAiChat(q)}
              className="w-full p-3 rounded-2xl bg-[#FFF9FA] border border-[#F5EBEF] hover:border-[#FADADD] hover:bg-[#FFF0F5] transition-all text-left flex items-center justify-between gap-3 text-xs font-medium text-[#4A3E42] shadow-2xs group min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#A36371] font-bold">💬</span>
                <span>{q}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7D6E74] group-hover:text-[#A36371] shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 8. WEEKLY SNAPSHOT (Smaller card below personal cards) */}
      <div className="bg-white rounded-3xl p-4 border border-[#F5EBEF] shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F5] border border-[#FADADD] flex items-center justify-center text-xl shrink-0">
            👶
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#4A3E42]">
                Week {progress.weeks}
              </span>
              <span className="text-[11px] text-[#A36371] font-medium">
                • Size of {weekData.fruitComparison}
              </span>
            </div>
            <p className="text-[11px] text-[#7D6E74]">
              {weekData.approxLength}, {weekData.approxWeight}
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenJourney(progress.weeks)}
          className="text-xs font-bold text-[#A36371] hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>{t.viewFullStory}</span>
        </button>
      </div>

      {/* Quick Action Buttons for Triage & Scans */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={onOpenSymptomCenter}
          className="p-3 rounded-2xl bg-white border border-[#F5EBEF] hover:border-[#E8C5C8] transition-all flex items-center gap-2.5 shadow-2xs min-h-[52px]"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#A36371] flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="font-bold text-[#4A3E42] block">{t.safetyTriageBtn}</span>
            <span className="text-[10px] text-[#7D6E74]">Green/Yellow/Red triage</span>
          </div>
        </button>

        <button
          onClick={onOpenReports}
          className="p-3 rounded-2xl bg-white border border-[#F5EBEF] hover:border-[#E8C5C8] transition-all flex items-center gap-2.5 shadow-2xs min-h-[52px]"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#A36371] flex items-center justify-center shrink-0">
            <span className="text-sm">📋</span>
          </div>
          <div className="text-left">
            <span className="font-bold text-[#4A3E42] block">{t.medicalReportsBtn}</span>
            <span className="text-[10px] text-[#7D6E74]">Explain scans & labs</span>
          </div>
        </button>
      </div>

      {/* Safety Note at bottom */}
      <div className="pt-2 text-center">
        <p className="text-[11px] text-[#7D6E74] leading-relaxed max-w-sm mx-auto">
          {t.homeDisclaimerNote}
        </p>
      </div>

      {/* "Why am I seeing this?" Simple Explanation Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#FADADD] shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#4A3E42] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#A36371]" />
                <span>{t.whyAmISeeingThis}</span>
              </h3>
              <button
                onClick={() => setShowWhyModal(false)}
                className="text-[#7D6E74] hover:text-[#4A3E42] font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#4A3E42] leading-relaxed">
              {insightData?.whyAmISeeingThis ||
                'This suggestion was generated from your recent daily check-ins, current gestational week, and health history.'}
            </p>

            <div className="p-3 rounded-xl bg-[#FFF9FA] border border-[#F5EBEF] text-[11px] text-[#7D6E74] space-y-1">
              <span className="font-bold text-[#4A3E42] block">Data considered:</span>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Gestational week: {progress.weeks}</li>
                <li>Your logged sleep and energy trends</li>
                <li>Reported pain locations and comfort levels</li>
                <li>Tracked health baseline from onboarding</li>
              </ul>
            </div>

            <button
              onClick={() => setShowWhyModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#A36371] text-white text-xs font-bold hover:bg-[#8F525F] transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Red Emergency Protocol Trigger Modal (Fixed rule, runs first without AI) */}
      <UrgentSafetyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        emergencyReason={urgentEmergencyReason || undefined}
        doctorName={profile?.doctorName || undefined}
        doctorPhone={profile?.doctorPhone || undefined}
        familyContactPhone={profile?.familyContactPhone || undefined}
      />
    </div>
  );
};
