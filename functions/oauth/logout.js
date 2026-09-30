import { getCookie, clearSessionCookie } from '../_shared/cookies.js';
import { sha256Base64url } from '../_shared/crypto.js';
export async function onRequestPost(context) {
  const headers=new Headers({'Cache-Control':'no-store'});
  if(context.request.headers.get('Origin')!==context.env.PUBLIC_BASE_URL) return new Response('Forbidden',{status:403,headers});
  const raw=getCookie(context.request,'__Host-session'); if(raw) await context.env.DB.prepare('DELETE FROM sessions WHERE id_hash=?').bind(await sha256Base64url(raw)).run();
  headers.append('Set-Cookie',clearSessionCookie()); headers.set('Location',context.env.PUBLIC_BASE_URL); return new Response(null,{status:303,headers});
}
