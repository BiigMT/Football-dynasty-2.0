import React from 'react';
import { CareerSetupModal, CareerSetupModalProps } from './CareerSetupModal';
/** Player-only creation wizard; shares the established save-compatible setup contract. */
export const PlayerCreationWizard: React.FC<Omit<CareerSetupModalProps, 'mode'>> = (props) => (
  <CareerSetupModal {...props} mode="PLAYER" />
);
export default PlayerCreationWizard;
