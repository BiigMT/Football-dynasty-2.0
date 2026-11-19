import React from 'react';
import { Trash2, FolderPlus, Play, Save } from 'lucide-react';
import { SaveSlotSummary } from '../engine/storage';
import { ClubBadge } from './ClubBadge';
import { RealisticAvatar } from './RealisticAvatar';
import { CareerMode } from '../types/football';

interface SaveSlotsScreenProps {
  slots: SaveSlotSummary[];
  onLoad: (slotId: string) => void;
  onNewCareer: (mode: CareerMode, slotId: string) => void;
  onDelete: (slotId: string) => void;
  onOverwrite?: (slotId: string) => void;
}
const money = (value?: number) => value == null ? '—' : value >= 1_000_000 ? `€${(value/1_000_000).toFixed(1)}M` : `€${Math.round(value/1000)}K`;
export const SaveSlotsScreen: React.FC<SaveSlotsScreenProps> = ({ slots, onLoad, onNewCareer, onDelete, onOverwrite }) => (
  <section className="fd-save-panel">
    <header className="fd-save-heading"><div><span>MASTER LEAGUE / BECOME A LEGEND</span><h2>CAREER DATA MANAGEMENT</h2></div><b>{slots.filter(s => !s.empty).length} / 5 SAVED</b></header>
    <div className="fd-save-list">{slots.map((slot, index) => <article key={slot.slotId} className={`fd-save-slot ${slot.empty ? 'empty' : ''}`}>
      <div className="fd-slot-index">SLOT {String(index+1).padStart(2,'0')}</div>
      {slot.empty ? <><div className="fd-empty-copy"><strong>EMPTY SAVE DATA</strong><span>No career data stored in this slot</span></div><div className="fd-slot-actions"><button className="fd-new-save" onClick={() => onNewCareer('MANAGER',slot.slotId)}><FolderPlus size={14}/> NEW MANAGER</button><button className="fd-new-save player" onClick={() => onNewCareer('PLAYER',slot.slotId)}>NEW PLAYER</button></div></> :
      <>
        <div className="fd-save-identity"><div className={`fd-mode-tag ${slot.mode === 'PLAYER' ? 'player' : ''}`}>{slot.mode === 'PLAYER' ? 'PLAYER CAREER' : 'MANAGER CAREER'}</div><div className="fd-save-club"><ClubBadge shortName={slot.clubShortName ?? slot.clubName ?? 'FD'} primaryColor={slot.clubPrimaryColor ?? '#235BA8'} secondaryColor={slot.clubSecondaryColor ?? '#E8EDF5'} country={slot.clubCountry} size={48}/><RealisticAvatar seed={slot.playerName ?? slot.managerName ?? slot.title ?? slot.slotId} name={slot.playerName ?? slot.managerName ?? 'Career profile'} outfit={slot.mode === 'PLAYER' ? 'player_kit' : 'manager_suit'} size={48} primaryColor={slot.clubPrimaryColor ?? '#235BA8'} secondaryColor={slot.clubSecondaryColor ?? '#E8EDF5'}/></div></div>
        <div className="fd-save-info"><h3>{slot.clubName ?? slot.title}</h3><p>{slot.mode === 'PLAYER' ? slot.playerName : slot.managerName} · Season {slot.season} · Week {slot.week}</p><div className="fd-save-stats"><b>{slot.mode === 'PLAYER' ? `${slot.playerOverall ?? '—'} OVR` : slot.leaguePosition ? `${slot.leaguePosition}${slot.leaguePosition===1?'st':slot.leaguePosition===2?'nd':slot.leaguePosition===3?'rd':'th'} PLACE` : 'MASTER LEAGUE'}</b><span>{slot.mode === 'PLAYER' ? money(slot.marketValue) : money(slot.transferBudget)} {slot.mode === 'PLAYER' ? 'MARKET VALUE' : 'TRANSFER BUDGET'}</span></div><small>LAST SAVED · {slot.updatedAt ? new Date(slot.updatedAt).toLocaleString() : 'DATE UNKNOWN'}</small></div>
        <div className="fd-slot-actions"><button className="fd-load-save" onClick={() => onLoad(slot.slotId)}><Play size={13} fill="currentColor"/> LOAD</button>{onOverwrite && <button className="fd-overwrite-save" onClick={() => onOverwrite(slot.slotId)}><Save size={13}/> OVERWRITE</button>}<button className="fd-delete-save" aria-label={`Delete slot ${index+1}`} onClick={() => {if(window.confirm(`Delete SLOT ${String(index+1).padStart(2,'0')}? This career save cannot be recovered.`)) onDelete(slot.slotId);}}><Trash2 size={15}/></button></div>
      </>}
    </article>)}</div>
    <style>{`
      .fd-save-panel{width:100%;background:rgba(13,27,42,.88);border:1px solid #8aa8cc33;box-shadow:0 14px 35px #0005;color:#e8edf5;padding:clamp(10px,2vw,18px);font-family:'Barlow Condensed',sans-serif}
      .fd-save-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #ffffff20;padding-bottom:10px;margin-bottom:9px}.fd-save-heading span{font-size:9px;letter-spacing:.2em;color:#f6c21c;font-weight:800}.fd-save-heading h2{font-size:clamp(18px,3vw,25px);font-weight:900;letter-spacing:.06em;margin:0}.fd-save-heading>b{font-size:10px;color:#c8d6e8;white-space:nowrap}
      .fd-save-list{display:flex;flex-direction:column;gap:7px}.fd-save-slot{display:grid;grid-template-columns:70px minmax(90px,.75fr) minmax(0,2fr) auto;align-items:center;gap:12px;min-height:92px;padding:9px 12px;background:linear-gradient(100deg,#0a1727ed,#112b49c9);border:1px solid #7895b333;border-left:3px solid #235ba8}
      .fd-slot-index{align-self:start;padding-top:4px;font-size:11px;letter-spacing:.1em;color:#f6c21c;font-weight:900;white-space:nowrap}
      .fd-save-identity{display:flex;flex-direction:column;gap:5px}.fd-mode-tag{font-size:9px;letter-spacing:.09em;color:#8fc0ff;font-weight:900}.fd-mode-tag.player{color:#f6c21c}.fd-save-club{display:flex;align-items:center;gap:7px}
      .fd-save-info{min-width:0}.fd-save-info h3{font-size:17px;font-weight:900;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0}.fd-save-info p{font:10px system-ui;color:#b8c7d8;margin:3px 0 5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fd-save-stats{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:10px}.fd-save-stats b{color:#f6c21c}.fd-save-stats span{color:#d0dceb}.fd-save-info small{display:block;margin-top:4px;font:9px system-ui;color:#8194aa}
      .fd-slot-actions{display:flex;align-items:center;gap:6px}.fd-slot-actions button{min-height:34px;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:0 11px;font-size:10px;font-weight:900;letter-spacing:.06em;white-space:nowrap;border:1px solid transparent}
      .fd-load-save{background:#235ba8;color:white}.fd-load-save:hover{background:#3474ca}.fd-overwrite-save{background:#f6c21c;color:#101a28}.fd-delete-save{width:34px;padding:0!important;background:#ffffff0b;border-color:#ffffff22!important;color:#d7e0ec}.fd-delete-save:hover{background:#9e3445;color:white}
      .fd-save-slot.empty{grid-template-columns:70px minmax(0,1fr) auto;border:1px dashed #91a9c055;border-left:3px dashed #f6c21c;background:#0a17277a;min-height:72px}.fd-empty-copy{display:flex;flex-direction:column;gap:3px}.fd-empty-copy strong{font-size:14px;letter-spacing:.08em;color:#c7d4e4}.fd-empty-copy span{font:10px system-ui;color:#71849b}.fd-new-save{min-height:34px;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:0 10px;background:#235ba8;color:white;font-size:9px;font-weight:900;white-space:nowrap}.fd-new-save.player{background:#235ba8}
      @media(max-width:680px){.fd-save-slot{grid-template-columns:54px minmax(0,1fr);gap:8px}.fd-save-identity{grid-column:2;grid-row:1}.fd-save-info{grid-column:1/-1}.fd-slot-actions{grid-column:1/-1;justify-content:flex-end}.fd-save-slot.empty{grid-template-columns:54px minmax(0,1fr)}.fd-save-slot.empty .fd-slot-actions{grid-column:2;justify-content:flex-start}.fd-save-info h3{white-space:normal}.fd-save-stats{gap:7px}}
      @media(max-height:540px) and (orientation:landscape){.fd-save-slot{min-height:72px;padding:6px 9px}.fd-save-club svg{width:36px;height:36px}.fd-save-info h3{font-size:15px}}
    `}</style>
  </section>
);
