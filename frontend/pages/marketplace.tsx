import useSWR from 'swr';
import { API, apiFetch } from '../src/lib/api';
import { getAccessToken } from '../src/lib/auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Marketplace() {
  const [token, setToken] = useState<string|null>(null);
  useEffect(()=>{ setToken(getAccessToken()); }, []);
  const { data, error } = useSWR(token ? [`${API.MARKET}/items`, token] : null, 
    ([url, t]) => apiFetch(url, { headers: { Authorization:`Bearer ${t}` } }));
  return (
    <div style={{padding:20}}>
      <h2>Marketplace</h2>
      <Link className="btn" href="/">Back</Link>
      <div className="row" style={{flexWrap:'wrap', marginTop:12}}>
        {error && <div style={{color:'red'}}>Error: {String(error)}</div>}
        {data?.items?.map((it:any)=>(
          <div key={it.id} className="card" style={{width:140, height:100}}>{it.name}</div>
        ))}
      </div>
    </div>
  );
}
