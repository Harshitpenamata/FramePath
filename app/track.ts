'use client';
// Browser side of the pilot tracker. Fire and forget: tracking never blocks or breaks the page.
const key='fp-anon';
export function anonId(){try{let v=localStorage.getItem(key);if(!v){v=crypto.randomUUID();localStorage.setItem(key,v)}return v}catch{return ''}}
export function track(name:string,props:Record<string,unknown>={},ref=''){
 try{const body=JSON.stringify({name,props,ref,anonId:anonId(),path:location.pathname});
  if(!navigator.sendBeacon?.('/api/events',new Blob([body],{type:'application/json'})))fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{})}catch{}
}
// Once signed in: links steps taken before sign-in to the account.
export function identify(){try{fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'identify',anonId:anonId()})}).catch(()=>{})}catch{}}
