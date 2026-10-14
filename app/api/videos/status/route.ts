import {deadVideoIds} from '../../../video-health';
export const dynamic='force-dynamic';
// Lesson videos the health check found removed, private or not embeddable. Lesson pages hide them.
export async function GET(){try{return Response.json({dead:await deadVideoIds()},{headers:{'Cache-Control':'public, max-age=600'}})}catch{return Response.json({dead:[]})}}
