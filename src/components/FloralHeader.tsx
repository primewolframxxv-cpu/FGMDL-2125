import React from 'react';
import { StepId } from '../types/index.ts';
import { Volume2, VolumeX } from 'lucide-react';

interface FloralHeaderProps {
  currentStep: StepId;
  unlockedSteps: Set<StepId>;
  onSelectStep: (step: StepId) => void;
  isAudioMuted: boolean;
  onToggleMute: () => void;
}

export const FloralHeader: React.FC<FloralHeaderProps> = ({
  currentStep,
  unlockedSteps,
  onSelectStep,
  isAudioMuted,
  onToggleMute,
}) => {
  const navItems: { id: StepId; label: string }[] = [
    { id: 'GATE', label: 'PART I' },
    { id: 'INTRO', label: 'PART II' },
    { id: 'QUESTIONS', label: 'PART III' },
    { id: 'COOKIES', label: 'PART IV' },
    { id: 'PUZZLE', label: 'PART V' },
  ];

  return (
    <header className="relative z-30 flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-8 py-3.5 border-b border-amber-200/50 bg-white/70 backdrop-blur-md">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-amber-950">
          For Pumpkin
        </span>
        <span className="text-amber-500 text-lg hidden sm:inline" aria-hidden="true">
          🌻
        </span>
      </div>

      {/* Zone 2: Navigation Links renamed cleanly to PART I .. PART V */}
      <nav className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto py-1 scrollbar-none">
        {navItems.map((item) => {
          const isUnlocked = unlockedSteps.has(item.id);
          const isActive = currentStep === item.id;

          return (
            <button
              key={item.id}
              onClick={() => isUnlocked && onSelectStep(item.id)}
              disabled={!isUnlocked}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 px-2 rounded ${
                isActive
                  ? 'text-amber-950 font-bold border-b-2 border-amber-700'
                  : isUnlocked
                  ? 'text-amber-800/80 hover:text-amber-950 hover:underline cursor-pointer'
                  : 'text-stone-400/60 cursor-not-allowed opacity-50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Audio Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap shrink-0 border ${
            !isAudioMuted
              ? 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200'
              : 'bg-white/80 text-stone-500 border-stone-200 hover:bg-stone-50'
          }`}
          title={isAudioMuted ? 'Turn Sound On' : 'Turn Sound Off'}
        >
          {!isAudioMuted ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Sound On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Muted</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
