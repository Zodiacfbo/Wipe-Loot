// Export pour analyse : lit les journaux des runs et les profils dans Firestore (clé de lecture seule),
// remplace les pseudos par « Joueur 1, 2… » et écrit export.json. Lancé par .github/workflows/export.yml.
// Variables : FIREBASE_SERVICE_ACCOUNT (le JSON de la clé), SITE (dev, playtest ou main), JOURS (période).
import { writeFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { buildExport } from './anonymise.mjs';

const site = ['dev', 'playtest', 'main'].includes(process.env.SITE) ? process.env.SITE : 'playtest';
const days = Math.max(1, Math.min(365, Number(process.env.JOURS) || 14));
const key = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
if (!key.client_email) {
  console.error('Clé absente : ajoute le secret FIREBASE_SERVICE_ACCOUNT dans les réglages du dépôt.');
  process.exit(1);
}
initializeApp({ credential: cert(key) });
const db = getFirestore();
const now = Date.now();
const since = now - days * 86400000;
const base = db.collection('sites').doc(site);
const [runsSnap, playersSnap] = await Promise.all([
  base.collection('runs').where('finMs', '>=', since).get(),
  base.collection('joueurs').get(),
]);
const out = buildExport({
  site, days, now,
  runs: runsSnap.docs.map((d) => d.data()),
  players: playersSnap.docs.map((d) => ({ uid: d.id, ...d.data() })),
});
writeFileSync('export.json', JSON.stringify(out));
console.log(`Export ${site}, ${days} jours : ${out.runs.length} runs, ${out.joueurs.length} joueurs.`);
