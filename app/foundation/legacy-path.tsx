'use client';
import React from 'react';
import {legacyPaths} from '../catalog';
import {Go,PageHead,Panel,useLearning} from '../ui';
import {isFreePath,moduleHref} from '../learning-rules';
export function LegacyPath({id}:{id:string}){const {s}=useLearning(),path=legacyPaths.find(p=>p.id===id);if(!path)return <Panel><h1>Pathway not found</h1><Go href="/explore">Explore</Go></Panel>;const next=path.lessons.findIndex((_,i)=>!s.progress[id+'-'+i]);return <><PageHead eyebrow="YOUR VIDEO PROJECT" title={path.title}>{path.outcome}</PageHead><div className="legacy-path-intro"><p>{path.description}</p><p className="small">{path.duration}{isFreePath(id,s)?' · Free practice':''}</p><Go href={moduleHref(id+'-'+Math.max(0,next))}>{next<0?'Revisit project':'Continue this project'}</Go></div><ol className="scenario-session-list">{path.lessons.map((lesson,i)=><li key={id+'-'+i}><span aria-hidden="true">{s.progress[id+'-'+i]?'✓':String(i+1).padStart(2,'0')}</span><div><h2><a href={moduleHref(id+'-'+i)}>{lesson.title}</a></h2><p>{lesson.minutes} minutes</p></div><Go href={moduleHref(id+'-'+i)} outline>Open session</Go></li>)}</ol></>}
