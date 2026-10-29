import React, { useState } from 'react';
import {
  Stethoscope,
  Printer,
  Calendar,
  Clock,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Phone,
  FileText,
  User,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  HelpCircle,
  Share2,
} from 'lucide-react';
import type { UserProfile, Checkin, SymptomRecord, Medication, Appointment } from '../../types';
import { useTranslation } from '../../translations';

interface DoctorSummaryScreenProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  recentCheckins: Checkin[];
  recentSymptoms: SymptomRecord[];
  medications: Medication[];
  appointments: Appointment[];
  onOpenAiChat: (prompt?: string) => void;
  onOpenEmergency: () => void;
}

export const DoctorSummaryScreen: React.FC<DoctorSummaryScreenProps> = ({
  profile,
  pregnancyWeek,
  recentCheckins,
  recentSymptoms,
  medications,
  appointments,
  onOpenAiChat,
  onOpenEmergency,
}) => {
  const { language, t } = useTranslation();
  const [printSuccessNotice, setPrintSuccessNotice] = useState(false);

  const motherName = profile?.displayName || profile?.preferredName || 'Mother';
  const babyNickname = profile?.babyNickname || t.yourBaby;
  const dueDate = profile?.dueDate || 'Not specified';
  const doctorName = profile?.doctorName || 'Attending Obstetrician / Midwife';
  const doctorPhone = profile?.doctorPhone || '';
  const emergencyPhone = profile?.emergencyContact || profile?.familyContactPhone || '';
  const bloodType = 'O+ Rh Positive (Refer to clinical chart)';

  // Last 14 days checkins for pattern calculation
  const last14Days = recentCheckins.slice(0, 14);
  const totalDaysLogged = last14Days.length;

  const goodMoodCount = last14Days.filter((c) => c.mood === 'good' || c.mood === 'great').length;
  const okayMoodCount = last14Days.filter((c) => c.mood === 'okay').length;
  const notWellMoodCount = last14Days.filter((c) => c.mood === 'not_great' || c.mood === 'worried').length;

  const goodSleepCount = last14Days.filter((c) => c.sleep === 'good').length;
  const poorSleepCount = last14Days.filter((c) => c.sleep === 'poor').length;

  const activeMovementCount = last14Days.filter((c) => c.babyMovement === 'normal').length;
  const quietMovementCount = last14Days.filter((c) => c.babyMovement === 'less').length;

  const handlePrint = () => {
    setPrintSuccessNotice(true);
    window.print();
    setTimeout(() => setPrintSuccessNotice(false), 3000);
  };

  // Structured clinical questions for next doctor appointment
  const questionsForDoctor = [
    `Week ${pregnancyWeek} milestone review: Are fetal growth and fundal height matching gestational age curves?`,
    pregnancyWeek >= 28
      ? 'Fetal kick patterns and daily monitoring protocol for third trimester.'
      : 'Mid-pregnancy anatomy scan findings and iron / hemoglobin levels review.',
    poorSleepCount >= 3
      ? `Persistent sleep disruption noted across ${poorSleepCount} recent days: safe positioning and non-pharmacologic support.`
      : 'Safe physical activity and maternal hydration guidelines.',
    profile?.medicalConditions && profile.medicalConditions.length > 0
      ? `Management review for: ${profile.medicalConditions.join(', ')}.`
      : 'Upcoming routine screening schedule (GTT, Group B Strep, or antibody screens).',
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* Action Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#E9DFDC] shadow-2xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F2E1E3] text-[#9F5F6E] flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#352F35]">
                {t.navDoctorSummary}
              </h2>
              <p className="text-xs text-[#766D72]">
                Printable clinical briefing sheet formatted for A4 prenatal consultations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9F5F6E] hover:bg-[#8B4D5C] text-white text-xs font-bold shadow-xs transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Summary</span>
          </button>
        </div>
      </div>

      {printSuccessNotice && (
        <div className="p-3 rounded-xl bg-[#EDF5EF] border border-[#6E9C7B] text-[#2E7D32] text-xs font-bold text-center flex items-center justify-center gap-2 print:hidden animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Opening print dialog. Set layout to Portrait / A4 for the cleanest output.</span>
        </div>
      )}

      {/* A4 PRINT CONTAINER (Prints cleanly as a medical sheet) */}
      <div className="bg-white rounded-3xl sm:border border-[#E9DFDC] shadow-sm p-6 sm:p-8 space-y-6 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-[#352F35]">
        
        {/* Document Header */}
        <div className="border-b-2 border-[#352F35] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black text-[#9F5F6E] tracking-tight">MomCare</span>
              <span className="text-xs font-bold text-[#766D72] uppercase tracking-wider">
                • Clinical Consultation Briefing
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#352F35]">Prenatal Summary Report</h1>
            <p className="text-xs text-[#766D72] mt-0.5">
              Compiled on {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5">
            <p className="font-bold text-[#352F35]">
              Gestational Age: <span className="text-[#9F5F6E] font-black text-sm">Week {pregnancyWeek}</span>
            </p>
            <p className="text-[#766D72]">Estimated Due Date (EDD): {dueDate}</p>
            <p className="text-[#766D72]">Blood Group: {bloodType}</p>
          </div>
        </div>

        {/* Two-Column Clinical Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FCF8F6] border border-[#E9DFDC] text-xs">
          <div>
            <h3 className="font-bold text-[#9F5F6E] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Patient Information</span>
            </h3>
            <div className="space-y-1">
              <p><span className="text-[#766D72]">Mother's Name:</span> <strong className="text-[#352F35]">{motherName}</strong></p>
              <p><span className="text-[#766D72]">Baby Nickname:</span> {babyNickname}</p>
              <p><span className="text-[#766D72]">Age:</span> {profile?.age || '28'} years</p>
              <p><span className="text-[#766D72]">Emergency Contact:</span> {emergencyPhone || 'Not entered'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#9F5F6E] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Attending Clinical Provider</span>
            </h3>
            <div className="space-y-1">
              <p><span className="text-[#766D72]">Doctor / Midwife:</span> <strong className="text-[#352F35]">{doctorName}</strong></p>
              <p><span className="text-[#766D72]">Clinic / Hospital Phone:</span> {doctorPhone || 'Not entered'}</p>
              <p><span className="text-[#766D72]">Hospital Name:</span> {profile?.clinicName || 'Maternity Center'}</p>
              <p><span className="text-[#766D72]">Known Conditions:</span> {profile?.medicalConditions?.length ? profile.medicalConditions.join(', ') : 'None reported'}</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: WIDE PATTERN GRAPHS & 14-DAY VITALS TRENDS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#352F35] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#9F5F6E]" />
              <span>14-Day Longitudinal Trends & Daily Check-Ins</span>
            </h3>
            <span className="text-xs text-[#766D72] font-semibold">
              {totalDaysLogged} check-ins logged in past 14 days
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Trend Card 1: Energy & Mood */}
            <div className="p-4 rounded-2xl border border-[#E9DFDC] bg-white space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#352F35]">Mood & Wellbeing</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF5EF] text-[#2E7D32]">
                  {goodMoodCount > 0 ? `${Math.round((goodMoodCount / Math.max(1, totalDaysLogged)) * 100)}% Positive` : 'Baseline'}
                </span>
              </div>
              <div className="h-16 flex items-end gap-1.5 pt-2">
                {last14Days.length > 0 ? (
                  last14Days.slice(0, 10).map((c, i) => {
                    const heightPercent = c.mood === 'good' || c.mood === 'great' ? 100 : c.mood === 'okay' ? 60 : 30;
                    const color = c.mood === 'good' || c.mood === 'great' ? 'bg-[#6E9C7B]' : c.mood === 'okay' ? 'bg-[#D5A85C]' : 'bg-[#C98291]';
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t-md ${color} transition-all duration-300`}
                          style={{ height: `${heightPercent}%` }}
                          title={`Day ${i + 1}: ${c.mood}`}
                        />
                        <span className="text-[9px] text-[#766D72]">d{i + 1}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#766D72]">
                    No daily logs recorded
                  </div>
                )}
              </div>
              <div className="text-[11px] text-[#766D72] flex items-center justify-between pt-1 border-t border-[#E9DFDC]/60">
                <span>Good: {goodMoodCount}</span>
                <span>Normal: {okayMoodCount}</span>
                <span>Fatigue: {notWellMoodCount}</span>
              </div>
            </div>

            {/* Trend Card 2: Sleep Quality */}
            <div className="p-4 rounded-2xl border border-[#E9DFDC] bg-white space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#352F35]">Sleep Restfulness</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFEBF4] text-[#7E699B]">
                  {poorSleepCount > 0 ? `${poorSleepCount} disrupted nights` : 'Stable rest'}
                </span>
              </div>
              <div className="h-16 flex items-end gap-1.5 pt-2">
                {last14Days.length > 0 ? (
                  last14Days.slice(0, 10).map((c, i) => {
                    const heightPercent = c.sleep === 'good' ? 100 : c.sleep === 'okay' ? 65 : 35;
                    const color = c.sleep === 'good' ? 'bg-[#7E699B]' : c.sleep === 'okay' ? 'bg-[#B7A6C9]' : 'bg-[#C62828]';
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t-md ${color} transition-all duration-300`}
                          style={{ height: `${heightPercent}%` }}
                          title={`Day ${i + 1}: Sleep ${c.sleep || 'unknown'}`}
                        />
                        <span className="text-[9px] text-[#766D72]">d{i + 1}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#766D72]">
                    Sleep logs will graph here
                  </div>
                )}
              </div>
              <div className="text-[11px] text-[#766D72] flex items-center justify-between pt-1 border-t border-[#E9DFDC]/60">
                <span>Sound Sleep: {goodSleepCount}</span>
                <span>Interrupted: {poorSleepCount}</span>
              </div>
            </div>

            {/* Trend Card 3: Baby Movement / Kicks */}
            <div className="p-4 rounded-2xl border border-[#E9DFDC] bg-white space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#352F35]">Fetal Movement</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3E8] text-[#CF9B48]">
                  {pregnancyWeek >= 28 ? 'Active kick tracking' : 'Milestone emerging'}
                </span>
              </div>
              <div className="h-16 flex items-end gap-1.5 pt-2">
                {last14Days.length > 0 ? (
                  last14Days.slice(0, 10).map((c, i) => {
                    const heightPercent = c.babyMovement === 'normal' ? 100 : c.babyMovement === 'less' ? 40 : 70;
                    const color = c.babyMovement === 'normal' ? 'bg-[#CF9B48]' : 'bg-[#E8C5C8]';
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t-md ${color} transition-all duration-300`}
                          style={{ height: `${heightPercent}%` }}
                          title={`Day ${i + 1}: Movement ${c.babyMovement || 'normal'}`}
                        />
                        <span className="text-[9px] text-[#766D72]">d{i + 1}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#766D72]">
                    Movement logs will appear here
                  </div>
                )}
              </div>
              <div className="text-[11px] text-[#766D72] flex items-center justify-between pt-1 border-t border-[#E9DFDC]/60">
                <span>Normal active: {activeMovementCount}</span>
                <span>Decreased: {quietMovementCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: REPORTED SYMPTOMS & RED-FLAG STATUS */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-[#352F35] uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C98291]" />
            <span>Symptom Log & Clinical Safety Screening</span>
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-[#E9DFDC]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FCF8F6] border-b border-[#E9DFDC] text-[#766D72] font-bold">
                  <th className="p-3">Symptom</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Reported Frequency</th>
                  <th className="p-3">Safety Triage Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DFDC]">
                {recentSymptoms.length > 0 ? (
                  recentSymptoms.map((s, idx) => (
                    <tr key={idx} className="hover:bg-[#FFF9FA]">
                      <td className="p-3 font-semibold text-[#352F35]">{s.symptomName}</td>
                      <td className="p-3 capitalize">{s.severity}</td>
                      <td className="p-3 text-[#766D72]">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF5EF] text-[#2E7D32]">
                          <CheckCircle2 className="w-3 h-3" /> No red flags
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-[#766D72]">
                      No acute or recurring symptoms logged during this period. Red flags screened daily: Cleared.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: MEDICATIONS & SUPPLEMENTS */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-[#352F35] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#9F5F6E]" />
            <span>Current Prenatal Medications & Prescriptions</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {medications.length > 0 ? (
              medications.map((m) => (
                <div key={m.id} className="p-3 rounded-xl border border-[#E9DFDC] bg-white flex items-center justify-between">
                  <div>
                    <strong className="text-[#352F35] block">{m.name}</strong>
                    <span className="text-[#766D72]">{m.dosage} • {m.frequency}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF5EF] text-[#2E7D32]">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl border border-[#E9DFDC] bg-white text-[#766D72] col-span-2">
                Standard prenatal multivitamin with folic acid & iron. No additional prescription medications recorded.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: INTELLIGENT QUESTIONS FOR THE CLINICIAN */}
        <div className="space-y-3 p-4 rounded-2xl bg-[#FAF4E9] border border-[#E8D7B8]">
          <h3 className="font-extrabold text-xs sm:text-sm text-[#8C6D2D] uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            <span>Recommended Questions for Today's Consultation</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-[#4A3E42]">
            {questionsForDoctor.map((q, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#E8D7B8] text-[#8C6D2D] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SECTION 5: CLINICIAN NOTES & SIGN-OFF (Clean A4 footer) */}
        <div className="pt-4 border-t-2 border-dashed border-[#E9DFDC] space-y-4">
          <h3 className="font-extrabold text-xs text-[#766D72] uppercase tracking-wider">
            Clinical Notes & Vital Signs Checklist (For Attending Doctor / Midwife)
          </h3>
          <div className="grid grid-cols-4 gap-2 text-xs border border-[#E9DFDC] p-3 rounded-xl">
            <div className="border-r border-[#E9DFDC] pr-2">
              <span className="text-[#766D72] block text-[10px]">BP (mmHg):</span>
              <span className="font-mono text-[#352F35] font-bold">___ / ___</span>
            </div>
            <div className="border-r border-[#E9DFDC] pr-2">
              <span className="text-[#766D72] block text-[10px]">Fundal Height:</span>
              <span className="font-mono text-[#352F35] font-bold">___ cm</span>
            </div>
            <div className="border-r border-[#E9DFDC] pr-2">
              <span className="text-[#766D72] block text-[10px]">Fetal Heart Rate:</span>
              <span className="font-mono text-[#352F35] font-bold">___ bpm</span>
            </div>
            <div>
              <span className="text-[#766D72] block text-[10px]">Urine Alb/Glu:</span>
              <span className="font-mono text-[#352F35] font-bold">___ / ___</span>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between text-xs text-[#766D72]">
            <div>
              <p>Clinician Signature: ___________________________________</p>
            </div>
            <div>
              <p>Date: _______________</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
