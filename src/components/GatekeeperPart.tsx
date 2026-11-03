import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { SunflowerSvg, TulipSvg, CarnationSvg } from './FloralBackground.tsx';
import { playSuccessChime } from '../utils/audio.ts';
import { ArrowRight, Lock, Sparkles, KeyRound, RefreshCw, Trash2, Heart, Calendar, BookOpen, Gift, Smile } from 'lucide-react';

interface StoredResponse {
  id?: string;
  createdAt?: string;
  mood: number;
  moodNote: string;
  academics: number;
  academicsNote: string;
  christmas: number;
  christmasNote: string;
  cookiesCracked?: number;
  puzzleSolved?: boolean;
}

interface GatekeeperPartProps {
  onUnlock: () => void;
  isAudioMuted: boolean;
}

export const GatekeeperPart: React.FC<GatekeeperPartProps> = ({ onUnlock, isAudioMuted }) => {
  const [inputName, setInputName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fred's Secret Dashboard states
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isFredDashboardOpen, setIsFredDashboardOpen] = useState(false);
  const [responsesList, setResponsesList] = useState<StoredResponse[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  const fetchResponses = async () => {
    setIsLoadingResponses(true);
    let combined: StoredResponse[] = [];

    try {
      const res = await fetch('/api/responses');
      if (res.ok) {
        const serverData = await res.json();
        if (Array.isArray(serverData)) {
          combined = serverData;
        }
      }
    } catch {}

    try {
      const localAnswersStr = localStorage.getItem('pumpkin_checkin_answers');
      if (localAnswersStr) {
        const local = JSON.parse(localAnswersStr);
        if (local && (local.moodNote || local.academicsNote || local.christmasNote || combined.length === 0)) {
          const isDuplicate = combined.some(
            (c) => c.mood === local.mood && c.moodNote === local.moodNote && c.academics === local.academics
          );
          if (!isDuplicate) {
            combined.push({
              id: 'local-session',
              createdAt: new Date().toISOString(),
              ...local,
            });
          }
        }
      }
    } catch {}

    setResponsesList(combined);
    setIsLoadingResponses(false);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === 'fred123') {
      setShowPasscodeModal(false);
      setIsFredDashboardOpen(true);
      setPasscodeError('');
      setPasscodeInput('');
      fetchResponses();
      if (!isAudioMuted) playSuccessChime();
    } else {
      setPasscodeError('Incorrect passcode.');
    }
  };

  const handleClearResponses = async () => {
    if (window.confirm('Clear all recorded responses? This will reset the responses list.')) {
      try {
        await fetch('/api/responses', { method: 'DELETE' });
      } catch {}
      localStorage.removeItem('pumpkin_checkin_answers');
      setResponsesList([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputName.trim().toLowerCase();

    if (!clean) {
      setErrorMessage('Please enter the name to continue.');
      return;
    }

    if (clean === 'pumpkin') {
      setIsSubmitting(true);
      setErrorMessage('');
      if (!isAudioMuted) {
        playSuccessChime();
      }

      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#F43F5E', '#FB7185', '#FBBF24', '#F97316'],
        });
      } catch {}

      setTimeout(() => {
        onUnlock();
      }, 650);
    } else {
      setIsShaking(true);
      setErrorMessage("Not quite! Clue: A sweet, warm autumn orange favorite you carve or bake pie with 🎃 (starts with 'p')!");
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="relative z-10 max-w-xl mx-auto px-4 py-8 sm:py-14 flex flex-col items-center text-center animate-slide-in">
      {/* Decorative Floral Trio - Sunflower has innocent appearance while being Fred's secret portal */}
      <div className="relative mb-6 flex items-center justify-center gap-3 sm:gap-4 select-none">
        <TulipSvg className="w-10 h-10 sm:w-12 sm:h-12 transform -rotate-12 transition-transform hover:scale-110 pointer-events-none" color="#E11D48" />

        {/* Innocent secret trigger for Fred */}
        <button
          type="button"
          onClick={() => setShowPasscodeModal(true)}
          className="relative group p-0 bg-transparent border-none cursor-pointer focus:outline-none transition-transform active:scale-95"
          tabIndex={-1}
        >
          <SunflowerSvg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" />
        </button>

        <CarnationSvg className="w-10 h-10 sm:w-12 sm:h-12 transform rotate-12 transition-transform hover:scale-110 pointer-events-none" color="#FB7185" />
      </div>

      {/* Main Card with Warm Radiant Golden Glow */}
      <div className="w-full bg-gradient-to-b from-white/95 via-white/90 to-amber-50/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 border-2 border-amber-300/80 shadow-[0_15px_50px_-5px_rgba(245,158,11,0.25)] animate-warm-glow">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold mb-4 border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>PART I · Private Space from Fred</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 tracking-tight mb-6">
          Enter special name to continue
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-4">
          <div className="relative">
            <input
              type="text"
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Your special name..."
              autoFocus
              className={`w-full px-4 py-3.5 pl-11 rounded-2xl bg-amber-50/60 border-2 text-amber-950 placeholder-stone-400 text-base font-semibold focus:outline-none focus:ring-4 focus:ring-amber-400/40 focus:border-amber-500 transition-all shadow-inner ${
                isShaking ? 'border-rose-400 bg-rose-50/50 animate-shake' : 'border-amber-300/80'
              }`}
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600 pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-amber-100/90 border border-amber-300 text-amber-900 text-xs p-3 rounded-xl font-medium text-left shadow-xs animate-fadeIn">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
                <span>Blooming...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* ============================================================ */}
      {/* FRED'S PASSCODE MODAL */}
      {/* ============================================================ */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-2 border-amber-300 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3 text-amber-700">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-amber-950 mb-1">
              Secret Portal
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter passcode
            </p>

            <form onSubmit={handlePasscodeSubmit} className="space-y-3">
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Passcode..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-stone-800 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              {passcodeError && (
                <p className="text-xs text-rose-600 font-semibold">{passcodeError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasscodeModal(false);
                    setPasscodeError('');
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FRED'S FULL RESPONSE DASHBOARD */}
      {/* ============================================================ */}
      {isFredDashboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border-2 border-amber-300 shadow-2xl overflow-hidden text-left">
            <div className="p-5 sm:p-6 border-b border-amber-200/80 bg-gradient-to-r from-amber-100/70 to-rose-100/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SunflowerSvg className="w-7 h-7" />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-amber-950">
                    Fred&apos;s Responses Dashboard
                  </h3>
                  <p className="text-xs text-amber-800">
                    {responsesList.length} response{responsesList.length === 1 ? '' : 's'} recorded
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchResponses}
                  disabled={isLoadingResponses}
                  className="p-2 text-amber-800 hover:bg-amber-200/60 rounded-lg transition-colors cursor-pointer"
                  title="Refresh responses"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingResponses ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleClearResponses}
                  className="p-2 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  title="Clear responses"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFredDashboardOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-amber-200 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {responsesList.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <Smile className="w-10 h-10 mx-auto text-amber-400 mb-2 opacity-80" />
                  <p className="font-semibold text-amber-900">No responses recorded yet</p>
                  <p className="text-xs mt-1 text-stone-400 max-w-sm mx-auto">
                    You can test the website yourself, rate the questions in PART III, and your answers will show up right here!
                  </p>
                </div>
              ) : (
                responsesList.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-3.5"
                  >
                    <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-amber-100">
                      <span className="font-bold text-amber-900">Response #{responsesList.length - idx}</span>
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'Just now'}</span>
                      </div>
                    </div>

                    <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                          <span>1. How life&apos;s been treating her:</span>
                        </span>
                        <span className="text-sm font-extrabold text-rose-700 font-mono">
                          {entry.mood} / 10
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 italic bg-white/70 p-2 rounded-lg border border-rose-100">
                        {entry.moodNote ? `"${entry.moodNote}"` : '(No chika/comment added)'}
                      </p>
                    </div>

                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/70">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                          <span>2. Academics:</span>
                        </span>
                        <span className="text-sm font-extrabold text-amber-800 font-mono">
                          {entry.academics} / 10
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 italic bg-white/70 p-2 rounded-lg border border-amber-100">
                        {entry.academicsNote ? `"${entry.academicsNote}"` : '(No chika/comment added)'}
                      </p>
                    </div>

                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 text-emerald-700" />
                          <span>3. Christmas excitement:</span>
                        </span>
                        <span className="text-sm font-extrabold text-emerald-800 font-mono">
                          {entry.christmas} / 10
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 italic bg-white/70 p-2 rounded-lg border border-emerald-100">
                        {entry.christmasNote ? `"${entry.christmasNote}"` : '(No chika/comment added)'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-amber-50/80 border-t border-amber-200 flex justify-end items-center">
              <button
                onClick={() => setIsFredDashboardOpen(false)}
                className="py-1.5 px-5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
