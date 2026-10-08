import {assignmentRubric,scoreAttempt} from './learning-rules';
export const freeReviewKeys=Array.from({length:2},(_,w)=>Array.from({length:5},(_,i)=>'basic-w'+(w+1)+'-'+i)).flat();
export const freeReviewsPerModule=2;
export const reviewSchema={type:'object',additionalProperties:false,properties:{summary:{type:'string'},strength:{type:'string'},improvement:{type:'string'},nextStep:{type:'string'},evidenceLimit:{type:'string'},ratings:{type:'array',items:{type:['integer','null']},minItems:3,maxItems:3},reasons:{type:'array',items:{type:'string'},minItems:3,maxItems:3}},required:['summary','strength','improvement','nextStep','evidenceLimit','ratings','reasons']};
export function validateReview(value:any,key:string,profile?:any){
 if(!value||!Array.isArray(value.ratings)||value.ratings.length!==3||value.ratings.some((v:any)=>v!==null&&(!Number.isInteger(v)||v<0||v>4)))throw new Error('AI returned an incomplete review. Please retry; your allowance was not used.');
 for(const field of ['summary','strength','improvement','nextStep','evidenceLimit'])if(typeof value[field]!=='string'||!value[field].trim()||value[field].length>1600)throw new Error('AI returned an incomplete review. Please retry; your allowance was not used.');
 if(!Array.isArray(value.reasons)||value.reasons.length!==3||value.reasons.some((v:any)=>typeof v!=='string'||v.length<3||v.length>1000))throw new Error('AI returned an incomplete review. Please retry; your allowance was not used.');
 const scored=value.ratings.every((v:any)=>v!==null)?scoreAttempt(key,value.ratings,profile):null;
 return {...value,total:scored?.total??null,passed:scored?.passed??false,criteria:assignmentRubric(key,profile).map((c,i)=>({label:c.label,weight:c.weight,rating:value.ratings[i],feedback:value.reasons[i]}))};
}
