import React, { useState } from 'react';
import {
  Sparkles,
  Baby,
  Heart,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { getPregnancyWeekData } from '../../config/pregnancyWeeks';
import type { UserProfile, Checkin, SymptomRecord } from '../../types';

interface PregnancyScreenProps {
  currentWeek: number;
  selectedWeek: number;
  onSelectWeek: (w: number) => void;
  recentCheckins: Checkin[];
  recentSymptoms: SymptomRecord[];
  onOpenAiChat: (prompt?: string) => void;
}

export const PregnancyScreen: React.FC<PregnancyScreenProps> = ({
  currentWeek,
  selectedWeek,
  onSelectWeek,
  recentCheckins,
  recentSymptoms,
  onOpenAiChat,
}) => {
  const [activeSection, setActiveSection] = useState<'baby' | 'mom' | 'care'>('baby');
  const weekData = getPregnancyWeekData(selectedWeek);

  // Interactive Learning State (Section 35)
  const [learningTab, setLearningTab] = useState<'warning_sign' | 'quiz' | 'myth'>('warning_sign');
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [warningAnswered, setWarningAnswered] = useState<number | null>(null);
  const [mythAnswered, setMythAnswered] = useState<boolean | null>(null);

  // Sub-view toggle: "Weekly Journey" vs "My Pregnancy Story"
  const [viewMode, setViewMode] = useState<'journey' | 'timeline'>('journey');

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      {/* Top Toggle: Journey vs Timeline */}
      <div className="flex bg-[#FFFFFF] p-1 rounded-2xl border border-[#E9DFDC] shadow-2xs">
        <button
          onClick={() => setViewMode('journey')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            viewMode === 'journey'
              ? 'bg-[#F2E5E7] text-[#9F5F6E] shadow-2xs'
              : 'text-[#766D72] hover:text-[#352F35]'
          }`}
        >
          Weekly Development
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            viewMode === 'timeline'
              ? 'bg-[#F2E5E7] text-[#9F5F6E] shadow-2xs'
              : 'text-[#766D72] hover:text-[#352F35]'
          }`}
        >
          My Pregnancy Story ({recentCheckins.length + recentSymptoms.length} records)
        </button>
      </div>

      {viewMode === 'journey' ? (
        <>
          {/* Week Stepper Carousel */}
          <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E9DFDC] shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => onSelectWeek(Math.max(4, selectedWeek - 1))}
                disabled={selectedWeek <= 4}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#E9DFDC] text-[#766D72] hover:bg-[#F2E5E7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-[11px] font-semibold text-[#9F5F6E] uppercase tracking-wider">
                  Trimester {weekData.trimester}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-xl font-extrabold text-[#352F35]">Week {selectedWeek}</h2>
                  {selectedWeek === currentWeek && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2E1E3] text-[#9F5F6E]">
                      Current
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onSelectWeek(Math.min(42, selectedWeek + 1))}
                disabled={selectedWeek >= 42}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#E9DFDC] text-[#766D72] hover:bg-[#F2E5E7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick week pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[8, 12, 16, 20, 24, 28, 32, 36, 40].map((w) => (
                <button
                  key={w}
                  onClick={() => onSelectWeek(w)}
                  className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-colors border ${
                    selectedWeek === w
                      ? 'bg-[#9F5F6E] text-white border-[#9F5F6E] font-semibold'
                      : 'bg-[#FCF8F6] text-[#766D72] border-[#E9DFDC] hover:bg-[#F2E5E7]'
                  }`}
                >
                  Wk {w}
                </button>
              ))}
            </div>
          </div>

          {/* Fruit / Size Comparison Banner */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-[#FFFFFF] via-[#FCF8F6] to-[#EFEBF4] border border-[#E9DFDC] flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#B7A6C9] uppercase">Size Comparison</span>
              <h3 className="text-base font-bold text-[#352F35]">Size of an {weekData.fruitComparison}</h3>
              <p className="text-xs text-[#766D72]">
                Length: {weekData.approxLength} • Weight: {weekData.approxWeight}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#E9DFDC] flex items-center justify-center text-2xl shadow-2xs">
              {weekData.fruitComparison.toLowerCase().includes('corn') ? '🌽' : weekData.fruitComparison.toLowerCase().includes('banana') ? '🍌' : weekData.fruitComparison.toLowerCase().includes('avocado') ? '🥑' : weekData.fruitComparison.toLowerCase().includes('eggplant') ? '🍆' : weekData.fruitComparison.toLowerCase().includes('squash') ? '🫐' : '🍉'}
            </div>
          </div>

          {/* Interactive Sections: [BABY] [MOM] [CARE] (Section 7 & 12) */}
          <div className="space-y-3">
            <div className="flex rounded-2xl bg-[#FFFFFF] p-1 border border-[#E9DFDC] shadow-2xs">
              <button
                onClick={() => setActiveSection('baby')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeSection === 'baby'
                    ? 'bg-[#EFEBF4] text-[#7E699B] shadow-2xs'
                    : 'text-[#766D72] hover:text-[#352F35]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-[#B7A6C9]" />
                <span>BABY</span>
              </button>
              <button
                onClick={() => setActiveSection('mom')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeSection === 'mom'
                    ? 'bg-[#F2E1E3] text-[#9F5F6E] shadow-2xs'
                    : 'text-[#766D72] hover:text-[#352F35]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-[#C98291]" />
                <span>MOM</span>
              </button>
              <button
                onClick={() => setActiveSection('care')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeSection === 'care'
                    ? 'bg-[#F9ECE7] text-[#B87A63] shadow-2xs'
                    : 'text-[#766D72] hover:text-[#352F35]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-[#E8B6A3]" />
                <span>CARE</span>
              </button>
            </div>

            {/* BABY Content Card */}
            {activeSection === 'baby' && (
              <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-4 animate-in fade-in">
                {/* Real Photo of Baby in Mother's Womb */}
                <div className="rounded-2xl overflow-hidden border border-[#E9DFDC] relative group shadow-inner">
                  <div className="h-44 sm:h-52 w-full relative">
                    <img
                      src="/src/assets/images/fetal_womb_render_1790941803084.jpg"
                      alt={`Photo of baby developing in mother's womb at week ${selectedWeek}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#201518]/90 via-[#201518]/25 to-transparent pointer-events-none" />
                    
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-[#2B1F24]/85 backdrop-blur-md text-[11px] font-semibold text-[#FCF8F6] border border-white/20 flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3 h-3 text-[#E8B6A3]" />
                      <span>Week {selectedWeek} Baby in Mother's Womb</span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <p className="text-xs font-medium text-[#FCF8F6] drop-shadow-sm">
                        Baby is {weekData.approxLength} long and weighs approx. {weekData.approxWeight}, nestled securely in clear, temperature-regulated amniotic fluid.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#EFEBF4] text-[#7E699B] flex items-center justify-center">
                    <Baby className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#352F35]">Baby’s Major Developments This Week</h4>
                </div>

                <div className="space-y-2">
                  {weekData.babyHighlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC]/60">
                      <div className="w-4 h-4 rounded-full bg-[#B7A6C9]/30 text-[#7E699B] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-[#352F35] leading-relaxed">{highlight}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onOpenAiChat(`Tell me more about baby's sensory and brain development in Week ${selectedWeek}.`)}
                  className="w-full mt-2 py-2 rounded-xl bg-[#EFEBF4] text-[#7E699B] text-xs font-semibold hover:bg-[#E2D8EA] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI about baby’s week {selectedWeek} milestones</span>
                </button>
              </div>
            )}

            {/* MOM Content Card */}
            {activeSection === 'mom' && (
              <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#F2E1E3] text-[#9F5F6E] flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#352F35]">Mother’s Body & Emotional Adaptations</h4>
                </div>

                <div className="space-y-2">
                  {weekData.motherChanges.map((change, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC]/60">
                      <div className="w-4 h-4 rounded-full bg-[#C98291]/30 text-[#9F5F6E] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-[#352F35] leading-relaxed">{change}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onOpenAiChat(`What comfort strategies help with body changes during Week ${selectedWeek}?`)}
                  className="w-full mt-2 py-2 rounded-xl bg-[#F2E1E3] text-[#9F5F6E] text-xs font-semibold hover:bg-[#E9D1D5] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI about maternal changes in week {selectedWeek}</span>
                </button>
              </div>
            )}

            {/* CARE Content Card */}
            {activeSection === 'care' && (
              <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#F9ECE7] text-[#B87A63] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#352F35]">Care Focus & Provider Questions</h4>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[#766D72] uppercase">This Week’s Care Focus</span>
                  {weekData.careFocus.map((care, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC]/60 text-xs text-[#352F35]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7FA58B] shrink-0 mt-0.5" />
                      <span>{care}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E9DFDC]">
                  <span className="text-[11px] font-semibold text-[#766D72] uppercase">Questions to Ask Your Doctor / Midwife</span>
                  {weekData.doctorQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-[#FAF4E9] border border-[#F3DFC0] text-xs text-[#352F35]">
                      <HelpCircle className="w-3.5 h-3.5 text-[#D5A85C] shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Learning Activities (Section 35) */}
          <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#FAF4E9] text-[#D5A85C] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#352F35]">Interactive Maternal Learning</h4>
                  <p className="text-[11px] text-[#766D72]">Evidence-based safety and biology quizzes</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 border-b border-[#E9DFDC] pb-2 text-xs">
              <button
                onClick={() => setLearningTab('warning_sign')}
                className={`px-3 py-1 rounded-xl transition-colors font-medium ${
                  learningTab === 'warning_sign'
                    ? 'bg-[#9F5F6E] text-white'
                    : 'bg-[#FCF8F6] text-[#766D72]'
                }`}
              >
                Spot the Warning Sign
              </button>
              <button
                onClick={() => setLearningTab('quiz')}
                className={`px-3 py-1 rounded-xl transition-colors font-medium ${
                  learningTab === 'quiz'
                    ? 'bg-[#9F5F6E] text-white'
                    : 'bg-[#FCF8F6] text-[#766D72]'
                }`}
              >
                Development Quiz
              </button>
              <button
                onClick={() => setLearningTab('myth')}
                className={`px-3 py-1 rounded-xl transition-colors font-medium ${
                  learningTab === 'myth'
                    ? 'bg-[#9F5F6E] text-white'
                    : 'bg-[#FCF8F6] text-[#766D72]'
                }`}
              >
                True or False
              </button>
            </div>

            {/* Activity 1: Spot the warning sign */}
            {learningTab === 'warning_sign' && (
              <div className="space-y-2.5 pt-1">
                <p className="text-xs font-semibold text-[#352F35]">
                  Which of the following symptoms in Week 24 warrants immediate medical triage?
                </p>
                <div className="space-y-1.5">
                  {[
                    { text: 'A. Mild swelling in ankles after a long walk that disappears with elevation', isCorrect: false },
                    { text: 'B. Sudden gush of clear vaginal fluid or sudden severe headache with visual spots', isCorrect: true },
                    { text: 'C. Feeling mild painless belly tightening 1-2 times a day (Braxton Hicks)', isCorrect: false },
                  ].map((option, idx) => {
                    const isSelected = warningAnswered === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setWarningAnswered(idx)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? option.isCorrect
                              ? 'bg-[#EEF5F1] border-[#7FA58B] text-[#7FA58B] font-semibold'
                              : 'bg-[#FAEAEA] border-[#C96B6B] text-[#C96B6B] font-semibold'
                            : 'bg-[#FCF8F6] border-[#E9DFDC] text-[#352F35] hover:bg-[#F2E5E7]'
                        }`}
                      >
                        {option.text}
                      </button>
                    );
                  })}
                </div>
                {warningAnswered !== null && (
                  <div className="p-3 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC] text-xs text-[#766D72] leading-relaxed">
                    <strong className="text-[#352F35]">Clinical Explanation: </strong>
                    Option B describes possible premature rupture of membranes (PPROM) or preeclampsia signs. Both require immediate in-person assessment by an obstetrician or labor & delivery triage unit (Source: ACOG Clinical Guidelines).
                  </div>
                )}
              </div>
            )}

            {/* Activity 2: Baby Development Quiz */}
            {learningTab === 'quiz' && (
              <div className="space-y-2.5 pt-1">
                <p className="text-xs font-semibold text-[#352F35]">
                  Around Week 20-24, what major respiratory milestone begins in your baby’s lungs?
                </p>
                <div className="space-y-1.5">
                  {[
                    { text: '1. Production of surfactant by alveolar cells to help alveoli inflate', isCorrect: true },
                    { text: '2. Baby breathes room air through the umbilical cord', isCorrect: false },
                    { text: '3. Lungs are completely filled with carbon dioxide', isCorrect: false },
                  ].map((option, idx) => {
                    const isSelected = quizAnswered === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setQuizAnswered(idx)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? option.isCorrect
                              ? 'bg-[#EEF5F1] border-[#7FA58B] text-[#7FA58B] font-semibold'
                              : 'bg-[#FAEAEA] border-[#C96B6B] text-[#C96B6B] font-semibold'
                            : 'bg-[#FCF8F6] border-[#E9DFDC] text-[#352F35] hover:bg-[#F2E5E7]'
                        }`}
                      >
                        {option.text}
                      </button>
                    );
                  })}
                </div>
                {quizAnswered !== null && (
                  <div className="p-3 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC] text-xs text-[#766D72] leading-relaxed">
                    <strong className="text-[#352F35]">Clinical Explanation: </strong>
                    Surfactant is a substance that lines the microscopic air sacs (alveoli) to keep them from collapsing upon birth. This milestone marks the threshold of viability (Source: NHS / ACOG).
                  </div>
                )}
              </div>
            )}

            {/* Activity 3: True or False */}
            {learningTab === 'myth' && (
              <div className="space-y-2.5 pt-1">
                <p className="text-xs font-semibold text-[#352F35]">
                  "True or False: Expectant mothers should 'eat for two' by doubling their daily calorie intake."
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMythAnswered(true)}
                    className={`py-2 rounded-xl border text-xs font-semibold text-center transition-colors ${
                      mythAnswered === true ? 'bg-[#FAEAEA] border-[#C96B6B] text-[#C96B6B]' : 'bg-[#FCF8F6] border-[#E9DFDC]'
                    }`}
                  >
                    True
                  </button>
                  <button
                    onClick={() => setMythAnswered(false)}
                    className={`py-2 rounded-xl border text-xs font-semibold text-center transition-colors ${
                      mythAnswered === false ? 'bg-[#EEF5F1] border-[#7FA58B] text-[#7FA58B]' : 'bg-[#FCF8F6] border-[#E9DFDC]'
                    }`}
                  >
                    False (Correct!)
                  </button>
                </div>
                {mythAnswered !== null && (
                  <div className="p-3 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC] text-xs text-[#766D72] leading-relaxed">
                    <strong className="text-[#352F35]">Medical Fact: </strong>
                    False. Nutritional quality matters far more than double quantity. In the second trimester, mothers typically need only about ~340 extra nutritious calories per day (e.g. an apple with peanut butter and a cup of yogurt), not double (Source: ACOG Nutrition in Pregnancy).
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* My Pregnancy Story (Section 11) */
        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#352F35]">My Pregnancy Story</h3>
            <p className="text-xs text-[#766D72]">
              Your longitudinal health journey recorded chronologically
            </p>
          </div>

          <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E9DFDC]">
            {/* Combine Checkins and Symptoms into timeline */}
            {recentCheckins.length === 0 && recentSymptoms.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#766D72] space-y-1">
                <p>No check-in or symptom timeline entries yet.</p>
                <p className="text-[11px]">Your daily check-ins and symptoms will populate your pregnancy story.</p>
              </div>
            ) : (
              [
                ...recentCheckins.map((c) => ({
                  type: 'checkin',
                  date: c.createdAt,
                  week: c.week,
                  title: `Week ${c.week} Check-in`,
                  detail: `Mood: ${c.mood} • Energy: ${c.energy} • Sleep: ${c.sleep} • Baby movement: ${c.babyMovement}${c.symptoms ? ` • "${c.symptoms}"` : ''}`,
                })),
                ...recentSymptoms.map((s) => ({
                  type: 'symptom',
                  date: s.createdAt,
                  week: s.week,
                  title: `Week ${s.week}: ${s.symptomName}`,
                  detail: `Severity: ${s.severity} • Triage: ${s.riskLevel.toUpperCase()}${s.aiSummary ? ` • ${s.aiSummary.slice(0, 100)}...` : ''}`,
                })),
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((item, idx) => (
                  <div key={idx} className="relative pl-7 text-xs space-y-1">
                    <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-[#FFFFFF] border-2 border-[#9F5F6E]" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#352F35]">{item.title}</span>
                      <span className="text-[10px] text-[#766D72]">
                        {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[#766D72] leading-relaxed bg-[#FCF8F6] p-2.5 rounded-xl border border-[#E9DFDC]/60">
                      {item.detail}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
