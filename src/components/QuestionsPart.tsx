import React, { useState } from 'react';
import { CheckinAnswers } from '../types/index.ts';
import { SunflowerSvg, TulipSvg, CarnationSvg } from './FloralBackground.tsx';
import { playSuccessChime } from '../utils/audio.ts';
import { Heart, BookOpen, Gift, ArrowRight, Copy, CheckCircle2, Sparkles, MessageCircleHeart } from 'lucide-react';

interface QuestionsPartProps {
  answers: CheckinAnswers;
  onUpdateAnswers: (newAnswers: CheckinAnswers) => void;
  onContinue: () => void;
  isAudioMuted: boolean;
}

export const QuestionsPart: React.FC<QuestionsPartProps> = ({
  answers,
  onUpdateAnswers,
  onContinue,
  isAudioMuted,
}) => {
  const [formData, setFormData] = useState<CheckinAnswers>(answers);
  const [copied, setCopied] = useState(false);

  const handleScoreChange = (field: keyof CheckinAnswers, score: number) => {
    const updated = { ...formData, [field]: score };
    setFormData(updated);
    onUpdateAnswers(updated);
  };

  const handleTextChange = (field: keyof CheckinAnswers, text: string) => {
    const updated = { ...formData, [field]: text };
    setFormData(updated);
    onUpdateAnswers(updated);
  };

  const handleFinish = async () => {
    onUpdateAnswers(formData);

    // Save to server backend
    try {
      await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      });
    } catch {
      // Local storage fallback already handled
    }

    if (!isAudioMuted) {
      playSuccessChime();
    }
    onContinue();
  };

  const copySummaryToClipboard = () => {
    const summary = `🌻 Pumpkin's Check-in Summary:
1. How life's been treating me: ${formData.mood}/10
${formData.moodNote ? `"${formData.moodNote}"` : ''}

2. Academics: ${formData.academics}/10
${formData.academicsNote ? `"${formData.academicsNote}"` : ''}

3. Christmas excitement: ${formData.christmas}/10
${formData.christmasNote ? `"${formData.christmasNote}"` : ''}
Sent with warmth 💛`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getMoodDescriptor = (score: number) => {
    if (score <= 3) return 'Hanging in there through tough days';
    if (score <= 5) return 'Taking it day by day';
    if (score <= 7) return 'Steady, peaceful & doing okay';
    if (score <= 9) return 'Doing really well with lots of smiles';
    return 'Flourishing, radiant & full of joy!';
  };

  const getAcademicDescriptor = (score: number) => {
    if (score <= 3) return 'Heavy deadlines & feeling loaded';
    if (score <= 5) return 'Getting through the daily grind';
    if (score <= 7) return 'Managing tasks with good progress';
    if (score <= 9) return 'Productive, thriving & confident';
    return 'Acing everything with flying colors!';
  };

  const getChristmasDescriptor = (score: number) => {
    if (score <= 3) return 'Has not crossed my mind yet';
    if (score <= 5) return 'Starting to look forward to the break';
    if (score <= 7) return 'Excited for cozy lights & holiday rest';
    if (score <= 9) return 'Counting down the days with excitement!';
    return 'Full holiday cheer & carols all day!';
  };

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-slide-in">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <SunflowerSvg className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
            PART III
          </span>
          <TulipSvg className="w-5 h-5" color="#E11D48" />
        </div>
      </div>

      <div className="space-y-8">
        {/* Question 1: How's life been treating you so far? */}
        <div className="bg-gradient-to-b from-white/95 to-amber-50/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 shadow-[0_8px_30px_-5px_rgba(245,158,11,0.12)]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5 shadow-xs">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 tracking-wide uppercase">Question 1</span>
              <h3 className="text-lg sm:text-xl font-bold text-amber-950">
                On a scale of 1–10, how&apos;s life been treating you so far?
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 my-4">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
              const isSelected = formData.mood === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleScoreChange('mood', val)}
                  className={`py-3 rounded-xl font-mono text-sm sm:text-base font-bold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md scale-105 ring-2 ring-rose-300'
                      : 'bg-white/80 hover:bg-amber-100/90 text-stone-700 border border-amber-200/70'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1 mb-4">
            <span>1</span>
            <span className="text-rose-600 font-bold">{getMoodDescriptor(formData.mood)}</span>
            <span>10</span>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-amber-950 mb-1.5 flex items-center gap-1.5">
              <MessageCircleHeart className="w-3.5 h-3.5 text-rose-500" />
              <span>Add a comment / chika about how life has been treating you lately:</span>
            </label>
            <textarea
              rows={2}
              value={formData.moodNote}
              onChange={(e) => handleTextChange('moodNote', e.target.value)}
              placeholder="Chika time: tell me how things have been..."
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-amber-200/80 text-amber-950 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Question 2: How have you been doing in terms of academics? */}
        <div className="bg-gradient-to-b from-white/95 to-amber-50/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 shadow-[0_8px_30px_-5px_rgba(245,158,11,0.12)]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 tracking-wide uppercase">Question 2</span>
              <h3 className="text-lg sm:text-xl font-bold text-amber-950">
                On a scale of 1–10, how have you been doing in terms of academics?
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 my-4">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
              const isSelected = formData.academics === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleScoreChange('academics', val)}
                  className={`py-3 rounded-xl font-mono text-sm sm:text-base font-bold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md scale-105 ring-2 ring-amber-300'
                      : 'bg-white/80 hover:bg-amber-100/90 text-stone-700 border border-amber-200/70'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1 mb-4">
            <span>1</span>
            <span className="text-amber-800 font-bold">{getAcademicDescriptor(formData.academics)}</span>
            <span>10</span>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-amber-950 mb-1.5 flex items-center gap-1.5">
              <MessageCircleHeart className="w-3.5 h-3.5 text-amber-600" />
              <span>Add a comment / chika about your studies, exams, or clinicals:</span>
            </label>
            <textarea
              rows={2}
              value={formData.academicsNote}
              onChange={(e) => handleTextChange('academicsNote', e.target.value)}
              placeholder="How are classes and study sessions going?..."
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-amber-200/80 text-amber-950 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Question 3: How much do you think are you excited for Christmas season? */}
        <div className="bg-gradient-to-b from-white/95 to-amber-50/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 shadow-[0_8px_30px_-5px_rgba(245,158,11,0.12)]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 tracking-wide uppercase">Question 3</span>
              <h3 className="text-lg sm:text-xl font-bold text-amber-950">
                On a scale of 1–10, how much do you think are you excited for Christmas season?
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 my-4">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
              const isSelected = formData.christmas === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleScoreChange('christmas', val)}
                  className={`py-3 rounded-xl font-mono text-sm sm:text-base font-bold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md scale-105 ring-2 ring-emerald-300'
                      : 'bg-white/80 hover:bg-amber-100/90 text-stone-700 border border-amber-200/70'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1 mb-4">
            <span>1</span>
            <span className="text-emerald-700 font-bold">{getChristmasDescriptor(formData.christmas)}</span>
            <span>10</span>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-amber-950 mb-1.5 flex items-center gap-1.5">
              <MessageCircleHeart className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add a comment / chika about your Christmas mood or holiday plans:</span>
            </label>
            <textarea
              rows={2}
              value={formData.christmasNote}
              onChange={(e) => handleTextChange('christmasNote', e.target.value)}
              placeholder="Any holiday break thoughts or wishes?..."
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-amber-200/80 text-amber-950 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-100/70 p-4 sm:p-5 rounded-3xl border border-amber-200/80">
        <button
          type="button"
          onClick={copySummaryToClipboard}
          className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-white hover:bg-amber-50 px-4 py-3 rounded-2xl border border-amber-300 shadow-xs transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Summary Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-amber-700" />
              <span>Copy Answers / Chika</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleFinish}
          className="w-full sm:w-auto py-3.5 px-8 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
