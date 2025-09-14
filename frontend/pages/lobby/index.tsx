import useSWR from 'swr';
import Link from 'next/link';
import { API, apiFetch } from '../../src/lib/api';
import { getAccessToken } from '../../src/lib/auth';
import { useEffect, useState } from 'react';

export default function LobbyList() {
  const [token, setToken] = useState<string|null>(null);
  useEffect(()=>{ setToken(getAccessToken()); }, []);
  const { data, error, mutate } = useSWR(token ? [`${API.LOBBY}/lobbies`, token] : null, 
    ([url, t]) => apiFetch(url, { headers: { Authorization: `Bearer ${t}` } }));

  async function create() {
    if(!token) return;
    const lobby = await apiFetch(`${API.LOBBY}/lobbies`, { method:'POST', headers:{ Authorization:`Bearer ${token}` }, body: JSON.stringify({ name: 'My Lobby' }) });
    window.location.href = `/lobby/${lobby.id}`;
  }

  return (
    <div style={{padding:20}}>
      <h2>Lobby</h2>
      <button className="btn" onClick={create}>Create</button>
      <div className="col" style={{marginTop:12}}>
        {error && <div style={{color:'red'}}>Error: {String(error)}</div>}
        {data?.lobbies?.map((l:any)=> (
          <div key={l.id} className="card row" style={{justifyContent:'space-between'}}>
            <div>#{l.id} — {l.name} — players: {l.playersCount}</div>
            <Link className="btn" href={`/lobby/${l.id}`}>Join</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
