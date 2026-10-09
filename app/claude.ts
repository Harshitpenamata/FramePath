import Anthropic from '@anthropic-ai/sdk';
import {env} from 'cloudflare:workers';

// Single entry point for Claude calls (questions, assignment reviews, image screening).
export const claudeModel='claude-opus-5-5';
type Effort='low'|'medium'|'high';
type Content=Anthropic.Beta.BetaContentBlockParam[];
export type ClaudeImage={mediaType:'image/jpeg'|'image/png'|'image/webp';base64:string};

export class AIUnavailable extends Error{status=503}
export class AIRefused extends Error{status=422}

export function claudeKey(){return env.ANTHROPIC_API_KEY||process.env.ANTHROPIC_API_KEY||''}
export const imageBlock=(img:ClaudeImage):Anthropic.Beta.BetaImageBlockParam=>({type:'image',source:{type:'base64',media_type:img.mediaType,data:img.base64}});

// Sends one request with Anthropic's default refusal fallback and returns the text output.
export async function askClaude({system,content,maxTokens=8000,effort='low',schema,timeoutMs=45000}:{system:string;content:Content;maxTokens?:number;effort?:Effort;schema?:Record<string,unknown>;timeoutMs?:number}):Promise<string>{
 const apiKey=claudeKey();if(!apiKey)throw new AIUnavailable('AI is not configured on this site yet.');
 const client=new Anthropic({apiKey,maxRetries:1,timeout:timeoutMs});
 let response:Anthropic.Beta.BetaMessage;
 try{
  response=await client.beta.messages.create({model:claudeModel,max_tokens:maxTokens,betas:['server-side-fallback-2026-07-01'],fallbacks:'default',system,output_config:{effort,...(schema?{format:{type:'json_schema',schema}}:{})},messages:[{role:'user',content}]});
 }catch(error){
  if(error instanceof Anthropic.AuthenticationError||error instanceof Anthropic.PermissionDeniedError)throw new AIUnavailable('AI is not set up correctly on this site.');
  if(error instanceof Anthropic.RateLimitError)throw new AIUnavailable('AI is busy right now.');
  if(error instanceof Anthropic.APIError)throw new AIUnavailable('AI is not available right now.');
  throw new AIUnavailable('AI could not connect.');
 }
 if(response.stop_reason==='refusal')throw new AIRefused('AI declined this request.');
 if(response.stop_reason==='max_tokens')throw new AIUnavailable('AI’s answer was cut short. Please try again.');
 return response.content.flatMap(b=>b.type==='text'?[b.text]:[]).join('').trim();
}

// Claude vision check used before storing a learner's practice image.
export async function screenImageWithClaude(img:ClaudeImage){
 const text=await askClaude({effort:'low',maxTokens:4000,timeoutMs:30000,
  system:'You screen images uploaded to a videography learning site for adults. Decide whether the image is safe to store as harmless practice work. Unsafe: nudity or sexual content, graphic violence or gore, self-harm, hate symbols, an identifiable child as the main subject, visible personal documents or IDs, medical records, or evidence from real legal cases. Ordinary people, places, products, food, pets and scenery are safe.',
  content:[imageBlock(img),{type:'text',text:'Classify this image.'}],
  schema:{type:'object',additionalProperties:false,properties:{safe:{type:'boolean'},reason:{type:'string'}},required:['safe','reason']}});
 const result=JSON.parse(text) as {safe:boolean;reason:string};
 if(typeof result.safe!=='boolean')throw new AIUnavailable('Image screening returned an incomplete answer.');
 return result;
}
