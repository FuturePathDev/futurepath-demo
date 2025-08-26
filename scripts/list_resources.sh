#!/usr/bin/env bash
set -euo pipefail

: "${BASE:?Set BASE, e.g. export BASE=https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo}"
# Optional: export QUERY='query=FAFSA' or 'grades=12&formats=Guide,Checklist'

{
  printf "id\ttitle\taudience\tgrades\tformats\tduration\n"
  TOKEN=""
  while :; do
    RESP=$(curl -sG "$BASE/resources" \
      ${QUERY:+ --data "$QUERY"} \
      ${TOKEN:+ --data-urlencode "nextToken=$TOKEN"})

    # rows
    echo "$RESP" | jq -r '
      (.items // [])[] |
      [ .id,
        .title,
        (.audience // [] | join(";")),
        (.grades   // [] | join(";")),
        (.formats  // [] | join(";")),
        (.durationMin // "")
      ] | @tsv
    '

    # pagination
    TOKEN=$(echo "$RESP" | jq -r '.nextToken // empty')
    [[ -z "$TOKEN" ]] && break
  done
} | column -t -s $'\t'
