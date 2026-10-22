'use client';
import React,{useEffect,useMemo,useState} from 'react';
import {Copy,Flag,Globe2,Heart,Link2,Lock,Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {useLearning,Panel,Go,Action,CheckField,PageHead,Gate,Photo,confirmAction} from '../ui';
import {levelNames,type Level} from './programme';
import {Showcase,itemsFromPublic,itemsFromSubmissions,type ShowItem} from './showcase';
import {useVideoReviews} from './work-folders';
import './studio.css';
import {WorkSwitch} from './my-work';
import './community.css';

// The portfolio page (resume-like), the community gallery, and likes and comments on shared pieces.
const signIn=()=>'/auth/google?return_to='+encodeURIComponent(window.location.pathname);
async function post(body:any){const r=await fetch('/api/community',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d:any=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'That didn’t work. Please try again.');return d}
const when=(v:number)=>new Date(v).toLocaleDateString('en-IN',{day:'numeric',month:'short'});

// Likes and comments for one piece. Comments are checked by Claude before they're posted.
function PieceSocial({token,pieceId}:{token:string;pieceId:string}){
 const [data,setData]=useState<any>(null),[text,setText]=useState(''),[sending,setSending]=useState(false);
 useEffect(()=>{let live=true;setData(null);fetch('/api/community?token='+encodeURIComponent(token)).then(r=>r.ok?r.json():null).then(d=>{if(live)setData(d)}).catch(()=>{});return ()=>{live=false}},[token]);
 if(!data)return <div className="cm-social"><p className="small">Loading likes and comments…</p></div>;
 const liked=data.liked.includes(pieceId),likes=data.likes[pieceId]||0,comments:any[]=data.comments[pieceId]||[];
 const setComments=(fn:(c:any[])=>any[])=>setData((d:any)=>({...d,comments:{...d.comments,[pieceId]:fn(d.comments[pieceId]||[])}}));
 async function like(){try{const r=await post({action:'like',token,pieceId,on:!liked});setData((d:any)=>({...d,likes:{...d.likes,[pieceId]:r.likes},liked:r.liked?[...d.liked,pieceId]:d.liked.filter((x:string)=>x!==pieceId)}))}catch(e:any){toast.error(e.message)}}
 async function send(e:React.FormEvent){e.preventDefault();if(text.trim().length<2)return;setSending(true);try{const r=await post({action:'comment',token,pieceId,body:text});setText('');if(r.comment.pending)toast.info('Thanks. Your comment will appear once it’s been checked.');else setComments(c=>[...c,r.comment])}catch(e:any){toast.error(e.message)}finally{setSending(false)}}
 async function remove(id:string){if(!await confirmAction('The comment is deleted for everyone.','Delete this comment'))return;try{await post({action:'delete',commentId:id});setComments(c=>c.filter(x=>x.id!==id))}catch(e:any){toast.error(e.message)}}
 async function report(id:string){const reason=window.prompt('What’s wrong with this comment?','Unkind or off-topic');if(reason===null)return;try{await post({action:'report',commentId:id,reason:reason.slice(0,300)||'Reported'});setComments(c=>c.filter(x=>x.id!==id));toast.success('Thanks. The comment is hidden while we look at it.')}catch(e:any){toast.error(e.message)}}
 return <div className="cm-social">
  {data.signedIn?<button type="button" className={'cm-like'+(liked?' on':'')} aria-pressed={liked} onClick={like}><Heart size={16}/>{likes} {likes===1?'like':'likes'}</button>
   :<span className="cm-like"><Heart size={16}/>{likes} {likes===1?'like':'likes'}</span>}
  <h3>Comments{comments.length?' ('+comments.length+')':''}</h3>
  {comments.length?<ul className="cm-comments">{comments.map(c=><li key={c.id}>
   <div className="cm-comment-head"><strong>{c.author}</strong><span className="small">{when(c.createdAt)}</span>
    <span className="cm-comment-tools">{c.canDelete&&<button type="button" aria-label="Delete comment" onClick={()=>remove(c.id)}><Trash2 size={14}/></button>}{data.signedIn&&!c.mine&&<button type="button" aria-label="Report comment" onClick={()=>report(c.id)}><Flag size={14}/></button>}</span></div>
   <p className="prewrap">{c.body}</p></li>)}</ul>:<p className="small">No comments yet.</p>}
  {data.signedIn?<form className="cm-form" onSubmit={send}><textarea rows={3} maxLength={600} value={text} onChange={e=>setText(e.target.value)} placeholder="Say what works, or one thing to try next." aria-label="Your comment"/>
   <Button type="submit" size="sm" disabled={sending||text.trim().length<2}>{sending?'Checking…':'Post comment'}</Button><span className="small">Comments are checked before they appear. Be kind and specific.</span></form>
   :<a className="text-link" href={signIn()}>Sign in to like and comment</a>}
 </div>;
}
const socialFor=(item:ShowItem)=>item.token&&!/^\d+$/.test(item.id)?<PieceSocial token={item.token} pieceId={item.id}/>:null;

// A resume-style header and the work: who made it, what they've practised, then the gallery.
function PortfolioResume({name,title,bio,items,social=true}:{name:string;title:string;bio:string;items:ShowItem[];social?:boolean}){
 const levels=[...new Set(items.map(i=>i.level).filter(Boolean))] as Level[];
 const modules=[...new Map(items.filter(i=>i.moduleId).map(i=>[i.moduleId,i.title])).entries()];
 return <div className="cm-resume">
  <header className="cm-resume-head">
   <span className="cm-avatar" aria-hidden="true">{(name||'F').trim().charAt(0).toUpperCase()}</span>
   <div><span className="kicker">A FRAMEPATH LEARNING PORTFOLIO</span><h1>{name}</h1><p className="cm-resume-title">{title}</p>{bio&&<p className="prewrap">{bio}</p>}</div>
  </header>
  <dl className="cm-resume-facts">
   <div><dt>Pieces</dt><dd>{items.length}</dd></div>
   <div><dt>Modules</dt><dd>{modules.length}</dd></div>
   <div><dt>Level</dt><dd>{levels.length?levels.map(l=>levelNames[l]).join(', '):'—'}</dd></div>
  </dl>
  {modules.length>0&&<div className="cm-skills"><h2>What I’ve practised</h2><ul>{modules.map(([id,t])=><li key={id}><strong>{id}</strong> {t}</li>)}</ul></div>}
  <h2>Work</h2>
  <Showcase items={items} social={social?socialFor:undefined}/>
  <p className="small">This is practice work. AI reviews are not official qualifications.</p>
 </div>;
}

// /p/<token>: a shared portfolio, open to anyone with the link.
export function SharedPortfolioPage({token}:{token:string}){
 const [data,setData]=useState<any>(null),[error,setError]=useState('');
 useEffect(()=>{fetch('/api/portfolio/'+encodeURIComponent(token)).then(async r=>{const d:any=await r.json();if(!r.ok)throw Error(d.error);setData(d)}).catch(e=>setError(e.message))},[token]);
 if(error)return <Panel className="empty"><h1>Portfolio unavailable</h1><p>{error}</p><Go href="/">Visit Framepath</Go></Panel>;
 if(!data)return <Panel><p role="status">Opening portfolio…</p></Panel>;
 return <><PortfolioResume name={data.name} title={data.title} bio={data.bio} items={itemsFromPublic(data.items,token)}/><Go href="/community" outline>See more learners’ work</Go></>;
}

const visibilities=[
 {id:'private',Icon:Lock,label:'Private',text:'Only you can see it.'},
 {id:'unlisted',Icon:Link2,label:'Unlisted',text:'Anyone with the link can see it.'},
 {id:'public',Icon:Globe2,label:'Public',text:'Anyone with the link, and it’s shown in Community.'},
] as const;

// /my-portfolio: the learner's own portfolio page, with who can see it.
export function MyPortfolio(){
 const {s,mutate,user,loaded}=useLearning();const reviews=useVideoReviews();
 const current=s.portfolio.token?(s.portfolio.visibility||'unlisted'):'private';
 const [choice,setChoice]=useState<string>(current),[consent,setConsent]=useState(false);
 useEffect(()=>{setChoice(current)},[current]);
 const items=useMemo(()=>{const subs=(s.portfolio.ids||[]).map((id:string)=>s.submissions.find((p:any)=>p.id===id)).filter(Boolean);return itemsFromSubmissions(subs,reviews).map(i=>({...i,token:s.portfolio.token||undefined}))},[s.portfolio.ids,s.submissions,s.portfolio.token,reviews]);
 const link=s.portfolio.token?window.location.origin+'/p/'+s.portfolio.token:'';
 const needsConsent=current==='private'&&choice!=='private';
 async function apply(){if(choice==='private')await mutate('portfolio_unpublish');else await mutate('portfolio_publish',{consent:true,visibility:choice});setConsent(false)}
 return <div className="st-page">
 <WorkSwitch current="portfolio"/>
 <div className={'st-hero'+(loaded&&!user?' split':'')}><PageHead title="Your portfolio">Pick your best pieces in My work, then choose who can see them.</PageHead>{loaded&&!user&&<Gate>{null}</Gate>}</div>
 {(!loaded||user)&&<Gate>
  <section className="cm-share st-card">
   <div><span className="kicker">Who can see your portfolio</span><h2>Sharing</h2></div>
   <div className="cm-vis" role="radiogroup" aria-label="Who can see your portfolio">{visibilities.map(v=><button type="button" role="radio" aria-checked={choice===v.id} key={v.id} className={choice===v.id?'selected':''} onClick={()=>setChoice(v.id)}><v.Icon size={18}/><strong>{v.label}</strong><span className="small">{v.text}</span></button>)}</div>
   {choice==='public'&&s.consent?.age!=='adult'&&<p className="notice">{s.consent?'Public portfolios are for learners 18 and over. You can still share yours by link: choose Unlisted.':<>Before sharing publicly, tell us your age group: <Button size="sm" variant="outline" onClick={()=>mutate('consent_save',{age:'adult'})}>I’m 18 or older</Button> <Button size="sm" variant="outline" onClick={()=>mutate('consent_save',{age:'guardian'})}>I’m 13 to 17</Button></>}</p>}
   {needsConsent&&<CheckField checked={consent} onChange={setConsent}>I have permission to share this work, and everyone you can recognise in it has agreed to it being shared.</CheckField>}
   <div className="cm-share-actions">
    <Action disabled={choice===current||(needsConsent&&!consent)||(choice!=='private'&&!items.length)||(choice==='public'&&s.consent?.age!=='adult')} onClick={apply}>Save sharing</Action>
    <Go href="/portfolio" outline>Choose pieces in My Work</Go>
   </div>
   {!items.length&&<p className="small">Pick pieces with the Portfolio tick box in My Work first.</p>}
   {link&&<div className="st-share"><input readOnly value={link} onFocus={e=>e.target.select()} aria-label="Portfolio link"/>
    <Button variant="outline" onClick={async()=>{try{await navigator.clipboard.writeText(link);toast.success('Portfolio link copied')}catch{toast.info('Select the link and copy it.')}}}><Copy size={16}/>Copy link</Button></div>}
  </section>
  {items.length?<PortfolioResume name={s.profile?.name||'Your name'} title={s.portfolio.title||'My videography journey'} bio={s.portfolio.bio||''} items={items} social={!!s.portfolio.token}/>
   :<Panel className="empty"><h2>Your portfolio is empty</h2><p>Tick <strong>Portfolio</strong> on the hand-ins you want to show, then save in My Work.</p><Go href="/portfolio">Go to My Work</Go></Panel>}
 </Gate>}
 </div>;
}

// /community: pieces from public portfolios, newest first, with likes.
export function CommunityGallery(){
 const [data,setData]=useState<any>(null),[error,setError]=useState('');
 useEffect(()=>{fetch('/api/community').then(async r=>{const d:any=await r.json();if(!r.ok)throw Error(d.error);setData(d)}).catch(e=>setError(e.message||'The community is unavailable right now.'))},[]);
 const items=useMemo(()=>data?data.portfolios.flatMap((p:any)=>itemsFromPublic(p.items,p.token).map(i=>({...i,owner:p.name}))):[],[data]);
 return <>
  <section className="cm-hero"><PageHead title="What other learners are making.">Practice work from learners who chose to share their portfolio publicly. Open a piece to like it or leave a comment.</PageHead><Photo slot="community" className="cm-hero-photo"/></section>
  {error?<Panel><p>{error}</p></Panel>:!data?<Panel><p role="status">Loading the community…</p></Panel>
   :<Showcase items={items} social={socialFor}
     tileExtra={i=>{const n=data.likes[i.token+':'+i.id]||0;return n?<span className="cm-tile-likes"><Heart size={13}/>{n}</span>:null}}
     empty={<Panel className="empty"><h2>No public portfolios yet</h2><p>Make yours public from your portfolio page and it will show here.</p><Go href="/my-portfolio">Open my portfolio</Go></Panel>}/>}
 </>;
}
