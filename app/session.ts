import {env} from 'cloudflare:workers';

// Signed session cookie: base64url(JSON payload) + "." + base64url(HMAC-SHA256).
// The payload is readable but cannot be forged without SESSION_SECRET.

export const SESSION_COOKIE='fp_session';
export const OAUTH_COOKIE='fp_oauth';
export const SESSION_TTL=30*24*3600;

export type SessionUser={userId:string;email:string;fullName:string|null};
type Payload=SessionUser&{exp:number};

const enc=new TextEncoder();
function b64url(bytes:Uint8Array){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function fromB64url(value:string){const s=atob(value.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(s,c=>c.charCodeAt(0))}
export function randomToken(bytes=32){return b64url(crypto.getRandomValues(new Uint8Array(bytes)))}
export async function sha256(value:string){return b64url(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value))))}

function secret(){const s=env.SESSION_SECRET;if(!s||s.length<32)throw new Error('SESSION_SECRET must be set to at least 32 characters.');return s}
async function hmacKey(){return crypto.subtle.importKey('raw',enc.encode(secret()),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}

export async function sign(data:object){const body=b64url(enc.encode(JSON.stringify(data)));const mac=new Uint8Array(await crypto.subtle.sign('HMAC',await hmacKey(),enc.encode(body)));return body+'.'+b64url(mac)}
export async function verify<T>(token:string|undefined):Promise<T|null>{
  if(!token)return null;const [body,mac]=token.split('.');if(!body||!mac)return null;
  try{const ok=await crypto.subtle.verify('HMAC',await hmacKey(),fromB64url(mac),enc.encode(body));if(!ok)return null;const data=JSON.parse(new TextDecoder().decode(fromB64url(body)));if(typeof data.exp!=='number'||data.exp<Date.now()/1000)return null;return data as T}catch{return null}
}

export async function createSession(user:SessionUser){return sign({...user,exp:Math.floor(Date.now()/1000)+SESSION_TTL})}
export async function readSession(token:string|undefined):Promise<SessionUser|null>{const p=await verify<Payload>(token);return p?{userId:p.userId,email:p.email,fullName:p.fullName}:null}

export function readCookie(header:string|null,name:string){for(const part of (header||'').split(';')){const i=part.indexOf('=');if(i>0&&part.slice(0,i).trim()===name)return part.slice(i+1).trim()}return undefined}
// Secure everywhere except plain-http local dev, so a cookie can never be issued over http in production.
export function cookie(name:string,value:string,url:string,maxAge:number){const {hostname}=new URL(url);const secure=hostname==='127.0.0.1'||hostname==='localhost'?'':'; Secure';return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`}

export function safeReturnTo(value:string|null):string{
  if(!value||!value.startsWith('/')||value.startsWith('//'))return '/';
  try{const url=new URL(value,'https://app.local');if(url.origin!=='https://app.local'||url.pathname.startsWith('/auth/'))return '/';return url.pathname+url.search+url.hash}catch{return '/'}
}
