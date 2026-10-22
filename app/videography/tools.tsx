'use client';
import React,{useMemo,useState} from 'react';
import {ArrowDown,ArrowUp,Check,RotateCcw,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {Tool} from './lessons';

// Small hands-on tools for a lesson's Reflect step. Each calls onSolved once the learner gets it right.
type Props={tool:Tool;onSolved:()=>void};
type Result={ok:boolean;text:string}|null;

// Same shuffle on server and client, so the page renders the same both times.
function shuffled<T>(items:T[],seed:string):T[]{
 let h=0;for(const c of seed)h=(h*31+c.charCodeAt(0))|0;
 const out=[...items];for(let i=out.length-1;i>0;i--){h=(h*1103515245+12345)|0;const j=Math.abs(h)%(i+1);[out[i],out[j]]=[out[j],out[i]]}
 if(out.every((x,i)=>x===items[i])&&out.length>1)out.push(out.shift()!);
 return out;
}

function Feedback({result}:{result:Result}){
 if(!result)return null;
 return <p role="status" className={'vg-tool-result '+(result.ok?'ok':'no')}>{result.ok?<Check size={16}/>:<X size={16}/>}{result.text}</p>;
}

export function LessonTool({tool,onSolved}:Props){
 const [result,setResult]=useState<Result>(null);
 const report=(r:Result)=>{setResult(r);if(r?.ok)onSolved()};
 const body=(()=>{switch(tool.kind){
  case 'order':return <OrderTool tool={tool} report={report}/>;
  case 'sort':return <SortTool tool={tool} report={report}/>;
  case 'pick':return <PickTool tool={tool} report={report}/>;
  case 'spot':return <SpotTool tool={tool} report={report}/>;
  case 'exposure':return <ExposureTool tool={tool} report={report}/>;
  case 'whitebalance':return <WhiteBalanceTool tool={tool} report={report}/>;
  case 'mix':return <MixTool tool={tool} report={report}/>;
  case 'frame':return <FrameTool tool={tool} report={report}/>;
 }})();
 return <div className="vg-tool"><p className="vg-tool-prompt">{tool.prompt}</p>{body}<Feedback result={result}/></div>;
}

type R={report:(r:Result)=>void};

function OrderTool({tool,report}:{tool:Extract<Tool,{kind:'order'}>}&R){
 const [items,setItems]=useState(()=>shuffled(tool.items,tool.prompt));
 const [checked,setChecked]=useState(false);
 const move=(i:number,d:number)=>{const j=i+d;if(j<0||j>=items.length)return;const next=[...items];[next[i],next[j]]=[next[j],next[i]];setItems(next);setChecked(false);report(null)};
 function check(){setChecked(true);const right=items.filter((x,i)=>x===tool.items[i]).length;report(right===items.length?{ok:true,text:'Right order! '+tool.why}:{ok:false,text:`${right} of ${items.length} in the right place. Move the red ones.`})}
 return <><ol className="vg-order">{items.map((x,i)=><li key={x} className={checked?(x===tool.items[i]?'ok':'no'):''}><span>{x}</span>
  <Button type="button" size="sm" variant="ghost" aria-label={'Move up: '+x} disabled={i===0} onClick={()=>move(i,-1)}><ArrowUp size={16}/></Button>
  <Button type="button" size="sm" variant="ghost" aria-label={'Move down: '+x} disabled={i===items.length-1} onClick={()=>move(i,1)}><ArrowDown size={16}/></Button></li>)}</ol>
  <Button type="button" onClick={check}>Check my order</Button></>;
}

function SortTool({tool,report}:{tool:Extract<Tool,{kind:'sort'}>}&R){
 const items=useMemo(()=>shuffled(tool.items,tool.prompt),[tool]);
 const [choice,setChoice]=useState<Record<string,number>>({});
 const [checked,setChecked]=useState(false);
 const set=(text:string,g:number)=>{setChoice(c=>({...c,[text]:g}));setChecked(false);report(null)};
 function check(){setChecked(true);if(Object.keys(choice).length<items.length){report({ok:false,text:'Put every item in a group first.'});return}const wrong=items.filter(([t,g])=>choice[t]!==g).length;report(wrong?{ok:false,text:`${wrong} not quite right. Try the red ones again.`}:{ok:true,text:'All sorted! '+tool.why})}
 return <><ul className="vg-sort">{items.map(([text,g])=><li key={text} className={checked&&choice[text]!==undefined?(choice[text]===g?'ok':'no'):''}><span>{text}</span>
  <div className="vg-chips" role="group" aria-label={text}>{tool.groups.map((name,i)=><button type="button" key={name} aria-pressed={choice[text]===i} className={choice[text]===i?'selected':''} onClick={()=>set(text,i)}>{name}</button>)}</div></li>)}</ul>
  <Button type="button" onClick={check}>Check</Button></>;
}

function PickTool({tool,report}:{tool:Extract<Tool,{kind:'pick'}>}&R){
 const [picked,setPicked]=useState<number|null>(null);
 return <div className="vg-pick">{tool.options.map(([text,correct,why],i)=><button type="button" key={text} aria-pressed={picked===i} className={picked===i?(correct?'ok':'no'):''} onClick={()=>{setPicked(i);report({ok:correct,text:correct?why:why+' Try another answer.'})}}>{text}</button>)}</div>;
}

function SpotTool({tool,report}:{tool:Extract<Tool,{kind:'spot'}>}&R){
 const [on,setOn]=useState<Set<string>>(new Set());
 const [checked,setChecked]=useState(false);
 const toggle=(t:string)=>{setOn(prev=>{const n=new Set(prev);n.has(t)?n.delete(t):n.add(t);return n});setChecked(false);report(null)};
 function check(){setChecked(true);const missed=tool.items.filter(([t,bad])=>bad&&!on.has(t)).length,extra=tool.items.filter(([t,bad])=>!bad&&on.has(t)).length;report(!missed&&!extra?{ok:true,text:'Spot on! '+tool.why}:{ok:false,text:[missed&&`You missed ${missed}.`,extra&&`${extra} ${extra>1?'are':'is'} fine to keep.`].filter(Boolean).join(' ')})}
 return <><div className={'vg-spot '+(tool.look||'list')}>{tool.items.map(([t,bad])=><button type="button" key={t} aria-pressed={on.has(t)} className={(on.has(t)?'selected ':'')+(checked&&on.has(t)!==bad?'no':'')} onClick={()=>toggle(t)}>{tool.look==='timeline'&&on.has(t)&&<X size={14}/>}{t}</button>)}</div>
  <Button type="button" onClick={check}>Check</Button></>;
}

// Exposure in stops: aperture f/1.8 (brightest) to f/16, shutter 1/30 to 1/1000, ISO 100 to 6400.
const apertures=['f/1.8','f/2.8','f/4','f/5.6','f/8','f/11','f/16'],shutters=['1/30','1/60','1/125','1/250','1/500','1/1000'],isos=['100','200','400','800','1600','3200','6400'];
const sceneLight=9;
function ExposureTool({tool,report}:{tool:Extract<Tool,{kind:'exposure'}>}&R){
 const [a,setA]=useState(3),[sh,setSh]=useState(2),[iso,setIso]=useState(0);
 const off=(6-a)+(5-sh)+iso-sceneLight;
 const blur=tool.goal==='moving'?Math.max(0,3-sh)*1.6:0;
 function check(){
  if(Math.abs(off)>1)return report({ok:false,text:off<0?'Still too dark. Open the aperture, slow the shutter or raise ISO.':'Too bright. Close the aperture, speed up the shutter or lower ISO.'});
  if(tool.goal==='moving'&&sh<3)return report({ok:false,text:'Bright enough, but the runner is blurry. Use 1/250 or faster, then make up the light elsewhere.'});
  if(tool.goal==='clean'&&iso>2)return report({ok:false,text:'Bright enough, but very grainy. Lower ISO and let in light with the aperture or shutter.'});
  report({ok:true,text:'Well balanced! '+(tool.goal==='moving'?'Fast shutter freezes motion; the wide aperture and ISO make up the light.':'Low ISO keeps it clean; the aperture and shutter do the work.')});
 }
 const slider=(label:string,values:string[],v:number,set:(n:number)=>void,hint:string)=><label className="vg-slider">{label}: <strong>{values[v]}</strong><span className="small">{hint}</span><input type="range" min={0} max={values.length-1} value={v} onChange={e=>{set(Number(e.target.value));report(null)}}/></label>;
 return <><div className="vg-sim" aria-label="Picture preview">
   <img src="/lessons/story-01-960.webp" width={960} height={640} alt="" style={{filter:`brightness(${Math.pow(2,off*0.55).toFixed(2)}) blur(${blur}px)`}}/>
   <span className="vg-grain" style={{opacity:Math.max(0,iso-2)*0.16}}/>
   <span className="vg-sim-tag">{off===0?'Just right':off<0?'Too dark':'Too bright'}</span></div>
  {slider('Aperture',apertures,a,setA,'Lower number = more light, blurrier background')}
  {slider('Shutter speed',shutters,sh,setSh,'Faster = sharper motion, less light')}
  {slider('ISO',isos,iso,setIso,'Higher = brighter, more grain')}
  <Button type="button" onClick={check}>Check my settings</Button></>;
}

function WhiteBalanceTool({tool,report}:{tool:Extract<Tool,{kind:'whitebalance'}>}&R){
 const scene=tool.cast==='warm'?3200:7500;
 const [k,setK]=useState(5600);
 const t=Math.max(-1,Math.min(1,(k-scene)/2500));
 function check(){report(Math.abs(k-scene)<=400?{ok:true,text:`Natural colour at about ${k}K. The camera now matches the light in the room.`}:{ok:false,text:t>0?'Still too orange. Move the slider left (cooler).':'Now too blue. Move the slider right (warmer).'})}
 return <><div className="vg-sim"><img src="/lessons/story-01-960.webp" width={960} height={640} alt=""/><span className="vg-tint" style={{background:t>0?'#ff8a00':'#2f6dff',opacity:Math.abs(t)*0.38}}/></div>
  <label className="vg-slider">White balance: <strong>{k}K</strong><span className="small">Left = cooler (bluer), right = warmer (more orange)</span><input type="range" min={2500} max={9000} step={100} value={k} onChange={e=>{setK(Number(e.target.value));report(null)}}/></label>
  <Button type="button" onClick={check}>Check colour</Button></>;
}

function Meter({db}:{db:number}){return <span className="vg-meter" aria-hidden="true"><span style={{width:Math.max(0,(db+40)/40*100)+'%'}} className={db>-6?'hot':db>=-15?'good':''}/></span>}
function MixTool({tool,report}:{tool:Extract<Tool,{kind:'mix'}>}&R){
 const [voice,setVoice]=useState(-28),[music,setMusic]=useState(-6);
 function check(){
  if(voice>-9)return report({ok:false,text:'The voice is too loud. It may crackle. Bring it down a little.'});
  if(voice<-15)return report({ok:false,text:'The voice is too quiet. Bring it up.'});
  if(tool.music&&music>voice-10)return report({ok:false,text:'The music covers the words. Keep it at least 10 below the voice.'});
  report({ok:true,text:tool.music?'Clear words with music underneath. Nice mix.':'Good level. Loud enough, with room to spare.'});
 }
 const fader=(label:string,v:number,set:(n:number)=>void)=><label className="vg-slider">{label}: <strong>{v} dB</strong><Meter db={v}/><input type="range" min={-40} max={0} value={v} onChange={e=>{set(Number(e.target.value));report(null)}}/></label>;
 return <>{fader('Voice',voice,setVoice)}{tool.music&&fader('Music',music,setMusic)}<p className="small">Green is the good zone for speech. Red means it is too loud.</p><Button type="button" onClick={check}>Check the level</Button></>;
}

// The cup sits at about 56% across and 70% down the picture.
const subject={x:.56,y:.70};
function FrameTool({tool,report}:{tool:Extract<Tool,{kind:'frame'}>}&R){
 const [zoom,setZoom]=useState(1),[px,setPx]=useState(50),[py,setPy]=useState(50);
 const sx=subject.x*zoom-(zoom-1)*px/100,sy=subject.y*zoom-(zoom-1)*py/100;
 function check(){
  if(tool.goal==='close'){if(zoom<2.2)return report({ok:false,text:'Get closer. Zoom in until the cup fills most of the frame.'});if(sx<.2||sx>.8||sy<.2||sy>.8)return report({ok:false,text:'Close enough, but the cup is near the edge. Move the frame to centre it.'});return report({ok:true,text:'A clean detail shot. Great for cutting between main shots.'})}
  if(zoom<1.3)return report({ok:false,text:'Zoom in a little first, so you can move the frame.'});
  const near=[1/3,2/3].some(gx=>Math.abs(sx-gx)<.07)&&[1/3,2/3].some(gy=>Math.abs(sy-gy)<.07);
  report(near?{ok:true,text:'The cup sits on a crossing. The picture feels balanced.'}:{ok:false,text:'Move the frame until the cup sits where two grid lines cross.'});
 }
 const s=(label:string,v:number,set:(n:number)=>void,min:number,max:number,step=1)=><label className="vg-slider">{label}<input type="range" min={min} max={max} step={step} value={v} onChange={e=>{set(Number(e.target.value));report(null)}}/></label>;
 return <><div className="vg-sim vg-frame" style={{backgroundImage:'url(/lessons/story-01-960.webp)',backgroundSize:zoom*100+'%',backgroundPosition:`${px}% ${py}%`}} aria-label="Camera frame"><span className="vg-grid"/></div>
  {s('Zoom',zoom,setZoom,1,3,.1)}{s('Move left / right',px,setPx,0,100)}{s('Move up / down',py,setPy,0,100)}
  <div className="button-row"><Button type="button" onClick={check}>Check my frame</Button><Button type="button" variant="ghost" onClick={()=>{setZoom(1);setPx(50);setPy(50);report(null)}}><RotateCcw size={14}/>Reset</Button></div></>;
}
