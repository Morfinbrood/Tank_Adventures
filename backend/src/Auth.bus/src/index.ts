import { DbClient } from '../Db.bus/src/index.js';
export class AuthBus {
  constructor(private db: DbClient){}
  // reserved for user profile aggregations via DB
  getUser(id: string){ return this.db.getUser(id); }
}
