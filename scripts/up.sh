#!/usr/bin/env bash
set -euo pipefail
echo "[local] Building and starting services..."
docker compose build
docker compose up -d
echo "[local] Waiting a few seconds for containers..."
sleep 5
./scripts/status.sh || true
