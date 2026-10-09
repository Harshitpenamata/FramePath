export const diagnosticVersion='visual-9-v1';
export const skillIds=['composition','exposure','focus','lighting','sound','editing','colour','delivery','planning'] as const;
export type Skill=typeof skillIds[number];
export const skillNames:Record<Skill,string>={composition:'Composition',exposure:'Exposure',focus:'Focus',lighting:'Lighting',sound:'Sound',editing:'Editing',colour:'Colour',delivery:'Delivery',planning:'Planning'};
export type DiagnosticAnswer=number|string|null;
export const answerRanges:[[number,number],[number,number],[number,number],[number,number],[number,number],null,[number,number],null,[number,number]]=[[0,2],[-2,2],[1,5],[0,3],[-30,0],null,[2800,8000],null,[0,3]];
export function validAnswer(i:number,a:unknown){if(a===null)return true;if(i===5)return typeof a==='string'&&['012','021','102','120','201','210'].includes(a);if(i===7)return ['1080x1920','1920x1080','1080x1080'].includes(a as string);const range=answerRanges[i];return !!range&&typeof a==='number'&&Number.isFinite(a)&&a>=range[0]&&a<=range[1]&&([0,3,8].includes(i)?Number.isInteger(a):true)}
export function diagnosticPoints(i:number,a:DiagnosticAnswer){if(a===null||!validAnswer(i,a))return 0;switch(i){case 0:return a===0?4:a===1?2:0;case 1:return Math.abs(Number(a)+1)<=.3?4:Math.abs(Number(a)+1)<=.8?2:0;case 2:return Math.abs(Number(a)-2)<=.25?4:Math.abs(Number(a)-2)<=.6?2:0;case 3:return a===1?4:a===2?2:0;case 4:return Number(a)>=-18&&Number(a)<=-9?4:Number(a)<-3?2:0;case 5:return a==='012'?4:a==='102'||a==='021'?2:0;case 6:return Math.abs(Number(a)-5600)<=400?4:Math.abs(Number(a)-5600)<=1000?2:0;case 7:return a==='1080x1920'?4:a==='1080x1080'?1:0;case 8:return a===2?4:a===1?2:0;default:return 0}}
export function diagnosticResult(answers:DiagnosticAnswer[],answered=9){const completed=Math.min(9,Math.max(0,answered));const scores=Object.fromEntries(skillIds.map((s,i)=>[s,i<completed?diagnosticPoints(i,answers[i]??null)*25:null])) as Record<Skill,number|null>;const total=Math.round(skillIds.slice(0,completed).reduce((n,s)=>n+(scores[s]||0),0)/Math.max(1,completed));const level=total>=80?'advanced':total>=50?'intermediate':'beginner';return {scores,total,level,completed,provisional:completed<9} as const}
export const diagnosticFeedback=[
 'A wider view keeps the hands, tool and working space connected. A close detail can follow after that context.',
 'Reducing exposure by about one stop protects this bright reference. In a real scene, inspect the important highlights rather than relying on this number.',
 'The subject is 2 metres away. Place the focus plane there; focusing on the background leaves the subject soft.',
 'A large side window gives direction and a soft transition. Backlight alone would need another way to keep the face readable.',
 'Peaks around −18 to −9 dBFS leave headroom for louder words. A safe meter does not by itself guarantee clear sound.',
 'For this brief: show the place, show the action, then show the result. Other orders can work when the story calls for them.',
 'Match the 5600 K source to make the neutral reference look neutral in this simplified model. Mixed sources need separate judgement.',
 'A vertical 9:16 delivery uses 1080 × 1920 pixels. Check captions and platform overlays on the actual export.',
 'Protect consent, the essential action and clean sound first. Extra angles can follow once the film’s core is secure.'
];
