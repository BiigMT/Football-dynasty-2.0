import { useCallback, useMemo, useState } from 'react';
import { CareerSave, Player, TransferDealType } from '../types/football';
import { evaluateTransferBid } from '../engine/careerEngine';
export type NegotiationStage='ARRIVAL'|'CLUB'|'CONTRACT'|'SIGNED'|'WALKED_AWAY';
interface Options { save:CareerSave; player:Player|null; onUpdateSave:(save:CareerSave)=>void; initialPatience?:number; }
const roundTo=(n:number,step=50000)=>Math.round(n/step)*step;
export function useNegotiation({save,player,onUpdateSave,initialPatience=5}:Options){
 const [stage,setStage]=useState<NegotiationStage>('ARRIVAL');
 const [patience,setPatience]=useState(initialPatience);
 const [offerFee,setOfferFee]=useState(player?.marketValue??0);
 const [offerWage,setOfferWage]=useState(player?Math.round(player.weeklyWage*1.05):0);
 const [offerYears,setOfferYears]=useState(3);
 const [dealType,setDealType]=useState<TransferDealType>('PERMANENT');
 const [exchangeId,setExchangeId]=useState('');
 const [feedback,setFeedback]=useState('');
 const [feedbackTone,setFeedbackTone]=useState<'neutral'|'positive'|'warning'|'angry'>('neutral');
 const askingPrice=useMemo(()=>player?(dealType==='LOAN'?Math.round(player.marketValue*.14):Math.round(player.marketValue*1.08)):0,[player,dealType]);
 const message=(s:string,t:'neutral'|'positive'|'warning'|'angry'='neutral')=>{setFeedback(s);setFeedbackTone(t);};
 const reset=useCallback((p:Player|null=player)=>{setStage('ARRIVAL');setPatience(initialPatience);setOfferFee(p?.marketValue??0);setOfferWage(p?Math.round(p.weeklyWage*1.05):0);setOfferYears(3);setDealType('PERMANENT');setExchangeId('');message('');},[player,initialPatience]);
 const startClubMeeting=()=>{setStage('CLUB');message('The selling club is ready to hear your opening offer.');};
 const submitClubOffer=()=>{
  if(!player)return;
  if(!save.transferWindowOpen){message('The transfer window is closed. No agreement can be registered.','warning');return;}
  const exchangeValue=exchangeId?(save.players[exchangeId]?.marketValue??0)*.85:0;
  const cashFee=dealType==='LOAN'?Math.round(player.marketValue*.15):Math.max(0,offerFee);
  if(cashFee>save.clubs[save.userClubId].finances.transferBudget){message('The offer exceeds your available transfer budget.','warning');return;}
  const total=cashFee+exchangeValue, ratio=total/Math.max(1,askingPrice);
  if(total>=askingPrice*.96){setStage('CONTRACT');message('The clubs have reached an agreement. Now settle personal terms with the player and agent.','positive');return;}
  if(ratio>=.72){const counter=roundTo((total+askingPrice)/2);setOfferFee(Math.max(0,roundTo(counter-exchangeValue)));setPatience(p=>Math.max(0,p-1));message('The selling club counters at '+ '€'+counter.toLocaleString()+'. Their director offers a middle ground. Patience −1.','warning');return;}
  const next=Math.max(0,patience-2);setPatience(next);
  if(next===0){setStage('WALKED_AWAY');message('The rival manager is furious: “That offer is nowhere near our valuation.” They end the meeting and walk out.','angry');}
  else message('The rival manager slams the folder shut: “That offer is nowhere near our valuation.” Patience −2.','angry');
 };
 const submitContract=()=>{
  if(!player)return;
  const expected=Math.ceil(player.weeklyWage*.92/100)*100;
  if(offerWage<expected){const revised=Math.round((offerWage+expected)/200)*100;setOfferWage(revised);setPatience(p=>Math.max(0,p-1));message('The agent counters at €'+revised.toLocaleString()+' per week — a middle-ground salary.','warning');return;}
  if(offerYears<2){setOfferYears(2);message('The player wants a minimum two-year contract.','warning');return;}
  const result=evaluateTransferBid(save,{playerId:player.id,dealType,fee:dealType==='LOAN'?Math.round(player.marketValue*.15):offerFee,proposedWage:offerWage,contractYears:offerYears,signingBonus:Math.round(offerFee*.05),releaseClause:offerFee*2,exchangePlayerId:exchangeId||undefined});
  if(result.accepted){onUpdateSave(result.save);setStage('SIGNED');message('TRANSFER AGREED — '+player.name+' joins '+save.clubs[save.userClubId].name+'. Squad and budgets updated.','positive');}
  else{if(result.counterFee)setOfferFee(result.counterFee);message(result.message,'warning');}
 };
 const walkAway=()=>{setStage('WALKED_AWAY');message('You have ended the meeting. No transfer has been made.');};
 return {stage,patience,offerFee,offerWage,offerYears,dealType,exchangeId,feedback,feedbackTone,askingPrice,setOfferFee,setOfferWage,setOfferYears,setDealType,setExchangeId,startClubMeeting,submitClubOffer,submitContract,walkAway,reset};
}
