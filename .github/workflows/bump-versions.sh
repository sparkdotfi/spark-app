#!/bin/sh

set -e

# Check if --canary flag is present
CANARY_SUFFIX=""
for arg in "$@"; do
  if [ "$arg" = "--canary" ]; then
    CANARY_SUFFIX="-canary"
    break
  fi
done

# update workspace dependencies to point to any version
jq '.dependencies |= with_entries(if .value == "workspace:^" then .value = "*" else . end)' package.json > temp.json && mv temp.json package.json
jq '.peerDependencies |= with_entries(if .value == "workspace:^" then .value = "*" else . end)' package.json > temp.json && mv temp.json package.json
echo "Updated workspace dependencies to '*'"

npm pkg set version=0.2.0-$(date +'%Y%m%d').$(git rev-parse --short HEAD)$CANARY_SUFFIX

echo "Version changed: $(npm pkg get version)"
