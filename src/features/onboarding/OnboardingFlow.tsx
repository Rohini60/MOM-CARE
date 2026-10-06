import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  User,
  ShieldCheck,
  Phone,
  Hospital,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Globe,
  Activity,
  Check,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import type { UserProfile } from '../../types';
import { calculatePregnancyProgress, calculateDueDateFromCurrentWeek } from '../../utils/pregnancy';
import { saveUserProfile } from '../../services/firebase/userService';
import { useTranslation, type Language } from '../../translations';

interface OnboardingFlowProps {
  userId: string;
  email: string;
  initialDisplayName?: string;
  onCompleted: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  userId,
  email,
  initialDisplayName = '',
  onCompleted,
  onCancel,
}) => {
  const { language, setLanguage, t } = useTranslation();

  // Current Step: 1, 2, 3, 4, or 'consent'
  const [currentStep, setCurrentStep] = useState<number | 'consent'>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [generalSaveError, setGeneralSaveError] = useState(false);

  // Field-level error messages
  const [nameError, setNameError] = useState('');
  const [dueDateError, setDueDateError] = useState('');

  // Step 1: Personal Details
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [age, setAge] = useState<string>('28');
  const [preferredName, setPreferredName] = useState(initialDisplayName);

  // Step 2: Pregnancy Details (Only Due Date OR "I'm not sure" picking week 1-40)
  const [isNotSureDueDate, setIsNotSureDueDate] = useState(false);
  const [selectedWeekIfNotSure, setSelectedWeekIfNotSure] = useState<number>(24);
  const [dueDate, setDueDate] = useState(() => {
    // Default approx 16 weeks ahead (~Week 24)
    const d = new Date();
    d.setDate(d.getDate() + 112);
    return d.toISOString().split('T')[0];
  });
  const [firstPregnancy, setFirstPregnancy] = useState<boolean>(true);
  const [babyNickname, setBabyNickname] = useState('');

  // Calculate live pregnancy progress
  const computedProgress = useMemo(() => {
    if (isNotSureDueDate) {
      const computedDue = calculateDueDateFromCurrentWeek(selectedWeekIfNotSure);
      const prog = calculatePregnancyProgress(computedDue);
      return { ...prog, dueDate: computedDue, calculatedWeek: selectedWeekIfNotSure };
    }

    if (!dueDate) {
      return { weeks: 24, days: 0, trimester: 2 as const, dueDate: '' };
    }

    const prog = calculatePregnancyProgress(dueDate);
    return { ...prog, dueDate };
  }, [isNotSureDueDate, selectedWeekIfNotSure, dueDate]);

  // Step 3: Health History (Optional tick boxes + "Prefer not to say")
  const [conditions, setConditions] = useState<{
    diabetes: boolean;
    highBloodPressure: boolean;
    anemia: boolean;
    thyroid: boolean;
    complications: boolean;
    allergies: boolean;
    medicines: boolean;
  }>({
    diabetes: false,
    highBloodPressure: false,
    anemia: false,
    thyroid: false,
    complications: false,
    allergies: false,
    medicines: false,
  });
  const [preferNotToSay, setPreferNotToSay] = useState(false);
  const [allergiesText, setAllergiesText] = useState('');
  const [medicinesText, setMedicinesText] = useState('');

  const toggleCondition = (key: keyof typeof conditions) => {
    if (preferNotToSay) setPreferNotToSay(false);
    setConditions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferNotToSay = () => {
    setPreferNotToSay(true);
    setConditions({
      diabetes: false,
      highBloodPressure: false,
      anemia: false,
      thyroid: false,
      complications: false,
      allergies: false,
      medicines: false,
    });
    setAllergiesText('');
    setMedicinesText('');
  };

  // Step 4: Emergency Contacts & Language
  const [familyContactName, setFamilyContactName] = useState('');
  const [familyContactPhone, setFamilyContactPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');

  // Consent Screen Checkbox
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Field validation and Step transitions
  const handleNext = () => {
    setNameError('');
    setDueDateError('');
    setGeneralSaveError(false);

    if (currentStep === 1) {
      if (!displayName.trim()) {
        setNameError(t.errNameMissing);
        return;
      }
      if (!preferredName.trim()) {
        setPreferredName(displayName.trim());
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!isNotSureDueDate) {
        if (!dueDate) {
          setDueDateError(t.errDueDateMissing);
          return;
        }

        // Validate date sanity (must be within ~42 weeks in future and not more than 40 weeks in past)
        const dueTime = new Date(dueDate).getTime();
        const nowTime = new Date().getTime();
        const maxFuture = nowTime + 300 * 24 * 60 * 60 * 1000; // ~42 weeks
        const maxPast = nowTime - 280 * 24 * 60 * 60 * 1000;

        if (isNaN(dueTime) || dueTime > maxFuture || dueTime < maxPast) {
          setDueDateError(t.errDueDateInvalid);
          return;
        }
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep('consent');
    }
  };

  const handleBack = () => {
    setNameError('');
    setDueDateError('');
    setGeneralSaveError(false);

    if (currentStep === 'consent') {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleComplete = async () => {
    if (!consentAgreed) return;

    setIsSaving(true);
    setGeneralSaveError(false);

    try {
      // Gather selected health conditions
      const selectedConditionsList: string[] = [];
      if (conditions.diabetes) selectedConditionsList.push('Gestational Diabetes');
      if (conditions.highBloodPressure) selectedConditionsList.push('High Blood Pressure');
      if (conditions.anemia) selectedConditionsList.push('Anemia');
      if (conditions.thyroid) selectedConditionsList.push('Thyroid');
      if (conditions.complications) selectedConditionsList.push('Previous complications');
      if (preferNotToSay) selectedConditionsList.push('Prefer not to say');

      // Requirement 2: Optional fields saved as null or empty list if skipped, never undefined
      const fullProfile: UserProfile = {
        id: userId,
        email,
        displayName: displayName.trim(),
        preferredName: preferredName.trim() || displayName.trim(),
        age: age ? parseInt(age, 10) : null,
        communityAnonymous: false,
        dueDate: computedProgress.dueDate,
        firstPregnancy,
        babyNickname: babyNickname.trim() ? babyNickname.trim() : null,
        medicalConditions: selectedConditionsList.length > 0 ? selectedConditionsList : [],
        allergies: conditions.allergies && allergiesText.trim() ? allergiesText.trim() : null,
        userMedications: conditions.medicines && medicinesText.trim() ? medicinesText.trim() : null,
        familyContactName: familyContactName.trim() ? familyContactName.trim() : null,
        familyContactPhone: familyContactPhone.trim() ? familyContactPhone.trim() : null,
        doctorName: doctorName.trim() ? doctorName.trim() : null,
        doctorPhone: doctorPhone.trim() ? doctorPhone.trim() : null,
        emergencyContact: familyContactPhone.trim()
          ? `${familyContactName || 'Family'}: ${familyContactPhone}`
          : doctorPhone.trim()
          ? `${doctorName || 'Doctor'}: ${doctorPhone}`
          : null,
        preferredLanguage: language,
        consentGiven: true,
        consentDate: new Date().toISOString(),
        saveAiHistory: true,
        onboardingCompleted: true,
        isDemoUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveUserProfile(fullProfile);
      onCompleted(fullProfile);
    } catch (err: any) {
      // Requirement 4: Never show raw error text or DB paths. Log to console only.
      console.error('Onboarding save error:', err);
      setGeneralSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const progressPercentage =
    currentStep === 1
      ? 25
      : currentStep === 2
      ? 50
      : currentStep === 3
      ? 75
      : currentStep === 4
      ? 90
      : 100;

  return (
    <div className="min-h-screen bg-[#FCF8F6] text-[#352F35] flex flex-col justify-between max-w-md mx-auto p-5 sm:p-6 relative">
      <div>
        {/* Top Navigation & Language Quick Switcher */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-white border border-[#E9DFDC] text-[#766D72] hover:text-[#352F35] transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[11px] font-bold text-[#9F5F6E] uppercase tracking-wider block">
              {currentStep === 'consent' ? t.consentTitle : `${t.stepTitle} ${currentStep} ${t.stepOf}`}
            </span>
            <span className="text-xs text-[#766D72] font-medium">{t.appName}</span>
          </div>

          {/* Quick Language Toggle */}
          <div className="flex rounded-xl bg-white border border-[#E9DFDC] p-0.5 text-[10px] font-bold">
            {(['en', 'ta', 'hi'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-1.5 py-0.5 rounded-lg transition-all ${
                  language === lang
                    ? 'bg-[#9F5F6E] text-white shadow-2xs'
                    : 'text-[#766D72] hover:text-[#352F35]'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-2 bg-[#E9DFDC] rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-[#C98291] to-[#9F5F6E] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* General Save Error with Friendly Retry (Requirement 4) */}
        {generalSaveError && (
          <div className="mb-4 p-4 rounded-2xl bg-[#FFF0F2] border border-[#FADADD] flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-[#C62828] text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t.errSaveGeneral}</span>
            </div>
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 rounded-xl bg-[#C62828] text-white text-xs font-bold hover:bg-[#B71C1C] flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.retryBtn}</span>
            </button>
          </div>
        )}

        {/* STEP 1: Name, Age, Nickname */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-[#352F35] tracking-tight">
                {t.welcomeToMomCare}
              </h2>
              <p className="text-xs sm:text-sm text-[#766D72] mt-1">
                {t.step1Subtitle}
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#352F35] mb-1.5">
                  {t.fullNameLabel} <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setNameError('');
                    if (!preferredName) setPreferredName(e.target.value);
                  }}
                  placeholder={t.fullNamePlaceholder}
                  className={`w-full p-3.5 rounded-2xl bg-white border text-sm text-[#352F35] focus:outline-hidden transition-all ${
                    nameError
                      ? 'border-[#C62828] ring-1 ring-[#C62828]/30 bg-[#FFF9FA]'
                      : 'border-[#E9DFDC] focus:border-[#9F5F6E]'
                  }`}
                />
                {/* Friendly field error under input (Requirement 3) */}
                {nameError && (
                  <p className="text-xs font-medium text-[#C62828] mt-1.5 flex items-center gap-1 animate-in fade-in">
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#352F35] mb-1.5">
                  {t.nicknameLabel}
                </label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder={t.nicknamePlaceholder}
                  className="w-full p-3.5 rounded-2xl bg-white border border-[#E9DFDC] text-sm focus:outline-hidden focus:border-[#9F5F6E] text-[#352F35]"
                />
                <p className="text-[11px] text-[#766D72] mt-1">
                  {t.nicknameHelper}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#352F35] mb-1.5">
                  {t.ageLabel}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="28"
                  min={14}
                  max={60}
                  className="w-full p-3.5 rounded-2xl bg-white border border-[#E9DFDC] text-sm focus:outline-hidden focus:border-[#9F5F6E] text-[#352F35]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Due Date & Pregnancy (Part 1: ONLY Due Date + "I'm not sure" week picker) */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-[#352F35] tracking-tight">
                {t.step2Title}
              </h2>
              <p className="text-xs sm:text-sm text-[#766D72] mt-1">
                {t.step2Subtitle}
              </p>
            </div>

            {/* Due date input or "I'm not sure" selector */}
            {!isNotSureDueDate ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#352F35]">
                    {t.dueDateLabel} <span className="text-[#C62828]">*</span>
                  </label>
                  {/* Small "I'm not sure" option (Part 1 requirement) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotSureDueDate(true);
                      setDueDateError('');
                    }}
                    className="text-xs font-semibold text-[#9F5F6E] hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{t.notSureDueDate}</span>
                  </button>
                </div>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setDueDateError('');
                  }}
                  className={`w-full p-3.5 rounded-2xl bg-white border text-sm text-[#352F35] focus:outline-hidden transition-all ${
                    dueDateError
                      ? 'border-[#C62828] ring-1 ring-[#C62828]/30 bg-[#FFF9FA]'
                      : 'border-[#E9DFDC] focus:border-[#9F5F6E]'
                  }`}
                />

                {/* Friendly field error message under input (Part 1 requirement) */}
                {dueDateError && (
                  <p className="text-xs font-medium text-[#C62828] mt-1.5 flex items-center gap-1 animate-in fade-in">
                    <span>{dueDateError}</span>
                  </p>
                )}
              </div>
            ) : (
              /* "I'm not sure" Week Picker Mode (1 to 40) */
              <div className="p-4 rounded-2xl bg-white border border-[#E9DFDC] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#352F35]">
                    {t.pickCurrentWeek}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNotSureDueDate(false)}
                    className="text-xs font-semibold text-[#9F5F6E] hover:underline"
                  >
                    {t.knowMyDate}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={selectedWeekIfNotSure}
                    onChange={(e) => setSelectedWeekIfNotSure(parseInt(e.target.value, 10))}
                    className="flex-1 accent-[#9F5F6E]"
                  />
                  <span className="w-14 py-1.5 text-center rounded-xl bg-[#F2E1E3] text-[#9F5F6E] font-bold text-sm">
                    Wk {selectedWeekIfNotSure}
                  </span>
                </div>

                {/* Quick Week Chips (tappable and re-selectable) */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[6, 12, 16, 20, 24, 28, 32, 36, 40].map((wk) => (
                    <button
                      key={wk}
                      type="button"
                      onClick={() => setSelectedWeekIfNotSure(wk)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                        selectedWeekIfNotSure === wk
                          ? 'bg-[#9F5F6E] text-white border border-[#9F5F6E] shadow-2xs'
                          : 'bg-[#FCF8F6] text-[#766D72] border border-[#E9DFDC] hover:border-[#9F5F6E]'
                      }`}
                    >
                      {wk}w
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Calculated Gestational Week Card */}
            <div className="p-3.5 rounded-2xl bg-[#F2E1E3]/50 border border-[#E9DFDC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-[#9F5F6E] flex items-center justify-center font-bold text-xs shadow-2xs">
                  🌸
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#352F35] block">
                    {t.currentWeekLabel}: Week {computedProgress.weeks} + {computedProgress.days}d
                  </span>
                  <span className="text-[11px] text-[#766D72]">
                    Due: {computedProgress.dueDate} (Trimester {computedProgress.trimester})
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#9F5F6E] bg-white px-2 py-0.5 rounded-full border border-[#E9DFDC]">
                {t.calculatedNotice}
              </span>
            </div>

            {/* First Pregnancy Check */}
            <div>
              <label className="block text-xs font-bold text-[#352F35] mb-1.5">
                {t.firstPregnancyLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFirstPregnancy(true)}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    firstPregnancy
                      ? 'bg-[#F2E1E3]/60 border-[#9F5F6E] text-[#9F5F6E] shadow-2xs ring-2 ring-[#9F5F6E]/40'
                      : 'bg-white border-[#E9DFDC] text-[#766D72] hover:bg-[#F2E1E3]'
                  }`}
                >
                  {firstPregnancy && <Check className="w-4 h-4 stroke-[3]" />}
                  <span>{t.firstPregnancyYes}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFirstPregnancy(false)}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    !firstPregnancy
                      ? 'bg-[#F2E1E3]/60 border-[#9F5F6E] text-[#9F5F6E] shadow-2xs ring-2 ring-[#9F5F6E]/40'
                      : 'bg-white border-[#E9DFDC] text-[#766D72] hover:bg-[#F2E1E3]'
                  }`}
                >
                  {!firstPregnancy && <Check className="w-4 h-4 stroke-[3]" />}
                  <span>{t.firstPregnancyNo}</span>
                </button>
              </div>
            </div>

            {/* Baby Nickname */}
            <div>
              <label className="block text-xs font-bold text-[#352F35] mb-1.5">
                {t.babyNicknameLabel}
              </label>
              <input
                type="text"
                value={babyNickname}
                onChange={(e) => setBabyNickname(e.target.value)}
                placeholder={t.babyNicknamePlaceholder}
                className="w-full p-3.5 rounded-2xl bg-white border border-[#E9DFDC] text-sm focus:outline-hidden focus:border-[#9F5F6E] text-[#352F35]"
              />
              <p className="text-[11px] text-[#766D72] mt-1">
                {t.babyNicknameHelper}
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Health History (Optional tick boxes) */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-[#352F35] tracking-tight">
                {t.step3Title}
              </h2>
              <p className="text-xs sm:text-sm text-[#766D72] mt-1">
                {t.step3Subtitle}
              </p>
            </div>

            {/* Prefer not to say option */}
            <button
              type="button"
              onClick={handlePreferNotToSay}
              className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                preferNotToSay
                  ? 'bg-[#EFEBF4] border-[#7E699B] text-[#7E699B]'
                  : 'bg-white border-[#E9DFDC] text-[#766D72] hover:bg-[#FCF8F6]'
              }`}
            >
              <span>{t.preferNotToSay}</span>
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${preferNotToSay ? 'bg-[#7E699B] border-[#7E699B] text-white' : 'border-[#E9DFDC]'}`}>
                {preferNotToSay && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            {/* Checkbox grid */}
            <div className={`space-y-2.5 transition-opacity ${preferNotToSay ? 'opacity-40 pointer-events-none' : ''}`}>
              {[
                { id: 'diabetes', label: t.conditionDiabetes },
                { id: 'highBloodPressure', label: t.conditionBP },
                { id: 'anemia', label: t.conditionAnemia },
                { id: 'thyroid', label: t.conditionThyroid },
                { id: 'complications', label: t.conditionComplications },
                { id: 'allergies', label: t.conditionAllergies },
                { id: 'medicines', label: t.conditionMedicines },
              ].map((item) => {
                const isChecked = conditions[item.id as keyof typeof conditions];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleCondition(item.id as keyof typeof conditions)}
                    className={`w-full p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between text-left transition-all ${
                      isChecked
                        ? 'bg-[#F2E1E3]/60 border-[#9F5F6E] text-[#9F5F6E]'
                        : 'bg-white border-[#E9DFDC] text-[#352F35] hover:bg-[#FCF8F6]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <div
                      className={`w-5 h-5 rounded-lg border shrink-0 ml-2 flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-[#9F5F6E] border-[#9F5F6E] text-white'
                          : 'border-[#E9DFDC] bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional text inputs if allergies or medicines are checked */}
            {conditions.allergies && !preferNotToSay && (
              <div className="pt-1">
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder={t.allergiesPlaceholder}
                  className="w-full p-3 rounded-xl bg-white border border-[#E9DFDC] text-xs text-[#352F35]"
                />
              </div>
            )}

            {conditions.medicines && !preferNotToSay && (
              <div className="pt-1">
                <input
                  type="text"
                  value={medicinesText}
                  onChange={(e) => setMedicinesText(e.target.value)}
                  placeholder={t.medicinesPlaceholder}
                  className="w-full p-3 rounded-xl bg-white border border-[#E9DFDC] text-xs text-[#352F35]"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Emergency Contacts & Language */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-[#352F35] tracking-tight">
                {t.step4Title}
              </h2>
              <p className="text-xs sm:text-sm text-[#766D72] mt-1">
                {t.step4Subtitle}
              </p>
            </div>

            {/* Family Member Contact */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E9DFDC] space-y-3">
              <div className="flex items-center gap-2 text-[#9F5F6E]">
                <Phone className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  {t.familyContactTitle}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={familyContactName}
                  onChange={(e) => setFamilyContactName(e.target.value)}
                  placeholder={t.familyContactNamePlaceholder}
                  className="w-full p-2.5 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC] text-xs text-[#352F35]"
                />
                <input
                  type="tel"
                  value={familyContactPhone}
                  onChange={(e) => setFamilyContactPhone(e.target.value)}
                  placeholder={t.familyContactPhonePlaceholder}
                  className="w-full p-2.5 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC] text-xs text-[#352F35]"
                />
              </div>
            </div>

            {/* Doctor / Hospital Contact */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E9DFDC] space-y-3">
              <div className="flex items-center gap-2 text-[#9F5F6E]">
                <Hospital className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  {t.doctorContactTitle}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder={t.doctorNamePlaceholder}
                  className="w-full p-2.5 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC] text-xs text-[#352F35]"
                />
                <input
                  type="tel"
                  value={doctorPhone}
                  onChange={(e) => setDoctorPhone(e.target.value)}
                  placeholder={t.doctorPhonePlaceholder}
                  className="w-full p-2.5 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC] text-xs text-[#352F35]"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#766D72]">
              {t.emergencyHelper}
            </p>

            {/* Immediate Language Switcher on Onboarding (Part 2 requirement) */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-[#352F35]">
                {t.preferredLanguageLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'ta', label: 'தமிழ்' },
                  { code: 'hi', label: 'हिंदी' },
                ].map((langItem) => (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => setLanguage(langItem.code as Language)}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                      language === langItem.code
                        ? 'bg-[#9F5F6E] text-white border-[#9F5F6E] shadow-2xs'
                        : 'bg-white border-[#E9DFDC] text-[#766D72] hover:bg-[#F2E1E3]'
                    }`}
                  >
                    {langItem.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONSENT SCREEN */}
        {currentStep === 'consent' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-[#352F35] tracking-tight">
                {t.consentTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#766D72] mt-1">
                {t.consentSubtitle}
              </p>
            </div>

            {/* Privacy details card */}
            <div className="p-4 rounded-2xl bg-white border border-[#E9DFDC] space-y-3 text-xs leading-relaxed text-[#352F35]">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[#352F35]">{t.dataStoredTitle}</span>
                  <p className="text-[#766D72]">{t.dataStoredDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-[#9F5F6E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[#352F35]">{t.dataWhyTitle}</span>
                  <p className="text-[#766D72]">{t.dataWhyDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#7E699B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[#352F35]">{t.dataControlTitle}</span>
                  <p className="text-[#766D72]">{t.dataControlDesc}</p>
                </div>
              </div>
            </div>

            {/* Prominent Clinical Safety Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF3E8] to-[#FFF0F2] border border-[#CF9B48]/50 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#CF9B48]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  {t.clinicalDisclaimerTitle}
                </span>
              </div>
              <p className="text-xs text-[#352F35] font-medium leading-relaxed">
                {t.clinicalDisclaimerText}
              </p>
            </div>

            {/* Mandatory Checkbox */}
            <label className="p-3.5 rounded-2xl bg-white border border-[#E9DFDC] flex items-start gap-3 cursor-pointer transition-all hover:bg-[#FCF8F6]">
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#9F5F6E] rounded"
              />
              <span className="text-xs font-semibold text-[#352F35]">
                {t.consentCheckbox}
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="pt-6 space-y-2">
        {currentStep !== 'consent' ? (
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-[#9F5F6E] hover:bg-[#8F525F] active:scale-[0.99] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{t.continueBtn}</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={!consentAgreed || isSaving}
            className="w-full py-4 rounded-2xl bg-[#9F5F6E] hover:bg-[#8F525F] active:scale-[0.99] text-white text-sm font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <span>{isSaving ? t.settingUp : t.finishAndStart}</span>
          </button>
        )}
      </div>
    </div>
  );
};
