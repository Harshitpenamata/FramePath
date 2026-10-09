export const navigation=[{href:'/workspace',label:'Journey'},{href:'/explore',label:'Explore'},{href:'/portfolio',label:'My work'}] as const;
const aliases:Record<string,string>={'/journey':'/workspace','/my-work':'/portfolio','/privacy':'/safety'};
export function canonicalRoute(route:string){return aliases[route]||route;}
