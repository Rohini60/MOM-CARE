import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, AlertCircle, BookOpen, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
import { requestContextualChat } from '../services/ai/client';
import { buildRelevantContext } from '../services/context/contextRetriever';
import type { UserProfile, Checkin, SymptomRecord, Medication, Appointment, AiConversationMessage } from '../types';
import { RiskBadge } from './RiskBadge';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  pregnancyWeek: number;
  recentCheckins: Checkin[];
  recentSymptoms: SymptomRecord[];
  medications: Medication[];
  appointments: Appointment[];
  initialPrompt?: string;
  language?: 'en' | 'ta' | 'hi';
}

export const AiChatModal: React.FC<AiChatModalProps> = ({
  isOpen,
  onClose,
  profile,
  pregnancyWeek,
  recentCheckins,
  recentSymptoms,
  medications,
  appointments,
  initialPrompt,
  language = 'en',
}) => {
  const motherName = profile?.preferredName || profile?.displayName || 'there';

  const welcomeContent =
    language === 'ta'
      ? `வணக்கம் ${motherName} 💗 நான் மாம்கேர், உங்கள் கர்ப்ப கால துணை. நீங்கள் இப்போது கர்ப்பத்தின் ${pregnancyWeek}-வது வாரத்தில் இருக்கிறீர்கள். இன்று உங்களுக்கு நான் எப்படி உதவலாம்?`
      : language === 'hi'
      ? `नमस्ते ${motherName} 💗 मैं मॉमकेयर हूँ, आपकी गर्भावस्था साथी। आप अपनी गर्भावस्था के ${pregnancyWeek}वें हफ्ते में हैं। आज मैं आपकी क्या मदद कर सकती हूँ?`
      : `Hello ${motherName} 💗 I'm MomCare, your personal pregnancy companion. I'm aware you are in Week ${pregnancyWeek} of your pregnancy journey. How can I support you today?`;

  const [messages, setMessages] = useState<AiConversationMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: welcomeContent,
      riskLevel: 'green',
      sources: ['ACOG Guidelines', 'NHS Maternity Services'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInput(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: AiConversationMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build relevant context layer (does NOT dump entire DB)
      const patientContext = buildRelevantContext({
        profile,
        currentWeek: pregnancyWeek,
        recentCheckins,
        recentSymptoms,
        medications,
        appointments,
        queryText: text,
      });

      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await requestContextualChat({
        message: text,
        conversationHistory,
        pregnancyWeek,
        patientContext,
        language,
      });

      const assistantMsg: AiConversationMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        riskLevel: res.riskLevel,
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: AiConversationMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'I had a momentary connection hiccup. Remember, if you are experiencing severe pain, vaginal bleeding, or decreased fetal movement, please reach out directly to your obstetrician or maternity triage line.',
        riskLevel: 'yellow',
        sources: ['ACOG'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'Is mild cramping normal in Week 24?',
    'How do I count baby kicks today?',
    'What should I eat when experiencing heartburn?',
    'Can you explain my last check-in pattern?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-[#FCF8F6] rounded-2xl sm:rounded-3xl shadow-xl flex flex-col h-[90vh] max-h-[720px] overflow-hidden border border-[#E9DFDC]">
        {/* Header */}
        <div className="bg-[#FFFFFF] px-4 py-3.5 border-b border-[#E9DFDC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F2E1E3] flex items-center justify-center text-[#C98291]">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#352F35]">MomCare AI</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2E1E3] text-[#9F5F6E]">
                  Week {pregnancyWeek} Context
                </span>
              </div>
              <p className="text-[11px] text-[#766D72]">Context-aware maternal companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#766D72] hover:bg-[#F2E5E7] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer banner */}
        <div className="bg-[#FAF4E9] border-b border-[#E9DFDC] px-4 py-1.5 flex items-center gap-2 text-[11px] text-[#766D72]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D5A85C] shrink-0" />
          <span>Educational & supportive companion. Does not diagnose or replace your doctor.</span>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#F2E1E3] text-[#352F35] rounded-br-xs shadow-2xs'
                      : 'bg-[#FFFFFF] text-[#352F35] border border-[#E9DFDC] rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {!isUser && m.riskLevel && m.riskLevel !== 'none' && (
                    <div className="mb-2">
                      <RiskBadge level={m.riskLevel as 'green' | 'yellow' | 'red'} size="sm" />
                    </div>
                  )}

                  <p className="whitespace-pre-line">{m.content}</p>

                  {!isUser && m.sources && m.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#E9DFDC]/60 flex items-center gap-1.5 text-[11px] text-[#766D72]">
                      <BookOpen className="w-3 h-3 text-[#B7A6C9]" />
                      <span>Sources: {m.sources.join(', ')}</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#766D72] mt-1 px-1">{m.timestamp}</span>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="bg-[#FFFFFF] border border-[#E9DFDC] rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C98291] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#C98291] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#C98291] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-[#766D72] ml-1">Analyzing with your pregnancy context...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-[#E9DFDC] bg-[#FFFFFF]/80 overflow-x-auto flex gap-2 no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-3 py-1 rounded-full text-xs bg-[#F2E5E7] text-[#9F5F6E] hover:bg-[#F2E1E3] transition-colors border border-[#E9DFDC]"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <div className="p-3 bg-[#FFFFFF] border-t border-[#E9DFDC]">
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
              placeholder="Ask about symptoms, kick counts, baby growth..."
              className="flex-1 bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3.5 py-2.5 text-sm text-[#352F35] placeholder-[#766D72] focus:outline-hidden focus:border-[#C98291] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#9F5F6E] text-white flex items-center justify-center hover:bg-[#8C5361] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
