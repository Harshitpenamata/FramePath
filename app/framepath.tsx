'use client';

const ScenarioWorkspace=lazy(()=>import('./scenario-pages').then(m=>({default:m.ScenarioWorkspace})));
const ScenarioLibrary=lazy(()=>import('./scenario-pages').then(m=>({default:m.ScenarioLibrary})));
const ScenarioPathPage=lazy(()=>import('./scenario-pages').then(m=>({default:m.ScenarioPathPage})));
const ScenarioFinish=lazy(()=>import('./scenario-pages').then(m=>({default:m.ScenarioFinish})));
const SafetyPage=lazy(()=>import('./scenario-pages').then(m=>({default:m.SafetyPage})));
import {isScenarioPath} from './scenario-engine';
const PersonalFinish=lazy(()=>import('./personal-journey').then(m=>({default:m.PersonalFinish})));
const LearningJournals=lazy(()=>import('./beginner-pages').then(m=>({default:m.LearningJournals})));
import React,{lazy,Suspense} from 'react';
import {canonicalRoute} from './foundation/navigation';
const LegacyPath=lazy(()=>import('./foundation/legacy-path').then(m=>({default:m.LegacyPath})));
import {isSharedPath} from './lessons/shared';
import {rebuiltPathIds,isVisualKey} from './lessons/content';
const VisualPath=lazy(()=>import('./lessons/experience').then(m=>({default:m.VisualPath})));
const VisualSession=lazy(()=>import('./lessons/experience').then(m=>({default:m.VisualSession})));
import {legacyPaths} from './catalog';
const GoalReview=lazy(()=>import('./onboarding/goal-review'));
const FoundationReview=lazy(()=>import('./foundation/review-page'));
const OnboardingExperience=lazy(()=>import('./onboarding/experience'));

import {isCoursePath} from './selfpaced-curriculum';
const ResourceLibrary=lazy(()=>import('./pilot-pages').then(m=>({default:m.ResourceLibrary})));
const CourseFinish=lazy(()=>import('./pilot-pages').then(m=>({default:m.CourseFinish})));
const PilotHelp=lazy(()=>import('./pilot-pages').then(m=>({default:m.PilotHelp})));
import {Provider,Shell,Panel,Go} from './ui';
const Lesson=lazy(()=>import('./learner-pages').then(m=>({default:m.Lesson})));
const Membership=lazy(()=>import('./learner-pages').then(m=>({default:m.Membership})));
const Craft=lazy(()=>import('./learner-pages').then(m=>({default:m.Craft})));
const Mentors=lazy(()=>import('./mentor-pages').then(m=>({default:m.Mentors})));
const MentorProfile=lazy(()=>import('./mentor-pages').then(m=>({default:m.MentorProfile})));
const Enrol=lazy(()=>import('./mentor-pages').then(m=>({default:m.Enrol})));
const Pathway=lazy(()=>import('./mentor-pages').then(m=>({default:m.Pathway})));
const MentorRoom=lazy(()=>import('./mentor-pages').then(m=>({default:m.MentorRoom})));
const MyMentor=lazy(()=>import('./mentor-pages').then(m=>({default:m.MyMentor})));
const Portfolio=lazy(()=>import('./other-pages').then(m=>({default:m.Portfolio})));
const PublicPortfolio=lazy(()=>import('./other-pages').then(m=>({default:m.PublicPortfolio})));
const Settings=lazy(()=>import('./other-pages').then(m=>({default:m.Settings})));
const AIPage=lazy(()=>import('./other-pages').then(m=>({default:m.AIPage})));
function Content({route}:{route:string}){const parts=route.split('/').filter(Boolean);if(parts[0]==='explore'&&(rebuiltPathIds.includes(parts[1] as any)||isSharedPath(parts[1]))){if(parts.length===2)return <VisualPath id={parts[1]}/>;if(parts.length===3&&isVisualKey(parts[1]+'-'+parts[2]))return <VisualSession key={parts[1]+'-'+parts[2]} pathId={parts[1]} index={Number(parts[2])}/>;return <Panel><h1>That session is not in this pathway.</h1><Go href={'/explore/'+parts[1]}>Open pathway</Go></Panel>;}if(route==='/goal-review')return <Suspense fallback={<Panel>Opening goal review…</Panel>}><GoalReview/></Suspense>;if(['/', '/diagnostic', '/diagnostic/result', '/learn-mode', '/workspace', '/first-frame'].includes(route))return <Suspense fallback={<Panel><p role="status">Opening your journey…</p></Panel>}><OnboardingExperience route={route}/></Suspense>;if(process.env.NODE_ENV==='development'&&route==='/review/foundation')return <Suspense fallback={<Panel><p role="status">Opening learning tools…</p></Panel>}><FoundationReview/></Suspense>;if(parts[0]==='explore'&&parts.length===2&&legacyPaths.some(p=>p.id===parts[1]))return <LegacyPath id={parts[1]}/>;if(route==='/safety')return <SafetyPage/>;if(route==='/finish/scenario')return <ScenarioFinish/>;if(route==='/resources')return <ResourceLibrary/>;if(route==='/finish/route')return <PersonalFinish/>;if(parts[0]==='finish'&&parts.length===2)return <CourseFinish level={parts[1]}/>;if(route==='/journals')return <LearningJournals/>;if(route==='/basic/review')return <CourseFinish level="beginner"/>;if(route==='/explore')return <ScenarioLibrary/>;if(parts[0]==='explore'&&parts.length===3)return <Lesson pathId={parts[1]} index={Number(parts[2])}/>;if(route==='/craft')return <Craft/>;if(route==='/mentors')return <Mentors/>;if(parts[0]==='mentors'&&parts.length===2)return <MentorProfile id={parts[1]}/>;if(route==='/craft/enrol')return <Enrol/>;if(route==='/craft/pathway')return <Pathway/>;if(parts[0]==='craft'&&parts[1]==='week'&&parts.length===3)return <Lesson craft index={Number(parts[2])-1}/>;if(route==='/workspace')return <ScenarioWorkspace/>;if(route==='/membership')return <Membership/>;if(route==='/mentor-room')return <MentorRoom/>;if(route==='/my-mentor')return <MyMentor/>;if(route==='/portfolio')return <Portfolio/>;if(parts[0]==='p'&&parts.length===2)return <PublicPortfolio token={parts[1]}/>;if(route==='/settings')return <Settings/>;if(route==='/help')return <PilotHelp/>;if(route==='/ai')return <AIPage/>;return <Panel className="empty"><h1>That frame is missing.</h1><p>The page could not be found. Your learning is still saved.</p><Go href="/workspace">My learning</Go><Go href="/" outline>Home</Go></Panel>}
export default function Framepath({initialRoute='/'}:{initialRoute?:string}){const route=canonicalRoute(initialRoute);return <Provider route={route}><Shell home={route==='/'}><Suspense fallback={<Panel><p role="status">Opening this page…</p></Panel>}><Content route={route}/></Suspense></Shell></Provider>}