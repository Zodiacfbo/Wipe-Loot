// La sauvegarde en ligne (Firebase) : comptes « pseudo + mot de passe » et copie du profil et de la run.
// La sauvegarde du navigateur reste la principale (le jeu marche sans réseau) ; ce module l'envoie
// en ligne au changement d'étape, en fin de run, quand le profil change et quand on quitte la page.
// Sans configuration Firebase (jeu lancé en local, tests), tout est désactivé et le jeu marche comme avant.
//
// Dans la base, un dossier par site (dev, playtest, main) :
//   sites/{site}/config/general   { saison }                                     écrit par l'organisateur
//   sites/{site}/joueurs/{uid}    { pseudo, profil, run, saison, majMs, version } écrit par le joueur
// Les règles de sécurité sont dans firestore.rules.
import type { RunState } from './engine/types';
import { clearLocal, exportLocal, importLocal, localKey, onLocalSave } from './engine/save';
import { authErrorText, cloudSite, passwordError, pseudoError, pseudoToEmail, runStepKey, seasonReset, syncChoice, type CloudDoc, type LocalOwner } from './cloud_logic';
import { VERSION, siteOf } from './version';

const CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/** Attente avant d'envoyer (plusieurs sauvegardes rapprochées partent en une seule écriture). */
const PUSH_DELAY_MS = 1500;

export interface CloudState {
  /** Une configuration Firebase est présente : il faut un compte pour jouer. */
  enabled: boolean;
  /** On sait si quelqu'un est connecté (au lancement, Firebase met un instant à le retrouver). */
  ready: boolean;
  user: { uid: string; pseudo: string } | null;
  /** La sauvegarde vient d'être remise à zéro par une nouvelle saison (message à montrer une fois). */
  newSeason: number | null;
}

export const cloud: CloudState = { enabled: !!(CONFIG.apiKey && CONFIG.projectId), ready: false, user: null, newSeason: null };

type Fb = {
  auth: typeof import('firebase/auth');
  fs: typeof import('firebase/firestore');
  authInst: import('firebase/auth').Auth;
  db: import('firebase/firestore').Firestore;
};
let fb: Fb | null = null;
let onChange: () => void = () => {};
let pendingPseudo: string | null = null;
let season = 1;
let dirty = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let lastStep = '';
/** La synchronisation de la connexion a réussi (saison connue) : on peut envoyer. */
let synced = false;

const site = cloudSite(siteOf(location.pathname, location.hostname));
const OWNER_KEY = localKey('compte');

function readOwner(): LocalOwner {
  try {
    const o = JSON.parse(localStorage.getItem(OWNER_KEY) ?? 'null') as LocalOwner | null;
    if (o && typeof o.maj === 'number') return o;
  } catch {
    // illisible : personne
  }
  return { uid: null, maj: 0 };
}
function writeOwner(o: LocalOwner): void {
  try {
    localStorage.setItem(OWNER_KEY, JSON.stringify(o));
  } catch {
    // stockage indisponible
  }
}

/** Charge Firebase (seulement si une configuration existe) et retrouve le joueur connecté. */
export function initCloud(changed: () => void): void {
  onChange = changed;
  if (!cloud.enabled) {
    cloud.ready = true;
    return;
  }
  void (async () => {
    try {
      const [app, auth, fs] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
      const inst = app.initializeApp(CONFIG);
      fb = { auth, fs, authInst: auth.getAuth(inst), db: fs.getFirestore(inst) };
      // Tests seulement : l'émulateur Firebase local (jamais défini sur le site publié).
      if (import.meta.env.VITE_FIREBASE_EMULATOR) {
        auth.connectAuthEmulator(fb.authInst, 'http://127.0.0.1:9099', { disableWarnings: true });
        fs.connectFirestoreEmulator(fb.db, '127.0.0.1', 8080);
      }
      auth.onAuthStateChanged(fb.authInst, (user) => void onUser(user));
    } catch {
      // Firebase n'a pas pu se charger (pas de réseau au premier lancement) : on laisse jouer sans compte.
      cloud.enabled = false;
      cloud.ready = true;
      onChange();
    }
  })();
  onLocalSave(localSaved);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void pushNow();
  });
  // Connecté sans réseau : on refait la synchronisation quand le réseau revient.
  window.addEventListener('online', () => {
    const user = fb?.authInst.currentUser;
    if (user && !synced) void onUser(user);
  });
}

async function onUser(user: import('firebase/auth').User | null): Promise<void> {
  synced = false;
  if (!user) {
    cloud.user = null;
    cloud.ready = true;
    onChange();
    return;
  }
  try {
    await afterLogin(user);
  } catch {
    // Pas de réseau : on garde la sauvegarde de l'appareil, elle partira plus tard.
    cloud.user = { uid: user.uid, pseudo: pendingPseudo ?? user.displayName ?? 'Aventurier' };
  }
  pendingPseudo = null;
  cloud.ready = true;
  onChange();
}

function playerRef(uid: string) {
  return fb!.fs.doc(fb!.db, 'sites', site, 'joueurs', uid);
}

/** Juste après la connexion : saison, puis quelle sauvegarde garder (appareil ou en ligne). */
async function afterLogin(user: import('firebase/auth').User): Promise<void> {
  const { fs, db } = fb!;
  synced = false;
  const config = await fs.getDoc(fs.doc(db, 'sites', site, 'config', 'general'));
  season = Number(config.data()?.saison ?? 1) || 1;
  const snap = await fs.getDoc(playerRef(user.uid));
  const doc = snap.exists() ? (snap.data() as CloudDoc) : null;
  const pseudo = doc?.pseudo ?? pendingPseudo ?? user.displayName ?? 'Aventurier';
  cloud.user = { uid: user.uid, pseudo };
  synced = true;
  const owner = readOwner();
  if (doc && seasonReset(doc.saison ?? 1, season)) {
    clearLocal();
    cloud.newSeason = season;
    writeOwner({ uid: user.uid, maj: Date.now() });
    await push();
    return;
  }
  const choice = syncChoice(user.uid, owner, doc);
  if (choice === 'recevoir' && doc) {
    importLocal({ profil: doc.profil, run: doc.run });
    writeOwner({ uid: user.uid, maj: doc.majMs });
    lastStep = runStepKey(doc.run ? (JSON.parse(doc.run) as RunState) : null);
    return;
  }
  if (choice === 'vider') clearLocal();
  writeOwner({ uid: user.uid, maj: Date.now() });
  await push();
}

/** Une sauvegarde locale vient d'être écrite : on l'enverra au changement d'étape ou si le profil a changé. */
function localSaved(what: 'run' | 'profil', run?: RunState | null): void {
  if (!cloud.user) return;
  writeOwner({ uid: cloud.user.uid, maj: Date.now() });
  dirty = true;
  if (what === 'run') {
    const step = runStepKey(run ?? null);
    if (step === lastStep) return; // même étape : on attend la suivante (ou la fermeture de la page)
    lastStep = step;
  }
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void pushNow(), PUSH_DELAY_MS);
}

async function pushNow(): Promise<void> {
  if (timer) clearTimeout(timer);
  timer = null;
  if (dirty && cloud.user) await push().catch(() => {});
}

async function push(): Promise<void> {
  if (!fb || !cloud.user || !synced) return; // sans saison connue, on n'écrit rien (la sauvegarde attend)
  dirty = false;
  const local = exportLocal();
  const data: CloudDoc = { pseudo: cloud.user.pseudo, profil: local.profil, run: local.run, saison: season, majMs: Date.now(), version: VERSION.commit };
  await fb.fs.setDoc(playerRef(cloud.user.uid), data);
}

/** Créer un compte. Renvoie le message d'erreur, ou null si tout va bien. */
export async function signUp(pseudo: string, password: string): Promise<string | null> {
  const bad = pseudoError(pseudo) ?? passwordError(password);
  if (bad) return bad;
  if (!fb) return authErrorText('unavailable');
  try {
    pendingPseudo = pseudo.trim();
    const cred = await fb.auth.createUserWithEmailAndPassword(fb.authInst, pseudoToEmail(pseudo), password);
    await fb.auth.updateProfile(cred.user, { displayName: pendingPseudo });
    return null;
  } catch (e) {
    pendingPseudo = null;
    return authErrorText((e as { code?: string }).code ?? '');
  }
}

/** Se connecter. Renvoie le message d'erreur, ou null si tout va bien. */
export async function signIn(pseudo: string, password: string): Promise<string | null> {
  if (!pseudo.trim() || !password) return 'Entre ton pseudo et ton mot de passe.';
  if (!fb) return authErrorText('unavailable');
  try {
    await fb.auth.signInWithEmailAndPassword(fb.authInst, pseudoToEmail(pseudo), password);
    return null;
  } catch (e) {
    return authErrorText((e as { code?: string }).code ?? '');
  }
}

/** Se déconnecter : la sauvegarde part en ligne, puis cet appareil est vidé (il peut servir à quelqu'un d'autre). */
export async function signOut(): Promise<void> {
  if (!fb) return;
  await pushNow();
  clearLocal();
  writeOwner({ uid: null, maj: 0 });
  lastStep = '';
  await fb.auth.signOut(fb.authInst);
}
