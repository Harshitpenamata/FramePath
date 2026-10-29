// The parts of each module's task, one field or upload slot each, so a learner can see what to hand in and the form can
// tell what is missing before a review is spent on half a hand-in. The same parts fit every style of a task (Wedding,
// Corporate...): the style changes the subject, not what has to be handed in.
export type TaskPart={id:string;label:string;hint?:string;kind:'text'|'media';min?:number};
const t=(id:string,label:string,hint?:string,min?:number):TaskPart=>({id,label,hint,kind:'text',min});
const f=(id:string,label:string,hint?:string):TaskPart=>({id,label,hint,kind:'media'});

export const taskParts:Record<string,TaskPart[]>={
 B01:[t('notes','Notes on the two videos','For each one: how does it tell its story?'),f('pictures','Your six photos or clips, in order'),t('lines','Two lines: what should people understand?','If you filmed someone, say who you asked.')],
 B02:[t('topic','The topic and your main message'),t('length','How long the video will be',undefined,4),t('shots','The shots you need'),t('say','What people will say','Or write “nothing”.',4)],
 B03:[t('shots','Your list of 6 to 10 shots'),t('gear','Your gear checklist'),t('schedule','Your simple schedule'),t('permission','Who you asked for permission, and what they said'),f('test','Your short test clip','Copied to your computer, and checked that it plays.')],
 B04:[f('clips','Your clips: indoors, outdoors and something moving'),f('fixed','Both versions of the clip you fixed','Before and after.'),t('problem','What was the problem, and how did you fix it?')],
 B05:[f('clips','Your 5 to 8 clips','One wide, the action, and one close-up detail.'),t('shotlist','Your shot list')],
 B06:[f('shots','Your before and after shots'),t('fix','What did you move or change to fix the light?')],
 B07:[f('audio','Your introduction and your background sound'),t('problem','The sound problem you found, and what you did about it')],
 B08:[f('picture','A picture of your folders and your project'),t('notes','How you named and organised your clips')],
 B09:[f('video','Your first edit and the improved version'),t('change','Who you showed it to, and what was confusing or too long')],
 B10:[f('video','Your finished video'),t('sounds','Why you used each sound')],
 B11:[f('pictures','Before and after pictures of the three shots'),t('notes','What you fixed in each shot')],
 B12:[f('video','Your exported video, with title and captions'),t('checklist','Your short quality checklist','What you checked in the final file.')],
 B13:[f('video','Your style video'),t('plan','Your plan'),f('clips','Your original clips')],
 'B-PS':[t('questions','The questions you asked the client'),t('summary','A summary of the answers','Who it is for, the goal and any limits.'),t('followup','Your follow-up message','What you will make, who does what and when.')],
 B14:[t('plan','Your plan'),t('shotlist','Your shot list'),f('clips','Your original clips'),f('project','Your project','A picture of the project is fine.'),f('final','Your final video')],

 I01:[t('ways','The two ways you planned the subject'),t('pick','Which one you picked, and why'),f('test','Your short test sequence')],
 I02:[t('brief','Your one-page brief'),t('plan','Your creative plan'),t('research','Your research notes')],
 I03:[t('shots','Your shot plan'),t('schedule','Your schedule'),t('gear','Your gear list'),t('budget','Your budget'),t('permissions','Your permissions'),t('backup','Your backup plan'),t('update','Your updated plan after one thing changed')],
 I04:[f('indoor','Your indoor sequence'),f('outdoor','Your outdoor sequence, in tricky light'),f('tests','Your camera tests'),t('settings','Your settings, and why you chose them')],
 I05:[f('clips','Your clips'),f('edit','Your 45 to 60 second edit')],
 I06:[f('looks','Clips of both looks, with a still from each'),f('sketch','Your light sketch'),t('notes','What you did differently for each look')],
 I07:[f('recordings','Your interview and activity recordings'),f('room','Your room sound and background sound'),t('problem','The sound problem you found, and how you fixed it')],
 I08:[f('picture','A picture of your organised project'),t('sync','How you synced the interview and chose your best takes'),t('relink','Your relink check: what happened')],
 I09:[f('rough','Your rough edit, with two different openings'),f('better','Your better version'),t('notes','Who you showed it to, and what you changed')],
 I10:[f('sound','Your sound before and after'),t('check','How it sounded on headphones and on normal speakers')],
 I11:[f('versions','Your fixed version and your styled version'),f('stills','Before and after stills')],
 I12:[f('main','Your main video'),f('short','Your short version'),f('captions','Your captions'),t('checklist','Your quality checklist'),t('feedback','The feedback you got, and the changes you made')],
 I13:[t('plan','Your plan'),f('clips','Your original clips'),f('edit','Your edit, and any extra versions')],
 'I-PS':[t('discovery','Your discovery questions, and what you learned'),t('treatment','Your one-page treatment'),t('price','Your price, and what it includes'),t('replies','Your reply to the two revision notes that clash')],
 I14:[t('plan','Your production plan'),f('video','Your main video'),f('extra','Your one extra version'),f('project','Your project'),t('reflection','Your short reflection')],

 A01:[t('plans','Both plans'),f('refs','Your reference pictures'),t('sound','Your sound ideas'),t('why','Why you chose one')],
 A02:[t('plan','Your researched plan'),t('test','The test you ran','A site visit, interview, test shot or rehearsal.'),t('learned','What you learned')],
 A03:[t('pack','Your full production pack'),t('change','The change you dealt with','For example less time, or a missing person.'),t('effect','The effect on cost, time and quality')],
 A04:[t('settings','Your camera settings'),f('tests','Your test results from both conditions'),t('limits','The limits you found')],
 A05:[t('plans','Your plans'),f('clips','Your clips: the first time, and with less time'),t('notes','What changed when time was short')],
 A06:[f('sketches','Your light sketches'),f('stills','Stills from both setups'),t('notes','How you adapted when the location changed')],
 A07:[f('recordings','Your main and backup recordings'),t('fix','How you fixed the pretend failure using your copies')],
 A08:[t('handover','Your handover note'),t('recovery','What happened in the recovery test'),t('check','How you checked the final edit uses the right files')],
 A09:[f('versions','Your two versions'),t('log','Your feedback log','Two rounds of changes.')],
 A10:[f('mix','Your mix and the separate sound parts'),t('notes','Notes on any fixes')],
 A11:[f('edit','Your edit and the exported file'),t('compare','How the edit and the export compare')],
 A12:[f('main','Your main film'),f('short','Your shorter version'),f('captions','Your captions'),t('handover','Your handover note')],
 A13:[f('tests','Your tests'),f('clips','Your original clips'),f('versions','All your versions'),t('choices','Why you made the key choices')],
 'A-PS':[t('briefing','Your crew briefing for a complex shoot'),t('plan','Your plan for the client with clashing stakeholders and a fixed deadline'),t('options','Three service options, with prices and outcomes'),t('position','Your short positioning statement'),t('pitch','Your pitch outline, ending with a clear request')],
 A14:[t('plan','Your plan and production pack'),f('tests','Your tests'),f('clips','Your clips'),f('project','Your project'),f('finals','Your final versions'),t('log','Your change log'),t('case','Your short case study')],
};

export const partsFor=(moduleId:string)=>taskParts[moduleId]||[];
export type PartsData={text:Record<string,string>;files:Record<string,string[]>};
// The text parts written out as the hand-in's answer, so reviews and My Work read it as before.
export const composeAnswer=(list:TaskPart[],parts:PartsData)=>list.filter(x=>x.kind==='text'&&(parts.text[x.id]||'').trim()).map(x=>x.label+':\n'+parts.text[x.id].trim()).join('\n\n');
// A text part counts once it has a few words; a media part once it has a file (or the hand-in has a link).
export const partDone=(p:TaskPart,parts:PartsData,hasLink:boolean)=>p.kind==='text'?(parts.text[p.id]||'').trim().length>=(p.min??12):(parts.files[p.id]||[]).length>0||hasLink;
