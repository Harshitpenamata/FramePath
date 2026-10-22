// Home banner artwork: the five designed banners as live HTML text beside flat SVG drawings (from the designer's
// banner HTML/CSS). The words are real text, so search engines and screen readers read them and they stay sharp.
// Class names carry an hb- prefix so they can't collide with the site's own (.panel, .eyebrow, ...).
import React from 'react';

export type Banner={eyebrow:string;head:React.ReactNode;line:string;art:React.ReactNode};

// Shared drawings, used by the slides through <use href="#hb-...">.
export function BannerSymbols(){
 return <svg className="hb-defs" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <defs>
   <symbol id="hb-play" viewBox="0 0 100 100"><path d="M29 16Q23 12 23 21V79Q23 88 30 84L82 55Q90 50 82 45Z" fill="currentColor"/></symbol>
   <symbol id="hb-spark" viewBox="0 0 100 100"><path d="M50 0C44 34 34 44 0 50C34 56 44 66 50 100C56 66 66 56 100 50C66 44 56 34 50 0Z" fill="currentColor"/></symbol>
   <symbol id="hb-crop" viewBox="0 0 100 100"><path d="M32 8H8V32M68 8H92V32M8 68V92H32M68 92H92V68" fill="none" stroke="currentColor" strokeWidth="7"/></symbol>
   <symbol id="hb-nib" viewBox="0 0 100 100"><path d="M48 5L14 60L29 92H71L86 60L52 5V51A9 9 0 1 1 48 51Z" fill="currentColor"/></symbol>
   <symbol id="hb-pencil" viewBox="0 0 100 100">
    <path d="M16 66L65 17L84 36L35 85L10 91Z" fill="currentColor"/>
    <path d="M70 12L77 5Q81 1 85 5L96 16Q100 20 96 24L89 31Z" fill="currentColor"/>
    <path d="M16 70L30 84L12 89Z" fill="#000"/>
   </symbol>
   <symbol id="hb-aperture" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="currentColor"/>
    <g fill="none" strokeWidth="4" style={{stroke:'var(--hb-cut,#000)'}}>
     {[0,60,120,180,240,300].map(r=><path key={r} d="M50 50L72 12" transform={r?`rotate(${r} 50 50)`:undefined}/>)}
    </g>
   </symbol>
   <symbol id="hb-wave" viewBox="0 0 100 100"><path d="M10 44V56M26 30V70M42 13V87M58 23V77M74 35V65M90 44V56" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/></symbol>
   <symbol id="hb-chat" viewBox="0 0 100 100"><path d="M19 10H81Q95 10 95 25V66Q95 81 80 81H44L23 97V81H19Q5 81 5 66V25Q5 10 19 10Z" fill="currentColor"/></symbol>
   <symbol id="hb-cursor" viewBox="0 0 100 100"><path d="M18 8L84 60L55 65L70 89L55 97L41 71L23 91Z" fill="#000" strokeWidth="3" strokeLinejoin="round" style={{stroke:'var(--hb-cream)'}}/></symbol>
   <symbol id="hb-check" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="5"/>
    <path d="M29 51L43 65L73 34" fill="none" stroke="currentColor" strokeWidth="6"/>
   </symbol>
  </defs>
 </svg>;
}

const Art=({children}:{children:React.ReactNode})=><svg className="hb-art" viewBox="0 0 640 500" aria-hidden="true" focusable="false">{children}</svg>;

export const banners:Banner[]=[
 {eyebrow:'India’s first full-stack creative education platform',
  head:<>Your creative career, mapped by industry leaders. <span>Powered by AI.</span></>,
  line:'From your first frame to your first film, beginner to advanced, all in one place.',
  art:<Art>
   <rect className="hb-panel" x="385" y="25" width="220" height="205" rx="24"/>
   <use href="#hb-nib" x="450" y="53" width="90" height="105"/>
   <rect className="hb-paper" x="425" y="285" width="195" height="185" rx="22"/>
   <use className="hb-ink hb-cut-paper" href="#hb-aperture" x="457" y="315" width="130" height="130"/>
   <rect className="hb-paper" x="35" y="95" width="465" height="345" rx="25"/>
   <g className="hb-ink"><circle cx="65" cy="120" r="6"/><circle cx="85" cy="120" r="6"/><circle cx="105" cy="120" r="6"/></g>
   <rect className="hb-black" x="58" y="145" width="419" height="217" rx="16"/>
   <use href="#hb-crop" x="173" y="164" width="182" height="182"/>
   <use href="#hb-play" x="217" y="206" width="95" height="95"/>
   <use className="hb-ink" href="#hb-play" x="62" y="380" width="30" height="30"/>
   <rect className="hb-muted-fill" x="114" y="380" width="158" height="22" rx="6"/>
   <rect className="hb-lime-fill" x="284" y="380" width="190" height="22" rx="6"/>
   <rect className="hb-muted-fill" x="114" y="411" width="244" height="10" rx="5"/>
   <rect className="hb-tab" x="470" y="208" width="98" height="98" rx="24"/>
   <use className="hb-ink" href="#hb-spark" x="489" y="227" width="60" height="60"/>
  </Art>},
 {eyebrow:'Curated by people who’ve done it',
  head:<>Most of our industry leaders <span>never went</span> to film school.</>,
  line:'They learned from the internet and from great mentors. Now they’ve mapped the path for you.',
  art:<Art>
   <rect className="hb-panel" x="320" y="25" width="295" height="220" rx="23"/>
   <path className="hb-cream-fill" d="M355 100V78Q355 52 383 49V64Q369 66 369 78H383V110H355ZM399 100V78Q399 52 427 49V64Q413 66 413 78H427V110H399Z"/>
   <g className="hb-muted-stroke" strokeWidth="8" strokeLinecap="round"><path d="M451 80H581M451 104H562M451 128H530"/></g>
   <use href="#hb-pencil" x="518" y="149" width="65" height="65"/>
   <rect className="hb-paper" x="30" y="145" width="440" height="310" rx="25"/>
   <rect className="hb-black" x="52" y="168" width="396" height="220" rx="16"/>
   <use href="#hb-crop" x="160" y="190" width="176" height="176"/>
   <use href="#hb-play" x="202" y="231" width="94" height="94"/>
   <use className="hb-ink" href="#hb-play" x="56" y="409" width="27" height="27"/>
   <path d="M109 422H390" className="hb-muted-stroke" strokeWidth="9" strokeLinecap="round"/>
   <path d="M109 422H244" stroke="#000" strokeWidth="9" strokeLinecap="round"/>
   <circle cx="244" cy="422" r="13" className="hb-black"/>
   <rect className="hb-tab" x="442" y="252" width="99" height="99" rx="24"/>
   <use className="hb-ink" href="#hb-spark" x="463" y="273" width="57" height="57"/>
  </Art>},
 {eyebrow:'Beginner to advanced',
  head:<>700+ curated pathways. In <span>every course.</span></>,
  line:'From first steps to advanced craft, the whole climb is mapped.',
  art:<Art>
   <rect className="hb-panel" x="436" y="30" width="169" height="200" rx="23"/>
   <use className="hb-lime" href="#hb-spark" x="505" y="83" width="58" height="58"/>
   <rect className="hb-panel" x="35" y="86" width="515" height="370" rx="25"/>
   <rect className="hb-panel" x="55" y="108" width="148" height="151" rx="20"/>
   <rect className="hb-panel" x="218" y="108" width="148" height="151" rx="20"/>
   <rect className="hb-lime-fill" x="381" y="108" width="148" height="151" rx="20"/>
   <rect className="hb-panel" x="55" y="278" width="148" height="151" rx="20"/>
   <rect className="hb-panel" x="218" y="278" width="148" height="151" rx="20"/>
   <rect className="hb-panel" x="381" y="278" width="148" height="151" rx="20"/>
   <use href="#hb-crop" x="87" y="141" width="84" height="84"/>
   <use href="#hb-play" x="250" y="141" width="84" height="84"/>
   <use className="hb-ink hb-cut-lime" href="#hb-aperture" x="408" y="135" width="94" height="94"/>
   <use href="#hb-nib" x="86" y="307" width="86" height="86"/>
   <use href="#hb-wave" x="246" y="310" width="92" height="92"/>
   <g className="hb-cream-fill">
    <rect x="402" y="309" width="105" height="45" rx="5"/>
    <rect x="402" y="365" width="47" height="42" rx="5"/>
    <rect x="460" y="365" width="47" height="42" rx="5"/>
   </g>
  </Art>},
 {eyebrow:'Your pathway is free',
  head:<>Know a little?<br/> Know a lot?<br/> Start <span>right there.</span></>,
  line:'Share what you know and how far you’ve come. We map what comes next.',
  art:<Art>
   <rect className="hb-paper" x="130" y="65" width="460" height="382" rx="24"/>
   <rect className="hb-panel" x="20" y="151" width="184" height="248" rx="22"/>
   <rect className="hb-tab" x="214" y="116" width="192" height="300" rx="24"/>
   <rect className="hb-panel" x="416" y="151" width="184" height="248" rx="22"/>
   <circle className="hb-track" cx="112" cy="242" r="51"/>
   <circle className="hb-value" cx="112" cy="242" r="51" pathLength={100} strokeDasharray="22 100" transform="rotate(-90 112 242)"/>
   <circle cx="310" cy="230" r="55" fill="none" stroke="#8C9649" strokeWidth="15"/>
   <circle cx="310" cy="230" r="55" fill="none" stroke="#000" strokeWidth="15" strokeLinecap="round" pathLength={100} strokeDasharray="57 100" transform="rotate(-90 310 230)"/>
   <circle className="hb-track" cx="508" cy="242" r="51"/>
   <circle className="hb-value" cx="508" cy="242" r="51" pathLength={100} strokeDasharray="97 100" transform="rotate(-90 508 242)"/>
   <use href="#hb-cursor" x="330" y="247" width="76" height="90"/>
   <g strokeWidth="13" strokeLinecap="round">
    <path className="hb-cream-stroke" d="M54 330H155M450 330H552"/>
    <path className="hb-muted-stroke" d="M54 354H128M450 354H524"/>
    <path stroke="#000" d="M251 339H358"/>
    <path className="hb-muted-stroke" d="M251 365H368"/>
   </g>
  </Art>},
 {eyebrow:'Learn your way',
  head:<>Learn with AI.<br/> Or learn with<br/> <span>a mentor.</span></>,
  line:'Self-paced with AI-driven assignments and feedback, or a mentor-led program.',
  art:<Art>
   <rect className="hb-paper" x="280" y="65" width="135" height="355" rx="23"/>
   <rect className="hb-panel" x="35" y="90" width="305" height="290" rx="24"/>
   <rect className="hb-panel" x="328" y="145" width="285" height="290" rx="24"/>
   <use href="#hb-crop" x="82" y="135" width="210" height="210"/>
   <use href="#hb-spark" x="112" y="165" width="150" height="150"/>
   <rect className="hb-tab" x="5" y="159" width="83" height="83" rx="19"/>
   <use className="hb-ink" href="#hb-check" x="17" y="171" width="59" height="59"/>
   <use href="#hb-chat" x="428" y="260" width="140" height="140"/>
   <use className="hb-chat-front" href="#hb-chat" x="369" y="207" width="150" height="150"/>
   <g className="hb-ink"><circle cx="410" cy="257" r="8"/><circle cx="438" cy="257" r="8"/><circle cx="466" cy="257" r="8"/></g>
   <circle className="hb-tab" cx="555" cy="226" r="38"/>
   <use className="hb-ink" href="#hb-pencil" x="534" y="204" width="43" height="43"/>
  </Art>},
];
