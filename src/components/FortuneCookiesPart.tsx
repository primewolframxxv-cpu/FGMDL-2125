import React, { useState, useEffect } from 'react';
import { FortuneCookie, CookieMotif, SongDetails } from '../types/index.ts';
import { playCookieCrunch } from '../utils/audio.ts';
import confetti from 'canvas-confetti';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { SunflowerSvg, CarnationSvg, TulipSvg } from './FloralBackground.tsx';

// Motif SVGs
export const MotifDrawing = ({ motif, className = "w-6 h-6" }: { motif: CookieMotif; className?: string }) => {
  switch (motif) {
    case 'strawberries':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none" aria-label="Strawberry">
          <path d="M20 10 C12 10 8 18 10 26 C12 34 18 38 20 38 C22 38 28 34 30 26 C32 18 28 10 20 10 Z" fill="#EF4444" />
          <path d="M14 10 Q20 13 26 10 Q24 6 20 6 Q16 6 14 10 Z" fill="#15803D" />
          <path d="M20 6 L20 2" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="18" r="0.9" fill="#FEF08A" />
          <circle cx="24" cy="18" r="0.9" fill="#FEF08A" />
          <circle cx="20" cy="24" r="0.9" fill="#FEF08A" />
          <circle cx="15" cy="27" r="0.9" fill="#FEF08A" />
          <circle cx="25" cy="27" r="0.9" fill="#FEF08A" />
          <circle cx="20" cy="32" r="0.9" fill="#FEF08A" />
        </svg>
      );
    case 'chicken':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none" aria-label="Cute Chicken">
          <ellipse cx="20" cy="23" rx="12" ry="11" fill="#FEF08A" />
          <ellipse cx="14" cy="25" rx="5" ry="4" fill="#FDE047" transform="rotate(-15 14 25)" />
          <circle cx="19" cy="9" r="2.5" fill="#EF4444" />
          <circle cx="22" cy="8" r="2.8" fill="#EF4444" />
          <circle cx="25" cy="9" r="2.5" fill="#EF4444" />
          <polygon points="28,21 35,23 28,26" fill="#F97316" />
          <circle cx="24" cy="18" r="1.8" fill="#1C1917" />
          <circle cx="24.5" cy="17.5" r="0.6" fill="#FFFFFF" />
          <path d="M16 34 L16 38 M22 34 L22 38" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'pumpkin':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none" aria-label="Pumpkin">
          <ellipse cx="14" cy="23" rx="7" ry="11" fill="#EA580C" />
          <ellipse cx="26" cy="23" rx="7" ry="11" fill="#EA580C" />
          <ellipse cx="20" cy="23" rx="9" ry="12" fill="#F97316" />
          <path d="M20 12 Q21 6 24 4" stroke="#4D7C0F" strokeWidth="3" strokeLinecap="round" />
          <path d="M20 12 Q17 10 15 11" stroke="#65A30D" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'coconut':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none" aria-label="Coconut">
          <circle cx="20" cy="22" r="13" fill="#78350F" />
          <circle cx="20" cy="22" r="10" fill="#F5F5F4" />
          <circle cx="20" cy="22" r="7" fill="#38BDF8" opacity="0.25" />
          <path d="M12 9 Q18 6 23 11" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 8 Q23 6 18 11" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'watermelon':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none" aria-label="Watermelon">
          <path d="M8 20 A14 14 0 0 0 32 20 Z" fill="#15803D" />
          <path d="M10 20 A12 12 0 0 0 30 20 Z" fill="#BBF7D0" />
          <path d="M11.5 20 A10.5 10.5 0 0 0 28.5 20 Z" fill="#F43F5E" />
          <circle cx="16" cy="23" r="1" fill="#18181B" />
          <circle cx="24" cy="23" r="1" fill="#18181B" />
          <circle cx="20" cy="26" r="1" fill="#18181B" />
        </svg>
      );
    case 'pink_bow':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none" aria-label="Pink Bow">
          <path d="M20 20 C14 12 6 15 8 22 C10 26 16 23 20 20 Z" fill="#F472B6" />
          <path d="M16 19 C13 16 9 17 10 21" stroke="#DB2777" strokeWidth="1.2" />
          <path d="M20 20 C26 12 34 15 32 22 C30 26 24 23 20 20 Z" fill="#F472B6" />
          <path d="M24 19 C27 16 31 17 30 21" stroke="#DB2777" strokeWidth="1.2" />
          <path d="M18 21 Q14 28 11 34" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" />
          <path d="M22 21 Q26 28 29 34" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="20" r="3.5" fill="#DB2777" />
        </svg>
      );
    case 'green_heart':
    case 'syringe':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none" aria-label="Green Heart">
          <path
            d="M20 33 C18 31 7 22.5 5 15.5 C3 8.5 9 4 14.5 5 C17.5 5.5 19.2 8 20 9.5 C20.8 8 22.5 5.5 25.5 5 C31 4 37 8.5 35 15.5 C33 22.5 22 31 20 33 Z"
            fill="#22C55E"
          />
          <path
            d="M13.5 8.5 C10.5 9.5 7.5 12 8 16"
            stroke="#DCFCE7"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'tulip':
      return <TulipSvg className={className} color="#E11D48" />;
    case 'sunflower':
      return <SunflowerSvg className={className} />;
    case 'carnation':
      return <CarnationSvg className={className} color="#FB7185" />;
    case 'song':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none" aria-label="Music Vinyl">
          <circle cx="20" cy="20" r="16" fill="#1E293B" />
          <circle cx="20" cy="20" r="11" stroke="#475569" strokeWidth="1" />
          <circle cx="20" cy="20" r="6" fill="#F59E0B" />
          <circle cx="20" cy="20" r="2" fill="#0F172A" />
          <path d="M26 12 L31 10 L31 18 M26 12 L26 22 M26 22 A2.5 2.5 0 1 1 23 20" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
};

const RealisticCookieGraphic = () => (
  <div className="relative w-28 h-22 flex items-center justify-center">
    <svg viewBox="0 0 120 95" className="w-full h-full drop-shadow-md">
      <defs>
        <linearGradient id="cookieShadeVibrant" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      <path
        d="M 18 64 C 8 38, 25 18, 60 18 C 95 18, 112 38, 102 64 C 96 74, 80 72, 60 50 C 40 72, 24 74, 18 64 Z"
        fill="url(#cookieShadeVibrant)"
      />

      <path
        d="M 60 18 Q 58 36 60 50"
        stroke="#92400E"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 52 48 Q 60 38 68 48"
        stroke="#78350F"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M 28 42 C 40 24, 80 24, 92 42"
        stroke="#FEF3C7"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
        fill="none"
      />
    </svg>
  </div>
);

interface FortuneCookiesPartProps {
  cookies: FortuneCookie[];
  songDetails: SongDetails;
  onProceedToPuzzle: () => void;
  isAudioMuted: boolean;
}

export const FortuneCookiesPart: React.FC<FortuneCookiesPartProps> = ({
  cookies,
  songDetails,
  onProceedToPuzzle,
  isAudioMuted,
}) => {
  const [crackedIds, setCrackedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('pumpkin_cracked_cookies');
    return saved ? new Set(JSON.parse(saved)) : new Set<string>();
  });

  const [crackingId, setCrackingId] = useState<string | null>(null);

  // 11th cookie states
  const [isEleventhFocused, setIsEleventhFocused] = useState(false);
  const [isEleventhCracked, setIsEleventhCracked] = useState(false);
  const [isEleventhCracking, setIsEleventhCracking] = useState(false);

  useEffect(() => {
    localStorage.setItem('pumpkin_cracked_cookies', JSON.stringify(Array.from(crackedIds)));
  }, [crackedIds]);

  const crackedCount = cookies.filter((c) => crackedIds.has(c.id)).length;
  const allTenCracked = crackedCount >= 10;

  const handleCrackCookie = (cookie: FortuneCookie) => {
    if (crackedIds.has(cookie.id)) return;

    setCrackingId(cookie.id);
    if (!isAudioMuted) {
      playCookieCrunch();
    }

    setTimeout(() => {
      setCrackedIds((prev) => new Set([...prev, cookie.id]));
      setCrackingId(null);
    }, 380);
  };

  const handleCrackEleventh = () => {
    if (isEleventhCracked || isEleventhCracking) return;
    setIsEleventhCracking(true);
    if (!isAudioMuted) {
      playCookieCrunch();
    }

    try {
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#F43F5E', '#FB7185', '#FBBF24', '#EC4899', '#10B981'],
      });
    } catch {}

    setTimeout(() => {
      setIsEleventhCracked(true);
      setIsEleventhCracking(false);
    }, 380);
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-slide-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-2 mb-2 font-sans">
          <SunflowerSvg className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
            PART IV
          </span>
          <CarnationSvg className="w-5 h-5" color="#FB7185" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-950 tracking-tight">
          Ten Fortune Cookies
        </h2>
        <p className="text-stone-600 text-sm sm:text-base mt-1 max-w-md mx-auto italic">
          Crack each cookie open to discover its hidden note.
        </p>
      </div>

      {/* Grid of 10 Fortune Cookies (NON-CUSTOMIZABLE, ZERO EDIT BUTTONS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {cookies.map((cookie, idx) => {
          const isCracked = crackedIds.has(cookie.id);
          const isAnimating = crackingId === cookie.id;

          return (
            <div
              key={cookie.id}
              className={`relative bg-gradient-to-b from-white/95 to-amber-50/80 backdrop-blur-md rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                isCracked
                  ? 'border-amber-300 ring-1 ring-amber-200 shadow-md'
                  : 'border-amber-200/90 hover:border-amber-400 hover:shadow-lg cursor-pointer hover:-translate-y-1'
              }`}
              onClick={() => !isCracked && handleCrackCookie(cookie)}
            >
              {/* Clean # number at top without edit icons */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 font-sans">
                  #{idx + 1}
                </span>
              </div>

              {/* Cookie Graphic or Cracked Fortune Paper */}
              <div className="my-2 flex flex-col items-center justify-center min-h-[120px]">
                {!isCracked ? (
                  <div
                    className={`flex flex-col items-center group transition-transform ${
                      isAnimating ? 'scale-110 rotate-3' : 'hover:scale-105'
                    }`}
                  >
                    <RealisticCookieGraphic />
                  </div>
                ) : (
                  <div className="w-full bg-gradient-to-b from-[#FFFDF8] to-[#FFF9EE] rounded-xl p-3.5 border border-amber-300/80 shadow-[inset_0_1px_4px_rgba(245,158,11,0.08)] animate-paper-in flex flex-col justify-between min-h-[125px]">
                    <p className="text-[13px] sm:text-[13.5px] text-amber-950 font-medium leading-relaxed tracking-tight select-text my-0.5">
                      &ldquo;{cookie.quote}&rdquo;
                    </p>
                    {cookie.source && (
                      <p className="text-[11px] text-amber-800/90 text-right mt-2 font-bold tracking-wide">
                        — {cookie.source}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 11th FORTUNE COOKIE - JUST THE COOKIE ITSELF (GLOWING & WIGGLING) */}
      {/* ============================================================ */}
      {allTenCracked && (
        <div className="mt-12 flex flex-col items-center animate-bloom">
          {!isEleventhFocused ? (
            <div className="flex flex-col items-center">
              <div
                onClick={() => setIsEleventhFocused(true)}
                className="relative cursor-pointer group flex flex-col items-center p-4 animate-cookie-lure"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400/50 rounded-full blur-2xl group-hover:bg-amber-400/80 transition-all" />
                  <RealisticCookieGraphic />
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="relative w-full max-w-lg bg-[#FFFDF7] rounded-3xl p-6 sm:p-10 border-2 border-amber-300 shadow-2xl text-center">
                {!isEleventhCracked ? (
                  <div className="flex flex-col items-center py-6">
                    <div
                      onClick={handleCrackEleventh}
                      className={`cursor-pointer group py-3 transition-transform ${
                        isEleventhCracking ? 'scale-110 rotate-3' : 'hover:scale-110 active:scale-95'
                      }`}
                    >
                      <RealisticCookieGraphic />
                    </div>
                  </div>
                ) : (
                  <div className="text-left animate-paper-in py-2">
                    <div className="pb-2 mb-3 border-b border-amber-200">
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-widest font-sans">
                        A Song on Fred&apos;s Mind
                      </p>
                      <h3 className="text-2xl font-bold text-amber-950 mt-0.5">
                        {songDetails.title}
                      </h3>
                      <p className="text-sm font-semibold text-amber-900">
                        {songDetails.artist}
                      </p>
                    </div>

                    <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-200 text-stone-800 text-sm sm:text-base leading-relaxed mb-6 italic">
                      &ldquo;{songDetails.note}&rdquo;
                    </div>

                    <a
                      href={songDetails.streamingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mb-4 font-sans cursor-pointer"
                    >
                      <span>Listen to it on our playlist</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <div className="pt-3 border-t border-amber-200/70 flex justify-end">
                      <button
                        onClick={() => {
                          setIsEleventhFocused(false);
                          onProceedToPuzzle();
                        }}
                        className="py-3 px-8 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm rounded-2xl shadow-md font-sans flex items-center gap-2 cursor-pointer"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
