import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSnapChime, playSuccessChime } from '../utils/audio.ts';
import { SunflowerSvg, TulipSvg } from './FloralBackground.tsx';
import clefableGengarImg from '../assets/images/clefable_gengar.jpg';
import {
  CheckCircle2,
  RefreshCw,
  Trophy,
  Heart,
  Copy,
} from 'lucide-react';

interface Piece {
  id: number;
  correctIndex: number;
  currentIndex: number;
}

interface PuzzlePartProps {
  customMessage: string;
  isAudioMuted: boolean;
}

export const PuzzlePart: React.FC<PuzzlePartProps> = ({
  customMessage,
  isAudioMuted,
}) => {
  const imageSrc = clefableGengarImg;

  const [gridSize, setGridSize] = useState<3 | 4>(3);
  const totalPieces = gridSize * gridSize;

  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);
  const [movesCount, setMovesCount] = useState<number>(0);

  // Clue state with 1-minute countdown
  const [clueCooldown, setClueCooldown] = useState<number>(0);
  const [activeClue, setActiveClue] = useState<{ currentSlot: number; targetSlot: number } | null>(null);

  // Countdown timer for 1-minute clue cooldown
  useEffect(() => {
    if (clueCooldown <= 0) return;
    const interval = setInterval(() => {
      setClueCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [clueCooldown]);

  const shufflePieces = (size: number) => {
    const count = size * size;
    const array = Array.from({ length: count }, (_, i) => i);

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    const isAlreadySolved = array.every((val, idx) => val === idx);
    if (isAlreadySolved && count > 1) {
      [array[0], array[1]] = [array[1], array[0]];
    }

    const newPieces: Piece[] = array.map((correctIdx, currentIdx) => ({
      id: correctIdx,
      correctIndex: correctIdx,
      currentIndex: currentIdx,
    }));

    setPieces(newPieces);
    setIsSolved(false);
    setSelectedIndex(null);
    setMovesCount(0);
    setActiveClue(null);
  };

  useEffect(() => {
    shufflePieces(gridSize);
  }, [gridSize]);

  const checkVictory = (currentPieces: Piece[]) => {
    const solved = currentPieces.every((p) => p.currentIndex === p.correctIndex);
    if (solved) {
      setIsSolved(true);
      setActiveClue(null);
      if (!isAudioMuted) {
        playSuccessChime();
      }
      try {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#F43F5E', '#10B981', '#EC4899', '#FBBF24'],
        });
      } catch {}
    }
  };

  const handlePieceClick = (clickedCurrentIndex: number) => {
    if (isSolved) return;

    if (selectedIndex === null) {
      setSelectedIndex(clickedCurrentIndex);
      if (!isAudioMuted) playSnapChime();
    } else if (selectedIndex === clickedCurrentIndex) {
      setSelectedIndex(null);
    } else {
      const pieceA = pieces.find((p) => p.currentIndex === selectedIndex);
      const pieceB = pieces.find((p) => p.currentIndex === clickedCurrentIndex);

      if (pieceA && pieceB) {
        const nextPieces = pieces.map((p) => {
          if (p.id === pieceA.id) return { ...p, currentIndex: clickedCurrentIndex };
          if (p.id === pieceB.id) return { ...p, currentIndex: selectedIndex };
          return p;
        });

        setPieces(nextPieces);
        setSelectedIndex(null);
        setMovesCount((prev) => prev + 1);
        if (!isAudioMuted) playSnapChime();
        checkVictory(nextPieces);

        // Clear active clue if user moved the clue tile
        if (activeClue && (activeClue.currentSlot === selectedIndex || activeClue.currentSlot === clickedCurrentIndex)) {
          setActiveClue(null);
        }
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, fromIndex: number) => {
    if (isSolved) return;
    e.dataTransfer.setData('text/plain', fromIndex.toString());
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    if (isSolved) return;
    e.preventDefault();
    const fromIndexStr = e.dataTransfer.getData('text/plain');
    if (!fromIndexStr) return;
    const fromIndex = parseInt(fromIndexStr, 10);
    if (isNaN(fromIndex) || fromIndex === toIndex) return;

    const pieceA = pieces.find((p) => p.currentIndex === fromIndex);
    const pieceB = pieces.find((p) => p.currentIndex === toIndex);

    if (pieceA && pieceB) {
      const nextPieces = pieces.map((p) => {
        if (p.id === pieceA.id) return { ...p, currentIndex: toIndex };
        if (p.id === pieceB.id) return { ...p, currentIndex: fromIndex };
        return p;
      });

      setPieces(nextPieces);
      setSelectedIndex(null);
      setMovesCount((prev) => prev + 1);
      if (!isAudioMuted) playSnapChime();
      checkVictory(nextPieces);

      if (activeClue && (activeClue.currentSlot === fromIndex || activeClue.currentSlot === toIndex)) {
        setActiveClue(null);
      }
    }
  };

  // Clue mechanism: highlights one misplaced tile and where it belongs, with a 1-minute countdown cooldown
  const handleUseClue = () => {
    if (clueCooldown > 0 || isSolved) return;

    const misplaced = pieces.filter((p) => p.currentIndex !== p.correctIndex);
    if (misplaced.length === 0) return;

    // Pick one misplaced tile
    const chosen = misplaced[Math.floor(Math.random() * misplaced.length)];
    setActiveClue({
      currentSlot: chosen.currentIndex,
      targetSlot: chosen.correctIndex,
    });
    setClueCooldown(60); // 1-minute cooldown

    if (!isAudioMuted) {
      playSnapChime();
    }

    // Auto clear visual hint after 8 seconds so screen remains clean
    setTimeout(() => {
      setActiveClue((prev) => (prev && prev.currentSlot === chosen.currentIndex ? null : prev));
    }, 8000);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2500);
  };

  const sortedDisplayPieces = Array.from({ length: totalPieces }, (_, gridPos) => {
    return pieces.find((p) => p.currentIndex === gridPos);
  });

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-slide-in">
      {/* Chapter Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <SunflowerSvg className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
            PART V
          </span>
          <TulipSvg className="w-5 h-5" color="#E11D48" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-950 tracking-tight">
          Solve the Puzzle
        </h2>
      </div>

      {/* Main Puzzle Card */}
      <div className="bg-gradient-to-b from-white/95 to-amber-50/80 backdrop-blur-md rounded-3xl p-5 sm:p-8 border-2 border-amber-200/80 shadow-[0_15px_50px_-5px_rgba(245,158,11,0.18)]">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-amber-200/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-950">Grid:</span>
            <button
              onClick={() => setGridSize(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                gridSize === 3
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100/70'
              }`}
            >
              3×3
            </button>
            <button
              onClick={() => setGridSize(4)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                gridSize === 4
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100/70'
              }`}
            >
              4×4
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Clue button with 1-min countdown cooldown */}
            <button
              onClick={handleUseClue}
              disabled={clueCooldown > 0 || isSolved}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                clueCooldown > 0
                  ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 cursor-pointer shadow-xs active:scale-95'
              }`}
              title={clueCooldown > 0 ? `Clue available in ${clueCooldown}s` : 'Reveal a tile clue (1 min cooldown)'}
            >
              {clueCooldown > 0 ? (
                <span className="w-2 h-2 rounded-full bg-stone-300" />
              ) : (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                </span>
              )}
              <span>{clueCooldown > 0 ? `Clue (${clueCooldown}s)` : 'Clue'}</span>
            </button>

            <button
              onClick={() => shufflePieces(gridSize)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-amber-50 text-amber-900 rounded-xl border border-amber-200 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Reshuffle</span>
            </button>
          </div>
        </div>

        {/* Puzzle Board */}
        <div className="flex flex-col items-center">
          <div
            className={`relative w-full max-w-[360px] sm:max-w-[460px] aspect-square rounded-3xl p-2.5 bg-amber-100/70 border-2 transition-all duration-300 ${
              isSolved
                ? 'border-emerald-500 ring-4 ring-emerald-200/60 shadow-xl'
                : 'border-amber-300 shadow-md'
            }`}
          >
            {isSolved ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner">
                <img
                  src={imageSrc}
                  alt="Solved Puzzle Memory"
                  className="w-full h-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-300" />
                    <span className="text-lg font-bold">Puzzle Complete!</span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="w-full h-full grid gap-1.5 rounded-2xl overflow-hidden bg-amber-200/50"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
                }}
              >
                {sortedDisplayPieces.map((piece, currentSlot) => {
                  if (!piece) return <div key={`empty-${currentSlot}`} />;

                  const isSelected = selectedIndex === currentSlot;
                  const isCorrectlyPlaced = piece.correctIndex === piece.currentIndex;

                  // Clue highlights
                  const isClueSource = activeClue?.currentSlot === currentSlot;
                  const isClueTarget = activeClue?.targetSlot === currentSlot;

                  const row = Math.floor(piece.correctIndex / gridSize);
                  const col = piece.correctIndex % gridSize;
                  const xPercent = (col / (gridSize - 1)) * 100;
                  const yPercent = (row / (gridSize - 1)) * 100;

                  return (
                    <div
                      key={piece.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, currentSlot)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, currentSlot)}
                      onClick={() => handlePieceClick(currentSlot)}
                      className={`relative cursor-pointer select-none rounded-xl overflow-hidden transition-all duration-150 ${
                        isSelected
                          ? 'ring-4 ring-rose-500 scale-95 z-20 shadow-xl'
                          : isClueSource
                          ? 'ring-4 ring-amber-500 scale-105 z-30 shadow-2xl animate-bounce'
                          : isClueTarget
                          ? 'ring-4 ring-emerald-500 z-20 shadow-xl'
                          : 'hover:opacity-95'
                      } ${isCorrectlyPlaced ? 'border-2 border-emerald-400/80' : 'border border-amber-200'}`}
                      style={{
                        backgroundImage: `url(${imageSrc})`,
                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                        backgroundPosition: `${xPercent}% ${yPercent}%`,
                      }}
                    >
                      {/* Clue indicator labels */}
                      {isClueSource && (
                        <div className="absolute top-1 left-1 bg-amber-600 text-white font-sans text-[10px] px-2 py-0.5 rounded-md font-bold shadow-md tracking-wide uppercase">
                          Move
                        </div>
                      )}
                      {isClueTarget && (
                        <div className="absolute bottom-1 left-1 bg-emerald-600 text-white font-sans text-[10px] px-2 py-0.5 rounded-md font-bold shadow-md tracking-wide uppercase">
                          Place Here
                        </div>
                      )}

                      {isCorrectlyPlaced && (
                        <div className="absolute bottom-1 right-1 bg-emerald-600/90 text-white p-0.5 rounded-full pointer-events-none">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Moves counter */}
          <div className="mt-4 flex items-center justify-center w-full max-w-[360px] sm:max-w-[460px] text-xs text-stone-500 px-2">
            <span>
              Moves: <strong className="font-mono text-amber-900">{movesCount}</strong>
            </span>
          </div>
        </div>

        {/* Revealed Message from Fred - BOLDER AND REFINED */}
        {isSolved && (
          <div className="mt-8 pt-6 border-t border-amber-200/80 animate-paper-in">
            <div className="bg-gradient-to-br from-[#FFFDF8] via-white to-amber-50/70 rounded-3xl p-6 sm:p-10 border-2 border-amber-300 shadow-xl">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-amber-200/80">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                  <h3 className="text-xl sm:text-2xl font-extrabold text-amber-950 tracking-tight">
                    Message from Fred
                  </h3>
                </div>

                <button
                  onClick={handleCopyLetter}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white hover:bg-amber-50 text-stone-700 rounded-xl border border-amber-200 shadow-xs cursor-pointer"
                >
                  {copiedLetter ? (
                    <span className="text-emerald-700 font-extrabold">Copied!</span>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-600" />
                      <span>Copy Letter</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bolder, refined, heartwarming typography */}
              <div className="text-amber-950 font-semibold text-lg sm:text-xl leading-relaxed whitespace-pre-line space-y-4">
                <p>{customMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
