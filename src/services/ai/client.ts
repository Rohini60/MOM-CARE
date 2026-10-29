import type { RetrievedPatientContext } from '../context/contextRetriever';

export interface SymptomTriageResponse {
  summary: string;
  meaning: string;
  riskLevel: 'green' | 'yellow' | 'red';
  riskTitle: string;
  why: string;
  whatToDoNow: string;
  watchFor: string;
  whenToContact: string;
  sources: string[];
}

export async function requestSymptomTriage(params: {
  symptomName: string;
  description: string;
  severity: string;
  duration: string;
  pregnancyWeek: number;
  patientContext: RetrievedPatientContext;
  language?: 'en' | 'ta' | 'hi';
}): Promise<SymptomTriageResponse> {
  const res = await fetch('/api/gemini/symptom-triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Failed to assess symptom: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export interface ChatActionPayload {
  type: string;
  descriptionEn: string;
  descriptionTa: string;
  descriptionHi: string;
  payload?: any;
}

export interface ContextualChatResponse {
  reply: string;
  sourceIds: string[];
  uncertain: boolean;
  urgent: boolean;
  followUps: string[];
  action?: ChatActionPayload | null;
  sources?: string[];
  fallback?: boolean;
}

export async function requestContextualChat(params: {
  message: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  pregnancyWeek: number;
  patientContext: RetrievedPatientContext;
  language?: 'en' | 'ta' | 'hi';
}): Promise<ContextualChatResponse> {
  const lang = params.language || 'en';
  const fallbackMessages: Record<'en' | 'ta' | 'hi', string> = {
    en: "I'm having trouble answering right now. Please try again. If you feel unwell, call your doctor.",
    ta: "பதில் அளிப்பதில் சிறிது தாமதம் ஏற்படுகிறது. தயவுசெய்து மீண்டும் முயற்சிக்கவும். உங்களுக்கு உடல்நலக்குறைவு ஏற்பட்டால் உடனே மருத்துவரை அழைக்கவும்.",
    hi: "मुझे अभी जवाब देने में परेशानी हो रही है। कृपया पुनः प्रयास करें। यदि आप अस्वस्थ महसूस कर रही हैं, तो अपने डॉक्टर को कॉल करें।",
  };
  const fallbackText = fallbackMessages[lang] || fallbackMessages.en;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        reply: fallbackText,
        sourceIds: [],
        uncertain: true,
        urgent: false,
        followUps: [],
        action: null,
        fallback: true,
      };
    }

    const json = await res.json();
    return {
      reply: json.reply || fallbackText,
      sourceIds: Array.isArray(json.sourceIds) ? json.sourceIds : [],
      uncertain: Boolean(json.uncertain),
      urgent: Boolean(json.urgent),
      followUps: Array.isArray(json.followUps) ? json.followUps : [],
      action: json.action || null,
      fallback: Boolean(json.fallback),
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      reply: fallbackText,
      sourceIds: [],
      uncertain: true,
      urgent: false,
      followUps: [],
      action: null,
      fallback: true,
    };
  }
}

export async function requestReportInsights(params: {
  reportName: string;
  reportType: string;
  reportText?: string;
  pregnancyWeek: number;
  language?: 'en' | 'ta' | 'hi';
}): Promise<{
  aiSummary: string;
  plainLanguageExplanation: string;
  keyValues: Array<{ metric: string; value: string; interpretation: string }>;
  questionsForDoctor: string[];
}> {
  const res = await fetch('/api/gemini/report-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Report insight request failed: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function requestMomCareNoticed(params: {
  recentCheckins: any[];
  recentSymptoms: any[];
  pregnancyWeek: number;
}): Promise<Array<{ title: string; description: string; type: string }>> {
  try {
    const res = await fetch('/api/gemini/pattern-notice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.observations || [];
  } catch {
    return [];
  }
}

export interface HomeInsightResponse {
  insightText: string;
  whyAmISeeingThis: string;
  suggestedQuestions: string[];
  suggestedFocusTasks: string[];
}

export async function requestHomeInsight(params: {
  pregnancyWeek: number;
  motherName?: string;
  babyNickname?: string;
  medicalConditions?: string[];
  allergies?: string;
  medications?: string;
  recentCheckins?: any[];
  recentSymptoms?: any[];
  language?: 'en' | 'ta' | 'hi';
}): Promise<HomeInsightResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('/api/gemini/home-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`Failed to generate home insight: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
