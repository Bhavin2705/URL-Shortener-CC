#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
npm --prefix backend run build
npm --prefix frontend run build
