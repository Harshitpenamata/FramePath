import {activeLevel,levelHours,levelOutcome,levelNames,goalPractice} from './selfpaced-curriculum';
import {basicContext} from './beginner-curriculum';

// A transparent interpretation of the learner's answers, available without an AI call.
export function learnerBrief(profile:any){
  const context=basicContext(profile),goal=context.goal,level=activeLevel(profile);
  const intent=/edit|clips|cut/i.test(goal)?'edit':/product|business|café|cafe|shop|brand|reel/i.test(goal)?'product':/light|exposure|camera/i.test(goal)?'camera':'story';
  const hours=Math.max(1,Math.min(20,Number(profile?.hours)||4));
  const needs:string[]=[];
  if(profile?.answers?.[0]!==1)needs.push('Recognise useful light and keep your subject readable.');
  if(profile?.answers?.[1]!==0)needs.push('Choose and order shots so a viewer can follow the idea.');
  if(profile?.answers?.[2]!==2)needs.push('Build a sharing habit that checks music and permissions.');
  if(!needs.length)needs.push('Turn the ideas you recognised into decisions you can repeat while filming.');
  const fresh=profile?.experience==='Starting fresh'||!profile?.experience;
  const aims={
    product:{need:'Make the value of your subject clear to someone seeing it for the first time.',result:'A short story that shows why your subject matters, with footage you can also use in a product reel.',plan:'Choose a customer, a benefit and a visual opening.',shoot:'Show the subject clearly through detail, action, light and sound.',edit:'Build a clear sequence and test whether a viewer understands its value.'},
    edit:{need:'Find the story in your clips, then make deliberate cuts instead of adding effects first.',result:'A short film assembled from purposeful shots, with clearer pacing, sound and a finished export.',plan:'Decide what your viewer needs to understand; audit your existing clips.',shoot:'Spot missing coverage and practise the camera or sound fixes it needs.',edit:'Shape a rough cut, refine its rhythm, then compare it with your starting edit.'},
    camera:{need:'Connect camera and lighting choices to visible results you can explain.',result:'A short film that demonstrates deliberate exposure, framing and light in service of a story.',plan:'Choose an intention and the details your viewer needs to see.',shoot:'Compare exposure, motion, light and sound one change at a time.',edit:'Bring the controlled shots into a sequence and check their consistency.'},
    story:{need:'Turn an everyday subject into something a stranger wants to watch.',result:'A short film with a clear person, place and change, supported by purposeful camera and editing choices.',plan:'Find a viewer, a reason to care and a small story worth following.',shoot:'Gather readable images, useful sound and enough coverage to tell it.',edit:'Connect the beginning and ending, then use viewer feedback to refine the story.'}
  }[intent];
  return {...context,intent,hours,level,levelName:levelNames[level],totalHours:levelHours(level),outcome:levelOutcome[level],project:goalPractice(profile),calendarWeeks:Math.ceil(levelHours(level)/hours),need:aims.need,result:levelOutcome[level],needs,
    startingPoint:level==='advanced'?'Build on regular production experience with visual development, finishing and a portfolio film.':level==='intermediate'?'Turn your existing filming or editing experience into repeatable camera, sound and post-production decisions.':fresh?'Start with noticing and small, repeatable experiments.':profile?.experience==='I have edited a few videos'?'Use your editing experience to notice which shots and sounds a sequence still needs.':'Turn your casual filming habits into choices you can explain and repeat.',
    equipment:profile?.gear==='Camera and computer'?'Use your camera and editor; compare manual settings where available.':profile?.gear==='Smartphone and computer'?'Film on your phone and edit on your computer. Use only the controls you already have.':'Start with your phone. If a control is unavailable, use the labelled comparison alternative.',
    peoplePlan:profile?.people==='Prefer objects or stand-ins'?'Use objects or stand-ins for practice. Plan the person-led capstone with consent, or label a storyboard alternative.':profile?.people==='Use text or stills for now'?'Use labelled stills or storyboards for practice and reflection until filming is possible.':'Ask permission before recording identifiable people and agree how their footage may be shared.',
    milestones:[{phase:'Preproduction',label:'Give the video a purpose',text:aims.plan},{phase:'Production',label:'Make the choices visible',text:aims.shoot},{phase:'Post production',label:'Shape it into a story',text:aims.edit}],
    practice:profile?.practiceMode==='gentle'?'Begin each task with a short rehearsal.':profile?.practiceMode==='stretch'?'After the core task, make and compare an alternative.':'Make one focused attempt, then use your reflection to choose the next improvement.'
  };
}
