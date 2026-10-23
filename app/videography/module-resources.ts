import {learningResources,type LearningResource} from '../learning-resources';

// Free resources to learn more, shown inside each module (23 Oct 2026: they replaced the separate Resources page).
// Every level follows the same module pattern (01 ideas … 12 titles and export), so the module's number decides
// which topics it gets (the professional-skills modules are B-PS, I-PS, A-PS). A pattern narrows a topic that two
// modules share (exposure in 04, framing in 05; recording in 07, while sound editing in 10 takes all of sound).
const framing=/shot size|pann|tilt|180/i,mixing=/design|mixing/i;
const bySlot:Record<string,[topic:string,match?:(r:LearningResource)=>boolean][]>={
 '01':[['Story']],'02':[['Story']],'03':[['Ethics and consent'],['Interviewing']],
 '04':[['Camera',r=>!framing.test(r.title)],['Screen capture']],'05':[['Camera',r=>framing.test(r.title)]],
 '06':[['Lighting']],'07':[['Sound',r=>!mixing.test(r.title)],['Interviewing']],'08':[['Archiving']],
 '09':[['Editing']],'10':[['Sound']],'11':[['Colour'],['Lighting',r=>/colour|white balance/i.test(r.title)]],'12':[['Delivery'],['Accessibility']],'-PS':[['Interviewing']],
};

// skip: YouTube ids and links the module's lessons already play, so nothing is listed twice.
export function moduleResources(moduleId:string,level:string,skip:string[]=[]):{topic:string;items:LearningResource[]}[]{
 return (bySlot[moduleId.slice(1)]||[]).map(([topic,match])=>({topic,items:learningResources.filter(r=>r.topic===topic&&(!match||match(r))&&(!r.levels||r.levels.includes(level))&&!skip.includes(r.youtubeId||'')&&!skip.includes(r.source))})).filter(g=>g.items.length>0);
}
