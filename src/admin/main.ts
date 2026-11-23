// La page admin (maquette B : onglets en haut) : tableau de bord, joueurs, équilibrage, messages, news, modération.
// Réservée à l'organisateur. La vraie protection est dans firestore.rules (admin()) : cacher la page ne suffit pas.
// Tous les calculs sont faits ici, dans le navigateur (pas de serveur). Les calculs purs sont dans stats.ts.
import './admin.css';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { collection, connectFirestoreEmulator, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { MESSAGE_STATES, MESSAGE_TYPES, REPLY_MAX, authErrorText, pseudoError, pseudoToEmail, todayIso, type CloudDoc, type MessageDoc, type MessageState, type NewsItem } from '../cloud_logic';
import type { RunJournal } from '../journal';
import { CARDS } from '../engine/cards';
import { CLASSES, CLASS_BY_ID } from '../engine/classes';
import { classLevel } from '../engine/progression';
import { DAY_MS, LIMITE_ECRITURES, LIMITE_LECTURES, cardPickRates, dailyActivity, droppingOut, estimateUsage, stopsByEncounter, suspicious, usageLevel, winsByClass, winsByDifficulty, winsByTree, winsByVersion, type Rate } from './stats';

/** L'organisateur (même liste que admin() dans firestore.rules). */
const ADMIN_UIDS = ['PUomfoQPqgX5FYny6rz1Z2pVgry1'];
type Site = 'dev' | 'playtest' | 'main';
type Tab = 'tableau' | 'joueurs' | 'equilibrage' | 'messages' | 'news' | 'moderation';
const TABS: [Tab, string][] = [['tableau', '📊 Tableau de bord'], ['joueurs', '👥 Joueurs'], ['equilibrage', '⚖️ Équilibrage'], ['messages', '💡 Messages'], ['news', '📰 News'], ['moderation', '🛡️ Modération']];

interface Player extends CloudDoc { uid: string; remiseAZero?: boolean }
interface Data {
  players: Player[];
  runs: (RunJournal & { id: string })[];
  messages: (MessageDoc & { id: string })[];
  config: { saison?: number; news?: NewsItem[] };
  blocked: { uid: string; pseudo: string; depuisMs: number }[];
}

const CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

const root = document.getElementById('admin')!;
const esc = (t: unknown) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
const fmtDateHeure = (ms: number) => new Date(ms).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const className = (id: string) => CLASS_BY_ID[id]?.name ?? id;
const store = {
  get: (k: string) => { try { return localStorage.getItem(`wl-admin:${k}`); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(`wl-admin:${k}`, v); } catch { /* rien */ } },
};

const state = {
  user: null as User | null,
  ready: false,
  loginError: null as string | null,
  site: (['dev', 'main'].includes(store.get('site') ?? '') ? store.get('site') : 'playtest') as Site,
  tab: 'tableau' as Tab,
  days: 7,
  data: null as Data | null,
  loading: false,
  error: null as string | null,
  playerSel: null as string | null,
  classSel: 'guerrier',
  msgType: 'tous',
  msgState: 'tous',
  newsEdit: null as number | null,
  flash: null as string | null,
};

// ---------- Firebase ----------

const enabled = !!(CONFIG.apiKey && CONFIG.projectId);
const app = enabled ? initializeApp(CONFIG) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
if (app && import.meta.env.VITE_FIREBASE_EMULATOR) {
  connectAuthEmulator(auth!, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db!, '127.0.0.1', 8080);
}

/** Lectures faites par l'admin aujourd'hui (comptées exactement : elles entrent dans l'estimation). */
function countReads(n: number): void {
  const k = `lectures-${todayIso()}`;
  store.set(k, String(Number(store.get(k) ?? 0) + Math.max(1, n)));
}
const adminReadsToday = () => Number(store.get(`lectures-${todayIso()}`) ?? 0);

const col = (name: string) => collection(db!, 'sites', state.site, name);

async function load(): Promise<void> {
  state.loading = true;
  state.error = null;
  render();
  try {
    const since = Date.now() - state.days * DAY_MS;
    const [players, runs, messages, config, blocked] = await Promise.all([
      getDocs(col('joueurs')),
      getDocs(query(col('runs'), where('finMs', '>=', since))),
      getDocs(col('messages')),
      getDoc(doc(db!, 'sites', state.site, 'config', 'general')),
      getDocs(col('bloques')),
    ]);
    countReads(players.size + runs.size + messages.size + 1 + blocked.size);
    state.data = {
      players: players.docs.map((d) => ({ ...(d.data() as CloudDoc), uid: d.id })),
      runs: runs.docs.map((d) => ({ ...(d.data() as RunJournal), id: d.id })).sort((a, b) => b.finMs - a.finMs),
      messages: messages.docs.map((d) => ({ ...(d.data() as MessageDoc), id: d.id })).sort((a, b) => b.dateMs - a.dateMs),
      config: (config.data() ?? {}) as Data['config'],
      blocked: blocked.docs.map((d) => ({ uid: d.id, ...(d.data() as { pseudo: string; depuisMs: number }) })),
    };
  } catch (e) {
    state.error = `Lecture impossible : ${(e as { code?: string }).code ?? (e as Error).message}. As-tu bien collé firestore.rules dans la console ?`;
  }
  state.loading = false;
  render();
}

async function act(label: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
    state.flash = `✓ ${label}`;
  } catch (e) {
    state.flash = `✗ ${label} : ${(e as { code?: string }).code ?? (e as Error).message}`;
  }
  await load();
}

// ---------- Affichage ----------

function render(): void {
  if (!enabled) { root.innerHTML = '<main class="a-centre"><h1>Admin</h1><p>Pas de configuration Firebase dans cette version.</p></main>'; return; }
  if (!state.ready) { root.innerHTML = '<main class="a-centre"><p>Connexion…</p></main>'; return; }
  if (!state.user) { root.innerHTML = loginHtml(); return; }
  if (!ADMIN_UIDS.includes(state.user.uid)) {
    root.innerHTML = `<main class="a-centre"><h1>Accès réservé</h1><p>Ce compte n'est pas organisateur.</p><p>Ton identifiant (UID) : <code>${esc(state.user.uid)}</code></p><button class="a-bouton" data-act="deconnexion">Se déconnecter</button></main>`;
    return;
  }
  const d = state.data;
  const nouveaux = d ? d.messages.filter((m) => m.etat === 'recu').length : 0;
  root.innerHTML = `
    <header class="a-top"><h1>Wipe &amp; Loot · Admin</h1>
      <div class="a-site">${(['dev', 'playtest', 'main'] as Site[]).map((s) => `<button class="${s === state.site ? 'on' : ''}" data-act="site" data-v="${s}">${s}</button>`).join('')}</div>
      <button class="a-lien" data-act="deconnexion">Se déconnecter</button></header>
    <nav class="a-onglets">${TABS.map(([id, label]) => `<button class="${id === state.tab ? 'on' : ''}" data-act="onglet" data-v="${id}">${label}${id === 'messages' && nouveaux > 0 ? `<span class="a-badge">${nouveaux}</span>` : ''}</button>`).join('')}</nav>
    <main class="a-main">
      <div class="a-barre"><label>Période <select data-act="periode">${[1, 7, 14, 30, 90].map((n) => `<option value="${n}" ${n === state.days ? 'selected' : ''}>${n === 1 ? 'aujourd\'hui' : `${n} jours`}</option>`).join('')}</select></label>
        <button class="a-bouton" data-act="rafraichir">↻ Rafraîchir</button>${state.loading ? '<span class="a-note">Chargement…</span>' : ''}${state.flash ? `<span class="a-flash">${esc(state.flash)}</span>` : ''}</div>
      ${state.error ? `<p class="a-erreur">${esc(state.error)}</p>` : ''}
      ${d ? tabHtml(d) : ''}
    </main>`;
}

function loginHtml(): string {
  return `<main class="a-centre"><form class="a-carte a-login" data-form="login">
    <h1>Admin · Wipe &amp; Loot</h1>
    <label>Pseudo<input name="pseudo" autocomplete="username" autocapitalize="off"></label>
    <label>Mot de passe<input name="mdp" type="password" autocomplete="current-password"></label>
    ${state.loginError ? `<p class="a-erreur">${esc(state.loginError)}</p>` : ''}
    <button class="a-bouton plein" type="submit">Entrer</button>
  </form></main>`;
}

function tabHtml(d: Data): string {
  switch (state.tab) {
    case 'tableau': return dashboard(d);
    case 'joueurs': return state.playerSel ? playerSheet(d, state.playerSel) : playersTable(d);
    case 'equilibrage': return balance(d);
    case 'messages': return messagesTab(d);
    case 'news': return newsTab(d);
    case 'moderation': return moderation(d);
  }
}

const tile = (label: string, value: string, sub: string, cls = '') => `<div class="a-tuile"><small>${label}</small><b class="${cls}">${value}</b><small>${sub}</small></div>`;
const card = (title: string, body: string, extra = '') => `<section class="a-carte ${extra}"><h3>${title}</h3>${body}</section>`;
const bar = (pct: number) => `<div class="a-jauge"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;

function dashboard(d: Data): string {
  const today = todayIso();
  const days = dailyActivity(d.players, d.runs, 14);
  const todayStats = days[days.length - 1];
  const week = new Set([...d.players.filter((p) => Date.now() - p.majMs < 7 * DAY_MS).map((p) => p.uid), ...d.runs.filter((r) => Date.now() - r.finMs < 7 * DAY_MS).map((r) => r.uid)]);
  const drop = droppingOut(d.players);
  const use = estimateUsage(todayStats.players, todayStats.runs, adminReadsToday());
  const lr = usageLevel(use.reads, LIMITE_LECTURES);
  const lw = usageLevel(use.writes, LIMITE_ECRITURES);
  const max = Math.max(1, ...days.map((x) => x.players));
  const courbe = `<div class="a-courbe">${days.map((x) => `<div title="${x.day} : ${x.players} joueur(s), ${x.runs} run(s)"><i style="height:${(100 * x.players) / max}%"></i><span>${x.day === today ? 'auj.' : x.day.slice(8)}</span></div>`).join('')}</div>`;
  const recent = d.runs.slice(0, 10).map((r) => `<tr><td>${esc(r.pseudo)}</td><td>${className(r.classe)}</td><td>${r.victoire ? '<span class="a-pill v">Victoire</span>' : r.cause === 'Abandon' ? '<span class="a-pill">Abandon</span>' : `<span class="a-pill r">Chute · ${esc(r.cause ?? '?')}</span>`}</td><td>${fmtDateHeure(r.finMs)}</td><td><code>${esc(r.version)}</code></td></tr>`).join('');
  const stops = stopsByEncounter(d.runs).slice(0, 8);
  const smax = Math.max(1, ...stops.map((s) => s.count));
  const sus = suspicious(d.runs);
  return `<div class="a-tuiles">
      ${tile('Joueurs aujourd\'hui', String(todayStats.players), `${todayStats.runs} run${todayStats.runs > 1 ? 's' : ''} finie${todayStats.runs > 1 ? 's' : ''}`)}
      ${tile('Joueurs sur 7 jours', String(week.size), `${drop.length} décroche${drop.length > 1 ? 'nt' : ''} (absent${drop.length > 1 ? 's' : ''} 3 j ou plus)`)}
      ${tile('🔥 Lectures aujourd\'hui', `≈ ${use.reads.toLocaleString('fr-FR')} ${lr.sign}`, `${lr.pct} % de 50 000 · dont ${adminReadsToday()} par l'admin`, lr.level)}
      ${tile('🔥 Écritures aujourd\'hui', `≈ ${use.writes.toLocaleString('fr-FR')} ${lw.sign}`, `${lw.pct} % de 20 000`, lw.level)}
    </div>
    <p class="a-note">Consommation : estimation grossière ; les vrais chiffres sont dans la console Firebase, onglet Utilisation.</p>
    <div class="a-grille2">
      ${card('Joueurs actifs, jour par jour (14 jours)', courbe)}
      ${card('Dernières runs', recent ? `<div class="a-defile"><table><tr><th>Joueur</th><th>Classe</th><th>Résultat</th><th>Fin</th><th>Version</th></tr>${recent}</table></div>` : '<p class="a-note">Aucune run sur la période.</p>')}
    </div>
    ${card('Où les expéditions s\'arrêtent', stops.length ? `<table>${stops.map((s) => `<tr><td>${esc(s.cause)} <small>(chap. ${s.chapitre})</small></td><td>${s.count}</td><td class="a-large">${bar((100 * s.count) / smax)}</td></tr>`).join('')}</table>` : '<p class="a-note">Aucune défaite sur la période.</p>')}
    ${card('Joueurs qui décrochent', drop.length ? `<p>${drop.map((p) => `${esc(p.pseudo)} <small>(vu le ${fmtDate(p.majMs)})</small>`).join(' · ')}</p>` : '<p class="a-note">Personne.</p>')}
    ${card('Scores suspects', sus.length ? `<table>${sus.map((s) => `<tr><td>${esc(s.run.pseudo)}</td><td>${className(s.run.classe)}</td><td>${esc(s.why)}</td><td>${fmtDateHeure(s.run.finMs)}</td></tr>`).join('')}</table>` : '<p class="a-note">Rien de suspect.</p>')}`;
}

function playersTable(d: Data): string {
  const rows = [...d.players].sort((a, b) => b.majMs - a.majMs).map((p) => {
    const mine = d.runs.filter((r) => r.uid === p.uid);
    const wins = mine.filter((r) => r.victoire).length;
    const classes = new Map<string, number>();
    for (const r of mine) classes.set(r.classe, (classes.get(r.classe) ?? 0) + 1);
    const fav = [...classes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const blocked = d.blocked.some((b) => b.uid === p.uid);
    return `<tr class="a-clic" data-act="joueur" data-v="${esc(p.uid)}"><td>${esc(p.pseudo)}${blocked ? ' <span class="a-pill r">bloqué</span>' : ''}</td><td>${fmtDateHeure(p.majMs)}</td><td>${mine.length}</td><td>${wins}</td><td>${fav ? className(fav) : '—'}</td><td><code>${esc(p.version)}</code></td></tr>`;
  }).join('');
  return card(`Joueurs (${d.players.length})`, `<div class="a-defile"><table><tr><th>Pseudo</th><th>Dernière activité</th><th>Runs (période)</th><th>Victoires</th><th>Classe préférée</th><th>Version</th></tr>${rows}</table></div><p class="a-note">Touche un joueur pour voir sa fiche.</p>`);
}

function playerSheet(d: Data, uid: string): string {
  const p = d.players.find((x) => x.uid === uid);
  if (!p) return '<p>Joueur introuvable.</p><button class="a-bouton" data-act="joueur" data-v="">Retour</button>';
  let profile: Parameters<typeof classLevel>[0] & { stats?: { runs: number; wins: number } } | null = null;
  try { profile = p.profil ? JSON.parse(p.profil) : null; } catch { profile = null; }
  const mine = d.runs.filter((r) => r.uid === uid);
  const levels = profile ? CLASSES.filter((c) => profile!.classes?.[c.id]).map((c) => `<span class="a-pill">${c.name} niv. ${classLevel(profile!, c.id).level}</span>`).join(' ') : '<span class="a-note">Pas encore de profil.</span>';
  const best = mine.reduce((a, r) => Math.max(a, r.score), 0);
  const bestWin = mine.filter((r) => r.victoire).reduce((a, r) => Math.max(a, r.difficulte), -1);
  const perDay = dailyActivity([], mine, 14).map((x) => `<div title="${x.day} : ${x.runs} run(s)"><i style="height:${Math.min(100, x.runs * 20)}%"></i><span>${x.day.slice(8)}</span></div>`).join('');
  const blocked = d.blocked.some((b) => b.uid === uid);
  const others = d.players.filter((x) => x.uid !== uid);
  return `<button class="a-lien" data-act="joueur" data-v="">← Tous les joueurs</button>
    <div class="a-grille2">
      ${card(`👤 ${esc(p.pseudo)}`, `<p>Dernière activité : ${fmtDateHeure(p.majMs)} · version <code>${esc(p.version)}</code></p><p>${levels}</p>
        <p>Depuis toujours : ${profile?.stats?.runs ?? 0} expédition(s), ${profile?.stats?.wins ?? 0} victoire(s). Sur la période : ${mine.length} run(s), meilleur score ${best}${bestWin >= 0 ? `, meilleure victoire en difficulté ${bestWin}` : ''}.</p>
        <p class="a-note">UID : <code>${esc(uid)}</code></p>`)}
      ${card('Runs jour par jour (14 jours)', `<div class="a-courbe">${perDay}</div>`)}
    </div>
    ${card('Ses runs (période)', mine.length ? `<div class="a-defile"><table><tr><th>Fin</th><th>Classe</th><th>Arbre</th><th>Diff.</th><th>Résultat</th><th>Étapes</th><th>Durée</th><th>Score</th></tr>${mine.map((r) => `<tr><td>${fmtDateHeure(r.finMs)}</td><td>${className(r.classe)}</td><td>${esc(r.talents.length)} talents</td><td>${r.difficulte}</td><td>${r.victoire ? '<span class="a-pill v">Victoire</span>' : `<span class="a-pill r">${esc(r.cause ?? '?')}</span>`}</td><td>${r.etapes}</td><td>${r.dureeMin ?? '?'} min</td><td>${r.score}</td></tr>`).join('')}</table></div>` : '<p class="a-note">Aucune run sur la période.</p>')}
    ${card('🛡️ Actions', `<div class="a-actions">
      <button class="a-bouton" data-act="renommer" data-v="${esc(uid)}">Renommer</button>
      <button class="a-bouton danger" data-act="remise" data-v="${esc(uid)}">Remettre sa progression à zéro</button>
      <button class="a-bouton danger" data-act="${blocked ? 'debloquer' : 'bloquer'}" data-v="${esc(uid)}">${blocked ? 'Débloquer' : 'Bloquer'} ce compte</button></div>
      <p class="a-note">Mot de passe oublié : le joueur crée un nouveau compte, puis ici, sur la fiche du nouveau compte, « Récupérer la progression de » son ancien compte.</p>
      <div class="a-actions"><select data-role="source"><option value="">Récupérer la progression de…</option>${others.map((o) => `<option value="${esc(o.uid)}">${esc(o.pseudo)}</option>`).join('')}</select>
      <button class="a-bouton" data-act="transfert" data-v="${esc(uid)}">Récupérer</button></div>`)}`;
}

function rateTable(rows: Rate[], label: (k: string) => string): string {
  if (!rows.length) return '<p class="a-note">Pas encore de runs.</p>';
  return `<table><tr><th></th><th>Runs</th><th>Victoires</th><th class="a-large">Taux</th></tr>${rows.map((r) => `<tr><td>${esc(label(r.key))}</td><td>${r.runs}</td><td>${r.wins}</td><td>${r.pct} % ${bar(r.pct)}</td></tr>`).join('')}</table>`;
}

function balance(d: Data): string {
  const cls = state.classSel;
  const picks = cardPickRates(d.runs, cls);
  const chapters = [1, 2, 3].map((n) => ({ n, c: d.runs.filter((r) => !r.victoire && r.chapitre === n).length }));
  return `<div class="a-grille2">
      ${card('Taux de victoire par classe', rateTable(winsByClass(d.runs), className))}
      ${card('Par difficulté', rateTable(winsByDifficulty(d.runs), (k) => `Difficulté ${k}`))}
    </div>
    <div class="a-grille2">
      ${card('Par arbre principal', rateTable(winsByTree(d.runs), (k) => { const [c, t] = k.split(' · '); return `${className(c)} · ${t}`; }))}
      ${card('Par version du jeu', rateTable(winsByVersion(d.runs), (k) => k) + `<p class="a-note">Défaites par chapitre : ${chapters.map((x) => `chap. ${x.n} : ${x.c}`).join(' · ')}</p>`)}
    </div>
    ${card('Cartes les moins prises', `<label>Classe <select data-act="classe">${CLASSES.filter((c) => c.playable).map((c) => `<option value="${c.id}" ${c.id === cls ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
      ${picks.length ? `<p class="a-note">Part des runs de cette classe dont le paquet final contient la carte. En rouge : moins de 15 %.</p><div class="a-cartes">${picks.map((p) => `<span class="${p.pct < 15 ? 'rouge' : ''}">${esc(CARDS[p.id]?.name ?? p.id)} <b>${p.pct} %</b></span>`).join('')}</div>` : '<p class="a-note">Pas encore de runs avec cette classe.</p>'}`)}`;
}

function messagesTab(d: Data): string {
  const list = d.messages.filter((m) => (state.msgType === 'tous' || m.type === state.msgType) && (state.msgState === 'tous' || m.etat === state.msgState));
  const filters = `<div class="a-actions"><select data-act="filtre-type"><option value="tous">Tous les types</option>${Object.entries(MESSAGE_TYPES).map(([k, v]) => `<option value="${k}" ${k === state.msgType ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <select data-act="filtre-etat"><option value="tous">Tous les états</option>${Object.entries(MESSAGE_STATES).map(([k, v]) => `<option value="${k}" ${k === state.msgState ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`;
  const items = list.map((m) => `<section class="a-carte a-message ${m.etat === 'recu' ? 'nouveau' : ''}">
      <div class="a-entete"><b>${MESSAGE_TYPES[m.type]} · ${esc(m.pseudo)}</b><span>${fmtDateHeure(m.dateMs)} · <code>${esc(m.version)}</code> · ${esc(m.appareil)} · écran : ${esc(m.ecran)}</span></div>
      <p class="a-texte">${esc(m.texte)}</p>
      <div class="a-actions"><select data-act="etat" data-v="${esc(m.id)}">${Object.entries(MESSAGE_STATES).map(([k, v]) => `<option value="${k}" ${k === m.etat ? 'selected' : ''}>${v}</option>`).join('')}</select>
        ${m.run ? `<button class="a-bouton" data-act="copier-run" data-v="${esc(m.id)}">📋 Copier sa partie</button>` : ''}
        <button class="a-bouton danger" data-act="supprimer-msg" data-v="${esc(m.id)}">Supprimer</button></div>
      <textarea data-role="reponse-${esc(m.id)}" maxlength="${REPLY_MAX}" placeholder="Ta réponse (le joueur la verra dans « Mes messages »)">${esc(m.reponse ?? '')}</textarea>
      <button class="a-bouton" data-act="repondre" data-v="${esc(m.id)}">${m.reponse ? 'Modifier la réponse' : 'Répondre'}</button>
    </section>`).join('');
  return filters + (items || '<p class="a-note">Aucun message.</p>');
}

function newsTab(d: Data): string {
  const news = [...(d.config.news ?? [])].sort((a, b) => b.id - a.id);
  const editing = news.find((n) => n.id === state.newsEdit);
  const today = todayIso();
  return `${card(editing ? `Modifier la news n° ${editing.id}` : 'Nouvelle news', `<form class="a-form" data-form="news">
      <label>Visible à partir du <input type="date" name="date" value="${esc(editing?.date ?? today)}"></label>
      <label>Une nouveauté par ligne (textes courts, pas de surprise gâchée)<textarea name="items" rows="4">${esc(editing?.items.join('\n') ?? '')}</textarea></label>
      <div class="a-actions"><button class="a-bouton plein" type="submit">${editing ? 'Enregistrer' : 'Publier'}</button>${editing ? '<button class="a-lien" type="button" data-act="news-annuler">Annuler</button>' : ''}</div>
    </form>`)}
    ${card(`Les news (${news.length})`, news.length ? news.map((n) => `<div class="a-news"><div class="a-entete"><b>n° ${n.id} · ${n.date.split('-').reverse().join('/')}</b>${n.date > today ? '<span class="a-pill">programmée</span>' : ''}<span class="a-actions"><button class="a-lien" data-act="news-modifier" data-v="${n.id}">Modifier</button><button class="a-lien danger" data-act="news-supprimer" data-v="${n.id}">Supprimer</button></span></div><ul>${n.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('') : '<p class="a-note">Aucune news.</p>')}
    <p class="a-note">Les joueurs voient une pastille 📰 sur la roue du hall pour chaque news pas encore lue. Un nouveau joueur ne reçoit pas l'historique.</p>`;
}

function moderation(d: Data): string {
  const season = d.config.saison ?? 1;
  return `<div class="a-grille2">
    ${card('Comptes bloqués', d.blocked.length ? `<table>${d.blocked.map((b) => `<tr><td>${esc(b.pseudo)}</td><td>depuis le ${fmtDate(b.depuisMs)}</td><td><button class="a-bouton" data-act="debloquer" data-v="${esc(b.uid)}">Débloquer</button></td></tr>`).join('')}</table>` : '<p class="a-note">Aucun compte bloqué.</p>')}
    ${card('Mot de passe oublié', '<ol><li>Le joueur crée un nouveau compte (un autre pseudo).</li><li>Dans « Joueurs », ouvre la fiche du nouveau compte.</li><li>« Récupérer la progression de » son ancien pseudo, puis il recharge le jeu.</li><li>Si tu veux libérer l\'ancien pseudo : console Firebase → Authentication → supprimer l\'ancien compte.</li></ol>')}
    </div>
    ${card('Saison (en sommeil)', `<p>Saison actuelle : <b>${season}</b>. Changer de saison remet la progression de <b>tout le monde</b> à zéro sur ce site (${state.site}), avec le message « Nouvelle saison ! ».</p>
      <button class="a-bouton danger" data-act="saison">Commencer la saison ${season + 1}</button>`, 'a-sommeil')}`;
}

// ---------- Actions ----------

root.addEventListener('click', (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!el || el.tagName === 'SELECT') return;
  const v = el.dataset.v ?? '';
  const d = state.data;
  switch (el.dataset.act) {
    case 'deconnexion': void signOut(auth!); return;
    case 'site': state.site = v as Site; store.set('site', v); state.playerSel = null; void load(); return;
    case 'onglet': state.tab = v as Tab; state.playerSel = null; state.flash = null; render(); return;
    case 'rafraichir': state.flash = null; void load(); return;
    case 'joueur': state.playerSel = v || null; render(); return;
    case 'renommer': {
      const p = d?.players.find((x) => x.uid === v);
      const name = prompt('Nouveau pseudo affiché (le joueur se connecte toujours avec l\'ancien) :', p?.pseudo ?? '');
      if (!name) return;
      const bad = pseudoError(name);
      if (bad) { alert(bad); return; }
      void act('Pseudo changé', () => updateDoc(doc(db!, 'sites', state.site, 'joueurs', v), { pseudo: name.trim() }));
      return;
    }
    case 'remise':
      if (!confirm('Remettre sa progression à zéro ? Ses niveaux, talents et son coffre seront effacés à sa prochaine connexion. On ne peut pas annuler.')) return;
      void act('Progression remise à zéro', () => updateDoc(doc(db!, 'sites', state.site, 'joueurs', v), { remiseAZero: true, profil: null, run: null }));
      return;
    case 'bloquer': {
      const p = d?.players.find((x) => x.uid === v);
      if (!confirm(`Bloquer ${p?.pseudo ?? 'ce compte'} ? Il sera déconnecté à sa prochaine ouverture et ne pourra plus rien envoyer.`)) return;
      void act('Compte bloqué', () => setDoc(doc(db!, 'sites', state.site, 'bloques', v), { pseudo: p?.pseudo ?? '?', depuisMs: Date.now() }));
      return;
    }
    case 'debloquer': void act('Compte débloqué', () => deleteDoc(doc(db!, 'sites', state.site, 'bloques', v))); return;
    case 'transfert': {
      const src = root.querySelector<HTMLSelectElement>('[data-role="source"]')?.value;
      const from = d?.players.find((x) => x.uid === src);
      if (!from) { alert('Choisis d\'abord l\'ancien compte.'); return; }
      if (!confirm(`Copier la progression de ${from.pseudo} dans ce compte ? Sa progression actuelle sera remplacée. Le joueur devra recharger le jeu.`)) return;
      void act('Progression récupérée', () => updateDoc(doc(db!, 'sites', state.site, 'joueurs', v), { profil: from.profil, run: from.run, majMs: Date.now() }));
      return;
    }
    case 'copier-run': {
      const m = d?.messages.find((x) => x.id === v);
      if (m?.run) void navigator.clipboard.writeText(m.run).then(() => { state.flash = '✓ Partie copiée : colle-la dans un fichier pour la rejouer (ETAT=fichier.json npm run e2e).'; render(); });
      return;
    }
    case 'supprimer-msg':
      if (!confirm('Supprimer ce message ? On ne peut pas annuler.')) return;
      void act('Message supprimé', () => deleteDoc(doc(db!, 'sites', state.site, 'messages', v)));
      return;
    case 'repondre': {
      const text = root.querySelector<HTMLTextAreaElement>(`[data-role="reponse-${CSS.escape(v)}"]`)?.value.trim() ?? '';
      const m = d?.messages.find((x) => x.id === v);
      void act('Réponse envoyée', () => updateDoc(doc(db!, 'sites', state.site, 'messages', v), { reponse: text || null, vu: false, etat: m?.etat === 'recu' ? 'lu' : m?.etat ?? 'lu' }));
      return;
    }
    case 'news-modifier': state.newsEdit = Number(v); render(); return;
    case 'news-annuler': state.newsEdit = null; render(); return;
    case 'news-supprimer': {
      if (!confirm('Supprimer cette news ?')) return;
      const news = (d?.config.news ?? []).filter((n) => n.id !== Number(v));
      void act('News supprimée', () => setDoc(doc(db!, 'sites', state.site, 'config', 'general'), { news }, { merge: true }));
      return;
    }
    case 'saison': {
      const next = (d?.config.saison ?? 1) + 1;
      if (!confirm(`Commencer la saison ${next} ? TOUS les joueurs de ${state.site} repartiront de zéro.`)) return;
      if (prompt(`Pour confirmer, écris : saison ${next}`) !== `saison ${next}`) return;
      void act(`Saison ${next} commencée`, () => setDoc(doc(db!, 'sites', state.site, 'config', 'general'), { saison: next }, { merge: true }));
      return;
    }
  }
});

root.addEventListener('change', (ev) => {
  const el = ev.target as HTMLSelectElement;
  switch (el.dataset.act) {
    case 'periode': state.days = Number(el.value); void load(); return;
    case 'classe': state.classSel = el.value; render(); return;
    case 'filtre-type': state.msgType = el.value; render(); return;
    case 'filtre-etat': state.msgState = el.value; render(); return;
    case 'etat': void act('État changé', () => updateDoc(doc(db!, 'sites', state.site, 'messages', el.dataset.v!), { etat: el.value as MessageState, vu: false })); return;
  }
});

root.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const form = ev.target as HTMLFormElement;
  const f = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement).value;
  if (form.dataset.form === 'login') {
    state.loginError = null;
    signInWithEmailAndPassword(auth!, pseudoToEmail(f('pseudo')), f('mdp')).catch((e) => { state.loginError = authErrorText(e.code ?? ''); render(); });
    return;
  }
  if (form.dataset.form === 'news') {
    const items = f('items').split('\n').map((x) => x.trim()).filter(Boolean);
    if (!items.length) { alert('Écris au moins une ligne.'); return; }
    const all = [...(state.data?.config.news ?? [])];
    const date = f('date') || todayIso();
    if (state.newsEdit !== null) {
      const i = all.findIndex((n) => n.id === state.newsEdit);
      if (i >= 0) all[i] = { ...all[i], date, items };
    } else {
      all.push({ id: Math.max(0, ...all.map((n) => n.id)) + 1, date, items });
    }
    state.newsEdit = null;
    void act('News enregistrée', () => setDoc(doc(db!, 'sites', state.site, 'config', 'general'), { news: all }, { merge: true }));
  }
});

if (auth) {
  onAuthStateChanged(auth, (user) => {
    state.user = user;
    state.ready = true;
    render();
    if (user && ADMIN_UIDS.includes(user.uid)) void load();
  });
}
render();
