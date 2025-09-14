import { DbClient } from '../Db.bus/src/index.js';
export class MarketBus {
  constructor(private db: DbClient){}
  listItems(){ return this.db.listItems(); }
}
