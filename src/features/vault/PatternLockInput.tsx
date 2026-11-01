import React, { useState, useRef, useEffect } from 'react';

interface PatternLockInputProps {
  onPatternComplete: (patternStr: string) => void;
  disabled?: boolean;
}

export const PatternLockInput: React.FC<PatternLockInputProps> = ({
  onPatternComplete,
  disabled = false,
}) => {
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3x3 grid dots: indices 0 to 8
  const dots = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  const handleDotTouch = (dotIdx: number) => {
    if (disabled) return;
    if (!selectedDots.includes(dotIdx)) {
      const next = [...selectedDots, dotIdx];
      setSelectedDots(next);
      if (next.length >= 4) {
        onPatternComplete(next.join('-'));
      }
    }
  };

  const handleStart = (dotIdx: number) => {
    if (disabled) return;
    setIsDrawing(true);
    setSelectedDots([dotIdx]);
  };

  const handleEnter = (dotIdx: number) => {
    if (disabled || !isDrawing) return;
    if (!selectedDots.includes(dotIdx)) {
      const next = [...selectedDots, dotIdx];
      setSelectedDots(next);
      if (next.length >= 4) {
        onPatternComplete(next.join('-'));
      }
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    setSelectedDots([]);
    setIsDrawing(false);
    onPatternComplete('');
  };

  useEffect(() => {
    const handleUp = () => setIsDrawing(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-3 select-none">
      <div
        ref={containerRef}
        className="w-64 h-64 p-4 rounded-3xl bg-[var(--mc-surface)] border-2 border-[var(--mc-card-border)] grid grid-cols-3 gap-4 items-center justify-center relative touch-none shadow-inner"
        onMouseLeave={handleEnd}
      >
        {dots.map((idx) => {
          const isSelected = selectedDots.includes(idx);
          const order = selectedDots.indexOf(idx) + 1;

          return (
            <div
              key={idx}
              onMouseDown={() => handleStart(idx)}
              onMouseEnter={() => handleEnter(idx)}
              onTouchStart={() => handleDotTouch(idx)}
              className="flex items-center justify-center w-full h-full cursor-pointer p-2"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[var(--mc-primary)] text-white font-black text-sm scale-110 shadow-[0_0_15px_var(--mc-primary)] ring-4 ring-[var(--mc-primary)]/30'
                    : 'bg-[var(--mc-chip-bg)] border-2 border-[var(--mc-card-border)] hover:border-[var(--mc-primary)]/60 text-transparent'
                }`}
              >
                {isSelected ? (
                  <span className="font-mono text-xs font-bold">{order}</span>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-[var(--mc-text-secondary)]/50" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between w-64 px-1 text-xs">
        <span className="text-[var(--mc-text-secondary)] font-mono">
          {selectedDots.length < 4
            ? `Connect at least 4 dots (${selectedDots.length}/4)`
            : `Pattern ready (${selectedDots.length} dots connected)`}
        </span>
        {selectedDots.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[var(--mc-primary)] font-bold hover:underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
