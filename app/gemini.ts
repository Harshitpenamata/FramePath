import {env} from 'cloudflare:workers';
import {recordUsage} from './ai-budget';

// Gemini watches hand-in videos (picture and sound) and writes timestamped notes. Claude then writes the review
// from those notes. Claude can't take video, so this is the only part that sees the video itself.
// The model is a setting (GEMINI_MODEL); the default is the low-cost Flash-Lite model, for testing.
const api='https://generativelanguage.googleapis.com';
export const geminiModel=()=>(env as any).GEMINI_MODEL||process.env.GEMINI_MODEL||'gemini-3.5-flash-lite';
export function geminiKey(){return (env as any).GEMINI_API_KEY||process.env.GEMINI_API_KEY||''}
// retry: the failure was temporary (Gemini busy or unreachable), so the review should wait and try again later.
export type VideoWatch={ok:true;duration:string;hasSpeech:boolean;notes:string}|{ok:false;reason:string;retry?:boolean};
type Source={stream:ReadableStream;size:number;mime:string;name:string}|{youtubeUrl:string};

const instructions=`You watch a short practice video made by an adult learning videography, and report exactly what you see and hear, so a tutor can review it without watching.
Write plain, factual notes. Use MM:SS timestamps. Cover:
- every shot or cut: shot size (wide, medium, close), what is in frame, camera height and movement, steadiness
- focus, exposure (too dark, too bright, clipped sky), white balance or colour casts, light direction
- sound: speech (quote short key lines), clarity, loudness, background noise, wind, music, silences
- editing: order of shots, pacing, cuts that jump, titles or captions and whether they are readable
- the start and the end, and the total length
- what a director would notice, still as description: what each shot is for, where the eye goes first, whether the light seems to come from a real source, whether cuts land on movement or on a beat, and the moment the video is strongest and weakest
Describe, don't judge or score. If something can't be told, say so.
Sound: only report sounds you actually hear. If the video has no sound or only silence, write "No sound" and set hasSpeech to false. Never guess speech from text or pictures on screen.`;
const photoInstructions=`You look at one still photo made by an adult learning videography, and report exactly what you see, so a tutor can review it without seeing it.
Write plain, factual notes. Cover: what is in the frame and the shot size (wide, medium, close), where the eye goes first, composition and what sits at the edges, camera height and angle, focus and what is sharp, exposure (too dark, too bright, clipped highlights), white balance or colour casts, light direction and quality, and anything distracting.
Describe, don't judge or score. Set duration to "" and hasSpeech to false.`;
const schema={type:'object',properties:{
 duration:{type:'string',description:'Total length as MM:SS.'},
 hasSpeech:{type:'boolean'},
 notes:{type:'string',description:'The timestamped notes, one observation per line.'}},required:['duration','hasSpeech','notes']};

class GeminiError extends Error{constructor(public status:number,msg:string){super(msg)}}
async function call(path:string,init:RequestInit,tries=1){
 for(let i=0;;i++){
  const r=await fetch(api+path,{...init,headers:{'x-goog-api-key':geminiKey(),...(init.headers||{})}});
  if(r.ok)return r;
  const text=(await r.text()).slice(0,200);
  // Busy or briefly unavailable: wait and try again (4 s, then 10 s).
  if([429,500,503].includes(r.status)&&i<tries-1){await new Promise(x=>setTimeout(x,i?10000:4000));continue}
  throw new GeminiError(r.status,'Gemini '+r.status+': '+text);
 }
}
// Files API: start a resumable upload, send the bytes, then wait until Google has processed the video.
async function upload(stream:ReadableStream,size:number,mime:string,name:string){
 const start=await call('/upload/v1beta/files',{method:'POST',headers:{'X-Goog-Upload-Protocol':'resumable','X-Goog-Upload-Command':'start','X-Goog-Upload-Header-Content-Length':String(size),'X-Goog-Upload-Header-Content-Type':mime,'Content-Type':'application/json'},body:JSON.stringify({file:{display_name:name.slice(0,100)}})});
 const url=start.headers.get('x-goog-upload-url');if(!url)throw new Error('Gemini gave no upload URL');
 const {readable,writable}=new FixedLengthStream(size);stream.pipeTo(writable).catch(()=>{});
 const done=await fetch(url,{method:'POST',headers:{'X-Goog-Upload-Offset':'0','X-Goog-Upload-Command':'upload, finalize'},body:readable});
 if(!done.ok)throw new Error('Gemini upload '+done.status);
 let file:any=(await done.json() as any).file;
 for(let i=0;i<40&&file.state==='PROCESSING';i++){await new Promise(r=>setTimeout(r,2500));file=await (await call('/v1beta/'+file.name,{method:'GET'})).json()}
 if(file.state!=='ACTIVE')throw new Error('Gemini could not process the video ('+file.state+')');
 return file as {name:string;uri:string;mimeType:string};
}

// focus: what this module's craft lens wants noticed (review-guide.ts), added to the instructions.
export async function watchVideo(src:Source,focus=''):Promise<VideoWatch>{
 if(!geminiKey())return {ok:false,reason:'Video watching is not set up on this site.'};
 let file:{name:string;uri:string;mimeType:string}|null=null;
 try{
  const part='youtubeUrl' in src?{file_data:{file_uri:src.youtubeUrl}}:(file=await upload(src.stream,src.size,src.mime,src.name),{file_data:{mime_type:file.mimeType,file_uri:file.uri}});
  const r=await call(`/v1beta/models/${geminiModel()}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
   contents:[{parts:[part,{text:('mime' in src&&src.mime.startsWith('image/')?photoInstructions:instructions)+(focus?'\nFor this task, pay extra attention to: '+focus+'.':'')}]}],
   generationConfig:{responseMimeType:'application/json',responseJsonSchema:schema,temperature:0.2}})},3);
  const j:any=await r.json();
  const um=j.usageMetadata||{};await recordUsage('google',geminiModel(),'video-watch',um.promptTokenCount||0,(um.candidatesTokenCount||0)+(um.thoughtsTokenCount||0));
  const text=(j.candidates?.[0]?.content?.parts||[]).map((p:any)=>p.text||'').join('');
  const out=JSON.parse(text);
  if(typeof out.notes!=='string'||!out.notes.trim())throw new Error('Gemini returned no notes');
  return {ok:true,duration:String(out.duration||''),hasSpeech:!!out.hasSpeech,notes:out.notes.slice(0,6000)};
 }catch(e:any){
  console.error('Gemini video watch failed',String(e?.message||e).slice(0,300));
  const busy=e instanceof GeminiError?[429,500,503].includes(e.status):!(e instanceof SyntaxError);
  return {ok:false,reason:busy?'The video service was busy.':'The video could not be watched this time.',retry:busy};
 }finally{
  // Learners' videos are not kept at Google longer than needed.
  if(file)await call('/v1beta/'+file.name,{method:'DELETE'}).catch(()=>{});
 }
}
