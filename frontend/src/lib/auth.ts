export function getAccessToken(): string | null {
  try { return localStorage.getItem('access_token'); } catch { return null; }
}
export function setAccessToken(t: string) {
  try { localStorage.setItem('access_token', t); } catch {}
}
export function clearAccessToken() { try { localStorage.removeItem('access_token'); } catch {} }
