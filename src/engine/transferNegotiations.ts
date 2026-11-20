import { CareerSave, TransferOffer } from '../types/football';

export type OfferDecision = 'ACCEPT' | 'REJECT' | 'COUNTER';

/** Counter or resolve a pending offer. A counter remains pending for the other club to answer. */
export function negotiateTransferOffer(
  save: CareerSave,
  offerId: string,
  decision: OfferDecision,
  counter?: Partial<Pick<TransferOffer, 'fee' | 'proposedWage' | 'contractYears' | 'signingBonus' | 'releaseClause'>>,
): CareerSave {
  const mainIndex = save.transferOffers.findIndex((offer) => offer.id === offerId);
  const agentIndex = save.legend?.agentOffers.findIndex((offer) => offer.id === offerId) ?? -1;
  const isAgentOffer = mainIndex < 0 && agentIndex >= 0;
  const source = isAgentOffer ? (save.legend?.agentOffers ?? []) : save.transferOffers;
  const index = isAgentOffer ? agentIndex : mainIndex;
  if (index < 0) return save;
  const offer = source[index];
  if (offer.status !== 'PENDING' && offer.status !== 'COUNTERED') return save;
  if (decision === 'COUNTER') {
    if (!counter || Object.values(counter).some((value) => value !== undefined && (!Number.isFinite(value) || value < 0))) return save;
    const updated: TransferOffer = {
      ...offer,
      ...counter,
      status: 'COUNTERED',
      round: offer.round + 1,
      message: 'The club has received revised terms and must respond.',
    };
    if (isAgentOffer && save.legend) {
      const agentOffers = [...save.legend.agentOffers];
      agentOffers[index] = updated;
      return { ...save, legend: { ...save.legend, agentOffers } };
    }
    const transferOffers = [...save.transferOffers];
    transferOffers[index] = updated;
    return { ...save, transferOffers };
  }
  const updated: TransferOffer = {
    ...offer,
    status: decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
    message: decision === 'ACCEPT' ? 'Terms accepted, pending final registration.' : 'The offer has been turned down.',
  };
  if (isAgentOffer && save.legend) {
    const agentOffers = [...save.legend.agentOffers];
    agentOffers[index] = updated;
    return { ...save, legend: { ...save.legend, agentOffers } };
  }
  const transferOffers = [...save.transferOffers];
  transferOffers[index] = updated;
  return { ...save, transferOffers };
}
