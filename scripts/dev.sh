#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
npm --prefix backend run dev &
npm --prefix frontend run dev &
wait
