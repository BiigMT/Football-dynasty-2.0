import { useCallback, useMemo, useState } from 'react';
import { CareerSave, Player, TransferDealType } from '../types/football';
import { evaluateTransferBid } from '../engine/careerEngine';
export type NegotiationStage = 'ARRIVAL' | 'CLUB' | 'CONTRACT' | 'SIGNED' | 'WALKED_AWAY';
export type SquadRole = 'CRUCIAL' | 'IMPORTANT' | 'ROTATION' | 'PROSPECT';
export type Reaction = 'NEUTRAL' | 'PLEASED' | 'ANNOYED' | 'WALK_OUT';
type Tone = 'neutral' | 'positive' | 'warning' | 'angry';
interface Options { save: CareerSave; player: Player | null; onUpdateSave: (save: CareerSave) => void; initialPatience?: number; }
const roundTo = (n:number,step=50000) => Math.max(0,Math.round(n/step)*step);
const clamp = (n:number,min:number,max:number) => Math.min(max,Math.max(min,n));
export function useNegotiation({save,player,onUpdateSave,initialPatience=4}:Options) {
 const [stage,setStage]=useState<NegotiationStage>('ARRIVAL');
 const [patience,setPatience]=useState(initialPatience);
 const [offerFee,setOfferFee]=useState(player?roundTo(player.marketValue*1.02):0);
 const [sellOnPercentage,setSellOnPercentage]=useState(0);
 const [offerWage,setOfferWage]=useState(player?roundTo(player.weeklyWage*1.08,100):0);
 const [offerYears,setOfferYears]=useState(3);
 const [dealType,setDealType]=useState<TransferDealType>('PERMANENT');
 const [exchangeId,setExchangeId]=useState('');
 const [squadRole,setSquadRole]=useState<SquadRole>('IMPORTANT');
 const [releaseClauseEnabled,setReleaseClauseEnabled]=useState(false);
 const [releaseClause,setReleaseClause]=useState(player?roundTo(player.marketValue*2):0);
 const [signingBonus,setSigningBonus]=useState(player?roundTo(player.weeklyWage*12,1000):0);
 const [feedback,setFeedback]=useState('The clubs are taking their seats. Your opening offer is on the table.');
 const [feedbackTone,setFeedbackTone]=useState<Tone>('neutral');
 const [reaction,setReaction]=useState<Reaction>('NEUTRAL');
 const askingPrice=useMemo(()=>{
  if(!player)return 0;
  const base=player.marketValue*(dealType==='LOAN'?.14:1.0368);
  const quality=Math.max(0,player.overall-75)*.0025;
  const potential=Math.max(0,player.potential-player.overall)*.0015;
  const age=player.age<=21?.035:player.age>=30?-.025:0;
  const contract=clamp((player.contractYears-2)*.012,-.024,.036);
  return Math.round(base*(1+quality+potential+age+contract));
 },[player,dealType]);
 const exchangeValue=useMemo(()=>{const p=exchangeId?save.players[exchangeId]:undefined;return p?.clubId===save.userClubId?Math.round(p.marketValue*.85):0;},[exchangeId,save.players,save.userClubId]);
 const effectiveOffer=offerFee+exchangeValue;
 const club=save.clubs[save.userClubId];
 const remainingWageBudget=Math.max(0,(club?.finances.wageBudgetWeekly??0)-(club?.finances.weeklyWageBill??0));
 const upfrontCash=Math.max(0,offerFee*(1-sellOnPercentage/100*.12));
 const totalFirstYearCost=upfrontCash+signingBonus+offerWage*52;
 const tell=(s:string,t:Tone,r:Reaction)=>{setFeedback(s);setFeedbackTone(t);setReaction(r);};
 const losePatience=(amount:number)=>{const next=Math.max(0,patience-amount);setPatience(next);if(next===0){setStage('WALKED_AWAY');setReaction('WALK_OUT');return true;}return false;};
 const startClubMeeting=useCallback(()=>{setStage('CLUB');tell('Their sporting director leans forward. “We value this player highly, but let us hear your proposal.”','neutral','NEUTRAL');},[]);
 const submitClubOffer=()=>{
  if(!player||!club)return;
  if(!save.transferWindowOpen){tell('The transfer window is closed. Neither club can register this move.','warning','ANNOYED');return;}
  if(upfrontCash>club.finances.transferBudget){tell('Your offer exceeds the available transfer budget. The director refuses to discuss it.','warning','ANNOYED');return;}
  const ratio=effectiveOffer/Math.max(1,askingPrice);
  if(effectiveOffer>=askingPrice*.96){setStage('CONTRACT');tell('“We have an agreement between the clubs.” The player and agent are invited in to discuss personal terms.','positive','PLEASED');return;}
  if(ratio>=.78){
   const counter=roundTo((effectiveOffer+askingPrice)/2);
   setOfferFee(roundTo(Math.max(0,counter-exchangeValue)/Math.max(.01,1-sellOnPercentage/100*.12)));
   const walked=losePatience(1);
   if(!walked)tell('“You are not far away. Meet us in the middle: €'+counter.toLocaleString()+' including the exchange.” Patience −1.','warning','ANNOYED');
   return;
  }
  const walked=losePatience(2);
  if(walked)tell('The director pushes the offer back. “This is an insult. We are done.” The meeting ends immediately.','angry','WALK_OUT');
  else tell('The rival manager shakes their head. “That figure is nowhere near our valuation.” Patience −2.','angry','ANNOYED');
 };
 const submitContract=()=>{
  if(!player||!club)return;
  const factor=squadRole==='CRUCIAL'?1.18:squadRole==='IMPORTANT'?1.08:squadRole==='ROTATION'?.98:.88;
  const minimum=Math.ceil(player.weeklyWage*factor/100)*100;
  if(offerWage<minimum){const counter=roundTo((offerWage+minimum)/2,100);setOfferWage(counter);const walked=losePatience(1);if(!walked)tell('The agent counters at €'+counter.toLocaleString()+' per week and asks you to improve the role or salary. Patience −1.','warning','ANNOYED');return;}
  if(offerYears<1||offerYears>5){tell('Choose a contract between one and five years.','warning','NEUTRAL');return;}
  if(offerWage>remainingWageBudget){tell('The proposed wage exceeds your remaining weekly wage budget.','warning','ANNOYED');return;}
  if(signingBonus>club.finances.cashBalance){tell('The signing bonus is higher than the club cash available.','warning','ANNOYED');return;}
  const result=evaluateTransferBid(save,{playerId:player.id,dealType,fee:upfrontCash,proposedWage:offerWage,contractYears:offerYears,signingBonus,releaseClause:releaseClauseEnabled?releaseClause:0,exchangePlayerId:exchangeId||undefined,squadRole});
  if(result.accepted){
   const finalSave:CareerSave={...result.save,transferClauses:sellOnPercentage>0?{...result.save.transferClauses,[player.id]:{playerId:player.id,fromClubId:player.clubId,toClubId:save.userClubId,sellOnPercentage}}:result.save.transferClauses};
   onUpdateSave(finalSave);setStage('SIGNED');tell('TRANSFER AGREED — '+player.name+' has signed for '+club.name+'. The squad, transfer budget and wage bill have been updated.','positive','PLEASED');
  } else {if(result.counterFee)setOfferFee(result.counterFee);const walked=losePatience(1);if(!walked)tell(result.message+' The agent wants improved terms. Patience −1.','warning','ANNOYED');}
 };
 const walkAway=()=>{setStage('WALKED_AWAY');tell('You end the meeting. No transfer has been made.','neutral','WALK_OUT');};
 const reset=(p:Player|null=player)=>{setStage('ARRIVAL');setPatience(initialPatience);setOfferFee(p?roundTo(p.marketValue*1.02):0);setSellOnPercentage(0);setOfferWage(p?roundTo(p.weeklyWage*1.08,100):0);setOfferYears(3);setDealType('PERMANENT');setExchangeId('');setSquadRole('IMPORTANT');setReleaseClauseEnabled(false);setReleaseClause(p?roundTo(p.marketValue*2):0);setSigningBonus(p?roundTo(p.weeklyWage*12,1000):0);tell('The clubs are taking their seats. Your opening offer is on the table.','neutral','NEUTRAL');};
 return {stage,patience,offerFee,sellOnPercentage,offerWage,offerYears,dealType,exchangeId,squadRole,releaseClauseEnabled,releaseClause,signingBonus,feedback,feedbackTone,reaction,askingPrice,exchangeValue,effectiveOffer,upfrontCash,remainingWageBudget,totalFirstYearCost,setOfferFee,setSellOnPercentage,setOfferWage,setOfferYears,setDealType,setExchangeId,setSquadRole,setReleaseClauseEnabled,setReleaseClause,setSigningBonus,startClubMeeting,submitClubOffer,submitContract,walkAway,reset};
}
