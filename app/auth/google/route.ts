import {env} from 'cloudflare:workers';
import {OAUTH_COOKIE,cookie,randomToken,safeReturnTo,sha256,sign} from '../../session';
export const dynamic='force-dynamic';

// Starts Google sign-in (OpenID Connect authorization code flow with PKCE).
export async function GET(req:Request){
  const url=new URL(req.url);const returnTo=safeReturnTo(url.searchParams.get('return_to'));
  if(!env.GOOGLE_CLIENT_ID){
    // Local dev without Google credentials: fall back to the Sites dev sign-in.
    if(import.meta.env.DEV)return Response.redirect(new URL('/signin-with-chatgpt?return_to='+encodeURIComponent(returnTo),url).href,302);
    return new Response('Sign-in is not configured.',{status:503});
  }
  const state=randomToken(),verifier=randomToken(48),nonce=randomToken();
  const exp=Math.floor(Date.now()/1000)+600;
  const flow=await sign({state,verifier,nonce,returnTo,exp});
  const auth=new URL('https://accounts.google.com/o/oauth2/v2/auth');
  auth.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:url.origin+'/auth/callback',response_type:'code',scope:'openid email profile',state,nonce,code_challenge:await sha256(verifier),code_challenge_method:'S256',prompt:'select_account'}).toString();
  return new Response(null,{status:302,headers:{Location:auth.href,'Set-Cookie':cookie(OAUTH_COOKIE,flow,req.url,600),'Cache-Control':'no-store'}});
}
