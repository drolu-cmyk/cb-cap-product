#!/usr/bin/env bash
# Build the CB-CAP product story video. See README.md.
set -euo pipefail
cd "$(dirname "$0")"
: "${KOKORO_DIR:?set KOKORO_DIR to the folder with kokoro-v1.0.onnx and voices-v1.0.bin}"
"${PYTHON:-python3}" tools/voice.py
node tools/render.cjs
node tools/render.cjs --vertical
