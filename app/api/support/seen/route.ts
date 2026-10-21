import {db,identity,checkOrigin,errorResponse} from '../../../service';
export const dynamic='force-dynamic';
// The learner has seen support's replies (My account → Help requests): clears the reply alert.
export async function POST(req:Request){try{
 checkOrigin(req);const u:any=await identity();
 await db().prepare("UPDATE support_tickets SET learner_seen_at=? WHERE user_id=? AND reply<>''").bind(Date.now(),u.userId).run();
 return new Response(null,{status:204});
}catch(e){return errorResponse(e)}}
