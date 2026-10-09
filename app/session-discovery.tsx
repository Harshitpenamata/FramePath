'use client';
import React,{useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {CourseLesson,goalPractice} from './selfpaced-curriculum';
import {discovery} from './discovery-content';
import {AdaptiveLab} from './adaptive-lab';
import {VisualLab} from './visual-lab';
import {basicContext} from './beginner-curriculum';
import {useLearning} from './ui';
import {resourcesFor} from './learning-resources';
import {ResourcePlayer} from './resource-player';
export function SessionDiscovery({lesson,lessonKey,onMake,active}:{lesson:CourseLesson;lessonKey:string;onMake:()=>void;active:boolean}){
 const {s}=useLearning();const [step,setStep]=useState(0),[reading,setReading]=useState(false),[resource,setResource]=useState(0);const stage=useRef<HTMLDivElement>(null),first=useRef(true);
 useEffect(()=>{if(first.current){first.current=false;return}stage.current?.focus()},[step]);
 const data=discovery[lessonKey],context=basicContext(s.profile),project=goalPractice(s.profile),resources=resourcesFor(lesson);const sentences=lesson.learn.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[lesson.learn];const middle=Math.ceil(sentences.length/2);const ideas=[sentences.slice(0,middle).join(' ').trim(),sentences.slice(middle).join(' ').trim()];
 return <section className="simple-learning" aria-label="Lesson content"><div className="lesson-card" ref={stage} tabIndex={-1}>
 {step===0?<AdaptiveLab key={lessonKey} lessonKey={lessonKey}/>:step<3?<div className="concept-slide text-concept"><div className="concept-step" aria-hidden="true">0{step+1}<span>{step===1?'UNDERSTAND':'NOTICE'}</span></div><div><h2>{step===1?'The idea':'What to notice'}</h2><p className="concept-copy">{ideas[step-1]||lesson.learn}</p><p className="small">Use this with {context.subject}.</p></div></div>:step===3?<div className="example-slide"><h2>A practical example</h2><p>{lesson.example||data?.example||lesson.minimum[0]}</p><div className="example-task"><strong>Apply it to your goal</strong><p>{project.brief}</p></div></div>:<div className="deeper-slide"><h2>See it in action</h2><p className="small">Choose one useful section. Pause when you see a decision you can try.</p>{resources.length>1&&<div className="resource-choices" role="group" aria-label="Lesson resources">{resources.map((r,i)=><Button key={r.id} variant="outline" aria-pressed={resource===i} onClick={()=>{setResource(i);setReading(false)}}>{i+1}. {r.creator}</Button>)}</div>}{!reading&&resources[resource]?<><p>{resources[resource].focus}</p><ResourcePlayer key={resources[resource].id} resource={resources[resource]} active={active} /><Button className="read-instead" variant="outline" onClick={()=>setReading(true)}>Read instead</Button></>:<><p>{lesson.learn}</p>{resources.length>0&&<Button variant="outline" onClick={()=>setReading(false)}>Back to video</Button>}</>}</div>}
 </div><div className="slide-controls"><Button variant="outline" disabled={step===0} onClick={()=>setStep(step-1)}>Back</Button><span aria-live="polite">{step+1} of 5</span>{step<4?<Button onClick={()=>setStep(step+1)}>Next</Button>:<Button onClick={onMake}>Open assignment</Button>}</div></section>
}
