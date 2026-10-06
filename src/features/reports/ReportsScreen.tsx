import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock,
  Eye,
  Trash2,
  BookOpen,
  Search,
  Stethoscope,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { UserProfile, MedicalReport } from '../../types';
import { requestReportInsights } from '../../services/ai/client';
import { saveMedicalReport, deleteMedicalReport, uploadReportDocument } from '../../services/firebase/reportService';

interface ReportsScreenProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  reports: MedicalReport[];
  onReportsUpdated: () => void;
  onOpenAiChat: (prompt?: string) => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  profile,
  pregnancyWeek,
  reports,
  onReportsUpdated,
  onOpenAiChat,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState<'Ultrasound Scan' | 'Blood Work / Lab' | 'Genetic Screening' | 'Glucose Tolerance' | 'Clinical Notes'>('Ultrasound Scan');
  const [reportText, setReportText] = useState('');
  const [activeReport, setActiveReport] = useState<MedicalReport | null>(null);
  const [glossaryFilter, setGlossaryFilter] = useState('');
  const [showGlossary, setShowGlossary] = useState(false);

  // Common Clinical Terms Simplified (Feature 5)
  const clinicalGlossary = [
    {
      term: 'Cephalic Presentation',
      definition: 'Baby is positioned head-down toward the birth canal. This is the optimal, most common, and reassuring position for vaginal labor.',
    },
    {
      term: 'AFI 12 cm (Amniotic Fluid Index)',
      definition: 'Measurement of amniotic fluid volume around baby. 12 cm is within the normal, healthy range (normal is typically 8 to 18 cm), indicating good placental function and fetal kidney fluid cycling.',
    },
    {
      term: 'BPD (Biparietal Diameter)',
      definition: 'The diameter across baby’s skull between the parietal bones. Used with gestational age curves to confirm healthy, symmetrical brain and skull growth.',
    },
    {
      term: 'FL (Femur Length)',
      definition: 'The length of baby’s thigh bone. Confirms healthy skeletal and longitudinal growth.',
    },
    {
      term: 'AC (Abdominal Circumference)',
      definition: 'The circular measurement around baby’s abdomen and liver, directly reflecting fetal nutrition and weight.',
    },
    {
      term: 'Posterior Placenta / Anterior Placenta',
      definition: 'The location where the placenta attached inside the uterus (anterior = front wall, posterior = back wall). Both are completely safe normal positions as long as it does not cover the cervix (previa).',
    },
    {
      term: 'Cervical Length 38 mm',
      definition: 'Length of the cervix. Normal length past mid-pregnancy is >25–30 mm. 38 mm indicates a long, strong, closed cervix supporting pregnancy safely.',
    },
    {
      term: 'GTT Plasma Glucose 122 mg/dL',
      definition: 'Blood sugar reading 1 hour after a 50g glucose drink. Readings below 135–140 mg/dL are normal and negative for gestational diabetes.',
    },
  ];

  const filteredGlossary = clinicalGlossary.filter(
    (item) =>
      item.term.toLowerCase().includes(glossaryFilter.toLowerCase()) ||
      item.definition.toLowerCase().includes(glossaryFilter.toLowerCase())
  );

  // Real medical report presets for immediate demonstration
  const samplePresets = [
    {
      name: '20-Week Detailed Anatomy Ultrasound Scan',
      type: 'Ultrasound Scan' as const,
      text: `Clinical Indication: Routine mid-trimester structural anatomy evaluation at 20 weeks 2 days gestation.
Biometry:
BPD: 48 mm (corresponds to 20w3d)
HC: 178 mm (corresponds to 20w1d)
AC: 154 mm (corresponds to 20w0d)
FL: 33 mm (corresponds to 20w2d)
Estimated Fetal Weight (EFW): 345 grams (52nd percentile).
Fetal Presentation: Cephalic presentation.
Fetal Heart: 4-chamber view visualized, normal cardiac axis, heart rate 146 bpm, regular rhythm. Outflow tracts intact.
Placenta: Anterior, fundal, clearly clear of internal cervical os (>3.5 cm away). No previa.
Amniotic Fluid: Normal volume, Amniotic Fluid Index (AFI) 12 cm, Maximum Vertical Pocket 4.6 cm.
Cervical Length: 38 mm, closed, no funneling.
Impression: Single active intrauterine gestation with normal biometry and reassuring structural survey.`,
    },
    {
      name: '1-Hour Gestational Glucose Tolerance Test (50g)',
      type: 'Glucose Tolerance' as const,
      text: `Patient: Maya
Gestational Age: 24 weeks 4 days
Test: 1-hour 50-gram Oral Glucose Challenge Test (OGTT screening)
Specimen collection: 60 minutes post 50g glucola ingestion
Plasma Glucose Value: 122 mg/dL
Standard Clinical Reference Range: Normal < 135 mg/dL (or < 140 mg/dL per ACOG criteria)
Flag: Normal
Interpretation: Negative screening for gestational diabetes mellitus at current gestational age.`,
    },
    {
      name: 'Second Trimester Maternal Complete Blood Count (CBC)',
      type: 'Blood Work / Lab' as const,
      text: `Test Name: Complete Blood Count with Differential
Gestational Age: 24 weeks
Hemoglobin (Hb): 11.4 g/dL (Second trimester reference: 10.5 - 12.0 g/dL)
Hematocrit (Hct): 34.2% (Reference: 32 - 36%)
White Blood Cell (WBC): 9.8 x10^3/uL (Reference: 5.6 - 12.2 x10^3/uL)
Platelet Count: 220 x10^3/uL (Reference: 150 - 400 x10^3/uL)
Impression: Physiological hemodilution of pregnancy within expected parameters. No evidence of severe anemia or thrombocytopenia.`,
    },
  ];

  const handleProcessReport = async (nameToUse?: string, typeToUse?: any, textToUse?: string) => {
    const finalName = nameToUse || reportName;
    const finalType = typeToUse || reportType;
    const finalText = textToUse || reportText;

    if (!finalName.trim() || isUploading || !profile) return;

    setIsUploading(true);
    try {
      const insights = await requestReportInsights({
        reportName: finalName,
        reportType: finalType,
        reportText: finalText,
        pregnancyWeek,
      });

      const newReport: MedicalReport = {
        id: `rep_${Date.now()}`,
        userId: profile.id,
        reportName: finalName,
        reportDate: new Date().toISOString().split('T')[0],
        reportType: finalType,
        aiSummary: insights.aiSummary,
        plainLanguageExplanation: insights.plainLanguageExplanation,
        keyValues: insights.keyValues,
        questionsForDoctor: insights.questionsForDoctor,
        createdAt: new Date().toISOString(),
      };

      await saveMedicalReport(newReport);
      setActiveReport(newReport);
      setReportName('');
      setReportText('');
      onReportsUpdated();
    } catch (err: any) {
      console.error('Error analyzing report:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!profile) return;
    try {
      await deleteMedicalReport(profile.id, reportId);
      if (activeReport?.id === reportId) {
        setActiveReport(null);
      }
      onReportsUpdated();
    } catch (err) {
      console.error('Delete report error:', err);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#F5EBEF] shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] border border-[#FADADD] text-[#A36371] flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#4A3E42]">Medical Report Simplification</h2>
            <p className="text-xs text-[#7D6E74]">Parses complex ultrasound and lab metrics into plain, reassuring summaries</p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-[#F5EBEF] flex items-start gap-2.5 text-xs text-[#7D6E74]">
        <ShieldCheck className="w-4 h-4 text-[#A36371] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#4A3E42]">AI-generated explanation — not a clinical diagnosis. </span>
          MomCare empowers mothers to understand ultrasound acronyms and lab values so you feel confident and prepared for your prenatal appointments.
        </div>
      </div>

      {/* Feature 5: Clinical Ultrasound & Lab Glossary Collapsible */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#F5EBEF] shadow-sm space-y-3">
        <div
          onClick={() => setShowGlossary(!showGlossary)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#FFF0F5] text-[#A36371] flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#4A3E42]">
                Common Clinical Terms Simplified (AFI, Cephalic, BPD, etc.)
              </h3>
              <p className="text-[11px] text-[#7D6E74]">Tap to browse plain-language definitions</p>
            </div>
          </div>
          {showGlossary ? <ChevronUp className="w-4 h-4 text-[#7D6E74]" /> : <ChevronDown className="w-4 h-4 text-[#7D6E74]" />}
        </div>

        {showGlossary && (
          <div className="space-y-3 pt-2 border-t border-[#F5EBEF] animate-in fade-in">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#7D6E74]" />
              <input
                type="text"
                value={glossaryFilter}
                onChange={(e) => setGlossaryFilter(e.target.value)}
                placeholder="Search clinical terms (e.g. Cephalic, AFI, Placenta)..."
                className="w-full bg-[#FFF9FA] border border-[#F5EBEF] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#4A3E42] placeholder-[#7D6E74] focus:outline-hidden focus:border-[#E8C5C8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {filteredGlossary.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#FFF9FA] border border-[#F5EBEF] space-y-1">
                  <span className="font-bold text-[#A36371] block">{item.term}</span>
                  <p className="text-[11px] text-[#4A3E42] leading-relaxed">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload & Preset Input Card */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#F5EBEF] shadow-sm space-y-3.5">
        <h3 className="font-bold text-sm text-[#4A3E42]">Analyze an Ultrasound Scan or Lab Report</h3>

        {/* Quick Sample Presets */}
        <div>
          <span className="text-[11px] font-semibold text-[#7D6E74] mb-1.5 block">
            Click to load a real clinical sample report:
          </span>
          <div className="flex flex-col gap-1.5">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setReportName(preset.name);
                  setReportType(preset.type);
                  setReportText(preset.text);
                }}
                className="text-left p-2.5 rounded-xl bg-[#FFF9FA] border border-[#F5EBEF] hover:border-[#E8C5C8] transition-all text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-[#4A3E42] block">{preset.name}</span>
                  <span className="text-[10px] text-[#7D6E74]">{preset.type}</span>
                </div>
                <span className="text-[11px] text-[#A36371] font-semibold shrink-0">Load Sample →</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-[#F5EBEF] space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#7D6E74] mb-1 font-medium">Report Name</label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g. 20-Week Detailed Anatomy Scan, GTT Screening"
                className="w-full bg-[#FFF9FA] border border-[#F5EBEF] rounded-xl px-3 py-2 text-xs text-[#4A3E42] focus:outline-hidden focus:border-[#E8C5C8]"
              />
            </div>
            <div>
              <label className="block text-[#7D6E74] mb-1 font-medium">Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full bg-[#FFF9FA] border border-[#F5EBEF] rounded-xl px-3 py-2 text-xs text-[#4A3E42] focus:outline-hidden focus:border-[#E8C5C8]"
              >
                <option>Ultrasound Scan</option>
                <option>Blood Work / Lab</option>
                <option>Glucose Tolerance</option>
                <option>Genetic Screening</option>
                <option>Clinical Notes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#7D6E74] mb-1 font-medium">
              Report Content (Paste clinical findings, measurements, or doctor's summary)
            </label>
            <textarea
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Paste doctor notes, AFI values, fetal presentation, biometry..."
              className="w-full bg-[#FFF9FA] border border-[#F5EBEF] rounded-xl px-3 py-2 text-xs text-[#4A3E42] focus:outline-hidden focus:border-[#E8C5C8]"
            />
          </div>

          <button
            onClick={() => handleProcessReport()}
            disabled={!reportName.trim() || isUploading}
            className="w-full py-2.5 rounded-xl bg-[#A36371] text-white text-xs sm:text-sm font-semibold hover:bg-[#8F525F] transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Simplifying clinical terms with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simplify Report into Plain English</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Report Detail View */}
      {activeReport && (
        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-6 border border-[#F5EBEF] shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between pb-3 border-b border-[#F5EBEF]">
            <div>
              <span className="text-[10px] font-bold text-[#A36371] uppercase tracking-wider">{activeReport.reportType}</span>
              <h3 className="font-bold text-base text-[#4A3E42]">{activeReport.reportName}</h3>
              <span className="text-xs text-[#7D6E74]">Date: {activeReport.reportDate}</span>
            </div>
            <button
              onClick={() => setActiveReport(null)}
              className="text-xs text-[#7D6E74] hover:text-[#4A3E42]"
            >
              Close
            </button>
          </div>

          {/* AI Summary */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#7D6E74] uppercase tracking-wider">Plain-Language Summary</h4>
            <p className="text-xs sm:text-sm text-[#4A3E42] leading-relaxed bg-[#FFF9FA] p-3 rounded-xl border border-[#F5EBEF]">
              {activeReport.aiSummary}
            </p>
          </div>

          {/* Context explanation */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#7D6E74] uppercase tracking-wider">What this test evaluates</h4>
            <p className="text-xs text-[#4A3E42] leading-relaxed">
              {activeReport.plainLanguageExplanation}
            </p>
          </div>

          {/* Key Values Table */}
          {activeReport.keyValues && activeReport.keyValues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#7D6E74] uppercase tracking-wider">Key Measurements & Findings</h4>
              <div className="space-y-1.5">
                {activeReport.keyValues.map((kv, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#FFF9FA] border border-[#F5EBEF] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-[#4A3E42]">{kv.metric}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#EDF5EF] text-[#6E9C7B] font-semibold text-[11px] self-start sm:self-auto">
                      {kv.value}
                    </span>
                    <span className="text-[#7D6E74] text-[11px] sm:max-w-xs">{kv.interpretation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions for Doctor */}
          {activeReport.questionsForDoctor && activeReport.questionsForDoctor.length > 0 && (
            <div className="space-y-2 bg-[#FAF3E8] p-3.5 rounded-xl border border-[#CF9B48]/30">
              <h4 className="text-xs font-bold text-[#CF9B48] uppercase tracking-wider">
                Questions to Discuss With Your Doctor / Midwife
              </h4>
              <div className="space-y-1.5">
                {activeReport.questionsForDoctor.map((q, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#4A3E42]">
                    <HelpCircle className="w-3.5 h-3.5 text-[#CF9B48] shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onOpenAiChat(`I'd like to ask more questions about my ${activeReport.reportName}.`)}
            className="w-full py-2.5 rounded-xl bg-[#FFF0F5] text-[#A36371] border border-[#FADADD] text-xs font-semibold hover:bg-[#FADADD]/60 transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discuss this report with MomCare AI</span>
          </button>
        </div>
      )}

      {/* Saved Reports List */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#F5EBEF] shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-[#4A3E42]">My Saved Reports ({reports.length})</h3>

        {reports.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#7D6E74] space-y-1">
            <p>No reports uploaded yet.</p>
            <p className="text-[11px]">Upload an ultrasound scan or lab test above to receive a plain-language summary.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-[#FFF9FA] border border-[#F5EBEF] flex items-center justify-between hover:border-[#E8C5C8] transition-colors cursor-pointer"
                onClick={() => setActiveReport(r)}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#4A3E42]">{r.reportName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#FFF0F5] text-[#A36371] font-semibold border border-[#FADADD]">
                      {r.reportType}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7D6E74] line-clamp-1">{r.aiSummary}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReport(r);
                    }}
                    className="p-1.5 rounded-lg text-[#7D6E74] hover:text-[#A36371]"
                    title="View report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(r.id);
                    }}
                    className="p-1.5 rounded-lg text-[#7D6E74] hover:text-[#C75D5D]"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
