import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit3,
  Heart,
  Moon,
  Zap,
  Activity,
  Smile,
  Meh,
  Frown,
  AlertCircle,
} from 'lucide-react';
import type { UserProfile, Checkin } from '../../types';
import { useTranslation } from '../../translations';

interface GuidedDailyCheckinProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  todayCheckin?: Checkin | null;
  onSaveCheckin: (checkinData: Partial<Checkin>) => Promise<void>;
  onTriggerEmergency: (reason: string) => void;
}

export const GuidedDailyCheckin: React.FC<GuidedDailyCheckinProps> = ({
  profile,
  pregnancyWeek,
  todayCheckin,
  onSaveCheckin,
  onTriggerEmergency,
}) => {
  const { language, t } = useTranslation();

  // Mode: 'summary' (if already completed today and not editing) or 'guided' (filling out questions)
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Form states initialized from todayCheckin if available
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'not_great' | 'worried' | null>(
    todayCheckin?.mood || null
  );
  const [selectedDiscomfort, setSelectedDiscomfort] = useState<string[]>(
    todayCheckin?.discomfortLocations || []
  );
  const [discomfortSeverity, setDiscomfortSeverity] = useState<'mild' | 'moderate' | 'severe' | null>(null);
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'okay' | 'good' | null>(
    todayCheckin?.sleep || null
  );
  const [energyLevel, setEnergyLevel] = useState<'low' | 'normal' | 'high' | null>(
    todayCheckin?.energy || null
  );
  const [babyMovement, setBabyMovement] = useState<'normal' | 'less' | 'concerned' | 'not_felt_yet' | null>(
    todayCheckin?.babyMovement || null
  );
  const [tookIronOrVitamins, setTookIronOrVitamins] = useState<boolean | null>(null);

  // Sync if todayCheckin changes
  useEffect(() => {
    if (todayCheckin) {
      setMood(todayCheckin.mood);
      setSelectedDiscomfort(todayCheckin.discomfortLocations || []);
      setSleepQuality(todayCheckin.sleep);
      setEnergyLevel(todayCheckin.energy);
      setBabyMovement(todayCheckin.babyMovement);
    }
  }, [todayCheckin]);

  const hasLoggedToday = Boolean(todayCheckin) && !isEditing;

  // Toggle helpers that never lock choices (tap again to deselect or tap another to switch)
  const handleMoodSelect = (val: 'good' | 'okay' | 'not_great' | 'worried') => {
    setMood((prev) => (prev === val ? null : val));
  };

  const handleDiscomfortToggle = (loc: string) => {
    // Red flag safety check runs first without AI
    if (loc.includes('⚠️')) {
      onTriggerEmergency(loc.replace('⚠️', '').trim());
      return;
    }
    setSelectedDiscomfort((prev) =>
      prev.includes(loc) ? prev.filter((item) => item !== loc) : [...prev, loc]
    );
  };

  // Determine dynamic questions flow
  // Step 1: Mood
  // Step 2: Depends on mood:
  //   - If 'worried' or 'not_great': Discomfort locations & Red flag safety check
  //   - If 'okay' or 'good': Sleep & Energy check
  // Step 3:
  //   - If discomfort was picked and includes headache: Headache follow-up / pain intensity
  //   - If 'worried' / 'not_great': Sleep & Iron/Vitamins check
  //   - If week >= 24: Baby Movement check
  // Step 4: Summary screen
  const isFeelingUnwell = mood === 'not_great' || mood === 'worried';

  const totalSteps = isFeelingUnwell ? 4 : pregnancyWeek >= 24 ? 3 : 2;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      // Go to summary
      setStep(totalSteps + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else if (hasLoggedToday) {
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSaveCheckin({
        mood: mood || 'good',
        sleep: sleepQuality || 'okay',
        energy: energyLevel || 'normal',
        babyMovement: babyMovement || (pregnancyWeek >= 24 ? 'normal' : 'not_felt_yet'),
        discomfortLocations: selectedDiscomfort.length > 0 ? selectedDiscomfort : undefined,
        symptoms: selectedDiscomfort.join(', ') || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
        setStep(1);
      }, 1500);
    } catch (err) {
      console.error('Save checkin error:', err);
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Render Completed Summary Card when already checked in today
  if (hasLoggedToday && !isEditing) {
    const moodEmoji =
      todayCheckin?.mood === 'great' || todayCheckin?.mood === 'good'
        ? '😊'
        : todayCheckin?.mood === 'okay'
        ? '😐'
        : todayCheckin?.mood === 'not_great'
        ? '😟'
        : '😣';

    const moodLabel =
      todayCheckin?.mood === 'great' || todayCheckin?.mood === 'good'
        ? t.good
        : todayCheckin?.mood === 'okay'
        ? t.okay
        : todayCheckin?.mood === 'not_great'
        ? t.tired
        : t.worried;

    return (
      <div className="bg-white rounded-3xl p-5 border border-[#F5EBEF] shadow-sm space-y-3.5 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] border border-[#FADADD] flex items-center justify-center text-xl shadow-2xs">
              {moodEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#4A3E42]">
                  {language === 'ta'
                    ? 'இன்றைய பதிவு முடிந்தது'
                    : language === 'hi'
                    ? 'आज की जांच पूरी हुई'
                    : "Today's Check-in Complete"}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6E9C7B] bg-[#EDF5EF] px-2 py-0.5 rounded-full border border-[#CFE3D5]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.doneToday}</span>
                </span>
              </div>
              <p className="text-xs text-[#7D6E74]">
                {language === 'ta'
                  ? `உடல்நிலை: ${moodLabel}`
                  : language === 'hi'
                  ? `स्थिति: ${moodLabel}`
                  : `Feeling: ${moodLabel}`}
              </p>
            </div>
          </div>

          {/* Edit Check-in Option (Requirement 1) */}
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setStep(1);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E8C5C8] bg-[#FFF0F5] text-[#A36371] hover:bg-[#FADADD]/60 text-xs font-bold transition-all active:scale-95"
            aria-label="Edit today's checkin"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t.editCheckin}</span>
          </button>
        </div>

        {/* Small Logged Attributes Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
          {todayCheckin?.sleep && (
            <span className="px-2.5 py-1 rounded-full bg-[#FAF3E8] border border-[#CF9B48]/30 text-[#7D6E74] font-medium flex items-center gap-1">
              <Moon className="w-3 h-3 text-[#CF9B48]" />
              {todayCheckin.sleep === 'good' ? 'Restful sleep' : todayCheckin.sleep === 'okay' ? 'Moderate sleep' : 'Restless sleep'}
            </span>
          )}
          {todayCheckin?.energy && (
            <span className="px-2.5 py-1 rounded-full bg-[#FFF0F5] border border-[#FADADD] text-[#7D6E74] font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#A36371]" />
              {todayCheckin.energy === 'high' ? 'High energy' : todayCheckin.energy === 'normal' ? 'Normal energy' : 'Low energy'}
            </span>
          )}
          {pregnancyWeek >= 24 && todayCheckin?.babyMovement && (
            <span className="px-2.5 py-1 rounded-full bg-[#EDF5EF] border border-[#6E9C7B]/30 text-[#7D6E74] font-medium flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#6E9C7B]" />
              {todayCheckin.babyMovement === 'normal' ? 'Baby active' : 'Movement monitored'}
            </span>
          )}
          {todayCheckin?.discomfortLocations && todayCheckin.discomfortLocations.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-[#FBEAEA] border border-[#C75D5D]/30 text-[#C75D5D] font-medium">
              Noted: {todayCheckin.discomfortLocations.join(', ')}
            </span>
          )}
        </div>
      </div>
    );
  }

  // GUIDED CONVERSATION FLOW (One Question per Screen)
  const isSummaryStep = step === totalSteps + 1;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F5EBEF] shadow-sm space-y-4 relative overflow-hidden transition-all duration-300">
      {/* Top Header Bar with Visible Back Button and Progress Indicator */}
      <div className="flex items-center justify-between border-b border-[#F5EBEF] pb-3">
        <div className="flex items-center gap-2">
          {(step > 1 || (isEditing && hasLoggedToday)) && (
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 rounded-xl border border-[#F5EBEF] hover:bg-[#FFF0F5] text-[#7D6E74] hover:text-[#4A3E42] transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-xs font-bold text-[#A36371] uppercase tracking-wider block">
              {isSummaryStep
                ? t.checkinSummaryTitle
                : t.questionProgress
                    .replace('{current}', String(step))
                    .replace('{total}', String(totalSteps))}
            </span>
            <span className="text-[11px] text-[#7D6E74]">
              {language === 'ta'
                ? 'வழிகாட்டப்பட்ட தினசரி பதிவு'
                : language === 'hi'
                ? 'दैनिक स्वास्थ्य जांच'
                : 'Guided Daily Check-in'}
            </span>
          </div>
        </div>

        {/* Skip button for non-safety questions */}
        {!isSummaryStep && step > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="text-xs font-semibold text-[#7D6E74] hover:text-[#A36371] hover:underline px-2 py-1"
          >
            {t.skipQuestion} →
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {!isSummaryStep && (
        <div className="w-full h-1.5 bg-[#F5EBEF] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#F4C2C2] to-[#A36371] transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      )}

      {/* STEP 1: ONE-TAP MOOD ROW */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#4A3E42]">
              {t.howAreYouToday}
            </h3>
            <p className="text-xs text-[#7D6E74] mt-0.5">
              {t.howAreYouSub}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {[
              {
                id: 'good',
                emoji: '😊',
                title: t.good,
                desc: language === 'ta' ? 'நலமாக உணர்கிறேன்' : language === 'hi' ? 'अच्छा महसूस हो रहा है' : 'Feeling healthy & calm',
                color: 'hover:border-[#6E9C7B] hover:bg-[#EDF5EF]/50',
                activeColor: 'border-[#6E9C7B] bg-[#EDF5EF] ring-2 ring-[#6E9C7B]/30 text-[#4A3E42]',
              },
              {
                id: 'okay',
                emoji: '😐',
                title: t.okay,
                desc: language === 'ta' ? 'பரவாயில்லை, சுமாராக' : language === 'hi' ? 'सामान्य, सब ठीक-ठाक' : 'Neutral / steady',
                color: 'hover:border-[#CF9B48] hover:bg-[#FAF3E8]/50',
                activeColor: 'border-[#CF9B48] bg-[#FAF3E8] ring-2 ring-[#CF9B48]/30 text-[#4A3E42]',
              },
              {
                id: 'not_great',
                emoji: '😟',
                title: t.tired,
                desc: language === 'ta' ? 'உடல் சோர்வு / அழுத்தம்' : language === 'hi' ? 'थकान या बेचैनी' : 'Low energy / tired',
                color: 'hover:border-[#A36371] hover:bg-[#FFF0F5]',
                activeColor: 'border-[#A36371] bg-[#FFF0F5] ring-2 ring-[#A36371]/30 text-[#4A3E42]',
              },
              {
                id: 'worried',
                emoji: '😣',
                title: t.worried,
                desc: language === 'ta' ? 'உடலில் வலி / பயம்' : language === 'hi' ? 'दर्द या चिंता' : 'Pain or worried',
                color: 'hover:border-[#C75D5D] hover:bg-[#FBEAEA]',
                activeColor: 'border-[#C75D5D] bg-[#FBEAEA] ring-2 ring-[#C75D5D]/30 text-[#4A3E42]',
              },
            ].map((m) => {
              const isSelected = mood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMoodSelect(m.id as any)}
                  className={`min-h-[72px] p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative active:scale-[0.98] ${
                    isSelected ? m.activeColor : `bg-[#FFF9FA] border-[#F5EBEF] ${m.color}`
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl">{m.emoji}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-current bg-white text-current shadow-2xs'
                          : 'border-[#E8D3DA] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-bold text-xs block">{m.title}</span>
                    <span className="text-[10px] text-[#7D6E74] leading-tight block mt-0.5">
                      {m.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={!mood}
              onClick={handleNext}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#A36371] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#8F525F] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
            >
              <span>{language === 'ta' ? 'அடுத்து →' : language === 'hi' ? 'आगे बढ़ें →' : 'Continue →'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DYNAMIC FOLLOW-UP BASED ON MOOD */}
      {step === 2 && isFeelingUnwell && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#4A3E42]">
              {language === 'ta'
                ? 'உடலில் எந்த பகுதியில் வலி அல்லது அசௌகரியம் உள்ளது?'
                : language === 'hi'
                ? 'शरीर में कहाँ दर्द या असहजता महसूस हो रही है?'
                : 'Which part of your body feels uncomfortable or painful?'}
            </h3>
            <p className="text-xs text-[#7D6E74] mt-0.5">
              {language === 'ta'
                ? 'பொருத்தமானவற்றைத் தட்டவும் (பலவற்றைத் தேர்ந்தெடுக்கலாம்):'
                : language === 'hi'
                ? 'उचित विकल्प चुनें (एक से अधिक चुन सकती हैं):'
                : 'Tap to select all that apply. Tap again to unselect.'}
            </p>
          </div>

          {/* CRITICAL FIXED RED EMERGENCY TILES (Always shown on pain/worried, triggers emergency modal immediately without AI) */}
          <div className="p-3 rounded-2xl bg-[#FFF0F2] border border-[#C62828]/30 space-y-2">
            <span className="text-[11px] font-bold text-[#C62828] uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {language === 'ta'
                  ? 'அவசர எச்சரிக்கை அறிகுறிகள் ஏதேனும் உள்ளதா?'
                  : language === 'hi'
                  ? 'क्या इनमें से कोई गंभीर लक्षण है?'
                  : 'Any of these urgent signs?'}
              </span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Vaginal bleeding or spotting ⚠️',
                'Severe headache with blurry vision ⚠️',
                'Fluid leaking or water broke ⚠️',
                'Severe belly / abdominal cramping ⚠️',
                pregnancyWeek >= 24 ? 'No baby movements felt today ⚠️' : null,
              ]
                .filter(Boolean)
                .map((urgentFlag) => (
                  <button
                    key={urgentFlag}
                    type="button"
                    onClick={() => onTriggerEmergency(urgentFlag!)}
                    className="p-2.5 rounded-xl bg-white border border-[#C62828]/40 hover:bg-[#C62828] hover:text-white text-[#C62828] text-xs font-bold text-left transition-all shadow-2xs flex items-center justify-between"
                  >
                    <span>{urgentFlag}</span>
                    <span className="text-xs">🔴</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Routine Pregnancy Discomfort Options */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              'Lower back ache',
              'Pelvic pressure / hips',
              'Mild nausea / stomach',
              'Legs / feet swelling',
              'Tension headache',
              'Rib cage tightness',
            ].map((loc) => {
              const isSelected = selectedDiscomfort.includes(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleDiscomfortToggle(loc)}
                  className={`min-h-[48px] p-3 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FFF0F5] border-[#A36371] text-[#A36371] font-bold ring-1 ring-[#A36371]'
                      : 'bg-[#FFF9FA] border-[#F5EBEF] text-[#4A3E42] hover:bg-[#FFF0F5]'
                  }`}
                >
                  <span>{loc}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-1.5 ${
                      isSelected ? 'bg-[#A36371] border-[#A36371] text-white' : 'border-[#E8D3DA]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-bold text-[#7D6E74] hover:underline"
            >
              ← {language === 'ta' ? 'பின்செல்க' : language === 'hi' ? 'पीछे' : 'Back'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl bg-[#A36371] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#8F525F] transition-all flex items-center gap-1.5"
            >
              <span>{language === 'ta' ? 'அடுத்து →' : language === 'hi' ? 'आगे बढ़ें →' : 'Continue →'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 (WHEN GOOD/OKAY): SLEEP & ENERGY CHECK */}
      {step === 2 && !isFeelingUnwell && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#4A3E42]">
              {language === 'ta'
                ? 'நேற்று இரவு தூக்கம் மற்றும் உடல் ஆற்றல் எப்படி இருந்தது?'
                : language === 'hi'
                ? 'पिछली रात नींद और आज शरीर में ऊर्जा कैसी है?'
                : 'How was your sleep and energy level?'}
            </h3>
            <p className="text-xs text-[#7D6E74] mt-0.5">
              {language === 'ta'
                ? 'தனிப்பட்ட முறையில் கவனிக்க உதவும்:'
                : language === 'hi'
                ? 'आपके व्यक्तिगत पैटर्न को समझने के लिए:'
                : 'Helps us tailor your daily rest & focus tasks:'}
            </p>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block text-xs font-bold text-[#4A3E42] mb-1.5 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-[#CF9B48]" />
              <span>{t.sleepQuality}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'good', label: language === 'ta' ? 'நல்ல தூக்கம் (7+ மணி)' : language === 'hi' ? 'गहरी नींद (7+ घंटे)' : 'Good (7+ hrs)' },
                { id: 'okay', label: language === 'ta' ? 'இடைவெளி தூக்கம் (5-6 மணி)' : language === 'hi' ? 'सामान्य (5-6 घंटे)' : 'Okay (5-6 hrs)' },
                { id: 'poor', label: language === 'ta' ? 'தூக்கம் குறைவு (<4 மணி)' : language === 'hi' ? 'कम नींद (<4 घंटे)' : 'Poor (<4 hrs)' },
              ].map((s) => {
                const isSelected = sleepQuality === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSleepQuality((prev) => (prev === s.id ? null : (s.id as any)))}
                    className={`min-h-[48px] p-2.5 rounded-xl border text-xs text-center transition-all ${
                      isSelected
                        ? 'bg-[#FAF3E8] border-[#CF9B48] text-[#CF9B48] font-bold ring-1 ring-[#CF9B48]'
                        : 'bg-[#FFF9FA] border-[#F5EBEF] text-[#4A3E42] hover:bg-[#FAF3E8]/50'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-xs font-bold text-[#4A3E42] mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#A36371]" />
              <span>{t.energyLevel}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'high', label: language === 'ta' ? 'சுறுசுறுப்பு' : language === 'hi' ? 'स्फूर्तिवान' : 'High energy' },
                { id: 'normal', label: language === 'ta' ? 'வழக்கம் போல்' : language === 'hi' ? 'सामान्य' : 'Normal / steady' },
                { id: 'low', label: language === 'ta' ? 'சோர்வு' : language === 'hi' ? 'सुस्त / थकान' : 'Low / fatigued' },
              ].map((e) => {
                const isSelected = energyLevel === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setEnergyLevel((prev) => (prev === e.id ? null : (e.id as any)))}
                    className={`min-h-[48px] p-2.5 rounded-xl border text-xs text-center transition-all ${
                      isSelected
                        ? 'bg-[#FFF0F5] border-[#A36371] text-[#A36371] font-bold ring-1 ring-[#A36371]'
                        : 'bg-[#FFF9FA] border-[#F5EBEF] text-[#4A3E42] hover:bg-[#FFF0F5]'
                    }`}
                  >
                    {e.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-bold text-[#7D6E74] hover:underline"
            >
              ← {language === 'ta' ? 'பின்செல்க' : language === 'hi' ? 'पीछे' : 'Back'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl bg-[#A36371] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#8F525F] transition-all flex items-center gap-1.5"
            >
              <span>{language === 'ta' ? 'அடுத்து →' : language === 'hi' ? 'आगे बढ़ें →' : 'Continue →'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 (IF UNWELL): SLEEP HOURS & IRON INTAKE CHECK */}
      {step === 3 && isFeelingUnwell && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#4A3E42]">
              {language === 'ta'
                ? 'தூக்கம் மற்றும் ஊட்டச்சத்து விவரம்'
                : language === 'hi'
                ? 'नींद और पोषण संबंधी विवरण'
                : 'Sleep & Nutrition Check'}
            </h3>
            <p className="text-xs text-[#7D6E74] mt-0.5">
              {language === 'ta'
                ? 'சோர்வு மற்றும் அசௌகரியத்திற்கான காரணத்தைப் புரிந்து கொள்ள:'
                : language === 'hi'
                ? 'थकान और असहजता के कारणों को समझने के लिए:'
                : 'Understanding why you may be feeling fatigued or uncomfortable:'}
            </p>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block text-xs font-bold text-[#4A3E42] mb-1.5">
              {t.sleepQuality}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'good', label: language === 'ta' ? '7+ மணி நேரம்' : language === 'hi' ? '7+ घंटे' : '7+ hours' },
                { id: 'okay', label: language === 'ta' ? '5-6 மணி நேரம்' : language === 'hi' ? '5-6 घंटे' : '5-6 hours' },
                { id: 'poor', label: language === 'ta' ? '<4 மணி நேரம்' : language === 'hi' ? '<4 घंटे' : '<4 hours' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSleepQuality((prev) => (prev === s.id ? null : (s.id as any)))}
                  className={`min-h-[48px] p-2.5 rounded-xl border text-xs text-center transition-all ${
                    sleepQuality === s.id
                      ? 'bg-[#FAF3E8] border-[#CF9B48] text-[#CF9B48] font-bold'
                      : 'bg-[#FFF9FA] border-[#F5EBEF] text-[#4A3E42]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Iron or Prenatal Vitamin check (especially relevant if anemia) */}
          <div>
            <label className="block text-xs font-bold text-[#4A3E42] mb-1.5">
              {language === 'ta'
                ? 'இன்று உங்கள் இரும்புச்சத்து அல்லது வைட்டமின் மாத்திரை எடுத்தீர்களா?'
                : language === 'hi'
                ? 'क्या आज आपने आयरन या प्रसवपूर्व विटामिन की गोली ली?'
                : 'Did you take your iron or prenatal vitamin tablet today?'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTookIronOrVitamins(true)}
                className={`min-h-[48px] p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  tookIronOrVitamins === true
                    ? 'bg-[#EDF5EF] border-[#6E9C7B] text-[#6E9C7B] ring-1 ring-[#6E9C7B]'
                    : 'bg-[#FFF9FA] border-[#F5EBEF] text-[#4A3E42]'
                }`}
              >
                {language === 'ta' ? 'ஆம், எடுத்தேன் ✓' : language === 'hi' ? 'हाँ, ले ली ✓' : 'Yes, taken ✓'}
              </button>
              <button
                type="button"
                onClick={() => setTookIronOrVitamins(false)}
                className={`min-h-[48px] p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  tookIronOrVitamins === false
                    ? 'bg-[#FAF3E8] border-[#CF9B48] text-[#CF9B48] ring-1 ring-[#CF9B48]'
                    : 'bg-[#FFF9FA] border-[#F5EBEF] text-[#4A3E42]'
                }`}
              >
                {language === 'ta' ? 'இன்னும் எடுக்கவில்லை' : language === 'hi' ? 'अभी नहीं ली' : 'Not yet today'}
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-bold text-[#7D6E74] hover:underline"
            >
              ← {language === 'ta' ? 'பின்செல்க' : language === 'hi' ? 'पीछे' : 'Back'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl bg-[#A36371] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#8F525F] transition-all flex items-center gap-1.5"
            >
              <span>{language === 'ta' ? 'அடுத்து →' : language === 'hi' ? 'आगे बढ़ें →' : 'Continue →'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 OR 4: BABY MOVEMENT (PAST WEEK 24/28) */}
      {((step === 3 && !isFeelingUnwell && pregnancyWeek >= 24) ||
        (step === 4 && isFeelingUnwell && pregnancyWeek >= 24)) && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#4A3E42]">
              {language === 'ta'
                ? `இன்று ${profile?.babyNickname || 'குழந்தையின்'} அசைவு எப்படி உள்ளது?`
                : language === 'hi'
                ? `आज ${profile?.babyNickname || 'शिशु'} की हलचल कैसी है?`
                : `How are ${profile?.babyNickname || 'baby'}’s movements today?`}
            </h3>
            <p className="text-xs text-[#7D6E74] mt-0.5">
              {pregnancyWeek >= 28
                ? (language === 'ta' ? '28 வாரங்களுக்குப் பிறகு குழந்தையின் சுறுசுறுப்பைக் கவனிப்பது முக்கியம்.' : language === 'hi' ? '28वें हफ्ते के बाद नियमित हलचल पर ध्यान देना जरूरी है।' : 'Past week 28, paying attention to daily kicks is an important reassurance.')
                : (language === 'ta' ? 'மென்மையான அசைவுகள் மற்றும் உதைப்புகள்.' : language === 'hi' ? 'हल्की हलचल और किक्स।' : 'Gentle flutters or active kicks.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'normal',
                emoji: '👣',
                title: language === 'ta' ? 'நன்றாக அசைகிறது' : language === 'hi' ? 'सक्रिय / सामान्य' : 'Active & Normal',
                desc: language === 'ta' ? 'வழக்கமான சுறுசுறுப்பு' : language === 'hi' ? 'सामान्य हलचल' : 'Frequent flutters/kicks',
              },
              {
                id: 'less',
                emoji: '⏳',
                title: language === 'ta' ? 'அசைவு குறைவு' : language === 'hi' ? 'पहले से कम' : 'Less than usual',
                desc: language === 'ta' ? 'இடது பக்கம் சாய்ந்து கவனிக்கவும்' : language === 'hi' ? 'शांत होकर ध्यान दें' : 'Quieter today',
              },
              {
                id: 'not_felt_yet',
                emoji: '✨',
                title: language === 'ta' ? 'இன்று இன்னும் கவனிக்கவில்லை' : language === 'hi' ? 'आज ध्यान नहीं दिया' : 'Not noticed yet',
                desc: language === 'ta' ? 'சாப்பிட்ட பின் ஓய்வெடுத்து பாருங்கள்' : language === 'hi' ? 'आराम से लेटकर देखें' : 'Will count after rest',
              },
            ].map((m) => {
              const isSelected = babyMovement === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setBabyMovement((prev) => (prev === m.id ? null : (m.id as any)))}
                  className={`min-h-[58px] p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#EDF5EF] border-[#6E9C7B] text-[#4A3E42] ring-2 ring-[#6E9C7B]/30 font-bold'
                      : 'bg-[#FFF9FA] border-[#F5EBEF] text-[#4A3E42] hover:bg-[#EDF5EF]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{m.emoji}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#6E9C7B] stroke-[3]" />}
                  </div>
                  <span className="text-xs font-bold block mt-1">{m.title}</span>
                  <span className="text-[10px] text-[#7D6E74] block">{m.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-bold text-[#7D6E74] hover:underline"
            >
              ← {language === 'ta' ? 'பின்செல்க' : language === 'hi' ? 'पीछे' : 'Back'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl bg-[#A36371] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#8F525F] transition-all flex items-center gap-1.5"
            >
              <span>{language === 'ta' ? 'அடுத்து →' : language === 'hi' ? 'आगे बढ़ें →' : 'Continue →'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FINAL STEP: CHECK-IN SUMMARY & CONFIRMATION */}
      {isSummaryStep && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#4A3E42]">
              {t.checkinSummaryTitle}
            </h3>
            <p className="text-xs text-[#7D6E74] mt-0.5">
              {language === 'ta'
                ? 'உங்கள் இன்றைய பதிவை உறுதிசெய்து சேமிக்கவும்:'
                : language === 'hi'
                ? 'कृपया अपनी आज की जांच की पुष्टि करें:'
                : 'Review what you shared today before saving:'}
            </p>
          </div>

          {/* Summary Card */}
          <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5EBEF] space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#F5EBEF]/60">
              <span className="text-[#7D6E74]">{t.overallFeeling}</span>
              <span className="font-bold text-[#A36371] capitalize">
                {mood === 'good' ? `😊 ${t.good}` : mood === 'okay' ? `😐 ${t.okay}` : mood === 'not_great' ? `😟 ${t.tired}` : `😣 ${t.worried}`}
              </span>
            </div>

            {selectedDiscomfort.length > 0 && (
              <div className="flex items-center justify-between py-1 border-b border-[#F5EBEF]/60">
                <span className="text-[#7D6E74]">Discomfort</span>
                <span className="font-bold text-[#C75D5D]">{selectedDiscomfort.join(', ')}</span>
              </div>
            )}

            {sleepQuality && (
              <div className="flex items-center justify-between py-1 border-b border-[#F5EBEF]/60">
                <span className="text-[#7D6E74]">{t.sleepQuality}</span>
                <span className="font-bold text-[#4A3E42] capitalize">{sleepQuality}</span>
              </div>
            )}

            {energyLevel && (
              <div className="flex items-center justify-between py-1 border-b border-[#F5EBEF]/60">
                <span className="text-[#7D6E74]">{t.energyLevel}</span>
                <span className="font-bold text-[#4A3E42] capitalize">{energyLevel}</span>
              </div>
            )}

            {pregnancyWeek >= 24 && babyMovement && (
              <div className="flex items-center justify-between py-1">
                <span className="text-[#7D6E74]">{t.babyMovement}</span>
                <span className="font-bold text-[#6E9C7B] capitalize">
                  {babyMovement === 'normal' ? 'Active' : babyMovement === 'less' ? 'Quieter' : 'Noticed'}
                </span>
              </div>
            )}
          </div>

          {/* Success or Error states */}
          {saveSuccess && (
            <div className="p-3 rounded-2xl bg-[#EDF5EF] border border-[#6E9C7B]/30 text-[#6E9C7B] text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.savedSuccessCheck}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-2xl bg-[#FFF0F2] border border-[#C62828]/30 text-[#C62828] text-xs font-medium text-center">
              <span>{t.errSaveGeneral}</span>
            </div>
          )}

          <div className="pt-2 flex justify-between items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleBack}
              className="text-xs font-bold text-[#7D6E74] hover:underline"
            >
              ← {language === 'ta' ? 'மாற்றங்களைச் செய்ய' : language === 'hi' ? 'संशोधन करें' : 'Change answers'}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-6 py-3 rounded-2xl bg-[#A36371] hover:bg-[#8F525F] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5 min-w-[140px] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.savingCheckin}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{language === 'ta' ? 'பதிவை சேமிக்க' : language === 'hi' ? 'जांच सुरक्षित करें' : 'Save Check-in'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
