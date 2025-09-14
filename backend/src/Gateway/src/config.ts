export const cfg = {
  port: Number(process.env.PORT || 4100),
  authBase: process.env.AUTH_BASE_URL || 'http://auth:4001',
  lobbyBase: process.env.LOBBY_BASE_URL || 'http://lobby:4002',
  marketBase: process.env.MARKET_BASE_URL || 'http://marketplace:4003',
  chatWsUpstream: process.env.CHAT_WS_UPSTREAM || 'ws://chat:4004/ws',
  gameWsUpstream: process.env.GAME_WS_UPSTREAM || 'ws://game:4005/ws',
  dbBase: process.env.DB_BASE_URL || 'http://dbsvc:4010',
  jwksUrl: process.env.AUTH_JWKS_URL || 'http://auth:4001/.well-known/jwks.json',
  issuer: process.env.JWT_ISSUER || 'auth',
  audience: process.env.JWT_AUDIENCE || 'game',
};
