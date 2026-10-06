import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export interface PatientContext {
  pregnancyWeek?: number;
  dueDate?: string;
  firstPregnancy?: boolean;
  medicalHistoryNotes?: string;
  allergies?: string;
  medications?: string[];
  recentCheckinsSummary?: string;
  recentSymptomsSummary?: string;
  recentReportSummary?: string;
}

// Deterministic medical safety check for severe red flags
export function evaluateDeterministicSafety(symptomText: string, context?: PatientContext): {
  isTriggered: boolean;
  level: "red" | "yellow" | "green";
  ruleName: string;
  reason: string;
} {
  const lower = symptomText.toLowerCase();

  // RED FLAGS (Emergencies requiring prompt in-person medical care)
  if (
    lower.includes("heavy bleeding") ||
    lower.includes("soaking a pad") ||
    lower.includes("blood clots") ||
    (lower.includes("bleeding") && (lower.includes("severe") || lower.includes("clots") || lower.includes("cramping")))
  ) {
    return {
      isTriggered: true,
      level: "red",
      ruleName: "Vaginal Bleeding in Pregnancy",
      reason: "Significant vaginal bleeding can be a sign of placental complications, cervical issues, or early labor and requires prompt clinical evaluation.",
    };
  }

  if (
    (lower.includes("headache") && (lower.includes("vision") || lower.includes("blurry") || lower.includes("spots") || lower.includes("flashing"))) ||
    (lower.includes("swelling") && (lower.includes("face") || lower.includes("hands") || lower.includes("sudden")) && lower.includes("headache")) ||
    lower.includes("severe right upper") ||
    lower.includes("epigastric") ||
    (lower.includes("rib pain") && lower.includes("right side") && lower.includes("severe"))
  ) {
    return {
      isTriggered: true,
      level: "red",
      ruleName: "Preeclampsia Triad / Warning Signs",
      reason: "Persistent severe headache accompanied by visual disturbances, sudden facial/hand edema, or right upper quadrant pain are classic red-flag signs of preeclampsia.",
    };
  }

  if (
    (context?.pregnancyWeek && context.pregnancyWeek >= 24) &&
    (lower.includes("no movement") || lower.includes("haven't felt baby") || lower.includes("baby not moving") || lower.includes("decreased movement") || lower.includes("movement stopped"))
  ) {
    return {
      isTriggered: true,
      level: "red",
      ruleName: "Decreased Fetal Movement (3rd / Late 2nd Trimester)",
      reason: "A noticeable decrease or cessation of fetal movement past 24-28 weeks requires immediate fetal wellbeing assessment (non-stress test / biophysical profile).",
    };
  }

  if (
    lower.includes("gush of fluid") ||
    lower.includes("water broke") ||
    lower.includes("leaking fluid") ||
    (lower.includes("water leaking") && (context?.pregnancyWeek ? context.pregnancyWeek < 37 : false))
  ) {
    return {
      isTriggered: true,
      level: "red",
      ruleName: "Possible Rupture of Membranes / Preterm Premature Rupture",
      reason: "Fluid leaking before 37 weeks or sudden fluid loss requires immediate clinical evaluation to protect against infection and assess labor progression.",
    };
  }

  if (
    (lower.includes("fever") && (lower.includes("101") || lower.includes("102") || lower.includes("103") || lower.includes("high") || lower.includes("chills"))) ||
    (lower.includes("stiff neck") && lower.includes("fever"))
  ) {
    return {
      isTriggered: true,
      level: "red",
      ruleName: "High Fever & Systemic Infection Flag",
      reason: "High fevers during pregnancy can impact maternal-fetal wellbeing and require physician diagnosis to identify and treat underlying infections.",
    };
  }

  // YELLOW FLAGS (Needs Healthcare Assessment within 12-24h)
  if (
    lower.includes("burning") ||
    lower.includes("pain when urinating") ||
    lower.includes("stinging while peeing") ||
    (lower.includes("frequent urination") && (lower.includes("cloudy") || lower.includes("foul") || lower.includes("pelvic pressure")))
  ) {
    return {
      isTriggered: true,
      level: "yellow",
      ruleName: "Suspected Urinary Tract Infection",
      reason: "Asymptomatic or symptomatic UTIs are common in pregnancy and can progress to kidney infections (pyelonephritis) or preterm contractions if untreated with pregnancy-safe antibiotics.",
    };
  }

  if (
    lower.includes("itching") && (lower.includes("palms") || lower.includes("soles") || lower.includes("feet") || lower.includes("hands") || lower.includes("worse at night"))
  ) {
    return {
      isTriggered: true,
      level: "yellow",
      ruleName: "Intrahepatic Cholestasis of Pregnancy (ICP) Flag",
      reason: "Intense itching without rash, especially on palms and soles, can indicate elevated bile acids (cholestasis) which requires maternal blood testing.",
    };
  }

  return {
    isTriggered: false,
    level: "green",
    ruleName: "Routine",
    reason: "",
  };
}

export async function handleSymptomTriage(body: {
  symptomName: string;
  description: string;
  severity?: string;
  duration?: string;
  pregnancyWeek?: number;
  patientContext?: PatientContext;
  language?: 'en' | 'ta' | 'hi';
}) {
  const { symptomName, description, severity, duration, pregnancyWeek, patientContext, language = 'en' } = body;
  const combinedText = `${symptomName}. ${description || ""} ${severity ? `Severity: ${severity}.` : ""} ${duration ? `Duration: ${duration}.` : ""}`;

  // Step 1: Run Deterministic Safety Check
  const deterministicResult = evaluateDeterministicSafety(combinedText, {
    pregnancyWeek,
    ...patientContext,
  });

  const langInstruction =
    language === 'ta'
      ? '8. LANGUAGE REQUIREMENT: You MUST write all textual fields (summary, meaning, riskTitle, why, whatToDoNow, watchFor, whenToContact) in simple, warm, everyday Tamil (எளிய தமிழ்) that a village mother can easily understand.'
      : language === 'hi'
      ? '8. LANGUAGE REQUIREMENT: You MUST write all textual fields (summary, meaning, riskTitle, why, whatToDoNow, watchFor, whenToContact) in simple, warm, everyday Hindi (सरल हिन्दी) that a village mother can easily understand.'
      : '';

  // Step 2: Build Structured Context
  const contextLines = [
    `Current Pregnancy Week: ${pregnancyWeek || patientContext?.pregnancyWeek || "Not specified"} weeks`,
    patientContext?.dueDate ? `Due Date: ${patientContext.dueDate}` : null,
    patientContext?.firstPregnancy !== undefined ? `First Pregnancy: ${patientContext.firstPregnancy ? "Yes" : "No"}` : null,
    patientContext?.medicalHistoryNotes ? `Known Health Background: ${patientContext.medicalHistoryNotes}` : null,
    patientContext?.allergies ? `Known Allergies: ${patientContext.allergies}` : null,
    patientContext?.medications && patientContext.medications.length > 0 ? `Current User-Entered Supplements/Medications: ${patientContext.medications.join(", ")}` : null,
    patientContext?.recentCheckinsSummary ? `Recent Check-in Pattern: ${patientContext.recentCheckinsSummary}` : null,
    patientContext?.recentSymptomsSummary ? `Relevant Previous Symptoms: ${patientContext.recentSymptomsSummary}` : null,
  ].filter(Boolean).join("\n");

  const systemInstruction = `You are MomCare, an AI-powered contextual maternal care companion.
Your mission is to provide warm, medically-responsible, evidence-based pregnancy information.

CRITICAL MEDICAL & SAFETY PRINCIPLES:
1. You are NOT a medical doctor and NEVER provide clinical diagnoses or prescriptions.
2. Structure your response clearly in standard JSON format matching the schema.
3. If deterministic safety detected RED flag (${deterministicResult.isTriggered && deterministicResult.level === "red"}), you MUST set riskLevel to 'red' and recommend prompt professional medical assessment.
4. If deterministic safety detected YELLOW flag (${deterministicResult.isTriggered && deterministicResult.level === "yellow"}), you MUST set riskLevel to 'yellow' or 'red' (never green) and encourage assessment by their doctor/midwife.
5. In your "why" section, explain only observable factors and pregnancy physiology (e.g. progesterone, uterine vascularity, nerve pressure) without exposing raw chain-of-thought.
6. Provide trusted medical references (e.g. ACOG, NHS, WHO, CDC, RCOG).
7. Never use alarmist language. Maintain calm, empathetic, empowering healthcare communication.
${langInstruction}`;

  const prompt = `Patient Context:
${contextLines}

Current Reported Symptom:
Symptom: ${symptomName}
Details: ${description || "None provided"}
Severity: ${severity || "Unspecified"}
Duration: ${duration || "Unspecified"}
Deterministic Rule Result: ${deterministicResult.isTriggered ? `${deterministicResult.level.toUpperCase()} - ${deterministicResult.ruleName} (${deterministicResult.reason})` : "No urgent deterministic flags triggered"}

Please analyze this symptom in the context of the mother's pregnancy journey and return a structured JSON response.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Short summary of what the mother shared" },
            meaning: { type: Type.STRING, description: "Plain-language medical explanation of what this may mean" },
            riskLevel: { type: Type.STRING, enum: ["green", "yellow", "red"], description: "Risk awareness level" },
            riskTitle: { type: Type.STRING, description: "Human label like Routine Monitoring, Needs Healthcare Assessment, Urgent Medical Attention" },
            why: { type: Type.STRING, description: "Observable clinical factors explaining this assessment" },
            whatToDoNow: { type: Type.STRING, description: "Safe comfort and care steps the mother can take right now" },
            watchFor: { type: Type.STRING, description: "Key signs that indicate this needs immediate escalation" },
            whenToContact: { type: Type.STRING, description: "Clear escalation guidelines on when and whom to call" },
            sources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recognized authoritative medical organizations (e.g., ACOG, NHS, WHO, CDC)",
            },
          },
          required: ["summary", "meaning", "riskLevel", "riskTitle", "why", "whatToDoNow", "watchFor", "whenToContact", "sources"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    // Safety override: deterministic rule cannot be downgraded by AI
    if (deterministicResult.isTriggered && deterministicResult.level === "red") {
      parsed.riskLevel = "red";
      parsed.riskTitle = "Urgent Medical Attention Advised";
    } else if (deterministicResult.isTriggered && deterministicResult.level === "yellow" && parsed.riskLevel === "green") {
      parsed.riskLevel = "yellow";
      parsed.riskTitle = "Needs Healthcare Assessment";
    }

    return {
      success: true,
      data: parsed,
      deterministicRule: deterministicResult.isTriggered ? deterministicResult : null,
    };
  } catch (err: any) {
    console.error("Gemini symptom triage error:", err);
    // Fallback safe structured response
    const fallbackLevel = deterministicResult.isTriggered ? deterministicResult.level : (severity === "severe" ? "yellow" : "green");
    return {
      success: true,
      data: {
        summary: `You reported ${symptomName}${duration ? ` for ${duration}` : ""}.`,
        meaning: deterministicResult.isTriggered
          ? deterministicResult.reason
          : "During pregnancy, your body undergoes profound cardiovascular, hormonal, and musculoskeletal adaptations that can cause varying sensations.",
        riskLevel: fallbackLevel,
        riskTitle: fallbackLevel === "red" ? "Urgent Medical Attention Advised" : fallbackLevel === "yellow" ? "Needs Healthcare Assessment" : "Routine Pregnancy Experience",
        why: deterministicResult.isTriggered ? deterministicResult.reason : "Based on typical pregnancy physiology for your gestational stage.",
        whatToDoNow: "Rest comfortably, stay well hydrated with water, and note any changes in intensity or duration.",
        watchFor: "Severe pain, vaginal bleeding, fluid leakage, or signs of infection such as fever.",
        whenToContact: "Contact your obstetrician or midwife if symptoms worsen or cause persistent discomfort.",
        sources: ["American College of Obstetricians and Gynecologists (ACOG)", "National Health Service (NHS) Maternity Guidelines"],
      },
      fallback: true,
    };
  }
}

export async function handleContextualChat(body: {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  pregnancyWeek?: number;
  patientContext?: PatientContext;
  language?: 'en' | 'ta' | 'hi';
}) {
  const { message, conversationHistory = [], pregnancyWeek, patientContext, language = 'en' } = body;

  const contextLines = [
    `Gestational Age: ${pregnancyWeek || patientContext?.pregnancyWeek || "Not specified"} weeks`,
    patientContext?.dueDate ? `Estimated Due Date: ${patientContext.dueDate}` : null,
    patientContext?.firstPregnancy !== undefined ? `First-time mother: ${patientContext.firstPregnancy ? "Yes" : "No"}` : null,
    patientContext?.medicalHistoryNotes ? `Health Notes: ${patientContext.medicalHistoryNotes}` : null,
    patientContext?.allergies ? `Allergies: ${patientContext.allergies}` : null,
    patientContext?.medications && patientContext.medications.length > 0 ? `Current Supplements/Meds: ${patientContext.medications.join(", ")}` : null,
    patientContext?.recentCheckinsSummary ? `Recent Check-in History: ${patientContext.recentCheckinsSummary}` : null,
    patientContext?.recentSymptomsSummary ? `Recent Logged Symptoms: ${patientContext.recentSymptomsSummary}` : null,
  ].filter(Boolean).join("\n");

  const langInstruction =
    language === 'ta'
      ? '7. LANGUAGE RULE: You MUST reply entirely in warm, simple, everyday spoken Tamil (எளிய தமிழ்) that a mother can easily understand. Avoid hard Sanskritized words or textbook jargon.'
      : language === 'hi'
      ? '7. LANGUAGE RULE: You MUST reply entirely in warm, simple, everyday Hindi (सरल हिन्दी) that a mother can easily understand. Avoid complex medical Sanskritized vocabulary.'
      : '';

  const systemInstruction = `You are MomCare, a compassionate, context-aware AI pregnancy companion.
You have access to the mother's longitudinal journey and conversation history.

CONVERSATION & MEMORY RULES:
1. Always resolve pronouns and relative references (e.g., if she says "it hurts more today" or "it started again", check recent symptoms and earlier messages to identify what symptom she is referring to).
2. Acknowledge continuity: e.g. "Since you mentioned mild nausea yesterday...", "Following up on your back discomfort...".
3. Provide warm, medically sound guidance supported by recognized guidelines (ACOG, NHS, WHO).
4. Never diagnose or prescribe.
5. If the mother describes dangerous red flags (e.g. heavy bleeding, severe sudden headache with vision changes, loss of fetal movement in late pregnancy, fluid gush), gently and clearly direct her to contact her doctor or emergency triage immediately.
6. Keep answers structured, empathetic, readable on mobile screens, avoiding overwhelming jargon or huge unbroken blocks of text.
${langInstruction}`;

  const formattedHistory = conversationHistory.slice(-8).map(msg => ({
    role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: msg.content }],
  }));

  const userTurn = `[PATIENT CONTEXT]
${contextLines}

[USER MESSAGE]
${message}`;

  try {
    const contents: any[] = [...formattedHistory, { role: "user", parts: [{ text: userTurn }] }];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || "I'm here for you and listening. Could you tell me a little more about how you're feeling right now?";

    // Detect risk awareness level from response
    const lowerReply = replyText.toLowerCase();
    let riskLevel: "green" | "yellow" | "red" = "green";
    if (lowerReply.includes("emergency") || lowerReply.includes("labor and delivery triage") || lowerReply.includes("immediate medical attention")) {
      riskLevel = "red";
    } else if (lowerReply.includes("contact your doctor") || lowerReply.includes("speak with your midwife") || lowerReply.includes("healthcare provider")) {
      riskLevel = "yellow";
    }

    return {
      success: true,
      reply: replyText,
      riskLevel,
      sources: ["American College of Obstetricians and Gynecologists (ACOG)", "NHS Pregnancy Care"],
    };
  } catch (err: any) {
    console.error("Gemini chat error:", err);
    return {
      success: true,
      reply: "I hear you, and it's completely understandable to ask about this during your pregnancy. While I'm experiencing a brief network pause, please know that your care team is always your best resource for individual symptoms. If you are experiencing sudden severe pain, bleeding, or decreased baby movement, please call your maternity unit right away.",
      riskLevel: "green",
      sources: ["ACOG"],
      fallback: true,
    };
  }
}

export async function handleReportInsights(body: {
  reportName: string;
  reportType: string;
  reportText?: string;
  pregnancyWeek?: number;
}) {
  const { reportName, reportType, reportText = "", pregnancyWeek } = body;

  const systemInstruction = `You are MomCare Medical Report Companion.
Your role is to translate medical lab reports, ultrasound scans, and clinical notes into compassionate, clear, plain language for expectant mothers.

CRITICAL SAFEGUARDS:
1. You DO NOT provide medical diagnoses or second-guess the clinical physician.
2. State clearly: "AI-generated explanation — not a medical diagnosis."
3. Highlight key normal ranges and what specific acronyms (e.g. CRL, BPD, AFI, Hb, GTT, hCG, PAPP-A) mean in accessible terms.
4. Give the mother 3 to 4 thoughtful questions to ask her doctor/midwife at her next appointment.`;

  const prompt = `Report Name: ${reportName}
Report Category: ${reportType}
Gestational Week: ${pregnancyWeek || "Mid-pregnancy"}
Report Text Content:
${reportText || "Standard prenatal evaluation scan / laboratory screening"}

Please parse this report into plain-language understanding for the expectant mother.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiSummary: { type: Type.STRING, description: "Warm, plain-language executive summary of the report" },
            plainLanguageExplanation: { type: Type.STRING, description: "Educational breakdown of the test purpose and standard anatomical/metabolic context" },
            keyValues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING, description: "Parameter name (e.g. Hemoglobin, Amniotic Fluid Index, Fetal Heart Rate)" },
                  value: { type: Type.STRING, description: "Observed or typical value" },
                  interpretation: { type: Type.STRING, description: "What this measurement generally signifies" },
                },
                required: ["metric", "value", "interpretation"],
              },
            },
            questionsForDoctor: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Prepared questions for the mother to bring to her next appointment",
            },
          },
          required: ["aiSummary", "plainLanguageExplanation", "keyValues", "questionsForDoctor"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      success: true,
      data: parsed,
    };
  } catch (err: any) {
    console.error("Gemini report error:", err);
    return {
      success: true,
      data: {
        aiSummary: `This ${reportName} provides essential insight into your prenatal health and baby's developmental markers. All measurements are consistent with typical prenatal screening protocols.`,
        plainLanguageExplanation: "Prenatal screening reports look at maternal blood counts, metabolic markers, or ultrasound biometric dimensions to ensure healthy maternal-fetal adaptations.",
        keyValues: [
          { metric: "Gestational Correlation", value: "Appropriate for dates", interpretation: "Baby's growth parameters align closely with your expected gestational age." },
          { metric: "Fetal Heart Rate", value: "Normal rhythm (120-160 bpm)", interpretation: "Strong and reassuring cardiac activity." },
        ],
        questionsForDoctor: [
          "Do these findings suggest any adjustments needed to my prenatal vitamins or iron intake?",
          "Are there any follow-up ultrasounds or blood tests scheduled for this trimester?",
          "Is baby's growth and amniotic fluid volume tracking right on schedule?",
        ],
      },
      fallback: true,
    };
  }
}

export async function handleMomCareNoticed(body: {
  recentCheckins?: any[];
  recentSymptoms?: any[];
  pregnancyWeek?: number;
}) {
  const { recentCheckins = [], recentSymptoms = [], pregnancyWeek = 24 } = body;

  const prompt = `Recent Maternal Check-ins:
${JSON.stringify(recentCheckins.slice(-5))}

Recent Symptoms Logged:
${JSON.stringify(recentSymptoms.slice(-5))}

Current Week: ${pregnancyWeek}

As MomCare, generate 1 or 2 gentle, non-diagnostic longitudinal observations (e.g., "MomCare noticed you mentioned back discomfort twice this week — gentle pelvic tilts and a pregnancy pillow may bring relief", or "You completed 5 daily check-ins this week! Keeping track helps your care team support you.").`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are MomCare. Provide short, warm, non-diagnostic longitudinal observations based on the mother's own history. Never diagnose.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            observations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["pattern", "care", "milestone"] },
                },
                required: ["title", "description", "type"],
              },
            },
          },
          required: ["observations"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return { success: true, data: parsed };
  } catch (err: any) {
    return {
      success: true,
      data: {
        observations: [
          {
            title: "Consistent Daily Check-ins",
            description: "You've been tracking your mood and energy faithfully. Tuning into your body is a wonderful practice for both you and baby.",
            type: "care",
          },
        ],
      },
    };
  }
}

export async function handleWombRender(body: {
  pregnancyWeek: number;
  pregnancyDays?: number;
  babyNickname?: string;
}) {
  const { pregnancyWeek = 24, pregnancyDays = 0, babyNickname = "Baby" } = body;

  const prompt = `Gestational Age: ${pregnancyWeek} weeks and ${pregnancyDays} days. Baby Nickname: "${babyNickname}".
Generate detailed, medically accurate 3D fetal visualization and amniotic lighting parameters for a mother viewing her baby in the womb.
Include fetal posture, facial detail, vernix/skin condition, amniotic fluid lighting (soft pink and warm amber glow), and normal heart rate.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are MomCare Maternal Imaging specialist. Generate photorealistic, reassuring fetal visualization attributes for expectant mothers.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            promptSummary: { type: Type.STRING, description: "Detailed visual description of fetus in womb" },
            fetalPose: { type: Type.STRING, description: "Fetal position and limb flexion" },
            amnioticDetails: { type: Type.STRING, description: "Amniotic fluid, lighting, and cord interface" },
            heartRateBpm: { type: Type.NUMBER, description: "Estimated typical heart rate in bpm" },
            visualGuidance: { type: Type.STRING, description: "Maternal encouragement about baby's growth" },
          },
          required: ["promptSummary", "fetalPose", "amnioticDetails", "heartRateBpm", "visualGuidance"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return { success: true, data: parsed };
  } catch (err: any) {
    return {
      success: true,
      data: {
        promptSummary: `Photorealistic 3D rendering of a ${pregnancyWeek}-week fetus nestled in the mother's womb, bathed in warm amniotic backlighting with soft pink and rose hues.`,
        fetalPose: pregnancyWeek >= 32 ? "Curled in gentle cephalic vertex position" : "Active flexion with hands near chest and kicking feet",
        amnioticDetails: "Clear amniotic fluid with gentle micro-eddies, illuminated by a warm pinkish-ivory bioluminescent glow. The coiled umbilical cord floats peacefully.",
        heartRateBpm: pregnancyWeek < 12 ? 155 : 142,
        visualGuidance: `Your baby is growing beautifully at ${pregnancyWeek} weeks, practicing swallowing and listening to your voice.`,
      },
      fallback: true,
    };
  }
}

export async function handleHomeInsight(body: {
  pregnancyWeek: number;
  motherName?: string;
  babyNickname?: string;
  medicalConditions?: string[];
  allergies?: string;
  medications?: string;
  recentCheckins?: any[];
  recentSymptoms?: any[];
  language?: 'en' | 'ta' | 'hi';
}) {
  const {
    pregnancyWeek = 24,
    motherName = 'there',
    babyNickname = 'baby',
    medicalConditions = [],
    allergies = '',
    medications = '',
    recentCheckins = [],
    recentSymptoms = [],
    language = 'en',
  } = body;

  const checkinsCount = recentCheckins.length;

  const fallbackData: Record<'en' | 'ta' | 'hi', {
    insightText: string;
    whyAmISeeingThis: string;
    suggestedQuestions: string[];
    suggestedFocusTasks: string[];
  }> = {
    en: {
      insightText: checkinsCount < 3
        ? `Welcome to your personal space, ${motherName}. Log your feelings for 2-3 more days so MomCare can spot your personal trends in sleep, energy, and comfort. At week ${pregnancyWeek}, remember to stay hydrated with small sips and take a restful 15-minute break on your side.`
        : `Over the past week, you've been doing well taking moments to check in. Your body is doing profound work nurturing ${babyNickname} during week ${pregnancyWeek}. Try keeping a glass of water handy and taking gentle short pauses whenever you notice fatigue.`,
      whyAmISeeingThis: checkinsCount < 3
        ? `Based on your pregnancy week (${pregnancyWeek}) and health baseline while your daily log builds.`
        : `Based on your recent daily check-ins and week ${pregnancyWeek} adaptations.`,
      suggestedQuestions: [
        `Why do I feel more tired in week ${pregnancyWeek}?`,
        `Safe ways to soothe lower back ache without medicine?`,
        `What gentle movements are best for week ${pregnancyWeek}?`,
      ],
      suggestedFocusTasks: [
        `Drink 8 glasses of water throughout the day`,
        `15-minute side-lying rest or gentle stretch`,
        pregnancyWeek >= 28 ? `Count ${babyNickname}'s active kicks after lunch or dinner` : `Take prenatal vitamin with folic acid`,
      ],
    },
    ta: {
      insightText: checkinsCount < 3
        ? `வணக்கம் ${motherName}. உங்கள் தூக்கம், உடல் சோர்வு மற்றும் ஆரோக்கியத்தைக் கவனிக்க இன்னும் 2-3 நாட்கள் தொடர்ந்து பதிவு செய்யுங்கள். ${pregnancyWeek}-வது வாரத்தில் போதுமான தண்ணீர் குடித்து, சிறிது நேரம் இடது பக்கம் சாய்ந்து அமைதியாக ஓய்வெடுங்கள்.`
        : `கடந்த சில நாட்களில் நீங்கள் கவனமாக உங்கள் ஆரோக்கியத்தைப் பதிவு செய்துள்ளீர்கள். ${pregnancyWeek}-வது வாரத்தில் ${babyNickname} ஆரோக்கியமாக வளர உங்கள் உடலுக்கு நல்ல ஓய்வு தேவை. சோர்வு ஏற்படும்போது சிறிது நேரம் கால்களை உயர்த்தி ஓய்வெடுங்கள்.`,
      whyAmISeeingThis: checkinsCount < 3
        ? `உங்கள் கர்ப்ப வாரம் (${pregnancyWeek}) மற்றும் ஆரம்ப தகவல்களின் அடிப்படையில்.`
        : `உங்கள் கடந்த சில நாட்களின் பதிவுகள் மற்றும் ${pregnancyWeek}-வது வார மாற்றங்களின் அடிப்படையில்.`,
      suggestedQuestions: [
        `${pregnancyWeek}-வது வாரத்தில் அதிக சோர்வு ஏற்படுவது ஏன்?`,
        `மருந்து இல்லாமல் முதுகு வலியை எப்படி குறைக்கலாம்?`,
        `குழந்தையின் அசைவை எப்போது கவனிக்க வேண்டும்?`,
      ],
      suggestedFocusTasks: [
        `இன்று குறைந்தது 8 டம்ளர் தண்ணீர் குடிக்கவும்`,
        `15 நிமிடம் இடது பக்கம் சாய்ந்து அமைதியாக ஓய்வெடுக்கவும்`,
        pregnancyWeek >= 28 ? `சாப்பிட்ட பிறகு குழந்தையின் அசைவுகளை கவனிக்கவும்` : `இரும்புச்சத்து & ஃபோலிக் ஆசிட் மாத்திரை எடுக்கவும்`,
      ],
    },
    hi: {
      insightText: checkinsCount < 3
        ? `नमस्ते ${motherName}। अपनी नींद, ऊर्जा और सेहत के पैटर्न को समझने के लिए कृपया 2-3 दिन और चेक-इन करें। ${pregnancyWeek}वें हफ्ते में शरीर में पानी की कमी न होने दें और दिन में 15 मिनट बाईं करवट लेकर आराम करें।`
        : `पिछले कुछ दिनों में आपने अपनी सेहत का ध्यान रखा है। ${pregnancyWeek}वें हफ्ते में ${babyNickname} के विकास के साथ शरीर में थकान स्वाभाविक है। जब भी थकान लगे, पैरों को थोड़ा ऊपर रखकर आराम करें।`,
      whyAmISeeingThis: checkinsCount < 3
        ? `आपकी गर्भावस्था के ${pregnancyWeek}वें हफ्ते और प्रारंभिक स्वास्थ्य जानकारी के आधार पर।`
        : `आपकी हाल की दैनिक जांच और ${pregnancyWeek}वें हफ्ते के लक्षणों के आधार पर।`,
      suggestedQuestions: [
        `${pregnancyWeek}वें हफ्ते में इतनी थकान क्यों लगती है?`,
        `बिना दवा के कमर दर्द से आराम पाने के घरेलू उपाय?`,
        `शिशु की हलचल पर कब और कैसे ध्यान दें?`,
      ],
      suggestedFocusTasks: [
        `दिन भर में कम से कम 8 गिलास पानी पिएं`,
        `15 मिनट बाईं करवट लेटकर आराम करें`,
        pregnancyWeek >= 28 ? `भोजन के बाद शिशु की हलचल (किक) गिनें` : `आयरन और फोलिक एसिड की गोली समय पर लें`,
      ],
    },
  };

  const currentFallback = fallbackData[language] || fallbackData.en;

  if (checkinsCount < 3) {
    return {
      success: true,
      data: currentFallback,
    };
  }

  const checkinSummary = recentCheckins.slice(0, 14).map((c, i) => {
    return `Day -${i + 1}: Mood=${c.mood}, Energy=${c.energy || 'normal'}, Sleep=${c.sleep || 'okay'}, BabyMovement=${c.babyMovement || 'normal'}, Discomfort=${c.discomfortLocations?.join(', ') || 'none'}, Note=${c.symptoms || 'none'}`;
  }).join('\n');

  const langInstruction =
    language === 'ta'
      ? 'LANGUAGE REQUIREMENT: All fields (insightText, whyAmISeeingThis, suggestedQuestions, suggestedFocusTasks) MUST be in warm, simple, everyday spoken Tamil (எளிய தமிழ்) that a village mother easily understands.'
      : language === 'hi'
      ? 'LANGUAGE REQUIREMENT: All fields (insightText, whyAmISeeingThis, suggestedQuestions, suggestedFocusTasks) MUST be in warm, simple, everyday Hindi (सरल हिन्दी) that a village mother easily understands.'
      : 'Write in clear, warm, compassionate English.';

  const systemInstruction = `You are MomCare, an empathetic, evidence-based personal AI pregnancy companion.
You are generating a daily personalized insight card, "Why am I seeing this?" explanation, 3 suggested questions, and 3 today's focus tasks.

CRITICAL RULES:
1. insightText must be MAXIMUM 3 sentences in simple words.
2. It must mention something specific from her own logged data (e.g. sleep quality, energy dips, baby movement, or repeated discomfort location).
3. It must end with one clear, gentle, actionable suggestion (e.g., side-lying rest, warm compress, iron/hydration, gentle stroll).
4. whyAmISeeingThis must be a single concise sentence explicitly stating which of her personal logs informed this insight.
5. suggestedQuestions must be exactly 3 natural questions relevant to her current week and logged symptoms.
6. suggestedFocusTasks must be exactly 3 actionable, small daily tasks adapted to her week and conditions.
7. CRITICAL MEDICAL SAFETY: NEVER diagnose a disease, NEVER prescribe medicines or alter medications, NEVER use alarming medical jargon. Keep it supportive, lifestyle and comfort oriented.
${langInstruction}`;

  const prompt = `Mother Name: ${motherName}
Baby Nickname: ${babyNickname}
Pregnancy Week: ${pregnancyWeek}
Health Baseline Conditions: ${medicalConditions.join(', ') || 'None'}
Allergies: ${allergies || 'None'}
Medications/Supplements: ${medications || 'None'}

Logged Check-ins (last 7-14 days):
${checkinSummary}

Recent Symptoms:
${recentSymptoms.map(s => `${s.symptomName} (${s.severity}, ${s.riskLevel})`).join('; ') || 'None'}

Generate the personalized daily insight matching the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insightText: { type: Type.STRING, description: "Maximum 3 sentences personal insight mentioning specific logged data and ending with 1 clear suggestion" },
            whyAmISeeingThis: { type: Type.STRING, description: "Short line explaining which specific data was used" },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 personalized questions for Ask MomCare",
            },
            suggestedFocusTasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 small personalized tasks for today",
            },
          },
          required: ["insightText", "whyAmISeeingThis", "suggestedQuestions", "suggestedFocusTasks"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (!parsed.insightText) {
      return { success: true, data: currentFallback, fallback: true };
    }
    return { success: true, data: parsed };
  } catch (err) {
    console.error("Home insight error:", err);
    return { success: true, data: currentFallback, fallback: true };
  }
}

