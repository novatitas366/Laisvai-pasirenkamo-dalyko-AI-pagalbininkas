#!/usr/bin/env bash
# Vienkartinis SonarQube paruošimas: konteineris, slaptažodis, projektas ir analizės raktas (.sonar-token)
set -uo pipefail
cd "$(dirname "$0")/.."
URL=http://localhost:9000
PW='Nd1_Kokybe_2026!'
KEY=elective-assistant

if docker ps -a --format '{{.Names}}' | grep -qx sonarqube-nd1; then
  docker start sonarqube-nd1 >/dev/null
else
  docker run -d --name sonarqube-nd1 -p 9000:9000 sonarqube:community >/dev/null
fi

echo -n "Laukiama, kol SonarQube pasileis"
until curl -s "$URL/api/system/status" | grep -q '"status":"UP"'; do echo -n .; sleep 5; done
echo " UP"

# Pradinis slaptažodis admin/admin keičiamas (jei jau pakeistas, klaida ignoruojama)
curl -s -u admin:admin -X POST "$URL/api/users/change_password" \
  --data-urlencode login=admin --data-urlencode previousPassword=admin --data-urlencode "password=$PW" >/dev/null
curl -s -u "admin:$PW" -X POST "$URL/api/projects/create" \
  -d "project=$KEY" --data-urlencode "name=Laisvai pasirenkamo dalyko AI pagalbininkas" >/dev/null

if [ ! -s .sonar-token ]; then
  curl -s -u "admin:$PW" -X POST "$URL/api/user_tokens/generate" \
    -d "name=nd1-scan-$(date +%s)&type=GLOBAL_ANALYSIS_TOKEN" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" > .sonar-token
fi
echo "Paruošta: $URL (admin / $PW), raktas quality/.sonar-token"
