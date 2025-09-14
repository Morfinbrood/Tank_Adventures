import type { IncomingHttpHeaders } from 'http';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

export type VerifyOptions = { jwksUrl: string; issuer: string; audience: string; };

export function bearerFromHeaders(headers: IncomingHttpHeaders): string | null {
  const h = headers['authorization'] || headers['Authorization'];
  if (!h) return null;
  const s = Array.isArray(h) ? h[0] : h;
  if (!s.toLowerCase().startsWith('bearer ')) return null;
  return s.slice(7).trim();
}

export function tokenFromQueryOrHeader(url: string, headers: IncomingHttpHeaders): string | null {
  try {
    const u = new URL(url, 'http://local'); // base needed
    const q = u.searchParams.get('token');
    if (q) return q;
  } catch {}
  return bearerFromHeaders(headers);
}

export async function verifyJwt(token: string, opts: VerifyOptions): Promise<JWTPayload> {
  const JWKS = createRemoteJWKSet(new URL(opts.jwksUrl), { cacheMaxAge: 60_000 });
  const { payload } = await jwtVerify(token, JWKS, { issuer: opts.issuer, audience: opts.audience });
  return payload;
}
