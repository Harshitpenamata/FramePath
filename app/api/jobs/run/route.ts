import {runScheduled} from '../../../jobs';
export const dynamic='force-dynamic';
// Only the worker's own cron trigger can run this: it sets a one-time token in memory (build/sites-worker.ts) and
// calls this route internally. Requests from outside never carry that token.
export async function POST(req:Request){
 const token=(globalThis as any).__framepathCronToken;
 // Local development only: tests can run the job with x-framepath-cron: dev.
 const dev=process.env.NODE_ENV==='development'&&req.headers.get('x-framepath-cron')==='dev';
 if(!dev&&(!token||req.headers.get('x-framepath-cron')!==token))return new Response('Not found',{status:404});
 (globalThis as any).__framepathCronToken=null;
 try{return Response.json(await runScheduled())}catch(e:any){console.error('Scheduled job failed',String(e?.message||e).slice(0,300));return Response.json({error:'failed'},{status:500})}
}
