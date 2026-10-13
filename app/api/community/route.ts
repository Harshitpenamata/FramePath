import {db,fail,checkOrigin,identity,readState,safeText,errorResponse} from '../../service';
import {getUser} from '../../user';
import {askClaude,AIRefused} from '../../claude';
export const dynamic='force-dynamic';
const noStore={headers:{'Cache-Control':'no-store'}};
const commentsPerDay=30;

// Community: the gallery of public portfolios, and likes and comments on pieces in any shared (public or unlisted) portfolio.
async function sharedPortfolio(token:unknown){if(typeof token!=='string'||token.length>64)throw new Error('This portfolio is unavailable.');const p:any=await db().prepare('SELECT token,user_id,data FROM portfolios WHERE token=?').bind(token).first();if(!p)throw Object.assign(new Error('This portfolio is private or unavailable.'),{status:404});return {...p,data:JSON.parse(p.data)}}
function hasPiece(p:any,pieceId:unknown){return typeof pieceId==='string'&&p.data.items.some((i:any)=>i.id===pieceId)}
const placeholders=(n:number)=>Array(n).fill('?').join(',');

// Claude checks every comment before anyone else sees it.
async function screenComment(body:string){
 let text:string;
 try{text=await askClaude({effort:'low',maxTokens:2000,timeoutMs:20000,
  system:'You screen comments on practice videography work posted by adult learners on a learning site. Allow comments that are kind, neutral, or give honest, specific critique, even blunt critique of the work. Block: insults or mockery aimed at the person, harassment, hate, sexual content, threats, spam or ads, links to other sites, personal contact details, and anything unrelated to the work. Reply with a short reason the commenter can read.',
  content:[{type:'text',text:'Comment:\n'+body}],
  schema:{type:'object',additionalProperties:false,properties:{allowed:{type:'boolean'},reason:{type:'string'}},required:['allowed','reason']}})}
 catch(e){if(e instanceof AIRefused)return {allowed:false,reason:'This comment can’t be posted.'};throw Object.assign(new Error('Comments can’t be checked right now, so they can’t be posted. Please try again later.'),{status:503})}
 const r=JSON.parse(text) as {allowed:boolean;reason:string};return {allowed:r.allowed===true,reason:String(r.reason||'').slice(0,300)};
}

export async function GET(req:Request){try{
 const user=await getUser(),token=new URL(req.url).searchParams.get('token');
 if(!token){
  // The gallery: the latest public portfolios and each piece's likes.
  const rows:any[]=(await db().prepare("SELECT token,data,updated_at FROM portfolios WHERE visibility='public' ORDER BY updated_at DESC LIMIT 60").all()).results||[];
  const tokens=rows.map(r=>r.token);
  const likes:any[]=tokens.length?(await db().prepare('SELECT token,piece_id,COUNT(*) AS n FROM portfolio_likes WHERE token IN ('+placeholders(tokens.length)+') GROUP BY token,piece_id').bind(...tokens).all()).results||[]:[];
  const mine:any[]=user&&tokens.length?(await db().prepare('SELECT token,piece_id FROM portfolio_likes WHERE user_id=? AND token IN ('+placeholders(tokens.length)+')').bind(user.userId,...tokens).all()).results||[]:[];
  const portfolios=rows.map(r=>{const d=JSON.parse(r.data);return {token:r.token,name:d.name,title:d.title,updatedAt:r.updated_at,items:d.items.filter((i:any)=>i.id)}});
  return Response.json({portfolios,likes:Object.fromEntries(likes.map(l=>[l.token+':'+l.piece_id,l.n])),liked:mine.map(l=>l.token+':'+l.piece_id),signedIn:!!user},noStore);
 }
 // One portfolio's likes and comments.
 const p=await sharedPortfolio(token),owner=!!user&&user.userId===p.user_id;
 const likes:any[]=(await db().prepare('SELECT piece_id,COUNT(*) AS n FROM portfolio_likes WHERE token=? GROUP BY piece_id').bind(token).all()).results||[];
 const mine:any[]=user?(await db().prepare('SELECT piece_id FROM portfolio_likes WHERE token=? AND user_id=?').bind(token,user.userId).all()).results||[]:[];
 const comments:any[]=(await db().prepare("SELECT id,piece_id,user_id,author,body,created_at FROM portfolio_comments WHERE token=? AND status='visible' ORDER BY created_at ASC LIMIT 500").bind(token).all()).results||[];
 const byPiece:Record<string,any[]>={};for(const c of comments)(byPiece[c.piece_id]||=[]).push({id:c.id,author:c.author,body:c.body,createdAt:c.created_at,mine:!!user&&c.user_id===user.userId,canDelete:!!user&&(c.user_id===user.userId||owner)});
 return Response.json({likes:Object.fromEntries(likes.map(l=>[l.piece_id,l.n])),liked:mine.map(l=>l.piece_id),comments:byPiece,signedIn:!!user,owner},noStore);
}catch(e){return errorResponse(e)}}

export async function POST(req:Request){try{
 checkOrigin(req);const user=await identity();const b:any=await req.json();
 if(b.action==='like'){
  const p=await sharedPortfolio(b.token);if(!hasPiece(p,b.pieceId))return fail('This piece is no longer shared.',404);
  if(b.on)await db().prepare('INSERT OR IGNORE INTO portfolio_likes(token,piece_id,user_id,created_at) VALUES(?,?,?,?)').bind(p.token,b.pieceId,user.userId,Date.now()).run();
  else await db().prepare('DELETE FROM portfolio_likes WHERE token=? AND piece_id=? AND user_id=?').bind(p.token,b.pieceId,user.userId).run();
  const row:any=await db().prepare('SELECT COUNT(*) AS n FROM portfolio_likes WHERE token=? AND piece_id=?').bind(p.token,b.pieceId).first();
  return Response.json({likes:row.n,liked:!!b.on},noStore);
 }
 if(b.action==='comment'){
  const p=await sharedPortfolio(b.token);if(!hasPiece(p,b.pieceId))return fail('This piece is no longer shared.',404);
  const body=safeText(b.body,600,2);
  const today:any=await db().prepare('SELECT COUNT(*) AS n FROM portfolio_comments WHERE user_id=? AND created_at>?').bind(user.userId,Date.now()-86400000).first();
  if(today.n>=commentsPerDay)return fail('You’ve posted '+commentsPerDay+' comments today. You can post more tomorrow.',429);
  const check=await screenComment(body);if(!check.allowed)return fail('This comment wasn’t posted: '+(check.reason||'it doesn’t follow the community rules.'),422);
  const {state}=await readState(user.userId);const author=String(state.profile?.name||user.displayName.split(' ')[0]||'Learner').slice(0,60);
  const id=crypto.randomUUID(),now=Date.now();
  await db().prepare("INSERT INTO portfolio_comments(id,token,piece_id,user_id,author,body,status,created_at) VALUES(?,?,?,?,?,?,'visible',?)").bind(id,p.token,b.pieceId,user.userId,author,body,now).run();
  return Response.json({comment:{id,author,body,createdAt:now,mine:true,canDelete:true}},noStore);
 }
 if(b.action==='report'||b.action==='delete'){
  if(typeof b.commentId!=='string')return fail('This comment is unavailable.');
  const c:any=await db().prepare("SELECT c.id,c.user_id,p.user_id AS owner FROM portfolio_comments c JOIN portfolios p ON p.token=c.token WHERE c.id=? AND c.status='visible'").bind(b.commentId).first();
  if(!c)return fail('This comment is unavailable.',404);
  if(b.action==='delete'){if(c.user_id!==user.userId&&c.owner!==user.userId)return fail('Only the comment’s author or the portfolio’s owner can delete it.',403);await db().prepare("UPDATE portfolio_comments SET status='removed' WHERE id=?").bind(c.id).run();return Response.json({ok:true},noStore)}
  // A report hides the comment straight away until someone reviews it.
  const reason=safeText(b.reason||'Reported',300);
  await db().batch([db().prepare('INSERT OR IGNORE INTO comment_reports(id,comment_id,user_id,reason,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),c.id,user.userId,reason,Date.now()),db().prepare("UPDATE portfolio_comments SET status='reported' WHERE id=?").bind(c.id)]);
  return Response.json({ok:true},noStore);
 }
 return fail('This action is not available.');
}catch(e){return errorResponse(e)}}
