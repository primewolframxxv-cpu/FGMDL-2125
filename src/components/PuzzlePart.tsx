import React, { useState, useEffect, useRef, useId } from 'react';
import confetti from 'canvas-confetti';
import { playSnapChime, playSuccessChime } from '../utils/audio.ts';
import { SunflowerSvg, TulipSvg } from './FloralBackground.tsx';
import {
  Upload,
  Eye,
  CheckCircle2,
  RefreshCw,
  Trophy,
  Heart,
  Edit3,
  Copy,
  Lightbulb,
} from 'lucide-react';

const USER_PUZZLE_IMAGE = '/assets/aistudio/181810a26dbad5640eea75fb4a4d070d_19b2c065.jpg';

interface Piece {
  id: number;
  correctIndex: number;
  currentIndex: number;
}

interface PuzzlePartProps {
  customMessage: string;
  onUpdateMessage: (msg: string) => void;
  isAudioMuted: boolean;
}

export const PuzzlePart: React.FC<PuzzlePartProps> = ({
  customMessage,
  onUpdateMessage,
  isAudioMuted,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(() => {
    return localStorage.getItem('pumpkin_puzzle_image') || USER_PUZZLE_IMAGE;
  });

  const [gridSize, setGridSize] = useState<3 | 4>(3);
  const totalPieces = gridSize * gridSize;

  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [isEditingMessage, setIsEditingMessage] = useState<boolean>(false);
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);
  const [movesCount, setMovesCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

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
  };

  useEffect(() => {
    shufflePieces(gridSize);
  }, [gridSize, imageSrc]);

  const checkVictory = (currentPieces: Piece[]) => {
    const solved = currentPieces.every((p) => p.currentIndex === p.correctIndex);
    if (solved) {
      setIsSolved(true);
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
    }
  };

  const handleAutoSolve = () => {
    const solvedPieces = pieces.map((p) => ({
      ...p,
      currentIndex: p.correctIndex,
    }));
    setPieces(solvedPieces);
    checkVictory(solvedPieces);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
        localStorage.setItem('pumpkin_puzzle_image', reader.result);
      }
    };
    reader.readAsDataURL(file);
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
            <button
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-amber-50 text-amber-900 rounded-xl border border-amber-200 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>Preview</span>
            </button>

            <button
              onClick={() => setShowNumbers((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                showNumbers
                  ? 'bg-amber-200 text-amber-950 border-amber-300'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
              <span>{showNumbers ? 'Numbers On' : 'Hint Numbers'}</span>
            </button>

            <button
              onClick={() => shufflePieces(gridSize)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-amber-50 text-amber-900 rounded-xl border border-amber-200 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Reshuffle</span>
            </button>

            <label
              htmlFor={fileInputId}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-200 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-rose-600" />
              <span>Upload Photo</span>
            </label>
            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
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
                          : 'hover:opacity-95'
                      } ${isCorrectlyPlaced ? 'border-2 border-emerald-400/80' : 'border border-amber-200'}`}
                      style={{
                        backgroundImage: `url(${imageSrc})`,
                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                        backgroundPosition: `${xPercent}% ${yPercent}%`,
                      }}
                    >
                      {showNumbers && (
                        <div className="absolute top-1 left-1 bg-black/65 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                          {piece.correctIndex + 1}
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

          <div className="mt-4 flex items-center justify-between w-full max-w-[360px] sm:max-w-[460px] text-xs text-stone-500 px-2">
            <span>
              Moves: <strong className="font-mono text-amber-900">{movesCount}</strong>
            </span>
            {!isSolved && (
              <button
                onClick={handleAutoSolve}
                className="text-amber-800 hover:text-amber-950 underline font-bold cursor-pointer"
              >
                Auto-complete
              </button>
            )}
          </div>
        </div>

        {/* Revealed Message from Fred - BOLDER AND MORE REFINED */}
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingMessage((prev) => !prev)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white hover:bg-amber-50 text-stone-700 rounded-xl border border-amber-200 shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isEditingMessage ? 'Done' : 'Edit'}</span>
                  </button>

                  <button
                    onClick={handleCopyLetter}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white hover:bg-amber-50 text-stone-700 rounded-xl border border-amber-200 shadow-xs cursor-pointer"
                  >
                    {copiedLetter ? (
                      <span className="text-emerald-700 font-extrabold">Copied!</span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-600" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isEditingMessage ? (
                <div className="space-y-3">
                  <textarea
                    rows={7}
                    value={customMessage}
                    onChange={(e) => onUpdateMessage(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-amber-300 bg-white text-stone-800 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsEditingMessage(false)}
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* Bolder, refined, heartwarming typography */
                <div className="text-amber-950 font-semibold text-lg sm:text-xl leading-relaxed whitespace-pre-line space-y-4">
                  <p>{customMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-amber-200 shadow-2xl text-center">
            <h4 className="text-lg font-bold text-amber-950 mb-3">
              Picture Reference
            </h4>
            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 border border-amber-200 shadow-inner">
              <img
                src={imageSrc}
                alt="Puzzle Reference"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={() => setShowPreviewModal(false)}
              className="py-2.5 px-6 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
