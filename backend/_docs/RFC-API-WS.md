# RFC: REST & WS Contracts (v1.0.0)

## REST
- `POST /auth/register { email, password, name } -> { accessToken }`
- `POST /auth/login { email, password } -> { accessToken }`
- `GET /lobbies -> { lobbies: [{ id, name, playersCount }] }` (auth)
- `POST /lobbies { name } -> { id }` (auth)
- `GET /lobbies/:id -> { lobby, isHost }` (auth)
- `POST /lobbies/:id/join -> { ok }` (auth)
- `POST /lobbies/:id/ready -> { ok, allReady }` (auth)
- `POST /lobbies/:id/start -> { matchId }` (auth, host only)
- `GET /items -> { items:[{id,name}] }` (auth)

## WS
- Chat: `ws /chat/ws?room=lobby:{id}&token=...`
  - Client -> Server: `{ type:'message', text }`
  - Server -> Client:
    - `{ type:'history', messages:[{ user:{name}, text }] }` (on join, last 10)
    - `{ type:'message', message:{ user:{name}, text } }`
- Game: `ws /game/ws?matchId={lobbyId}&token=...`
  - Client -> Server: `{ type:'input', key: 'ArrowUp'|'ArrowDown'|'ArrowLeft'|'ArrowRight', pressed: boolean }`
  - Server -> Client: `{ type:'state', state: { players:[{ id,x,y }] } }` (every 300ms)
