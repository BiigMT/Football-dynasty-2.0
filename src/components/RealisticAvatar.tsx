import React, { useId } from 'react';

export type AvatarOutfit = 'manager_suit' | 'player_kit' | 'agent';
export type AvatarExpression = 'neutral' | 'pleased' | 'annoyed' | 'determined';
export type AvatarFaceShape = 'oval' | 'square_jaw' | 'lean' | 'broad';
export type AvatarHairStyle = 'fade' | 'buzzcut' | 'curly_crop' | 'swept_back' | 'receding' | 'afro' | 'locs' | 'mohawk';
export type AvatarFacialHair = 'clean' | 'stubble' | 'beard' | 'mustache';
export type KitPattern = 'solid' | 'vertical_stripes' | 'sash';
export interface RealisticAvatarProps {
  seed?: string; name?: string; size?: number; width?: number|string; height?: number|string; className?: string;
  outfit?: AvatarOutfit; skinTone?: string; faceShape?: AvatarFaceShape; hairStyle?: AvatarHairStyle;
  hairColor?: string; facialHair?: AvatarFacialHair; age?: number; expression?: AvatarExpression;
  primaryColor?: string; secondaryColor?: string; kitPattern?: KitPattern; tieColor?: string; shirtNumber?: number;
}
const SKIN = [['#F4D0B2','#B77B60'],['#E7B58F','#98634D'],['#D99B72','#84523F'],['#C9855D','#70412F'],['#A96D4E','#5D392C'],['#87563F','#472D25'],['#694331','#38271F'],['#4B3027','#291D1A']];
const HAIR = ['#17191D','#30231E','#49352A','#76513A','#A77B4E','#C7B18B'];
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};
export const RealisticAvatar:React.FC<RealisticAvatarProps>=({
 seed='football-dynasty',name='Football character',size=160,width,height,className='',outfit='player_kit',
 skinTone,faceShape,hairStyle,hairColor,facialHair,age=25,expression='neutral',
 primaryColor='#235BA8',secondaryColor='#10243A',kitPattern='solid',tieColor=primaryColor,shirtNumber
})=>{
 const uid=useId().replace(/:/g,''); const id='fd-avatar-'+uid; const h=hash(seed);
 const skin=skinTone||SKIN[h%8][0], shadow=SKIN[h%8][1], hair=hairColor||HAIR[(h>>>8)%HAIR.length];
 const shape=faceShape||(['oval','square_jaw','lean','broad'] as const)[(h>>>3)%4];
 const style=hairStyle||(['fade','buzzcut','curly_crop','swept_back','receding','afro','locs','mohawk'] as const)[(h>>>6)%8];
 const beard=facialHair||(['clean','stubble','beard','mustache'] as const)[(h>>>12)%4];
 const face=shape==='square_jaw'?'M35 43 Q35 22 50 21 Q65 22 65 43 L63 61 Q59 77 50 78 Q41 77 37 61Z':shape==='broad'?'M32 43 Q32 21 50 20 Q68 21 68 43 L65 62 Q60 78 50 79 Q40 78 35 62Z':shape==='lean'?'M37 42 Q37 22 50 21 Q63 22 63 42 L60 62 Q56 76 50 77 Q44 76 40 62Z':'M34 42 Q34 21 50 21 Q66 21 66 42 L63 61 Q59 76 50 78 Q41 76 37 61Z';
 const hairPath=style==='afro'?'M27 43 Q23 15 50 14 Q77 15 73 43 Q68 33 63 31 Q50 24 37 31 Q32 34 27 43Z':style==='locs'?'M31 40 Q27 18 50 18 Q73 18 69 40 L66 62 Q62 55 61 42 L56 59 L51 42 L46 60 L41 42 L36 58 L34 40Z':style==='mohawk'?'M39 40 Q37 14 50 12 Q63 14 61 40 L57 32 L43 32Z':style==='buzzcut'?'M33 39 Q31 20 50 19 Q69 20 67 39 L63 31 Q50 27 37 32Z':style==='receding'?'M34 38 Q33 19 50 19 Q65 19 66 37 L62 29 Q57 25 53 29 Q43 26 38 34Z':style==='swept_back'?'M32 39 Q30 17 50 17 Q69 16 69 38 Q61 28 48 28 Q40 28 32 39Z':'M32 40 Q30 18 50 18 Q70 18 68 40 L64 31 Q52 27 37 33Z';
 const mouth=expression==='pleased'?'M43 62 Q50 69 57 62':expression==='annoyed'?'M43 65 Q50 60 57 65':expression==='determined'?'M44 64 L56 64':'M44 63 Q50 65 56 63';
 const jacket=outfit==='manager_suit'?'#1b2938':outfit==='agent'?'#303b46':primaryColor;
 return <svg viewBox="0 0 100 128" width={width??size} height={height??size*1.28} className={className} role="img" aria-label={name} xmlns="http://www.w3.org/2000/svg">
 <defs>
  <linearGradient id={id+'-skin'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0df"/><stop offset=".22" stopColor={skin}/><stop offset=".72" stopColor={skin}/><stop offset="1" stopColor={shadow}/></linearGradient>
  <radialGradient id={id+'-light'} cx=".35" cy=".25" r=".8"><stop stopColor="#fff" stopOpacity=".42"/><stop offset=".6" stopColor="#fff" stopOpacity=".04"/><stop offset="1" stopColor={shadow} stopOpacity=".5" /></radialGradient>
  <linearGradient id={id+'-jacket'} x1="0" y1="0" x2="1" y2="1"><stop stopColor={jacket}/><stop offset=".55" stopColor={secondaryColor}/><stop offset="1" stopColor="#080f18"/></linearGradient>
  <linearGradient id={id+'-eye'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#aeb7bd"/></linearGradient>
  <linearGradient id={id+'-hair'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#777" stopOpacity=".2"/><stop offset=".3" stopColor={hair}/><stop offset="1" stopColor="#090b0e"/></linearGradient>
 </defs>
 <rect width="100" height="128" rx="5" fill="#101c29"/>
 <path d="M4 132 Q7 94 27 88 L39 82 H61 L73 88 Q94 96 97 132Z" fill={'url(#'+id+'-jacket)'}/>
 {outfit==='manager_suit'&&<><path d="M36 86 L50 99 L42 128 H10 Q15 98 36 86Z" fill="#263647"/><path d="M64 86 L50 99 L58 128 H90 Q85 98 64 86Z" fill="#101b28"/><path d="M47 98 L50 103 L53 98 L55 128 H45Z" fill={tieColor}/><path d="M38 85 L50 98 L43 105 L32 91Z M62 85 L50 98 L57 105 L68 91Z" fill="#f4f5f4"/></>}
 {outfit==='agent'&&<path d="M39 85 L50 99 L61 85 L58 80 H42Z" fill="#111820"/>}
 {outfit==='player_kit'&&<><path d="M4 132 Q7 94 27 88 L39 82 H61 L73 88 Q94 96 97 132Z" fill={primaryColor}/>{kitPattern==='vertical_stripes'&&<path d="M27 88 L38 84 L40 128 H26Z M48 98 L56 84 L62 87 L58 128 H47Z M75 90 L85 98 L82 128 H69Z" fill={secondaryColor} />}{kitPattern==='sash'&&<path d="M22 91 L34 84 L82 128 H65Z" fill={secondaryColor}/>}<path d="M39 83 L50 98 L61 83" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2"/>{shirtNumber!==undefined&&<text x="50" y="119" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">{shirtNumber}</text>}</>}
 <path d="M41 68 H59 V89 Q50 98 41 89Z" fill={'url(#'+id+'-skin)'}/>
 <path d="M34 43 Q29 48 32 57 Q35 62 38 56 M66 43 Q71 48 68 57 Q65 62 62 56" fill={skin} stroke={shadow}/>
 <path d={face} fill={'url(#'+id+'-skin)'}/><path d={face} fill={'url(#'+id+'-light)'}/>
 <path d={hairPath} fill={'url(#'+id+'-hair)'}/>
 {style==='curly_crop'&&<g fill={hair}>{Array.from({length:10},(_,i)=><circle key={i} cx={34+(i%5)*8} cy={22+Math.floor(i/5)*4} r="5"/>)}</g>}
 {style==='afro'&&<g fill={hair}>{Array.from({length:18},(_,i)=><circle key={i} cx={29+(i%6)*8} cy={19+Math.floor(i/6)*7} r="5.5"/>)}</g>}{style==='locs'&&<g fill="none" stroke={hair} strokeWidth="3.2" strokeLinecap="round">{[35,42,50,58,65].map((x,i)=><path key={i} d={`M${x} 24 Q${x-3} 42 ${x+1} ${54+(i%2)*8}`}/>)}</g>}{style==='mohawk'&&<path d="M46 17 Q50 9 54 17 L57 37 L43 37Z" fill={hair}/>} {style==='fade'&&<path d="M33 35 Q32 47 36 49 M67 35 Q68 47 64 49" fill="none" stroke={hair} strokeWidth="3"/>}
 <path d={expression==='annoyed'||expression==='determined'?'M38 42 L47 39 M53 39 L62 42':'M38 40 Q43 37 47 40 M53 40 Q57 37 62 40'} fill="none" stroke={hair} strokeWidth="2.7" strokeLinecap="round"/>
 <path d="M37 45 Q42 42 47 45 Q43 49 38 47Z M53 45 Q58 42 63 45 Q62 49 57 47Z" fill={'url(#'+id+'-eye)'}/>
 <ellipse cx="42" cy="45.5" rx="2" ry="2.4" fill="#49372a"/><ellipse cx="58" cy="45.5" rx="2" ry="2.4" fill="#49372a"/><circle cx="43" cy="44.8" r=".65" fill="#fff"/><circle cx="59" cy="44.8" r=".65" fill="#fff"/>
 <path d="M50 46 L47 57 Q50 59 53 57" fill="none" stroke={shadow} strokeWidth="1.6" strokeLinecap="round"/>
 {beard==='stubble'&&<path d="M37 58 Q39 73 50 75 Q61 73 63 58 Q59 66 55 65 Q50 68 45 65 Q40 66 37 58Z" fill={hair} opacity=".28"/>}
 {beard==='beard'&&<path d="M34 56 Q34 72 50 79 Q66 72 66 56 L62 64 Q50 72 38 64Z" fill={hair}/>}
 {beard==='mustache'&&<path d="M42 58 Q46 55 50 58 Q54 55 58 58 Q55 63 50 61 Q45 63 42 58Z" fill={hair}/>}
 {age>=38&&<g fill="none" stroke={shadow} strokeOpacity=".5"><path d="M37 51 Q40 53 43 51 M57 51 Q60 53 63 51 M39 57 L42 58 M58 58 L61 57"/>{age>=48&&<path d="M40 30 Q50 32 60 30 M39 34 Q50 36 61 34"/>}</g>}
 <path d={mouth} fill="none" stroke="#5b3029" strokeWidth="1.8" strokeLinecap="round"/>
 <rect x=".5" y=".5" width="99" height="127" rx="5" fill="none" stroke="#fff" strokeOpacity=".14"/>
 </svg>;
};
export default RealisticAvatar;
