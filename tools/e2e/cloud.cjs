// Test de la sauvegarde en ligne avec l'émulateur Firebase : création de compte, synchronisation,
// déconnexion, autre appareil, nouvelle saison, règles de sécurité. Se lance avec tools/e2e/cloud.sh.
const { chromium } = require('playwright');
// Le jeu construit pour l'émulateur, servi dans un dossier /playtest/ (voir tools/e2e/cloud.sh).
const URL = process.env.URL ?? 'http://127.0.0.2:8765/Wipe-Loot/playtest/';
const FS = 'http://127.0.0.1:8080/v1/projects/demo-wipe/databases/(default)/documents';
const OUT = process.argv[2] ?? 'tools/e2e/captures';
const log = (...a) => console.log(...a);
let ok = true; const check = (c, m) => { log((c ? '✓ ' : '✗ ') + m); if (!c) ok = false; };
async function fsGet(path) { const r = await fetch(`${FS}/${path}`, { headers: { Authorization: 'Bearer owner' } }); return r.ok ? r.json() : null; }
async function fsSet(path, fields) { await fetch(`${FS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) }); }
async function newPage(b, phone) {
  const ctx = phone ? await b.newContext({ ...require('playwright').devices['iPhone 13 landscape'] }) : await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(e.message)); await p.goto(URL); return p;
}
async function login(p, tab, pseudo, mdp) {
  await p.click('[data-action="nouvelle"]');
  await p.waitForSelector('.boite-connexion');
  if (tab === 'creation') await p.click('[data-tab="creation"]');
  await p.fill('input[name="pseudo"]', pseudo); await p.fill('input[name="mdp"]', mdp);
}
(async () => {
  const b = await chromium.launch();
  // 1. Création de compte
  let p = await newPage(b);
  await p.waitForSelector('[data-action="nouvelle"]');
  await login(p, 'creation', 'Aldric', 'secret123');
  await p.screenshot({ path: `${OUT}/1_creation.png` });
  await p.press('input[name="mdp"]', 'Enter');
  await p.waitForSelector('[data-action="classe-voir"]', { timeout: 15000 });
  check(true, 'compte créé, écran des classes');
  await p.click('[data-action="classe-voir"][data-id="mage"]'); await p.click('[data-action="classe-depart"]');
  await p.waitForSelector('.hall'); const s = await p.$('text=Passer'); if (s) await s.click();
  check((await p.textContent('.hall-pseudo')).includes('Aldric'), 'pseudo affiché dans le hall');
  await p.click('[data-action="roue"]'); await p.waitForTimeout(200);
  await p.screenshot({ path: `${OUT}/2_hall_roue.png` });
  await p.click('.overlay.transparent', { position: { x: 400, y: 400 } });
  check(!(await p.$('.menu-roue')), 'le menu se ferme en touchant à côté');
  await p.waitForTimeout(2500);
  const players = await fsGet('sites/playtest/joueurs');
  const d = players?.documents?.[0]?.fields;
  check(!!d && d.pseudo.stringValue === 'Aldric' && JSON.parse(d.profil.stringValue).startClass === 'mage', 'fiche en ligne : pseudo et classe Mage');
  // 2. Déconnexion
  await p.click('[data-action="roue"]'); await p.click('[data-action="deconnexion"]');
  await p.waitForSelector('.ecran-accueil');
  const local = await p.evaluate(() => Object.keys(localStorage).filter((k) => /:(run|profil)$/.test(k)).length);
  check(local === 0, 'déconnexion : appareil vidé, retour à l\'accueil');
  // 3. Mauvais mot de passe, pseudo déjà pris
  await login(p, 'connexion', 'Aldric', 'mauvais1'); await p.press('input[name="mdp"]', 'Enter');
  await p.waitForSelector('.erreur-connexion'); check((await p.textContent('.erreur-connexion')).includes('incorrect'), 'mauvais mot de passe : message clair');
  await p.screenshot({ path: `${OUT}/3_erreur.png` });
  await p.click('[data-tab="creation"]'); await p.fill('input[name="pseudo"]', 'aldric'); await p.fill('input[name="mdp"]', 'autre123'); await p.press('input[name="mdp"]', 'Enter');
  await p.waitForSelector('.erreur-connexion'); check((await p.textContent('.erreur-connexion')).includes('déjà pris'), 'pseudo déjà pris (sans tenir compte des majuscules)');
  // 4. Autre appareil (téléphone) : on retrouve sa progression
  const t = await newPage(b, true);
  await t.waitForSelector('[data-action="nouvelle"]');
  await login(t, 'connexion', 'ALDRIC', 'secret123'); await t.press('input[name="mdp"]', 'Enter');
  await t.waitForSelector('.hall', { timeout: 15000 });
  check((await t.textContent('.hall-heros')).includes('Mage'), 'autre appareil : on retrouve le Mage');
  await t.screenshot({ path: `${OUT}/4_telephone.png` });
  // 5. Nouvelle saison
  await fsSet('sites/playtest/config/general', { saison: { integerValue: '2' } });
  await t.reload(); await t.waitForSelector('.boite-connexion h2', { timeout: 15000 });
  check((await t.textContent('.boite-connexion')).includes('Nouvelle saison'), 'nouvelle saison : message affiché');
  await t.screenshot({ path: `${OUT}/5_saison.png` });
  await t.click('[data-action="saison-ok"]'); await t.waitForSelector('[data-action="classe-voir"]');
  check(true, 'nouvelle saison : retour au choix de la classe');
  const after = (await fsGet('sites/playtest/joueurs')).documents[0].fields;
  check(after.saison.integerValue === '2', 'fiche en ligne passée à la saison 2');
  // 6. Les règles : un joueur ne peut pas écrire la fiche d'un autre, ni la saison
  const tok = await (await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-cle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'pirate@joueurs.wipe-loot.invalid', password: 'pirate123', returnSecureToken: true }) })).json();
  const autre = (await fsGet('sites/playtest/joueurs')).documents[0].name.split('/').pop();
  const w = await fetch(`${FS}/sites/playtest/joueurs/${autre}`, { method: 'PATCH', headers: { Authorization: `Bearer ${tok.idToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { pseudo: { stringValue: 'pirate' } } }) });
  check(w.status === 403, `règles : écrire la fiche d'un autre est refusé (${w.status})`);
  const r = await fetch(`${FS}/sites/playtest/joueurs/${autre}`, { headers: { Authorization: `Bearer ${tok.idToken}` } });
  check(r.status === 403, `règles : lire la fiche d'un autre est refusé (${r.status})`);
  const c = await fetch(`${FS}/sites/playtest/config/general`, { method: 'PATCH', headers: { Authorization: `Bearer ${tok.idToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { saison: { integerValue: '1' } } }) });
  check(c.status === 403, `règles : changer la saison est refusé (${c.status})`);
  check(p.errs.length + t.errs.length === 0, `aucune erreur JavaScript ${[...p.errs, ...t.errs].join(' | ')}`);
  await b.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.log('✗ ERREUR', e.message); process.exit(1); });
