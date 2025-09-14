#!/usr/bin/env bash
set -euo pipefail
echo "[aws] Destroying services (CDK) ..."
for svc in backend/src/Auth backend/src/Lobby backend/src/Marketplace backend/src/Chat backend/Tank_adventure; do
  echo "[aws] Destroy $svc"
  (cd "$svc/_deploy" && npm ci && npx cdk destroy --force || true)
done
echo "[aws] Destroying shared infra ..."
(cd backend/_deploy/global && npm ci && npx cdk destroy --force || true)
