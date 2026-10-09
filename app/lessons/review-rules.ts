import {visualLesson} from './content';
import {activityFamilies} from './simple-comparisons';
import {checkBank} from './check-bank';
export type ReviewDraft={version:1;answers:number[];focus:number;correction:string;checked?:boolean};
export const emptyReview=():ReviewDraft=>({version:1,answers:[-1,-1,-1],focus:-1,correction:'',checked:false});
export function lessonQuestions(key:string){
 const l=visualLesson(key);if(!l)throw Error('Choose a published lesson.');
 const family=l.labFamily||activityFamilies[l.activity.kind];const bank=checkBank[family];if(!bank)throw Error('The lesson check is unavailable. Your work is safe; try again later.');
 const seed=[...key].reduce((n,c)=>n+c.charCodeAt(0),0);
 return bank.map(([prompt,right,wrong1,wrong2,explanation],i)=>{const answer=(seed+i)%3;const options=[wrong1,wrong2];options.splice(answer,0,right);return {id:family+'-'+i,prompt,options,answer,explanation}});
}
export function reviewDraft(value:any):ReviewDraft {
 if(value==null)return emptyReview();
 if(value.version!==1||!Array.isArray(value.answers)||value.answers.length!==3||value.answers.some((v:any)=>!Number.isInteger(v)||v< -1||v>2)||!Number.isInteger(value.focus)||value.focus< -1||value.focus>2||typeof value.correction!=='string'||value.correction.length>1200)throw Error('Your review draft could not be read. Please check your answers.');
 return {version:1,answers:[...value.answers],focus:value.focus,correction:value.correction.trim(),checked:value.checked===true};
}
export function scoreKnowledge(key:string,answers:unknown){const questions=lessonQuestions(key);if(!Array.isArray(answers)||answers.length!==3||answers.some(v=>!Number.isInteger(v)||v<0||v>2))throw Error('Answer all three lesson questions to see your score.');const results=questions.map((q,i)=>({id:q.id,correct:answers[i]===q.answer,answer:q.answer,explanation:q.explanation}));return {score:Math.round(results.filter(q=>q.correct).length/3*100),correct:results.filter(q=>q.correct).length,total:3,results};}
export function completeReview(key:string,value:unknown){const d=reviewDraft(value);const score=scoreKnowledge(key,d.answers);if(d.focus<0)throw Error('Choose one part of your assignment to improve or keep.');if(d.correction.length<12)throw Error('Add a short correction: what did you change, or what will you keep and why?');return {...d,...score,basis:'lesson-knowledge-check' as const};}
