import {unsubscribeUser} from '../../../email';
export const dynamic='force-dynamic';

// Stop reminder emails. GET shows a confirm button (mail scanners open links, so opening one changes nothing);
// POST turns reminders off, from that button or a mail app's one-click unsubscribe (List-Unsubscribe-Post).
const page=(title:string,body:string)=>new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · Framepath</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0b;color:#f2eee4;font-family:Inter,Segoe UI,Arial,sans-serif;padding:24px}main{max-width:440px}h1{font-size:28px;margin:0 0 12px}p{line-height:1.5;color:#a7a399}button,a.b{display:inline-block;margin-top:16px;padding:14px 24px;border:0;border-radius:999px;background:#d6e86b;color:#0b0b0b;font:inherit;font-weight:700;text-decoration:none;cursor:pointer}</style></head>
<body><main>${body}</main></body></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
const esc=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

export async function GET(req:Request){
 const t=new URL(req.url).searchParams.get('t')||'';
 return page('Stop reminder emails',`<h1>Stop reminder emails?</h1><p>We’ll stop the “you’re behind” reminders. Replies to your help requests will still reach you.</p>
<form method="post"><input type="hidden" name="t" value="${esc(t)}"><button type="submit">Stop reminders</button></form>`);
}
export async function POST(req:Request){
 let t=new URL(req.url).searchParams.get('t');
 if(!t){try{t=String((await req.formData()).get('t')||'')}catch{}}
 const ok=await unsubscribeUser(t).catch(()=>false);
 return ok?page('Reminders stopped','<h1>Reminders stopped</h1><p>You won’t get reminder emails any more. Your plan is still here when you want it.</p><a class="b" href="/workspace">Open my plan</a>')
  :page('Link not valid','<h1>This link didn’t work</h1><p>It may be out of date. Sign in and report a problem from Help, and we’ll turn reminders off for you.</p><a class="b" href="/help">Help</a>');
}
