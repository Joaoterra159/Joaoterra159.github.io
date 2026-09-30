import { randomToken, sha256Base64url } from '../../_shared/crypto.js';
import { txCookie } from '../../_shared/cookies.js';
import { providers } from '../../_shared/providers.js';
export async function onRequestGet(context) {
  const provider=context.params.provider, cfg=providers[provider]; if(!cfg) return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
  const tx=randomToken(), state=randomToken(), verifier=randomToken(), nonce=provider==='google'?randomToken():null;
  const txHash=await sha256Base64url(tx), stateHash=await sha256Base64url(state), challenge=await sha256Base64url(verifier), exp=Math.floor(Date.now()/1000)+600;
  await context.env.DB.prepare('INSERT INTO oauth_transactions (id_hash, provider, state_hash, nonce, code_verifier, expires_at) VALUES (?, ?, ?, ?, ?, ?)').bind(txHash,provider,stateHash,nonce,verifier,exp).run();
  const redirect=`${context.env.PUBLIC_BASE_URL}/oauth/callback/${provider}`;
  const p=new URLSearchParams({client_id:context.env[cfg.clientId],redirect_uri:redirect,response_type:'code',state,code_challenge:challenge,code_challenge_method:'S256'});
  if(provider==='google'){p.set('scope','openid email profile');p.set('nonce',nonce);}
  return new Response(null,{status:302,headers:{Location:`${cfg.auth}?${p}`,'Set-Cookie':txCookie(tx),'Cache-Control':'no-store'}});
}
