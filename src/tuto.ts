// Le tutoriel : la visite du hall (lancée toute seule la première fois) et le tuto du combat (bouton « ? »).
// Chaque bulle montre un élément de l'écran (le reste est assombri) ; rien n'est forcé, on lit et on avance.
// Les bulles de chaque classe servent aussi d'encart « Comment ça se joue » dans la fiche de classe.

import type { Profile } from './engine/save';

export interface TutoStep {
  /** Les éléments à montrer, du plus précis au plus large : le premier trouvé à l'écran est éclairé. */
  cible?: string[];
  /** Éclairer la ligne entière qui contient l'élément (une jauge avec son nom). */
  ligne?: boolean;
  /** Le texte ; **mot** est mis en or. */
  texte: string;
  /** L'illustration d'une carte de la classe (carte_<id>.png), pour la fiche de classe. */
  icone?: string;
}

/** La visite du hall : 6 bulles. */
export const HALL_STEPS: TutoStep[] = [
  { cible: ['.hall-heros > img', '.hall-heros'], texte: 'Bienvenue dans le **hall de la guilde** ! Voici ton héros. Chaque expédition lui rapporte de l\'expérience, gagnée ou non.' },
  { cible: ['[data-action="talents"]'], texte: '**Talents** : à chaque niveau, tu gagnes un point de talent. Dépense-les ici avant de partir : 3 arbres par classe, et tu peux tout redistribuer gratuitement.' },
  { cible: ['[data-action="classes"]'], texte: 'Les autres **classes** se débloquent en montant de niveau : au niveau 2, une 2e classe ; au niveau 3, une 3e…' },
  { cible: ['.choix-difficulte'], texte: 'Gagne une expédition pour débloquer la **difficulté** suivante. Plus c\'est dur, plus le score monte.' },
  { cible: ['.hall-coffre'], texte: 'Après une victoire, mets un objet à l\'abri dans le **coffre** : tu pourras l\'emporter la fois suivante. Les **Archives** gardent tout ce que tu as découvert.' },
  { cible: ['.hall-expedition [data-action="nouvelle"]', '[data-action="nouvelle"]'], texte: '3 chapitres de 10 étapes, un seigneur au bout de chacun. Pendant les combats, touche **?** en haut pour te faire expliquer l\'écran. Bonne chasse !' },
];

/** Le tuto du combat, partie commune : 10 bulles. */
export const COMBAT_STEPS: TutoStep[] = [
  { cible: ['.ennemis'], texte: 'Le but : faire tomber les **PV** de tous les ennemis à 0 avant de tomber toi-même.' },
  { cible: ['.jauges > .ligne'], texte: 'Tes **PV**. Le bouclier, c\'est ton **blocage** : il absorbe les coups jusqu\'à ton prochain tour, puis disparaît.' },
  { cible: ['.energie'], texte: 'Ton **énergie** : 3 par tour. Le chiffre orange en haut d\'une carte, c\'est son coût.' },
  { cible: ['.main'], texte: 'Ta **main** : 5 nouvelles cartes à chaque tour. Touche une carte pour la jouer. Appui long (survol sur PC) : sa description, sans la jouer.' },
  { cible: ['.ennemi .intention', '.ennemis'], texte: 'Ce que l\'ennemi fera **à la fin de ton tour**. Le chiffre rouge : ses dégâts. Prévois assez de blocage.' },
  { cible: ['.barre-sorts'], texte: 'Tes **sorts** : toujours disponibles, sans passer par ta main. Après usage, ils se rechargent pendant quelques tours.' },
  { cible: ['.piles'], texte: 'Quand ta **pioche** est vide, ta **défausse** est mélangée pour la remplir. Touche-les pour voir les cartes.' },
  { cible: ['.topbar .potions'], texte: 'Tes **potions** : 3 places, à boire sans dépenser d\'énergie.' },
  { cible: ['.topbar .pips'], texte: 'Si tu tombes, c\'est une **chute** : tu te relèves et recommences le combat. 3 **relèves** par expédition, mais chacune coûte une réparation.' },
  { cible: ['.fin-tour'], texte: 'Quand tu as fini, touche **Fin du tour** : les ennemis agissent, puis tu repioches.' },
];

/** La dernière bulle du tuto du combat. */
export const COMBAT_END: TutoStep = { cible: ['.topbar [data-action="tuto"]'], texte: 'C\'est tout ! Le **?** reste là si tu veux revoir.' };

/** Le tuto du combat, partie de chaque classe : 3 ou 4 bulles (et l'encart « Comment ça se joue » de la fiche). */
export const CLASS_STEPS: Record<string, TutoStep[]> = {
  guerrier: [
    { cible: ['.jauges .rage'], ligne: true, icone: 'cri_de_guerre', texte: 'Ta **rage**, de 0 à 10 : +1 quand tu joues une Attaque ou que tu perds des PV. Elle repart à 0 à chaque combat.' },
    { cible: ['.main .carte:has(.cout-rage)', '.main'], icone: 'frappe_heroique', texte: 'Certaines cartes coûtent aussi de la **rage** (le chiffre rouge). Les plus fortes en demandent beaucoup.' },
    { cible: ['.postures'], icone: 'coup_de_bouclier', texte: '**Combat** : +3 dégâts aux cartes à rage. **Berserker** : plus de rage, mais tu prends plus cher. **Défensive** : plus de blocage, moins de dégâts.' },
    { cible: ['.postures'], icone: 'concentration_martiale', texte: 'Changer de **posture** est gratuit, une fois par tour. Mais ta rage redescend alors à 3.' },
  ],
  mage: [
    { cible: ['.ennemis'], icone: 'boule_de_feu', texte: '**Brûlure** : la cible perd des PV à chaque tour, un peu moins à chaque fois.' },
    { cible: ['.ennemis'], icone: 'eclair_de_givre', texte: '**Gel** : au seuil indiqué, l\'ennemi est Gelé et perd son tour. **Fracasser** double ses dégâts sur une cible bien gelée.' },
    { cible: ['.jauges .charges', '.jauges'], ligne: true, icone: 'explosion_des_arcanes', texte: '**Charges arcaniques** : chacune renforce tes Sorts arcaniques. À 4, attention à la **Surcharge**, qui te coûte des PV. Leur jauge apparaît dès que ton paquet en donne.' },
    { cible: ['.barre-sorts'], icone: 'barriere_de_glace', texte: 'Tu as peu de PV : lis les intentions et garde **Carapace de glace** pour le gros coup.' },
  ],
  paladin: [
    { cible: ['.pal-tuile:not(.aura)', '.pal-tuiles'], icone: 'sceau_croise', texte: 'Un **Sceau** à la fois : un nouveau remplace l\'ancien. Rejoue un Sceau déjà actif : il est jugé.' },
    { cible: ['.pal-jugement', '.barre-sorts'], icone: 'verdict_cieux', texte: 'Le sort **Jugement** consomme ton Sceau pour déclencher son effet. Pose, juge, recommence.' },
    { cible: ['.pal-tuile.aura', '.pal-tuiles'], icone: 'aura_devotion', texte: 'Les **Auras** sont des pouvoirs qui durent tout le combat. Une seule à la fois.' },
  ],
  voleur: [
    { cible: ['.jauges .combo'], ligne: true, icone: 'evisceration', texte: 'Tes Attaques donnent des **points de combo**, jusqu\'à 5. Les **coups finaux** les dépensent tous : plus tu en as, plus ils frappent fort.' },
    { cible: ['.jauges .aide-posture', '.jauges'], icone: 'embuscade', texte: 'Tu commences chaque combat **Camouflé** : c\'est le moment de jouer une **Ouverture**, très forte. Une autre Attaque te fait sortir de l\'ombre.' },
    { cible: ['.heros .buffs', '.heros'], icone: 'poison_mortel', texte: 'Un **Poison d\'arme** s\'applique à toutes tes Attaques jusqu\'à la fin du combat. Un seul à la fois.' },
  ],
  chasseur: [
    { cible: ['.familier.compagnon', '.chs-tuiles'], icone: 'ordre_attaque', texte: 'Ton **compagnon** agit seul à la fin de chacun de tes tours, sur ta dernière cible. Il ne peut pas mourir. Les cartes **Ordre** le font agir tout de suite.' },
    { cible: ['.ennemis'], icone: 'marque_proie', texte: '**Marque** une cible : tes Attaques et ton compagnon lui font plus mal. Une seule à la fois.' },
    { cible: ['.ennemi .pieges', '.ennemi .ordre', '.ennemi'], icone: 'piege_givrant', texte: 'Les **Pièges** se posent sur un ennemi (un seul de chaque type) et partent quand il agit. Le numéro dit qui agit en premier.' },
    { cible: ['.chs-tuiles .chs-tuile:nth-child(2)', '.chs-tuiles'], icone: 'esprit_aigle', texte: 'Un **Esprit** animal te renforce tout le combat. Un seul à la fois.' },
  ],
  pretre: [
    { cible: ['.barre-egide'], ligne: true, icone: 'egide_renforcee', texte: 'L\'**Égide** est un bouclier qui reste d\'un tour à l\'autre, jusqu\'à 30. Les soins en trop deviennent de l\'Égide.' },
    { cible: ['.jauges .foi'], ligne: true, icone: 'courroux_celeste', texte: '**Foi**, de 0 à 10 : +1 à chaque soin ou Égide. Certaines cartes la dépensent pour frapper fort.' },
    { cible: ['.main'], icone: 'soins_rapides', texte: 'Soigne-toi et protège-toi tôt : ta puissance vient de là.' },
  ],
  demoniste: [
    { cible: ['.heros .familier', '.heros'], icone: 'invocation_succube', texte: 'Ton **familier** démoniaque agit seul à la fin de chacun de tes tours. Certaines cartes en invoquent un plus fort.' },
    { cible: ['.ennemis'], icone: 'corruption', texte: 'Tes **DoT** et **Malédictions** blessent à chaque tour. Une seule de tes Malédictions par ennemi.' },
    { cible: ['.jauges .eclats'], ligne: true, icone: 'siphon_ame', texte: 'Un ennemi qui meurt avec un de tes DoT ou une Malédiction te donne un **éclat d\'âme**. Les éclats restent d\'un combat à l\'autre (5 au plus).' },
    { cible: ['.main'], icone: 'pacte_noir', texte: 'Certaines cartes coûtent des **PV** : ta vie est aussi une ressource.' },
  ],
  chaman: [
    { cible: ['.chs-tuiles'], icone: 'totem_pierre', texte: '4 emplacements de **totem** : Terre, Feu, Eau, Air. Un totem agit au début de chacun de tes tours, jusqu\'à la fin du combat.' },
    { cible: ['.main'], icone: 'eclair', texte: '**Résonance** : un effet en plus si tu as le bon totem en jeu.' },
    { cible: ['.chs-tuiles .chs-tuile:last-child', '.chs-tuiles'], icone: 'arme_flammes', texte: 'Une **Arme élémentaire** renforce tes coups tout le combat. Une seule à la fois.' },
    { cible: ['.jauges > .ligne'], icone: 'vigueur_ancestrale', texte: 'Une fois par expédition, au lieu de tomber, tu te **réincarnes** avec 40 % de tes PV.' },
  ],
  druide: [
    { cible: ['.formes'], icone: 'instinct_sauvage', texte: 'Change de **forme** : 1 énergie, le premier changement du combat est gratuit.' },
    { cible: ['.formes'], icone: 'coup_de_griffe', texte: '**Ours** : robuste, gagne de la rage. **Félin** : Attaques plus fortes et points de combo. **Astrale** : Sorts plus forts.' },
    { cible: ['.main'], icone: 'griffure', texte: 'Une carte Ours, Félin ou Astrale coûte **1 de plus** hors de sa forme.' },
    { cible: ['.jauges .rage', '.formes'], ligne: true, icone: 'coeur_sauvage', texte: 'Quitter une forme fait perdre sa **rage** ou son **combo**.' },
  ],
};

/** **mot** → mot en or (les textes sont écrits ici, donc sûrs pour le HTML). */
export function tutoMarkup(texte: string): string {
  return texte.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}

// ---------- L'état du tuto en cours ----------

export interface TutoState {
  kind: 'hall' | 'combat';
  steps: TutoStep[];
  index: number;
  /** La classe du tuto de combat. */
  cls?: string;
  /** Seulement la partie de la classe (une nouvelle classe, la partie commune déjà vue). */
  partial?: boolean;
}

let state: TutoState | null = null;

export const tutoActive = (): TutoState | null => state;
export const tutoStop = (): void => { state = null; };

export function tutoProfile(profile: Profile): NonNullable<Profile['tuto']> {
  profile.tuto ??= {};
  return profile.tuto;
}

/** La classe a-t-elle déjà fini son tuto du combat (« Compris ») ? Sinon, le « ? » brille. */
export function combatTutoDone(profile: Profile, cls: string): boolean {
  return !!profile.tuto?.classes?.includes(cls);
}

export function startHallTuto(): void {
  state = { kind: 'hall', steps: HALL_STEPS, index: 0 };
}

/** Le tuto du combat : tout, ou seulement la partie de la classe si la partie commune a déjà été vue avec une autre classe. */
export function startCombatTuto(profile: Profile, cls: string, full = false): void {
  const seen = profile.tuto?.classes ?? [];
  const partial = !full && seen.length > 0 && !seen.includes(cls);
  const own = CLASS_STEPS[cls] ?? [];
  state = { kind: 'combat', cls, partial, index: 0, steps: [...(partial ? [] : COMBAT_STEPS), ...own, COMBAT_END] };
}

/** Avance (ou recule) d'une bulle. Renvoie vrai quand le tuto est fini (« Compris »). */
export function tutoMove(delta: 1 | -1): boolean {
  if (!state) return false;
  const next = state.index + delta;
  if (next >= state.steps.length) return true;
  state.index = Math.max(0, next);
  return false;
}

/** Note dans le profil que le tuto en cours est fini (« Compris ») ou passé. */
export function tutoFinish(profile: Profile, understood: boolean): void {
  if (!state) return;
  const t = tutoProfile(profile);
  if (state.kind === 'hall') t.hall = true;
  else if (understood && state.cls) {
    t.classes = [...new Set([...(t.classes ?? []), state.cls])];
  }
  state = null;
}

// ---------- L'affichage ----------

/** Le voile, le trou de lumière et la bulle (placés ensuite par placeTuto). */
export function tutoHtml(): string {
  if (!state) return '';
  const s = state.steps[state.index];
  const n = state.steps.length;
  const last = state.index === n - 1;
  const title = state.kind === 'hall' ? 'Visite du hall' : state.partial ? 'Ta classe' : 'Le combat';
  return `<div class="tuto-voile" role="dialog" aria-modal="true" aria-label="Tutoriel">
    <div class="tuto-trou"></div>
    <div class="tuto-bulle">
      <div class="tuto-titre">${title} · ${state.index + 1} / ${n}</div>
      <p>${tutoMarkup(s.texte)}</p>
      <div class="tuto-boutons">
        <button type="button" class="gros-bouton" data-action="tuto-suivant">${last ? 'Compris' : 'Suivant'}</button>
        ${state.index > 0 ? '<button type="button" class="lien" data-action="tuto-retour">◂ Retour</button>' : ''}
        ${state.partial && state.index === 0 ? '<button type="button" class="lien" data-action="tuto-tout">Tout revoir</button>' : ''}
        ${last ? '' : '<button type="button" class="lien tuto-passer" data-action="tuto-passer">Passer</button>'}
      </div>
    </div>
  </div>`;
}

/** La mini-bulle qui pointe le « ? » du combat, tant qu'elle n'a pas été vue pour cette classe. */
export function miniHtml(profile: Profile, cls: string): string {
  if (state || combatTutoDone(profile, cls) || profile.tuto?.mini?.includes(cls)) return '';
  const other = (profile.tuto?.classes ?? []).length > 0;
  return `<div class="tuto-mini">${other
    ? '<b>Nouvelle classe !</b> Touche <b>?</b> pour découvrir ses mécaniques.'
    : '<b>Besoin d\'aide ?</b> Touche <b>?</b> pour découvrir le combat et ta classe.'}</div>`;
}

/** Note que la mini-bulle a été vue (elle se ferme au premier toucher). Renvoie vrai si elle était affichée. */
export function closeMini(profile: Profile, cls: string): boolean {
  if (combatTutoDone(profile, cls)) return false;
  const t = tutoProfile(profile);
  if (t.mini?.includes(cls)) return false;
  t.mini = [...(t.mini ?? []), cls];
  return true;
}

/** Le premier élément visible d'une liste de sélecteurs. */
function findTarget(stage: HTMLElement, step: TutoStep): HTMLElement | null {
  for (const sel of step.cible ?? []) {
    let el: HTMLElement | null = null;
    try { el = stage.querySelector<HTMLElement>(sel); } catch { el = null; } // :has() absent d'un vieux navigateur
    if (el && step.ligne) el = el.closest<HTMLElement>('.ligne') ?? el;
    if (el && el.getClientRects().length > 0) return el;
  }
  return null;
}

/** Place le trou de lumière sur l'élément montré, et la bulle à côté (dans la zone de jeu de 1280 × 720). */
export function placeTuto(stage: HTMLElement): void {
  const mini = stage.querySelector<HTMLElement>('.tuto-mini');
  const box = stage.getBoundingClientRect();
  const scale = box.width / stage.offsetWidth || 1;
  const rel = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { x: (r.left - box.left) / scale, y: (r.top - box.top) / scale, w: r.width / scale, h: r.height / scale };
  };
  if (mini) {
    const q = stage.querySelector<HTMLElement>('.topbar [data-action="tuto"]');
    if (q) {
      const r = rel(q);
      mini.style.top = `${r.y + r.h + 12}px`;
      mini.style.left = `${Math.min(1280 - mini.offsetWidth - 8, r.x + r.w / 2 - mini.offsetWidth + 28)}px`;
      mini.style.setProperty('--fleche', `${r.x + r.w / 2 - parseFloat(mini.style.left)}px`);
    }
  }
  if (!state) return;
  const hole = stage.querySelector<HTMLElement>('.tuto-trou');
  const bubble = stage.querySelector<HTMLElement>('.tuto-bulle');
  const veil = stage.querySelector<HTMLElement>('.tuto-voile');
  if (!hole || !bubble || !veil) return;
  const target = findTarget(stage, state.steps[state.index]);
  const W = 1280, H = 720, M = 12;
  const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
  if (!target) {
    veil.classList.add('sans-cible');
    bubble.style.left = `${(W - bw) / 2}px`;
    bubble.style.top = `${(H - bh) / 2}px`;
    return;
  }
  veil.classList.remove('sans-cible');
  const pad = 6;
  const r = rel(target);
  const t = { x: Math.max(2, r.x - pad), y: Math.max(2, r.y - pad), w: r.w + pad * 2, h: r.h + pad * 2 };
  t.w = Math.min(t.w, W - 2 - t.x);
  t.h = Math.min(t.h, H - 2 - t.y);
  Object.assign(hole.style, { left: `${t.x}px`, top: `${t.y}px`, width: `${t.w}px`, height: `${t.h}px` });
  // La bulle : en dessous, au-dessus, à droite ou à gauche, là où elle tient le mieux.
  const clampX = (x: number) => Math.max(M, Math.min(W - bw - M, x));
  const clampY = (y: number) => Math.max(M, Math.min(H - bh - M, y));
  const cx = clampX(t.x + t.w / 2 - bw / 2);
  const cy = clampY(t.y + t.h / 2 - bh / 2);
  const options = [
    { ok: t.y + t.h + M + bh <= H - M, x: cx, y: t.y + t.h + M },
    { ok: t.y - M - bh >= M, x: cx, y: t.y - M - bh },
    { ok: t.x + t.w + M + bw <= W - M, x: t.x + t.w + M, y: cy },
    { ok: t.x - M - bw >= M, x: t.x - M - bw, y: cy },
  ];
  const pick = options.find((o) => o.ok) ?? { x: clampX(cx), y: M };
  bubble.style.left = `${pick.x}px`;
  bubble.style.top = `${pick.y}px`;
}

/** L'encart « Comment ça se joue » de la fiche de classe : les mêmes textes que les bulles de la classe. */
export function howToPlayHtml(cls: string, img: (file: string) => string): string {
  const steps = CLASS_STEPS[cls];
  if (!steps) return '';
  return `<div class="comment-jouer">
    <b class="comment-jouer-titre">Comment ça se joue</b>
    ${steps.map((s) => `<div class="comment-jouer-ligne">${s.icone ? `<img class="px" src="${img(`carte_${s.icone}.png`)}" alt="">` : ''}<span>${tutoMarkup(s.texte)}</span></div>`).join('')}
  </div>`;
}
