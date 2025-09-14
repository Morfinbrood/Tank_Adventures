import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { pool, migrate } from './db.js';
import { issueJwt, getJwks, initKeys } from './jwt.js';
import bcrypt from 'bcryptjs';
import { RegisterSchema, LoginSchema } from '../../packages/core-protocol/src/index.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

app.get('/health', (_req,res)=>res.json({ ok:true, service: process.env.SERVICE_NAME || 'auth' }));
app.get('/.well-known/jwks.json', (_req,res)=>res.json(getJwks()));

app.post('/auth/register', async (req, res) => {
  const parse = RegisterSchema.safeParse(req.body);
  if(!parse.success) return res.status(400).json({ error: parse.error.message });
  const { email, password, name } = parse.data;
  const hash = await bcrypt.hash(password, 10);
  await pool.query('insert into users(email,name,password_hash) values($1,$2,$3)', [email, name, hash]).catch((e)=>{
    if(String(e).includes('unique')) return res.status(409).json({ error: 'email exists' });
    throw e;
  });
  const q = await pool.query('select id from users where email=$1', [email]);
  const userId = q.rows[0].id;
  const accessToken = await issueJwt({ sub: userId, email }, Number(process.env.ACCESS_TTL_SEC || 900));
  res.json({ accessToken });
});

app.post('/auth/login', async (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if(!parse.success) return res.status(400).json({ error: parse.error.message });
  const { email, password } = parse.data;
  const q = await pool.query('select id,password_hash,name from users where email=$1', [email]);
  if(q.rowCount===0) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, q.rows[0].password_hash);
  if(!ok) return res.status(401).json({ error: 'invalid credentials' });
  const accessToken = await issueJwt({ sub: q.rows[0].id, email, name: q.rows[0].name }, Number(process.env.ACCESS_TTL_SEC || 900));
  res.json({ accessToken });
});

app.post('/auth/refresh', async (_req, res) => {
  return res.status(501).json({ error: 'not implemented in skeleton' });
});

app.post('/auth/logout', async (_req, res) => res.json({ ok:true }));

const port = Number(process.env.PORT || 4001);
const start = async () => {
  await migrate();
  await initKeys();
  app.listen(port, ()=> console.log(`[auth] listening on ${port}`));
};
start();
