'use client';
import {ClipboardList,Clapperboard,Scissors} from 'lucide-react';
import {phases,Phase} from './learning-rules';
export function PhaseMap({current,compact=false}:{current?:Phase;compact?:boolean}){const icons=[ClipboardList,Clapperboard,Scissors];return <ol className={'phase-map '+(compact?'compact':'')} aria-label="Videography phases">{phases.map((p,i)=>{const Icon=icons[i];return <li key={p.id} aria-current={current===p.id?'step':undefined}><Icon size={23}/><div><span className="eyebrow">0{i+1} · {p.verb}</span><strong>{p.name}</strong>{!compact&&<p>{p.description}</p>}</div></li>})}</ol>}
