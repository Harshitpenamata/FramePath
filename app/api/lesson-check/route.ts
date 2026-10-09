import {lessonQuestions,scoreKnowledge} from '../../lessons/review-rules';
import {checkOrigin,safeText,errorResponse} from '../../service';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const key=safeText(new URL(req.url).searchParams.get('key'),80,1);return Response.json({questions:lessonQuestions(key).map(({answer,explanation,...q})=>q)},{headers:{'Cache-Control':'public, max-age=300'}})}catch(e){return errorResponse(e)}}
export async function POST(req:Request){try{checkOrigin(req);const raw=await req.text();if(raw.length>1000)throw Error('The lesson check is too long.');const b=JSON.parse(raw);return Response.json(scoreKnowledge(safeText(b.key,80,1),b.answers),{headers:{'Cache-Control':'no-store'}})}catch(e){return errorResponse(e)}}
