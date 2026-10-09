import {chapters,itemsFor,itemById} from './question-bank';
import {caseById,initialScenarioRequest,normalizeScenarioRequest,buildScenarioPlan,scenarioLevel} from '../scenario-engine';
import type {Attempt,Answer,AssessmentResult,Chapter,PublicItem,SkillSignal} from './types';
export {chapters};
export function assess(a:Attempt):AssessmentResult {
 const skills={} as Record<Chapter,SkillSignal>;
 for(const ch of chapters){const answers=a.answers.filter(x=>itemById(x.itemId)?.chapter===ch.id);let value=2,correct=0,answered=0,skipped=0,confidentWrong=0,uncertainRight=0;
  for(const x of answers){const item=itemById(x.itemId)!;if(x.value===null){skipped++;continue;}answered++;const ok=String(x.value)===String(item.answer);if(ok){correct++;value+=item.band===0?.35:.7;if(x.confidence===0)uncertainRight++;}else{value-=item.band===2?.35:.65;if(x.confidence===2)confidentWrong++;}}
  const score=answered?Math.round(Math.max(0,Math.min(4,value))*10)/10:null;
  skills[ch.id]={value:score,label:score===null?'Not yet checked':score<1.5?'Starting':score<2.5?'Building':score<3.2?'Confident':'Advanced',correct,answered,skipped,source:'Practical checks · small sample',confidentWrong,uncertainRight,evidence:answered?`${correct} of ${answered} checks correct${confidentWrong?`; ${confidentWrong} confident answer${confidentWrong===1?'':'s'} to revisit`:''}`:'Skipped or not yet checked'};
 }
 const vals=Object.values(skills).map(s=>s.value).filter((v):v is number=>v!==null),mean=vals.length?vals.reduce((n,x)=>n+x,0)/vals.length:0;
 const level=mean>=3.2?'advanced':mean>=2?'intermediate':'beginner',gaps=chapters.map(c=>c.id).sort((x,y)=>(skills[x].value??-1)-(skills[y].value??-1)).slice(0,3);
 // Two context screens, then 18 checks; up to four more checks resolve uncertain evidence. Time is chosen after the report.
 const uncertain=a.answers.filter(x=>x.value===null||x.confidence===0).length,maxQuestions=18+Math.min(4,Math.floor(uncertain/2));
 const result:AssessmentResult={skills,level,label:level==='beginner'?'Basic':level==='intermediate'?'Medium':'Advanced',gaps,answered:a.answers.filter(x=>x.value!==null).length,correct:Object.values(skills).reduce((n,s)=>n+s.correct,0),complete:a.answers.length>=maxQuestions,rationales:a.answers.filter(x=>x.rationale.trim()).length,maxQuestions};
 if(!result.complete){const index=a.answers.length,chapter=index<16?chapters[index%8].id:gaps[(index-16)%gaps.length],prior=a.answers.filter(x=>itemById(x.itemId)?.chapter===chapter),last=prior.at(-1),previous=last?itemById(last.itemId):undefined;
  const band=previous&&last?.value!==null?Math.max(0,Math.min(2,previous.band+(String(last!.value)===String(previous.answer)?1:-1))):1;
  const options=itemsFor(chapter,caseById(a.goal.caseId).primary_archetype).filter(i=>!a.answers.some(x=>x.itemId===i.id));const chosen=options.find(i=>i.band===band)||options[0];
  if(chosen){const {answer,explanation,config,...safe}=chosen;result.next={...safe,...(chosen.kind==='hotspot'?{config:{hotspots:config?.hotspots}}:{}),reason:[3,9,15].includes(index),context:chapter==='scenario'?a.goal.words:safe.context};}
 }
 return result;
}
export function commitAnswer(a:Attempt,b:any):Answer {
 const item=assess(a).next;if(!item||item.id!==b.itemId)throw Error('This question is already saved or has changed. Refresh to continue.');
 const value=b.value===null?null:item.kind==='order'?String(b.value):Number(b.value);
 if(value!==null&&(item.kind==='order'?!/^\d+$/.test(String(value))||new Set(String(value)).size!==item.choices.length||String(value).split('').some(x=>Number(x)>=item.choices.length):!Number.isInteger(value)||Number(value)<0||Number(value)>=item.choices.length))throw Error('Choose an answer or skip this question.');
 if(value!==null&&![0,1,2].includes(b.confidence))throw Error('Tell us how sure you are.');
 const rationale=typeof b.rationale==='string'?b.rationale.trim().slice(0,600):'';
 if(value!==null&&item.reason&&rationale.length<5)throw Error('Add a short reason, or skip this question.');
 return {itemId:item.id,value,confidence:value===null?null:b.confidence,rationale,at:new Date().toISOString(),seconds:Math.min(1800,Math.max(0,Number(b.seconds)||0))};
}
export function profileFor(a:Attempt){
 const result=assess(a),s=a.setup,r=initialScenarioRequest(a.goal.caseId),c=caseById(a.goal.caseId);
 r.outcome={...r.outcome,goal:a.goal.words,audience:s.audience||a.goal.clarification?.audience||'',orientation:s.orientation,deadline_days:s.weeks*7,length_seconds:s.length};
 r.starting={...r.starting,gear:s.gear,hours:s.hours,weeks:s.weeks,device:s.device,bandwidth:s.bandwidth==='offline'?'low':s.bandwidth,accessibility:s.accessibility,control:s.control,outdoor:s.outdoor,authorised:s.authorised,local_backup:s.localBackup,screen_recorder:s.screenRecorder,specialist:s.specialist,spatial:s.spatial};
 r.preferences={...r.preferences,modality:s.modality,structure:s.structure,pace:s.pace,feedback:s.feedback,sequence:s.sequence,assessment_comfort:'private',motivation:s.motivation};
 const request:any=normalizeScenarioRequest(r,false);request.assessedSkills={};
 for(const ch of chapters){const signal=result.skills[ch.id];request.assessedSkills[ch.cluster]={value:signal.value,source:signal.source,checks:signal.answered};}
 request.skillOverrides={};for(const [chapter,value] of Object.entries(a.overrides)){const cluster=chapters.find(c=>c.id===chapter)?.cluster;if(cluster&&Number.isFinite(value)&&value>=0&&value<=4)request.skillOverrides[cluster]=value;}
 const profile={diagnosticVersion:'scenario-v1',onboardingVersion:a.version,attemptId:a.id,request,name:s.name||'Learner',goal:a.goal.words,subject:a.goal.clarification?.subject||a.goal.words,gear:s.gear.includes('camera')?'Camera and computer':'Smartphone',hours:s.hours,weeks:s.weeks,people:'Ask permission',practiceMode:s.pace==='gentle'?'gentle':s.pace==='stretch'?'stretch':'core',experience:'Practical skill profile',answers:[0,0,0],level:scenarioLevel(request),skillProfile:result.skills,levelEvidence:result.label,customGoal:a.goal.custom,matchConfidence:a.goal.confidence,mode:a.mode,firstFrame:a.firstFrame,startedAt:a.startedAt,updatedAt:a.updatedAt};
 return profile;
}
export function planFor(a:Attempt){const profile=profileFor(a),plan=buildScenarioPlan(profile);return {...plan,title:`Your route: ${a.goal.words}`,why:`For “${a.goal.words}”, start with ${assess(a).gaps.slice(0,2).map(x=>chapters.find(c=>c.id===x)!.name.toLowerCase()).join(' and ')}. ${a.setup.hours} hours a week shapes the practice you can fit in.`,profile};}
