import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';
import http from 'http';
import { migrate, pool } from './db.js';
import { tokenFromQueryOrHeader, verifyJwt } from '../../packages/authz/src/index.js';

const app = express();
app.use(express.json()); app.use(helmet()); app.use(morgan('dev'));
app.get('/health', (_req,res)=>res.json({ ok:true, service: process.env.SERVICE_NAME || 'chat' }));
app.get('/rooms/:room/last10', async (req,res)=>{
  const q = await pool.query('select user_name as "user", text, created_at from chat_messages where room=$1 order by created_at desc limit 10', [req.params.room]);
  res.json({ messages: q.rows.reverse() });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const conf = {
  jwksUrl: process.env.AUTH_JWKS_URL || 'http://auth:4001/.well-known/jwks.json',
  issuer: process.env.JWT_ISSUER || 'auth',
  audience: process.env.JWT_AUDIENCE || 'game',
};

wss.on('connection', async (socket, req) => {
  // auth
  try {
    const token = tokenFromQueryOrHeader(req.url || '', req.headers);
    if(!token) { socket.close(4001, 'no token'); return; }
    const payload = await verifyJwt(token, conf);
    // room
    const url = new URL(req.url || '', 'http://local');
    const room = url.searchParams.get('room') || 'lobby:general';
    // send last 10
    const last = await pool.query('select user_name, text, created_at from chat_messages where room=$1 order by created_at desc limit 10', [room]);
    socket.send(JSON.stringify({ type:'history', messages: last.rows.reverse().map(r=>({ user:{ name:r.user_name }, text:r.text })) }));
    // on message
    socket.on('message', async (raw)=>{
      try {
        const msg = JSON.parse(raw.toString());
        if(msg.type==='message' && typeof msg.text==='string'){
          await pool.query('insert into chat_messages(room,user_id,user_name,text) values($1,$2,$3,$4)',
            [room, payload.sub, (payload as any).name || 'user', msg.text]);
          const out = JSON.stringify({ type:'message', message:{ user:{ name:(payload as any).name || 'user' }, text: msg.text } });
          // broadcast to room (naive: all clients)
          wss.clients.forEach(c=>c.readyState===1 && c.send(out));
        }
      } catch {}
    });
  } catch {
    socket.close(4003, 'invalid token');
  }
});

const port = Number(process.env.PORT || 4004);
const start = async () => {
  await migrate();
  server.listen(port, ()=> console.log(`[chat] listening on ${port}`));
};
start();
