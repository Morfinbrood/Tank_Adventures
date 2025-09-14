import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { API, apiFetch } from '../../src/lib/api';
import { getAccessToken } from '../../src/lib/auth';

export default function LobbyRoom() {
  const { query } = useRouter();
  const id = query.id as string | undefined;
  const [token, setToken] = useState<string|null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{ setToken(getAccessToken()); }, []);
  useEffect(()=>{
    if(!id || !token) return;
    apiFetch(`${API.LOBBY}/lobbies/${id}`, { headers:{ Authorization:`Bearer ${token}` }}).then((d)=>{
      setIsHost(d.isHost);
    }).catch(()=>{});
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_CHAT_WS_URL}/ws?room=lobby:${id}&token=${token}`);
    socket.onmessage = (ev)=>{
      const msg = JSON.parse(ev.data);
      if(msg.type==='history') setMessages(msg.messages);
      if(msg.type==='message') setMessages(m=>[...m, msg.message].slice(-10));
      if(msg.type==='ready_state') setAllReady(msg.allReady);
    };
    setWs(socket);
    return ()=>socket.close();
  }, [id, token]);

  async function ready() {
    if(!token || !id) return;
    await apiFetch(`${API.LOBBY}/lobbies/${id}/ready`, { method:'POST', headers:{ Authorization:`Bearer ${token}` }});
  }
  async function start() {
    if(!token || !id) return;
    const d = await apiFetch(`${API.LOBBY}/lobbies/${id}/start`, { method:'POST', headers:{ Authorization:`Bearer ${token}` }});
    window.location.href = `/game/${d.matchId}`;
  }
  function sendMessage() {
    if(ws && inputRef.current?.value){
      ws.send(JSON.stringify({ type:'message', text: inputRef.current.value }));
      inputRef.current.value='';
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Lobby #{id}</h2>
      <div className="row" style={{gap:12}}>
        <button className="btn" onClick={ready}>Ready</button>
        {isHost && <button className="btn" onClick={start} disabled={!allReady}>Start</button>}
      </div>
      <div className="card" style={{marginTop:12}}>
        <div><b>Chat</b></div>
        <div style={{height:180, overflow:'auto', border:'1px solid #eee', padding:8, margin:'8px 0'}}>
          {messages.map((m:any, i:number)=>(<div key={i}><b>{m.user?.name||'user'}:</b> {m.text}</div>))}
        </div>
        <div className="row">
          <input ref={inputRef} placeholder="message..." style={{flex:1}} />
          <button className="btn" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
