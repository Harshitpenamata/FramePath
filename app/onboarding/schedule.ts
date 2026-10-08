import {buildScenarioPlan} from '../scenario-engine';

// The client preview and the saved route use the same recipe engine.
export function schedulePreview(profile:any,hours:number,weeks:number){
 const request={...profile.request,starting:{...profile.request.starting,hours,weeks},outcome:{...profile.request.outcome,deadline_days:weeks*7}};
 const plan=buildScenarioPlan({...profile,request,hours,weeks});
 const budget=hours*weeks*60;
 const fits=plan.minutes<=budget;
 const suggestedWeeks=Math.max(1,Math.ceil(plan.fullMinutes/(hours*60)));
 return {plan,fits,suggestedWeeks,budget,spare:Math.max(0,budget-plan.minutes),
   title:!fits?'Allow a little more time':plan.starterOnly?'Enough for a small first version':'This fits your learning time',
   detail:!fits?'Choose more weekly time or a longer window.':plan.starterOnly?`Start with ${plan.keys.length} sessions. Allow about ${suggestedWeeks} weeks at this pace for the full guided route.`:`${plan.keys.length} sessions across ${plan.paths.length} pathways, with room to spread them over ${weeks} ${weeks===1?'week':'weeks'}.`};
}

// Preserve every answer, preference and piece of work from earlier attempts.
export function upgradeAttempt<T extends {version:string;status:string;setupStep:number}>(a:T):T{
 if(a.version==='onboarding-v3')return a;
 return {...a,version:'onboarding-v3',status:a.status==='first-frame'?'setup':a.status,setupStep:a.status==='first-frame'?0:a.status==='setup'?(a.setupStep===0?0:1):a.setupStep};
}
