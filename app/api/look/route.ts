import {db,identity,checkOrigin,fail,errorResponse} from '../../service';
import {isAdmin} from '../admin/health/route';
import {setFlag} from '../../ai-budget';
export const dynamic='force-dynamic';

// Site look: whether photos show in colour or black and white. Anyone can read it; only admins can change it.
export async function GET(){try{
 const r:any=await db().prepare("SELECT value FROM app_flags WHERE key='photos'").first();
 return Response.json({photos:r?.value==='colour'?'colour':'bw'},{headers:{'Cache-Control':'public, max-age=60'}});
}catch(e){return errorResponse(e)}}
export async function POST(req:Request){try{
 checkOrigin(req);const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const b:any=await req.json();if(!['colour','bw'].includes(b.photos))return fail('Choose colour or black and white.');
 await setFlag('photos',b.photos);
 return Response.json({photos:b.photos},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
