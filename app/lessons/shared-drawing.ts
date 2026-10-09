// Original instructional geometry. No photographs or representational artwork.
export function drawTeaching(ctx:any,width:number,height:number,spec:any,x:number,y:number,order=[0,1,2],title=''){
 ctx.clearRect(0,0,width,height);ctx.save();ctx.scale(width/720,height/430);
 const ink='#e4eee8',mint='#cfdf9e',blue='#79b2c0',muted='#8daaaa',red='#edb2a4';
 ctx.fillStyle='#102b32';ctx.fillRect(0,0,720,430);
 const text=(t:any,px:number,py:number,size=20,c=ink,align='left')=>{ctx.fillStyle=c;ctx.font=size+'px system-ui, sans-serif';ctx.textAlign=align;ctx.fillText(String(t),px,py);};
 const rect=(px:number,py:number,w:number,h:number,c:string,stroke=false)=>{if(stroke){ctx.strokeStyle=c;ctx.lineWidth=3;ctx.strokeRect(px,py,w,h);}else{ctx.fillStyle=c;ctx.fillRect(px,py,w,h);}};
 const line=(x1:number,y1:number,x2:number,y2:number,c=muted,dash=false)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=3;ctx.setLineDash(dash?[7,6]:[]);ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);};
 const circle=(cx:number,cy:number,r:number,c:string)=>{ctx.beginPath();ctx.fillStyle=c;ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();};
 const value=(v:number,r:number[])=>Math.max(0,Math.min(1,(v-r[0])/(r[1]-r[0]||1)));
 const a=value(x,spec.range),b=value(y,spec.rangeY),mode=spec.mode;
 text(title.length>53?title.slice(0,51)+'…':title,28,34,22,mint);
 if(['sequence','timing','coverage','revision','temporal'].includes(mode)){
  const lengths=mode==='coverage'?[x,12,y]:mode==='temporal'?[x/y,x/y,x/y]:[x,8,y],sum=lengths.reduce((n,v)=>n+v,0)||1;let left=40;
  for(let i=0;i<3;i++){const w=Math.max(3,lengths[i]/sum*640);rect(left,125,w-2,92,[blue,mint,muted][i]);text(String(order[i]+1),left+w/2,180,32,'#102b32','center');text(lengths[i].toFixed(1)+'s',left+w/2,249,18,ink,'center');left+=w;}
  text(mode==='temporal'?x+' frames ÷ '+y+' fps = '+(x/y).toFixed(1)+' seconds':mode==='coverage'?'Before · uninterrupted action · after':'Time changes emphasis',40,90,20);
  if(mode==='revision'){rect(40,290,Math.min(600,x*40),20,muted);rect(40,325,Math.min(600,y*40),20,mint);text('Before / after',540,326,17);}
 }else if(['frame','depth','format','screen'].includes(mode)){
  rect(60,85,600,240,'#1d414b');for(let i=1;i<3;i++){line(60+i*200,85,60+i*200,325,muted,true);line(60,85+i*80,660,85+i*80,muted,true);}
  const subject=mode==='frame'?60+b*600:300;circle(subject,185,24,mint);rect(subject-29,218,58,50,mint);
  if(mode==='depth'){rect(60+b*500-a*120,95,30+a*230,220,blue,true);text('Outlined area = acceptably sharp zone',60,357,18);}
  else if(mode==='format'){const w=x===2?135:x===1?235:590;rect(360-w/2,88,w,235,mint,true);rect(360-w*.43,85+y*2.7,w*.86,26,'#cadf9b');text('KEY WORDS',360,105+y*2.7,16,'#102b32','center');}
  else if(mode==='screen'){rect(430,120,190,110,'#8d5952');text('Other window',525,177,18,ink,'center');ctx.globalAlpha=b;rect(395,272,235,38,red);text('Private notification',410,297,18,'#102b32');ctx.globalAlpha=1;rect(70,100,180+a*400,200,mint,true);}
  else rect(360-a*280,96,50+a*560,218,mint,true);
 }else if(mode==='exposure'){
  const ratio=x/4*50/y;for(let i=0;i<7;i++){const shade=Math.min(255,Math.max(0,(i+1)*28*ratio));rect(50+i*90,130,83,120,'rgb('+shade+','+shade+','+shade+')');}
  for(let i=0;i<6;i++){ctx.globalAlpha=(6-i)/6;rect(180-i*90/y,295,30,26,blue);}ctx.globalAlpha=1;
  text('Relative brightness: '+ratio.toFixed(2)+'×',45,94,22);text('Longer trail = more motion blur',275,319,18);
 }else if(mode==='motion'||mode==='stability'){
  line(50,275,660,275);const gap=mode==='motion'?Math.min(90,y*200/x):Math.max(3,x*(1-y/120)*.55);
  for(let i=0;i<7;i++){circle(100+i*80,200+(mode==='stability'?Math.sin(i*3)*gap:0),12,mint);if(i<6)line(100+i*80,250,100+i*80+gap,250,blue);}
  text(mode==='motion'?'Wider sample gaps can miss important detail':'Residual movement shrinks with effective support',50,335,19);
 }else if(mode==='colour'){
  const r=Math.round(80+140*a),bl=Math.round(220-140*a);rect(65,95,590,240,'rgb('+r+',130,'+bl+')');ctx.globalAlpha=b*.6;rect(65,95,590,240,'#fff');ctx.globalAlpha=1;rect(115,142,130,130,'#e4e4e4');rect(315,142,255,130,'rgba('+r+',170,'+bl+',0.7)');text('Neutral reference',175,306,17,'#102b32','center');
 }else if(mode==='light'){
  const rad=x*Math.PI/180,lx=360+240*Math.cos(rad),ly=190-120*Math.sin(rad);circle(360,210,24,mint);circle(lx,ly,12+b*24,blue);line(lx,ly,360,210,blue);ctx.save();ctx.translate(360,210);ctx.rotate(rad);ctx.globalAlpha=.65;ctx.fillStyle=muted;ctx.beginPath();ctx.moveTo(-20,-10);ctx.lineTo(-220,-20-b*70);ctx.lineTo(-220,20+b*70);ctx.closePath();ctx.fill();ctx.restore();text('Larger source: wider soft transition',40,355,19);
 }else if(mode==='sound'){
  const useful=Math.max(.05,1/(x/35)),noise=y/100;rect(80,280-useful*160,220,useful*160,mint);rect(400,280-noise*160,220,noise*160,red);text('Useful sound',190,320,22,ink,'center');text('Background',510,320,22,ink,'center');line(50,280,670,280);text('Illustrative level comparison, not measured dB',40,80,19);
 }else if(mode==='line'){
  line(80,215,640,215,mint,true);circle(190,215,18,mint);circle(530,215,18,mint);for(const [n,v] of [x,y].entries()){const rad=v*Math.PI/180,cx=360+205*Math.cos(rad),cy=215-145*Math.sin(rad);circle(cx,cy,16,n?blue:red);text(n?'B':'A',cx,cy+6,18,'#102b32','center');line(cx,cy,360,215,n?blue:red);}text(y>180?'Different sides: direction can reverse':'Same side: screen direction remains consistent',40,390,19);
 }else if(mode==='archive'||mode==='signal'||mode==='claims'||mode==='evidence'){
  for(let i=0;i<3;i++){const px=45+i*230,active=mode==='signal'?(i===0||i===1&&x===1||i===2&&y===1):mode==='archive'?i<x:mode==='claims'?i<Math.min(3,y):i===0?x>=60:i===1?true:y<=30;rect(px,130,175,100,active?'#41646a':'#403739');text(active?'Available':'Check needed',px+87,187,18,active?mint:red,'center');if(i<2)line(px+180,180,px+218,180,muted,!active);}
  text(mode==='signal'?(x===1?'Primary signal working':'Primary signal lost')+' · '+(y===1?'local backup enabled':'no tested backup'):mode==='archive'?y+' of '+x+' planned copies checked':mode==='claims'?Math.max(0,x-y)+' claim(s) still need support':'Context '+x+'% · private details '+y+'%',40,307,21);
 }else if(mode==='caption'){
  rect(70,85,580,225,'#25444d');rect(90,150,540,100,'#0b1e23');text('Place the cup on the left shelf.',360,205,x,ink,'center');text('33 characters / '+y+'s = '+(33/y).toFixed(1)+' characters per second',360,355,19,33/y>17?red:mint,'center');
 }else if(mode==='place'){
  for(let i=0;i<3;i++){rect(70+i*225,155,130,110,i===1?blue:mint);text(String(i+1),135+i*225,220,34,'#102b32','center');if(i<2)line(205+i*225,208,285+i*225,208,x>i?mint:red,x<=i);}
  text(x+' connecting views · '+y+' isolated details',40,335,21);
 }else if(mode==='measurement'){
  rect(100,180,520,100,'#284f56');const offset=Math.tan(x*Math.PI/180)*55;line(160,200,560-offset,200,mint);line(160,260,560,260,blue);text(y===1?'Reference in subject plane':'Reference in another plane',40,330,21,y===1?mint:red);text('Tilt: '+x+'° · apparent lengths differ',40,90,21);
 }else if(mode==='aerial'){
  for(let i=0;i<9;i++)line(50+i*75,90,50+i*75,335,'#234a50');for(let i=0;i<5;i++)line(50,90+i*60,650,90+i*60,'#234a50');rect(310,145,125,105,'#805349');rect(310-y*2,145-y,125+y*4,105+y*2,red,true);line(50+x*5.8,100,50+x*5.8,320,mint);text('Fictional avoid area and planning buffer',40,375,20);
 }else if(mode==='spatial'){
  rect(60,115,310,170,'#3f656d');rect(365-x*3,115+y,280,170,'rgba(143,183,157,.6)');line(90,200,365,200,mint);line(365-x*3,200+y,635-x*3,200+y,mint);text('Overlap '+x+'% · join offset '+y,40,350,21);
 }
 spec.labels.forEach((label:string,i:number)=>text(label.length>24?label.slice(0,23)+'…':label,120+i*240,408,15,muted,'center'));
 ctx.restore();
}
