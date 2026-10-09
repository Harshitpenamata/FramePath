'use client';
import React,{useEffect,useState} from 'react';
import {LessonImage} from './media';
import {comparisons,activityFamilies} from './simple-comparisons';
import type {VisualLesson} from './content';
import type {ActivityEvidence} from './activity-rules';
export function usesHookComparison(l:VisualLesson){const family=l.labFamily||activityFamilies[l.activity.kind]||'sequence',c=comparisons[family];return !!c?.photo&&c.photo!=='focus'&&!l.activity.image&&!l.image.startsWith('diagram:');}
export function SimpleInteractive({lesson:l,value,onChange}:{lesson:VisualLesson;value?:ActivityEvidence;onChange:(v:ActivityEvidence)=>void}){
 const family=l.labFamily||activityFamilies[l.activity.kind]||'sequence',base=comparisons[family]||comparisons.sequence,c=l.activity.kind==='audio'?{...base,before:'Noisy background',after:'Quiet gaps',first:'The steady background competes with the taps.',second:'Quiet gaps make the taps easier to hear. These are synthetic examples, not a microphone test.',views:[['Taps + noise'],['Taps with quiet gaps']]}:base;
 const saved=value?.data.simple===true?value.data:null;
 const [view,setView]=useState(saved?.view===1?1:0),[seen,setSeen]=useState<number[]>(saved?.seen||[0]);
 useEffect(()=>{if(value?.data.simple===true){setView(value.data.view);setSeen(value.data.seen)}},[value]);
 function choose(n:number){setView(n);const next=[...new Set([...seen,n])];setSeen(next);onChange({version:1,kind:l.activity.kind,data:{simple:true,view:n,seen:next,changes:Math.min(10000,(value?.data.changes||0)+1)}})}
 const picture=l.activity.image||l.image,photo=!!c.photo&&c.photo!=='focus'&&!picture.startsWith('diagram:');
 return <div className="simple-interactive" data-activity="simple-compare"><p>Switch between the two views. Notice one difference.</p><div className="simple-compare-toggle" role="group" aria-label="Compare the example">{[c.before,c.after].map((label,i)=><button key={label} aria-pressed={view===i} onClick={()=>choose(i)}>{label}</button>)}</div><div className={'simple-comparison-view '+(photo?'photo-comparison '+c.photo:'')+' view-'+view}>
 {photo?<LessonImage id={picture} style={c.photo==='crop'?{transform:`scale(${view?1.45:1})`}:c.photo==='exposure'?{filter:`brightness(${view?1:.45})`}:c.photo==='colour'?{filter:view?'none':'sepia(.3) hue-rotate(165deg)'}:undefined}/>:<div className={'simple-example-cards family-'+family} aria-label={(view?c.after:c.before)+': '+c.views[view].join(' → ')}>{c.views[view].map((text,i)=><React.Fragment key={text}><div><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><strong>{text}</strong></div>{i<c.views[view].length-1&&<b aria-hidden="true">→</b>}</React.Fragment>)}</div>}
 {photo&&c.photo==='format'&&view===1&&<div className="simple-portrait-mask" aria-hidden="true"/>}</div>{l.activity.kind==='audio'&&<audio key={view} controls preload="none" aria-label={view?'Quiet tapping example':'Tapping with background noise'} src={'/lessons/'+(l.activity.audioPrefix||'story-audio')+'-'+(view?'quiet':'noisy')+'.wav'} style={{width:'100%',marginTop:16}}/>}<div className="simple-compare-explanation" aria-live="polite"><strong>{view?c.after:c.before}</strong><p>{view?c.second:c.first}</p></div><p className="small" role="status">{seen.includes(0)&&seen.includes(1)?'Comparison explored. Now use the idea in your assignment.':'No settings to memorise. Compare both views to continue.'}</p></div>;
}
