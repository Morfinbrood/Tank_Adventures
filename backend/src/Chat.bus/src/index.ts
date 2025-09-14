import { DbClient } from '../Db.bus/src/index.js';
export class ChatBus {
  constructor(private db: DbClient){}
  last10(room: string){ return this.db.chatLast10(room); }
}
