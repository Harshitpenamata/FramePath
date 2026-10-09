import {normalizeProfile} from '../../profile-validation';
import {buildPersonalPlan} from '../../personalization';
import {checkOrigin,errorResponse} from '../../service';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{checkOrigin(req);const text=await req.text();if(text.length>9000)throw new Error('Keep your learning goal under 500 characters.');const b=JSON.parse(text),profile=normalizeProfile(b.profile);return Response.json({plan:buildPersonalPlan(profile)},{headers:{'Cache-Control':'no-store'}})}catch(e){return errorResponse(e)}}
