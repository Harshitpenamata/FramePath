// Writes Lesson_Videos_Needed.csv: every lesson that has no video, and every lesson video on a site that can't be
// shown inside FramePath. Fill in the empty columns (one row per video; copy a row to add a second video to a
// lesson), save it, then run: python scripts/import-lesson-videos.py Lesson_Videos_Needed.csv
const fs=require('fs'),path=require('path');
const load=require('./lib/load-source.cjs');
const L=load(path.resolve('app/videography/lessons.ts')),P=load(path.resolve('app/videography/programme.ts'));
const blocked=['studiobinder.com','helpx.adobe.com','deitymic.com','collab.sundance.org','unscripted.com','learnlightandsound.com','dslrvideoshooter.com'];
const isBlocked=u=>{try{const h=new URL(u).hostname;return blocked.some(b=>h===b||h.endsWith('.'+b))}catch{return false}};
const csv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const rows=[['Lesson ID','Level','Module','Lesson title','What the lesson teaches','Why it needs a video','Style (blank = every style)','Replaces this link',
 'YouTube URL (fill in)','Video title (fill in)','Creator (fill in)','Start at mm:ss (optional)','Watch for: one line (fill in)']];
const level={B:'Beginner',I:'Intermediate',A:'Advanced'};
for(const id of Object.keys(L.moduleLessons)){
 const mod=P.curriculumModules.find(m=>m.id===id);
 L.lessonsFor(id).forEach((l,i)=>{
  const lid=id+'-'+(i+1),base=[lid,level[id[0]],id+' '+(mod?.title||''),l.title,l.idea];
  const refs=L.lessonVideoRefs[id]?.[i]||[],styled=refs.some(r=>r==='path'||r.startsWith('pathway'));
  const seen=new Set();
  for(const pw of styled?P.pathways:['Wedding']){
   const vids=L.lessonVideos(id,i,pw);
   if(!vids.length&&!seen.has('none')){seen.add('none');rows.push([...base,'No video yet',styled?pw:'','','','','','',''])}
   for(const v of vids)if(v.url&&isBlocked(v.url)&&!seen.has(v.url)){seen.add(v.url);rows.push([...base,'The current video ('+v.title+', '+v.creator+') can’t be shown inside FramePath',styled?pw:'',v.url,'','','','',''])}
  }
 });
}
fs.writeFileSync('Lesson_Videos_Needed.csv','﻿'+rows.map(r=>r.map(csv).join(',')).join('\r\n')+'\r\n');
console.log((rows.length-1)+' rows written to Lesson_Videos_Needed.csv');
