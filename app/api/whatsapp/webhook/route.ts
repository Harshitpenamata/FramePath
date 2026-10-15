import {env} from 'cloudflare:workers';
import {db,readState,saveState} from '../../../service';
export const dynamic='force-dynamic';
const setting=(k:string)=>String((env as any)[k]||process.env[k]||'');
// Meta checks the webhook once with a GET (hub.verify_token must match WHATSAPP_VERIFY_TOKEN).
export async function GET(req:Request){
 const q=new URL(req.url).searchParams;
 if(q.get('hub.mode')==='subscribe'&&setting('WHATSAPP_VERIFY_TOKEN')&&q.get('hub.verify_token')===setting('WHATSAPP_VERIFY_TOKEN'))return new Response(q.get('hub.challenge')||'',{status:200});
 return new Response('Forbidden',{status:403});
}
// Every POST is signed by Meta: X-Hub-Signature-256 = sha256=HMAC(app secret, raw body).
async function signed(raw:string,header:string|null){
 const secret=setting('WHATSAPP_APP_SECRET');if(!secret||!header?.startsWith('sha256='))return false;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const mac=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(raw)));
 const hex=[...mac].map(b=>b.toString(16).padStart(2,'0')).join(''),got=header.slice(7);
 if(got.length!==hex.length)return false;let diff=0;for(let i=0;i<hex.length;i++)diff|=hex.charCodeAt(i)^got.charCodeAt(i);return diff===0;
}
const stopWords=/^\s*(stop|unsubscribe|stop all|cancel)\s*$/i;
export async function POST(req:Request){
 const raw=await req.text();
 if(!(await signed(raw,req.headers.get('x-hub-signature-256'))))return new Response('Bad signature',{status:401});
 try{
  const body:any=JSON.parse(raw);
  for(const entry of body.entry||[])for(const change of entry.changes||[]){
   const v=change.value||{};
   for(const st of v.statuses||[])await db().prepare("UPDATE wa_messages SET status=?,error=?,updated_at=? WHERE wa_id=? AND status NOT IN ('read')").bind(st.status,st.errors?.[0]?.title||null,Date.now(),st.id).run();
   for(const m of v.messages||[]){
    if(m.type!=='text'||!stopWords.test(m.text?.body||''))continue;
    const phone='+'+String(m.from||'').replace(/\D/g,'');
    const rows:any[]=(await db().prepare("SELECT user_id FROM learners WHERE json_extract(data,'$.whatsapp.phone')=?").bind(phone).all()).results||[];
    for(const r of rows)for(let tries=0;tries<3;tries++){const {state,revision}=await readState(r.user_id);if(!state.whatsapp)break;state.whatsapp.optIn=false;state.whatsapp.stoppedAt=new Date().toISOString();try{await saveState(r.user_id,state,revision);break}catch{}}
   }
  }
 }catch(e){console.error('WhatsApp webhook failed',String(e).slice(0,200))}
 return new Response('ok');
}
