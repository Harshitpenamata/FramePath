import {env} from 'cloudflare:workers';
import {identity,db,errorResponse} from '../../service';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await identity();const owners=String((env as any).FRAMEPATH_ADMIN_IDS||'').split(',').map(x=>x.trim()).filter(Boolean);if(!owners.includes(user.userId))throw Object.assign(Error('Goal review is limited to the configured site owner.'),{status:403});const rows=await db().prepare('SELECT id,words,case_id,confidence,clarification,status,created_at FROM goal_logs ORDER BY created_at DESC LIMIT 500').all();return Response.json({goals:rows.results},{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e)}}
