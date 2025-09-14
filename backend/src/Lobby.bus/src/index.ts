import { DbClient } from '../Db.bus/src/index.js';
export class LobbyBus {
  constructor(private db: DbClient){}
  listOpenLobbies(){ return this.db.listLobbies(); }
}
