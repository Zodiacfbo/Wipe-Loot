// Test navigateur : le parcours d'un nouveau joueur, sur PC et sur téléphone.
//   Commencer → choix de la classe → hall de la guilde → Partir en expédition
//   → Brégan (bénédiction) → carte → premier combat.
//
// Utilisation (le jeu doit être construit : npm run build) :
//   npm run e2e                                   # PC + téléphone, Guerrier
//   CLASSE=mage npm run e2e                       # une autre classe de départ
//   ECRANS=telephone npm run e2e                  # un seul écran (pc, telephone)
//   ETAT=chemin/run.json npm run e2e              # puis ouvre cette run (vendeur, feu de camp…)
//   URL=http://localhost:5173/ npm run e2e        # un serveur déjà lancé (sinon : vite preview)
//
// Les captures vont dans tools/e2e/captures/ (ou SORTIE=dossier). Échec si une étape manque
// ou si la page affiche une erreur JavaScript.
//
// Playwright n'est pas une dépendance du projet : il doit être installé sur la machine
// (il l'est dans l'environnement de Claude Code).

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

let playwright;
try {
  playwright = require('playwright');
} catch {
  console.error('Playwright introuvable : installe-le (npm i -g playwright) puis relance.');
  process.exit(1);
}
const { chromium, devices } = playwright;

const RACINE = path.resolve(__dirname, '../..');
const SORTIE = path.resolve(process.env.SORTIE || path.join(__dirname, 'captures'));
const CLASSE = process.env.CLASSE || 'guerrier';
const ECRANS = {
  pc: { viewport: { width: 1280, height: 720 } },
  // Le jeu se joue en paysage : en portrait, un écran « tourne ton téléphone » bloque les clics.
  telephone: devices['iPhone 13 landscape'],
};
const choisis = (process.env.ECRANS || 'pc,telephone').split(',').map(s => s.trim()).filter(Boolean);
for (const nom of choisis) if (!ECRANS[nom]) { console.error(`Écran inconnu : ${nom} (pc, telephone)`); process.exit(1); }

async function attendreServeur(url, essais = 50) {
  for (let i = 0; i < essais; i++) {
    try { if ((await fetch(url)).ok) return; } catch { /* pas encore prêt */ }
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`Le serveur ne répond pas : ${url}`);
}

async function lancerServeur() {
  if (process.env.URL) return { url: process.env.URL, arreter: () => {} };
  if (!fs.existsSync(path.join(RACINE, 'dist/index.html'))) throw new Error('Pas de build : lance d\'abord npm run build.');
  const port = 4173 + Math.floor(Math.random() * 500);
  const proc = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { cwd: RACINE, stdio: 'ignore' });
  const url = `http://localhost:${port}/`;
  await attendreServeur(url);
  return { url, arreter: () => proc.kill() };
}

async function parcours(navigateur, url, nomEcran) {
  const contexte = await navigateur.newContext(ECRANS[nomEcran]);
  const page = await contexte.newPage();
  const erreurs = [];
  page.on('pageerror', e => erreurs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') erreurs.push(m.text()); });

  let n = 0;
  const capture = async nom => page.screenshot({ path: path.join(SORTIE, `${nomEcran}-${String(++n).padStart(2, '0')}-${nom}.png`) });
  const etape = async (nom, selecteur) => {
    try {
      await page.waitForSelector(selecteur, { timeout: 5000 });
    } catch {
      await capture(`ECHEC-${nom}`);
      throw new Error(`[${nomEcran}] étape « ${nom} » : ${selecteur} introuvable`);
    }
    await capture(nom);
    console.log(`  ✓ ${nom}`);
  };

  console.log(`${nomEcran} :`);
  await page.goto(url);
  await etape('titre', '[data-action="nouvelle"]');
  await page.click('[data-action="nouvelle"]');

  await etape('classes', `[data-action="classe-voir"][data-id="${CLASSE}"]`);
  await page.click(`[data-action="classe-voir"][data-id="${CLASSE}"]`);
  await etape('fiche-classe', `[data-action="classe-depart"][data-id="${CLASSE}"]`);
  await page.click(`[data-action="classe-depart"][data-id="${CLASSE}"]`);

  await etape('hall', '[data-action="talents"]');
  await page.click('[data-action="nouvelle"]');

  // Brégan propose 4 bénédictions sur 8, au hasard. Allègement, Équipement de prêt et Pari risqué
  // ouvrent un écran de plus : on prend la première des autres (il en reste toujours au moins une).
  await etape('bregan', '[data-action="benediction"]');
  await page.locator(['provisions', 'bourse', 'potions', 'entrainement', 'marche']
    .map(id => `[data-action="benediction"][data-id="${id}"]`).join(', ')).first().click();

  await etape('carte', '[data-action="noeud"]');
  await page.locator('[data-action="noeud"]').first().click();
  await etape('combat', '[data-action="fin-tour"]');

  if (process.env.ETAT) {
    // Ouvrir une run préparée (par exemple écrite par un test vitest jetable).
    const run = fs.readFileSync(path.resolve(process.env.ETAT), 'utf8');
    await page.evaluate(r => {
      const cle = Object.keys(localStorage).find(k => k.endsWith(':run')) || 'wipe-and-loot:/:run';
      localStorage.setItem(cle, r);
    }, run);
    await page.reload();
    await page.click('[data-action="continuer"]'); // le hall propose de reprendre la run sauvegardée
    // Les animations en attente (combat) se jouent avant l'affichage : on attend que le hall disparaisse.
    await page.waitForFunction(() => !document.querySelector('.hall'), null, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(800);
    await capture('etat');
    if (!(await page.locator('#stage [data-action]').count())) throw new Error(`[${nomEcran}] la run de ETAT s'ouvre sur un écran vide (état mal préparé ?)`);
    console.log('  ✓ état ouvert');
  }

  await contexte.close();
  if (erreurs.length) throw new Error(`[${nomEcran}] erreurs JavaScript :\n    ${erreurs.join('\n    ')}`);
}

(async () => {
  fs.rmSync(SORTIE, { recursive: true, force: true });
  fs.mkdirSync(SORTIE, { recursive: true });
  const serveur = await lancerServeur();
  const navigateur = await chromium.launch();
  let ok = true;
  try {
    for (const nom of choisis) {
      try { await parcours(navigateur, serveur.url, nom); } catch (e) { ok = false; console.error(`  ✗ ${e.message}`); }
    }
  } finally {
    await navigateur.close();
    serveur.arreter();
  }
  console.log(ok ? `Parcours réussi. Captures : ${path.relative(process.cwd(), SORTIE)}/` : 'Parcours en échec.');
  process.exit(ok ? 0 : 1);
})();
