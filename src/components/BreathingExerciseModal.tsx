import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Wind, Heart, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../translations';

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const BreathingExerciseModal: React.FC<BreathingExerciseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme, colorMode } = useTheme();
  const { language } = useTranslation();
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const isPink = theme === 'neon-pink';

  // Play a soft calming chime on phase transition if sound is enabled
  const playCalmTone = (freq: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      const ctx = audioContextRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch {
      // Audio not permitted or supported
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setPhase('inhale');
      setSecondsLeft(4);
      setCycleCount(1);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Advance phase
        setPhase((currPhase) => {
          if (currPhase === 'inhale') {
            playCalmTone(392.0); // G4
            return 'hold';
          } else if (currPhase === 'hold') {
            playCalmTone(329.63); // E4
            return 'exhale';
          } else {
            setCycleCount((c) => c + 1);
            playCalmTone(261.63); // C4
            return 'inhale';
          }
        });

        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  const phaseDetails = {
    inhale: {
      textEn: 'Inhale gently...',
      textTa: 'மெதுவாக மூச்சை உள்ளே இழுக்கவும்...',
      textHi: 'धीरे-धीरे गहरी सांस लें...',
      subEn: 'Breathe in peace and fresh oxygen for your baby',
      subTa: 'குழந்தைக்கான புதிய பிராணவாயுவை சுவாசிக்கவும்',
      subHi: 'अपने और शिशु के लिए शांत ऊर्जा ग्रहण करें',
      scale: 'scale-125',
      glow: isPink ? '0 0 50px rgba(255, 62, 165, 0.5)' : '0 0 50px rgba(0, 212, 255, 0.5)',
    },
    hold: {
      textEn: 'Hold gently...',
      textTa: 'மென்மையாக மூச்சை அடக்கவும்...',
      textHi: 'सांस को आराम से रोकें...',
      subEn: 'Feel your shoulders soften and heart settle',
      subTa: 'உங்கள் உடல் தளர்வடைவதை உணருங்கள்',
      subHi: 'कंधों को ढीला छोड़ें और शांति महसूस करें',
      scale: 'scale-125',
      glow: isPink ? '0 0 60px rgba(193, 60, 255, 0.6)' : '0 0 60px rgba(47, 107, 255, 0.6)',
    },
    exhale: {
      textEn: 'Exhale slowly...',
      textTa: 'மெதுவாக மூச்சை வெளியே விடவும்...',
      textHi: 'धीरे-धीरे सांस छोड़ें...',
      subEn: 'Release all tension, tiredness, and worry',
      subTa: 'அனைத்து சோர்வையும் மெதுவாக வெளியேற்றுங்கள்',
      subHi: 'सारा तनाव और थकान बाहर निकाल दें',
      scale: 'scale-90',
      glow: isPink ? '0 0 25px rgba(255, 62, 165, 0.3)' : '0 0 25px rgba(0, 212, 255, 0.3)',
    },
  }[phase];

  const currentTitle =
    language === 'ta'
      ? phaseDetails.textTa
      : language === 'hi'
      ? phaseDetails.textHi
      : phaseDetails.textEn;

  const currentSub =
    language === 'ta'
      ? phaseDetails.subTa
      : language === 'hi'
      ? phaseDetails.subHi
      : phaseDetails.subEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[var(--mc-surface)] border border-[var(--mc-card-border)] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] text-[var(--mc-primary)]">
              <Wind className="w-4 h-4" />
            </span>
            <div className="text-left">
              <h3 className="text-sm font-bold text-[var(--mc-text-primary)]">
                {language === 'ta'
                  ? 'சுவாசப் பயிற்சி'
                  : language === 'hi'
                  ? 'शांत श्वास अभ्यास'
                  : 'Guided Breathing'}
              </h3>
              <p className="text-[11px] text-[var(--mc-text-secondary)]">
                {language === 'ta'
                  ? `சுற்று ${cycleCount} (4-4-4 முறை)`
                  : language === 'hi'
                  ? `चक्र ${cycleCount} (4-4-4 तकनीक)`
                  : `Cycle ${cycleCount} · 4-4-4 Rhythm`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-[var(--mc-text-secondary)] hover:text-[var(--mc-primary)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title={soundEnabled ? 'Mute tone' : 'Enable calming tone'}
              aria-label="Toggle tone"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-[var(--mc-text-secondary)] hover:text-[var(--mc-text-primary)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Animated Breathing Circle */}
        <div className="my-8 relative w-56 h-56 flex items-center justify-center">
          {/* Outer halo */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-[3800ms] ease-in-out border border-[var(--mc-primary)]/40 ${phaseDetails.scale}`}
            style={{
              boxShadow: phaseDetails.glow,
              background: `radial-gradient(circle, var(--mc-primary) 0%, transparent 70%)`,
              opacity: phase === 'exhale' ? 0.2 : 0.45,
            }}
          />

          {/* Inner core circle */}
          <div
            className={`relative z-10 w-40 h-40 rounded-full bg-[var(--mc-card)] border-2 border-[var(--mc-primary)] flex flex-col items-center justify-center p-4 transition-transform duration-[3800ms] ease-in-out shadow-xl ${phaseDetails.scale}`}
          >
            <Heart
              className="w-6 h-6 text-[var(--mc-primary)] mb-1 transition-transform duration-1000"
              style={{
                transform: phase === 'inhale' ? 'scale(1.2)' : 'scale(1)',
              }}
            />
            <span className="text-3xl font-extrabold text-[var(--mc-text-primary)] font-mono">
              {secondsLeft}s
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--mc-primary)] mt-1">
              {phase}
            </span>
          </div>
        </div>

        {/* Phase instructions */}
        <div className="space-y-1 mb-6 px-4 min-h-[58px]">
          <h4 className="text-base font-bold text-[var(--mc-text-primary)] transition-all">
            {currentTitle}
          </h4>
          <p className="text-xs text-[var(--mc-text-secondary)] leading-relaxed">
            {currentSub}
          </p>
        </div>

        {/* Grounded comfort advice */}
        <div className="w-full p-3 rounded-2xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] mb-5 text-left flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[var(--mc-primary)] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[var(--mc-text-secondary)] leading-snug">
            {language === 'ta'
              ? '4 வினாடிகள் உள்ளிழுத்து, 4 வினாடிகள் நிறுத்தி, 4 வினாடிகள் வெளியிடுவது இரத்த அழுத்தத்தைக் கட்டுப்படுத்தி தாய்க்கும் சேய்க்கும் அமைதியைத் தருகிறது.'
              : language === 'hi'
              ? '4 सेकंड सांस लेना, 4 सेकंड रोकना और 4 सेकंड छोड़ना रक्तचाप को संतुलित करता है और शिशु तक भरपूर ऑक्सीजन पहुंचाता है।'
              : 'The 4-4-4 rhythm calms your nervous system, stabilizes heart rate, and supports optimal maternal-fetal oxygen flow.'}
          </p>
        </div>

        {/* Close / Done Button (at least 48px) */}
        <button
          onClick={onClose}
          className="w-full min-h-[48px] py-3 rounded-2xl cyber-gradient-btn text-white font-bold text-sm tracking-wide shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          {language === 'ta'
            ? 'பயிற்சியை முடிக்கவும்'
            : language === 'hi'
            ? 'अभ्यास पूरा करें'
            : 'Done / Finish Exercise'}
        </button>
      </div>
    </div>
  );
};
