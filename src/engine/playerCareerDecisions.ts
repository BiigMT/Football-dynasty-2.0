import { CareerSave } from '../types/football';

export type ManagerConversation = 'ASK_FOR_MINUTES' | 'PROMISE_LOYALTY' | 'REQUEST_TRANSFER' | 'APOLOGISE';

export function resolveManagerConversation(save: CareerSave, conversation: ManagerConversation): CareerSave {
  if (save.mode !== 'PLAYER' || !save.legend) return save;
  const player = save.players[save.legend.playerId];
  if (!player) return save;
  const trustDelta: Record<ManagerConversation, number> = {
    ASK_FOR_MINUTES: player.form >= 65 ? 3 : -1,
    PROMISE_LOYALTY: 2,
    REQUEST_TRANSFER: -8,
    APOLOGISE: 4,
  };
  const moraleDelta: Record<ManagerConversation, number> = {
    ASK_FOR_MINUTES: 1,
    PROMISE_LOYALTY: 2,
    REQUEST_TRANSFER: -2,
    APOLOGISE: 1,
  };
  const messages: Record<ManagerConversation, string> = {
    ASK_FOR_MINUTES: 'You asked the manager for a clearer route to regular minutes.',
    PROMISE_LOYALTY: 'You reassured the manager that you remain committed to the club.',
    REQUEST_TRANSFER: 'You told the manager you want to explore a move.',
    APOLOGISE: 'You spoke to the manager and tried to put recent tension behind you.',
  };
  const notificationId = `manager-chat-${save.season}-${save.currentWeek}-${conversation}`;
  const nextPlayer = {
    ...player,
    morale: Math.max(0, Math.min(100, player.morale + moraleDelta[conversation])),
  };
  const notifications = [
    ...(save.legend.phoneNotifications ?? []),
    { id: notificationId, title: 'Manager meeting', body: messages[conversation], kind: 'CLUB' as const, week: save.currentWeek, season: save.season },
  ].slice(-30);
  return {
    ...save,
    players: { ...save.players, [player.id]: nextPlayer },
    legend: {
      ...save.legend,
      managerTrust: Math.max(0, Math.min(100, save.legend.managerTrust + trustDelta[conversation])),
      loanRequestPending: conversation === 'REQUEST_TRANSFER' ? save.legend.loanRequestPending : save.legend.loanRequestPending,
      phoneNotifications: notifications,
    },
  };
}

export type MediaResponse = 'THANK_FANS' | 'STAY_FOCUSED' | 'CALL_OUT_RIVALS';

export function publishCareerMediaResponse(save: CareerSave, response: MediaResponse): CareerSave {
  if (save.mode !== 'PLAYER' || !save.legend) return save;
  const copy: Record<MediaResponse, string> = {
    THANK_FANS: 'The support means everything. I will keep working for this club.',
    STAY_FOCUSED: 'One match at a time. The work on the pitch comes first.',
    CALL_OUT_RIVALS: 'We respect everyone, but we are ready for the challenge.',
  };
  const followers = save.legend.phoneFollowers ?? 0;
  const followerDelta: Record<MediaResponse, number> = { THANK_FANS: 12, STAY_FOCUSED: 5, CALL_OUT_RIVALS: 18 };
  const post = {
    id: `career-post-${save.season}-${save.currentWeek}-${response}`,
    caption: copy[response],
    likes: Math.max(0, Math.round(followers * (response === 'CALL_OUT_RIVALS' ? 0.08 : 0.05))),
    week: save.currentWeek,
    season: save.season,
    comments: response === 'CALL_OUT_RIVALS' ? ['Big words. See you on matchday.', 'The rivalry is heating up.'] : ['Respect. Keep going.', 'We are behind you.'],
  };
  return {
    ...save,
    legend: {
      ...save.legend,
      phoneFollowers: followers + followerDelta[response],
      socialPosts: [post, ...(save.legend.socialPosts ?? [])].slice(0, 40),
    },
  };
}
