import React, { useMemo } from 'react';

export const SunflowerSvg = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Stem & Leaves */}
    <path d="M50 65 Q48 85 45 98" stroke="#65A30D" strokeWidth="4" strokeLinecap="round" />
    <path d="M48 76 Q30 72 32 60 Q42 62 48 74" fill="#84CC16" opacity="0.9" />
    <path d="M49 84 Q68 80 66 68 Q56 70 49 82" fill="#65A30D" opacity="0.9" />
    {/* Golden Petals Ring 1 */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <ellipse
        key={`p1-${deg}`}
        cx="50"
        cy="24"
        rx="7"
        ry="17"
        fill="#FBBF24"
        transform={`rotate(${deg} 50 50)`}
      />
    ))}
    {/* Golden Petals Ring 2 (Offset & darker gold) */}
    {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
      <ellipse
        key={`p2-${deg}`}
        cx="50"
        cy="25"
        rx="6"
        ry="15"
        fill="#F59E0B"
        transform={`rotate(${deg} 50 50)`}
      />
    ))}
    {/* Center disc */}
    <circle cx="50" cy="50" r="16" fill="#78350F" />
    <circle cx="50" cy="50" r="13" fill="#451A03" />
    {/* Seeds texture dots */}
    <circle cx="46" cy="46" r="1.8" fill="#F59E0B" opacity="0.7" />
    <circle cx="54" cy="46" r="1.8" fill="#F59E0B" opacity="0.7" />
    <circle cx="50" cy="53" r="1.8" fill="#F59E0B" opacity="0.7" />
    <circle cx="44" cy="52" r="1.5" fill="#D97706" opacity="0.8" />
    <circle cx="55" cy="53" r="1.5" fill="#D97706" opacity="0.8" />
  </svg>
);

export const TulipSvg = ({ className = "w-8 h-8", color = "#E11D48" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Stem */}
    <path d="M50 55 Q50 80 50 96" stroke="#4D7C0F" strokeWidth="4" strokeLinecap="round" />
    <path d="M50 78 Q25 70 34 50 Q46 64 50 76" fill="#65A30D" />
    <path d="M50 88 Q75 80 66 60 Q54 74 50 86" fill="#84CC16" />
    {/* Tulip petals */}
    {/* Back petal */}
    <path d="M50 20 C42 20 38 36 50 54 C62 36 58 20 50 20 Z" fill={color} opacity="0.8" />
    {/* Left petal */}
    <path d="M32 30 C30 45 40 56 50 58 C45 45 36 34 32 30 Z" fill={color} />
    {/* Right petal */}
    <path d="M68 30 C70 45 60 56 50 58 C55 45 64 34 68 30 Z" fill={color} />
    {/* Central bulb */}
    <path d="M42 25 C36 40 44 58 50 58 C56 58 64 40 58 25 C54 32 46 32 42 25 Z" fill="#FB7185" />
    <ellipse cx="50" cy="46" rx="4" ry="7" fill="#FDA4AF" opacity="0.6" />
  </svg>
);

export const CarnationSvg = ({ className = "w-8 h-8", color = "#FB7185" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Stem & Calyx */}
    <path d="M50 64 Q51 82 50 96" stroke="#4D7C0F" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M43 64 C43 60 57 60 57 64 C55 70 45 70 43 64 Z" fill="#65A30D" />
    <path d="M40 60 L45 66 L50 60 L55 66 L60 60 L57 65 L43 65 Z" fill="#4D7C0F" />
    {/* Ruffled Petals Back */}
    <path d="M30 46 C25 36 38 28 44 34 C48 26 60 28 62 36 C70 32 75 42 70 48 C76 54 68 62 60 58 C52 64 42 62 36 58 C28 56 26 48 30 46 Z" fill="#E11D48" opacity="0.75" />
    {/* Ruffled Petals Mid */}
    <path d="M34 44 C30 36 40 32 45 36 C48 30 58 32 59 38 C66 36 68 44 65 48 C68 53 62 58 56 56 C50 60 42 58 38 54 C32 52 30 46 34 44 Z" fill={color} />
    {/* Frilly top highlights */}
    <path d="M42 38 Q46 32 50 36 Q54 30 58 38 Q62 44 54 48 Q46 50 42 44 Z" fill="#FFE4E6" />
    <circle cx="50" cy="42" r="3" fill="#FFF1F2" />
  </svg>
);

export const FloralBackground: React.FC = () => {
  // Generate a fixed set of floating petals for continuous pleasant animation
  const petals = useMemo(() => {
    const types = ['sunflower', 'tulip', 'carnation'] as const;
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      type: types[i % types.length],
      left: `${(i * 5.6 + (i % 3) * 2.2) % 96 + 2}%`,
      delay: `${(i * 1.3) % 15}s`,
      duration: `${14 + (i % 7) * 2.5}s`,
      size: 16 + (i % 4) * 5,
      rotation: (i * 47) % 360,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Warm Blooming Gradient Mesh */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7]/40 via-[#FEE2E2]/35 to-[#FFF7ED]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 15%, rgba(254, 240, 138, 0.35) 0%, transparent 40%),
            radial-gradient(circle at 85% 20%, rgba(254, 205, 211, 0.4) 0%, transparent 45%),
            radial-gradient(circle at 50% 65%, rgba(253, 230, 138, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 90% 85%, rgba(254, 226, 226, 0.35) 0%, transparent 40%),
            radial-gradient(circle at 15% 90%, rgba(254, 243, 199, 0.4) 0%, transparent 45%)
          `
        }}
      />

      {/* Decorative Fixed Floral Corners */}
      {/* Top Left Bloom Cluster */}
      <div className="absolute -top-8 -left-8 opacity-45 sm:opacity-75 transition-opacity">
        <div className="relative w-44 h-44 sm:w-56 sm:h-56">
          <SunflowerSvg className="absolute top-4 left-4 w-28 h-28 transform -rotate-12 animate-sway" />
          <TulipSvg className="absolute top-16 left-24 w-20 h-20 transform rotate-20" color="#F43F5E" />
          <CarnationSvg className="absolute top-24 left-10 w-16 h-16 transform -rotate-25" color="#FB7185" />
        </div>
      </div>

      {/* Top Right Bloom Cluster */}
      <div className="absolute -top-10 -right-8 opacity-45 sm:opacity-75 transition-opacity">
        <div className="relative w-44 h-44 sm:w-56 sm:h-56">
          <TulipSvg className="absolute top-6 right-8 w-24 h-24 transform rotate-15" color="#E11D48" />
          <SunflowerSvg className="absolute top-20 right-20 w-22 h-22 transform rotate-45" />
          <CarnationSvg className="absolute top-8 right-28 w-18 h-18 transform -rotate-12" color="#FDA4AF" />
        </div>
      </div>

      {/* Bottom Left Bloom Cluster */}
      <div className="absolute -bottom-10 -left-6 opacity-40 sm:opacity-70">
        <div className="relative w-40 h-40 sm:w-52 sm:h-52">
          <CarnationSvg className="absolute bottom-6 left-6 w-24 h-24 transform rotate-12" color="#F43F5E" />
          <SunflowerSvg className="absolute bottom-16 left-20 w-22 h-22 transform -rotate-30" />
          <TulipSvg className="absolute bottom-20 left-4 w-18 h-18 transform rotate-35" color="#FB7185" />
        </div>
      </div>

      {/* Bottom Right Bloom Cluster */}
      <div className="absolute -bottom-12 -right-8 opacity-45 sm:opacity-75">
        <div className="relative w-44 h-44 sm:w-60 sm:h-60">
          <SunflowerSvg className="absolute bottom-8 right-8 w-32 h-32 transform rotate-12 animate-sway" />
          <TulipSvg className="absolute bottom-24 right-24 w-20 h-20 transform -rotate-18" color="#E11D48" />
          <CarnationSvg className="absolute bottom-20 right-6 w-18 h-18 transform rotate-28" color="#FB7185" />
        </div>
      </div>

      {/* Drifting Petals Stream */}
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute animate-petal-fall"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {p.type === 'sunflower' && (
            <div 
              className="w-full h-full rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-sm opacity-80"
              style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
            />
          )}
          {p.type === 'tulip' && (
            <div 
              className="w-full h-full rounded-full bg-gradient-to-b from-rose-400 to-red-500 shadow-sm opacity-75"
              style={{ borderRadius: '60% 60% 40% 40% / 70% 70% 30% 30%' }}
            />
          )}
          {p.type === 'carnation' && (
            <div 
              className="w-full h-full rounded-full bg-gradient-to-b from-pink-300 via-rose-300 to-pink-400 shadow-sm opacity-80"
              style={{ borderRadius: '40% 60% 50% 50% / 50% 40% 60% 50%' }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
