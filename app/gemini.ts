import {env} from 'cloudflare:workers';

// Gemini watches hand-in videos (picture and sound) and writes timestamped notes. Claude then writes the review
// from those notes. Claude can't take video, so this is the only part that sees the video itself.
// The model is a setting (GEMINI_MODEL); the default is the low-cost Flash-Lite model, for testing.
const api='https://generativelanguage.googleapis.com';
export const geminiModel=()=>(env as any).GEMINI_MODEL||process.env.GEMINI_MODEL||'gemini-3.5-flash-lite';
export function geminiKey(){return (env as any).GEMINI_API_KEY||process.env.GEMINI_API_KEY||''}
export type VideoWatch={ok:true;duration:string;hasSpeech:boolean;notes:string}|{ok:false;reason:string};
type Source={bytes:ArrayBuffer;mime:string;name:string}|{youtubeUrl:string};

const instructions=`You watch a short practice video made by an adult learning videography, and report exactly what you see and hear, so a tutor can review it without watching.
Write plain, factual notes. Use MM:SS timestamps. Cover:
- every shot or cut: shot size (wide, medium, close), what is in frame, camera height and movement, steadiness
- focus, exposure (too dark, too bright, clipped sky), white balance or colour casts, light direction
- sound: speech (quote short key lines), clarity, loudness, background noise, wind, music, silences
- editing: order of shots, pacing, cuts that jump, titles or captions and whether they are readable
- the start and the end, and the total length
Describe, don't judge or score. If something can't be told, say so.
Sound: only report sounds you actually hear. If the video has no sound or only silence, write "No sound" and set hasSpeech to false. Never guess speech from text or pictures on screen.`;
const schema={type:'object',properties:{
 duration:{type:'string',description:'Total length as MM:SS.'},
 hasSpeech:{type:'boolean'},
 notes:{type:'string',description:'The timestamped notes, one observation per line.'}},required:['duration','hasSpeech','notes']};

async function call(path:string,init:RequestInit){
 const r=await fetch(api+path,{...init,headers:{'x-goog-api-key':geminiKey(),...(init.headers||{})}});
 if(!r.ok)throw new Error('Gemini '+r.status+': '+(await r.text()).slice(0,200));
 return r;
}
// Files API: start a resumable upload, send the bytes, then wait until Google has processed the video.
async function upload(bytes:ArrayBuffer,mime:string,name:string){
 const start=await call('/upload/v1beta/files',{method:'POST',headers:{'X-Goog-Upload-Protocol':'resumable','X-Goog-Upload-Command':'start','X-Goog-Upload-Header-Content-Length':String(bytes.byteLength),'X-Goog-Upload-Header-Content-Type':mime,'Content-Type':'application/json'},body:JSON.stringify({file:{display_name:name.slice(0,100)}})});
 const url=start.headers.get('x-goog-upload-url');if(!url)throw new Error('Gemini gave no upload URL');
 const done=await fetch(url,{method:'POST',headers:{'X-Goog-Upload-Offset':'0','X-Goog-Upload-Command':'upload, finalize','Content-Length':String(bytes.byteLength)},body:bytes});
 if(!done.ok)throw new Error('Gemini upload '+done.status);
 let file:any=(await done.json() as any).file;
 for(let i=0;i<40&&file.state==='PROCESSING';i++){await new Promise(r=>setTimeout(r,2500));file=await (await call('/v1beta/'+file.name,{method:'GET'})).json()}
 if(file.state!=='ACTIVE')throw new Error('Gemini could not process the video ('+file.state+')');
 return file as {name:string;uri:string;mimeType:string};
}

export async function watchVideo(src:Source):Promise<VideoWatch>{
 if(!geminiKey())return {ok:false,reason:'Video watching is not set up on this site.'};
 let file:{name:string;uri:string;mimeType:string}|null=null;
 try{
  const part='youtubeUrl' in src?{file_data:{file_uri:src.youtubeUrl}}:(file=await upload(src.bytes,src.mime,src.name),{file_data:{mime_type:file.mimeType,file_uri:file.uri}});
  const r=await call(`/v1beta/models/${geminiModel()}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
   contents:[{parts:[part,{text:instructions}]}],
   generationConfig:{responseMimeType:'application/json',responseJsonSchema:schema,temperature:0.2}})});
  const j:any=await r.json();
  const text=(j.candidates?.[0]?.content?.parts||[]).map((p:any)=>p.text||'').join('');
  const out=JSON.parse(text);
  if(typeof out.notes!=='string'||!out.notes.trim())throw new Error('Gemini returned no notes');
  return {ok:true,duration:String(out.duration||''),hasSpeech:!!out.hasSpeech,notes:out.notes.slice(0,6000)};
 }catch(e:any){
  console.error('Gemini video watch failed',String(e?.message||e).slice(0,300));
  return {ok:false,reason:'The video could not be watched this time.'};
 }finally{
  // Learners' videos are not kept at Google longer than needed.
  if(file)await call('/v1beta/'+file.name,{method:'DELETE'}).catch(()=>{});
 }
}
