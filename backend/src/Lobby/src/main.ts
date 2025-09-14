import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { pool, migrate } from './db.js';
import { bearerFromHeaders, verifyJwt } from '../../packages/authz/src/index.js';
import { LobbyCreateSchema } from '../../packages/core-protocol/src/index.js';

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

const conf = {
  jwksUrl: process.env.AUTH_JWKS_URL || 'http://auth:4001/.well-known/jwks.json',
  issuer: process.env.JWT_ISSUER || 'auth',
  audience: process.env.JWT_AUDIENCE || 'game',
};

async function requireAuth(req:any, res:any, next:any){
  try{
    const token = bearerFromHeaders(req.headers);
    if(!token) return res.status(401).json({ error:'no token' });
    const payload = await verifyJwt(token, conf);
    (req as any).user = { id: payload.sub, name: (payload as any).name, email: (payload as any).email };
    next();
  } catch(e){ res.status(401).json({ error:'invalid token' }); }
}

app.get('/health', (_req,res)=>res.json({ ok:true, service: process.env.SERVICE_NAME || 'lobby' }));

app.get('/lobbies', requireAuth, async (_req,res)=>{
  const q = await pool.query(`
    select l.id, l.name, count(lp.user_id)::int as "playersCount"
    from lobbies l left join lobby_players lp on lp.lobby_id=l.id
    where l.started=false
    group by l.id order by l.created_at desc limit 50
  `);
  res.json({ lobbies: q.rows });
});

app.get('/lobbies/:id', requireAuth, async (req,res)=>{
  const id = req.params.id;
  const q = await pool.query('select id, name, host_user_id from lobbies where id=$1', [id]);
  if(q.rowCount===0) return res.status(404).json({ error:'not found' });
  const isHost = q.rows[0].host_user_id === req.user.id;
  res.json({ lobby: q.rows[0], isHost });
});

app.post('/lobbies', requireAuth, async (req,res)=>{
  const parse = LobbyCreateSchema.safeParse(req.body);
  if(!parse.success) return res.status(400).json({ error: parse.error.message });
  const { name } = parse.data;
  const q = await pool.query('insert into lobbies(name, host_user_id) values($1,$2) returning id', [name, req.user.id]);
  const id = q.rows[0].id;
  await pool.query('insert into lobby_players(lobby_id, user_id, ready) values($1,$2,false)', [id, req.user.id]);
  res.status(201).json({ id });
});

app.post('/lobbies/:id/join', requireAuth, async (req,res)=>{
  const id = req.params.id;
  await pool.query('insert into lobby_players(lobby_id, user_id, ready) values($1,$2,false) on conflict do nothing', [id, req.user.id]);
  res.json({ ok:true });
});

app.post('/lobbies/:id/ready', requireAuth, async (req,res)=>{
  const id = req.params.id;
  await pool.query('update lobby_players set ready=true where lobby_id=$1 and user_id=$2', [id, req.user.id]);
  // compute allReady
  const all = await pool.query('select bool_and(ready) as all_ready from lobby_players where lobby_id=$1', [id]);
  res.json({ ok:true, allReady: all.rows[0].all_ready });
});

app.post('/lobbies/:id/start', requireAuth, async (req,res)=>{
  const id = req.params.id;
  const q = await pool.query('select host_user_id from lobbies where id=$1', [id]);
  if(q.rowCount===0) return res.status(404).json({ error:'not found' });
  if(q.rows[0].host_user_id !== req.user.id) return res.status(403).json({ error:'host only' });
  const all = await pool.query('select bool_and(ready) as all_ready from lobby_players where lobby_id=$1', [id]);
  if(!all.rows[0].all_ready) return res.status(400).json({ error:'not all ready' });
  await pool.query('update lobbies set started=true where id=$1', [id]);
  // create match id (just reuse lobby id for simplicity)
  res.json({ matchId: id });
});

const port = Number(process.env.PORT || 4002);
const start = async () => {
  await migrate();
  app.listen(port, ()=> console.log(`[lobby] listening on ${port}`));
};
start();
