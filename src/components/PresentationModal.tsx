import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Volume2,
  Download,
  Sparkles,
  ShieldAlert,
  Brain,
  Activity,
  Heart,
  Users,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Database,
  Smartphone,
  Info,
  Clock,
} from 'lucide-react';

export interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  bulletPoints: string[];
  visualType: 'hero' | 'problem' | 'audience' | 'solution' | 'flow' | 'features' | 'safety' | 'genai' | 'ml' | 'reports' | 'community' | 'privacy' | 'tech' | 'limits' | 'roadmap';
  speakerNotes: string;
  keyTakeaway: string;
}

export const PRESENTATION_SLIDES: SlideData[] = [
  {
    id: 1,
    title: 'MomCare',
    subtitle: 'A Context-Aware Maternal Healthcare Companion for Mothers & Babies',
    category: 'Introduction',
    bulletPoints: [
      'Every pregnancy journey is biologically and emotionally unique.',
      'Personalized guidance tailored to gestational week, daily check-ins, and medical history.',
      'Safety-first architecture: clinical warning-sign triage precedes all AI responses.',
      'Transparent, explainable technology designed for mothers, partners, and care teams.',
    ],
    visualType: 'hero',
    speakerNotes:
      "Good morning everyone. My name is [your name], and today I am presenting MomCare, a maternal healthcare companion for mothers and babies.\n\nMomCare is built around one idea: every pregnancy is different, so the guidance a mother receives should be different too. Instead of giving the same article to every woman, MomCare looks at her own pregnancy week, her daily check-ins and her history, checks for warning signs, and only then gives personalised information.\n\nI will walk you through the problem, our solution, how generative AI and machine learning are used, the safety design, and honestly, what is working today and what comes next.",
    keyTakeaway: 'Personalized maternal guidance centered on context, clinical safety, and trust.',
  },
  {
    id: 2,
    title: 'The Problem',
    subtitle: 'Existing pregnancy apps act as passive, generic information libraries.',
    category: 'Market Need',
    bulletPoints: [
      'Generic Information: One-size-fits-all articles regardless of gestational week or clinical history.',
      'Missed Patterns: Disconnected moments—recurring back pain or declining sleep go unnoticed.',
      'Delayed Action: Lack of warning-sign triage leads to critical symptoms being overlooked or caught late.',
      'Jargon & Anxiety: Medical reports are difficult to decode, and internet forums breed fear.',
    ],
    visualType: 'problem',
    speakerNotes:
      'Most pregnancy apps today are information libraries. A mother searches, reads a general article, and has to decide by herself whether her symptom is normal.\n\nThis creates three problems:\n• Generic information: the same advice for every mother, whatever her week or history.\n• Missed patterns: a mother may mention back discomfort or poor sleep several times, but nothing connects those moments.\n• Delayed action: because nothing checks for warning signs, a symptom that needs a professional can be ignored or noticed late.\nMany mothers also find medical reports hard to understand, and online advice can be unreliable or frightening.',
    keyTakeaway: 'Mothers need active pattern recognition and safety triage, not static search encyclopedias.',
  },
  {
    id: 3,
    title: 'Who Is MomCare For?',
    subtitle: 'Empowering mothers, supporting families, and connecting with care providers.',
    category: 'Target Audience',
    bulletPoints: [
      'Primary: Expectant mothers who want to understand their pregnancy and track daily wellbeing.',
      'Secondary: Partners and family members who want to offer informed, empathetic care.',
      'Future: Healthcare providers who can review an exportable, mother-authorized symptom summary.',
      'Inclusive Design: Large typography, calm warm ivory & dusty rose tones, and multilingual roadmap (English, Tamil, Telugu, Kannada, Hindi).',
      'Clinical Boundary: Does NOT replace a doctor or nurse; prompts mothers to reach care sooner.',
    ],
    visualType: 'audience',
    speakerNotes:
      'Our primary users are expectant mothers who want to understand their pregnancy and track how they feel every day.\n\nOur secondary users are partners and family members who want to support her, and, in future, healthcare providers who could view a summary that the mother chooses to share.\n\nWe design for a non-technical user: large readable text, simple navigation, calm colours, and support for multiple languages, with English first and then Tamil, Telugu, Kannada and Hindi.\n\nMomCare does not replace a doctor, a nurse or emergency care. It helps mothers notice changes and reach the right professional sooner.',
    keyTakeaway: 'Accessible, supportive digital health companion designed for real mothers and their loved ones.',
  },
  {
    id: 4,
    title: 'Our Solution',
    subtitle: 'A holistic maternal companion powered by four interconnected pillars.',
    category: 'Product Solution',
    bulletPoints: [
      '1. Mother Profile & Daily Check-in: Mood, energy, sleep hours, baby movements, discomfort areas, and vitals.',
      '2. Safety Triage Protocol Engine: Automatic evaluation of warning signs before any output is generated.',
      '3. Contextual AI Assistant: Maintains conversation history, gestational week, and patient history.',
      '4. Continuous Pattern Analysis: Detects clustering trends (e.g. 3+ occurrences of lower back pain in 7 days).',
    ],
    visualType: 'solution',
    speakerNotes:
      'MomCare is a personal pregnancy companion with four connected parts.\n• A mother profile and daily check-in that record how she feels: mood, energy, sleep, baby movement, discomfort and symptoms.\n• A safety check that looks for warning signs before anything else happens.\n• An AI assistant that understands her context and the earlier conversation.\n• Pattern analysis that turns her own check-ins into personalised observations and reminders.\n\nTogether they give the mother a clear daily routine, a record of her pregnancy journey, and a prompt to speak to her healthcare provider when something needs attention.',
    keyTakeaway: 'A closed-loop system connecting daily tracking, AI context, pattern alerts, and safety checks.',
  },
  {
    id: 5,
    title: 'What Makes MomCare Different',
    subtitle: 'Architecture matters: Context & Safety always precede Generation.',
    category: 'Differentiator',
    bulletPoints: [
      'The Pipeline: Mother Data → AI Context Retrieval → Pattern Analysis → Safety Check → Personalized Info.',
      'Conversational Memory: Understands pronoun references ("it is getting worse" refers to earlier stomach pain).',
      'Safety Gate: When a worsening symptom is identified, safety checks run before the AI answers.',
      'Explainable & Transparent: Cites exact triggers and references for every recommendation.',
    ],
    visualType: 'flow',
    speakerNotes:
      "MomCare is not simply a pregnancy information app with a chatbot added on. The difference is the order in which things happen.\n\nThe flow is: the mother's data, then AI understands the context, then pattern analysis, then a safety check, and finally personalised information.\n\nFor example, if a mother says 'I have stomach pain' and later writes 'it is getting worse', MomCare understands that 'it' means the stomach pain, instead of treating it as a new question. The safety check runs on that worsening symptom before the AI answers.\n\nThe result is guidance that is personal, explainable, and safety-first.",
    keyTakeaway: 'Safety-gated sequencing guarantees that clinical red flags can never be silenced by casual chat.',
  },
  {
    id: 6,
    title: 'Core Features',
    subtitle: 'Daily essentials that bring clarity, reassurance, and joyful connection.',
    category: 'Features',
    bulletPoints: [
      'Mother Profile: Due date, gestational week calculation, medical baseline, medications, and care team.',
      'Week-by-Week Womb Visualizer: 3D photorealistic educational renders and milestones (BABY, MOM, CARE tabs).',
      'Daily Check-in & History: Tracks longitudinal trends across trimesters.',
      'Honest Care Progress: Shows completed daily tasks (e.g. 4/5 tasks) without arbitrary fake health scores.',
      'My Pregnancy Story: Unified timeline preserving milestones, check-ins, and appointments.',
    ],
    visualType: 'features',
    speakerNotes:
      "Here are the core features a mother uses every day.\n• Mother profile: name, age, pregnancy week, expected delivery date, medical history, medications and appointments.\n• Baby development, week by week, with BABY, MOM and CARE sections and an illustration of the baby for the current week.\n• Daily check-in, which stores history so we can see changes over time.\n• Today's Care Progress, such as 4 out of 5 tasks done. We deliberately avoid a fake health score.\n• Appointments and reminders, and My Pregnancy Story, a timeline she can look back on.\n\nThe baby images are AI-generated educational illustrations and are labelled that way. They are not medical scans.",
    keyTakeaway: 'Practical, evidence-based daily features that respect the mother’s time and peace of mind.',
  },
  {
    id: 7,
    title: 'Safety First - Three Risk Levels',
    subtitle: 'Strict clinical triage protocol engineered into every user interaction.',
    category: 'Clinical Safety',
    bulletPoints: [
      '🟢 ROUTINE: Expected physiological changes for the gestational week. Gentle self-care and monitoring.',
      '🟡 NEEDS ATTENTION: Recurring or moderate discomfort. Advised to review with provider at next visit.',
      '🔴 URGENT: Red flag symptoms (e.g. heavy bleeding, severe epigastric pain). Displays one-touch emergency call.',
      'Deterministic Fallback: For urgent cases, generative AI is bypassed completely in favor of hardcoded emergency protocols.',
    ],
    visualType: 'safety',
    speakerNotes:
      'Because this is a health application, safety comes before AI. Every check-in and every chat message passes through a safety check first.\n\nThere are three levels:\n• Routine: general information and monitoring.\n• Needs attention: consider contacting a healthcare professional.\n• Urgent: seek urgent medical attention, with a clear emergency call button.\n\nEach result explains why it appeared, listing the exact inputs that triggered it, and it states that this is not a diagnosis. In urgent cases, the generative AI is not relied on at all: a fixed safety message is shown instead.\n\nThe warning-sign rules in this prototype are illustrative. They must be reviewed by a qualified clinician before real use.',
    keyTakeaway: 'Zero tolerance for hallucination on acute symptoms—deterministic safety gates protect maternal health.',
  },
  {
    id: 8,
    title: 'How Generative AI Is Used',
    subtitle: 'Grounded Gemini intelligence across Assistant, Reports, and Notices.',
    category: 'AI Architecture',
    bulletPoints: [
      'Three Application Areas: Contextual chat assistant, medical report plain-language explanations, personalized notices.',
      'RAG Context Ingestion: Ingests patient week, check-ins, conversation history, and curated reference guidelines (WHO / MoHFW India).',
      'Strict Negative Constraints: Forbids diagnosing conditions or prescribing/altering medications.',
      'Source Citations & Uncertainty: Explicitly displays source attribution, explanation rationale, and confidence.',
    ],
    visualType: 'genai',
    speakerNotes:
      "We use a generative AI model, Google Gemini, in three places: the assistant, report explanation, and personalised notices.\n\nThe assistant receives the mother's pregnancy week, her recent check-ins, the conversation so far, the safety result and a small knowledge base of reference material from WHO and India's Ministry of Health and Family Welfare.\n\nWe instruct the model to use only that knowledge base for medical facts, to say clearly when it does not have verified information, and never to diagnose or change medication. Each answer shows its sources, why the answer was given, and how confident the system is.\n\nThe knowledge base content is currently marked as draft and still needs verification against the official sources.",
    keyTakeaway: 'Generative AI bounded by strict knowledge bases and transparency indicators.',
  },
  {
    id: 9,
    title: 'Machine Learning & Pattern Analysis',
    subtitle: 'Surfacing longitudinal correlations hidden across everyday check-ins.',
    category: 'Machine Learning',
    bulletPoints: [
      'Symptom Clustering: Detects when a symptom appears 3+ times in a 7-day rolling window (e.g. lumbar fatigue).',
      'Multivariate Trend Tracking: Identifies declining sleep quality coupled with declining daily energy.',
      'Adherence Check: Proactively identifies missed check-ins with supportive maternal nudges.',
      'Transparent Risk Screening: Exploratory screening model examining age, blood pressure, blood glucose, and temperature with feature attribution.',
    ],
    visualType: 'ml',
    speakerNotes:
      "MomCare uses data analysis on the mother's own check-ins to find patterns a person might miss.\n• Repeated symptoms: for example, back discomfort mentioned on four of the last seven days.\n• Trends: sleep slowly decreasing, or energy dropping over several days.\n• Missed check-ins, which trigger a gentle reminder.\n\nWe also include a small, transparent risk-screening model that uses values such as age, blood pressure, blood sugar and temperature, and shows which factors contributed to the result.\n\nIn this prototype, that model is a screening demonstration. It is not clinically validated and does not diagnose. The planned next step is to train and test it on a public maternal-health dataset and to have clinicians review it.",
    keyTakeaway: 'Translating daily micro-entries into actionable clinical conversation topics for doctor visits.',
  },
  {
    id: 10,
    title: 'Personalisation & Report Understanding',
    subtitle: 'Explaining scans and lab tests without medical intimidation.',
    category: 'Personalisation',
    bulletPoints: [
      'Trigger-Based Notices: "You mentioned lower back fatigue 3 times this week. Consider discussing pelvic support at your 24w visit."',
      'Explainable AI ("Why am I seeing this?"): Shows exact check-in data and clinical threshold that triggered the note.',
      'Medical Report Decoder: Mother uploads ultrasound or lab work (e.g. AFI, EFW, Glucose Screen).',
      'Actionable Outcomes: Translates medical acronyms into plain reassuring language with tailored questions for her doctor.',
    ],
    visualType: 'reports',
    speakerNotes:
      "Personalisation means the notices a mother sees come from her own activity, not from random schedules. Examples: 'You have not completed today's check-in' or 'You mentioned this symptom before. If it is continuing or worsening, consider contacting your healthcare provider.'\n\nEvery notice has a 'Why am I seeing this?' explanation, so the mother can see exactly which data triggered it.\n\nMedical report understanding lets a mother upload a report. MomCare explains difficult terms in simple language, summarises the key information, and links it to her pregnancy stage.\n\nIt does not diagnose conditions, and it does not change medication. Anything unusual is marked 'discuss with your doctor'.",
    keyTakeaway: 'Empowering mothers with comprehension and prepared questions for their obstetrician.',
  },
  {
    id: 11,
    title: 'Learning & MomCare Circle',
    subtitle: 'Bite-sized maternal education and safe, moderated community sharing.',
    category: 'Community & Education',
    bulletPoints: [
      'Interactive Learning: Warning sign identification, true/false myth busters, and mini quizzes instead of dry text.',
      'MomCare Circle: Expectant mothers connect over shared stages (e.g. Week 24 kicks or sleep pillow setups).',
      'Identity Control: Choose display format: Real first name, "Mom", or complete anonymity.',
      'AI Safety Guardian: Real-time moderation filtering misinformation, commercial spam, harassment, and unsafe home remedies.',
    ],
    visualType: 'community',
    speakerNotes:
      "Learning is interactive: mini quizzes, true or false questions, warning-sign identification and flip cards, instead of long articles.\n\nMomCare Circle is a community where mothers can post, like, comment, reply, save and report content. Mothers choose how they appear: first name, 'Mom', or anonymous.\n\nBased on pregnancy week and topic, the app can show similar experiences, for example, other mothers discussing back discomfort at week 24. These are always labelled as shared experiences, not medical advice.\n\nAI helps keep the community safe by checking for spam, harassment, unsafe content and misleading medical claims, and reported posts go to a review queue. In the current prototype, the community runs on a single device as a preview.",
    keyTakeaway: 'Safe, uplifting peer solidarity paired with interactive bite-sized learning.',
  },
  {
    id: 12,
    title: 'Privacy and Security',
    subtitle: 'Health data privacy designed into the foundation, not bolted on.',
    category: 'Security & Compliance',
    bulletPoints: [
      'Data Invariant: Maternal health records are strictly private—isolated in user-scoped security perimeters.',
      'Zero Data Sale: Patient metrics and conversations are never monetized or sold to third-party ad networks.',
      'Prototype Stance: Uses fictional demo data; does not collect real patient health data at this early prototype stage.',
      'Compliance Roadmap: Architecting toward Indian Digital Personal Data Protection (DPDP) Act and DISHA health guidelines.',
    ],
    visualType: 'privacy',
    speakerNotes:
      "Health information is among the most sensitive data a person has, so privacy is a design principle, not an afterthought.\n\nThe planned production design includes individual user accounts, private medical records that other users can never see, a secure database, and medical reports stored separately from other data.\n\nIn the current prototype, data stays on the user's device and we use only fictional sample data. We do not ask for real health information at this stage.\n\nBefore any real mothers use MomCare, we would need a privacy setup suitable for health data, compliance with the applicable health-data rules in India, and a clinician review of all medical content.",
    keyTakeaway: 'Uncompromising privacy standards honoring the sanctity of maternal health information.',
  },
  {
    id: 13,
    title: 'Technology and Data Flow',
    subtitle: 'Modern serverless architecture engineered with Google AI Studio & Gemini.',
    category: 'Architecture',
    bulletPoints: [
      'Step 1: Mother inputs profile and daily check-in.',
      'Step 2: Deterministic safety rules check runs first on all inputs.',
      'Step 3: Pattern recognition and screening models evaluate rolling history.',
      'Step 4: Relevant verified medical reference knowledge is retrieved.',
      'Step 5: Server-side Gemini API generates plain-language, contextual synthesis.',
      'Step 6: User receives structured guidance with source attribution and clinical escalation paths.',
    ],
    visualType: 'tech',
    speakerNotes:
      'The prototype is built with Google AI Studio and the Gemini API, using free tools. The planned production version adds Supabase for user accounts, a secure database and private file storage, with the AI key kept on a server and never exposed in the app.\n\nThe data flow works in six steps:\n• 1. The mother enters her profile and daily check-in.\n• 2. The safety check runs first on her inputs.\n• 3. Pattern analysis and the screening model process her history.\n• 4. The relevant knowledge-base entries are retrieved.\n• 5. The AI model writes a personalised, plain-language response using only that information.\n• 6. The app shows the answer with sources, reasons and an uncertainty note, and escalates to professional care when needed.',
    keyTakeaway: 'Robust six-step server-side pipeline preventing key leakage and enforcing verified responses.',
  },
  {
    id: 14,
    title: 'Current Limitations & Responsible Use',
    subtitle: 'Transparent, ethical product development with honest clinical boundaries.',
    category: 'Responsible AI',
    bulletPoints: [
      'Not a Medical Device: Prototype companion for awareness, not a diagnostic or prescriptive device.',
      'Draft Content: Warning-sign rules, clinical advice, and quiz questions require formal OB/GYN review.',
      'Screening Demo: ML screening demonstration is not clinically validated against production populations.',
      'AI Fallibility: Mitigated by negative constraints, uncertainty tags, and deterministic urgent overrides.',
    ],
    visualType: 'limits',
    speakerNotes:
      'I want to be transparent about where we are today.\n• This is a prototype. It is not a medical device and not a replacement for professional care.\n• All medical content, warning-sign rules and quiz material are drafts and require clinician review.\n• The risk-screening model is a demonstration and has not been clinically validated.\n• AI can make mistakes, which is why we use a knowledge base, show sources and uncertainty, and put safety rules before the AI.\n• The free AI tier has usage limits and may use submitted data, so only fictional data is used.\n• Community and some features currently work only on one device.\n\nBeing honest about these limits is part of building a trustworthy health product.',
    keyTakeaway: 'Radical transparency about limitations is essential for clinical credibility.',
  },
  {
    id: 15,
    title: 'Future Improvements & Closing',
    subtitle: 'The five-step roadmap to clinical deployment and community impact.',
    category: 'Roadmap & Conclusion',
    bulletPoints: [
      '1. Clinician Co-Design: Rigorous formal review of safety algorithms, knowledge bases, and milestones.',
      '2. Validated ML Models: Train and validate risk algorithms on diverse public maternal-health datasets.',
      '3. Enterprise Cloud & Auth: Multi-region encrypted databases, OAuth, and private file storage.',
      '4. Regional Languages: Comprehensive localized support for Tamil, Telugu, Kannada, and Hindi.',
      '5. Family & Partner Sync: Partner portal, push medication reminders, and instant emergency dispatch shortcuts.',
    ],
    visualType: 'roadmap',
    speakerNotes:
      'Our roadmap has five steps:\n• Clinician review of the safety rules, knowledge base and baby-development content.\n• Training and validating the risk model on real datasets, with clear performance reporting.\n• Secure accounts, a real database and private report storage.\n• Full support for Tamil, Telugu, Kannada and Hindi, checked by native speakers.\n• A real shared community, push reminders, a partner view and emergency contact shortcuts.\n\nIn summary, MomCare brings together personal context, pattern analysis, a safety check and generative AI, to help mothers notice what matters and reach professional care sooner.\n\nThank you. I would be happy to take your questions and to show a short live demonstration.',
    keyTakeaway: 'MomCare helps mothers notice what matters and reach professional care sooner.',
  },
];

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLiveDemo?: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  onOpenLiveDemo,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slide = PRESENTATION_SLIDES[currentSlideIndex];
  const totalSlides = PRESENTATION_SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowSpeakerNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#2B1F24]/85 backdrop-blur-md p-2 sm:p-4 transition-all ${
        isFullscreen ? 'p-0' : ''
      }`}
    >
      <div
        className={`bg-[#FCF8F6] text-[#352F35] flex flex-col overflow-hidden transition-all shadow-2xl border border-[#E9DFDC] ${
          isFullscreen
            ? 'w-screen h-screen rounded-none'
            : 'w-full max-w-5xl h-[92vh] max-h-[820px] rounded-3xl'
        }`}
      >
        {/* Top Control Header */}
        <header className="px-5 py-3 bg-[#FFFFFF] border-b border-[#E9DFDC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F2E1E3] text-[#9F5F6E] flex items-center justify-center font-black text-xs">
              MC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-[#352F35]">MomCare Presentation Deck</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFEBF4] text-[#7E699B]">
                  Slide {currentSlideIndex + 1} of {totalSlides}
                </span>
              </div>
              <p className="text-[11px] text-[#766D72]">{slide.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PPTX File */}
            <a
              href="/MomCare_Presentation.pptx"
              download="MomCare_Presentation.pptx"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2E7D32] hover:bg-[#1B5E20] text-white transition-all shadow-2xs"
              title="Download presentation as separate PowerPoint (.pptx) file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download .PPTX</span>
            </a>

            {/* Toggle Speaker Notes */}
            <button
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showSpeakerNotes
                  ? 'bg-[#9F5F6E] text-white border-[#9F5F6E]'
                  : 'bg-white text-[#766D72] border-[#E9DFDC] hover:bg-[#F2E1E3]'
              }`}
              title="Toggle speaker notes (Hotkey: N)"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Speaker Notes</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white border border-[#E9DFDC] text-[#766D72] hover:bg-[#F2E1E3] transition-colors"
              title="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-[#E9DFDC] text-[#766D72] hover:bg-[#C98291] hover:text-white transition-colors"
              title="Close presentation (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Presentation Body (Slide Content + Notes Tray) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Slide Stage */}
          <main className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-gradient-to-br from-[#FFFFFF] via-[#FCF8F6] to-[#FFF9FA]">
            <div className="space-y-6">
              {/* Category pill and slide tracker */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#F2E1E3] text-[#9F5F6E]">
                  {slide.category}
                </span>
                <span className="text-xs text-[#766D72] font-medium">
                  Use ← → keys or buttons to navigate
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#352F35] tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base font-medium text-[#9F5F6E] mt-1">
                  {slide.subtitle}
                </p>
              </div>

              {/* Slide Content Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {slide.bulletPoints.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E9DFDC] shadow-2xs flex items-start gap-3 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#EFEBF4] text-[#7E699B] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-[#352F35] leading-relaxed font-normal">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>

              {/* Key Takeaway Callout */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#F2E1E3] via-[#FFF9FA] to-[#EFEBF4] border border-[#E9DFDC] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white text-[#9F5F6E] flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#C98291]" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#9F5F6E] uppercase text-[10px] block">
                    Core Message
                  </span>
                  <span className="text-[#352F35] font-semibold">{slide.keyTakeaway}</span>
                </div>
              </div>
            </div>

            {/* Slide Stage Footer: Progress Bar */}
            <div className="pt-6">
              <div className="w-full h-1.5 bg-[#E9DFDC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C98291] to-[#9F5F6E] transition-all duration-300"
                  style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
                />
              </div>
            </div>
          </main>

          {/* Right/Bottom Speaker Notes Drawer */}
          {showSpeakerNotes && (
            <aside className="w-full md:w-80 lg:w-96 bg-[#FFFFFF] border-t md:border-t-0 md:border-l border-[#E9DFDC] p-5 flex flex-col justify-between overflow-y-auto shrink-0 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#9F5F6E]">
                  <Volume2 className="w-4 h-4" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">
                    Speaker Notes for Slide {slide.id}
                  </h4>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FCF8F6] border border-[#E9DFDC] text-xs sm:text-[13px] text-[#352F35] leading-relaxed whitespace-pre-line font-serif italic max-h-[360px] overflow-y-auto">
                  {slide.speakerNotes}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E9DFDC] mt-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#766D72]">
                  <span>Speaking Time Estimate:</span>
                  <span className="font-bold text-[#352F35]">~25 - 40s</span>
                </div>
                {onOpenLiveDemo && slide.id === 15 && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLiveDemo();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#9F5F6E] hover:bg-[#8F525F] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Launch Live App Demo</span>
                  </button>
                )}
              </div>
            </aside>
          )}
        </div>

        {/* Bottom Slide Navigation Bar */}
        <footer className="px-5 py-3 bg-[#FFFFFF] border-t border-[#E9DFDC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#E9DFDC] text-xs font-semibold text-[#352F35] hover:bg-[#F2E1E3] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={nextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#9F5F6E] text-white text-xs font-semibold hover:bg-[#8F525F] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Jump Slide Selector */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-md no-scrollbar">
            {PRESENTATION_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  currentSlideIndex === idx
                    ? 'bg-[#9F5F6E] text-white shadow-2xs'
                    : 'bg-[#FCF8F6] text-[#766D72] hover:bg-[#F2E1E3]'
                }`}
                title={`Jump to Slide ${s.id}: ${s.title}`}
              >
                {s.id}
              </button>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};
