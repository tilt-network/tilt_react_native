#!/usr/bin/env bash
set -euo pipefail

ZED_WORK_DIR="$HOME/Library/Application Support/Zed/extensions/work"

latest_kotlin_lsp=""
while IFS= read -r path; do
  latest_kotlin_lsp="$path"
done < <(find "$ZED_WORK_DIR/kotlin" -maxdepth 1 -type d -name 'kotlin-lsp-*' 2>/dev/null | sort -V)

# Prefer Kotlin LSP bundled JRE (Java 21) for Groovy LS to avoid JVM 25 incompatibilities.
if [[ -n "$latest_kotlin_lsp" && -x "$latest_kotlin_lsp/jre/Contents/Home/bin/java" ]]; then
  export JAVA_HOME="$latest_kotlin_lsp/jre/Contents/Home"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

latest_groovy=""
while IFS= read -r path; do
  latest_groovy="$path"
done < <(find "$ZED_WORK_DIR/groovy" -maxdepth 1 -type d -name 'groovy-language-server-*' 2>/dev/null | sort -V)

if [[ -z "$latest_groovy" ]]; then
  echo "groovy-lsp wrapper: no groovy-language-server-* found under $ZED_WORK_DIR/groovy" >&2
  exit 1
fi

server_bin="$latest_groovy/groovy-language-server-macOS/groovy_language_server_wrapper"
if [[ ! -x "$server_bin" ]]; then
  echo "groovy-lsp wrapper: server binary not executable: $server_bin" >&2
  exit 1
fi

exec "$server_bin" "$@"
