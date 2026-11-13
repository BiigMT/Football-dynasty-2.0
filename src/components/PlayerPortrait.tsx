import React from 'react';
import { PlayerAppearance } from '../types/football';

interface PlayerPortraitProps {
  appearance: PlayerAppearance;
  jerseyPrimary?: string;
  jerseySecondary?: string;
  shirtNumber?: number;
  size?: number;
  className?: string;
}

export const PlayerPortrait: React.FC<PlayerPortraitProps> = ({
  appearance,
  jerseyPrimary = '#06B6D4',
  jerseySecondary = '#0F172A',
  size = 64,
  className = '',
}) => {
  const { skinTone, hairStyle, hairColor, faceStyle } = appearance;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={`rounded-lg overflow-hidden bg-[#131A22] shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`bg_${jerseyPrimary.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B2532" />
          <stop offset="100%" stopColor="#0D131A" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" fill={`url(#bg_${jerseyPrimary.replace('#', '')})`} />
      {/* Subtle rim light */}
      <circle cx="40" cy="34" r="28" fill={jerseyPrimary} opacity="0.1" />

      {/* Shoulders & Jersey */}
      <path d="M14 80 C16 61, 27 56, 40 56 C53 56, 64 61, 66 80 Z" fill={jerseyPrimary} />
      <path d="M31 57 L40 65 L49 57" fill="none" stroke={jerseySecondary} strokeWidth="3" strokeLinecap="round" />

      {/* Neck */}
      <rect x="34" y="46" width="12" height="13" rx="4" fill={skinTone} />
      <path d="M34 49 Q40 53 46 49" fill="rgba(0,0,0,0.18)" />

      {/* Ears */}
      <circle cx="24" cy="35" r="3.5" fill={skinTone} />
      <circle cx="56" cy="35" r="3.5" fill={skinTone} />

      {/* Head */}
      <rect x="25" y="18" width="30" height="33" rx="14" fill={skinTone} />

      {/* Hair styles */}
      {hairStyle === 'SHORT' && (
        <path d="M24 30 C24 16, 56 16, 56 30 C52 23, 28 23, 24 30 Z" fill={hairColor} />
      )}
      {hairStyle === 'FADE' && (
        <>
          <path d="M25 27 C25 14, 55 14, 55 27 L53 23 L27 23 Z" fill={hairColor} />
          <rect x="25" y="25" width="2" height="8" fill={hairColor} opacity="0.55" />
          <rect x="53" y="25" width="2" height="8" fill={hairColor} opacity="0.55" />
        </>
      )}
      {hairStyle === 'CURLY' && (
        <g fill={hairColor}>
          <circle cx="29" cy="20" r="6" />
          <circle cx="36" cy="17" r="6.5" />
          <circle cx="44" cy="17" r="6.5" />
          <circle cx="51" cy="20" r="6" />
          <circle cx="26" cy="26" r="4" />
          <circle cx="54" cy="26" r="4" />
        </g>
      )}
      {hairStyle === 'BRAIDS' && (
        <g fill={hairColor}>
          <path d="M24 27 C24 15, 56 15, 56 27 Z" />
          <rect x="22" y="24" width="3.5" height="17" rx="1.5" />
          <rect x="54.5" y="24" width="3.5" height="17" rx="1.5" />
        </g>
      )}
      {hairStyle === 'BUZZ' && (
        <path d="M25.5 27 C26 17, 54 17, 54.5 27 C49 24, 31 24, 25.5 27 Z" fill={hairColor} opacity="0.85" />
      )}
      {hairStyle === 'SWEEP' && (
        <path d="M24 29 C23 14, 53 12, 57 26 C48 21, 33 22, 24 29 Z" fill={hairColor} />
      )}

      {/* Eyes & Brows */}
      <line x1="30" y1="30.5" x2="36" y2="31" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="44" y1="31" x2="50" y2="30.5" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="33.5" cy="34" r="1.8" fill="#111827" />
      <circle cx="46.5" cy="34" r="1.8" fill="#111827" />

      {/* Nose & Mouth */}
      <path d="M40 34 L39 40 L41.5 40.5" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M36 44 Q40 46 44 44" fill="none" stroke="rgba(0,0,0,0.38)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Facial hair */}
      {faceStyle === 'BEARD' && (
        <path
          d="M25.5 38 C26 51, 54 51, 54.5 38 C52 44, 46 47, 40 47 C34 47, 28 44, 25.5 38 Z"
          fill={hairColor}
          opacity="0.72"
        />
      )}
      {faceStyle === 'GOATEE' && (
        <path d="M35 44 C35 50, 45 50, 45 44 C43 47, 37 47, 35 44 Z" fill={hairColor} opacity="0.75" />
      )}
    </svg>
  );
};
