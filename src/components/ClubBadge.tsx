import React from 'react';

interface ClubBadgeProps {
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  size?: number;
  className?: string;
}

export const ClubBadge: React.FC<ClubBadgeProps> = ({
  shortName,
  primaryColor,
  secondaryColor,
  size = 36,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M6 6 H38 V23 C38 33 22 40 22 40 C22 40 6 33 6 23 Z"
        fill={primaryColor}
        stroke={secondaryColor}
        strokeWidth="2.5"
      />
      <path
        d="M22 6 H38 V23 C38 32 25 38 22 39.5 Z"
        fill={secondaryColor}
        opacity="0.18"
      />
      <text
        x="22"
        y="24"
        textAnchor="middle"
        fill={primaryColor.toUpperCase() === '#F8FAFC' || primaryColor.toUpperCase() === '#FACC15' || primaryColor.toUpperCase() === '#EAB308' ? '#0F172A' : '#FFFFFF'}
        fontSize="10.5"
        fontWeight="800"
        fontFamily="Barlow Condensed, sans-serif"
        letterSpacing="0.5"
      >
        {shortName.slice(0, 3)}
      </text>
    </svg>
  );
};
