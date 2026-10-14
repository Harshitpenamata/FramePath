export const navigation=[{href:'/workspace',label:'My courses'},{href:'/portfolio',label:'My work'},{href:'/community',label:'Community'}] as const;
const aliases:Record<string,string>={'/journey':'/workspace','/explore':'/workspace','/my-courses':'/workspace','/my-work':'/portfolio','/privacy':'/safety'};
export function canonicalRoute(route:string){return aliases[route]||route;}
