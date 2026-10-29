import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  Clock,
  ArrowRight,
  Phone,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  highRiskScore,
  HIGH_RISK_THRESHOLD,
  evaluateRedFlagVitals,
  explainDecisionPath,
  type VitalsInput,
  type RedFlagResult,
} from './vitalsModel';
import { UrgentSafetyModal } from '../../components/UrgentSafetyModal';
import { useTranslation } from '../../translations';
import type { UserProfile } from '../../types';

interface VitalsCheckScreenProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  onOpenAiChat?: (prompt?: string) => void;
  onOpenEmergencyModal?: () => void;
}

export interface VitalsHistoryRecord {
  id: string;
  timestamp: string;
  vitals: VitalsInput;
  score: number;
  isRedFlag: boolean;
  redFlagReasons?: string[];
  isAmber: boolean;
}

const STORAGE_KEY = 'momcare_vitals_history';

export const VitalsCheckScreen: React.FC<VitalsCheckScreenProps> = ({
  profile,
  pregnancyWeek,
  onOpenAiChat,
  onOpenEmergencyModal,
}) => {
  const { language, t } = useTranslation();

  // Unit modes
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [sugarUnit, setSugarUnit] = useState<'mmol/L' | 'mg/dL'>('mmol/L');

  // Input state
  const [age, setAge] = useState<string>(profile?.age ? String(profile.age) : '28');
  const [systolicBP, setSystolicBP] = useState<string>('120');
  const [diastolicBP, setDiastolicBP] = useState<string>('80');
  const [bloodSugarInput, setBloodSugarInput] = useState<string>('7.2');
  const [bodyTempInput, setBodyTempInput] = useState<string>('98.6');
  const [heartRate, setHeartRate] = useState<string>('76');

  // Result state
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [evaluatedVitals, setEvaluatedVitals] = useState<VitalsInput | null>(null);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [redFlagResult, setRedFlagResult] = useState<RedFlagResult | null>(null);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<VitalsHistoryRecord[]>([]);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Save history
  const saveToHistory = (
    v: VitalsInput,
    score: number,
    redFlag: RedFlagResult,
    isAmber: boolean
  ) => {
    const record: VitalsHistoryRecord = {
      id: `vit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      vitals: v,
      score,
      isRedFlag: redFlag.isRedFlag,
      redFlagReasons: redFlag.isRedFlag ? redFlag.reasons : undefined,
      isAmber,
    };
    const updated = [record, ...history.slice(0, 19)];
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Convert current inputs to standardized VitalsInput (mmol/L and Fahrenheit)
  const getStandardizedVitals = (): VitalsInput | null => {
    const parsedAge = parseFloat(age);
    const parsedSys = parseFloat(systolicBP);
    const parsedDia = parseFloat(diastolicBP);
    const parsedBSInput = parseFloat(bloodSugarInput);
    const parsedTempInput = parseFloat(bodyTempInput);
    const parsedHR = parseFloat(heartRate);

    if (
      isNaN(parsedAge) ||
      isNaN(parsedSys) ||
      isNaN(parsedDia) ||
      isNaN(parsedBSInput) ||
      isNaN(parsedTempInput) ||
      isNaN(parsedHR)
    ) {
      return null;
    }

    // Convert sugar to mmol/L if user entered mg/dL
    const normalizedBS =
      sugarUnit === 'mg/dL' ? parsedBSInput / 18.0182 : parsedBSInput;

    // Convert temp to °F if user entered °C
    const normalizedTemp =
      tempUnit === 'C' ? (parsedTempInput * 9) / 5 + 32 : parsedTempInput;

    return {
      Age: parsedAge,
      SystolicBP: parsedSys,
      DiastolicBP: parsedDia,
      BS: normalizedBS,
      BodyTemp: normalizedTemp,
      HeartRate: parsedHR,
    };
  };

  const handleEvaluate = () => {
    const v = getStandardizedVitals();
    if (!v) return;

    // Rule 3: Red-flag emergency rules ALWAYS run first and override this feature
    const redFlag = evaluateRedFlagVitals(v);
    const score = highRiskScore(v);
    const isAmber = !redFlag.isRedFlag && score >= HIGH_RISK_THRESHOLD;

    setEvaluatedVitals(v);
    setRedFlagResult(redFlag);
    setRiskScore(score);
    setHasEvaluated(true);

    if (redFlag.isRedFlag) {
      setEmergencyReason(redFlag.reasons.join('\n'));
      setShowEmergencyModal(true);
    }

    saveToHistory(v, score, redFlag, isAmber);
  };

  // Preset loaders for quick testing
  const loadPreset = (preset: 'normal' | 'borderline_bp' | 'high_sugar' | 'emergency_redflag') => {
    if (preset === 'normal') {
      setAge('28');
      setSystolicBP('118');
      setDiastolicBP('76');
      setBloodSugarInput(sugarUnit === 'mg/dL' ? '126' : '7.0');
      setBodyTempInput(tempUnit === 'C' ? '37.0' : '98.6');
      setHeartRate('74');
    } else if (preset === 'borderline_bp') {
      setAge('35');
      setSystolicBP('134');
      setDiastolicBP('88');
      setBloodSugarInput(sugarUnit === 'mg/dL' ? '140' : '7.8');
      setBodyTempInput(tempUnit === 'C' ? '37.1' : '98.8');
      setHeartRate('72');
    } else if (preset === 'high_sugar') {
      setAge('30');
      setSystolicBP('124');
      setDiastolicBP('78');
      setBloodSugarInput(sugarUnit === 'mg/dL' ? '162' : '9.0');
      setBodyTempInput(tempUnit === 'C' ? '37.0' : '98.6');
      setHeartRate('78');
    } else if (preset === 'emergency_redflag') {
      setAge('31');
      setSystolicBP('164');
      setDiastolicBP('112');
      setBloodSugarInput(sugarUnit === 'mg/dL' ? '135' : '7.5');
      setBodyTempInput(tempUnit === 'C' ? '37.2' : '99.0');
      setHeartRate('84');
    }
    setHasEvaluated(false);
  };

  // Convert inputs dynamically when toggle button clicked
  const toggleTempUnit = (newUnit: 'F' | 'C') => {
    if (newUnit === tempUnit) return;
    const currentVal = parseFloat(bodyTempInput);
    if (!isNaN(currentVal)) {
      if (newUnit === 'C') {
        const cVal = ((currentVal - 32) * (5 / 9)).toFixed(1);
        setBodyTempInput(cVal);
      } else {
        const fVal = ((currentVal * 9) / 5 + 32).toFixed(1);
        setBodyTempInput(fVal);
      }
    }
    setTempUnit(newUnit);
  };

  const toggleSugarUnit = (newUnit: 'mmol/L' | 'mg/dL') => {
    if (newUnit === sugarUnit) return;
    const currentVal = parseFloat(bloodSugarInput);
    if (!isNaN(currentVal)) {
      if (newUnit === 'mg/dL') {
        const mgVal = (currentVal * 18.0182).toFixed(0);
        setBloodSugarInput(mgVal);
      } else {
        const mmolVal = (currentVal / 18.0182).toFixed(1);
        setBloodSugarInput(mmolVal);
      }
    }
    setSugarUnit(newUnit);
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#220B29] via-[#1A0A22] to-[#120719] p-5 rounded-3xl border border-[#FF1A75]/35 shadow-[0_0_25px_rgba(255,26,117,0.22)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#FF1A75]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF1A75] to-[#B80048] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,26,117,0.5)] border border-[#FFD1E3]/30">
              <HeartPulse className="w-6 h-6 stroke-[2.3] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[#FFF0F6] tracking-tight neon-text-glow">
                  Vitals Check
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF1A75]/20 text-[#FFD1E3] border border-[#FF1A75]/40">
                  ML Tree Triage
                </span>
              </div>
              <p className="text-xs text-[#E3BCCC] mt-0.5 font-medium">
                Decision tree screening model calibrated on maternal public dataset records
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#23102C] hover:bg-[#2F153B] text-xs font-semibold text-[#FFD1E3] border border-[#FF1A75]/35 transition-colors shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-[#FF1A75]" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Preset Demo Quick Selector */}
      <div className="cyber-card p-3.5 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-[#FFD1E3] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF1A75]" />
            <span>Quick Test Scenarios:</span>
          </span>
          <span className="text-[11px] text-[#A38495]">1-click fill</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            type="button"
            onClick={() => loadPreset('normal')}
            className="p-2 rounded-xl bg-[#190C20] hover:bg-[#25102C] border border-[#FF1A75]/25 hover:border-[#FF1A75] text-[#FFF0F6] font-medium text-left transition-all"
          >
            <span className="block font-bold text-xs text-[#FFD1E3]">Baseline</span>
            <span className="text-[10px] text-[#A38495]">118/76, BS 7.0</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset('borderline_bp')}
            className="p-2 rounded-xl bg-[#190C20] hover:bg-[#25102C] border border-[#FF1A75]/25 hover:border-[#FF1A75] text-[#FFF0F6] font-medium text-left transition-all"
          >
            <span className="block font-bold text-xs text-[#FFB300]">Elevated BP</span>
            <span className="text-[10px] text-[#A38495]">134/88, BS 7.8</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset('high_sugar')}
            className="p-2 rounded-xl bg-[#190C20] hover:bg-[#25102C] border border-[#FF1A75]/25 hover:border-[#FF1A75] text-[#FFF0F6] font-medium text-left transition-all"
          >
            <span className="block font-bold text-xs text-[#FFB300]">Higher Sugar</span>
            <span className="text-[10px] text-[#A38495]">124/78, BS 9.0</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset('emergency_redflag')}
            className="p-2 rounded-xl bg-[#280911] hover:bg-[#380E18] border border-[#FF003C]/50 hover:border-[#FF003C] text-[#FFF0F6] font-medium text-left transition-all"
          >
            <span className="block font-bold text-xs text-[#FF003C]">🔴 Red Flag BP</span>
            <span className="text-[10px] text-[#A38495]">164/112 (Crisis)</span>
          </button>
        </div>
      </div>

      {/* Vitals Input Form */}
      <div className="cyber-card p-5 sm:p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(255,26,117,0.14)]">
        <h2 className="text-sm font-bold text-[#FFF0F6] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#FF1A75]" />
          <span>Enter Maternal Vital Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Age */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#FFD1E3] block">
              Age <span className="text-[#A38495] font-normal font-mono">(years)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="14"
                max="60"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-[#180C1F] border border-[#FF1A75]/35 focus:border-[#FF1A75] rounded-xl px-3.5 py-2.5 text-sm text-[#FFF0F6] font-mono outline-hidden shadow-inner transition-colors"
                placeholder="e.g. 28"
              />
              <span className="absolute right-3.5 top-3 text-[11px] font-mono text-[#A38495]">
                yrs
              </span>
            </div>
            <p className="text-[10px] text-[#A38495]">Maternal age at evaluation</p>
          </div>

          {/* 2. Systolic Blood Pressure */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#FFD1E3] block">
              Systolic BP <span className="text-[#A38495] font-normal font-mono">(top number)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="60"
                max="260"
                value={systolicBP}
                onChange={(e) => setSystolicBP(e.target.value)}
                className="w-full bg-[#180C1F] border border-[#FF1A75]/35 focus:border-[#FF1A75] rounded-xl px-3.5 py-2.5 text-sm text-[#FFF0F6] font-mono outline-hidden shadow-inner transition-colors"
                placeholder="e.g. 120"
              />
              <span className="absolute right-3.5 top-3 text-[11px] font-mono text-[#A38495]">
                mmHg
              </span>
            </div>
            <p className="text-[10px] text-[#A38495]">Standard maternal resting systolic</p>
          </div>

          {/* 3. Diastolic Blood Pressure */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#FFD1E3] block">
              Diastolic BP <span className="text-[#A38495] font-normal font-mono">(bottom number)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="30"
                max="160"
                value={diastolicBP}
                onChange={(e) => setDiastolicBP(e.target.value)}
                className="w-full bg-[#180C1F] border border-[#FF1A75]/35 focus:border-[#FF1A75] rounded-xl px-3.5 py-2.5 text-sm text-[#FFF0F6] font-mono outline-hidden shadow-inner transition-colors"
                placeholder="e.g. 80"
              />
              <span className="absolute right-3.5 top-3 text-[11px] font-mono text-[#A38495]">
                mmHg
              </span>
            </div>
            <p className="text-[10px] text-[#A38495]">Diastolic pressure at rest</p>
          </div>

          {/* 4. Blood Sugar (BS) with mmol/L vs mg/dL Converter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#FFD1E3]">
                Blood Sugar (BS)
              </label>
              <div className="flex items-center bg-[#180C1F] rounded-lg p-0.5 border border-[#FF1A75]/30">
                <button
                  type="button"
                  onClick={() => toggleSugarUnit('mmol/L')}
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md transition-all ${
                    sugarUnit === 'mmol/L'
                      ? 'bg-[#FF1A75] text-white shadow-xs'
                      : 'text-[#A38495] hover:text-[#FFD1E3]'
                  }`}
                >
                  mmol/L
                </button>
                <button
                  type="button"
                  onClick={() => toggleSugarUnit('mg/dL')}
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md transition-all ${
                    sugarUnit === 'mg/dL'
                      ? 'bg-[#FF1A75] text-white shadow-xs'
                      : 'text-[#A38495] hover:text-[#FFD1E3]'
                  }`}
                >
                  mg/dL
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="1"
                max="500"
                value={bloodSugarInput}
                onChange={(e) => setBloodSugarInput(e.target.value)}
                className="w-full bg-[#180C1F] border border-[#FF1A75]/35 focus:border-[#FF1A75] rounded-xl px-3.5 py-2.5 text-sm text-[#FFF0F6] font-mono outline-hidden shadow-inner transition-colors"
                placeholder={sugarUnit === 'mmol/L' ? 'e.g. 7.2' : 'e.g. 130'}
              />
              <span className="absolute right-3.5 top-3 text-[11px] font-mono text-[#A38495]">
                {sugarUnit}
              </span>
            </div>
            {/* Exact reviewer prompt notice requested */}
            <p className="text-[10px] text-[#FCA5C6] leading-tight font-mono">
              (range in training data was 6 to 19, probably mmol/L, ask my doctor reviewer to confirm)
            </p>
          </div>

          {/* 5. Body Temperature with Fahrenheit & Celsius Converter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#FFD1E3]">
                Body Temperature
              </label>
              <div className="flex items-center bg-[#180C1F] rounded-lg p-0.5 border border-[#FF1A75]/30">
                <button
                  type="button"
                  onClick={() => toggleTempUnit('F')}
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md transition-all ${
                    tempUnit === 'F'
                      ? 'bg-[#FF1A75] text-white shadow-xs'
                      : 'text-[#A38495] hover:text-[#FFD1E3]'
                  }`}
                >
                  °F
                </button>
                <button
                  type="button"
                  onClick={() => toggleTempUnit('C')}
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md transition-all ${
                    tempUnit === 'C'
                      ? 'bg-[#FF1A75] text-white shadow-xs'
                      : 'text-[#A38495] hover:text-[#FFD1E3]'
                  }`}
                >
                  °C
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="30"
                max="115"
                value={bodyTempInput}
                onChange={(e) => setBodyTempInput(e.target.value)}
                className="w-full bg-[#180C1F] border border-[#FF1A75]/35 focus:border-[#FF1A75] rounded-xl px-3.5 py-2.5 text-sm text-[#FFF0F6] font-mono outline-hidden shadow-inner transition-colors"
                placeholder={tempUnit === 'F' ? 'e.g. 98.6' : 'e.g. 37.0'}
              />
              <span className="absolute right-3.5 top-3 text-[11px] font-mono text-[#A38495]">
                °{tempUnit}
              </span>
            </div>
            <p className="text-[10px] text-[#A38495]">
              {tempUnit === 'F'
                ? `Equivalent: ${((parseFloat(bodyTempInput || '98.6') - 32) * (5 / 9)).toFixed(1)} °C`
                : `Equivalent: ${((parseFloat(bodyTempInput || '37.0') * 9) / 5 + 32).toFixed(1)} °F`}
            </p>
          </div>

          {/* 6. Heart Rate (bpm) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#FFD1E3] block">
              Heart Rate <span className="text-[#A38495] font-normal font-mono">(pulse)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="40"
                max="220"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full bg-[#180C1F] border border-[#FF1A75]/35 focus:border-[#FF1A75] rounded-xl px-3.5 py-2.5 text-sm text-[#FFF0F6] font-mono outline-hidden shadow-inner transition-colors"
                placeholder="e.g. 76"
              />
              <span className="absolute right-3.5 top-3 text-[11px] font-mono text-[#A38495]">
                bpm
              </span>
            </div>
            <p className="text-[10px] text-[#A38495]">Resting pulse in beats per minute</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#FF1A75]/20">
          <span className="text-[11px] text-[#A38495] font-mono">
            Evaluates deterministic clinical red flags first, then tree model.
          </span>
          <button
            type="button"
            onClick={handleEvaluate}
            className="w-full sm:w-auto px-6 py-3 rounded-xl cyber-gradient-btn text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,26,117,0.4)] cursor-pointer"
          >
            <HeartPulse className="w-4 h-4 stroke-[2.5]" />
            <span>Check Vitals Patterns</span>
          </button>
        </div>
      </div>

      {/* EVALUATION RESULTS SECTION */}
      {hasEvaluated && evaluatedVitals && riskScore !== null && (
        <div className="space-y-4 animate-in fade-in">
          {/* RULE 3: Red-flag emergency rules ALWAYS run first and override this feature */}
          {redFlagResult?.isRedFlag ? (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#3A0A14] via-[#2A060E] to-[#1C050A] border-2 border-[#FF003C] shadow-[0_0_30px_rgba(255,0,60,0.45)] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF003C]/20 border border-[#FF003C] text-[#FF003C] flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6 stroke-[2.4] animate-pulse" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF003C] text-white">
                      🔴 CRITICAL OVERRIDE: OBSTETRIC EMERGENCY
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      Clinical Red-Flag Vitals Alert
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#1F050B] border border-[#FF003C]/40 space-y-2 text-xs text-[#FFC1CC]">
                <p className="font-extrabold text-[#FF4D6D] text-sm">
                  Your vital readings meet urgent maternal red-flag criteria that require immediate clinical evaluation.
                </p>
                <ul className="list-disc list-inside space-y-1 pt-1 font-mono">
                  {redFlagResult.reasons.map((r, idx) => (
                    <li key={idx} className="text-white">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct Emergency Call Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href="tel:108"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF003C] to-[#C4002D] hover:from-[#FF1A4D] hover:to-[#E00034] text-white font-bold text-xs sm:text-sm text-center shadow-[0_0_15px_rgba(255,0,60,0.6)] flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-4 h-4 fill-current animate-pulse" />
                  <span>Call Emergency Ambulance (108)</span>
                </a>
                {profile?.doctorPhone && (
                  <a
                    href={`tel:${profile.doctorPhone}`}
                    className="py-3 px-4 rounded-xl bg-[#291026] hover:bg-[#3D1838] text-[#FFD1E3] font-bold text-xs border border-[#FF1A75]/50 flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Dr. {profile.doctorName || 'Obstetrician'}</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* RULE 1: If score >= HIGH_RISK_THRESHOLD, show AMBER card */}
              {riskScore >= HIGH_RISK_THRESHOLD ? (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-[#2F1D08] via-[#241605] to-[#180E03] border-2 border-[#FFB300] shadow-[0_0_25px_rgba(255,179,0,0.35)] space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFB300]/20 border border-[#FFB300] text-[#FFB300] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 stroke-[2.3]" />
                    </div>
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FFB300]/20 text-[#FFD166] border border-[#FFB300]/50">
                        Amber Pattern Notice
                      </span>
                      {/* Exact text required by Rule 1 */}
                      <p className="text-sm sm:text-base font-bold text-[#FFF5E6] leading-snug">
                        Some of your values resemble higher-risk patterns in a small public dataset. Please discuss this with your doctor soon.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#FFB300]/20 text-xs">
                    {/* Rule 4: "Why am I seeing this?" link */}
                    <button
                      type="button"
                      onClick={() => setShowWhyModal(true)}
                      className="font-bold text-[#FFB300] hover:text-[#FFD166] underline flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Why am I seeing this?</span>
                    </button>

                    {onOpenAiChat && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenAiChat(
                            `My vitals pattern screening indicated higher risk values (BP: ${evaluatedVitals.SystolicBP}/${evaluatedVitals.DiastolicBP}, Sugar: ${evaluatedVitals.BS.toFixed(1)} mmol/L, Temp: ${evaluatedVitals.BodyTemp.toFixed(1)}°F). What specific questions should I prepare to ask my doctor?`
                          )
                        }
                        className="text-[#FFD1E3] hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#FF1A75]" />
                        <span>Prepare questions for doctor →</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* RULE 2: If score < threshold, show NEUTRAL text only.
                   NEVER show "low risk", "safe" or "you are fine". */
                <div className="p-5 rounded-3xl bg-[#160B1C] border border-[#FF1A75]/30 shadow-[0_0_15px_rgba(255,26,117,0.12)] space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#23102C] border border-[#FF1A75]/35 text-[#E3BCCC] flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#23102C] text-[#E3BCCC] border border-[#FF1A75]/25">
                        Observation Result
                      </span>
                      {/* Exact text required by Rule 2 */}
                      <p className="text-sm font-medium text-[#FFF0F6] leading-relaxed">
                        No concerning pattern found from these values. Keep tracking and follow your doctor's advice.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#FF1A75]/15 text-xs">
                    {/* Rule 4: "Why am I seeing this?" link */}
                    <button
                      type="button"
                      onClick={() => setShowWhyModal(true)}
                      className="font-bold text-[#FFD1E3] hover:text-[#FFF0F6] underline flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#FF1A75]" />
                      <span>Why am I seeing this?</span>
                    </button>

                    <span className="text-[11px] text-[#A38495] font-mono">
                      Continue routine antenatal schedule
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* RULE 5: Exact Footer Text */}
          <div className="p-3 rounded-2xl bg-[#140819] border border-[#FF1A75]/20 text-center">
            <p className="text-[11px] sm:text-xs text-[#A38495] font-mono leading-relaxed">
              Screening estimate from a model trained on about 450 public records. Not validated. Not a diagnosis.
            </p>
          </div>
        </div>
      )}

      {/* RECENT VITALS HISTORY ACCORDION */}
      {history.length > 0 && (
        <div className="cyber-card rounded-3xl p-5 space-y-3 shadow-[0_0_15px_rgba(255,26,117,0.12)]">
          <div
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF1A75]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#FFF0F6]">
                Previous Vitals Checks ({history.length})
              </h3>
            </div>
            <button className="text-[#A38495] hover:text-[#FFF0F6]">
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showHistory && (
            <div className="space-y-2 pt-2 border-t border-[#FF1A75]/20 max-h-72 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#180C1F] border border-[#FF1A75]/25 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#A38495]">
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.isRedFlag ? (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#FF003C] text-white">
                          RED FLAG
                        </span>
                      ) : item.isAmber ? (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#FFB300]/25 text-[#FFB300] border border-[#FFB300]/50">
                          AMBER PATTERN
                        </span>
                      ) : (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-medium bg-[#23102C] text-[#E3BCCC]">
                          OBSERVED
                        </span>
                      )}
                    </div>
                    <p className="text-white font-mono text-[11px]">
                      BP: {item.vitals.SystolicBP}/{item.vitals.DiastolicBP} mmHg • BS: {item.vitals.BS.toFixed(1)} mmol/L • Temp: {item.vitals.BodyTemp.toFixed(1)}°F • HR: {item.vitals.HeartRate} bpm
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#FFD1E3]">
                    Score: {(item.score * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RULE 4: "Why am I seeing this?" Detailed Modal showing values entered & model evaluation */}
      {showWhyModal && evaluatedVitals && riskScore !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#180C1F] rounded-3xl p-6 border border-[#FF1A75]/40 shadow-[0_0_35px_rgba(255,26,117,0.35)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#FF1A75]/25">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#FF1A75]" />
                <h3 className="font-bold text-base text-[#FFF0F6]">Why am I seeing this?</h3>
              </div>
              <button
                onClick={() => setShowWhyModal(false)}
                className="w-7 h-7 rounded-full bg-[#23102C] hover:bg-[#341641] text-[#A38495] hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Values entered breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#FFD1E3] uppercase tracking-wider block">
                Values entered for evaluation:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#200F29] border border-[#FF1A75]/20">
                  <span className="text-[#A38495] block text-[10px]">Age</span>
                  <span className="text-white font-bold">{evaluatedVitals.Age} years</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#200F29] border border-[#FF1A75]/20">
                  <span className="text-[#A38495] block text-[10px]">Blood Pressure</span>
                  <span className="text-white font-bold">
                    {evaluatedVitals.SystolicBP} / {evaluatedVitals.DiastolicBP} mmHg
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#200F29] border border-[#FF1A75]/20">
                  <span className="text-[#A38495] block text-[10px]">Blood Sugar</span>
                  <span className="text-white font-bold">
                    {evaluatedVitals.BS.toFixed(2)} mmol/L
                  </span>
                  <span className="text-[10px] text-[#A38495] block">
                    ≈ {(evaluatedVitals.BS * 18.0182).toFixed(0)} mg/dL
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#200F29] border border-[#FF1A75]/20">
                  <span className="text-[#A38495] block text-[10px]">Body Temperature</span>
                  <span className="text-white font-bold">
                    {evaluatedVitals.BodyTemp.toFixed(1)} °F
                  </span>
                  <span className="text-[10px] text-[#A38495] block">
                    ≈ {(((evaluatedVitals.BodyTemp - 32) * 5) / 9).toFixed(1)} °C
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#200F29] border border-[#FF1A75]/20 col-span-2">
                  <span className="text-[#A38495] block text-[10px]">Heart Rate</span>
                  <span className="text-white font-bold">{evaluatedVitals.HeartRate} bpm</span>
                </div>
              </div>
            </div>

            {/* Model Decision Tree Trace */}
            <div className="p-3.5 rounded-2xl bg-[#140819] border border-[#FF1A75]/25 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-[#FFD1E3]">Model Evaluation:</span>
                <span className="font-bold text-white">
                  Score: {(riskScore * 100).toFixed(1)}% (Threshold: 35.0%)
                </span>
              </div>
              <p className="text-[11px] text-[#E3BCCC]">
                Decision tree path traversed with your entered vitals:
              </p>
              <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-[#FCA5C6]">
                {explainDecisionPath(evaluatedVitals, riskScore).map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-[11px] text-[#A38495] leading-relaxed font-mono">
              Screening estimate from a model trained on about 450 public records. Not validated. Not a diagnosis.
            </p>

            <button
              onClick={() => setShowWhyModal(false)}
              className="w-full py-2.5 rounded-xl cyber-gradient-btn text-white text-xs font-bold"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Emergency Red Flag Safety Modal */}
      <UrgentSafetyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        emergencyReason={emergencyReason}
        doctorName={profile?.doctorName || undefined}
        doctorPhone={profile?.doctorPhone || undefined}
        clinicName={profile?.clinicName || undefined}
        emergencyContact={profile?.emergencyContact || undefined}
        familyContactPhone={profile?.familyContactPhone || undefined}
      />
    </div>
  );
};
