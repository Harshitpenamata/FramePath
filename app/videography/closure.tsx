'use client';
import React from 'react';
import {Award,Check,Circle} from 'lucide-react';
import {useLearning,Panel,Go,Action} from '../ui';
import {stageOrder,levels,levelNames,levelSummary,modulesFor,moduleKey,moduleLesson,projectLabel,type Level} from './programme';
import {useVideoReviews} from './work-folders';


// Closes a level after its final module: what was learned, best work, and what comes next.
export function LevelClosure({level}:{level:Level}){
 const {s,mutate}=useLearning();
 const reviews=useVideoReviews();
 const mods=modulesFor(level),done=mods.filter((_,i)=>s.progress?.[moduleKey(level,i)]).length,all=done===mods.length;
 const next=levels[levels.indexOf(level)+1];
 const best=s.submissions.filter((x:any)=>x.handIn&&x.key.startsWith('video-'+level)&&reviews?.[x.id]?.review?.total!=null)
  .sort((a:any,b:any)=>reviews![b.id].review.total-reviews![a.id].review.total).slice(0,3);
 return <div className="vg-closure">
  <section className="vg-closure-head"><Award size={40}/><div><span className="eyebrow">{levelNames[level].toUpperCase()} · {done} OF {mods.length} MODULES</span>
   <h2>{all?`You finished ${levelNames[level]}!`:`Almost there: ${mods.length-done} module${mods.length-done>1?'s':''} to go.`}</h2>
   <p className="lede">{levelNames[level]} level: {levelSummary[level].toLowerCase()}.{all?' Well done.':''}</p></div></section>

  <Panel><h3>What you learned</h3><div className="vg-closure-stages">{stageOrder.map(stage=>{const ms=mods.map((m,i)=>({m,i})).filter(x=>x.m.stageLabel===stage);if(!ms.length)return null;return <div key={stage}><strong>{stage}</strong><ul>{ms.map(({m,i})=>{const ok=!!s.progress?.[moduleKey(level,i)];return <li key={m.id} className={ok?'ok':''}>{ok?<Check size={14}/>:<Circle size={14}/>}<a href={`/explore/video-${level}/${i}`}>{moduleLesson(m,projectLabel(s.programme)).title}</a></li>})}</ul></div>})}</div></Panel>

  <Panel><h3>Your best work</h3>{best.length?<ol className="vg-best">{best.map((x:any)=><li key={x.id}><strong>{reviews![x.id].review.total}/100</strong> · {x.moduleId} · {reviews![x.id].review.summary}</li>)}</ol>:<p className="small">Your AI-reviewed pieces will show here.</p>}
   <div className="button-row"><Go href="/portfolio">Open My Work and share your portfolio</Go></div></Panel>

  <Panel><h3>What’s next</h3>{all&&next?<><p>Ready for {levelNames[next]}? {levelSummary[next]}. Your new plan starts today.</p><Action onClick={async()=>{if(await mutate('programme_update',{update:{level:next}}))window.location.assign('/workspace')}}>Start {levelNames[next]}</Action></>
   :all?<><p>You have finished every level. Keep making videos, and keep your portfolio up to date.</p><Go href="/workspace" outline>Back to my plan</Go></>
   :<><p>Finish the modules without a tick, then come back here.</p><Go href="/workspace" outline>Back to my plan</Go></>}</Panel>
 </div>;
}
