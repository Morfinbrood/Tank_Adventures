# ADR: Centralized Auth with JWT + JWKS

**Context**: Multiple independent microservices must enforce authentication uniformly, including WS.

**Options**
1) Session cookies + shared session store (Redis)
2) HMAC JWT with shared secret across services
3) **RSA JWT (RS256) + JWKS** (chosen)

**Decision**
Use RS256 JWTs issued by Auth service and expose public keys via `/.well-known/jwks.json`.
Services verify tokens using JWKS URL, with caching in clients (`@game/authz`). WS handshakes accept `?token=`
query or `Authorization: Bearer` header. Tokens are short-lived (default 15m). Refresh is pluggable.

**Consequences**
- No shared secret needed; simple key rotation (add new JWK `kid`, start issuing, remove old after TTL).
- Independent deploys; only dependency is network reachability to JWKS endpoint.
- For production: store private keys in Secrets Manager and enforce TLS end-to-end; add rate limits & audit logs.
