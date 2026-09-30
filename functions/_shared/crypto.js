const encoder = new TextEncoder();
export function base64url(bytes) {
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function randomToken() { const b=new Uint8Array(32); crypto.getRandomValues(b); return base64url(b); }
export async function sha256Base64url(value) { return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))); }
export function decodeBase64url(value) {
  const b64=value.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-value.length%4)%4);
  const s=atob(b64); return Uint8Array.from(s,c=>c.charCodeAt(0));
}
export function decodeJsonPart(value) { return JSON.parse(new TextDecoder().decode(decodeBase64url(value))); }
