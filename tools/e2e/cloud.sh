#!/usr/bin/env bash
# Teste les comptes et la sauvegarde en ligne avec l'émulateur Firebase (aucune vraie base touchée).
# Besoin : Java (pour l'émulateur Firestore). Usage : bash tools/e2e/cloud.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
TMP=$(mktemp -d)
# Le jeu construit avec une fausse configuration, branché sur l'émulateur.
VITE_FIREBASE_API_KEY=demo-cle VITE_FIREBASE_AUTH_DOMAIN=demo-wipe.firebaseapp.com VITE_FIREBASE_PROJECT_ID=demo-wipe \
VITE_FIREBASE_APP_ID=demo-app VITE_FIREBASE_EMULATOR=1 npx vite build --outDir "$TMP/build" --emptyOutDir >/dev/null
mkdir -p "$TMP/site/Wipe-Loot/playtest" tools/e2e/captures && cp -r "$TMP/build/." "$TMP/site/Wipe-Loot/playtest/"
(cd "$TMP/site" && python3 -m http.server 8765 --bind 0.0.0.0 >/dev/null 2>&1) & SERVER=$!
trap 'kill $SERVER 2>/dev/null; rm -rf "$TMP"' EXIT
# 127.0.0.2 : une adresse qui n'est pas « localhost », pour que le jeu se croie sur /playtest/.
npx --yes firebase-tools@15.37.0 emulators:exec --only auth,firestore --project demo-wipe "node tools/e2e/cloud.cjs tools/e2e/captures"
