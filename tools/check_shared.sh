#!/usr/bin/env bash
# The shared tool stylesheet has one source, shared/dash.css in this repository. FloodScope and GeoValidate
# each serve a copy (GitHub Pages serves each repository on its own); AgroSignal has its own stylesheet since 1.2.0.
# This script compares the copies with the source.
#   tools/check_shared.sh          compare (exit 1 if any copy differs or is missing)
#   tools/check_shared.sh --sync   copy the source into each tool
# The tool repositories are expected beside this one (../FloodScope or ../floodscope, and so on); set TOOLS_DIR to change that.
set -u
here="$(cd "$(dirname "$0")/.." && pwd)"; src="$here/shared/dash.css"; base="${TOOLS_DIR:-$(dirname "$here")}"; bad=0
for t in FloodScope GeoValidate; do
  d="$base/$t"; [ -d "$d" ] || d="$base/$(echo "$t" | tr 'A-Z' 'a-z')"
  f="$d/css/dash.css"
  if [ ! -f "$f" ]; then echo "MISSING $t ($f)"; bad=1; continue; fi
  if [ "${1:-}" = "--sync" ]; then cp "$src" "$f"; echo "synced  $t"; continue; fi
  if cmp -s "$src" "$f"; then echo "same    $t"; else echo "DIFFERS $t"; bad=1; fi
done
exit $bad
