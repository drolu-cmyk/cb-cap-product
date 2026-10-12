#!/usr/bin/env bash
# Build the CB-CAP product story video (both formats). See README.md.
set -euo pipefail
cd "$(dirname "$0")"
python3 tools/voice.py
node tools/render.cjs
node tools/render.cjs --vertical
