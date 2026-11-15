import React from 'react';
import {MatchCenter} from './MatchCenter';
export type PlayerMatchModeProps=React.ComponentProps<typeof MatchCenter>;
/** Reuses the live single-pro match engine, player rating, objectives and key-moment choices. */
export const PlayerMatchMode:React.FC<PlayerMatchModeProps>=(props)=><div className="fd-player-match-mode"><MatchCenter {...props}/></div>;
export default PlayerMatchMode;