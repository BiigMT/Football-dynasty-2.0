import React, { useState } from 'react';
import { Mic, Newspaper, Radio, Users } from 'lucide-react';

interface ManagerPressConferenceProps {
  managerName: string;
  clubName: string;
  onAnswer: (boardDelta: number, chemistryDelta: number, reputationDelta: number, response: string) => void;
  onContinue: () => void;
}

const QUESTIONS = [
  { label: 'What is your first priority?', options: [
    { label: 'Build a clear identity and trust the process', response: 'We will build a clear identity, work together and earn results through consistency.', board: 2, chemistry: 3, reputation: 1 },
    { label: 'Demand results immediately', response: 'This club deserves results. We will compete hard from the first match.', board: 1, chemistry: -1, reputation: 2 },
    { label: 'Rebuild patiently around young talent', response: 'We will give young players a pathway and build something sustainable.', board: 1, chemistry: 2, reputation: 1 },
  ]},
  { label: 'Can you promise the supporters trophies?', options: [
    { label: 'Promise to fight for every trophy', response: 'I promise ambition, commitment and a team that fights for every trophy.', board: 1, chemistry: 2, reputation: 2 },
    { label: 'Avoid unrealistic promises', response: 'I will not make empty promises. We will focus on standards and performances.', board: 2, chemistry: 1, reputation: 1 },
    { label: 'Say the squad is not ready yet', response: 'We have work to do. I would rather be honest about the challenge ahead.', board: -1, chemistry: 0, reputation: 0 },
  ]},
  { label: 'Will young players get opportunities?', options: [
    { label: 'Give academy players a genuine chance', response: 'If a young player earns their place in training, age will not hold them back.', board: 1, chemistry: 3, reputation: 2 },
    { label: 'Only select players who are ready', response: 'Selection will be based on quality, readiness and what the team needs.', board: 2, chemistry: 1, reputation: 1 },
    { label: 'Prioritise experienced players', response: 'Experience matters in big moments, but everyone will have to earn their place.', board: 0, chemistry: -1, reputation: 0 },
  ]},
];

export const ManagerPressConference: React.FC<ManagerPressConferenceProps> = ({ managerName, clubName, onAnswer, onContinue }) => {
  const [question, setQuestion] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastResponse, setLastResponse] = useState('');

  const answer = (option: typeof QUESTIONS[number]['options'][number]) => {
    onAnswer(option.board, option.chemistry, option.reputation, option.response);
    setLastResponse(option.response);
    setAnswered(true);
  };

  return (
    <div className="min-h-screen bg-[#070b10] text-white flex items-center justify-center p-3 sm:p-6">
      <style>{`
        @keyframes manager-breathe { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(1deg); } }
        @keyframes manager-look { 0%,35%,100% { transform: translateX(0); } 45%,75% { transform: translateX(3px); } }
        @keyframes reporter-move { 0%,100% { transform: rotate(-1deg); } 50% { transform: rotate(1.5deg); } }
        .manager-idle { animation: manager-breathe 3.2s ease-in-out infinite; transform-origin: center bottom; }
        .manager-eyes { animation: manager-look 4.6s ease-in-out infinite; }
        .reporter-idle { animation: reporter-move 2.8s ease-in-out infinite; transform-origin: center bottom; }
      `}</style>
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#101923] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-400">Club media room</p><h1 className="text-lg font-black sm:text-2xl">The unveiling</h1></div>
          <div className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-300">LIVE <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" /></div>
        </div>
        <div className="relative grid min-h-[280px] grid-cols-1 gap-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(8,145,178,.2),transparent_65%)] md:grid-cols-[1.4fr_1fr]">
          <div className="relative flex min-h-[250px] items-end justify-center overflow-hidden border-b border-white/10 px-4 pt-8 md:border-b-0 md:border-r">
            <div className="absolute inset-x-8 top-7 h-24 rounded-xl border border-cyan-300/15 bg-[#142332] shadow-inner"><div className="flex h-full items-center justify-center text-center"><div><div className="text-[10px] font-black tracking-[.35em] text-cyan-300">{clubName.toUpperCase()}</div><div className="mt-1 text-[9px] tracking-[.2em] text-slate-500">OFFICIAL MEDIA CONFERENCE</div></div></div></div>
            <div className="reporter-idle absolute bottom-0 left-5 h-24 w-16 rounded-t-[45%] bg-[#263747] opacity-90"><div className="absolute -top-7 left-4 h-9 w-9 rounded-full bg-[#9b684e]" /><div className="absolute -top-1 left-11 h-10 w-2 rotate-[-25deg] rounded bg-slate-500" /></div>
            <div className="reporter-idle absolute bottom-0 right-5 h-28 w-20 rounded-t-[45%] bg-[#1c2c3a] opacity-90" style={{animationDelay:'-.8s'}}><div className="absolute -top-7 left-5 h-9 w-9 rounded-full bg-[#c18b68]" /><div className="absolute -top-1 -left-5 h-10 w-2 rotate-[25deg] rounded bg-slate-400" /></div>
            <div className="manager-idle relative z-10 mb-0 flex flex-col items-center">
              <div className="relative h-28 w-24 rounded-t-[42%] bg-[#b77d5e] shadow-lg"><div className="absolute -top-2 left-2 h-9 w-20 rounded-t-full bg-[#17191d]" /><div className="manager-eyes absolute left-6 top-12 flex gap-5"><span className="h-1.5 w-2 rounded-full bg-[#1c2025]" /><span className="h-1.5 w-2 rounded-full bg-[#1c2025]" /></div><div className="absolute left-10 top-[4.2rem] h-1 w-4 rounded-full bg-[#754b3e]" /></div>
              <div className="h-28 w-44 rounded-t-[2.5rem] bg-gradient-to-b from-[#263c50] to-[#172838] shadow-xl"><div className="mx-auto mt-4 h-9 w-9 rounded-full border border-cyan-300/40 bg-cyan-400/15" /></div>
              <div className="absolute bottom-20 left-1/2 h-10 w-2 -translate-x-1/2 rounded-full bg-slate-400"><div className="absolute -top-3 -left-2 h-3 w-6 rounded bg-slate-300" /></div>
            </div>
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-7">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300"><Users size={15}/> Journalists are waiting</div>
            <h2 className="text-2xl font-black">{managerName}</h2>
            <p className="mt-1 text-sm text-slate-400">New manager of {clubName}</p>
            <div className="mt-5 rounded-xl border border-white/10 bg-[#0b121a] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-400"><Newspaper size={14}/> {answered ? 'Your response' : 'A journalist asks'}</div>
              <p className="text-sm font-bold leading-6">{answered ? lastResponse : QUESTIONS[question].label}</p>
            </div>
            <div className="mt-4 grid gap-2">
              {!answered ? QUESTIONS[question].options.map((option) => (
                <button key={option.label} onClick={() => answer(option)} className="min-h-11 rounded-lg border border-white/10 bg-[#172533] px-3 py-2 text-left text-xs font-semibold text-white hover:border-cyan-400 hover:bg-cyan-400/10">{option.label}</button>
              )) : question < QUESTIONS.length - 1 ? (
                <button onClick={() => { setQuestion((v) => v + 1); setAnswered(false); }} className="min-h-11 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300">Next question</button>
              ) : (
                <button onClick={onContinue} className="min-h-11 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"><Radio size={16} className="mr-2 inline"/> Enter the club</button>
              )}
              <p className="text-center text-[10px] text-slate-500">Question {question + 1} of {QUESTIONS.length} · Your answers shape the club's first impression</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
