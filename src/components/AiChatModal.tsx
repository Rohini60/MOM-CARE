import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Phone,
  PhoneCall,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Heart,
  ChevronDown,
  Minimize2,
  Maximize2,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { requestContextualChat, type ChatActionPayload } from '../services/ai/client';
import { buildRelevantContext } from '../services/context/contextRetriever';
import {
  checkFixedDangerKeywords,
  parseLocalCommand,
  isUserAffirmative,
  isUserNegative,
  getConfirmationPrompt,
  getActionSuccessMessage,
  getActionCancelMessage,
  type AppAction,
  type AppActionType,
} from '../services/ai/commandEngine';
import { getKnowledgeNoteById } from '../config/knowledgeNotes';
import { useTheme } from '../context/ThemeContext';
import type { UserProfile, Checkin, SymptomRecord, Medication, Appointment } from '../types';

export interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  pregnancyWeek: number;
  recentCheckins: Checkin[];
  recentSymptoms: SymptomRecord[];
  medications?: Medication[];
  appointments?: Appointment[];
  initialPrompt?: string;
  language?: string;
  onExecuteAction?: (action: AppAction) => void;
  onOpenBreathing?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sourceIds?: string[];
  uncertain?: boolean;
  urgent?: boolean;
  followUps?: string[];
  pendingAction?: AppAction | null;
  dangerAlert?: {
    reason: string;
    doctorPhone: string;
  } | null;
  timestamp: string;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({
  isOpen,
  onClose,
  profile,
  pregnancyWeek,
  recentCheckins,
  recentSymptoms,
  medications = [],
  appointments = [],
  initialPrompt,
  language = 'en',
  onExecuteAction,
  onOpenBreathing,
}) => {
  const { theme, colorMode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePendingAction, setActivePendingAction] = useState<AppAction | null>(null);
  const [isMinimizedBubble, setIsMinimizedBubble] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lang = (language as 'en' | 'ta' | 'hi') || 'en';
  const motherName = profile?.displayName || profile?.preferredName || (lang === 'ta' ? 'அம்மா' : lang === 'hi' ? 'दीदी' : 'Sister');
  const babyNickname = profile?.babyNickname || (lang === 'ta' ? 'உங்கள் குழந்தை' : lang === 'hi' ? 'आपका बच्चा' : 'your baby');
  const doctorPhone = profile?.emergencyContact || profile?.familyContactPhone || profile?.doctorPhone || '108';

  // Load chat history from localStorage
  const storageKey = `momcare_chat_history_${profile?.id || 'default'}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // Ignore localStorage parse error
    }

    // Default welcome message introducing Buddy
    const welcomeByLang: Record<'en' | 'ta' | 'hi', string> = {
      en: `Hello dear ${motherName}, I'm Buddy! I'm right here beside you for Week ${pregnancyWeek}. I can guide you through every part of MomCare, answer questions, or navigate and control the app for you. What would you like to explore?`,
      ta: `வணக்கம் அன்பு ${motherName}, நான் Buddy! கர்ப்பத்தின் ${pregnancyWeek}-வது வாரத்தில் உங்களுடன் இருக்கிறேன். உங்கள் கேள்விகளுக்கு பதிலளிக்கவும், MomCare-ன் எந்த பகுதியையும் இயக்கவும் நான் தயார். நான் உங்களுக்கு எப்படி உதவட்டும்?`,
      hi: `नमस्ते प्यारी ${motherName}, मैं Buddy हूँ! गर्भावस्था के ${pregnancyWeek}वें हफ्ते में आपके साथ। मैं आपके सवालों के जवाब देने और ऐप के किसी भी हिस्से को कंट्रोल करने के लिए तैयार हूँ। आज मैं आपकी क्या मदद करूँ?`,
    };

    setMessages([
      {
        id: 'welcome_1',
        role: 'assistant',
        content: welcomeByLang[lang] || welcomeByLang.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [profile?.id, lang]);

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages.slice(-30)));
      } catch {
        // quota exceeded or storage disabled
      }
    }
  }, [messages, storageKey]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimizedBubble) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, isMinimizedBubble]);

  // Initial prompt trigger
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  // Example action chips for first screen showcasing Buddy's app control
  const exampleChips = [
    {
      labelEn: '📱 Switch to Tablet View',
      labelTa: '📱 டேப்லெட் மோடுக்கு மாற்று',
      labelHi: '📱 टैबलेट मोड में बदलें',
      prompt: lang === 'ta' ? 'டேப்லெட் மோடுக்கு மாற்று' : lang === 'hi' ? 'टैबलेट मोड में बदलें' : 'Switch to tablet mode',
    },
    {
      labelEn: '🩺 Check Vitals (ML)',
      labelTa: '🩺 வைட்டல்ஸ் பரிசோதனை',
      labelHi: '🩺 वाइटल्स चेक',
      prompt: lang === 'ta' ? 'வைட்டல்ஸ் பரிசோதனைப் பக்கத்தைத் திற' : lang === 'hi' ? 'वाइटल्स चेक खोलो' : 'Check my vitals',
    },
    {
      labelEn: '👶 Open Baby Development',
      labelTa: '👶 குழந்தை வளர்ச்சி திற',
      labelHi: '👶 शिशु विकास खोलें',
      prompt: lang === 'ta' ? 'குழந்தை வளர்ச்சியைத் திற' : lang === 'hi' ? 'शिशु विकास खोलें' : 'Open baby development',
    },
    {
      labelEn: '🫁 Start Breathing Exercise',
      labelTa: '🫁 சுவாசப் பயிற்சி தொடங்கு',
      labelHi: '🫁 सांस का अभ्यास शुरू करें',
      prompt: lang === 'ta' ? 'சுவாசப் பயிற்சி தொடங்கு' : lang === 'hi' ? 'शांत श्वास अभ्यास शुरू करें' : 'Start breathing exercise',
    },
    {
      labelEn: '📅 Jump to Week 28',
      labelTa: '📅 வாரம் 28-க்கு செல்',
      labelHi: '📅 हफ्ते 28 पर जाएँ',
      prompt: lang === 'ta' ? 'வாரம் 28 காட்டு' : lang === 'hi' ? 'हफ्ता 28 दिखाओ' : 'Jump to week 28',
    },
    {
      labelEn: theme === 'neon-pink' ? '💙 Switch to Neon Blue' : '💗 Switch to Neon Pink',
      labelTa: theme === 'neon-pink' ? '💙 நீல நிறத்திற்கு மாற்று' : '💗 இளஞ்சிவப்புக்கு மாற்று',
      labelHi: theme === 'neon-pink' ? '💙 नियॉन ब्लू में बदलें' : '💗 नियॉन पिंक में बदलें',
      prompt: theme === 'neon-pink' ? 'Change theme to neon blue' : 'Change theme to neon pink',
    },
  ];

  // Execute an approved action
  const executeActionConfirmed = (action: AppAction) => {
    setActivePendingAction(null);

    // Call execution callback
    if (action.type === 'start_breathing') {
      if (onOpenBreathing) {
        onOpenBreathing();
      }
    } else if (onExecuteAction) {
      onExecuteAction(action);
    }

    // Add confirmation message
    const confirmText = getActionSuccessMessage(action, lang);
    const confirmMsg: ChatMessage = {
      id: `act_${Date.now()}`,
      role: 'assistant',
      content: confirmText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, confirmMsg]);

    // On mobile, shrink to floating bubble so user can view screen
    if (window.innerWidth < 1024) {
      setIsMinimizedBubble(true);
    }
  };

  // Cancel a pending action
  const cancelActionConfirmed = () => {
    setActivePendingAction(null);
    const cancelMsg: ChatMessage = {
      id: `canc_${Date.now()}`,
      role: 'assistant',
      content: getActionCancelMessage(lang),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, cancelMsg]);
  };

  // Main Send Handler
  const handleSend = async (textToSend?: string) => {
    const rawQuery = (textToSend || input).trim();
    if (!rawQuery) return;

    if (!textToSend) setInput('');

    // Append user message
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: rawQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Check if user is answering a pending Yes/No action
    if (activePendingAction) {
      if (isUserAffirmative(rawQuery)) {
        executeActionConfirmed(activePendingAction);
        return;
      }
      if (isUserNegative(rawQuery)) {
        cancelActionConfirmed();
        return;
      }
    }

    // PART 3: FIXED SAFETY CHECK FIRST (NO AI)
    const dangerCheck = checkFixedDangerKeywords(rawQuery);
    if (dangerCheck.isDanger) {
      const dangerReplies: Record<'en' | 'ta' | 'hi', string> = {
        en: 'Sister, this needs medical attention right away. Please do not wait.',
        ta: 'அம்மா, இதற்கு உடனடியாக மருத்துவ கவனிப்பு தேவை. தயவுசெய்து தாமதிக்காதீர்கள்.',
        hi: 'दीदी, इस पर तुरंत डॉक्टर का ध्यान जरूरी है। कृपया बिल्कुल भी देर न करें।',
      };

      const dangerMsg: ChatMessage = {
        id: `dang_${Date.now()}`,
        role: 'assistant',
        content: dangerReplies[lang] || dangerReplies.en,
        dangerAlert: {
          reason: dangerCheck.dangerReason,
          doctorPhone,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, dangerMsg]);
      return;
    }

    // PART 4: LOCAL COMMAND DETECTION BEFORE AI
    const localAction = parseLocalCommand(rawQuery);
    if (localAction) {
      if (localAction.isEmergencyImmediate) {
        // Immediate emergency calls bypass Yes/No
        if (onExecuteAction) onExecuteAction(localAction);
        return;
      }

      // Prompt Yes/No confirmation
      setActivePendingAction(localAction);
      const questionText = getConfirmationPrompt(localAction, lang);
      const promptMsg: ChatMessage = {
        id: `ask_${Date.now()}`,
        role: 'assistant',
        content: questionText,
        pendingAction: localAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, promptMsg]);
      return;
    }

    // PART 2: GROUNDED GEMINI AI CALL
    setIsLoading(true);

    try {
      const patientContext = buildRelevantContext({
        profile,
        currentWeek: pregnancyWeek,
        recentCheckins,
        recentSymptoms,
        medications,
        appointments,
        queryText: rawQuery,
      });

      // Pass mother name & baby nickname for mom-style personality
      const enrichedContext = {
        ...patientContext,
        motherName,
        babyNickname,
      };

      const conversationHistory = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await requestContextualChat({
        message: rawQuery,
        conversationHistory,
        pregnancyWeek,
        patientContext: enrichedContext,
        language: lang,
      });

      // Check if AI suggested an action
      let actionToPropose: AppAction | null = null;
      if (res.action && typeof res.action.type === 'string') {
        actionToPropose = {
          type: res.action.type as AppActionType,
          descriptionEn: res.action.descriptionEn || 'App action',
          descriptionTa: res.action.descriptionTa || 'செயல்',
          descriptionHi: res.action.descriptionHi || 'कार्य',
          payload: res.action.payload,
        };
      }

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        sourceIds: res.sourceIds,
        uncertain: res.uncertain,
        urgent: res.urgent,
        followUps: res.followUps,
        pendingAction: actionToPropose,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (actionToPropose) {
        setActivePendingAction(actionToPropose);
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackReplies: Record<'en' | 'ta' | 'hi', string> = {
        en: "I'm having trouble answering right now. Please try again. If you feel unwell, call your doctor.",
        ta: 'பதில் அளிப்பதில் சிறிது தாமதம் ஏற்படுகிறது. தயவுசெய்து மீண்டும் முயற்சிக்கவும். உங்களுக்கு உடல்நலக்குறைவு ஏற்பட்டால் உடனே மருத்துவரை அழைக்கவும்.',
        hi: 'मुझे अभी जवाब देने में परेशानी हो रही है। कृपया पुनः प्रयास करें। यदि आप अस्वस्थ महसूस कर रही हैं, तो अपने डॉक्टर को कॉल करें।',
      };

      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: fallbackReplies[lang] || fallbackReplies.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    localStorage.removeItem(storageKey);
    const welcomeByLang: Record<'en' | 'ta' | 'hi', string> = {
      en: `Hello dear ${motherName}, how can I help you and ${babyNickname} right now?`,
      ta: `வணக்கம் ${motherName}, உங்களுக்கும் ${babyNickname}-க்கும் நான் இப்போது எப்படி உதவட்டும்?`,
      hi: `नमस्ते ${motherName}, मैं अभी आपकी और ${babyNickname} की कैसे मदद करूँ?`,
    };
    setMessages([
      {
        id: `welc_${Date.now()}`,
        role: 'assistant',
        content: welcomeByLang[lang] || welcomeByLang.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Minimized floating bubble on mobile
  if (isMinimizedBubble) {
    return (
      <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 animate-in zoom-in-95">
        <button
          onClick={() => setIsMinimizedBubble(false)}
          className="h-14 px-4 rounded-full bg-[var(--mc-surface)] border-2 border-[var(--mc-primary)] text-[var(--mc-text-primary)] shadow-[var(--mc-glow)] flex items-center gap-2.5 font-bold text-xs cursor-pointer active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--mc-btn-gradient)] flex items-center justify-center text-white ai-thinking-pulse">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span>Buddy AI</span>
          <Maximize2 className="w-4 h-4 text-[var(--mc-primary)]" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        onClick={onClose}
      />

      {/* Main Container: Right Docked Panel on Desktop, Full Modal on Mobile */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full lg:w-[440px] bg-[var(--mc-surface)] border-l border-[var(--mc-card-border)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Top Header */}
        <div className="p-3.5 bg-[var(--mc-card)] border-b border-[var(--mc-card-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Warm Avatar with pulsing neon halo */}
            <div className="relative w-10 h-10 rounded-2xl bg-[var(--mc-btn-gradient)] flex items-center justify-center text-white shadow-md ai-thinking-pulse">
              <Heart className="w-5 h-5 fill-white stroke-[1.5]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--mc-card)]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[var(--mc-text-primary)]">
                  Buddy
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--mc-chip-bg)] text-[var(--mc-primary)] border border-[var(--mc-chip-border)]">
                  MomCare AI · Wk {pregnancyWeek}
                </span>
              </div>
              <p className="text-[11px] text-[var(--mc-text-secondary)]">
                {lang === 'ta' ? 'அன்பான வழிகாட்டி & உதவியாளர்' : lang === 'hi' ? 'आपकी स्नेही साथी और गाइड' : 'Your maternal companion & guide'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChatHistory}
              title="Clear conversation"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)] hover:bg-[var(--mc-surface)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimizedBubble(true)}
              title="Minimize chat"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)] hover:bg-[var(--mc-surface)] transition-colors cursor-pointer lg:hidden"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close chat"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)] hover:bg-[var(--mc-surface)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 cyber-grid-pattern">
          {/* Example Action Chips on first screen */}
          {messages.length <= 2 && (
            <div className="p-3 rounded-2xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--mc-text-primary)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--mc-primary)]" />
                <span>
                  {lang === 'ta' ? 'Buddy என்ன செய்யும்?' : lang === 'hi' ? 'Buddy क्या कर सकता है?' : 'What Buddy can do:'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--mc-text-secondary)]">
                {lang === 'ta'
                  ? 'பகுதிகளைத் திறக்க அல்லது சந்தேகங்களைக் கேட்க கீழே தட்டவும்:'
                  : lang === 'hi'
                  ? 'ऐप कंट्रोल करने या सवाल पूछने के लिए टैप करें:'
                  : 'Tap any example to control the app or ask a question:'}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {exampleChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(chip.prompt)}
                    className="px-3 py-1.5 rounded-xl text-xs bg-[var(--mc-surface)] border border-[var(--mc-card-border)] hover:border-[var(--mc-primary)] hover:bg-[var(--mc-surface-elevated)] text-[var(--mc-text-primary)] font-medium transition-all text-left shadow-2xs cursor-pointer active:scale-95"
                  >
                    {lang === 'ta' ? chip.labelTa : lang === 'hi' ? chip.labelHi : chip.labelEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Loop */}
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[var(--mc-btn-gradient)] text-white rounded-br-xs shadow-md'
                      : 'bg-[var(--mc-card)] text-[var(--mc-text-primary)] border border-[var(--mc-card-border)] rounded-bl-xs shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>

                  {/* Red Emergency Card (Fixed Safety Trigger - Call Family or 108 Prompt) */}
                  {m.dangerAlert && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-red-950/85 border-2 border-red-500 text-white space-y-3 font-sans shadow-xl">
                      <div className="flex items-center gap-2 text-red-300 font-bold text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>
                          {lang === 'ta' ? 'அவசர மருத்துவ உதவி தேவை' : lang === 'hi' ? 'आपातकालीन चिकित्सा सहायता' : 'Immediate Medical Attention'}
                        </span>
                      </div>

                      <p className="text-xs text-red-100 font-semibold leading-relaxed">
                        {lang === 'ta'
                          ? 'அவசர நடவடிக்கை: இப்போது குடும்பத்தினர் அல்லது 108 ஆம்புலன்ஸை அழைக்க விரும்புகிறீர்களா?'
                          : lang === 'hi'
                          ? 'आपातकालीन कार्रवाई: क्या आप अभी परिवार के सदस्यों या 108 एम्बुलेंस को कॉल करना चाहते हैं?'
                          : 'Emergency Action: Would you like to call Family Members or 108 Ambulance right now?'}
                      </p>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        <a
                          href="tel:108"
                          className="min-h-[48px] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
                        >
                          <PhoneCall className="w-4 h-4" />
                          <span>
                            {lang === 'ta' ? 'ஆம், 108 அழைக்கவும் (ஆம்புலன்ஸ்)' : lang === 'hi' ? 'हाँ, 108 पर कॉल करें (एम्बुलेंस)' : 'Yes, Call 108 (Ambulance)'}
                          </span>
                        </a>

                        {profile?.familyContactPhone && (
                          <a
                            href={`tel:${profile.familyContactPhone}`}
                            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
                          >
                            <Phone className="w-4 h-4" />
                            <span>
                              {lang === 'ta' ? 'ஆம், குடும்பத்தினரை அழைக்கவும்' : lang === 'hi' ? 'हाँ, परिवार के सदस्य को कॉल करें' : 'Yes, Call Family'} ({profile.familyContactName || 'Family'})
                            </span>
                          </a>
                        )}

                        {m.dangerAlert.doctorPhone && m.dangerAlert.doctorPhone !== '108' && (
                          <a
                            href={`tel:${m.dangerAlert.doctorPhone}`}
                            className="min-h-[42px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>
                              {lang === 'ta' ? 'மருத்துவரை அழைக்கவும்' : lang === 'hi' ? 'डॉक्टर को कॉल करें' : 'Call Doctor'} ({m.dangerAlert.doctorPhone})
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Yes/No Action Confirmation Card */}
                  {m.pendingAction && activePendingAction && activePendingAction.type === m.pendingAction.type && (
                    <div className="mt-3 p-3 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-primary)] space-y-2.5">
                      <p className="text-xs font-semibold text-[var(--mc-text-primary)]">
                        {getConfirmationPrompt(m.pendingAction, lang)}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => executeActionConfirmed(m.pendingAction!)}
                          className="min-h-[48px] px-3 py-2 rounded-xl cyber-gradient-btn text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-transform"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {lang === 'ta' ? 'ஆமாம், திறக்கவும்' : lang === 'hi' ? 'हाँ, बिल्कुल' : 'Yes, please'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelActionConfirmed}
                          className="min-h-[48px] px-3 py-2 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] hover:bg-[var(--mc-surface-elevated)] text-[var(--mc-text-primary)] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                        >
                          <X className="w-4 h-4 text-rose-400" />
                          <span>
                            {lang === 'ta' ? 'வேண்டாம்' : lang === 'hi' ? 'नहीं, रहने दें' : 'No, thank you'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Grounded Source Chips */}
                  {!isUser && m.sourceIds && m.sourceIds.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[var(--mc-card-border)] flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--mc-text-secondary)]">
                      <BookOpen className="w-3 h-3 text-[var(--mc-primary)] shrink-0" />
                      <span>{lang === 'ta' ? 'ஆதாரங்கள்:' : lang === 'hi' ? 'स्रोत:' : 'Sources:'}</span>
                      {m.sourceIds.map((id) => {
                        const note = getKnowledgeNoteById(id);
                        return (
                          <span
                            key={id}
                            title={note?.topic || id}
                            className="px-2 py-0.5 rounded-md bg-[var(--mc-chip-bg)] text-[var(--mc-primary)] border border-[var(--mc-chip-border)] font-mono font-medium"
                          >
                            {id}: {note?.topic || 'Guidance'}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Follow-up Tappable Suggestion Buttons */}
                {!isUser && m.followUps && m.followUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-1 max-w-[90%]">
                    {m.followUps.map((fu, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(fu)}
                        className="px-3 py-1.5 rounded-full text-xs bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] hover:border-[var(--mc-primary)] text-[var(--mc-text-primary)] font-medium transition-all text-left shadow-2xs cursor-pointer active:scale-95"
                      >
                        💬 {fu}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-[var(--mc-text-secondary)] px-1 font-mono">
                  {m.timestamp}
                </span>
              </div>
            );
          })}

          {/* MomCare is thinking pulse animation */}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="bg-[var(--mc-card)] border border-[var(--mc-card-border)] rounded-2xl rounded-bl-xs px-4 py-3 shadow-md ai-thinking-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--mc-primary)] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[var(--mc-primary)] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--mc-primary)] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-[var(--mc-text-primary)] ml-1 font-medium">
                    {lang === 'ta' ? 'MomCare யோசிக்கிறது...' : lang === 'hi' ? 'MomCare सोच रही है...' : 'MomCare is thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[var(--mc-surface)] border-t border-[var(--mc-card-border)] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                lang === 'ta'
                  ? 'கேளுங்கள்: "குழந்தை வளர்ச்சியைத் திற", "சுவாசப் பயிற்சி"...'
                  : lang === 'hi'
                  ? 'पूछें: "शिशु विकास खोलो", "सांस अभ्यास"...'
                  : 'Ask MomCare or say "open baby development"...'
              }
              className="flex-1 min-h-[48px] bg-[var(--mc-card)] border border-[var(--mc-card-border)] rounded-2xl px-4 py-2.5 text-sm text-[var(--mc-text-primary)] placeholder-[var(--mc-text-secondary)] focus:outline-hidden focus:border-[var(--mc-primary)] focus:shadow-[var(--mc-glow)] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-2xl cyber-gradient-btn text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer shadow-md"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Safety Disclaimer (Mandatory) */}
          <p className="mt-2 text-[10px] text-center text-[var(--mc-text-secondary)] leading-tight font-sans">
            {lang === 'ta'
              ? 'MomCare தகவல்களையும் ஆரம்ப எச்சரிக்கைகளையும் மட்டுமே வழங்குகிறது. நோய் கண்டறிதல் அல்ல. அவசரநிலையில் 108 அல்லது உங்கள் மருத்துவரை உடனே அழைக்கவும்.'
              : lang === 'hi'
              ? 'MomCare केवल जानकारी और प्रारंभिक चेतावनी देता है, निदान नहीं। आपात स्थिति में 108 या अपने डॉक्टर को तुरंत कॉल करें।'
              : 'MomCare gives information and early warnings. It does not diagnose. In an emergency, call 108 or your doctor immediately.'}
          </p>
        </div>
      </div>
    </>
  );
};
