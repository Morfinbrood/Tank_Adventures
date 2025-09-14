import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DbService } from './db.service.js';
import { AuthGuard } from './auth.guard.js';

@Controller('db')
export class DbController {
  constructor(private readonly db: DbService) {}

  @Get('health')
  async health(){ return { ok: true, service: process.env.SERVICE_NAME || 'db' }; }

  @UseGuards(AuthGuard)
  @Get('users/:id')
  async user(@Param('id') id: string){
    const q = await this.db.pool.query('select id, email, name, created_at from users where id=$1', [id]);
    return q.rows[0] || null;
  }

  @UseGuards(AuthGuard)
  @Get('items')
  async items(){
    const q = await this.db.pool.query('select id, name, created_at from items order by created_at asc');
    return { items: q.rows };
  }

  @UseGuards(AuthGuard)
  @Get('lobbies')
  async lobbies(){
    const q = await this.db.pool.query(`
      select l.id, l.name, count(lp.user_id)::int as "playersCount"
      from lobbies l left join lobby_players lp on lp.lobby_id=l.id
      where l.started=false
      group by l.id order by l.created_at desc limit 50
    `);
    return { lobbies: q.rows };
  }

  @UseGuards(AuthGuard)
  @Get('chat/rooms/:room/last10')
  async chatLast10(@Param('room') room: string){
    const q = await this.db.pool.query('select user_name as "user", text, created_at from chat_messages where room=$1 order by created_at desc limit 10', [room]);
    return { messages: q.rows.reverse() };
  }
}
