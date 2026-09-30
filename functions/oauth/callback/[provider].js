import { providers } from '../../_shared/providers.js';
import { getCookie, clearTxCookie, sessionCookie } from '../../_shared/cookies.js';
import { randomToken, sha256Base64url } from '../../_shared/crypto.js';
import { verifyGoogleIdToken } from '../../_shared/oidc.js';
const noStore={'Cache-Control':'no-store'};
function fail(msg,status=400){return new Response(msg,{status,headers:noStore});}
export async function onRequestGet(context) {
  const provider=context.params.provider,cfg=providers[provider]; if(!cfg) return fail('Not found',404);
  const u=new URL(context.request.url); if(u.searchParams.get('error')) return fail('Autenticação recusada');
  const code=u.searchParams.get('code'), state=u.searchParams.get('state'), tx=getCookie(context.request,'__Host-oauth-tx'); if(!code||!state||!tx) return fail('Retorno inválido');
  const txHash=await sha256Base64url(tx), now=Math.floor(Date.now()/1000);
  const row=await context.env.DB.prepare('SELECT provider,state_hash,nonce,code_verifier,expires_at FROM oauth_transactions WHERE id_hash=? AND expires_at>?').bind(txHash,now).first();
  if(!row||row.provider!==provider) return fail('Transação inválida');
  if(await sha256Base64url(state)!==row.state_hash) return fail('State inválido');
  await context.env.DB.prepare('DELETE FROM oauth_transactions WHERE id_hash=?').bind(txHash).run();
  const form=new URLSearchParams({client_id:context.env[cfg.clientId],client_secret:context.env[cfg.clientSecret],code,redirect_uri:`${context.env.PUBLIC_BASE_URL}/oauth/callback/${provider}`,code_verifier:row.code_verifier});
  if(provider==='google') form.set('grant_type','authorization_code');
  const tr=await fetch(cfg.token,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:form}); if(!tr.ok) return fail('Falha na troca do código');
  const tokens=await tr.json(); let issuer,subject,email=null,displayName=null;
  if(provider==='google'){
    if(!tokens.id_token) return fail('Identidade ausente');
    const p=await verifyGoogleIdToken(tokens.id_token,context.env.GOOGLE_CLIENT_ID,row.nonce); issuer=p.iss;subject=p.sub;email=p.email??null;displayName=p.name??null;
  } else {
    if(!tokens.access_token || String(tokens.token_type||'').toLowerCase()!=='bearer') return fail('Token GitHub inválido');
    const ghHeaders={Authorization:`Bearer ${tokens.access_token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','User-Agent':'oauth-pages-lab'};
    const ur=await fetch('https://api.github.com/user',{headers:ghHeaders}); if(!ur.ok) return fail('Perfil GitHub inválido'); const p=await ur.json(); if(!Number.isInteger(p.id)) return fail('ID GitHub inválido');
    issuer='https://github.com';subject=String(p.id);email=p.email??null;displayName=p.name??p.login??null;
    const basic=btoa(`${context.env.GITHUB_CLIENT_ID}:${context.env.GITHUB_CLIENT_SECRET}`);
    const rr=await fetch(`https://api.github.com/applications/${encodeURIComponent(context.env.GITHUB_CLIENT_ID)}/grant`,{method:'DELETE',headers:{Authorization:`Basic ${basic}`,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2026-03-10','User-Agent':'oauth-pages-lab'},body:JSON.stringify({access_token:tokens.access_token})});
    if(rr.status!==204) return fail('Não foi possível revogar autorização GitHub');
  }
  const session=randomToken(), hash=await sha256Base64url(session), expires=now+28800;
  await context.env.DB.prepare('INSERT INTO sessions (id_hash,issuer,subject,email,display_name,expires_at,created_at) VALUES (?,?,?,?,?,?,?)').bind(hash,issuer,subject,email,displayName,expires,now).run();
  const h=new Headers({Location:context.env.PUBLIC_BASE_URL,'Cache-Control':'no-store'}); h.append('Set-Cookie',clearTxCookie()); h.append('Set-Cookie',sessionCookie(session)); return new Response(null,{status:302,headers:h});
}
