import {identity,fail,errorResponse,checkOrigin} from '../../../service';
import {isAdmin} from '../health/route';
import {sendEmail,emailLive} from '../../../email';
import {runErrorDigest} from '../../../errors';
import {siteUrl} from '../../../whatsapp';
export const dynamic='force-dynamic';

// Admin-only email checks, so delivery can be tested at any time:
//   {kind:'test', to?:'someone@outlook.com'}  sends a plain test email (default: to the signed-in admin)
//   {kind:'errors'}                           sends the server-error summary now instead of waiting for 9am
export async function POST(req:Request){try{
 checkOrigin(req);
 const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const b:any=await req.json().catch(()=>({}));
 if(!emailLive())return fail('Email is not configured here (RESEND_API_KEY is missing). Nothing was sent.',503);
 if(b.kind==='errors')return Response.json(await runErrorDigest(new Date(),true));
 const to=String(b.to||u.email).trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)||to.length>200)return fail('Enter a valid email address.');
 const status=await sendEmail({to,kind:'test',dedupe:`test:${Date.now()}:${to}`,subject:'Framepath test email',
  heading:'This is a test email',lines:['If you can read this in your inbox (not spam), email from Framepath is reaching this address.',`Sent ${new Date().toUTCString()} by ${u.email}.`],
  button:{label:'Open Framepath',href:siteUrl()}});
 return Response.json({to,status},{status:status==='sent'?200:502});
}catch(e){return errorResponse(e)}}
