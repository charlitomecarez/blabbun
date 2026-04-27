#!/usr/bin/env bash
# Usage:
#   pnpm notify:local          → hit local dev server (default)
#   pnpm notify:prod           → hit production
#   BASE_URL=https://... pnpm notify:local
set -euo pipefail

# Auto-load .env.local from the client app if no CRON_SECRET in env
ENV_FILE="apps/client/.env.local"
if [[ -z "${CRON_SECRET:-}" && -f "$ENV_FILE" ]]; then
  export $(grep -v '^#' "$ENV_FILE" | grep '=' | xargs) 2>/dev/null || true
fi

BASE_URL="${BASE_URL:-http://localhost:4321}"
ENDPOINT="$BASE_URL/api/cron/notify-subscribers"

if [[ -z "${CRON_SECRET:-}" ]]; then
  echo "error: CRON_SECRET is not set. Add it to apps/client/.env.local or export it." >&2
  exit 1
fi

echo "→ GET $ENDPOINT"
echo ""

BODY=$(curl -s -o /tmp/_notify_body -w "%{http_code}" \
  -X GET "$ENDPOINT" \
  -H "Authorization: Bearer $CRON_SECRET")
HTTP_STATUS="$BODY"
BODY=$(cat /tmp/_notify_body)

echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""
echo "status: $HTTP_STATUS"
