#!/usr/bin/env bash
set -euo pipefail
echo "[local] Containers:"
docker ps --format "table {{.Names}}	{{.Status}}	{{.Ports}}"
echo ""
echo "[local] Health checks:"
  # Gateway агрегатор и прямые порты сервисов
curl -sS http://localhost:4100/api/health || true; echo
curl -sS http://localhost:4001/health || true; echo   # auth
curl -sS http://localhost:4002/health || true; echo   # lobby
curl -sS http://localhost:4003/health || true; echo   # marketplace
curl -sS http://localhost:4004/health || true; echo   # chat
curl -sS http://localhost:4005/health || true; echo   # game
curl -sS http://localhost:4010/health || true; echo   # dbsvc
