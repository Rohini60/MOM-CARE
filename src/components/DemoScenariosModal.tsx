import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Play } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export interface DemoScenario {
  id: string;
  title: string;
  expectedLevel: 'green' | 'yellow' | 'red';
  week: number;
  symptomName: string;
  description: string;
  severity: string;
  duration: string;
  clinicalContext: string;
  expectedTriage: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario_1',
    title: 'Scenario 1 — Routine Pregnancy Adaptation',
    expectedLevel: 'green',
    week: 24,
    symptomName: 'Frequent Urination',
    description: 'Needing to use the restroom every 1 to 2 hours during the day, but without pain, burning, or fever.',
    severity: 'mild',
    duration: 'Past 3 days',
    clinicalContext: 'Gestational week 24: Maternal cardiac output and renal blood flow increase by ~40-50%, combined with growing uterine weight compressing the bladder fundus.',
    expectedTriage: 'GREEN (Routine Monitoring). Reassurance of normal physiologic pelvic pressure, safe hydration guidance, and advice not to restrict water.',
  },
  {
    id: 'scenario_2',
    title: 'Scenario 2 — Needs Healthcare Assessment',
    expectedLevel: 'yellow',
    week: 24,
    symptomName: 'Frequent Urination with Burning & Mild Temperature',
    description: 'Urination feels stinging and hot today. Accompanied by mild pelvic ache and feeling unusually flushed (temp 99.8°F / 37.6°C).',
    severity: 'moderate',
    duration: 'Started this morning',
    clinicalContext: 'Gestational week 24: Suspected urinary tract infection (UTI). High risk of progression to pyelonephritis (kidney infection) or preterm uterine irritability if left untreated.',
    expectedTriage: 'YELLOW (Needs Assessment). Clear guidance to contact obstetrician/midwife within 12-24h for simple urine dipstick culture and safe antibiotics.',
  },
  {
    id: 'scenario_3',
    title: 'Scenario 3 — Urgent Warning Signs (Preeclampsia Triad)',
    expectedLevel: 'red',
    week: 28,
    symptomName: 'Severe Headache with Flashing Spots & Puffy Face',
    description: 'Persistent throbbing frontal headache that did not improve after rest and water. Seeing flashing floaters and rings of light. Rings on fingers suddenly feel tight and face looks swollen.',
    severity: 'severe',
    duration: 'Past 4 hours, worsening',
    clinicalContext: 'Gestational week 28: Classic preeclampsia warning signs (cerebral vasospasm, sudden extracellular fluid shifts, elevated arterial blood pressure).',
    expectedTriage: 'RED (Urgent Attention). Deterministic safety rule immediately mandates emergency triage evaluation at Labor & Delivery for blood pressure and urinalysis.',
  },
];

interface DemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const DemoScenariosModal: React.FC<DemoScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-[#FCF8F6] rounded-2xl sm:rounded-3xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden border border-[#E9DFDC]">
        {/* Header */}
        <div className="bg-[#FFFFFF] px-5 py-4 border-b border-[#E9DFDC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F2E5E7] flex items-center justify-center text-[#9F5F6E]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#352F35]">Presentation Demo Scenarios</h3>
              <p className="text-xs text-[#766D72]">Pre-configured clinical safety validation cases</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#766D72] hover:bg-[#F2E5E7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E9DFDC] text-xs text-[#766D72] leading-relaxed">
            <span className="font-semibold text-[#352F35]">Competition Evaluation Note: </span>
            MomCare combines deterministic medical safety guardrails with Gemini generative intelligence. Test each scenario to observe live risk categorization, evidence-based reasoning, and trusted medical sources.
          </div>

          <div className="space-y-3">
            {DEMO_SCENARIOS.map((s) => (
              <div
                key={s.id}
                className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E9DFDC] shadow-2xs hover:border-[#C98291] transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <RiskBadge level={s.expectedLevel} size="sm" />
                    <span className="text-xs font-semibold text-[#766D72]">Week {s.week}</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectScenario(s);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#9F5F6E] text-white text-xs font-semibold hover:bg-[#8C5361] transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Test</span>
                  </button>
                </div>

                <h4 className="font-bold text-sm text-[#352F35] mb-1">{s.title}</h4>
                <p className="text-xs text-[#766D72] mb-2 leading-relaxed">
                  <span className="font-medium text-[#352F35]">Reported: </span>
                  {s.symptomName} — {s.description}
                </p>

                <div className="pt-2 border-t border-[#E9DFDC]/60 flex flex-col gap-1 text-[11px]">
                  <span className="text-[#766D72]">
                    <strong className="text-[#352F35]">Expected Output: </strong>
                    {s.expectedTriage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
