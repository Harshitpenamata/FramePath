 'use client';
import React from 'react';
import type {LearningResource} from './learning-resources';
export function ResourcePlayer({resource}:{resource:LearningResource;active?:boolean;poster?:string}){return <div className="resource-player"><div className="video-cover"><span className="eyebrow">OPTIONAL CREATOR RESOURCE</span><h3>{resource.title}</h3><p>{resource.creator}</p><a className="source-play" href={resource.source} target="_blank" rel="noreferrer">Open at source</a></div><p>{resource.focus}</p><p className="small">Opens the credited creator’s website. Availability, captions and software versions depend on the source. Your session’s original demonstration and practical activity remain available here.</p></div>}
