import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { WebSocketServer } from 'ws';
import { Engine } from './engine.js';
import { verifyJwt, tokenFromQueryOrHeader } from '../packages/authz/src/index.js';

const app = express();
app.use(express.json()); app.use(helmet()); app.use(morgan('dev'));
app.get('/health', (_req,res)=>res.json({ ok:true, service: process.env.SERVICE_NAME || 'tank_adventure' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const engine = new Engine(Number(process.env.TICK_MS || 300));

const conf = {
  jwksUrl: process.env.AUTH_JWKS_URL || 'http://auth:4001/.well-known/jwks.json',
  issuer: process.env.JWT_ISSUER || 'auth',
  audience: process.env.JWT_AUDIENCE || 'game',
};

wss.on('connection', async (socket, req) => {
  const url = new URL(req.url || '', 'http://local');
  const matchId = url.searchParams.get('matchId') || 'm1';
  try {
    const token = tokenFromQueryOrHeader(req.url || '', req.headers);
    if(!token){ socket.close(4001,'no token'); return; }
    const payload = await verifyJwt(token, conf);
    const userId = String(payload.sub);
    engine.join(matchId, userId);
    socket.on('message', (raw)=>{
      try {
        const msg = JSON.parse(raw.toString());
        if(msg.type==='input' && typeof msg.key==='string' && typeof msg.pressed==='boolean'){
          engine.input(matchId, userId, msg.key, msg.pressed);
        }
      } catch {}
    });
    socket.on('close', ()=> engine.leave(matchId, userId));
  } catch {
    socket.close(4003, 'invalid token');
  }
});

setInterval(()=>{
  try{
    engine.stepAll();
    // naive broadcast of all states
    for (const s of wss.clients) {
      if(s.readyState===1){
        s.send(JSON.stringify({ type:'state', state: engine.snapshot('m1') }));
      }
    }
  } catch {}
}, Number(process.env.TICK_MS || 300));

const port = Number(process.env.PORT || 4005);
server.listen(port, ()=> console.log(`[tank_adventure] listening on ${port}`));
