#!/usr/bin/env bash
# Pack branded suite visuals into public/downloads/DataLundSuite.zip
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/downloads/DataLundSuite.zip"
cd "$ROOT/public/downloads"
zip -9 -FS "$OUT" ganttChart.pbiviz resourceLoad.pbiviz taskList.pbiviz
echo "Wrote $OUT"
unzip -l "$OUT"
