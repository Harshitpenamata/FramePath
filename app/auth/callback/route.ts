import {env} from 'cloudflare:workers';
import {OAUTH_COOKIE,SESSION_COOKIE,SESSION_TTL,cookie,createSession,readCookie,verify} from '../../session';
export const dynamic='force-dynamic';

type Flow={state:string;verifier:string;nonce:string;returnTo:string};

function failure(req:Request,message:string){
  const headers=new Headers({'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  headers.append('Set-Cookie',cookie(OAUTH_COOKIE,'',req.url,0));
  return new Response(`<!doctype html><meta name="viewport" content="width=device-width"><title>Sign-in failed</title><body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem"><h1>Sign-in didn't complete</h1><p>${message}</p><p><a href="/auth/google">Try again</a> · <a href="/">Home</a></p>`,{status:400,headers});
}

// Google redirects here with ?code&state. The ID token is fetched directly from
// Google's token endpoint over TLS, so its claims are trusted per OIDC Core 3.1.3.7;
// we still check issuer, audience, expiry, nonce and verified email.
export async function GET(req:Request){
  const url=new URL(req.url);
  if(url.searchParams.get('error'))return failure(req,'Google sign-in was cancelled.');
  const flow=await verify<Flow>(readCookie(req.headers.get('cookie'),OAUTH_COOKIE));
  const code=url.searchParams.get('code'),state=url.searchParams.get('state');
  if(!flow||!code||!state||state!==flow.state)return failure(req,'Your sign-in session expired. Please start again.');
  if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET)return failure(req,'Sign-in is not configured.');

  const res=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:url.origin+'/auth/callback',grant_type:'authorization_code',code_verifier:flow.verifier})});
  if(!res.ok)return failure(req,'Google could not confirm your sign-in. Please try again.');
  const {id_token}=await res.json() as {id_token?:string};
  let claims:{iss?:string;aud?:string;exp:number;nonce?:string;sub?:string;email?:string;email_verified?:boolean;name?:unknown};
  try{const part=id_token!.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');claims=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part),c=>c.charCodeAt(0))))}catch{return failure(req,'Google returned an unreadable response.')}
  const issOk=claims.iss==='https://accounts.google.com'||claims.iss==='accounts.google.com';
  if(!issOk||claims.aud!==env.GOOGLE_CLIENT_ID||claims.exp<Date.now()/1000||claims.nonce!==flow.nonce||!claims.sub)return failure(req,'Google sign-in could not be verified.');
  if(claims.email_verified!==true||!claims.email)return failure(req,'Your Google account needs a verified email address.');

  const session=await createSession({userId:'google:'+claims.sub,email:claims.email,fullName:typeof claims.name==='string'?claims.name.slice(0,100):null});
  const headers=new Headers({Location:new URL(flow.returnTo,url.origin).href,'Cache-Control':'no-store'});
  headers.append('Set-Cookie',cookie(SESSION_COOKIE,session,req.url,SESSION_TTL));
  headers.append('Set-Cookie',cookie(OAUTH_COOKIE,'',req.url,0));
  return new Response(null,{status:302,headers});
}
