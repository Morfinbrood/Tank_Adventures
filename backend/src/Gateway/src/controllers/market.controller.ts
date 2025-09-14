import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { cfg } from '../config.js';
import { AuthGuard } from '../auth.guard.js';
async function f(url:string, init:any){ const r = await fetch(url, init); if(!r.ok) throw new Error(await r.text()); return r.json(); }
function authHeaders(h:any){ const a = h['authorization'] || h['Authorization']; return a ? {'Authorization': a } : {}; }

@Controller('api')
export class MarketController {
  @UseGuards(AuthGuard)
  @Get('items')
  items(@Headers() h:any){ return f(`${cfg.marketBase}/items`, { headers: authHeaders(h) }); }
}
