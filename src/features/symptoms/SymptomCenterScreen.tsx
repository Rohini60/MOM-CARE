import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { RiskBadge } from '../../components/RiskBadge';
import { requestSymptomTriage, type SymptomTriageResponse } from '../../services/ai/client';
import { buildRelevantContext } from '../../services/context/contextRetriever';
import { saveSymptomRecord } from '../../services/firebase/symptomService';
import { analyzeSymptomPatterns } from '../../services/ai/patternRecognition';
import { UrgentSafetyModal } from '../../components/UrgentSafetyModal';
import { useTranslation } from '../../translations';
import type { UserProfile, Checkin, SymptomRecord, Medication, Appointment } from '../../types';

interface SymptomCenterScreenProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  recentCheckins: Checkin[];
  recentSymptoms: SymptomRecord[];
  medications: Medication[];
  appointments: Appointment[];
  onSymptomLogged: () => void;
  onOpenAiChat: (prompt?: string) => void;
}

export const SymptomCenterScreen: React.FC<SymptomCenterScreenProps> = ({
  profile,
  pregnancyWeek,
  recentCheckins,
  recentSymptoms,
  medications,
  appointments,
  onSymptomLogged,
  onOpenAiChat,
}) => {
  const { language, t } = useTranslation();
  const [symptomName, setSymptomName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [duration, setDuration] = useState('Few hours');
  const [location, setLocation] = useState('Lower back');
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<SymptomTriageResponse | null>(null);

  // Urgent Safety Modal trigger
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [urgentReason, setUrgentReason] = useState('');

  // ML Pattern Analysis
  const patternReport = useMemo(() => {
    return analyzeSymptomPatterns(recentCheckins, recentSymptoms, 7);
  }, [recentCheckins, recentSymptoms]);

  // Common pregnancy symptom quick buttons
  const quickSymptoms = [
    'Mild lower back ache',
    'Frequent urination without pain',
    'Morning nausea',
    'Round ligament twinges',
    'Occasional mild headache',
    'Heartburn after meals',
    'Swollen ankles after standing',
  ];

  const handleTriage = async (customName?: string) => {
    const name = customName || symptomName;
    if (!name.trim() || isAssessing) return;

    setIsAssessing(true);
    setAssessmentResult(null);

    try {
      const patientContext = buildRelevantContext({
        profile,
        currentWeek: pregnancyWeek,
        recentCheckins,
        recentSymptoms,
        medications,
        appointments,
        queryText: name,
      });

      const res = await requestSymptomTriage({
        symptomName: name,
        description: `${description} Location: ${location}.`,
        severity,
        duration,
        pregnancyWeek,
        patientContext,
        language: profile?.preferredLanguage || language,
      });

      setAssessmentResult(res);

      // Feature 4: Safety Triage Protocol Trigger
      if (res.riskLevel === 'red') {
        setUrgentReason(res.why || res.meaning);
        setShowUrgentModal(true);
      }

      // Save to Firestore
      if (profile) {
        const record: SymptomRecord = {
          id: `sym_${Date.now()}`,
          userId: profile.id,
          week: pregnancyWeek,
          symptomName: name,
          description: description || undefined,
          severity,
          duration,
          location,
          riskLevel: res.riskLevel,
          riskTitle: res.riskTitle,
          aiSummary: res.meaning,
          whatToDoNow: res.whatToDoNow,
          watchFor: res.watchFor,
          whenToContact: res.whenToContact,
          sources: res.sources,
          createdAt: new Date().toISOString(),
        };
        await saveSymptomRecord(record);
        onSymptomLogged();
      }
    } catch (err: any) {
      console.error('Triage error:', err);
    } finally {
      setIsAssessing(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#F5EBEF] shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] border border-[#FADADD] text-[#A36371] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#4A3E42]">{t.symptomTriageTitle}</h2>
            <p className="text-xs text-[#7D6E74]">{t.symptomTriageSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Feature 4: Protocol Guidelines Legend Card */}
      <div className="bg-[#FFFFFF] rounded-2xl p-3.5 sm:p-4 border border-[#F5EBEF] shadow-sm text-xs space-y-2">
        <span className="font-bold text-[#4A3E42] block">{t.protocolLevelsTitle}</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-[#EDF5EF] border border-[#6E9C7B]/30 space-y-0.5">
            <span className="font-bold text-[#6E9C7B] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#6E9C7B]" /> 🟢 {t.protocolRoutine}
            </span>
            <p className="text-[11px] text-[#4A3E42]">{t.protocolRoutineDesc}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF3E8] border border-[#CF9B48]/30 space-y-0.5">
            <span className="font-bold text-[#CF9B48] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#CF9B48]" /> 🟡 {t.protocolAttention}
            </span>
            <p className="text-[11px] text-[#4A3E42]">{t.protocolAttentionDesc}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FBEAEA] border border-[#C75D5D]/30 space-y-0.5">
            <span className="font-bold text-[#C75D5D] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#C75D5D]" /> 🔴 {t.protocolUrgent}
            </span>
            <p className="text-[11px] text-[#4A3E42]">{t.protocolUrgentDesc}</p>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#F5EBEF] shadow-sm space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#4A3E42] mb-1.5">
            {t.whatSymptomQuestion}
          </label>
          <input
            type="text"
            value={symptomName}
            onChange={(e) => setSymptomName(e.target.value)}
            placeholder={t.symptomPlaceholder}
            className="w-full bg-[#FFF9FA] border border-[#F5EBEF] focus:border-[#E8C5C8] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#4A3E42] placeholder-[#7D6E74] focus:outline-hidden"
          />
        </div>

        {/* Quick symptom tags */}
        <div className="flex flex-wrap gap-1.5">
          {quickSymptoms.map((qs, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSymptomName(qs)}
              className="px-2.5 py-1 rounded-full text-[11px] bg-[#FFF9FA] border border-[#F5EBEF] text-[#7D6E74] hover:bg-[#FFF0F5] hover:text-[#A36371] transition-colors"
            >
              + {qs}
            </button>
          ))}
        </div>

        {/* Structured Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[#7D6E74] mb-1">{t.severityLabel}</label>
            <div className="flex rounded-xl bg-[#FFF9FA] p-1 border border-[#F5EBEF]">
              {(['mild', 'moderate', 'severe'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`flex-1 py-1 rounded-lg text-xs capitalize transition-colors ${
                    severity === sev ? 'bg-white font-semibold text-[#A36371] shadow-2xs' : 'text-[#7D6E74]'
                  }`}
                >
                  {sev === 'mild' ? t.severityMild : sev === 'moderate' ? t.severityModerate : t.severitySevere}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#7D6E74] mb-1">{t.durationLabel}</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-[#FFF9FA] border border-[#F5EBEF] rounded-xl px-2.5 py-1.5 text-xs text-[#4A3E42] focus:outline-hidden focus:border-[#E8C5C8]"
            >
              <option value="Just started">{t.durationJustStarted}</option>
              <option value="Few hours">{t.durationFewHours}</option>
              <option value="1-2 days">{t.duration1to2Days}</option>
              <option value="Over a week">{t.durationOverWeek}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#7D6E74] mb-1">{t.locationLabel}</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#FFF9FA] border border-[#F5EBEF] rounded-xl px-2.5 py-1.5 text-xs text-[#4A3E42] focus:outline-hidden focus:border-[#E8C5C8]"
            >
              <option value="Lower back">Lower back</option>
              <option value="Abdomen / pelvis">Abdomen / pelvis</option>
              <option value="Head / temples">Head / temples</option>
              <option value="Legs / feet">Legs / feet</option>
              <option value="Ribs / upper chest">Ribs / upper chest</option>
              <option value="Pelvic girdle">Pelvic girdle</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#7D6E74] mb-1">
            Additional observations or context (optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Does it worsen when standing? Any associated cramping or dizziness?"
            className="w-full bg-[#FFF9FA] border border-[#F5EBEF] rounded-xl px-3 py-2 text-xs text-[#4A3E42] placeholder-[#7D6E74] focus:outline-hidden focus:border-[#E8C5C8]"
          />
        </div>

        <button
          onClick={() => handleTriage()}
          disabled={!symptomName.trim() || isAssessing}
          className="w-full py-2.5 rounded-xl bg-[#A36371] text-white text-xs sm:text-sm font-semibold hover:bg-[#8F525F] transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isAssessing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t.assessingBtn}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.assessBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Feature 3: ML Pattern Recognition Analytics Card */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#F5EBEF] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#FFF0F5] text-[#A36371] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#4A3E42]">ML Pattern Analysis (7-Day Rolling Window)</h3>
              <p className="text-[10px] text-[#7D6E74]">{patternReport.totalLogsInWindow} logs recorded across past 7 days</p>
            </div>
          </div>
          {patternReport.hasPersistentConcerns && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF3E8] text-[#CF9B48] border border-[#CF9B48]/30">
              Persistent Alert Active
            </span>
          )}
        </div>

        {patternReport.frequencySummary.length === 0 ? (
          <p className="text-xs text-[#7D6E74] text-center py-4 bg-[#FFF9FA] rounded-xl border border-[#F5EBEF]">
            No symptoms logged in the past 7 days. Your daily check-in logs will build your frequency trends.
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            {patternReport.frequencySummary.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#FFF9FA] border border-[#F5EBEF] flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[#4A3E42] block">{item.name}</span>
                  <span className="text-[10px] text-[#7D6E74]">
                    Last logged: {new Date(item.recentDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    {item.locations.length > 0 ? ` • ${item.locations.join(', ')}` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      item.count >= 3
                        ? 'bg-[#FAF3E8] text-[#CF9B48] border border-[#CF9B48]/40'
                        : 'bg-white text-[#7D6E74] border border-[#F5EBEF]'
                    }`}
                  >
                    {item.count}x in 7d {item.count >= 3 ? '⚠️' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assessment Structured Output */}
      {assessmentResult && (
        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-6 border border-[#F5EBEF] shadow-md space-y-4 animate-in fade-in">
          {/* Risk Level Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EBEF]">
            <RiskBadge
              level={assessmentResult.riskLevel}
              title={assessmentResult.riskTitle}
              size="lg"
            />
            <span className="text-xs font-semibold text-[#7D6E74]">Week {pregnancyWeek} Triage</span>
          </div>

          {/* Section: What you told MomCare */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#7D6E74] uppercase tracking-wider">What you reported</h4>
            <p className="text-xs sm:text-sm text-[#4A3E42] bg-[#FFF9FA] p-3 rounded-xl border border-[#F5EBEF]">
              {assessmentResult.summary}
            </p>
          </div>

          {/* Section: What this may mean */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#7D6E74] uppercase tracking-wider">{t.whatThisMeans}</h4>
            <p className="text-xs sm:text-sm text-[#4A3E42] leading-relaxed">
              {assessmentResult.meaning}
            </p>
          </div>

          {/* Section: Why */}
          <div className="space-y-1 bg-[#FAF3E8] p-3 rounded-xl border border-[#CF9B48]/30">
            <h4 className="text-xs font-bold text-[#CF9B48] uppercase tracking-wider">{t.whatThisMeans} ({t.evidenceSources})</h4>
            <p className="text-xs text-[#4A3E42] leading-relaxed">
              {assessmentResult.why}
            </p>
          </div>

          {/* Section: What you can do now */}
          <div className="space-y-1 bg-[#EDF5EF] p-3 rounded-xl border border-[#6E9C7B]/30">
            <h4 className="text-xs font-bold text-[#6E9C7B] uppercase tracking-wider">{t.whatToDoNow}</h4>
            <p className="text-xs text-[#4A3E42] leading-relaxed">
              {assessmentResult.whatToDoNow}
            </p>
          </div>

          {/* Section: Watch for */}
          <div className="space-y-1 bg-[#FBEAEA] p-3 rounded-xl border border-[#C75D5D]/30">
            <h4 className="text-xs font-bold text-[#C75D5D] uppercase tracking-wider">{t.watchForSigns}</h4>
            <p className="text-xs text-[#4A3E42] leading-relaxed">
              {assessmentResult.watchFor}
            </p>
          </div>

          {/* Section: When to contact your healthcare provider */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#A36371] uppercase tracking-wider">{t.whenToContactDoctor}</h4>
            <p className="text-xs text-[#4A3E42] leading-relaxed">
              {assessmentResult.whenToContact}
            </p>
          </div>

          {/* Section: Medical Sources */}
          {assessmentResult.sources && assessmentResult.sources.length > 0 && (
            <div className="pt-3 border-t border-[#F5EBEF] flex items-center gap-2 text-xs text-[#7D6E74]">
              <BookOpen className="w-4 h-4 text-[#A36371] shrink-0" />
              <span>
                <strong className="text-[#4A3E42]">{t.evidenceSources}: </strong>
                {assessmentResult.sources.join(' • ')}
              </span>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={() => onOpenAiChat(`Following up on my triage assessment for ${symptomName}: ${assessmentResult.summary}`)}
            className="w-full py-2.5 rounded-xl bg-[#FFF0F5] text-[#A36371] border border-[#FADADD] text-xs font-semibold hover:bg-[#FADADD]/60 transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.askMomCareBtn}</span>
          </button>
        </div>
      )}

      {/* Feature 4: Urgent Safety Modal */}
      <UrgentSafetyModal
        isOpen={showUrgentModal}
        onClose={() => setShowUrgentModal(false)}
        symptomName={symptomName}
        emergencyReason={urgentReason}
        doctorName={profile?.doctorName || undefined}
        clinicName={profile?.clinicName || undefined}
        emergencyContact={profile?.emergencyContact || undefined}
      />
    </div>
  );
};
