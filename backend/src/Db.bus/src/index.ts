export type ClientOpts = { baseUrl: string; bearer?: string };
async function j<T>(res: Response): Promise<T> { if(!res.ok) throw new Error(await res.text()); return res.json() as any; }
export class DbClient {
  constructor(private opts: ClientOpts){}
  private h(){ return { 'Content-Type':'application/json', ...(this.opts.bearer? { Authorization:`Bearer ${this.opts.bearer}` } : {}) }; }
  async getUser(id: string){ return j(fetch(`${this.opts.baseUrl}/db/users/${id}`, { headers:this.h() })); }
  async listItems(){ return j(fetch(`${this.opts.baseUrl}/db/items`, { headers:this.h() })); }
  async listLobbies(){ return j(fetch(`${this.opts.baseUrl}/db/lobbies`, { headers:this.h() })); }
  async chatLast10(room: string){ return j(fetch(`${this.opts.baseUrl}/db/chat/rooms/${encodeURIComponent(room)}/last10`, { headers:this.h() })); }
}
