#!/usr/bin/env bash
set -euo pipefail
echo "[aws] Deploying shared infra and services (CDK)..."
(cd backend/_deploy/global && npm ci && npx cdk deploy --require-approval never)
for svc in backend/src/Auth backend/src/Lobby backend/src/Marketplace backend/src/Chat backend/Tank_adventure; do
  echo "[aws] Deploy $svc"
  (cd "$svc/_deploy" && npm ci && npx cdk deploy --require-approval never)
done
