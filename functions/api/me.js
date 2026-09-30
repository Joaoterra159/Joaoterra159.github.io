import { getCookie } from '../_shared/cookies.js';
import { sha256Base64url } from '../_shared/crypto.js';
const headers={'Cache-Control':'no-store'};
export async function onRequestGet(context) {
  const raw=getCookie(context.request,'__Host-session'); if(!raw) return new Response('Unauthorized',{status:401,headers});
  const hash=await sha256Base64url(raw), now=Math.floor(Date.now()/1000);
  const row=await context.env.DB.prepare('SELECT issuer, subject, email, display_name FROM sessions WHERE id_hash = ? AND expires_at > ?').bind(hash,now).first();
  if(!row) return new Response('Unauthorized',{status:401,headers});
  return Response.json({issuer:row.issuer,subject:row.subject,email:row.email,displayName:row.display_name},{headers});
}
