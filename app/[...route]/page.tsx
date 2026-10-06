import Framepath from '../framepath';export default async function Page({params}:{params:Promise<{route:string[]}>}){const {route}=await params;return <Framepath initialRoute={'/'+route.join('/')}/>}
