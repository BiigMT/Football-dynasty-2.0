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
  return remoteImage ? (
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
  ) : (
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
