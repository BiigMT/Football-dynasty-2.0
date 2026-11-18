import React from 'react';
import { useGameMedia } from '../lib/gameMedia';

interface ClubBadgeProps {
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  country?: string;
  size?: number;
  className?: string;
  clubId?: string;
}

const FLAG_EMOJI: Record<string, string> = {
  England: '🏴', Scotland: '🏴', Spain: '🇪🇸', France: '🇫🇷', Germany: '🇩🇪',
  Italy: '🇮🇹', Portugal: '🇵🇹', Netherlands: '🇳🇱', Turkey: '🇹🇷',
  Ghana: '🇬🇭', Kenya: '🇰🇪', Zimbabwe: '🇿🇼', Algeria: '🇩🇿', Cameroon: '🇨🇲',
  'United States': '🇺🇸', Mexico: '🇲🇽', Australia: '🇦🇺', Brazil: '🇧🇷',
  Argentina: '🇦🇷', Uruguay: '🇺🇾', Egypt: '🇪🇬', Morocco: '🇲🇦', Senegal: '🇸🇳',
  Nigeria: '🇳🇬', 'Ivory Coast': '🇨🇮', 'South Africa': '🇿🇦', Zambia: '🇿🇲',
  Tunisia: '🇹🇳', 'DR Congo': '🇨🇩', Tanzania: '🇹🇿', Japan: '🇯🇵',
  'South Korea': '🇰🇷', 'Saudi Arabia': '🇸🇦', Qatar: '🇶🇦', 'New Zealand': '🇳🇿',
};

export const CountryFlag: React.FC<{ country: string; size?: number }> = ({ country, size = 16 }) => (
  <span role="img" aria-label={country} title={country} style={{ fontSize: size, lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}>
    {FLAG_EMOJI[country] ?? '🌍'}
  </span>
);

export const KitPreview: React.FC<{ primaryColor: string; secondaryColor: string; size?: number }> = ({ primaryColor, secondaryColor, size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Club home kit" role="img">
    <path d="M15 7 5 12 1 23l9 4 4-7v21h20V20l4 7 9-4-4-11-10-5-5 6h-8z" fill={primaryColor} stroke={secondaryColor} strokeWidth="2" strokeLinejoin="round" />
    <path d="M19 7h10l-5 7z" fill={secondaryColor} />
    <path d="M18 20h12v21H18z" fill={secondaryColor} opacity=".18" />
    <path d="M23 20h3v21h-3z" fill={secondaryColor} opacity=".85" />
  </svg>
);

export const ClubBadge: React.FC<ClubBadgeProps> = ({ shortName, primaryColor, secondaryColor, country, size = 36, className = '', clubId }) => {
  const photoUrl = useGameMedia('club', clubId);
  const textColor = ['#F8FAFC', '#FACC15', '#EAB308', '#FDE047'].includes(primaryColor.toUpperCase()) ? '#0F172A' : '#FFFFFF';
  const crestId = `crest-${shortName.replace(/[^a-z0-9]/gi, '')}-${size}`;
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 48 54" aria-label={`${shortName} club crest`} role="img">
        <defs>
          <linearGradient id={crestId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={primaryColor} />
            <stop offset="1" stopColor={secondaryColor} />
          </linearGradient>
          <clipPath id={crestId + '-clip'}>
            <path d="M4 4 H44 V29 C44 40 24 51 24 51 S4 40 4 29Z" />
          </clipPath>
        </defs>
        <path d="M2 2 H46 V29 C46 42 24 53 24 53 S2 42 2 29Z" fill="#070D14" stroke="#D5B56B" strokeWidth="1.3" />
        <path d="M4 4 H44 V29 C44 40 24 51 24 51 S4 40 4 29Z" fill={`url(#${crestId})`} />
        <g clipPath={`url(#${crestId}-clip)`}>
          <path d="M4 5 H44 V13 H4Z" fill={secondaryColor} opacity=".9" />
          <path d="M8 4 L19 4 L34 50 H23Z" fill="#FFFFFF" opacity=".12" />
          <path d="M4 23 H44 V27 H4Z" fill={secondaryColor} opacity=".55" />
          <path d="M21 13 H27 V47 H21Z" fill={secondaryColor} opacity=".24" />
        </g>
        <path d="M15 9 L18 5 L21 9 L24 5 L27 9 L30 5 L33 9" fill="none" stroke="#D8BD7B" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="24" cy="29" r="10" fill="#07101A" fillOpacity=".32" stroke="#FFFFFF" strokeOpacity=".72" strokeWidth="1" />
        <path d="M18 29 L21 26 L24 28 L27 25 L30 29 L27 33 L22 33Z" fill="none" stroke="#FFFFFF" strokeWidth="1.15" strokeLinejoin="round" />
        <text x="24" y="43" textAnchor="middle" fill={textColor} fontSize="6.2" fontWeight="900" fontFamily="Arial, sans-serif">{shortName.slice(0, 3).toUpperCase()}</text>
      </svg>
      {photoUrl && <img src={photoUrl} alt={shortName + ' club crest'} loading='lazy' decoding='async' className='absolute inset-0 h-full w-full object-contain' />}
      {country && <span className="absolute -right-1 -top-1 rounded-full bg-slate-950 border border-white/30 flex items-center justify-center" style={{ width: Math.max(15, size * .43), height: Math.max(15, size * .43), fontSize: Math.max(9, size * .28) }}>{FLAG_EMOJI[country] ?? '🌍'}</span>}
    </span>
  );
};
