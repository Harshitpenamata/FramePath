// Signed in: the learner's own courses and work. Signed out: the course list on the home page instead.
export const navigation=[{href:'/workspace',label:'My courses'},{href:'/portfolio',label:'My work'},{href:'/community',label:'Community'}] as const;
export const publicNavigation=[{href:'/#crafts',label:'Courses'},{href:'/community',label:'Community'}] as const;
const aliases:Record<string,string>={'/journey':'/workspace','/explore':'/workspace','/my-courses':'/workspace','/my-work':'/portfolio'};
export function canonicalRoute(route:string){return aliases[route]||route;}
