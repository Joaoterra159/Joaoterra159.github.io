import { decodeBase64url, decodeJsonPart } from './crypto.js';
export async function verifyGoogleIdToken(idToken, clientId, nonce) {
  const parts=idToken.split('.'); if(parts.length!==3) throw new Error('id_token inválido');
  const header=decodeJsonPart(parts[0]), payload=decodeJsonPart(parts[1]);
  if(header.alg!=='RS256' || !header.kid) throw new Error('alg/kid inválido');
  const discovery=await fetch('https://accounts.google.com/.well-known/openid-configuration',{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():Promise.reject(new Error('discovery')));
  if(payload.iss!==discovery.issuer) throw new Error('issuer inválido');
  const jwks=await fetch(discovery.jwks_uri,{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():Promise.reject(new Error('jwks')));
  const jwk=jwks.keys.find(k=>k.kid===header.kid && k.kty==='RSA'); if(!jwk) throw new Error('chave não encontrada');
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const data=new TextEncoder().encode(parts[0]+'.'+parts[1]);
  const ok=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decodeBase64url(parts[2]),data); if(!ok) throw new Error('assinatura inválida');
  const now=Math.floor(Date.now()/1000), aud=payload.aud;
  if(!(aud===clientId || (Array.isArray(aud)&&aud.includes(clientId)))) throw new Error('audience inválida');
  if(typeof payload.exp!=='number'||payload.exp<=now) throw new Error('token expirado');
  if(typeof payload.iat!=='number'||payload.iat>now+300) throw new Error('iat inválido');
  if(payload.nonce!==nonce || !payload.sub) throw new Error('nonce/sub inválido');
  return payload;
}
