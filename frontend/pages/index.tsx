import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAccessToken } from '../src/lib/auth';

export default function Home() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!getAccessToken()); }, []);
  return (
    <div style={{padding:20}}>
      <h1>Tank Adventure</h1>
      {!authed ? (
        <div className="row">
          <Link href="/login" className="btn">Login</Link>
          <Link href="/register" className="btn">Register</Link>
        </div>
      ) : (
        <div className="row">
          <Link href="/lobby" className="btn">Lobby</Link>
          <Link href="/marketplace" className="btn">Marketplace</Link>
        </div>
      )}
    </div>
  );
}
