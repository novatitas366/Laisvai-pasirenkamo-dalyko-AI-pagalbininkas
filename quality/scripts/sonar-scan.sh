#!/usr/bin/env bash
# Paleidžia SonarScanner Docker konteineryje prieš lokalų SonarQube serverį (http://localhost:9000)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TOKEN="$(cat "$ROOT/quality/.sonar-token")"
docker run --rm --network host \
  -v "$ROOT:/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dproject.settings=quality/sonar-project.properties \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token="$TOKEN"
