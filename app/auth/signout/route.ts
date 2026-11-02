import {SESSION_COOKIE,cookie,safeReturnTo,readSession,readCookie,endAllSessions} from '../../session';
export const dynamic='force-dynamic';

export async function GET(req:Request){
  const url=new URL(req.url);const returnTo=safeReturnTo(url.searchParams.get('return_to'));
  // ?everywhere=1 also ends this account's sessions on every other device.
  if(url.searchParams.get('everywhere')==='1'){const s=await readSession(readCookie(req.headers.get('cookie'),SESSION_COOKIE));if(s)await endAllSessions(s.userId).catch(()=>{})}
  // Local dev also clears the Sites dev sign-in cookie.
  const target=import.meta.env.DEV?'/signout-with-chatgpt?return_to='+encodeURIComponent(returnTo):returnTo;
  const headers=new Headers({Location:new URL(target,url.origin).href,'Cache-Control':'no-store'});
  headers.append('Set-Cookie',cookie(SESSION_COOKIE,'',req.url,0));
  return new Response(null,{status:302,headers});
}
