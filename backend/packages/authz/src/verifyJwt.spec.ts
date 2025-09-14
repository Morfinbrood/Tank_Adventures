import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SignJWT, generateKeyPair, exportJWK } from 'jose';
import { verifyJwt } from './index.js';

test('verifyJwt works', async () => {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = await exportJWK(publicKey);
  // simulate JWKS endpoint
  const jwks = { keys: [ { ...jwk, kid: 'k1', alg:'RS256', use:'sig' } ] };

  // tiny http server to serve JWKS
  const server = await new Promise<any>((resolve)=>{
    const http = require('http');
    const s = http.createServer((req:any,res:any)=>{
      res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(jwks));
    }).listen(0, ()=>resolve(s));
  });
  const port = server.address().port;
  const token = await new SignJWT({ sub:'u1' }).setProtectedHeader({ alg:'RS256', kid:'k1' })
    .setIssuer('iss').setAudience('aud').setExpirationTime('5m').sign(privateKey);
  const payload = await verifyJwt(token, { jwksUrl:`http://127.0.0.1:${port}/.well-known/jwks.json`, issuer:'iss', audience:'aud' });
  assert.equal(payload.sub, 'u1');
  server.close();
});
