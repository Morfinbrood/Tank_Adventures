import { useState } from 'react';
import { API, apiFetch } from '../src/lib/api';
import { setAccessToken } from '../src/lib/auth';
import { useRouter } from 'next/router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string|undefined>();
  const router = useRouter();
  async function onSubmit(e: any) {
    e.preventDefault();
    setError(undefined);
    try {
      const res = await apiFetch(`${API.AUTH}/auth/register`, { method:'POST', body: JSON.stringify({ email, password, name }) });
      setAccessToken(res.accessToken);
      router.push('/');
    } catch (e:any) { setError(e.message); }
  }
  return (
    <div style={{padding:20}}>
      <h2>Register</h2>
      <form onSubmit={onSubmit} className="col" style={{maxWidth:360}}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div style={{color:'red'}}>{error}</div>}
        <button className="btn" type="submit">Create account</button>
      </form>
    </div>
  );
}
