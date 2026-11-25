// Les aides en combat et sur les cartes :
// - les infobulles des mots-clés : appui long (téléphone) ou survol (PC) sur un mot souligné ou une pastille ;
//   l'appui long sur une carte explique tous ses mots-clés, sans la jouer ;
// - l'aperçu des dégâts sur les ennemis : survol d'une carte (PC) ou carte choisie (téléphone).
import { cardNeedsTarget } from './engine/combat';
import { previewCard, type EnemyPreview } from './engine/preview';
import type { CombatState } from './engine/types';
import { keywordByName, keywordOfLabel, keywordsIn } from './keywords';

const LONG_PRESS_MS = 420;
const MOVE_TOLERANCE = 12;

let stage: HTMLElement;
let getCombat: () => CombatState | null | undefined;
let selectedCard: () => number | null;

let bubble: HTMLElement | null = null;
let pressTimer: number | undefined;
let pressStart: { x: number; y: number } | null = null;
let swallowClick = false;
let previewIndex: number | null = null;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Le contenu de la bulle d'un élément (mot souligné, pastille ou carte), ou null s'il n'y a rien à expliquer. */
function bubbleContent(el: HTMLElement, reasonOnly = false): string | null {
  if (reasonOnly) return el.dataset.raison ? `<b>Injouable</b>${esc(el.dataset.raison)}` : null;
  if (el.classList.contains('mot')) {
    const k = keywordByName(el.dataset.mot ?? '');
    return k ? `<b>${esc(k.name)}</b>${esc(k.text)}` : null;
  }
  if (el.classList.contains('chip') || el.classList.contains('aide')) {
    // L'aide propre à la pastille (title) passe avant la définition générale ; on retire le title
    // pour que le navigateur n'affiche pas sa propre bulle par-dessus.
    if (el.title) {
      el.dataset.aide = el.title;
      el.removeAttribute('title');
    }
    const label = el.dataset.titre ?? el.textContent?.trim() ?? '';
    const k = keywordOfLabel(label);
    const text = el.dataset.aide ?? k?.text;
    return text ? `<b>${esc(label)}</b>${esc(text)}` : null;
  }
  if (el.classList.contains('carte')) {
    // Une carte grisée : d'abord pourquoi elle ne se joue pas.
    const why = el.dataset.raison ? `<b>Injouable</b>${esc(el.dataset.raison)}` : '';
    // Le bandeau compte aussi (« Finisher », « Sceau »…), et il dit si la carte est une Attaque, une Compétence…
    const type = el.querySelector<HTMLElement>('.type');
    const label = type?.textContent?.trim() ?? '';
    const text = `${label} ${el.querySelector('.texte')?.textContent ?? ''}`;
    const kind = type?.dataset.type;
    if (kind) {
      const k = keywordByName(label);
      const ks = keywordsIn(text).filter((x) => x !== k);
      const head = `<b>${esc(label)} (${esc(kind)})</b>${esc(k?.text ?? '')}`;
      return [why, head, ...ks.map((x) => `<b>${esc(x.name)}</b>${esc(x.text)}`)].filter(Boolean).join('<hr>');
    }
    const ks = keywordsIn(text);
    const parts = [why, ...ks.map((k) => `<b>${esc(k.name)}</b>${esc(k.text)}`)].filter(Boolean);
    return parts.length ? parts.join('<hr>') : null;
  }
  return null;
}

function showBubble(el: HTMLElement, reasonOnly = false): boolean {
  hideBubble();
  const html = bubbleContent(el, reasonOnly);
  if (!html) return false;
  bubble = document.createElement('div');
  bubble.className = 'bulle';
  bubble.setAttribute('role', 'tooltip');
  bubble.innerHTML = html;
  stage.appendChild(bubble);
  // Coordonnées dans la zone de jeu (1280 × 720, agrandie ou réduite par fit()).
  const s = stage.getBoundingClientRect();
  const k = s.width / stage.offsetWidth || 1;
  const r = el.getBoundingClientRect();
  const left = (r.left - s.left) / k;
  const top = (r.top - s.top) / k;
  const w = r.width / k;
  const h = r.height / k;
  const bw = bubble.offsetWidth;
  const bh = bubble.offsetHeight;
  const x = Math.max(8, Math.min(1280 - bw - 8, left + w / 2 - bw / 2));
  const above = top - bh - 10 >= 8;
  const y = above ? top - bh - 10 : Math.min(720 - bh - 8, top + h + 10);
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  bubble.classList.add(above ? 'dessus' : 'dessous');
  bubble.style.setProperty('--fleche', `${Math.max(14, Math.min(bw - 14, left + w / 2 - x))}px`);
  return true;
}

function hideBubble(): void {
  bubble?.remove();
  bubble = null;
}

const TARGETS = '.mot, .chip, .aide, .carte';

function cancelPress(): void {
  window.clearTimeout(pressTimer);
  pressTimer = undefined;
  pressStart = null;
}

// ---------- Aperçu des dégâts ----------

function clearPreview(): void {
  for (const el of stage.querySelectorAll('.apercu')) el.remove();
  for (const el of stage.querySelectorAll<HTMLElement>('.ennemi .barre-pv span[data-pv]')) {
    el.textContent = el.dataset.pv!;
    delete el.dataset.pv;
  }
}

/** Ce que la carte `index` ferait à chaque ennemi (une entrée par ennemi touché). */
function previewFor(c: CombatState, index: number): EnemyPreview[] {
  const card = c.hand[index];
  if (!card) return [];
  if (!cardNeedsTarget(c, card.id)) return previewCard(c, index)?.enemies ?? [];
  // Une carte à cible : chaque ennemi montre ce que la carte lui ferait s'il était visé.
  const out: EnemyPreview[] = [];
  for (const e of c.enemies) {
    if (e.dead || e.submerged) continue;
    const p = previewCard(c, index, e.uid)?.enemies.find((x) => x.uid === e.uid);
    if (p) out.push(p);
  }
  return out;
}

/** Affiche sur les ennemis l'effet de la carte `index` de la main (null : rien). */
/** Un toucher sur une carte grisée : la bulle dit pourquoi, quelques secondes. */
export function explainCard(el: HTMLElement): void {
  if (!el.dataset.raison) return;
  if (showBubble(el, true)) {
    const mine = bubble;
    window.setTimeout(() => { if (bubble === mine) hideBubble(); }, 2600);
  }
}

export function showDamagePreview(index: number | null): void {
  const c = getCombat();
  if (index === previewIndex) return;
  clearPreview();
  previewIndex = index;
  if (!c || index === null) return;
  for (const p of previewFor(c, index)) {
    const e = c.enemies.find((x) => x.uid === p.uid);
    const el = stage.querySelector<HTMLElement>(`.ennemi[data-uid="${p.uid}"]`);
    if (!e || !el) continue;
    // Méhkar et ses Copies : l'aperçu trahirait le vrai (sauf avec l'Œil du prophète).
    if (e.masked && !c.gear?.seeHallucinations) continue;
    const bar = el.querySelector<HTMLElement>('.barre-pv');
    const after = Math.max(0, e.hp - p.hp);
    if (bar && p.hp > 0) {
      const ghost = document.createElement('div');
      ghost.className = 'apercu fantome';
      ghost.style.left = `${(after / e.maxHp) * 100}%`;
      ghost.style.width = `${(p.hp / e.maxHp) * 100}%`;
      bar.appendChild(ghost);
      const label = bar.querySelector<HTMLElement>('span');
      if (label) {
        label.dataset.pv = label.textContent ?? '';
        label.textContent = `${e.hp} → ${after} / ${e.maxHp}`;
      }
    }
    const loss = document.createElement('div');
    loss.className = `apercu perte ${p.kill ? 'mortel' : ''}`;
    const parts = [p.hp > 0 ? `−${p.hp}` : '', p.block > 0 ? `−${p.block} blocage` : ''].filter(Boolean);
    loss.textContent = p.kill ? `${parts.join(' · ')} · Achevé` : parts.join(' · ');
    el.appendChild(loss);
  }
}

/** À appeler après chaque affichage : l'aperçu suit la carte choisie (téléphone), la bulle disparaît. */
export function afterRender(): void {
  hideBubble();
  previewIndex = null;
  const sel = selectedCard();
  if (sel !== null) showDamagePreview(sel);
}

export function initAides(root: HTMLElement, combat: () => CombatState | null | undefined, selection: () => number | null): void {
  stage = root;
  getCombat = combat;
  selectedCard = selection;

  // Appui long (doigt ou stylet).
  stage.addEventListener('pointerdown', (ev) => {
    hideBubble();
    if (ev.pointerType === 'mouse') return;
    const el = (ev.target as HTMLElement).closest<HTMLElement>(TARGETS);
    if (!el) return;
    pressStart = { x: ev.clientX, y: ev.clientY };
    pressTimer = window.setTimeout(() => {
      pressTimer = undefined;
      // Même sans rien à expliquer, un appui long ne joue pas la carte.
      swallowClick = true;
      showBubble(el);
    }, LONG_PRESS_MS);
  });
  stage.addEventListener('pointermove', (ev) => {
    if (pressStart && Math.hypot(ev.clientX - pressStart.x, ev.clientY - pressStart.y) > MOVE_TOLERANCE) cancelPress();
  });
  const release = () => {
    cancelPress();
    if (swallowClick) hideBubble(); // on lâche : la bulle se ferme
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  // Le clic qui suit un appui long est avalé (la carte n'est pas jouée).
  stage.addEventListener('click', (ev) => {
    if (!swallowClick) return;
    swallowClick = false;
    ev.stopImmediatePropagation();
    ev.preventDefault();
  }, true);
  // Pas de menu du navigateur sur un appui long.
  stage.addEventListener('contextmenu', (ev) => {
    if ((ev.target as HTMLElement).closest(TARGETS)) ev.preventDefault();
  });

  // Survol (souris) : la bulle des mots et des pastilles, l'aperçu des dégâts des cartes de la main.
  stage.addEventListener('pointerover', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    const target = ev.target as HTMLElement;
    const word = target.closest<HTMLElement>('.mot, .chip, .aide');
    if (word) {
      if (!bubble || bubble.dataset.pour !== String(word.textContent)) {
        if (showBubble(word) && bubble) (bubble as HTMLElement).dataset.pour = String(word.textContent);
      }
    } else hideBubble();
    const card = target.closest<HTMLElement>('.main .carte');
    showDamagePreview(card ? Number(card.dataset.index) : selectedCard());
  });
  stage.addEventListener('pointerleave', () => {
    hideBubble();
    showDamagePreview(selectedCard());
  });
}
