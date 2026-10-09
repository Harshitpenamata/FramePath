export const interactiveKinds = ['before-after','hotspots','shot-sorter','storyboard','exposure','white-balance','audio-ab','shot-list','thirds','axis','captions'] as const;
export type InteractiveKind = typeof interactiveKinds[number];
export type InteractiveCheckpoint = {instanceId:string; kind:InteractiveKind; version:1; evidence:Record<string,unknown>};
export type InteractiveProps = {instanceId:string; onCheckpoint?:(event:InteractiveCheckpoint)=>void};
/** Interaction evidence is a learning action, never a competence score or entitlement. */
export function checkpoint(instanceId:string,kind:InteractiveKind,evidence:Record<string,unknown>):InteractiveCheckpoint {
 if(!instanceId.trim())throw new Error('An interactive instance needs a stable identity.');
 return {instanceId,kind,version:1,evidence};
}
export function reorder<T>(items:T[],from:number,to:number):T[] {
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=items.length||to>=items.length)return [...items];
 const next=[...items],item=next.splice(from,1)[0];next.splice(to,0,item);return next;
}
export function exposureStops(iso:number,aperture:number,shutterDenominator:number){
 if([iso,aperture,shutterDenominator].some(n=>!Number.isFinite(n)||n<=0))throw new Error('Camera settings must be positive numbers.');
 return Math.log2((iso/400)*Math.pow(4/aperture,2)*(50/shutterDenominator));
}
export function captionNotes(text:string,seconds:number){
 const notes:string[]=[];if(/mintues/i.test(text))notes.push('Check “mintues”: the spelling is “minutes”.');
 if(text.split('\n').some(line=>line.length>42))notes.push('Try a line break; this practice layout uses up to 42 characters per line.');
 if(text.split('\n').length>2)notes.push('Try two lines or split this into another caption.');
 if(text.length/Math.max(1,seconds)>17)notes.push('Give the viewer more reading time or shorten the caption.');
 return notes;
}
