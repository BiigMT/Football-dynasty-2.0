import React from 'react';

interface ClubBadgeProps {
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  country?: string;
  size?: number;
  className?: string;
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

export const ClubBadge: React.FC<ClubBadgeProps> = ({ shortName, primaryColor, secondaryColor, country, size = 36, className = '' }) => {
  const textColor = ['#F8FAFC', '#FACC15', '#EAB308', '#FDE047'].includes(primaryColor.toUpperCase()) ? '#0F172A' : '#FFFFFF';
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 44 44" aria-label={`${shortName} club crest`} role="img">
        <path d="M5 4H39V23C39 33 22 41 22 41S5 33 5 23Z" fill={primaryColor} stroke={secondaryColor} strokeWidth="2.6" />
        <path d="M22 6H37V23C37 31 27 37 22 39Z" fill={secondaryColor} opacity=".2" />
        <path d="M8 8H36V12H8Z" fill={secondaryColor} opacity=".95" />
        <path d="M11 16H33V18H11Z" fill={secondaryColor} opacity=".35" />
        <circle cx="22" cy="25" r="10" fill="none" stroke={secondaryColor} strokeWidth="1.2" opacity=".75" />
        <text x="22" y="28.5" textAnchor="middle" fill={textColor} fontSize="9.5" fontWeight="900" fontFamily="Arial, sans-serif">{shortName.slice(0, 3)}</text>
      </svg>
      {country && <span className="absolute -right-1 -top-1 rounded-full bg-slate-950 border border-white/30 flex items-center justify-center" style={{ width: Math.max(15, size * .43), height: Math.max(15, size * .43), fontSize: Math.max(9, size * .28) }}>{FLAG_EMOJI[country] ?? '🌍'}</span>}
    </span>
  );
};
