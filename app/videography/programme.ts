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

// Adaptive level check: 12 questions, two per skill area. Each answer moves the
// learner's recent score (last three answers), and the next question comes from the matching tier
// (easy, medium or hard). Every option carries a score from 0 to 100.
export type Tier='start'|'easy'|'medium'|'hard';
export type Question={id:string;area:SkillArea;tier:Tier;prompt:string;options:string[];scores:number[]};
const tierScores:Record<Tier,number[]>={start:[0,30,60,90],easy:[0,12,25,40],medium:[20,35,50,65],hard:[40,60,80,100]};
const q=(id:string,area:SkillArea,tier:Tier,prompt:string,options:string[]):Question=>({id,area,tier,prompt,options,scores:tierScores[tier]});
export const questionCount=12;
export const questions:Question[]=[
 q('start','story','start','Have you made a video before?',['No, never','Yes, short clips on my phone','Yes, a short video I edited, with sound','Yes, videos for clients or an audience']),
 q('story-e1','story','easy','You want to film a friend cooking. What do you do first?',['Just start filming','Think about which part looks nice','Decide what the video should show','Decide who will watch it and what they should learn']),
 q('story-m1','story','medium','Before you film, how do you decide what the video is about?',['I see what happens','I pick a topic, like food or travel','I write one main message for one type of viewer','I plan the start, middle and end around that message']),
 q('story-h1','story','hard','A brand asks for a 60-second film. How do you shape the idea?',['I copy a style I like','I write one message and a rough plan','I write two different ideas and pick one for the audience','I test the idea with references and explain why it fits the brand']),
 q('plan-e1','planning','easy','Before you film, do you make a list of shots?',['No','Sometimes, in my head','Yes, a short list','Yes, a list and the things I need to bring']),
 q('plan-e2','planning','easy','Your phone battery dies while filming. How could you stop that?',['I can’t stop it','Use a different phone','Charge it before I go','Charge it, bring a power bank and check storage']),
 q('plan-m1','planning','medium','How do you get ready for a shoot?',['I just turn up','I think about the shots','I write a shot list and a gear list','I make a plan with times, shots, gear and a backup plan']),
 q('plan-m2','planning','medium','Do you ask people before you film them?',['No','Only if they look at the camera','Yes, I ask them','Yes, and I keep a record that they said yes']),
 q('plan-h1','planning','hard','A client says “make a video about our business”. What do you do first?',['Start filming the business','Ask what music they like','Ask about the audience, goal, deadline and what they need','Write a brief and a plan, and agree who signs it off']),
 q('plan-h2','planning','hard','How do you plan a full shoot day?',['A list of shots','A shot list and a gear list','A schedule, call sheet and permissions','A schedule, budget, risks and a backup plan']),
 q('cam-e1','camera','easy','When you film on your phone, how do you make the picture sharp?',['I just film','I hope it is sharp','I tap the screen on my subject','I tap to focus and lock it']),
 q('cam-e2','camera','easy','How do you hold the camera when you film?',['Any way, while walking','With one hand','With two hands, close to my body','On a stand, or resting on something steady']),
 q('cam-m1','camera','medium','How do you control how bright your video is?',['The camera does it','I tap and slide the brightness','I set aperture, shutter speed and ISO myself','I set them for each shot and keep shots matching']),
 q('cam-m2','camera','medium','When you film something happening, what shots do you take?',['One long shot','A few shots from one spot','Wide, medium and close-up shots','Wide, medium, close-up and extra shots for editing']),
 q('cam-h1','camera','hard','How do you keep shots matching across a whole scene?',['I don’t think about it','I keep the same settings','I lock white balance, exposure and frame rate','I test my setup and keep notes so another camera can match']),
 q('cam-h2','camera','hard','You film a moving subject in changing light. What do you do?',['Use auto mode','Change settings as I go','Plan exposure and focus for the move, and test it','Test the camera’s limits first, then plan shots and backups']),
 q('ls-e1','light-sound','easy','Your friend’s face looks too dark next to a window. What do you do?',['Film it anyway','Make it brighter later','Turn them to face the window','Turn them to the light and use white card to brighten shadows']),
 q('ls-e2','light-sound','easy','How do you record someone talking?',['Phone mic, from far away','Move a little closer','Move close and film in a quiet place','Use a small clip-on mic and listen back to check']),
 q('ls-m1','light-sound','medium','How do you light a person?',['I use whatever light is there','I move them near a window','I use one main light and soften the shadows','I plan main, fill and back light for a look I can repeat']),
 q('ls-m2','light-sound','medium','How do you check sound while you record?',['I don’t','I watch the sound meter','I listen with headphones','I use headphones, check levels and record some room sound']),
 q('ls-h1','light-sound','hard','The light keeps changing during an outdoor interview. What do you do?',['Keep filming','Change settings between takes','Use diffusers and reflectors to control it','Plan a setup that still works when the light or angle changes']),
 q('ls-h2','light-sound','hard','How do you protect sound on an important shoot?',['One good mic','One mic and checking levels','Two recordings at once, like a clip-on mic and a boom mic','A main and a backup recording, sync marks and a plan if one fails']),
 q('edit-e1','editing','easy','Have you edited a video?',['No, never','I trimmed a clip on my phone','I joined a few clips together','I made a short video with a start, middle and end']),
 q('edit-e2','editing','easy','Where do you keep your videos after filming?',['Only on my phone','I send them to myself','I copy them to one folder','I copy them to a computer and keep a backup']),
 q('edit-m1','editing','medium','How do you edit a short video?',['I keep most clips','I cut out mistakes','I build a clear start, middle and end','I cut for story and pace, then improve it after someone watches']),
 q('edit-m2','editing','medium','How do you organise clips for an edit?',['All in one place','In one folder','In named folders, with saved versions of my project','In named folders, with backups and a project someone else can open']),
 q('edit-h1','editing','hard','Someone says your edit feels slow. What do you do?',['Speed up every clip','Cut a few shots','Find where attention drops and tighten those parts','Try two structures, show viewers and keep the one that works']),
 q('edit-h2','editing','hard','How do you look after files on a big project?',['One drive','Folders and bins','Checked backups, proxies and relinking','A setup another editor can pick up and recover from']),
 q('fin-e1','finishing','easy','Before you share a video, what do you do?',['Share it straight away','Watch a little of it','Watch it all the way through','Watch it and check the text and sound']),
 q('fin-e2','finishing','easy','Do you add music to your videos?',['No','Yes, any song','Yes, and I keep voices louder than the music','Yes, music I’m allowed to use, quieter than voices']),
 q('fin-m1','finishing','medium','How do you fix colour in a video?',['I don’t','I add a filter','I fix brightness and colour so shots match','I fix it first, then add a simple look']),
 q('fin-m2','finishing','medium','What do you check before you share?',['Nothing','I watch it once in the editor','I watch the final file and check captions and spelling','I use a checklist and make versions for different screens']),
 q('fin-h1','finishing','hard','How do you match colour across several cameras?',['By eye','The same preset on every clip','Scopes, and matching shot by shot','A colour-managed setup, checked on the final export']),
 q('fin-h2','finishing','hard','How do you finish sound for a client video?',['Turn the music down','Balance voice and music','Clean the voices, add effects and mix','Mix to the platform’s loudness level and deliver separate tracks']),
];
const areaOrder=skillAreas.flatMap(a=>[a.id,a.id]);
export type Answer={q:string;a:number};
const questionById=(id:string)=>questions.find(x=>x.id===id);
const runningScore=(answers:Answer[])=>answers.reduce((n,x)=>n+questionById(x.q)!.scores[x.a],0)/answers.length;
// Picks the next question from the average of the last three answers; null when all 12 are answered.
export function nextQuestion(answers:Answer[]):Question|null{
 if(answers.length>=questionCount)return null;
 if(!answers.length)return questionById('start')!;
 const recent=runningScore(answers.slice(-3)),tier:Tier=recent<35?'easy':recent<70?'medium':'hard';
 const area=areaOrder[answers.length],asked=new Set(answers.map(x=>x.q));
 const pool=questions.filter(x=>x.area===area&&!asked.has(x.id));
 return pool.find(x=>x.tier===tier)||pool.find(x=>x.tier!=='start')!;
}

export type Assessment={answers:Answer[];areas:Record<SkillArea,number>;score:number;level:Level};
// Replays the adaptive order so the server only accepts a sequence it would have asked.
export function assess(input:unknown):Assessment{
 if(!Array.isArray(input)||input.length!==questionCount)throw new Error('Answer all twelve level questions.');
 const answers:Answer[]=[];
 for(const item of input){
  const expected=nextQuestion(answers);
  if(!item||item.q!==expected?.id||!Number.isInteger(item.a)||item.a<0||item.a>3)throw new Error('Something went wrong with your answers. Please start the 12 questions again.');
  answers.push({q:item.q,a:item.a});
 }
 const areas=Object.fromEntries(skillAreas.map(area=>{const own=answers.filter(x=>questionById(x.q)!.area===area.id);return [area.id,Math.round(runningScore(own))]})) as Record<SkillArea,number>;
 const score=Math.round(runningScore(answers));
 // A finished, edited video (start answer 2+) is the curriculum's entry requirement for Intermediate.
 const start=answers[0].a;
 const level:Level=score>=70&&start>=3?'advanced':score>=40&&start>=2?'intermediate':'beginner';
 return {answers,areas,score,level};
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

export type Programme={version:1;course:'videography';interests:string[];primaryPathway:Pathway;assessment:Assessment;level:Level;schedule:Schedule;mode:Mode|null;createdAt:string;updatedAt:string};
// Validates client input and recomputes every derived value server-side.
export function buildProgramme(input:any,previous?:Programme|null):Programme{
 if(input?.course!=='videography')throw new Error('Only Videography is open right now.');
 const ids=Array.isArray(input.interests)?[...new Set(input.interests.map(String))]:[];
 if(!ids.length||ids.length>12||ids.some(id=>!interestFor(id as string)))throw new Error('Pick at least one thing you like to film.');
 // Updates (dates, hours, mode) keep the saved assessment; a new programme must send answers.
 const assessment=input.answers===undefined&&previous?previous.assessment:assess(input.answers);
 const level:Level=levels.includes(input.level)?input.level:assessment.level;
 // An unchanged start date is kept even once it is in the past; a new one must be from today to 180 days ahead.
 const keptStart=previous&&input.startDate===previous.schedule.startDate;
 const start=keptStart||typeof input.startDate==='string'&&input.startDate>=addDays(today(),-1)&&input.startDate<=addDays(today(),180)?input.startDate:today();
 const now=new Date().toISOString();
 return {version:1,course:'videography',interests:ids as string[],primaryPathway:interestFor(ids[0] as string)!.pathway,assessment,level,schedule:schedule(level,input.hoursPerWeek,start,input.daysPerWeek),mode:['free','self','mentor'].includes(input.mode)?input.mode:previous?.mode||null,createdAt:previous?.createdAt||now,updatedAt:now};
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
export const projectLabel=(p?:Programme|null)=>p?interestFor(p.interests[0])?.label:undefined;
// Converts a curriculum module into the shared Lesson shape used by assignments and scoring.
export function moduleLesson(m:CurriculumModule,project?:string):Lesson{
 const title=m.stage==='selected-pathway'&&project?`Your ${project} project`:m.title;
 return {title,minutes:m.hours*60,learn:m.outcome+' '+m.topics.join(', ')+'.',do:m.assignment,checks:[...m.checks],resource:-1};
}
export const videoPaths=levels.map(level=>({id:videoPathId(level),title:'Videography · '+levelNames[level],short:levelNames[level],description:levelSummary[level],outcome:levelSummary[level],duration:rhythm[level].weeks+' WEEKS · '+rhythm[level].hours+' HOURS',number:String(levels.indexOf(level)+1).padStart(2,'0'),lessons:modulesFor(level).map(m=>moduleLesson(m))}));
export const curriculumModules=curriculum;
