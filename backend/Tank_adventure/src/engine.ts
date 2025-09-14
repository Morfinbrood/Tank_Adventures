export type Player = { id: string; x: number; y: number; inputs: Set<string>; };
export type Match = { id: string; players: Map<string, Player>; };

export class Engine {
  matches = new Map<string, Match>();
  constructor(public tickMs=300){}
  ensureMatch(id: string) {
    let m = this.matches.get(id);
    if(!m){ m = { id, players: new Map() }; this.matches.set(id, m); }
    return m;
  }
  join(matchId: string, userId: string) {
    const m = this.ensureMatch(matchId);
    if(!m.players.has(userId)) m.players.set(userId, { id:userId, x: 50+Math.random()*200, y:50+Math.random()*200, inputs: new Set() });
  }
  leave(matchId: string, userId: string) {
    const m = this.ensureMatch(matchId);
    m.players.delete(userId);
  }
  input(matchId: string, userId: string, key: string, pressed: boolean) {
    const m = this.ensureMatch(matchId);
    const p = m.players.get(userId); if(!p) return;
    if(pressed) p.inputs.add(key); else p.inputs.delete(key);
  }
  stepAll() {
    for (const m of this.matches.values()) {
      for (const p of m.players.values()) {
        const speed = 5;
        if(p.inputs.has('ArrowUp')) p.y = Math.max(0, p.y - speed);
        if(p.inputs.has('ArrowDown')) p.y = Math.min(470, p.y + speed);
        if(p.inputs.has('ArrowLeft')) p.x = Math.max(0, p.x - speed);
        if(p.inputs.has('ArrowRight')) p.x = Math.min(630, p.x + speed);
      }
    }
  }
  snapshot(matchId: string){
    const m = this.ensureMatch(matchId);
    return { players: Array.from(m.players.values()).map(({id,x,y})=>({id,x,y})) };
  }
}
