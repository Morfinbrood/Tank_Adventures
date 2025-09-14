const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4100/api';
const httpToWs = (u: string) => u.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');

export const API = {
  // все REST эндпойнты идут через общий Gateway
  AUTH: API_BASE,
  LOBBY: API_BASE,
  MARKET: API_BASE,
  // WS адреса по умолчанию считаем из того же base
  CHAT_WS: process.env.NEXT_PUBLIC_CHAT_WS_URL || `${httpToWs(API_BASE)}/chat`,
  GAME_WS: process.env.NEXT_PUBLIC_GAME_WS_URL || `${httpToWs(API_BASE)}/game`,
};

export async function apiFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
