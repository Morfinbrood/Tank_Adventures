import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { getAccessToken } from '../../src/lib/auth';

type State = { players: { id: string; x:number; y:number; }[] };

export default function Game() {
  const { query } = useRouter();
  const matchId = query.matchId as string | undefined;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [token, setToken] = useState<string|null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [state, setState] = useState<State>({ players: [] });

  useEffect(()=>{ setToken(getAccessToken()); }, []);

  useEffect(()=>{
    if(!matchId || !token) return;
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_GAME_WS_URL}/ws?matchId=${matchId}&token=${token}`);
    socket.onmessage = (ev)=>{
      const msg = JSON.parse(ev.data);
      if(msg.type==='state') setState(msg.state);
    };
    setWs(socket);
    return ()=>socket.close();
  }, [matchId, token]);

  useEffect(()=>{
    const c = canvasRef.current;
    if(!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0,0,c.width,c.height);
    for(const p of state.players){
      ctx.fillRect(p.x, p.y, 10, 10);
    }
  }, [state]);

  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if(!ws) return;
      if(e.key==='F12' || e.key==='Escape'){ ws.close(); window.location.href='/'; return; }
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
        ws.send(JSON.stringify({ type:'input', key: e.key, pressed: e.type==='keydown' }));
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return ()=>{ window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); };
  }, [ws]);

  return (
    <div style={{padding:20}}>
      <h2>Match #{matchId}</h2>
      <canvas ref={canvasRef} width={640} height={480} style={{border:'1px solid #ccc'}}/>
      <div style={{marginTop:8}}>Controls: Arrow keys. Exit: F12 or Esc.</div>
    </div>
  );
}
