import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

async function generatePresentation() {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'MomCare Team';
  pptx.company = 'MomCare Maternal Healthcare';
  pptx.title = 'MomCare - Maternal Healthcare Companion';
  pptx.subject = 'Maternal Healthcare Companion for Mothers and Babies';

  // MomCare Brand Palette
  const COLORS = {
    bgLight: 'FCF8F6',
    white: 'FFFFFF',
    textDark: '352F35',
    textMuted: '766D72',
    primaryRose: '9F5F6E',
    accentRose: 'C98291',
    softPink: 'F2E1E3',
    cardBorder: 'E9DFDC',
    softPurple: 'EFEBF4',
    textPurple: '7E699B',
    greenBadge: '2E7D32',
    yellowBadge: 'B78103',
    redBadge: 'C62828',
  };

  const slidesData = [
    {
      id: 1,
      title: 'MomCare',
      subtitle: 'A Maternal Healthcare Companion for Mothers & Babies',
      category: 'INTRODUCTION',
      bullets: [
        { title: 'Personalized by Design', desc: 'Every pregnancy is different; guidance adapts to her gestational week, daily check-ins, and medical history.' },
        { title: 'Safety-First Architecture', desc: 'Checks for clinical warning signs before providing any automated or AI guidance.' },
        { title: 'Beyond Static Libraries', desc: 'Active, compassionate daily routine replacing fragmented search queries and confusing forums.' },
        { title: 'Honest & Transparent', desc: 'Clear distinction between verified clinical facts, educational aids, and when to reach a doctor.' },
      ],
      keyTakeaway: 'Every pregnancy is unique—the guidance a mother receives must be personal, contextual, and safety-gated.',
      notes: "Good morning everyone. My name is [your name], and today I am presenting MomCare, a maternal healthcare companion for mothers and babies.\n\nMomCare is built around one idea: every pregnancy is different, so the guidance a mother receives should be different too. Instead of giving the same article to every woman, MomCare looks at her own pregnancy week, her daily check-ins and her history, checks for warning signs, and only then gives personalised information.\n\nI will walk you through the problem, our solution, how generative AI and machine learning are used, the safety design, and honestly, what is working today and what comes next."
    },
    {
      id: 2,
      title: 'The Problem',
      subtitle: 'Today\'s pregnancy apps act as passive, disconnected information libraries',
      category: 'MARKET NEED',
      bullets: [
        { title: 'Generic Information', desc: 'The exact same one-size-fits-all advice is served to every mother, regardless of her pregnancy week or history.' },
        { title: 'Missed Patterns', desc: 'A mother may log back discomfort or poor sleep several times, but nothing connects those moments together.' },
        { title: 'Delayed Clinical Action', desc: 'Without automated warning-sign checks, symptoms needing a healthcare professional can be ignored or noticed too late.' },
        { title: 'Jargon & Anxiety', desc: 'Complex medical lab reports are hard to decode, and generic online searches often provoke unnecessary panic.' },
      ],
      keyTakeaway: 'Expectant mothers need active pattern recognition and safety triage, not static search encyclopedias.',
      notes: "Most pregnancy apps today are information libraries. A mother searches, reads a general article, and has to decide by herself whether her symptom is normal.\n\nThis creates three problems.\n• Generic information: the same advice for every mother, whatever her week or history.\n• Missed patterns: a mother may mention back discomfort or poor sleep several times, but nothing connects those moments.\n• Delayed action: because nothing checks for warning signs, a symptom that needs a professional can be ignored or noticed late.\nMany mothers also find medical reports hard to understand, and online advice can be unreliable or frightening."
    },
    {
      id: 3,
      title: 'Who Is MomCare For?',
      subtitle: 'Inclusive maternal support tailored for mothers, families, and care providers',
      category: 'TARGET AUDIENCE',
      bullets: [
        { title: 'Primary Users', desc: 'Expectant mothers who want to understand their pregnancy journey and track how they feel every single day.' },
        { title: 'Secondary Users', desc: 'Partners and family members seeking to provide empathetic, informed support throughout all trimesters.' },
        { title: 'Healthcare Providers', desc: 'Future capability: clinicians can review a concise longitudinal summary that the mother chooses to share.' },
        { title: 'Inclusive & Accessible', desc: 'Non-technical design: large readable typography, calm palette, and planned multi-language support (English, Tamil, Telugu, Kannada, Hindi).' },
      ],
      keyTakeaway: 'MomCare does not replace a doctor, nurse, or emergency room; it helps mothers notice changes and reach the right professional sooner.',
      notes: "Our primary users are expectant mothers who want to understand their pregnancy and track how they feel every day.\n\nOur secondary users are partners and family members who want to support her, and, in future, healthcare providers who could view a summary that the mother chooses to share.\n\nWe design for a non-technical user: large readable text, simple navigation, calm colours, and support for multiple languages, with English first and then Tamil, Telugu, Kannada and Hindi.\n\nMomCare does not replace a doctor, a nurse or emergency care. It helps mothers notice changes and reach the right professional sooner."
    },
    {
      id: 4,
      title: 'Our Solution',
      subtitle: 'A personal pregnancy companion with four tightly connected pillars',
      category: 'PRODUCT SOLUTION',
      bullets: [
        { title: 'Mother Profile & Daily Check-in', desc: 'Captures daily mood, energy, sleep hours, baby movements, bodily discomfort locations, and symptoms.' },
        { title: 'Safety Triage Engine', desc: 'Automated clinical safety check evaluates red-flag warning signs before anything else occurs.' },
        { title: 'Contextual AI Assistant', desc: 'Maintains awareness of gestational week, recent check-ins, medical baseline, and conversation context.' },
        { title: 'Intelligent Pattern Analysis', desc: 'Converts daily entries into personalized observations and timely doctor discussion prompts.' },
      ],
      keyTakeaway: 'Together, they give the mother a clear daily routine, a pregnancy record, and a prompt when clinical attention is needed.',
      notes: "MomCare is a personal pregnancy companion with four connected parts.\n• A mother profile and daily check-in that record how she feels: mood, energy, sleep, baby movement, discomfort and symptoms.\n• A safety check that looks for warning signs before anything else happens.\n• An AI assistant that understands her context and the earlier conversation.\n• Pattern analysis that turns her own check-ins into personalised observations and reminders.\n\nTogether they give the mother a clear daily routine, a record of her pregnancy journey, and a prompt to speak to her healthcare provider when something needs attention."
    },
    {
      id: 5,
      title: 'What Makes MomCare Different',
      subtitle: 'The fundamental difference lies in the sequence of operations: Safety First',
      category: 'DIFFERENTIATOR',
      bullets: [
        { title: 'Safety-First Pipeline Flow', desc: "Mother's Data → AI Context Understanding → Pattern Analysis → Safety Check → Personalized Information." },
        { title: 'Conversational Memory', desc: 'Resolves pronouns across messages: "I have stomach pain" followed by "it is getting worse" recognizes "it" refers to the stomach pain.' },
        { title: 'Pre-Emptive Safety Interception', desc: 'Safety rules intercept worsening symptoms before the AI responds, preventing casual dismissal of clinical red flags.' },
        { title: 'Explainable Guidance', desc: 'Every output provides transparent reasons, verifiable sources, and zero ungrounded health assertions.' },
      ],
      keyTakeaway: 'MomCare is not an info library with a chatbot added on; its safety-gated sequence protects maternal health.',
      notes: "MomCare is not simply a pregnancy information app with a chatbot added on. The difference is the order in which things happen.\n\nThe flow is: the mother's data, then AI understands the context, then pattern analysis, then a safety check, and finally personalised information.\n\nFor example, if a mother says 'I have stomach pain' and later writes 'it is getting worse', MomCare understands that 'it' means the stomach pain, instead of treating it as a new question. The safety check runs on that worsening symptom before the AI answers.\n\nThe result is guidance that is personal, explainable, and safety-first."
    },
    {
      id: 6,
      title: 'Core Features',
      subtitle: 'Evidence-based tools designed for daily maternal clarity and comfort',
      category: 'CORE FEATURES',
      bullets: [
        { title: 'Comprehensive Mother Profile', desc: 'Tracks gestational week, expected delivery date, medical history, active medications, and clinic contacts.' },
        { title: 'Weekly Womb Development', desc: 'Visualizes gestational progress with dedicated BABY, MOM, and CARE tabs plus educational illustrations.' },
        { title: 'Daily Check-in & History', desc: 'Stores longitudinal logs to visualize wellness, sleep, and symptom trends across trimesters.' },
        { title: 'Honest Care Progress', desc: 'Shows clear completion (e.g. 4/5 tasks done) while deliberately rejecting arbitrary, fake health scores.' },
      ],
      keyTakeaway: 'My Pregnancy Story timeline preserves memories and clinical logs; baby images are clearly labeled educational aids.',
      notes: "Here are the core features a mother uses every day.\n• Mother profile: name, age, pregnancy week, expected delivery date, medical history, medications and appointments.\n• Baby development, week by week, with BABY, MOM and CARE sections and an illustration of the baby for the current week.\n• Daily check-in, which stores history so we can see changes over time.\n• Today's Care Progress, such as 4 out of 5 tasks done. We deliberately avoid a fake health score.\n• Appointments and reminders, and My Pregnancy Story, a timeline she can look back on.\n\nThe baby images are AI-generated educational illustrations and are labelled that way. They are not medical scans."
    },
    {
      id: 7,
      title: 'Safety First - Three Risk Levels',
      subtitle: 'Deterministic clinical triage protocol evaluating every check-in and question',
      category: 'CLINICAL SAFETY',
      bullets: [
        { title: '🟢 Routine (Green)', desc: 'General information, expected bodily adaptations, and monitoring of standard prenatal sensations.' },
        { title: '🟡 Needs Attention (Yellow)', desc: 'Recurring discomfort or notable shifts; recommends discussing with her healthcare provider at the next visit.' },
        { title: '🔴 Urgent (Red)', desc: 'Red-flag signs (e.g. heavy bleeding, visual disturbance); triggers one-touch emergency call actions.' },
        { title: 'Deterministic Override', desc: 'In urgent situations, generative AI is completely bypassed in favor of hardcoded, verified safety instructions.' },
      ],
      keyTakeaway: 'Lists exact triggering inputs and explicitly states it is not a diagnosis. Rules require clinician review before real use.',
      notes: "Because this is a health application, safety comes before AI. Every check-in and every chat message passes through a safety check first.\n\nThere are three levels.\n• Routine: general information and monitoring.\n• Needs attention: consider contacting a healthcare professional.\n• Urgent: seek urgent medical attention, with a clear emergency call button.\n\nEach result explains why it appeared, listing the exact inputs that triggered it, and it states that this is not a diagnosis. In urgent cases, the generative AI is not relied on at all: a fixed safety message is shown instead.\n\nThe warning-sign rules in this prototype are illustrative. They must be reviewed by a qualified clinician before real use."
    },
    {
      id: 8,
      title: 'How Generative AI Is Used',
      subtitle: 'Grounded Google Gemini deployment bounded by strict clinical references',
      category: 'AI ARCHITECTURE',
      bullets: [
        { title: 'Three Core Applications', desc: '1) Contextual conversational assistant, 2) Medical report decoding, 3) Personalized health notices.' },
        { title: 'Curated Knowledge Base', desc: 'Ingests verified reference material from the World Health Organization (WHO) and India\'s Ministry of Health (MoHFW).' },
        { title: 'Strict Guardrails & Constraints', desc: 'Instructed to use only the knowledge base for medical facts, admit when info is unavailable, and never diagnose or alter medication.' },
        { title: 'Transparent Attribution', desc: 'Every answer displays source references, rationale, and system confidence scores.' },
      ],
      keyTakeaway: 'Generative AI is strictly bounded by curated medical references and explicit uncertainty communication.',
      notes: "We use a generative AI model, Google Gemini, in three places: the assistant, report explanation, and personalised notices.\n\nThe assistant receives the mother's pregnancy week, her recent check-ins, the conversation so far, the safety result and a small knowledge base of reference material from WHO and India's Ministry of Health and Family Welfare.\n\nWe instruct the model to use only that knowledge base for medical facts, to say clearly when it does not have verified information, and never to diagnose or change medication. Each answer shows its sources, why the answer was given, and how confident the system is.\n\nThe knowledge base content is currently marked as draft and still needs verification against the official sources."
    },
    {
      id: 9,
      title: 'Machine Learning & Pattern Analysis',
      subtitle: 'Surfacing longitudinal correlations hidden across everyday check-ins',
      category: 'MACHINE LEARNING',
      bullets: [
        { title: 'Repeated Symptoms Detection', desc: 'Identifies chronic patterns, such as lower back discomfort mentioned on 4 of the last 7 days.' },
        { title: 'Multivariate Trend Tracking', desc: 'Detects multi-day trajectories: progressive drop in sleep hours or declining energy levels.' },
        { title: 'Check-in Adherence', desc: 'Notices missed daily entries and sends gentle, non-judgmental check-in nudges.' },
        { title: 'Transparent Risk Screening Demo', desc: 'Explores vital parameters (age, BP, blood sugar, temp) and displays exact contributing factors.' },
      ],
      keyTakeaway: 'The screening model is a demonstration, not a clinical diagnostic; next step is training on public maternal datasets.',
      notes: "MomCare uses data analysis on the mother's own check-ins to find patterns a person might miss.\n• Repeated symptoms: for example, back discomfort mentioned on four of the last seven days.\n• Trends: sleep slowly decreasing, or energy dropping over several days.\n• Missed check-ins, which trigger a gentle reminder.\n\nWe also include a small, transparent risk-screening model that uses values such as age, blood pressure, blood sugar and temperature, and shows which factors contributed to the result.\n\nIn this prototype, that model is a screening demonstration. It is not clinically validated and does not diagnose. The planned next step is to train and test it on a public maternal-health dataset and to have clinicians review it."
    },
    {
      id: 10,
      title: 'Personalisation & Medical Report Understanding',
      subtitle: 'Translating complex clinical lab tests and ultrasound scans into plain language',
      category: 'PERSONALISATION',
      bullets: [
        { title: 'Activity-Driven Notices', desc: 'Prompts stem from actual user logs (e.g. "You mentioned this symptom before. If continuing or worsening, consider contacting your provider").' },
        { title: '"Why am I seeing this?"', desc: 'Every card provides a transparent audit trail showing the exact historical entries that triggered it.' },
        { title: 'Medical Report Decoding', desc: 'Mothers upload ultrasounds or lab reports; MomCare translates medical acronyms (AFI, EFW, Glucose test) into plain language.' },
        { title: 'Doctor Discussion Guidance', desc: 'Does not diagnose or modify treatments; flags unusual findings with "Discuss with your doctor" and generates question prompts.' },
      ],
      keyTakeaway: 'Demystifying complex prenatal reports to empower mothers with clarity during clinical appointments.',
      notes: "Personalisation means the notices a mother sees come from her own activity, not from random schedules. Examples: 'You have not completed today's check-in' or 'You mentioned this symptom before. If it is continuing or worsening, consider contacting your healthcare provider.'\n\nEvery notice has a 'Why am I seeing this?' explanation, so the mother can see exactly which data triggered it.\n\nMedical report understanding lets a mother upload a report. MomCare explains difficult terms in simple language, summarises the key information, and links it to her pregnancy stage.\n\nIt does not diagnose conditions, and it does not change medication. Anything unusual is marked 'discuss with your doctor'."
    },
    {
      id: 11,
      title: 'Learning & MomCare Circle Community',
      subtitle: 'Bite-sized maternal education and safe, moderated peer sharing',
      category: 'COMMUNITY & LEARNING',
      bullets: [
        { title: 'Interactive Learning', desc: 'Warning-sign identification, true/false myth busters, and mini quizzes replace passive, overwhelming articles.' },
        { title: 'MomCare Circle', desc: 'Mothers post, like, comment, and bookmark shared experiences with flexible privacy: first name, "Mom", or anonymous.' },
        { title: 'Contextual Experience Matching', desc: 'Groups discussions by gestational week and topics (e.g. Week 24 baby kicks, sleep pillow recommendations).' },
        { title: 'AI Community Guardian', desc: 'Automated moderation filters spam, harassment, unsafe content, and misleading medical claims into a review queue.' },
      ],
      keyTakeaway: 'Community content is clearly labeled as shared peer experiences, never as formal medical advice.',
      notes: "Learning is interactive: mini quizzes, true or false questions, warning-sign identification and flip cards, instead of long articles.\n\nMomCare Circle is a community where mothers can post, like, comment, reply, save and report content. Mothers choose how they appear: first name, 'Mom', or anonymous.\n\nBased on pregnancy week and topic, the app can show similar experiences, for example, other mothers discussing back discomfort at week 24. These are always labelled as shared experiences, not medical advice.\n\nAI helps keep the community safe by checking for spam, harassment, unsafe content and misleading medical claims, and reported posts go to a review queue. In the current prototype, the community runs on a single device as a preview."
    },
    {
      id: 12,
      title: 'Privacy and Security',
      subtitle: 'Maternal health data privacy engineered as a foundational design principle',
      category: 'PRIVACY & SECURITY',
      bullets: [
        { title: 'Fundamental Principle', desc: 'Health information is among the most sensitive data a person owns; privacy is an architectural requirement.' },
        { title: 'Production Security Architecture', desc: 'Dedicated user authentication, isolated private medical records, encrypted database, and segregated report storage.' },
        { title: 'Prototype Privacy Posture', desc: 'In this prototype, data stays on the user\'s device and uses fictional sample data—no real patient health data is collected.' },
        { title: 'Compliance Roadmap', desc: 'Production deployment mandates full health-data privacy compliance, alignment with India\'s health-data rules, and clinician auditing.' },
      ],
      keyTakeaway: 'Zero data monetization; patient confidentiality is strictly protected across all architectural layers.',
      notes: "Health information is among the most sensitive data a person has, so privacy is a design principle, not an afterthought.\n\nThe planned production design includes individual user accounts, private medical records that other users can never see, a secure database, and medical reports stored separately from other data.\n\nIn the current prototype, data stays on the user's device and we use only fictional sample data. We do not ask for real health information at this stage.\n\nBefore any real mothers use MomCare, we would need a privacy setup suitable for health data, compliance with the applicable health-data rules in India, and a clinician review of all medical content."
    },
    {
      id: 13,
      title: 'Technology and Data Flow',
      subtitle: 'Six-step server-mediated pipeline combining Gemini API with robust safety logic',
      category: 'TECHNOLOGY',
      bullets: [
        { title: 'Step 1 & 2: Input & Safety Triage', desc: 'Mother enters profile and daily check-in; the safety check executes first on all submitted inputs.' },
        { title: 'Step 3: Pattern Analysis & Screening', desc: 'Pattern analysis and the screening model evaluate historical records and multi-day symptom frequency.' },
        { title: 'Step 4: Knowledge-Base Retrieval', desc: 'Relevant verified clinical guidelines and reference entries are retrieved.' },
        { title: 'Step 5 & 6: AI Synthesis & Escalation', desc: 'AI writes a personalized, plain-language response with sources, reasoning, uncertainty score, and clinical escalation.' },
      ],
      keyTakeaway: 'Built with Google AI Studio & Gemini API; production architecture incorporates Supabase/Firestore for secure storage.',
      notes: "The prototype is built with Google AI Studio and the Gemini API, using free tools. The planned production version adds Supabase for user accounts, a secure database and private file storage, with the AI key kept on a server and never exposed in the app.\n\nThe data flow works in six steps.\n• 1. The mother enters her profile and daily check-in.\n• 2. The safety check runs first on her inputs.\n• 3. Pattern analysis and the screening model process her history.\n• 4. The relevant knowledge-base entries are retrieved.\n• 5. The AI model writes a personalised, plain-language response using only that information.\n• 6. The app shows the answer with sources, reasons and an uncertainty note, and escalates to professional care when needed."
    },
    {
      id: 14,
      title: 'Current Limitations & Responsible Use',
      subtitle: 'Radical transparency about prototype boundaries and clinical readiness',
      category: 'RESPONSIBLE AI',
      bullets: [
        { title: 'Prototype, Not Medical Device', desc: 'MomCare is an informational companion prototype, not a certified medical device and not a doctor replacement.' },
        { title: 'Draft Status of Content', desc: 'All clinical warning-sign rules, educational articles, and quiz materials are drafts requiring formal OB/GYN review.' },
        { title: 'Screening Model Demonstration', desc: 'Risk-screening logic is an illustrative demonstration that has not undergone clinical validation on real populations.' },
        { title: 'AI Error Mitigation', desc: 'AI fallibility is actively mitigated by bounding answers to reference facts, displaying confidence, and gating with pre-AI safety rules.' },
      ],
      keyTakeaway: 'Being honest about limitations is essential for building a trustworthy, ethical healthcare product.',
      notes: "I want to be transparent about where we are today.\n• This is a prototype. It is not a medical device and not a replacement for professional care.\n• All medical content, warning-sign rules and quiz material are drafts and require clinician review.\n• The risk-screening model is a demonstration and has not been clinically validated.\n• AI can make mistakes, which is why we use a knowledge base, show sources and uncertainty, and put safety rules before the AI.\n• The free AI tier has usage limits and may use submitted data, so only fictional data is used.\n• Community and some features currently work only on one device.\n\nBeing honest about these limits is part of building a trustworthy health product."
    },
    {
      id: 15,
      title: 'Future Improvements and Closing',
      subtitle: 'Five-step roadmap toward clinical deployment and maternal health impact',
      category: 'ROADMAP & CLOSING',
      bullets: [
        { title: '1. Clinician Co-Design', desc: 'Formal review of safety rules, knowledge bases, and fetal milestones with qualified OB/GYNs.' },
        { title: '2. Clinical Model Validation', desc: 'Training and validating the risk screening model on diverse public maternal health datasets with published metrics.' },
        { title: '3. Secure Production Cloud', desc: 'Enterprise accounts, secure cloud database, and private medical report vaults.' },
        { title: '4. Multilingual Localization', desc: 'Native speaker-checked translations in Tamil, Telugu, Kannada, and Hindi.' },
      ],
      keyTakeaway: 'MomCare connects personal context, pattern analysis, safety checks, and generative AI to help mothers reach care sooner.',
      notes: "Our roadmap has five steps.\n• Clinician review of the safety rules, knowledge base and baby-development content.\n• Training and validating the risk model on real datasets, with clear performance reporting.\n• Secure accounts, a real database and private report storage.\n• Full support for Tamil, Telugu, Kannada and Hindi, checked by native speakers.\n• A real shared community, push reminders, a partner view and emergency contact shortcuts.\n\nIn summary, MomCare brings together personal context, pattern analysis, a safety check and generative AI, to help mothers notice what matters and reach professional care sooner.\n\nThank you. I would be happy to take your questions and to show a short live demonstration."
    }
  ];

  const anyPptx = pptx as any;

  slidesData.forEach((data, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bgLight };

    // Slide Header Bar (Accent top stripe)
    slide.addShape(anyPptx.shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.1,
      fill: { color: COLORS.primaryRose },
      line: { color: COLORS.primaryRose }
    });

    // Top Category Badge
    slide.addShape(anyPptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 0.35,
      w: 2.2,
      h: 0.35,
      fill: { color: COLORS.softPink },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.15
    });

    slide.addText(data.category, {
      x: 0.8,
      y: 0.35,
      w: 2.2,
      h: 0.35,
      fontSize: 10,
      bold: true,
      color: COLORS.primaryRose,
      align: 'center',
      valign: 'middle'
    });

    // Slide Number in Top Right
    slide.addText(`Slide ${data.id} of ${slidesData.length}`, {
      x: 10.5,
      y: 0.35,
      w: 2.0,
      h: 0.35,
      fontSize: 11,
      color: COLORS.textMuted,
      align: 'right',
      valign: 'middle'
    });

    // Slide Title
    slide.addText(data.title, {
      x: 0.8,
      y: 0.85,
      w: 11.7,
      h: 0.7,
      fontSize: 26,
      bold: true,
      color: COLORS.textDark,
      fontFace: 'Arial'
    });

    // Slide Subtitle
    slide.addText(data.subtitle, {
      x: 0.8,
      y: 1.55,
      w: 11.7,
      h: 0.45,
      fontSize: 13,
      color: COLORS.primaryRose,
      fontFace: 'Arial'
    });

    // 4 Content Cards Grid (2x2)
    const cardPositions = [
      { x: 0.8, y: 2.15, w: 5.65, h: 1.85 },
      { x: 6.8, y: 2.15, w: 5.65, h: 1.85 },
      { x: 0.8, y: 4.20, w: 5.65, h: 1.85 },
      { x: 6.8, y: 4.20, w: 5.65, h: 1.85 },
    ];

    data.bullets.forEach((b, i) => {
      const pos = cardPositions[i];
      // Card Container
      slide.addShape(anyPptx.shapes.ROUNDED_RECTANGLE, {
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        fill: { color: COLORS.white },
        line: { color: COLORS.cardBorder, width: 1 },
        rectRadius: 0.12
      });

      // Card Number Circle
      slide.addShape(anyPptx.shapes.OVAL, {
        x: pos.x + 0.25,
        y: pos.y + 0.25,
        w: 0.4,
        h: 0.4,
        fill: { color: COLORS.softPink },
        line: { color: COLORS.softPink }
      });

      slide.addText(`${i + 1}`, {
        x: pos.x + 0.25,
        y: pos.y + 0.25,
        w: 0.4,
        h: 0.4,
        fontSize: 11,
        bold: true,
        color: COLORS.primaryRose,
        align: 'center',
        valign: 'middle'
      });

      // Card Title
      slide.addText(b.title, {
        x: pos.x + 0.75,
        y: pos.y + 0.22,
        w: pos.w - 0.95,
        h: 0.4,
        fontSize: 13,
        bold: true,
        color: COLORS.textDark,
        fontFace: 'Arial'
      });

      // Card Description
      slide.addText(b.desc, {
        x: pos.x + 0.25,
        y: pos.y + 0.75,
        w: pos.w - 0.5,
        h: pos.h - 0.85,
        fontSize: 11,
        color: COLORS.textDark,
        fontFace: 'Arial',
        valign: 'top',
        lineSpacingMultiple: 1.15
      });
    });

    // Bottom Key Takeaway Banner
    slide.addShape(anyPptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 6.25,
      w: 11.65,
      h: 0.65,
      fill: { color: COLORS.softPink },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.1
    });

    slide.addText([
      { text: 'CORE TAKEAWAY:  ', options: { bold: true, color: COLORS.primaryRose, fontSize: 10 } },
      { text: data.keyTakeaway, options: { bold: false, color: COLORS.textDark, fontSize: 10.5 } }
    ], {
      x: 1.0,
      y: 6.25,
      w: 11.25,
      h: 0.65,
      valign: 'middle'
    });

    // EMBED SPEAKER NOTES INTO PPTX!
    slide.addNotes(data.notes);
  });

  // Ensure public directory exists
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'MomCare_Presentation.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentation generated successfully at: ${outputPath}`);
}

generatePresentation().catch(err => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
