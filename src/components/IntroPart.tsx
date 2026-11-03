import React from 'react';
import { SunflowerSvg, TulipSvg, CarnationSvg } from './FloralBackground.tsx';
import { ArrowRight, Sparkles } from 'lucide-react';

interface IntroPartProps {
  onContinue: () => void;
}

export const IntroPart: React.FC<IntroPartProps> = ({ onContinue }) => {
  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-slide-in">
      <div className="relative bg-gradient-to-b from-white/95 via-white/90 to-amber-50/80 backdrop-blur-md rounded-3xl p-6 sm:p-12 border-2 border-amber-300/80 shadow-[0_15px_50px_-5px_rgba(245,158,11,0.2)] overflow-hidden">
        {/* Decorative corner flowers with soft bloom */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 opacity-30 pointer-events-none animate-sway">
          <SunflowerSvg className="w-36 h-36" />
        </div>
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 opacity-30 pointer-events-none">
          <TulipSvg className="w-32 h-32" color="#E11D48" />
        </div>

        {/* Header Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold mb-4 border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>PART II</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 tracking-tight mb-6">
          Hello, Pumpkin. <span className="inline-block text-amber-500 animate-sway">🌻</span>
        </h1>

        {/* Message exactly as requested */}
        <div className="space-y-4 text-amber-950/90 text-base sm:text-lg leading-relaxed font-medium">
          <p className="text-amber-800 font-semibold">
            This is a private space made just for you.
          </p>

          <p>
            We haven&apos;t been able to catch up or talk in a long time, so I created this to check in on you. I don&apos;t mean to interrupt your day, but I would really appreciate a moment of your time. I hope you had a blessed Sunday, too.
          </p>
        </div>

        {/* Flower transition line */}
        <div className="my-8 flex items-center justify-center gap-3 opacity-60">
          <TulipSvg className="w-5 h-5" color="#E11D48" />
          <span className="w-12 h-0.5 bg-amber-300 rounded-full" />
          <SunflowerSvg className="w-6 h-6" />
          <span className="w-12 h-0.5 bg-amber-300 rounded-full" />
          <CarnationSvg className="w-5 h-5" color="#FB7185" />
        </div>

        {/* Call to action */}
        <div className="flex justify-end">
          <button
            onClick={onContinue}
            className="w-full sm:w-auto py-3.5 px-8 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
