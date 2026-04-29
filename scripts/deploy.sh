#!/usr/bin/env bash
# Deploy client and/or admin to Cloudflare Pages.
#
# Usage:
#   pnpm deploy              → deploy both
#   pnpm deploy:client       → client only
#   pnpm deploy:admin        → admin only
set -euo pipefail

TARGET="${1:-both}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

deploy_app() {
  local app="$1"
  local project="$2"
  local dir="$ROOT/apps/$app"

  echo ""
  echo "▶ Building $app..."
  pnpm --filter "@blabbun/$app" build

  echo "▶ Deploying $app → $project..."
  cd "$dir"
  pnpm wrangler pages deploy dist --project-name="$project" --commit-dirty=true
  cd "$ROOT"
  echo "✓ $app deployed"
}

case "$TARGET" in
  client) deploy_app client blabbun-client ;;
  admin)  deploy_app admin  blabbun-admin  ;;
  both)
    deploy_app client blabbun-client
    deploy_app admin  blabbun-admin
    ;;
  *)
    echo "Usage: $0 [client|admin|both]" >&2
    exit 1
    ;;
esac

echo ""
echo "Done."
