import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { cfg } from './config.js';
import { WebSocketServer, WebSocket } from 'ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log','error','warn'] });
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(cookieParser());
  app.enableCors({ origin: true, credentials: true });

  await app.listen(cfg.port);
  const server: any = app.getHttpServer();

  function pipeWs(client: WebSocket, upstream: WebSocket) {
    client.on('message', (data)=> upstream.readyState===1 && upstream.send(data));
    upstream.on('message', (data)=> client.readyState===1 && client.send(data));
    const close = (code?: number, reason?: string)=>{ try{client.close(code, reason);}catch{} try{upstream.close(code, reason);}catch{} };
    client.on('close', ()=> close(1000, 'client closed'));
    upstream.on('close', ()=> close(1000, 'upstream closed'));
    client.on('error', ()=> close(1011, 'client error'));
    upstream.on('error', ()=> close(1011, 'upstream error'));
  }

  const chatWss = new WebSocketServer({ noServer: true });
  const gameWss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req: any, socket: any, head: any) => {
    const url = req.url || '';
    if (url.startsWith('/api/chat/ws')) {
      chatWss.handleUpgrade(req, socket, head, (ws)=> chatWss.emit('connection', ws, req));
    } else if (url.startsWith('/api/game/ws')) {
      gameWss.handleUpgrade(req, socket, head, (ws)=> gameWss.emit('connection', ws, req));
    } else {
      // not handled here
    }
  });

  chatWss.on('connection', (client, req: any) => {
    try {
      const u = new URL(req.url || '', 'http://local');
      const qs = u.searchParams;
      const upstreamUrl = new URL(cfg.chatWsUpstream);
      upstreamUrl.searchParams.set('room', qs.get('room') || 'lobby:general');
      const token = qs.get('token') || '';
      upstreamUrl.searchParams.set('token', token);
      const upstream = new WebSocket(upstreamUrl.toString());
      upstream.once('open', ()=> pipeWs(client, upstream));
      upstream.once('error', ()=> client.close(1011, 'upstream error'));
    } catch {
      client.close(1011, 'bad request');
    }
  });

  gameWss.on('connection', (client, req: any) => {
    try {
      const u = new URL(req.url || '', 'http://local');
      const qs = u.searchParams;
      const upstreamUrl = new URL(cfg.gameWsUpstream);
      upstreamUrl.searchParams.set('matchId', qs.get('matchId') || 'm1');
      const token = qs.get('token') || '';
      upstreamUrl.searchParams.set('token', token);
      const upstream = new WebSocket(upstreamUrl.toString());
      upstream.once('open', ()=> pipeWs(client, upstream));
      upstream.once('error', ()=> client.close(1011, 'upstream error'));
    } catch {
      client.close(1011, 'bad request');
    }
  });

  console.log(`[gateway] listening on ${cfg.port} (HTTP + WS bridges at /api/chat/ws and /api/game/ws)`);
}
bootstrap();
