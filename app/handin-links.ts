import {googleDocId} from './videography/programme';
// What the AI review can open from a hand-in link. Checked when the work is handed in, and again before a review
// is counted, so a link the AI can't open never uses up a review.
export const youtubeLink=(u:string)=>/^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}/.test(u||'');
export const driveId=(u:string)=>String(u||'').match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]{20,})/)?.[1]||'';
// The video type of a Drive download: Drive often labels a video as a generic download (application/octet-stream),
// so the file name decides. Only formats Gemini can watch count (not MKV, which OBS and many screen recorders save).
const watchable:Record<string,string>={mp4:'video/mp4',m4v:'video/mp4',mov:'video/quicktime',webm:'video/webm',avi:'video/x-msvideo',mpg:'video/mpeg',mpeg:'video/mpeg',wmv:'video/x-ms-wmv','3gp':'video/3gpp'};
export function driveVideo(r:Response){
 const type=(r.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
 const ext=(decodeURIComponent((r.headers.get('content-disposition')||'').match(/filename\*?=(?:UTF-8'')?"?([^";]+)/i)?.[1]||'').split('.').pop()||'').toLowerCase();
 const mime=type.startsWith('video/')&&type!=='video/x-matroska'?type:/^(application|binary)\/octet-stream$/.test(type)?watchable[ext]||'':'';
 return {mime,mkv:ext==='mkv'||type==='video/x-matroska'};
}
export const driveFolderId=(u:string)=>String(u||'').match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([\w-]{20,})/)?.[1]||'';
// The videos in a shared Drive folder, from its public folder view (no sign-in), up to what a review watches.
export async function driveFolderVideos(url:string,max=2):Promise<string[]>{
 const r=await fetch('https://drive.google.com/embeddedfolderview?id='+driveFolderId(url));const page=r.ok?await r.text():'',out:string[]=[];
 for(const m of page.matchAll(/<a href="https:\/\/drive\.google\.com\/file\/d\/([\w-]{20,})[^"]*"[^>]*>[\s\S]*?<div class="flip-entry-title">([^<]*)<\/div>/g))if(/\.(mp4|m4v|mov|webm|avi|mpe?g|wmv|3gp)$/i.test(m[2].trim()))out.push('https://drive.google.com/file/d/'+m[1]+'/view');
 return out.slice(0,max);
}
export const driveDownload=(u:string)=>'https://drive.usercontent.google.com/download?export=download&confirm=t&id='+driveId(u);
const docMax=15*1024*1024,notShared='The Google Doc isn’t shared. In Google Docs, click Share and set General access to “Anyone with the link”, then hand in again.';
// A Google Doc exported as PDF. Claude fetches the export link itself, so the file is never held in this worker (a
// 10 MB PDF as base64 overran the worker's memory). Checked here that the link really gives a PDF: a doc that isn't
// shared redirects to Google sign-in (an HTML page).
export async function readDoc(url:string):Promise<{ok:true;pdfUrl:string}|{ok:false;reason:string}>{
 const pdfUrl='https://docs.google.com/document/d/'+googleDocId(url)+'/export?format=pdf';
 try{const r=await fetch(pdfUrl,{redirect:'follow'});const size=Number(r.headers.get('content-length')||0);await r.body?.cancel();
  if(!r.ok||!(r.headers.get('content-type')||'').startsWith('application/pdf'))return {ok:false,reason:notShared};
  if(size>docMax)return {ok:false,reason:'The Google Doc is too large for the AI review (over 15 MB). Use fewer or smaller pictures.'};
  return {ok:true,pdfUrl};
 }catch{return {ok:false,reason:'The Google Doc could not be opened. Check the link, then hand in again.'}}
}
// '' when the AI review can open the link, otherwise what the learner should fix.
export async function linkProblem(url:string):Promise<string>{
 if(!url)return '';
 try{
  if(googleDocId(url)){const doc=await readDoc(url);return doc.ok?'':doc.reason}
  if(youtubeLink(url)){const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(url));await r.body?.cancel();return r.ok?'':'That YouTube video can’t be opened. Set it to Public or Unlisted, then hand in again.'}
  if(driveFolderId(url)){const vids=await driveFolderVideos(url);if(!vids.length)return 'The AI found no videos in that Drive folder. Share the folder as “Anyone with the link”, and put MP4 or MOV videos in it (MKV can’t be watched).';
   for(const v of vids){const why=await driveFileProblem(v);if(why)return why}return ''}
  if(driveId(url))return await driveFileProblem(url);
 }catch{return 'That link could not be opened. Check it, then hand in again.'}
 return 'The AI review can only open YouTube links, Google Drive videos or folders, and Google Docs. Upload your work, or use one of those.';
}
async function driveFileProblem(url:string):Promise<string>{
  {const r=await fetch(driveDownload(url),{redirect:'follow'});await r.body?.cancel();const v=r.ok?driveVideo(r):{mime:'',mkv:false};
   return v.mime?'':v.mkv?'The AI can’t watch MKV files. Save the video as MP4 (most phones and editors can), upload it again, then hand in again.':'That Google Drive link isn’t a shared video the AI can open. Share the video file as “Anyone with the link” (a MP4, MOV or WebM works best), then hand in again.'}
}
// Runs the jobs at most n at a time, keeping their order.
export async function inTurns<T>(jobs:(()=>Promise<T>)[],n:number){const out:T[]=new Array(jobs.length);let next=0;
 await Promise.all(Array.from({length:Math.min(n,jobs.length)},async()=>{while(next<jobs.length){const k=next++;out[k]=await jobs[k]()}}));return out}
