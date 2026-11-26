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
  await p.click('[data-action="classe-voir"][data-id="mage"]'); await p.click('[data-action="classe-depart-voir"]'); await p.click('[data-action="classe-depart"]');
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
  // 7. Journal, bug, admin (réponse, news, blocage)
  const ADMIN_UID = 'PUomfoQPqgX5FYny6rz1Z2pVgry1';
  await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/demo-wipe/accounts', { method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ localId: ADMIN_UID, email: 'organisateur@joueurs.wipe-loot.invalid', password: 'admin123' }) });
  t.on('dialog', (d) => d.accept());
  await t.click('[data-action="classe-voir"][data-id="guerrier"]'); await t.click('[data-action="classe-depart-voir"]'); await t.click('[data-action="classe-depart"]');
  await t.waitForSelector('.hall'); const passer = await t.$('text=Passer'); if (passer) await passer.click();
  await t.click('.hall-expedition [data-action="nouvelle"]'); await t.waitForSelector('[data-action="menu"]');
  await t.click('[data-action="menu"]'); await t.click('[data-action="titre"]'); await t.waitForSelector('.hall');
  await t.click('.hall-expedition [data-action="nouvelle"]'); await t.click('[data-action="nouvelle-confirmee"]'); await t.waitForSelector('[data-action="menu"]');
  await t.click('[data-action="menu"]'); await t.click('[data-action="ouvrir-messages"]');
  await t.click('[data-action="msg-type"][data-type="bug"]'); await t.fill('textarea[name="texte"]', 'Le combat ne se termine pas après Charge.');
  await t.click('[data-action="msg-envoyer"]'); await t.waitForSelector('.envoye', { timeout: 10000 });
  check(true, 'bug envoyé pendant une expédition');
  await t.screenshot({ path: `${OUT}/6_bug_envoye.png` });
  await t.click('[data-action="fermer"]'); await t.click('[data-action="menu"]'); await t.click('[data-action="titre"]'); await t.waitForSelector('.hall');
  await t.waitForTimeout(1500);
  const runsDocs = (await fsGet('sites/playtest/runs'))?.documents ?? [];
  check(runsDocs.some((d) => d.fields.cause?.stringValue === 'Abandon'), `journal : l'expédition abandonnée est notée (${runsDocs.length} journal)`);
  const msgDoc = (await fsGet('sites/playtest/messages')).documents[0].fields;
  check(msgDoc.type.stringValue === 'bug' && !!msgDoc.run.stringValue && msgDoc.etat.stringValue === 'recu', 'le bug arrive avec la copie de la partie, état « reçu »');
  // Admin : un joueur normal voit « Accès réservé »
  const a = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }); a.errs = []; a.on('pageerror', (e) => a.errs.push(e.message)); a.on('dialog', (d) => d.accept(d.type() === 'prompt' ? 'X' : undefined));
  await a.goto(URL + 'admin/'); await a.waitForSelector('[data-form="login"]');
  await a.fill('input[name="pseudo"]', 'aldric'); await a.fill('input[name="mdp"]', 'secret123'); await a.press('input[name="mdp"]', 'Enter');
  await a.waitForSelector('text=Accès réservé'); check(true, 'admin : un joueur normal voit « Accès réservé » et son UID');
  await a.click('[data-act="deconnexion"]'); await a.waitForSelector('[data-form="login"]');
  await a.fill('input[name="pseudo"]', 'organisateur'); await a.fill('input[name="mdp"]', 'admin123'); await a.press('input[name="mdp"]', 'Enter');
  await a.waitForSelector('.a-tuiles', { timeout: 15000 });
  check((await a.textContent('.a-main')).includes('Abandon'), 'admin : tableau de bord avec l\'abandon dans « où les expéditions s\'arrêtent »');
  await a.screenshot({ path: `${OUT}/7_admin_tableau.png`, fullPage: true });
  await a.click('[data-act="onglet"][data-v="messages"]');
  check((await a.textContent('.a-onglets')).includes('1'), 'admin : pastille d\'un nouveau message');
  const ta = await a.$('textarea[data-role^="reponse-"]'); await ta.fill('Merci, corrigé dans la prochaine version !');
  await a.click('[data-act="repondre"]'); await a.waitForSelector('.a-flash'); check((await a.textContent('.a-flash')).includes('✓'), 'admin : réponse envoyée');
  await a.screenshot({ path: `${OUT}/8_admin_messages.png`, fullPage: true });
  await a.click('[data-act="onglet"][data-v="news"]');
  await a.fill('textarea[name="items"]', 'Le jeu parle maintenant comme un conte.\nTu peux te connecter avec un pseudo.');
  await a.click('[data-form="news"] button[type="submit"]'); await a.waitForSelector('.a-news'); check(true, 'admin : news publiée');
  await a.click('[data-act="onglet"][data-v="equilibrage"]'); await a.screenshot({ path: `${OUT}/9_admin_equilibrage.png`, fullPage: true });
  // Le joueur voit la news et la réponse (pastille sur la roue)
  await t.reload(); await t.click('[data-action="entrer"]', { timeout: 15000 }); await t.waitForSelector('.hall', { timeout: 15000 });
  check((await t.textContent('.bouton-roue')).includes('2'), 'joueur : pastille 2 sur la roue (1 news + 1 réponse)');
  await t.click('[data-action="roue"]'); await t.screenshot({ path: `${OUT}/10_roue_pastilles.png` });
  await t.click('[data-action="ouvrir-news"]'); check((await t.textContent('.boite-connexion')).includes('comme un conte'), 'joueur : la news s\'affiche');
  await t.screenshot({ path: `${OUT}/11_news.png` });
  await t.click('[data-action="fermer"]'); await t.click('[data-action="roue"]'); await t.click('[data-action="ouvrir-messages"]');
  check((await t.textContent('.boite-connexion')).includes('corrigé dans la prochaine'), 'joueur : il lit la réponse');
  await t.screenshot({ path: `${OUT}/12_reponse.png` });
  await t.click('[data-action="fermer"]'); await t.waitForTimeout(800);
  check(!(await t.$('.bouton-roue .pastille')), 'joueur : plus de pastille une fois lus');
  // Règles : un joueur ne lit pas les messages des autres, n'écrit pas les news, ne lit pas les journaux
  const lst = await fetch(`${FS}/sites/playtest/messages`, { headers: { Authorization: `Bearer ${tok.idToken}` } });
  check(lst.status === 403, `règles : lister les messages des autres est refusé (${lst.status})`);
  const jr = await fetch(`${FS}/sites/playtest/runs`, { headers: { Authorization: `Bearer ${tok.idToken}` } });
  check(jr.status === 403, `règles : lire les journaux est refusé (${jr.status})`);
  // Blocage
  await a.click('[data-act="onglet"][data-v="joueurs"]'); await a.click('tr.a-clic:has-text("Aldric")'); await a.click('[data-act="bloquer"]');
  await a.waitForSelector('.a-flash'); await t.reload();
  await t.waitForSelector('text=Ce compte est bloqué', { timeout: 15000 }); check(true, 'blocage : le joueur est déconnecté avec un message');
  check(p.errs.length + t.errs.length + a.errs.length === 0, `aucune erreur JavaScript ${[...p.errs, ...t.errs, ...a.errs].join(' | ')}`);
  await b.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.log('✗ ERREUR', e.message); process.exit(1); });
