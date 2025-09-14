import { Controller, Get, Headers, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth.guard.js';
import { cfg } from '../config.js';
import { DbClient } from '../../Db.bus/src/index.js';

function token(h:any){ const a = h['authorization'] || h['Authorization']; return a ? String(a).slice(7) : undefined; }

@Controller('api/db')
export class DbController {
  @UseGuards(AuthGuard)
  @Get('items')
  async items(@Headers() h:any){ const db = new DbClient({ baseUrl: cfg.dbBase, bearer: token(h) }); return db.listItems(); }

  @UseGuards(AuthGuard)
  @Get('users/:id')
  async user(@Param('id') id:string, @Headers() h:any){ const db = new DbClient({ baseUrl: cfg.dbBase, bearer: token(h) }); return db.getUser(id); }

  @UseGuards(AuthGuard)
  @Get('lobbies')
  async lobbies(@Headers() h:any){ const db = new DbClient({ baseUrl: cfg.dbBase, bearer: token(h) }); return db.listLobbies(); }

  @UseGuards(AuthGuard)
  @Get('chat/rooms/:room/last10')
  async last10(@Param('room') room:string, @Headers() h:any){ const db = new DbClient({ baseUrl: cfg.dbBase, bearer: token(h) }); return db.chatLast10(room); }
}
