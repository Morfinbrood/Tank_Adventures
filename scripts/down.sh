#!/usr/bin/env bash
set -euo pipefail
echo "[local] Stopping services..."
docker compose down -v
