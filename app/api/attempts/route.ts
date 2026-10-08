import {identity,db,errorResponse} from '../../service';
import {moduleInfo} from '../../learning-rules';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const u=await identity();const key=new URL(req.url).searchParams.get('key');if(key)moduleInfo(key);const rows=key?await db().prepare('SELECT data FROM reflection_attempts WHERE user_id=? AND module_key=? ORDER BY created_at DESC').bind(u.userId,key).all():await db().prepare('SELECT data FROM reflection_attempts WHERE user_id=? ORDER BY created_at DESC').bind(u.userId).all();return Response.json(rows.results.map((r:any)=>JSON.parse(r.data)),{headers:{'Cache-Control':'no-store'}})}catch(e){return errorResponse(e)}}
