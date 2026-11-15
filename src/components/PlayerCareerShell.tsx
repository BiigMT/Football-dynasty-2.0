import React from 'react';
/** Shared full-viewport console frame for every Player Career surface. */
export const PlayerCareerShell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="fd-player-career-shell fd-player-console" data-mode="player">{children}</div>
);
export default PlayerCareerShell;
