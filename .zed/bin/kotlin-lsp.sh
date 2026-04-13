#!/usr/bin/env bash
set -euo pipefail

ZED_EXT_DIR="$HOME/Library/Application Support/Zed/extensions/work/kotlin"

latest_kotlin_lsp=""
while IFS= read -r path; do
  latest_kotlin_lsp="$path"
done < <(find "$ZED_EXT_DIR" -maxdepth 1 -type d -name 'kotlin-lsp-*' 2>/dev/null | sort -V)

if [[ -z "$latest_kotlin_lsp" ]]; then
  echo "kotlin-lsp wrapper: no kotlin-lsp-* found under $ZED_EXT_DIR" >&2
  exit 1
fi

server_bin="$latest_kotlin_lsp/kotlin-lsp.sh"
if [[ ! -x "$server_bin" ]]; then
  echo "kotlin-lsp wrapper: server binary not executable: $server_bin" >&2
  exit 1
fi

exec "$server_bin" "$@"
