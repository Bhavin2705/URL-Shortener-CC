#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
./scripts/build.sh
echo "Build complete. Deploy artifacts from backend/dist and frontend/dist."
