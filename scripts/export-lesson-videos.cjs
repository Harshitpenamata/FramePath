// Writes FramePath_Lesson_Videos.csv: every video in every lesson, as learners see it.
// Style-project lessons (B13 / I13 / A13) list their videos once per style. Run: node scripts/export-lesson-videos.cjs
const path=require('path'),fs=require('fs'),load=require('./lib/load-source.cjs');
const L=load(path.resolve('app/videography/lessons.ts')),P=load(path.resolve('app/videography/programme.ts'));
const extra=JSON.parse(fs.readFileSync('app/videography/lesson-videos.json','utf8'));
// Views and likes gathered when the YouTube picks were made (Lesson_Videos_Needed.csv).
const stats={};
if(fs.existsSync('Lesson_Videos_Needed.csv')){
 const t=fs.readFileSync('Lesson_Videos_Needed.csv','utf8').replace(/^﻿/,'');const lines=t.split(/\r?\n/);
 const cells=l=>(l.match(/"((?:[^"]|"")*)"/g)||[]).map(x=>x.slice(1,-1).replace(/""/g,'"'));
 const head=cells(lines[0]),u=head.findIndex(h=>h.startsWith('YouTube URL')),vw=head.indexOf('Views'),lk=head.indexOf('Likes');
 for(const l of lines.slice(1)){const c=cells(l);if(c[u])stats[c[u]]={views:c[vw]||'',likes:c[lk]||''}}
}
const lv={B:'Beginner',I:'Intermediate',A:'Advanced'};
const link=v=>v.youtubeId?'https://www.youtube.com/watch?v='+v.youtubeId+(v.start?'&t='+v.start+'s':''):v.vimeoId?'https://vimeo.com/'+v.vimeoId:v.url;
const clock=s=>s?Math.floor(s/60)+':'+String(s%60).padStart(2,'0'):'';
const rows=[['Level','Module ID','Module','Lesson','Lesson title','Style','Video #','Video title','Creator','Link','Starts at','Watch for','Source','Views','Likes']];
for(const id of Object.keys(L.moduleLessons)){
 const mod=P.curriculumModules.find(m=>m.id===id);
 L.lessonsFor(id).forEach((l,i)=>{
  const per=P.pathways.map(pw=>[pw,L.lessonVideos(id,i,pw)]),same=per.every(([,v])=>JSON.stringify(v)===JSON.stringify(per[0][1]));
  const added=new Set((extra[id+'-'+(i+1)]||[]).map(x=>x.youtubeId||x.url));
  for(const [pw,vids] of same?[['All styles',per[0][1]]]:per){
   if(!vids.length){rows.push([lv[id[0]],id,mod.title,i+1,l.title,pw,'','(no video yet)','','','','','','','']);continue}
   vids.forEach((v,k)=>{const url=link(v),st=stats[v.youtubeId?'https://www.youtube.com/watch?v='+v.youtubeId:v.url]||{};
    rows.push([lv[id[0]],id,mod.title,i+1,l.title,pw,k+1,v.title,v.creator,url,clock(v.start),v.focus,added.has(v.youtubeId||v.url)?'Added (YouTube search or team pick)':'Curated video library',st.views||'',st.likes||''])});
  }
 });
}
const csv=r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',');
fs.writeFileSync('FramePath_Lesson_Videos.csv','﻿'+rows.map(csv).join('\r\n')+'\r\n');
console.log((rows.length-1)+' rows, '+new Set(rows.slice(1).map(r=>r[9]).filter(Boolean)).size+' different videos, '+rows.filter(r=>r[7]==='(no video yet)').length+' lessons without a video');
