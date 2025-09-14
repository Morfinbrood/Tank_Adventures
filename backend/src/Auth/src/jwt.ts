import { generateKeyPair, exportJWK, importPKCS8, SignJWT, JWTPayload } from 'jose';

let privateKey: any;
let publicJwk: any;

export async function initKeys() {
  const pem = process.env.AUTH_PRIVATE_KEY_PEM;
  if (pem && pem.trim().length>0) {
    privateKey = await importPKCS8(pem, 'RS256');
  } else {
    const kp = await generateKeyPair('RS256');
    privateKey = kp.privateKey;
    publicJwk = await exportJWK(kp.publicKey);
    (publicJwk as any).kid = 'local';
    (publicJwk as any).alg = 'RS256';
    (publicJwk as any).use = 'sig';
  }
}

export async function issueJwt(payload: JWTPayload, ttlSec: number, kid='local') {
  if(!privateKey) await initKeys();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuer(process.env.JWT_ISSUER || 'auth')
    .setAudience(process.env.JWT_AUDIENCE || 'game')
    .setIssuedAt()
    .setExpirationTime(`${ttlSec}s`)
    .sign(privateKey);
}

export function getJwks() {
  if(!publicJwk) return { keys: [] };
  return { keys: [ publicJwk ] };
}
