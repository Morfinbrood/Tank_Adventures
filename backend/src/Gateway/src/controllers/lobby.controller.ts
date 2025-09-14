import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { cfg } from '../config.js';
import { AuthGuard } from '../auth.guard.js';

async function f(url:string, init:any){ const r = await fetch(url, init); if(!r.ok) throw new Error(await r.text()); return r.json(); }
function authHeaders(h:any){ const a = h['authorization'] || h['Authorization']; return a ? {'Authorization': a } : {}; }

@Controller('api')
export class LobbyController {
  @UseGuards(AuthGuard)
  @Get('lobbies')
  list(@Headers() h:any){ return f(`${cfg.lobbyBase}/lobbies`, { headers: authHeaders(h) }); }

  @UseGuards(AuthGuard)
  @Get('lobbies/:id')
  get(@Param('id') id:string, @Headers() h:any){ return f(`${cfg.lobbyBase}/lobbies/${id}`, { headers: authHeaders(h) }); }

  @UseGuards(AuthGuard)
  @Post('lobbies')
  create(@Body() body:any, @Headers() h:any){ return f(`${cfg.lobbyBase}/lobbies`, { method:'POST', headers:{'Content-Type':'application/json', ...authHeaders(h)}, body: JSON.stringify(body) }); }

  @UseGuards(AuthGuard)
  @Post('lobbies/:id/join')
  join(@Param('id') id:string, @Headers() h:any){ return f(`${cfg.lobbyBase}/lobbies/${id}/join`, { method:'POST', headers: authHeaders(h) }); }

  @UseGuards(AuthGuard)
  @Post('lobbies/:id/ready')
  ready(@Param('id') id:string, @Headers() h:any){ return f(`${cfg.lobbyBase}/lobbies/${id}/ready`, { method:'POST', headers: authHeaders(h) }); }

  @UseGuards(AuthGuard)
  @Post('lobbies/:id/start')
  start(@Param('id') id:string, @Headers() h:any){ return f(`${cfg.lobbyBase}/lobbies/${id}/start`, { method:'POST', headers: authHeaders(h) }); }
}
