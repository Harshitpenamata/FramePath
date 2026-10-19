'use client';
import React,{useEffect,useMemo,useState} from 'react';
import {Check,PlayCircle,X} from 'lucide-react';
import {LessonTool} from './tools';
import {questionsForVideos,type Tool} from './lessons';

// Reflect: two or three questions about the lesson and its videos, then the hands-on simulator where the
// lesson has one. The lesson's Reflect counts as done once every question is answered right and the
// simulator is solved. Questions live in reflect/<level>.json and load only on lesson pages.
export type ReflectQuestion={q:string;options:[string,string][];why:string;video:string};
type Bank=Record<string,ReflectQuestion[][]>;
const banks:Record<string,Promise<Bank>>={};
const loaders:Record<string,()=>Promise<{default:Bank}>>={B:()=>import('./reflect/beginner.json') as any,I:()=>import('./reflect/intermediate.json') as any,A:()=>import('./reflect/advanced.json') as any};
function bankFor(moduleId:string){const k=moduleId[0];return banks[k]||=loaders[k]?.().then(m=>m.default)??Promise.resolve({})}
export const simulatorKinds=['exposure','whitebalance','mix','frame'];

// The right answer is stored first; each question shows its answers in its own fixed order.
function order(n:number,seed:string){let h=0;for(const c of seed)h=(h*31+c.charCodeAt(0))|0;const out=[...Array(n).keys()];for(let i=n-1;i>0;i--){h=(h*1103515245+12345)|0;const j=Math.abs(h)%(i+1);[out[i],out[j]]=[out[j],out[i]]}return out}

function Question({item,n,total,onRight}:{item:ReflectQuestion;n:number;total:number;onRight:()=>void}){
 const [picked,setPicked]=useState<number|null>(null);
 const shown=useMemo(()=>order(item.options.length,item.q),[item]);
 const right=picked===0;
 return <div className="vg-tool">
  <span className="small vg-q-count">Question {n} of {total}{item.video&&<> · <PlayCircle size={13}/> from “{item.video}”</>}</span>
  <p className="vg-tool-prompt">{item.q}</p>
  <div className="vg-pick" role="group" aria-label={'Answers to question '+n}>{shown.map(i=><button type="button" key={i} aria-pressed={picked===i} disabled={right} className={picked===i?(i===0?'ok':'no'):''} onClick={()=>{setPicked(i);if(i===0)onRight()}}>{item.options[i][0]}</button>)}</div>
  {picked!==null&&<p role="status" className={'vg-tool-result '+(right?'ok':'no')}>{right?<Check size={16}/>:<X size={16}/>}{right?item.why:(item.options[picked][1]||'Not quite.')+' Try another answer.'}</p>}
 </div>;
}

export function ReflectStep({moduleId,index,tool,videos,onSolved}:{moduleId:string;index:number;tool:Tool;videos:{title:string}[];onSolved:()=>void}){
 const [questions,setQuestions]=useState<ReflectQuestion[]|null|undefined>(undefined);
 const [right,setRight]=useState<Set<number>>(new Set()),[simDone,setSimDone]=useState(false);
 useEffect(()=>{let live=true;setQuestions(undefined);setRight(new Set());setSimDone(false);bankFor(moduleId).then(b=>{if(live){const qs=questionsForVideos(b[moduleId]?.[index]||[],videos);setQuestions(qs.length?qs:null)}}).catch(()=>{if(live)setQuestions(null)});return ()=>{live=false}},[moduleId,index,videos.map(v=>v.title).join('|')]);
 const sim=simulatorKinds.includes(tool.kind);
 useEffect(()=>{if(questions&&right.size===questions.length&&(!sim||simDone))onSolved()},[right,simDone,questions]);
 if(questions===undefined)return <p className="small" role="status">Loading questions…</p>;
 // Lessons without written questions keep their earlier practice tool.
 if(!questions)return <LessonTool tool={tool} onSolved={onSolved}/>;
 return <div className="vg-reflect">
  {questions.map((q,i)=><Question key={moduleId+index+i} item={q} n={i+1} total={questions.length} onRight={()=>setRight(s=>new Set(s).add(i))}/>)}
  {sim&&<><h4 className="vg-reflect-sim">Now try it</h4><LessonTool tool={tool} onSolved={()=>setSimDone(true)}/></>}
 </div>;
}
