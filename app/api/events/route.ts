import {db,checkOrigin,fail,errorResponse} from '../../service';
import {getUser} from '../../user';
import {logEvent,today} from '../../events';
import {browserSteps} from '../../events-shared';
export const dynamic='force-dynamic';

// Steps recorded from the browser (see events-shared). Works before sign-in with an anonymous id kept in the
// browser; 'identify' links that id's earlier steps to the account once the learner signs in.
export async function POST(req:Request){try{
 checkOrigin(req);const b:any=await req.json();const u:any=await getUser().catch(()=>null);
 const anon=typeof b.anonId==='string'&&/^[a-z0-9-]{8,40}$/.test(b.anonId)?b.anonId:null;
 if(b.name==='identify'){if(u&&anon)await db().prepare('UPDATE events SET user_id=? WHERE anon_id=? AND user_id IS NULL').bind(u.userId,anon).run();return new Response(null,{status:204})}
 if(!browserSteps.includes(b.name))return fail('Unknown step.');
 if(!u&&!anon)return fail('Missing id.');
 const who=u?.userId||anon,ref=typeof b.ref==='string'?b.ref.slice(0,80):'';
 // Count each step once per person per day (and per review for review_opened).
 const dedupe=`${b.name}:${who}:${b.name==='review_opened'?ref:today()}`;
 const props=b.props&&typeof b.props==='object'?b.props:{};
 await logEvent(u?.userId||null,b.name,{...props,...(ref?{ref}:{})},{anonId:anon,path:typeof b.path==='string'?b.path:'',dedupe});
 return new Response(null,{status:204});
}catch(e){return errorResponse(e)}}
