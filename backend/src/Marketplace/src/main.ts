import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { bearerFromHeaders, verifyJwt } from '@game/authz';
import { listItems } from './db.js';

const app = express();
app.use(morgan('dev'));
app.use(express.json());

const PORT = Number(process.env.PORT || 4003);
const JWKS_URL = process.env.AUTH_JWKS_URL || 'http://auth:4001/.well-known/jwks.json';
const ISSUER = process.env.JWT_ISSUER || 'http://auth:4001';
const AUDIENCE = process.env.JWT_AUDIENCE || 'tank-adventure';

function authGuard(req: Request, res: Response, next: () => void) {
  const token = bearerFromHeaders(req.headers as Record<string, string>);
  if (!token) return res.status(401).json({ error: 'no_token' });
  verifyJwt(token, { jwksUrl: JWKS_URL, issuer: ISSUER, audience: AUDIENCE })
    .then(() => next())
    .catch(() => res.status(401).json({ error: 'invalid_token' }));
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: process.env.SERVICE_NAME || 'marketplace', port: PORT });
});

app.get('/items', authGuard, async (_req: Request, res: Response) => {
  try {
    const items = await listItems();
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: 'db_error' });
  }
});

app.listen(PORT, () => {
  console.log(`[marketplace] listening on ${PORT}`);
});
