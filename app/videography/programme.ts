import curriculum from './curriculum.json';
import type {Lesson} from '../catalog';

// Phase-1 programme: course selection, interests, level assessment and schedule.
// Module content comes from Video_Production_Curriculum.xlsx (curriculum.json).

export type Level='beginner'|'intermediate'|'advanced';
export type Mode='free'|'self'|'mentor';
export type CurriculumModule=typeof curriculum[number];

export const levels:Level[]=['beginner','intermediate','advanced'];
export const levelNames:Record<Level,string>={beginner:'Beginner',intermediate:'Intermediate',advanced:'Advanced'};
export const levelSummary:Record<Level,string>={beginner:'Learn the basics and make a simple, clear video',intermediate:'Make small videos on your own',advanced:'Lead your own projects in the style you choose'};
// Suggested study rhythm from the curriculum overview sheet.
export const rhythm:Record<Level,{weeks:number;hoursPerWeek:number;hours:number}>={beginner:{weeks:10,hoursPerWeek:8,hours:80},intermediate:{weeks:16,hoursPerWeek:9,hours:144},advanced:{weeks:24,hoursPerWeek:10,hours:240}};

export const courses=[
 {id:'videography',title:'Videography',blurb:'Plan, film, edit and share your videos.',active:true},
 {id:'photography',title:'Photography',blurb:'Take photos you are proud of.',active:false},
 {id:'filmmaking',title:'Filmmaking',blurb:'Tell stories with film, from idea to screen.',active:false},
 {id:'animation',title:'Animation · 2D | 3D',blurb:'Bring characters and worlds to life.',active:false},
 {id:'motion-graphics',title:'Motion Graphics',blurb:'Make text and shapes move.',active:false},
 {id:'gaming',title:'Gaming',blurb:'Make art and worlds for games.',active:false},
 {id:'vfx',title:'VFX & Post-production',blurb:'Add effects and finish your films.',active:false},
 {id:'more',title:'And more',blurb:'More courses are coming soon.',active:false},
] as const;

// The eight curriculum pathways (B13 / I13 / A13).
export const pathways=['Wedding','Events','Corporate','Documentary','Social media','YouTube','Travel','Advertising'] as const;
export type Pathway=typeof pathways[number];
// Interests a learner can add; each maps onto the nearest curriculum pathway.
export const interests:{id:string;label:string;pathway:Pathway}[]=[
 {id:'wedding',label:'Wedding',pathway:'Wedding'},
 {id:'events',label:'Events & concerts',pathway:'Events'},
 {id:'corporate',label:'Corporate & brand',pathway:'Corporate'},
 {id:'documentary',label:'Documentary',pathway:'Documentary'},
 {id:'wildlife',label:'Wildlife & nature',pathway:'Documentary'},
 {id:'social',label:'Social media reels',pathway:'Social media'},
 {id:'youtube',label:'YouTube',pathway:'YouTube'},
 {id:'travel',label:'Travel',pathway:'Travel'},
 {id:'advertising',label:'Advertising & product',pathway:'Advertising'},
 {id:'music',label:'Music videos',pathway:'Advertising'},
 {id:'food',label:'Food',pathway:'Social media'},
 {id:'fashion',label:'Fashion',pathway:'Advertising'},
 {id:'real-estate',label:'Real estate',pathway:'Corporate'},
 {id:'sports',label:'Sports',pathway:'Events'},
 {id:'education',label:'Education & explainers',pathway:'YouTube'},
 {id:'short-film',label:'Short films',pathway:'Documentary'},
];
export const interestFor=(id:string)=>interests.find(i=>i.id===id);
// What the learner's style project becomes (shown on the plan dashboard).
export const pathwayOutcomes:Record<Pathway,string>={
 Wedding:'a wedding film that keeps the moments a couple will want to remember',
 Events:'an event video that shows the energy, the people and the key moments',
 Corporate:'a brand video that shows what a business does and why it matters',
 Documentary:'a short documentary that tells a real person’s story',
 'Social media':'a vertical reel made for phones, that works even with the sound off',
 YouTube:'a YouTube video with a strong start that keeps people watching',
 Travel:'a travel film that shows a place, its people and its small details',
 Advertising:'a product video that shows why the product is worth buying',
};
// The final project at each level, from the B14 / I14 / A14 tasks.
export const finalProject:Record<Level,string>={beginner:'a new 60 to 90 second video, made on your own',intermediate:'a main video plus a shorter version, with a production plan',advanced:'a full production with every version, a change log and a case study'};

// Skill areas shown on the heat map, tied to curriculum stages.
export const skillAreas=[
 {id:'story',label:'Story and ideas',stage:'Ideas'},
 {id:'planning',label:'Planning',stage:'Planning'},
 {id:'camera',label:'Camera and framing',stage:'Filming'},
 {id:'light-sound',label:'Light and sound',stage:'Filming'},
 {id:'editing',label:'Editing',stage:'Editing'},
 {id:'finishing',label:'Colour, sound and sharing',stage:'Editing'},
] as const;
export type SkillArea=typeof skillAreas[number]['id'];

// Adaptive level check: 12 questions, two per skill area. In each area the learner first answers a
// "what did you do" question about a real past shoot (every option is a reasonable choice), then a quick
// skill check with one right answer. Answer order is shuffled on screen, so position gives nothing away.
// The next question's tier (easy, medium, hard) follows the learner's last three answers.
export type Tier='start'|'easy'|'medium'|'hard';
export type Kind='habit'|'check';
// A picture made from a lesson image: brightness filter, colour tint, crop (zoom + position) and a thirds grid.
export type Visual={src:string;filter?:string;tint?:string;zoom?:number;x?:number;y?:number;grid?:boolean};
// last: stays at the end when options are shuffled ("Not sure", "I haven't done this yet").
export type Option={text:string;score:number;visual?:Visual;last?:boolean};
export type Question={id:string;area:SkillArea;tier:Tier;kind:Kind;prompt:string;options:Option[]};
const habitScores:Record<Tier,number[]>={start:[0,30,60,90],easy:[0,12,25,40],medium:[20,35,50,65],hard:[40,60,80,100]};
// A skill check scores the tier's top mark when right, and a low mark when wrong or "Not sure".
const checkScores:Record<Exclude<Tier,'start'>,[number,number]>={easy:[40,0],medium:[65,15],hard:[100,35]};
// Habit options are listed from least to most experienced; the first may be "not yet" and stays last on screen.
const habit=(id:string,area:SkillArea,tier:Tier,prompt:string,options:string[],notYet=false):Question=>({id,area,tier,kind:'habit',prompt,
 options:options.map((text,i)=>({text,score:habitScores[tier][i],last:notYet&&i===0}))});
type Choice=string|Omit<Option,'score'>;
const check=(id:string,area:SkillArea,tier:Exclude<Tier,'start'>,prompt:string,right:Choice,wrong:Choice[]):Question=>{
 const [yes,no]=checkScores[tier],opt=(o:Choice,score:number):Option=>typeof o==='string'?{text:o,score}:{...o,score};
 return {id,area,tier,kind:'check',prompt,options:[opt(right,yes),...wrong.map(w=>opt(w,no)),{text:'Not sure',score:no,last:true}]};
};
const img='/lessons/story-01-960.webp';
export const questionCount=12;
export const questions:Question[]=[
 habit('start','story','start','Have you made a video before?',['No, never','Yes, short clips on my phone','Yes, a short video I edited, with sound','Yes, videos for clients or an audience']),
 // Story and ideas
 habit('story-he','story','easy','The last time you filmed something, how did you choose what to film?',['I haven’t filmed anything yet','Whatever looked nice','The main thing that was happening','What I wanted people to see first'],true),
 habit('story-hm','story','medium','In your last video, did you plan a start, middle and end before filming?',['No, I found it in the edit','A rough idea in my head','A few lines written down','Planned shot by shot']),
 habit('story-hh','story','hard','On your last video for a client or audience, how did you choose the idea?',['The client told me exactly what to make','I picked a style I liked','I wrote a couple of ideas and chose one','I tested ideas against the audience and the goal']),
 check('story-ce','story','easy','Which of these is a message, not just a topic?','Slow bread is worth the wait',['Food','My kitchen']),
 check('story-cm','story','medium','Your video is for parents watching on their phones. Which opening works best?','A child’s face lighting up as the bread comes out',['A 20-second logo animation','A wide shot of the building']),
 check('story-ch','story','hard','A 60-second brand film has to show “we care”. Which is the strongest choice?','One small, real moment of a worker fixing a customer’s problem',['A narrator saying “we care”','A fast montage of products with music']),
 // Planning
 habit('plan-he','planning','easy','Before your last shoot, what did you get ready?',['I haven’t done a shoot yet','I checked the phone had space','I charged it and checked the space','I charged it, checked space and wrote what to film'],true),
 habit('plan-hm','planning','medium','How did you plan your last shoot?',['I knew roughly what I wanted','A list of shots','A shot list and a gear list','A plan with times, shots and a backup']),
 habit('plan-hh','planning','hard','Before your last bigger shoot, what did you send the people involved?',['A message with the time','The time and the address','A call sheet with times and jobs','A call sheet, risks and a backup plan']),
 check('plan-ce','planning','easy','Which line is useful in a shot list?','Close-up: hands pour the tea',['Something nice','Maybe some other shots']),
 check('plan-cm','planning','medium','You want to film a stranger in a café. What do you need first?','Their permission',['A better camera','Background music']),
 check('plan-ch','planning','hard','Rain is forecast on your only outdoor shoot day. What is the best plan?','Book an indoor option and pack rain covers',['Go anyway and hope it clears','Start editing old footage instead']),
 // Camera and framing
 habit('cam-he','camera','easy','When you last filmed on your phone, how did you get it sharp?',['I haven’t filmed on my phone yet','The phone did it','I tapped on the subject','I tapped and held to lock focus'],true),
 habit('cam-hm','camera','medium','How did you set the brightness on your last shoot?',['Left it on auto','Slid the brightness on the screen','Set it by hand once','Set shutter, aperture and ISO for each shot']),
 habit('cam-hh','camera','hard','On your last scene with many shots, how did you keep them matching?',['Fixed it in the edit','Mostly the same settings','Locked white balance, shutter and frame rate','Tested first and noted settings so another camera could match']),
 check('cam-ce','camera','easy','Which picture is too bright?',{text:'Picture B',visual:{src:img,filter:'brightness(1.9) saturate(0.6)'}},[{text:'Picture A',visual:{src:img}},{text:'Picture C',visual:{src:img,filter:'brightness(0.45)'}}]),
 check('cam-cm','camera','medium','You film at 25 frames per second. Which shutter speed gives natural motion?','1/50',['1/1000','1/25']),
 check('cam-ch','camera','hard','Which frame puts the cup on a rule-of-thirds crossing?',{text:'Frame B',visual:{src:img,zoom:1.5,x:35,y:77,grid:true}},[{text:'Frame A',visual:{src:img,zoom:1.5,x:72,y:60,grid:true}},{text:'Frame C',visual:{src:img,zoom:1.5,x:5,y:20,grid:true}}]),
 // Light and sound
 habit('ls-he','light-sound','easy','The last time you recorded someone talking, where was the phone?',['I haven’t recorded anyone yet','Across the room','About an arm’s length away','Close to them, in a quiet spot'],true),
 habit('ls-hm','light-sound','medium','On your last shoot, how did you check the sound?',['I didn’t check it','Watched the level meter','Listened with headphones','Headphones, levels and some room sound']),
 habit('ls-hh','light-sound','hard','On your last interview, how did you light the face?',['Used whatever light was there','Moved them near a window','One main light, softened','Main, fill and back light planned for the look']),
 check('ls-ce','light-sound','easy','Which picture has an orange colour cast?',{text:'Picture C',visual:{src:img,tint:'rgba(255,138,0,0.38)'}},[{text:'Picture A',visual:{src:img}},{text:'Picture B',visual:{src:img,tint:'rgba(47,109,255,0.32)'}}]),
 check('ls-cm','light-sound','medium','A bright window is behind your friend, so their face is dark. What is the best fix?','Turn them to face the window',['Add a filter later','Zoom in more']),
 check('ls-ch','light-sound','hard','Outdoors, your clip-on mic picks up wind. What works best?','A furry windshield, and shelter from the wind',['Turn the gain up','Fix it in the edit']),
 // Editing
 habit('edit-he','editing','easy','Have you edited a video yet?',['Not yet','I trimmed one clip','I joined a few clips','I made a short video with a start, middle and end'],true),
 habit('edit-hm','editing','medium','How did you organise the clips for your last edit?',['All in one place','In one folder','Named folders and saved versions','Named folders, backups and saved versions']),
 habit('edit-hh','editing','hard','The last time someone said your edit felt slow, what did you do?',['Nobody has said that yet','Cut a few shots','Found where attention dropped and tightened it','Tried two structures and kept the one that worked']),
 check('edit-ce','editing','easy','Which part of a clip do you usually trim away?','The seconds before and after the action',['The main action','The middle of the clip']),
 check('edit-cm','editing','medium','Hearing the next scene before we see it is called…','A J-cut',['A jump cut','A fade']),
 check('edit-ch','editing','hard','Two editors both saved changes to version 05. What is the safest next step?','Merge into version 06 and note what changed',['Keep both as version 05','Delete the older one']),
 // Colour, sound and sharing
 habit('fin-he','finishing','easy','Before you last shared a video, what did you do?',['I haven’t shared one yet','Shared it straight away','Watched part of it','Watched it all the way through'],true),
 habit('fin-hm','finishing','medium','In your last video with music, how loud was the music?',['I didn’t use music','I left it as it came','Turned down under voices','Mixed so the voice was always on top']),
 habit('fin-hh','finishing','hard','How did you deliver your last client video?',['One file by link','One file, checked once','Versions for each screen, checked','Versions, captions and a checklist against a spec']),
 check('fin-ce','finishing','easy','Which title is easiest to read on a phone?','A short title in big, clear letters',['A long sentence in thin, curly letters','Spinning 3D text']),
 check('fin-cm','finishing','medium','Music covers the words in your video. What do you do?','Turn the music down under the voice',['Turn everything up','Only add captions']),
 check('fin-ch','finishing','hard','Online platforms usually aim for a loudness of about…','−14 LUFS',['0 dB','−40 LUFS']),
];
const areaOrder=skillAreas.flatMap(a=>[a.id,a.id]);
export type Answer={q:string;a:number};
const questionById=(id:string)=>questions.find(x=>x.id===id);
const scoreOf=(x:Answer)=>questionById(x.q)!.options[x.a].score;
const mean=(ns:number[])=>ns.reduce((n,v)=>n+v,0)/ns.length;
export const isRightCheck=(x:Answer)=>{const q=questionById(x.q)!;return q.kind==='check'&&x.a===0};
// Picks the next question: habit first in each area, then a skill check. Null when all 12 are answered.
export function nextQuestion(answers:Answer[]):Question|null{
 if(answers.length>=questionCount)return null;
 if(!answers.length)return questionById('start')!;
 const recent=mean(answers.slice(-3).map(scoreOf)),tier:Tier=recent<35?'easy':recent<70?'medium':'hard';
 const area=areaOrder[answers.length],kind:Kind=answers.length%2?'check':'habit',asked=new Set(answers.map(x=>x.q));
 const pool=questions.filter(x=>x.area===area&&x.kind===kind&&x.tier!=='start'&&!asked.has(x.id));
 return pool.find(x=>x.tier===tier)||pool[0]!;
}
// Display order for a question's options: shuffled per learner, with "Not sure" / "not yet" kept last.
export function optionOrder(q:Question,seed:string):number[]{
 let h=0;for(const c of seed+q.id)h=(h*31+c.charCodeAt(0))|0;
 const free=q.options.map((_,i)=>i).filter(i=>!q.options[i].last),tail=q.options.map((_,i)=>i).filter(i=>q.options[i].last);
 for(let i=free.length-1;i>0;i--){h=(h*1103515245+12345)|0;const j=Math.abs(h)%(i+1);[free[i],free[j]]=[free[j],free[i]]}
 return [...free,...tail];
}

// A missed skill check caps that area: hard → below Advanced, medium → below Intermediate, easy → low.
const checkCap:Record<Tier,number>={start:100,easy:25,medium:39,hard:69};
export type Assessment={answers:Answer[];areas:Record<SkillArea,number>;score:number;level:Level;checks:{right:number;total:number}};
// Replays the adaptive order so the server only accepts a sequence it would have asked.
export function assess(input:unknown):Assessment{
 if(!Array.isArray(input)||input.length!==questionCount)throw new Error('Answer all twelve level questions.');
 const answers:Answer[]=[];
 for(const item of input){
  const expected=nextQuestion(answers);
  if(!item||!expected||item.q!==expected.id||!Number.isInteger(item.a)||item.a<0||item.a>=expected.options.length)throw new Error('Something went wrong with your answers. Please start the 12 questions again.');
  answers.push({q:item.q,a:item.a});
 }
 const areas=Object.fromEntries(skillAreas.map(area=>{
  const own=answers.filter(x=>questionById(x.q)!.area===area.id);
  let s=Math.round(mean(own.map(scoreOf)));
  for(const x of own){const q=questionById(x.q)!;if(q.kind==='check'&&!isRightCheck(x))s=Math.min(s,checkCap[q.tier])}
  return [area.id,s];
 })) as Record<SkillArea,number>;
 const score=Math.round(mean(Object.values(areas)));
 const checks={right:answers.filter(isRightCheck).length,total:answers.filter(x=>questionById(x.q)!.kind==='check').length};
 // A finished, edited video (start answer 2+) is the curriculum's entry requirement for Intermediate.
 // Advanced also needs nearly every skill check right; Intermediate needs half.
 const start=scoreOf(answers[0]);
 const level:Level=score>=70&&start>=90&&checks.right>=5?'advanced':score>=40&&start>=60&&checks.right>=3?'intermediate':'beginner';
 return {answers,areas,score,level,checks};
}

export const maxHoursPerWeek=30;
export type Schedule={level:Level;totalHours:number;hoursPerWeek:number;recommendedHoursPerWeek:number;weeks:number;startDate:string;endDate:string;minutesPerDay:number;daysPerWeek:number};
const isoDate=(d:Date)=>d.toISOString().slice(0,10);
export function addDays(date:string,days:number){const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+days);return isoDate(d)}
export function today(){return isoDate(new Date())}
// Recommended rhythm comes from the level; learners may only increase their weekly hours.
export function schedule(level:Level,hoursPerWeek?:number,startDate?:string,daysPerWeek=5):Schedule{
 const r=rhythm[level];
 const hours=Math.min(maxHoursPerWeek,Math.max(r.hoursPerWeek,Number.isFinite(hoursPerWeek)?Number(hoursPerWeek):r.hoursPerWeek));
 const start=startDate&&/^\d{4}-\d{2}-\d{2}$/.test(startDate)?startDate:today();
 const weeks=Math.ceil(r.hours/hours);
 const days=Math.min(7,Math.max(3,Math.round(daysPerWeek)));
 return {level,totalHours:r.hours,hoursPerWeek:hours,recommendedHoursPerWeek:r.hoursPerWeek,weeks,startDate:start,endDate:addDays(start,weeks*7-1),minutesPerDay:Math.round(hours*60/days/5)*5,daysPerWeek:days};
}

export type Programme={version:1;course:'videography';interests:string[];primaryPathway:Pathway;styles?:Pathway[];assessment:Assessment;level:Level;schedule:Schedule;mode:Mode|null;createdAt:string;updatedAt:string};
// Validates client input and recomputes every derived value server-side.
export function buildProgramme(input:any,previous?:Programme|null):Programme{
 if(input?.course!=='videography')throw new Error('Only Videography is open right now.');
 const ids=Array.isArray(input.interests)?[...new Set(input.interests.map(String))]:[];
 if(!ids.length||ids.length>12||ids.some(id=>!interestFor(id as string)))throw new Error('Pick at least one thing you like to film.');
 // Updates (dates, hours, mode) keep the saved assessment; a new programme must send answers.
 const assessment=input.answers===undefined&&previous?previous.assessment:assess(input.answers);
 // A new plan always starts at the level its check recommends; only later updates (moving up) change it.
 const level:Level=input.answers!==undefined||!previous?assessment.level:levels.includes(input.level)?input.level:previous.level;
 // Courses: up to three styles. The active one (primaryPathway) decides the style project and its videos.
 const fromInterests=[...new Set(ids.map(id=>interestFor(id as string)!.pathway))].slice(0,maxStyles);
 const asked=Array.isArray(input.styles)?[...new Set(input.styles as Pathway[])]:null;
 if(asked&&(!asked.length||asked.length>maxStyles||asked.some(x=>!pathways.includes(x))))throw new Error('Pick one to three styles.');
 const styles:Pathway[]=asked||(previous&&input.answers===undefined?stylesOf(previous):fromInterests);
 const active:Pathway=styles.includes(input.primaryPathway)?input.primaryPathway:previous&&styles.includes(previous.primaryPathway)&&input.answers===undefined?previous.primaryPathway:styles[0];
 // An unchanged start date is kept even once it is in the past; a new one must be from today to 180 days ahead.
 const keptStart=previous&&input.startDate===previous.schedule.startDate;
 const start=keptStart||typeof input.startDate==='string'&&input.startDate>=addDays(today(),-1)&&input.startDate<=addDays(today(),180)?input.startDate:today();
 const now=new Date().toISOString();
 return {version:1,course:'videography',interests:ids as string[],primaryPathway:active,styles,assessment,level,schedule:schedule(level,input.hoursPerWeek,start,input.daysPerWeek),mode:['free','self','mentor'].includes(input.mode)?input.mode:previous?.mode||null,createdAt:previous?.createdAt||now,updatedAt:now};
}

// ---- Modules as lesson paths ----
export const videoPathId=(level:Level)=>'video-'+level;
export const videoPathIds=levels.map(videoPathId);
export const isVideoPath=(id:string)=>videoPathIds.includes(id);
export function parseVideoKey(key:string){const m=/^video-(beginner|intermediate|advanced)-(\d{1,2})$/.exec(key);if(!m)return null;const level=m[1] as Level,index=Number(m[2]);const mod=modulesFor(level)[index];return mod?{level,index,module:mod}:null}
export const isVideoKey=(key:string)=>!!parseVideoKey(key);
export const modulesFor=(level:Level)=>curriculum.filter(m=>m.level===level);
export const moduleKey=(level:Level,index:number)=>videoPathId(level)+'-'+index;
// Free tier: assignments on the first two modules of each level.
export const freeModuleCount=2;
export const isFreeModule=(key:string)=>{const v=parseVideoKey(key);return !!v&&v.index<freeModuleCount};
export const stagePhase=(stage:string)=>stage==='concepts'||stage==='preproduction'?'pre' as const:stage==='postproduction'?'post' as const:'production' as const;

// The learner's main project name, from their first interest (e.g. "Wildlife & nature").
export const projectLabel=(p?:Programme|null)=>p?(interestFor(p.interests.find(id=>interestFor(id)?.pathway===p.primaryPathway)||'')?.label||p.primaryPathway):undefined;
// Courses (styles). Plans made before courses have just their first interest's style.
export const maxStyles=3;
export function stylesOf(p:Programme):Pathway[]{return p.styles?.length?p.styles:[p.primaryPathway]}
// The style project module of each level (B13, I13, A13): its hand-in is kept separately for each course.
export const styleModuleKeys=levels.flatMap(l=>modulesFor(l).flatMap((m,i)=>m.stage==='selected-pathway'?[moduleKey(l,i)]:[]));
// Converts a curriculum module into the shared Lesson shape used by assignments and scoring.
export function moduleLesson(m:CurriculumModule,project?:string):Lesson{
 const title=m.stage==='selected-pathway'&&project?`Your ${project} project`:m.title;
 return {title,minutes:m.hours*60,learn:m.outcome+' '+m.topics.join(', ')+'.',do:m.assignment,checks:[...m.checks],resource:-1};
}
export const videoPaths=levels.map(level=>({id:videoPathId(level),title:'Videography · '+levelNames[level],short:levelNames[level],description:levelSummary[level],outcome:levelSummary[level],duration:rhythm[level].weeks+' WEEKS · '+rhythm[level].hours+' HOURS',number:String(levels.indexOf(level)+1).padStart(2,'0'),lessons:modulesFor(level).map(m=>moduleLesson(m))}));
export const curriculumModules=curriculum;

// ---- Hand-in (Make) ----
// Self-rating scale for the three checks, and the two reflection questions.
export const ratingScale=['Not yet','Started','Getting there','Good','Great'];
export const reflectionQuestions=[{id:'well',label:'What went well?'},{id:'change',label:'What would you change next time?'}] as const;
export const maxHandInFiles=3;
// Beginners hand in their first three modules without self-rating, so the first tasks stay simple. Self-rating starts at beginner module 4.
export const selfCheckFromBeginnerModule=4;
export const needsSelfCheck=(key:string)=>{const v=parseVideoKey(key);return !!v&&(v.level!=='beginner'||v.index+1>=selfCheckFromBeginnerModule)};
export type HandIn={answer:string;notes:string;url:string;uploadIds:string[];ratings:number[];reflections:{well:string;change:string}};
// What is still missing before work can be handed in ([] when ready). Used by the Make form and the server.
export function handInMissing(m:CurriculumModule,h:HandIn,selfCheck=true):string[]{
 const missing:string[]=[];
 if(m.handIn==='text'){if(h.answer.trim().length<80)missing.push('write your answer (at least 80 characters)')}
 else{if(!h.uploadIds.length&&!h.url.trim())missing.push('upload your work or add a video link');if(h.notes.trim().length<20)missing.push('add a short note about your work (at least 20 characters)')}
 if(h.uploadIds.length>maxHandInFiles)missing.push('use up to '+maxHandInFiles+' files');
 if(selfCheck){
  if(h.ratings.length!==3||h.ratings.some(r=>!Number.isInteger(r)||r<0||r>4))missing.push('rate your work on all three checks');
  for(const q of reflectionQuestions)if((h.reflections[q.id]||'').trim().length<10)missing.push('answer “'+q.label+'”');
 }
 return missing;
}
