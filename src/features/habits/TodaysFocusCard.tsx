import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Info,
  ChevronDown,
  ChevronUp,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import type { SelectedHabitItem } from '../../services/habits/banditEngine';
import { useTranslation } from '../../translations';

interface TodaysFocusCardProps {
  habits: SelectedHabitItem[];
  isColdStart: boolean;
  onToggleComplete: (habitId: string, current: boolean) => void;
  onFeedback: (habitId: string, feedback: 'helped' | 'not_for_me') => void;
  onOpenHowItLearns: () => void;
}

export const TodaysFocusCard: React.FC<TodaysFocusCardProps> = ({
  habits,
  isColdStart,
  onToggleComplete,
  onFeedback,
  onOpenHowItLearns,
}) => {
  const { language, t } = useTranslation();
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);

  const completedCount = habits.filter((h) => h.isCompleted).length;

  return (
    <div className="cyber-card rounded-3xl p-4 sm:p-5 shadow-[0_0_20px_rgba(255,26,117,0.14)] space-y-3.5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--mc-btn-gradient)] text-white flex items-center justify-center font-bold shadow-xs">
            <Brain className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-[var(--mc-text-primary)]">
                {t.todaysFocusTitle}
              </h2>
              {isColdStart && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--mc-chip-bg)] border border-[var(--mc-primary)]/40 text-[10px] font-mono text-[var(--mc-primary)] font-bold">
                  Learning You ✨
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--mc-text-secondary)]">
              {t.todaysFocusCount.replace('{completed}', String(completedCount))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenHowItLearns}
            className="text-[11px] font-mono font-semibold text-[var(--mc-primary)] hover:opacity-80 flex items-center gap-1 bg-[var(--mc-chip-bg)] px-2.5 py-1 rounded-xl border border-[var(--mc-card-border)] transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[var(--mc-primary)]" />
            <span>{language === 'ta' ? 'அறிவியல்' : language === 'hi' ? 'सीखने की विधि' : 'How it learns'}</span>
          </button>
          <span className="text-xs font-mono font-bold text-[#10E599] bg-[#0C241B] px-3 py-1 rounded-full border border-[#10E599]/40 shadow-[0_0_8px_rgba(16,229,153,0.3)]">
            {completedCount === 3 ? '3/3 Done 🌸' : `${completedCount}/3`}
          </span>
        </div>
      </div>

      {/* Habit items */}
      <div className="space-y-2.5">
        {habits.map((item) => {
          const habitText =
            language === 'ta'
              ? item.habit.textTa
              : language === 'hi'
              ? item.habit.textHi
              : item.habit.textEn;

          const benefitNote =
            language === 'ta'
              ? item.habit.benefitNoteTa
              : language === 'hi'
              ? item.habit.benefitNoteHi
              : item.habit.benefitNoteEn;

          const whyText =
            language === 'ta'
              ? item.whyThisHabitTa
              : language === 'hi'
              ? item.whyThisHabitHi
              : item.whyThisHabitEn;

          const isExpanded = expandedWhyId === item.habit.id;

          return (
            <div
              key={item.habit.id}
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all space-y-2 ${
                item.isCompleted
                  ? 'bg-[var(--mc-surface-elevated)]/70 border-[#10E599]/40'
                  : 'bg-[var(--mc-card)] border-[var(--mc-card-border)] hover:border-[var(--mc-primary)]/40 shadow-xs'
              }`}
            >
              {/* Task Row */}
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onToggleComplete(item.habit.id, item.isCompleted)}
                  className="flex items-start gap-2.5 flex-1 text-left cursor-pointer min-h-[44px]"
                >
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      item.isCompleted
                        ? 'bg-[#10E599] border-[#10E599] text-[#0A1A12] shadow-[0_0_6px_#10E599]'
                        : 'border-[var(--mc-card-border)] bg-[var(--mc-chip-bg)] hover:border-[var(--mc-primary)]'
                    }`}
                  >
                    {item.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-semibold leading-snug ${
                        item.isCompleted
                          ? 'line-through text-[var(--mc-text-secondary)]'
                          : 'text-[var(--mc-text-primary)]'
                      }`}
                    >
                      {habitText}
                    </p>
                    <p className="text-[11px] text-[var(--mc-text-secondary)]">{benefitNote}</p>
                  </div>
                </button>

                {/* Feedback Buttons */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onFeedback(item.habit.id, 'helped')}
                    title="This helped"
                    className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                      item.userFeedback === 'helped'
                        ? 'bg-[var(--mc-primary)] text-white border-[var(--mc-primary)] shadow-xs'
                        : 'bg-[var(--mc-surface)] border-[var(--mc-card-border)] text-[var(--mc-text-secondary)] hover:text-[var(--mc-primary)]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onFeedback(item.habit.id, 'not_for_me')}
                    title="Not for me"
                    className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                      item.userFeedback === 'not_for_me'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                        : 'bg-[var(--mc-surface)] border-[var(--mc-card-border)] text-[var(--mc-text-secondary)] hover:text-amber-400'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chips and "Why this habit?" trigger */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.healthProfileChip && (
                    <span className="px-2 py-0.5 rounded-md bg-[var(--mc-chip-bg)] border border-[var(--mc-primary)]/40 text-[var(--mc-primary)] font-bold">
                      {item.healthProfileChip}
                    </span>
                  )}
                  <span className="text-[var(--mc-text-secondary)]">
                    {item.habit.doctorReviewNotice}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedWhyId(isExpanded ? null : item.habit.id)}
                  className="text-[var(--mc-primary)] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Why this habit?</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Expandable Why This Habit line */}
              {isExpanded && (
                <div className="p-2.5 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-secondary)] animate-in fade-in">
                  <p className="font-sans leading-relaxed">
                    💡 <strong className="text-[var(--mc-text-primary)]">Why MomCare selected this:</strong> {whyText}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {completedCount === 3 && (
        <p className="text-xs text-[#10E599] font-mono font-semibold text-center bg-[#0C241B] p-2.5 rounded-xl border border-[#10E599]/30">
          {t.allTasksDone}
        </p>
      )}
    </div>
  );
};
