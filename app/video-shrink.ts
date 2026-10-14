// Shrinks a phone video in the browser so it fits the upload limit: it plays the video once (silently, through a
// canvas at up to 720p) and records it again at a lower bit rate, sound included. Takes about as long as the video.
// Loaded only when a learner picks a video that's too big.
export async function shrinkVideo(file:File,maxBytes:number,onProgress:(share:number)=>void):Promise<File>{
 const url=URL.createObjectURL(file),video=document.createElement('video');
 video.src=url;video.playsInline=true;video.preload='auto';
 try{
  await new Promise<void>((ok,bad)=>{video.onloadedmetadata=()=>ok();video.onerror=()=>bad(new Error('This video can’t be opened in your browser.'))});
  const seconds=video.duration;
  if(!isFinite(seconds)||seconds<=0)throw new Error('This video can’t be shrunk here.');
  // Bit rate that fits the limit, with room for the sound and the file's own overhead; capped at 2.5 Mbps.
  const videoBits=Math.min(2_500_000,Math.floor(maxBytes*8*0.75/seconds)-96_000);
  if(videoBits<350_000)throw new Error('This video is too long to shrink enough. Trim it, or upload it to YouTube or Google Drive and paste the link.');
  // The shorter side becomes at most 720 pixels (720p), keeping the shape; sizes stay even for the encoder.
  const k=Math.min(1,720/Math.min(video.videoWidth,video.videoHeight)),w=Math.round(video.videoWidth*k/2)*2,h=Math.round(video.videoHeight*k/2)*2;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d')!;
  // Sound goes through Web Audio into the recording only, so nothing plays out loud.
  const audio=new AudioContext(),dest=audio.createMediaStreamDestination();
  try{audio.createMediaElementSource(video).connect(dest)}catch{}
  const stream=new MediaStream([...canvas.captureStream(30).getVideoTracks(),...dest.stream.getAudioTracks()]);
  const type=['video/mp4;codecs=avc1,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  if(!type)throw new Error('Your browser can’t shrink videos. Upload it to YouTube or Google Drive and paste the link.');
  const rec=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:videoBits,audioBitsPerSecond:96_000}),chunks:Blob[]=[];
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  const stopped=new Promise<void>(ok=>{rec.onstop=()=>ok()});
  let drawing=true;const draw=()=>{if(!drawing)return;ctx.drawImage(video,0,0,w,h);onProgress(Math.min(1,video.currentTime/seconds));requestAnimationFrame(draw)};
  rec.start(1000);await audio.resume();await video.play();draw();
  await new Promise<void>(ok=>{video.onended=()=>ok()});
  drawing=false;rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());await audio.close();
  const base=type.split(';')[0],blob=new Blob(chunks,{type:base});
  if(blob.size>maxBytes)throw new Error('The shrunk video is still too big. Trim it, or link it from YouTube or Google Drive.');
  onProgress(1);
  return new File([blob],file.name.replace(/\.[^.]+$/,'')+'-small.'+(base==='video/mp4'?'mp4':'webm'),{type:base});
 }finally{URL.revokeObjectURL(url);video.removeAttribute('src');video.load()}
}
