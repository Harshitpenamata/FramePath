/** Offline publication rules. A different crop or URL query is not a new asset. */
export function canonical(url) { return String(url || '').split(/[?#]/)[0].toLowerCase(); }
export function distance(a,b) { let bits=BigInt('0x'+a)^BigInt('0x'+b),n=0;while(bits){n++;bits&=bits-1n;}return n; }
export function validateMedia({assets=[],slots=[],videos=[]}) {
 const errors=[],warnings=[];
 const duplicate=(items,key,code)=>{const groups=new Map();for(const item of items){const value=key(item);if(!value)continue;const group=groups.get(value)||[];group.push(item);groups.set(value,group);}for(const [value,items] of groups)if(items.length>1)errors.push({code,value,items:items.map(x=>x.id||x.slot)});};
 duplicate(assets,x=>x.id,'duplicate-id');duplicate(assets,x=>x.sha256,'duplicate-hash');duplicate(assets,x=>canonical(x.canonicalUrl),'duplicate-url');duplicate(slots,x=>x.id,'duplicate-slot');
 // Different source metadata must not hide identical final image bytes or a
 // reused non-canonical rendition. Width variants belong to the same owner.
 const renditionHashes=new Map(),renditionUrls=new Map();
 for(const a of assets)for(const r of [{sha256:a.sha256,src:a.canonicalUrl},...(a.renditions||[])]){
  for(const [map,value,code] of [[renditionHashes,r.sha256,'duplicate-rendition-hash'],[renditionUrls,canonical(r.src),'duplicate-rendition-url']]){
   if(!value)continue;const previous=map.get(value);if(previous&&previous!==a.id)errors.push({code,value,items:[previous,a.id]});else map.set(value,a.id);
  }
 }
 const ids=new Map(assets.map(x=>[x.id,x]));
 for(const a of assets){for(const key of ['id','kind','sha256','source','licence','credit','alt','ownerSlot'])if(!a[key])errors.push({code:'missing-'+key,id:a.id});if(a.status!=='reviewed')errors.push({code:'asset-needs-review',id:a.id});}
 for(const slot of slots){const asset=ids.get(slot.assetId);if(!asset)errors.push({code:'unregistered-asset',slot:slot.id,assetId:slot.assetId});else if(asset.ownerSlot!==slot.id)errors.push({code:'asset-used-outside-owned-slot',id:asset.id,slot:slot.id,owner:asset.ownerSlot});}
 duplicate(slots,x=>x.assetId,'repeated-placement');
 for(let i=0;i<assets.length;i++)for(let j=i+1;j<assets.length;j++){const a=assets[i],b=assets[j];if(a.dhash&&b.dhash&&a.dhash.length===b.dhash.length){const d=distance(a.dhash,b.dhash);if(d<=5)warnings.push({code:'near-duplicate-review',ids:[a.id,b.id],distance:d});}}
 const byVideo=new Map();duplicate(videos,x=>x.slot,'duplicate-video-slot');for(const v of videos){const key=v.provider+':'+v.videoId;const group=byVideo.get(key)||[];group.push(v);byVideo.set(key,group);if(!v.caption)errors.push({code:'missing-video-caption',slot:v.slot});}
 for(const [id,uses] of byVideo){if(uses.length<2)continue;const original=uses.filter(v=>!v.revisitOf);let valid=original.length===1;
  for(const v of uses){if(!Number.isFinite(v.start)||!Number.isFinite(v.end)||v.start<0||v.end<=v.start)valid=false;if(v.revisitOf&&v.revisitOf!==original[0]?.slot)valid=false;}
  for(let i=0;i<uses.length;i++)for(let j=i+1;j<uses.length;j++){if(uses[i].caption===uses[j].caption||!(uses[i].end<=uses[j].start||uses[j].end<=uses[i].start))valid=false;}
  if(!valid)errors.push({code:'repeated-video-without-valid-revisit',id,slots:uses.map(v=>v.slot)});
 }
 return {passed:errors.length===0,assets:assets.length,slots:slots.length,videos:videos.length,errors,warnings};
}
