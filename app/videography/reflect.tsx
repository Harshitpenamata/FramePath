'use client';
import React,{useEffect,useMemo,useState} from 'react';
import {ArrowRight,Check,PlayCircle,X} from 'lucide-react';
import {LessonTool} from './tools';
import {Button} from '@/components/ui/button';
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
  <p className="vg-tool-prompt">{item.q}</p>
  {item.video&&<span className="small vg-q-source"><PlayCircle size={13}/> From “{item.video}”</span>}
  <div className="vg-pick" role="group" aria-label={'Answers to question '+n}>{shown.map((i,k)=><button type="button" key={i} aria-pressed={picked===i} disabled={right} className={picked===i?(i===0?'ok':'no'):''} onClick={()=>{setPicked(i);if(i===0)onRight()}}><span className="vg-letter" aria-hidden="true">{'ABCDE'[k]}</span><span>{item.options[i][0]}</span>{picked===i&&i===0&&<Check size={18} className="vg-pick-tick"/>}</button>)}</div>
  {picked!==null&&<p role="status" className={'vg-tool-result '+(right?'ok':'no')}>{right?<Check size={16}/>:<X size={16}/>}{right?item.why:(item.options[picked][1]||'Not quite.')+' Try another answer.'}</p>}
 </div>;
}

export function ReflectStep({moduleId,index,tool,videos,onSolved}:{moduleId:string;index:number;tool:Tool;videos:{title:string}[];onSolved:()=>void}){
 const [questions,setQuestions]=useState<ReflectQuestion[]|null|undefined>(undefined);
 const [right,setRight]=useState<Set<number>>(new Set()),[simDone,setSimDone]=useState(false),[at,setAt]=useState(0);
 useEffect(()=>{let live=true;setQuestions(undefined);setRight(new Set());setSimDone(false);setAt(0);bankFor(moduleId).then(b=>{if(live){const qs=questionsForVideos(b[moduleId]?.[index]||[],videos);setQuestions(qs.length?qs:null)}}).catch(()=>{if(live)setQuestions(null)});return ()=>{live=false}},[moduleId,index,videos.map(v=>v.title).join('|')]);
 const sim=simulatorKinds.includes(tool.kind);
 useEffect(()=>{if(questions&&right.size===questions.length&&(!sim||simDone))onSolved()},[right,simDone,questions]);
 if(questions===undefined)return <p className="small" role="status">Loading questions…</p>;
 // Lessons without written questions keep their earlier practice tool.
 if(!questions)return <LessonTool tool={tool} onSolved={onSolved}/>;
 return <div className="vg-reflect">
  <div className="vg-quiz">
   <div className="vg-quiz-top"><span className="eyebrow">Question {at+1} of {questions.length}</span><span className="vg-dots" aria-hidden="true">{questions.map((_,i)=><i key={i} className={right.has(i)?'done':i===at?'now':''}/>)}</span></div>
   <Question key={moduleId+index+at} item={questions[at]} n={at+1} total={questions.length} onRight={()=>setRight(s=>new Set(s).add(at))}/>
   {right.has(at)&&at<questions.length-1&&<button type="button" className="vg-next-q" onClick={()=>setAt(at+1)}>Next question<ArrowRight size={16}/></button>}
  </div>
  {sim&&right.size===questions.length&&<><h4 className="vg-reflect-sim">Now try it</h4><LessonTool tool={tool} onSolved={()=>setSimDone(true)}/></>}
 </div>;
}

// "Already know this?": every question of the module's lessons on one page, with no hints. The server checks the
// answers; if all are right first time, those lessons count as finished and the learner can go to the task.
export function TestOut({moduleId,moduleKey,lessonCount,videosFor,mutate,busy,result}:{moduleId:string;moduleKey:string;lessonCount:number;videosFor:(i:number)=>{title:string}[];mutate:(action:string,body:any)=>Promise<any>;busy:boolean;result?:{key:string;passed:boolean;at?:string}|null}){
 const [open,setOpen]=useState(false),[sets,setSets]=useState<ReflectQuestion[][]|null>(null),[picks,setPicks]=useState<Record<string,number>>({});
 useEffect(()=>{if(!open||sets)return;bankFor(moduleId).then(b=>setSets([...Array(lessonCount).keys()].map(i=>questionsForVideos(b[moduleId]?.[i]||[],videosFor(i)))))},[open]);
 const total=sets?sets.reduce((n,q)=>n+q.length,0):0,answered=Object.keys(picks).length;
 // The last attempt's result shows on the day it was made (attempts reset daily, on the server's UTC day).
 const mine=result?.key===moduleKey&&String(result.at||'').slice(0,10)===new Date().toISOString().slice(0,10)?result:null;
 if(mine)return <div className={'vg-testout '+(mine.passed?'ok':'')} role="status">{mine.passed?<><Check size={18}/><span><strong>All right first time.</strong> These lessons now count as finished, so you can go straight to the task.</span></>:<span><strong>Not all right first time.</strong> Work through the lessons below; you can try the quick check again tomorrow.</span>}</div>;
 if(!open)return <div className="vg-testout"><span><strong>Already know this module?</strong> Answer all its questions. Get every one right first time and you can skip to the task.</span><button type="button" className="text-link" onClick={()=>setOpen(true)}>Answer the questions</button></div>;
 return <form className="vg-testout open" onSubmit={async e=>{e.preventDefault();const answers:Record<number,number[]>={};sets!.forEach((qs,i)=>{if(qs.length)answers[i]=qs.map((_,n)=>picks[i+'-'+n])});await mutate('lesson_testout',{key:moduleKey,answers})}}>
  <h3>Quick check: {total||'…'} questions</h3><p className="small">One try a day. No hints until you send your answers.</p>
  {!sets?<p className="small" role="status">Loading questions…</p>:sets.map((qs,i)=>qs.map((q,n)=>{const id=i+'-'+n,shown=order(q.options.length,q.q);return <fieldset key={id} className="vg-testout-q"><legend>{q.q}</legend>
   {shown.map((o,k)=><label key={o}><input type="radio" name={'to-'+id} checked={picks[id]===o} onChange={()=>setPicks(p=>({...p,[id]:o}))}/><span className="vg-letter" aria-hidden="true">{'ABCDE'[k]}</span><span>{q.options[o][0]}</span></label>)}</fieldset>}))}
  <div className="button-row"><Button type="submit" disabled={busy||!sets||answered<total}>{busy?'Checking…':`Check my answers (${answered} of ${total})`}</Button><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Not now</Button></div>
 </form>;
}
