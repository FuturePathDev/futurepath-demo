#!/usr/bin/env bash
set -euo pipefail

# Config
BASE="${BASE:-https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo}"
PATH_SEG="${PATH_SEG:-/resources}"   # change to other list endpoints if needed
QUERY="${QUERY:-}"                   # e.g. 'grades=12&formats=Guide,Checklist'
OUT="${OUT:-resources.csv}"

echo 'id,title,summary,audience,grades,clusters,riaSec,formats,durationMin,costType,language,sourceType' > "$OUT"

TOKEN=""
PAGES=0
while :; do
  if [[ -n "$TOKEN" ]]; then
    RESP=$(curl -sG "$BASE$PATH_SEG" --data-urlencode "nextToken=$TOKEN" ${QUERY:+ --data "$QUERY"})
  else
    RESP=$(curl -sG "$BASE$PATH_SEG" ${QUERY:+ --data "$QUERY"})
  fi

  echo "$RESP" | jq -r '
    (.items // .)[]? |
    [
      .id,
      (.title // ""),
      (.summary // "" | gsub("[\r\n]+"; " ") | gsub("\""; "\"\"")),
      ((.audience // []) | join(";")),
      ((.grades // []) | join(";")),
      ((.clusters // []) | join(";")),
      ((.riaSec // []) | join(";")),
      ((.formats // []) | join(";")),
      (.durationMin // ""),
      (.costType // ""),
      ((.language // []) | join(";")),
      (.sourceType // "")
    ] | @csv
  ' >> "$OUT"

  TOKEN=$(echo "$RESP" | jq -r '.nextToken // empty')
  ((PAGES++))
  [[ -z "$TOKEN" ]] && break
done

echo "Wrote $OUT (pages: $PAGES)"
