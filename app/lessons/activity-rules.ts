import {labSpecs} from './lab-specs';
import {visualLesson,feedbackFor} from './content';
export type ActivityEvidence={kind:string;version:1;data:Record<string,any>};
const finite=(n:any,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const changed=(d:any)=>Number.isInteger(d.changes)&&d.changes>=2&&d.changes<=10000;
const text=(x:any,min=3,max=150)=>typeof x==='string'&&x.trim().length>=min&&x.length<=max;
const order=(a:any,n:number)=>Array.isArray(a)&&a.length===n&&new Set(a).size===n&&a.every(v=>Number.isInteger(v)&&v>=0&&v<n);
export function validateActivityDraft(key:string,e:unknown):ActivityEvidence|undefined {
 if(e===null||e===undefined)return undefined;const l=visualLesson(key),v=e as ActivityEvidence,d=v?.data;
 if(!l||v?.version!==1||v?.kind!==l.activity.kind||!d||Array.isArray(d)||typeof d!=='object'||JSON.stringify(d).length>3500)throw Error('This activity draft could not be read. Try the activity again.');
 if(d.simple===true){if(!validComparison(d,false))throw Error('Compare the two views again.');return JSON.parse(JSON.stringify(v));}
 let valid=Number.isInteger(d.changes)&&finite(d.changes,0,10000);
 switch(v.kind){
  case 'shared-lab':{const spec=labSpecs[l.labFamily!]||labSpecs.sequence;valid&&=finite(d.x,spec.range[0],spec.range[1])&&finite(d.y,spec.rangeY[0],spec.rangeY[1])&&order(d.order,3)&&Array.isArray(d.controls)&&d.controls.length<=4&&d.controls.every((x:any)=>['x','y','order','note'].includes(x))&&text(d.note,0,300);break;}
  case 'event-position':valid&&=['seat','aisle','side'].includes(d.position)&&Array.isArray(d.visited)&&d.visited.length<=3&&d.visited.every((v:any)=>['seat','aisle','side'].includes(v));break;
  case 'coverage-window':valid&&=finite(d.start,0,15)&&finite(d.end,35,60)&&Array.isArray(d.controls)&&d.controls.length<=2&&d.controls.every((v:any)=>['start','end'].includes(v));break;
  case 'event-sharing':valid&&=['self','family','public'].includes(d.audience)&&Array.isArray(d.viewed)&&d.viewed.length<=3&&d.viewed.every((v:any)=>['self','family','public'].includes(v))&&text(d.recording,0,200)&&text(d.sharing,0,200);break;
  case 'event-capacity':valid&&=finite(d.gb,1,10)&&finite(d.rate,6,80)&&finite(d.minutes,1,60)&&Array.isArray(d.controls)&&d.controls.length<=3&&d.controls.every((v:any)=>['gb','rate','minutes'].includes(v))&&text(d.fallback,0,240);break;
  case 'framing':valid&&=finite(d.crop,45,100)&&finite(d.position,20,80)&&typeof d.compared==='boolean';break;
  case 'shot-list':valid&&=Array.isArray(d.shots)&&d.shots.length>=3&&d.shots.length<=5&&d.shots.every((s:any)=>s&&['Wide','Medium','Close'].includes(s.size)&&typeof s.purpose==='string'&&s.purpose.length<=150);break;
  case 'exposure':valid&&=[100,200,400,800,1600].includes(d.iso)&&[25,50,100,250].includes(d.shutter)&&Array.isArray(d.controls)&&d.controls.length<=2&&d.controls.every((c:any)=>['iso','shutter'].includes(c));break;
  case 'timeline':valid&&=order(d.order,4)&&Array.isArray(d.durations)&&d.durations.length===4&&d.durations.every((n:any)=>Number.isInteger(n)&&finite(n,2,10));break;
  case 'captions':valid&&=typeof d.caption==='string'&&d.caption.length<=100&&finite(d.seconds,2,8);break;
  case 'story-arc':case 'shot-sorter':valid&&=order(d.order,3);break;
  case 'white-balance':valid&&=finite(d.kelvin,2800,8000)&&typeof d.cool==='boolean'&&typeof d.warm==='boolean';break;
  case 'audio':valid&&=typeof d.compared==='boolean'&&['visual','audio'].includes(d.method)&&['','quiet','noisy'].includes(d.selected);break;
  case 'light-direction':valid&&=finite(d.angle,0,360)&&Array.isArray(d.positions)&&d.positions.length<=9&&d.positions.every((n:any)=>Number.isInteger(n)&&n>=0&&n<=360&&n%45===0);break;
  case 'shadow-fill':valid&&=finite(d.size,0,100)&&finite(d.fill,0,100)&&Array.isArray(d.controls)&&d.controls.length<=2&&d.controls.every((c:any)=>['size','fill'].includes(c));break;
  case 'setup-notes':valid&&=finite(d.angle,0,360)&&typeof d.fill==='boolean'&&text(d.note,0,180);break;
  case 'delivery':valid&&=['portrait','landscape'].includes(d.shape)&&finite(d.titleY,15,85)&&Array.isArray(d.shapes)&&d.shapes.length<=2&&d.shapes.every((v:any)=>['portrait','landscape'].includes(v));break;
  case 'privacy-map':valid&&=Array.isArray(d.hidden)&&d.hidden.length<=3&&d.hidden.every((v:any)=>['names','messages','permission'].includes(v));break;
  case 'teaching-plan':valid&&=text(d.objective,0,180)&&order(d.order,4)&&finite(d.pause,5,20);break;
  case 'access-bridge':valid&&=['both','muted','hidden'].includes(d.mode)&&Array.isArray(d.viewed)&&d.viewed.length<=3&&d.viewed.every((v:any)=>['both','muted','hidden'].includes(v))&&text(d.caption,0,180)&&text(d.description,0,240);break;
  case 'steady-frame':valid&&=['handheld','elbows','stand'].includes(d.support)&&Array.isArray(d.seen)&&d.seen.length<=3&&d.seen.every((v:any)=>['handheld','elbows','stand'].includes(v));break;
  case 'comparison-log':valid&&=finite(d.pause,2,20)&&finite(d.size,18,32)&&text(d.note,0,240);break;
  case 'mic-distance':valid&&=finite(d.distance,20,200)&&finite(d.noise,0,100)&&Array.isArray(d.controls)&&d.controls.length<=2&&d.controls.every((c:any)=>['distance','noise'].includes(c));break;
  case 'caption-layout':valid&&=finite(d.y,15,85)&&finite(d.size,18,32)&&typeof d.backing==='boolean'&&Array.isArray(d.controls)&&d.controls.length<=3&&d.controls.every((c:any)=>['y','size','backing'].includes(c));break;
  case 'revision':case 'teaching-revision':valid&&=finite(d.reveal,0,100)&&typeof d.sawBefore==='boolean'&&typeof d.sawAfter==='boolean';break;
 }
 if(!valid)throw Error('This activity draft could not be read. Try the activity again.');return JSON.parse(JSON.stringify(v));
}
export function validateActivity(key:string,e:unknown):ActivityEvidence {
 const l=visualLesson(key);if(!l)throw Error('Choose a published visual session.');
 const v=e as ActivityEvidence,d=v?.data;if(v?.version!==1||v?.kind!==l.activity.kind||!d||typeof d!=='object'||Array.isArray(d)||JSON.stringify(d).length>3500)throw Error('Finish this session’s activity before saving.');
 if(d.simple===true){if(!validComparison(d,true))throw Error('Compare both views before finishing.');return validateActivityDraft(key,v)!;}
 let valid=false;
 switch(v.kind){
  case 'shared-lab':valid=changed(d)&&Array.isArray(d.controls)&&d.controls.includes('x')&&d.controls.includes('y')&&text(d.note,20,300);break;
  case 'event-position':valid=changed(d)&&['seat','side'].includes(d.position)&&Array.isArray(d.visited)&&new Set(d.visited).size>=2;break;
  case 'coverage-window':valid=changed(d)&&finite(d.start,0,7)&&finite(d.end,43,60)&&Array.isArray(d.controls)&&['start','end'].every(c=>d.controls.includes(c));break;
  case 'event-sharing':valid=changed(d)&&['self','family'].includes(d.audience)&&Array.isArray(d.viewed)&&d.viewed.includes('public')&&d.viewed.some((v:any)=>v==='self'||v==='family')&&text(d.recording,12,200)&&text(d.sharing,12,200);break;
  case 'event-capacity':valid=changed(d)&&finite(d.gb,1,10)&&finite(d.rate,6,80)&&finite(d.minutes,1,60)&&d.rate*d.minutes*60/8000*1.2<=d.gb&&Array.isArray(d.controls)&&['gb','rate','minutes'].every(c=>d.controls.includes(c))&&text(d.fallback,12,240);break;
  case 'framing': valid=changed(d)&&finite(d.crop,45,100)&&finite(d.position,20,80)&&d.compared===true;break;
  case 'shot-list': valid=Array.isArray(d.shots)&&d.shots.length>=3&&d.shots.length<=5&&d.shots.every((s:any)=>['Wide','Medium','Close'].includes(s.size)&&text(s.purpose));break;
  case 'exposure':valid=changed(d)&&[100,200,400,800,1600].includes(d.iso)&&[25,50,100,250].includes(d.shutter)&&Array.isArray(d.controls)&&d.controls.includes('iso')&&d.controls.includes('shutter');break;
  case 'timeline':valid=changed(d)&&order(d.order,4)&&Array.isArray(d.durations)&&d.durations.length===4&&d.durations.every((n:any)=>Number.isInteger(n)&&finite(n,2,10))&&d.durations.reduce((s:number,n:number)=>s+n,0)>=(l.activity.durationRange?.[0]||15)&&d.durations.reduce((s:number,n:number)=>s+n,0)<=(l.activity.durationRange?.[1]||30);break;
  case 'captions':valid=text(d.caption,4,100)&&!d.caption.toLowerCase().includes('minuites')&&finite(d.seconds,2,8)&&d.caption.length/d.seconds<=17;break;
  case 'story-arc': case 'shot-sorter':valid=changed(d)&&order(d.order,3);break;
  case 'white-balance':valid=changed(d)&&finite(d.kelvin,2800,8000)&&d.cool===true&&d.warm===true;break;
  case 'audio':valid=d.compared===true&&['audio','visual'].includes(d.method)&&['quiet','noisy'].includes(d.selected);break;
  case 'light-direction':valid=changed(d)&&finite(d.angle,0,360)&&Array.isArray(d.positions)&&new Set(d.positions).size>=2&&d.positions.length<=9&&d.positions.every((n:any)=>Number.isInteger(n)&&n>=0&&n<=360&&n%45===0);break;
  case 'shadow-fill':valid=changed(d)&&finite(d.size,0,100)&&finite(d.fill,0,100)&&Array.isArray(d.controls)&&d.controls.includes('size')&&d.controls.includes('fill');break;
  case 'setup-notes':valid=changed(d)&&finite(d.angle,0,360)&&typeof d.fill==='boolean'&&text(d.note,12,180);break;
  case 'delivery':valid=changed(d)&&['portrait','landscape'].includes(d.shape)&&finite(d.titleY,15,85)&&Array.isArray(d.shapes)&&d.shapes.includes('portrait')&&d.shapes.includes('landscape');break;
  case 'privacy-map':valid=changed(d)&&Array.isArray(d.hidden)&&d.hidden.length===3&&new Set(d.hidden).size===3&&d.hidden.every((v:any)=>['names','messages','permission'].includes(v));break;
  case 'teaching-plan':valid=changed(d)&&text(d.objective,12,180)&&order(d.order,4)&&finite(d.pause,5,20);break;
  case 'access-bridge':valid=changed(d)&&Array.isArray(d.viewed)&&d.viewed.includes('muted')&&d.viewed.includes('hidden')&&text(d.caption,12,180)&&text(d.description,12,240);break;
  case 'steady-frame':valid=changed(d)&&Array.isArray(d.seen)&&new Set(d.seen).size>=2;break;
  case 'comparison-log':valid=changed(d)&&finite(d.pause,2,20)&&finite(d.size,18,32)&&(Number(d.pause!==5)+Number(d.size!==24)===1)&&text(d.note,12,240);break;
  case 'mic-distance':valid=changed(d)&&finite(d.distance,20,200)&&finite(d.noise,0,100)&&Array.isArray(d.controls)&&d.controls.includes('distance')&&d.controls.includes('noise');break;
  case 'caption-layout':valid=changed(d)&&finite(d.y,15,85)&&(d.y<32||d.y>68)&&finite(d.size,24,32)&&d.backing===true&&Array.isArray(d.controls)&&['y','size','backing'].every(c=>d.controls.includes(c));break;
  case 'revision':case 'teaching-revision':valid=changed(d)&&d.sawBefore===true&&d.sawAfter===true&&finite(d.reveal,0,100);break;
 }
 if(!valid)throw Error('Finish the activity instructions, then save your session.');
 return validateActivityDraft(key,{...v,data:{changes:0,...d}})!;
}
export function validateReflection(key:string,ratings:unknown){const l=visualLesson(key);if(!l||!Array.isArray(ratings)||ratings.length!==3||ratings.some(n=>!Number.isInteger(n)||n<0||n>4))throw Error('Respond to the three reflection items.');return {...feedbackFor(l,ratings),ratings};}
export function validComparison(d:any,complete:boolean){return d&&d.simple===true&&[0,1].includes(d.view)&&Number.isInteger(d.changes)&&d.changes>=1&&d.changes<=10000&&Array.isArray(d.seen)&&d.seen.length<=2&&new Set(d.seen).size===d.seen.length&&d.seen.every((x:any)=>x===0||x===1)&&d.seen.includes(d.view)&&(!complete||d.seen.includes(0)&&d.seen.includes(1));}
export function activityReady(key:string,e:unknown){try{validateActivity(key,e);return true}catch{return false}}
