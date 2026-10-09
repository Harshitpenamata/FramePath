'use client';
import React,{useState} from 'react';
import registry from '../../media/foundation-registry.json';
export function MediaImage({id,priority=false,style}:{id:string;priority?:boolean;style?:React.CSSProperties}){
 const [failed,setFailed]=useState(false);const asset=registry.assets.find(a=>a.id===id);
 if(!asset||asset.kind!=='image')return <p role="alert">This visual is not available yet.</p>;
 if(failed)return <div className="media-unavailable" role="status"><p>The image could not load.</p><p>{asset.alt}</p><button onClick={()=>setFailed(false)}>Retry image</button></div>;
 return <img data-media-id={id} data-media-slot={asset.ownerSlot} src={asset.canonicalUrl} srcSet={asset.renditions.map(r=>`${r.src} ${r.width}w`).join(', ')} sizes="(max-width:760px) calc(100vw - 44px), 850px" width={1536} height={1024} alt={asset.alt} loading={priority?'eager':'lazy'} decoding="async" fetchPriority={priority?'high':'auto'} style={style} onError={()=>setFailed(true)}/>;
}
