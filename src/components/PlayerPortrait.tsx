import React from 'react';
import { PlayerAppearance } from '../types/football';
import { RealisticAvatar } from './RealisticAvatar';
import { useGameMedia } from '../lib/gameMedia';

interface PlayerPortraitProps { appearance: PlayerAppearance; playerId?: string; jerseyPrimary?: string; jerseySecondary?: string; shirtNumber?: number; size?: number; className?: string; }

export const PlayerPortrait: React.FC<PlayerPortraitProps> = ({ appearance, playerId, jerseyPrimary = '#235BA8', jerseySecondary = '#10243A', shirtNumber, size = 64, className = '' }) => {
  const photoUrl = useGameMedia('player', playerId);
  return <span className={'relative inline-block shrink-0 overflow-hidden rounded-md ' + className} style={{ width: size, height: size }}>
    <RealisticAvatar seed={appearance.skinTone + '-' + appearance.hairStyle + '-' + appearance.hairColor + '-' + appearance.faceStyle} name='Player portrait' outfit='player_kit' size={size} className='h-full w-full rounded-md' skinTone={appearance.skinTone} hairColor={appearance.hairColor} hairStyle={appearance.hairStyle === 'CURLY' ? 'curly_crop' : appearance.hairStyle === 'SWEEP' ? 'swept_back' : appearance.hairStyle === 'BUZZ' ? 'buzzcut' : appearance.hairStyle === 'FADE' ? 'fade' : 'receding'} facialHair={appearance.faceStyle === 'BEARD' ? 'beard' : appearance.faceStyle === 'GOATEE' ? 'mustache' : 'clean'} primaryColor={jerseyPrimary} secondaryColor={jerseySecondary} shirtNumber={shirtNumber} />
    {photoUrl && <img src={photoUrl} alt='Player portrait' loading='lazy' decoding='async' className='absolute inset-0 h-full w-full rounded-md object-cover' />}
  </span>;
};
