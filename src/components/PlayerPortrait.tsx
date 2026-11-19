import React from 'react';
import { PlayerAppearance } from '../types/football';
import { RealisticAvatar } from './RealisticAvatar';
import { useGameMediaImage } from '../lib/gameMedia';

interface PlayerPortraitProps {
  appearance: PlayerAppearance;
  playerId?: string;
  playerName?: string;
  jerseyPrimary?: string;
  jerseySecondary?: string;
  shirtNumber?: number;
  size?: number;
  className?: string;
}

export const PlayerPortrait: React.FC<PlayerPortraitProps> = ({
  appearance, playerId, playerName, jerseyPrimary = '#235BA8',
  jerseySecondary = '#10243A', shirtNumber, size = 64, className = '',
}) => {
  const remoteImage = useGameMediaImage('player', playerId, playerName);

  if (remoteImage) {
    return (
      <img
        src={remoteImage}
        alt={playerName ? `${playerName} portrait` : 'Player portrait'}
        loading="lazy"
        decoding="async"
        width={size}
        height={size}
        className={`shrink-0 overflow-hidden rounded-md object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Never present a generated face as the likeness of a real, named player.
  // Keep generated avatars only for user-created career players without a real player ID.
  if (playerId) {
    const initials = (playerName ?? '?')
      .trim()
      .split(/\\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?';

    return (
      <div
        role="img"
        aria-label={`${playerName ?? 'Player'} photo unavailable`}
        className={`shrink-0 overflow-hidden rounded-md flex items-center justify-center font-black tracking-wide ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: jerseySecondary,
          color: '#FFFFFF',
          border: `2px solid ${jerseyPrimary}`,
          fontSize: Math.max(12, Math.round(size * 0.3)),
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <RealisticAvatar
      seed={appearance.skinTone + '-' + appearance.hairStyle + '-' + appearance.hairColor + '-' + appearance.faceStyle}
      name={playerName ?? 'Player portrait'}
      outfit="player_kit"
      size={size}
      className={'shrink-0 overflow-hidden rounded-md ' + className}
      skinTone={appearance.skinTone}
      hairColor={appearance.hairColor}
      hairStyle={appearance.hairStyle === 'CURLY' ? 'curly_crop' : appearance.hairStyle === 'SWEEP' ? 'swept_back' : appearance.hairStyle === 'BUZZ' ? 'buzzcut' : appearance.hairStyle === 'FADE' ? 'fade' : 'receding'}
      facialHair={appearance.faceStyle === 'BEARD' ? 'beard' : appearance.faceStyle === 'GOATEE' ? 'mustache' : 'clean'}
      primaryColor={jerseyPrimary}
      secondaryColor={jerseySecondary}
      shirtNumber={shirtNumber}
    />
  );
};
