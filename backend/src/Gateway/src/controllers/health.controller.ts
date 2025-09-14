import { Controller, Get } from '@nestjs/common';
import { cfg } from '../config.js';

async function ping(url: string){
  try{ const r = await fetch(url); return r.ok; } catch { return false; }
}
@Controller('api')
export class HealthController {
  @Get('health')
  async health(){
    const services = {
      auth: await ping(`${cfg.authBase}/health`),
      lobby: await ping(`${cfg.lobbyBase}/health`),
      market: await ping(`${cfg.marketBase}/health`),
      chat: await ping(`${cfg.chatWsUpstream.replace('/ws','')}/health`),
      game: await ping(`${cfg.gameWsUpstream.replace('/ws','')}/health`),
      db: await ping(`${cfg.dbBase}/health`),
    };
    return { ok: true, gateway: true, services };
  }
}
