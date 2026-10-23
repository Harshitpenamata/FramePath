import {db} from './service';
import {moduleLessons,lessonsFor,lessonVideos,videoId} from './videography/lessons';
import {pathways} from './videography/programme';
import type {ModuleVideo} from './videography/media';

// Lesson video health. The scheduled job checks a batch of lesson videos each run (oldest check first), so every
// video is checked every few hours. A video that fails two checks in a row is marked 'dead': it is hidden from its
// lessons and no longer needed to finish them. The admin page lists dead videos with their lessons, to replace.
export type VideoHealth={id:string;status:'ok'|'dead'|'noframe';detail:string};

// Every video used in any lesson (any style), with where it is used.
export function allLessonVideos(){
 const map=new Map<string,{video:ModuleVideo;lessons:Set<string>}>();
 for(const id of Object.keys(moduleLessons))lessonsFor(id).forEach((_,i)=>{for(const pw of pathways)for(const v of lessonVideos(id,i,pw)){
  const k=videoId(v);if(!map.has(k))map.set(k,{video:v,lessons:new Set()});map.get(k)!.lessons.add(id+'-'+(i+1));
 }});
 return map;
}

const UA={'user-agent':'Mozilla/5.0 (compatible; FramePathVideoCheck/1.0)'};
export async function checkVideo(v:ModuleVideo):Promise<Omit<VideoHealth,'id'>>{
 try{
  if(v.youtubeId){
   const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+v.youtubeId),{headers:UA});
   if(r.ok)return {status:'ok',detail:'YouTube: plays and can be embedded'};
   if([401,403,404].includes(r.status))return {status:'dead',detail:{401:'YouTube: embedding turned off',403:'YouTube: private',404:'YouTube: removed or not found'}[r.status as 401]};
   return {status:'ok',detail:'YouTube answered '+r.status+'; not treated as dead'};
  }
  if(v.vimeoId){
   const r=await fetch('https://vimeo.com/api/oembed.json?url='+encodeURIComponent('https://vimeo.com/'+v.vimeoId),{headers:UA});
   if(r.ok)return {status:'ok',detail:'Vimeo: plays'};
   if([403,404].includes(r.status))return {status:'dead',detail:r.status===404?'Vimeo: removed or not found':'Vimeo: private or embedding restricted'};
   return {status:'ok',detail:'Vimeo answered '+r.status+'; not treated as dead'};
  }
  const r=await fetch(v.url!,{headers:UA,redirect:'follow'});
  if(r.status===404||r.status===410)return {status:'dead',detail:'Page: not found ('+r.status+')'};
  if(!r.ok)return {status:'ok',detail:'Page answered '+r.status+'; not treated as dead'};
  const xfo=(r.headers.get('x-frame-options')||'').toLowerCase(),fa=(r.headers.get('content-security-policy')||'').match(/frame-ancestors[^;]*/)?.[0]||'';
  await r.body?.cancel();
  if(/deny|sameorigin/.test(xfo)||(fa&&!fa.includes('*')))return {status:'noframe',detail:'Page: loads, but opens in a new tab'};
  return {status:'ok',detail:'Page: loads inside Framepath'};
 }catch(e:any){return {status:'ok',detail:'Check failed ('+String(e?.message||e).slice(0,80)+'); not treated as dead'}}
}

// Checks up to `limit` videos: ones never checked first, then the oldest checks.
export async function runVideoChecks(limit=40){
 const all=allLessonVideos();
 const rows:any[]=(await db().prepare('SELECT id,checked_at,fails FROM video_status').all()).results||[];
 const known=new Map(rows.map(r=>[r.id,r]));
 const order=[...all.keys()].sort((a,b)=>(known.get(a)?.checked_at??0)-(known.get(b)?.checked_at??0)).slice(0,limit);
 let dead=0;
 for(const id of order){
  const h=await checkVideo(all.get(id)!.video),fails=h.status==='dead'?(known.get(id)?.fails??0)+1:0;
  // One failed check can be a blip; a video is only hidden after two in a row.
  const status=h.status==='dead'&&fails<2?'ok':h.status;if(status==='dead')dead++;
  await db().prepare('INSERT INTO video_status(id,status,detail,fails,checked_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,detail=excluded.detail,fails=excluded.fails,checked_at=excluded.checked_at').bind(id,status,h.detail,fails,Date.now()).run();
 }
 // Videos no longer used in any lesson are dropped from the table.
 for(const r of rows)if(!all.has(r.id))await db().prepare('DELETE FROM video_status WHERE id=?').bind(r.id).run();
 return {checked:order.length,dead,total:all.size};
}

export async function deadVideoIds(){return ((await db().prepare("SELECT id FROM video_status WHERE status='dead'").all()).results||[]).map((r:any)=>r.id as string)}
