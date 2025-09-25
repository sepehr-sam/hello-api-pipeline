#!/usr/bin/env bash
set -euo pipefail
rm -f hello-api-artifact.zip
# exclude junk
zip -r hello-api-artifact.zip . -x "node_modules/*" ".git/*" "*.zip"
