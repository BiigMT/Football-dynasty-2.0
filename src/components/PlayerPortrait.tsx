import React, { useId } from 'react';
import { PlayerAppearance } from '../types/football';

interface PlayerPortraitProps {
  appearance: PlayerAppearance;
  jerseyPrimary?: string;
  jerseySecondary?: string;
  shirtNumber?: number;
  size?: number;
  className?: string;
}

/** Locally-rendered player artwork: no remote image requests, so portraits work offline. */
export const PlayerPortrait: React.FC<PlayerPortraitProps> = ({
  appearance,
  jerseyPrimary = '#06B6D4',
  jerseySecondary = '#0F172A',
  shirtNumber,
  size = 64,
  className = '',
}) => {
  const { skinTone, hairStyle, hairColor, faceStyle } = appearance;
  const reactId = useId().replace(/:/g, '');
  const id = `portrait-${reactId}`;
  const hairTop = hairStyle === 'CURLY'
    ? 'M22 30 C19 17 28 10 39 11 C51 9 61 18 58 31 L54 27 C49 22 31 22 26 29 Z'
    : hairStyle === 'SWEEP'
    ? 'M22 30 C20 13 39 8 53 15 C59 19 60 25 58 30 C50 23 36 22 22 30 Z'
    : hairStyle === 'BRAIDS'
    ? 'M22 29 C22 13 57 12 58 29 L55 35 L52 26 L28 26 L25 35 Z'
    : hairStyle === 'BUZZ'
    ? 'M25 27 C26 15 53 14 55 27 L52 25 L28 25 Z'
    : 'M23 30 C21 15 32 10 42 11 C54 12 59 20 57 30 L53 25 C45 21 32 22 26 28 Z';

  return (
    <svg width={size} height={size} viewBox="0 0 96 112" className={`shrink-0 rounded-md overflow-hidden ${className}`} role="img" aria-label="Player portrait">
      <defs>
        <linearGradient id={id + '-bg'} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#344354" />
          <stop offset=".52" stopColor="#172433" />
          <stop offset="1" stopColor="#0A111A" />
        </linearGradient>
        <linearGradient id={id + '-skin'} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={skinTone} />
          <stop offset=".58" stopColor={skinTone} />
          <stop offset="1" stopColor="#3A211A" stopOpacity=".34" />
        </linearGradient>
        <linearGradient id={id + '-shirt'} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={jerseyPrimary} />
          <stop offset="1" stopColor={jerseySecondary} />
        </linearGradient>
        <radialGradient id={id + '-light'} cx=".5" cy=".28" r=".7">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".22" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="96" height="112" fill={`url(#${id}-bg)`} />
      <path d="M0 83 L96 62 V112 H0Z" fill="#050A10" opacity=".45" />
      <ellipse cx="48" cy="43" rx="34" ry="39" fill={`url(#${id}-light)`} />
      <path d="M5 112 C9 83 24 76 39 74 L48 83 L57 74 C75 77 88 88 92 112Z" fill={`url(#${id}-shirt)`} />
      <path d="M36 73 L48 88 L60 73 L57 69 H39Z" fill={jerseySecondary} opacity=".78" />
      <path d="M38 63 H58 V82 C54 88 42 88 38 82Z" fill={`url(#${id}-skin)`} />
      <ellipse cx="26" cy="43" rx="5" ry="8" fill={skinTone} />
      <ellipse cx="70" cy="43" rx="5" ry="8" fill={skinTone} />
      <path d="M25 29 C25 13 37 9 48 10 C62 10 71 20 70 38 C69 57 61 70 48 72 C34 70 25 57 25 39Z" fill={`url(#${id}-skin)`} />
      <path d={hairTop} fill={hairColor} />
      {hairStyle === 'FADE' && <path d="M24 27 Q23 39 27 44 L29 29 M72 27 Q73 39 69 44 L67 29" fill={hairColor} opacity=".8" />}
      {hairStyle === 'CURLY' && <g fill={hairColor}><circle cx="28" cy="19" r="5"/><circle cx="36" cy="14" r="5"/><circle cx="46" cy="13" r="5"/><circle cx="56" cy="17" r="5"/><circle cx="63" cy="23" r="4"/></g>}
      {hairStyle === 'BRAIDS' && <g stroke={hairColor} strokeWidth="3" fill="none"><path d="M27 23 Q21 42 28 56"/><path d="M34 17 Q28 38 33 56"/><path d="M61 20 Q68 41 63 56"/></g>}
      <path d="M31 39 Q37 35 42 39" stroke={hairColor} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M54 39 Q60 35 65 39" stroke={hairColor} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="37" cy="43" rx="2.4" ry="2.1" fill="#101820" />
      <ellipse cx="59" cy="43" rx="2.4" ry="2.1" fill="#101820" />
      <circle cx="37.7" cy="42.4" r=".7" fill="#FFFFFF" />
      <circle cx="59.7" cy="42.4" r=".7" fill="#FFFFFF" />
      <path d="M48 43 L45 54 Q48 56 51 54" fill="none" stroke="#432B25" strokeOpacity=".65" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M41 61 Q48 65 55 61" fill="none" stroke="#4A2524" strokeWidth="1.7" strokeLinecap="round" />
      {faceStyle === 'BEARD' && <path d="M27 51 Q29 70 48 73 Q67 70 69 51 Q64 61 57 61 Q48 66 39 61 Q32 60 27 51Z" fill={hairColor} opacity=".88" />}
      {faceStyle === 'GOATEE' && <path d="M42 61 Q48 68 54 61 L52 69 Q48 73 44 69Z" fill={hairColor} opacity=".9" />}
      <path d="M29 47 Q31 58 36 62" stroke="#FFFFFF" strokeOpacity=".12" strokeWidth="2" fill="none" />
      {shirtNumber !== undefined && <text x="48" y="103" textAnchor="middle" fill="#FFFFFF" opacity=".78" fontSize="8" fontWeight="800">{shirtNumber}</text>}
      <rect x=".5" y=".5" width="95" height="111" fill="none" stroke="#FFFFFF" strokeOpacity=".12" />
    </svg>
  );
};
