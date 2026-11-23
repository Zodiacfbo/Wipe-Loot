// La sauvegarde en ligne (Firebase) : comptes « pseudo + mot de passe » et copie du profil et de la run.
// La sauvegarde du navigateur reste la principale (le jeu marche sans réseau) ; ce module l'envoie
// en ligne au changement d'étape, en fin de run, quand le profil change et quand on quitte la page.
// Sans configuration Firebase (jeu lancé en local, tests), tout est désactivé et le jeu marche comme avant.
//
// Dans la base, un dossier par site (dev, playtest, main) :
//   sites/{site}/config/general   { saison, news }                                écrit par l'organisateur
//   sites/{site}/joueurs/{uid}    { pseudo, profil, run, saison, majMs, version } écrit par le joueur
//                                  (+ remiseAZero, posé par l'organisateur : la sauvegarde repart de zéro)
//   sites/{site}/runs/{id}        le journal de chaque expédition finie (src/journal.ts)
//   sites/{site}/messages/{id}    bugs, idées et messages (MessageDoc), avec l'état et la réponse
//   sites/{site}/bloques/{uid}    comptes bloqués par l'organisateur
// Les règles de sécurité sont dans firestore.rules.
import type { RunState } from './engine/types';
import { clearLocal, exportLocal, importLocal, localKey, onLocalSave } from './engine/save';
import { authErrorText, cloudSite, deviceLabel, messageError, passwordError, pseudoError, pseudoToEmail, runStepKey, seasonReset, syncChoice, todayIso, unreadNews, visibleNews, type CloudDoc, type LocalOwner, type MessageDoc, type MessageType, type NewsItem } from './cloud_logic';
import { runJournal } from './journal';
import type { RunSummary } from './engine/progression';
import { VERSION, siteOf } from './version';

const CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/** Attente avant d'envoyer (plusieurs sauvegardes rapprochées partent en une seule écriture). */
const PUSH_DELAY_MS = 1500;
/** Les news sont relues toutes les 10 minutes au plus (une lecture du document config). */
const NEWS_REFRESH_MS = 10 * 60 * 1000;

export interface CloudState {
  /** Une configuration Firebase est présente : il faut un compte pour jouer. */
  enabled: boolean;
  /** On sait si quelqu'un est connecté (au lancement, Firebase met un instant à le retrouver). */
  ready: boolean;
  user: { uid: string; pseudo: string } | null;
  /** La sauvegarde vient d'être remise à zéro par une nouvelle saison (message à montrer une fois). */
  newSeason: number | null;
  /** Les news du site (toutes, y compris celles programmées plus tard). */
  news: NewsItem[];
  /** Mes messages (bugs, idées…), du plus récent au plus ancien. */
  messages: (MessageDoc & { id: string })[];
  /** Message à montrer à la connexion (compte bloqué, remise à zéro par l'organisateur). */
  notice: string | null;
}

export const cloud: CloudState = { enabled: !!(CONFIG.apiKey && CONFIG.projectId), ready: false, user: null, newSeason: null, news: [], messages: [], notice: null };

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
const NEWS_KEY = localKey('news-lue');
const START_KEY = localKey('debut-run');
const PENDING_RUNS_KEY = localKey('journaux');
let newsReadAt = 0;

function readJson<T>(key: string, fallback: T): T {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? 'null') as T) ?? fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // stockage indisponible
  }
}

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
    cloud.messages = [];
    cloud.ready = true;
    onChange();
    return;
  }
  try {
    await afterLogin(user);
    if (synced) {
      await flushJournals();
      await loadMessages().catch(() => {});
    }
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
  readNews(config.data());
  // Compte bloqué par l'organisateur : on le déconnecte avec un message.
  const blocked = await fs.getDoc(fs.doc(db, 'sites', site, 'bloques', user.uid));
  if (blocked.exists()) {
    cloud.notice = 'Ce compte est bloqué. Écris à l\'organisateur si tu penses que c\'est une erreur.';
    clearLocal();
    writeOwner({ uid: null, maj: 0 });
    await fb!.auth.signOut(fb!.authInst);
    return;
  }
  const snap = await fs.getDoc(playerRef(user.uid));
  const doc = snap.exists() ? (snap.data() as CloudDoc & { remiseAZero?: boolean }) : null;
  // Un nouveau joueur est « à jour » des news : il ne reçoit pas tout l'historique.
  if (!doc) markNewsRead();
  const pseudo = doc?.pseudo ?? pendingPseudo ?? user.displayName ?? 'Aventurier';
  cloud.user = { uid: user.uid, pseudo };
  synced = true;
  const owner = readOwner();
  if (doc?.remiseAZero) {
    clearLocal();
    cloud.notice = 'L\'organisateur a remis ta progression à zéro. Bonne nouvelle aventure !';
    writeOwner({ uid: user.uid, maj: Date.now() });
    await push();
    return;
  }
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
  // Le début de chaque run (sa graine), pour la durée dans le journal.
  if (run && readJson<{ seed: number } | null>(START_KEY, null)?.seed !== run.seed) writeJson(START_KEY, { seed: run.seed, ms: Date.now() });
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

// ---------- Journal des runs ----------

/** Fin d'une expédition : son journal part en ligne (ou attend le réseau). */
export function logRun(run: RunState, summary: RunSummary | undefined, abandon = false): void {
  if (!cloud.user) return;
  const start = readJson<{ seed: number; ms: number } | null>(START_KEY, null);
  const journal = runJournal(run, summary, cloud.user, VERSION.commit, start?.seed === run.seed ? start.ms : null, Date.now(), abandon);
  writeJson(PENDING_RUNS_KEY, [...readJson<unknown[]>(PENDING_RUNS_KEY, []), journal].slice(-20));
  void flushJournals();
}

async function flushJournals(): Promise<void> {
  if (!fb || !cloud.user || !synced) return;
  const pending = readJson<{ uid: string }[]>(PENDING_RUNS_KEY, []).filter((j) => j.uid === cloud.user!.uid);
  if (pending.length === 0) return;
  writeJson(PENDING_RUNS_KEY, []);
  for (const j of pending) {
    try {
      await fb.fs.addDoc(fb.fs.collection(fb.db, 'sites', site, 'runs'), j);
    } catch {
      writeJson(PENDING_RUNS_KEY, [...readJson<unknown[]>(PENDING_RUNS_KEY, []), j]);
    }
  }
}

// ---------- News ----------

function readNews(data: Record<string, unknown> | undefined): void {
  cloud.news = Array.isArray(data?.news) ? (data!.news as NewsItem[]).filter((n) => typeof n.id === 'number' && Array.isArray(n.items)) : [];
  newsReadAt = Date.now();
}

/** Relit les news si la dernière lecture date de plus de 10 minutes (appelé en ouvrant le hall). */
export function refreshNews(): void {
  if (!fb || !cloud.user || Date.now() - newsReadAt < NEWS_REFRESH_MS) return;
  newsReadAt = Date.now();
  void fb.fs.getDoc(fb.fs.doc(fb.db, 'sites', site, 'config', 'general')).then((d) => { readNews(d.data()); onChange(); }).catch(() => {});
}

export function shownNews(): NewsItem[] {
  return visibleNews(cloud.news, todayIso());
}

/** Le plus grand numéro de news déjà lu sur cet appareil. */
export function newsLastRead(): number {
  return readJson<number>(NEWS_KEY, 0);
}

export function newsUnread(): number {
  return unreadNews(cloud.news, readJson<number>(NEWS_KEY, 0), todayIso());
}

/** Toutes les news visibles sont lues (on retient le plus grand numéro sur cet appareil). */
export function markNewsRead(): void {
  const max = Math.max(0, ...shownNews().map((n) => n.id), readJson<number>(NEWS_KEY, 0));
  writeJson(NEWS_KEY, max);
}

// ---------- Bugs, idées et messages ----------

async function loadMessages(): Promise<void> {
  if (!fb || !cloud.user) return;
  const { fs, db } = fb;
  const snap = await fs.getDocs(fs.query(fs.collection(db, 'sites', site, 'messages'), fs.where('uid', '==', cloud.user.uid)));
  cloud.messages = snap.docs.map((d) => ({ ...(d.data() as MessageDoc), id: d.id })).sort((a, b) => b.dateMs - a.dateMs);
}

/** Les messages dont l'état ou la réponse a changé depuis la dernière visite. */
export function messagesUnread(): number {
  return cloud.messages.filter((m) => !m.vu).length;
}

/** « Mes messages » vient d'être ouvert : tout est vu. */
export function markMessagesSeen(): void {
  if (!fb) return;
  for (const m of cloud.messages.filter((x) => !x.vu)) {
    m.vu = true;
    void fb.fs.updateDoc(fb.fs.doc(fb.db, 'sites', site, 'messages', m.id), { vu: true }).catch(() => {});
  }
}

/** Envoie un bug, une idée ou un message. Renvoie l'erreur à afficher, ou null. */
export async function sendMessage(type: MessageType, texte: string, ecran: string, run: RunState | null): Promise<string | null> {
  const bad = messageError(texte);
  if (bad) return bad;
  if (!fb || !cloud.user) return 'Il faut être connecté pour envoyer un message.';
  const msg: MessageDoc = {
    uid: cloud.user.uid, pseudo: cloud.user.pseudo, type, texte: texte.trim(), etat: 'recu', reponse: null, vu: true, dateMs: Date.now(),
    version: VERSION.commit, appareil: deviceLabel(navigator.userAgent, window.innerWidth), ecran,
    run: type === 'bug' && run ? JSON.stringify(run) : null,
  };
  try {
    const ref = await fb.fs.addDoc(fb.fs.collection(fb.db, 'sites', site, 'messages'), msg);
    cloud.messages = [{ ...msg, id: ref.id }, ...cloud.messages];
    return null;
  } catch (e) {
    return authErrorText((e as { code?: string }).code ?? '');
  }
}
