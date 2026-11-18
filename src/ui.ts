// L'interface : affiche l'état de la run et transmet les actions du joueur au moteur.
import { CARDS, energyCost } from './engine/cards';
import {
  SPELLS,
  canPlayCard,
  canUseSpell,
  changePosture,
  endTurn,
  isEnraged,
  playCard,
  previewIntentDamage,
  useSpell,
} from './engine/combat';
import { ENEMIES, ROUTE } from './engine/enemies';
import {
  MAX_WIPES,
  abandonRun,
  afterCombatAction,
  campfireRest,
  campfireUpgrade,
  chooseReward,
  newRun,
  retryAfterWipe,
} from './engine/run';
import { localSave } from './engine/save';
import type { CardInstance, CombatState, EnemyState, Posture, RunState } from './engine/types';

const A = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

type Selection = { kind: 'card'; index: number } | { kind: 'spell'; index: number } | null;

interface UiState {
  run: RunState | null;
  selection: Selection;
  overlay: 'deck' | 'menu' | null;
  campfireUpgrade: boolean;
}

const ui: UiState = { run: null, selection: null, overlay: null, campfireUpgrade: false };
let stage: HTMLElement;

// ---------- Icônes ----------

const ICON = {
  epee: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/></svg>',
  bouclier: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>',
  hausse: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  coeur: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  sablier: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/></svg>',
  charge: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h12M13 6l6 6-6 6"/></svg>',
};

const RARITY_FRAME: Record<string, string> = {
  depart: 'depart', commune: 'commune', peu_commune: 'peu_commune', rare: 'rare', epique: 'epique', statut: 'statut',
};

const POSTURES: { id: Posture; label: string; aide: string }[] = [
  { id: 'combat', label: 'Combat', aide: 'Cartes à rage : +3 dégâts' },
  { id: 'berserker', label: 'Berserker', aide: '+1 rage par Attaque, +20 % de dégâts subis' },
  { id: 'defensive', label: 'Défensive', aide: '+3 blocage, rage même bloqué, −20 % dégâts' },
];

// ---------- Rendu d'une carte ----------

function cardHtml(card: CardInstance, opts: { action?: string; disabled?: boolean; selected?: boolean; combat?: CombatState | null } = {}): string {
  const def = CARDS[card.id];
  const frame = `cadre_${RARITY_FRAME[def.rarity]}${def.rageCost !== undefined ? '_rage' : ''}.png`;
  const cost = opts.combat ? energyCost(opts.combat, card.id, card.upgraded) : card.upgraded && def.costUp !== undefined ? def.costUp : def.cost;
  const reduced = cost < def.cost;
  const rage = def.rageCost === 'all' ? 'X' : def.rageCost ?? '';
  const classes = ['carte', opts.disabled ? 'injouable' : '', opts.selected ? 'choisie' : ''].join(' ');
  return `<button type="button" class="${classes}" ${opts.action ?? ''} aria-label="${def.name}${card.upgraded ? ' améliorée' : ''}, coût ${cost}. ${def.text(card.upgraded)}">
    <img class="cadre px" src="${A(frame)}" alt="">
    <img class="icone px" src="${A(`icone_${def.icon}.png`)}" alt="">
    <span class="cout ${reduced ? 'reduit' : ''}">${cost}</span>
    ${rage !== '' ? `<span class="cout-rage">${rage}</span>` : ''}
    <span class="titre ${card.upgraded ? 'ameliore' : ''}">${def.name}${card.upgraded ? '+' : ''}</span>
    <span class="type">${def.type}</span>
    <span class="texte">${def.text(card.upgraded)}</span>
  </button>`;
}

// ---------- Barre du haut ----------

function topbar(run: RunState, hp: number): string {
  const step = ROUTE[Math.min(run.step, ROUTE.length - 1)];
  const pips = Array.from({ length: MAX_WIPES }, (_, i) => `<i class="pip ${i < run.wipesLeft ? '' : 'vide'}"></i>`).join('');
  return `<div class="topbar">
    <div class="groupe">
      <span class="nom-classe">Guerrier</span>
      <span class="stat pv">${ICON.coeur}<span>${hp} / ${run.maxHp}</span></span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <span class="etape">Les Profondeurs Ardentes · ${Math.min(run.step + 1, ROUTE.length)}/${ROUTE.length} · ${step.name}</span>
      <span class="pips">Wipes ${pips} <span>${run.wipesLeft} restant${run.wipesLeft > 1 ? 's' : ''}</span></span>
    </div>
    <div class="groupe">
      <button type="button" class="bouton" data-action="deck">Deck · ${run.deck.length}</button>
      <button type="button" class="bouton" data-action="menu">Menu</button>
    </div>
  </div>`;
}

// ---------- Écran de combat ----------

function enemyChips(e: EnemyState): string {
  const b = e.buffs;
  const chips: string[] = [];
  if (b.puissance > 0) chips.push(`<span class="chip">Puissance ${b.puissance}</span>`);
  if (b.demoralise > 0) chips.push(`<span class="chip debuff">Démoralisé ${b.demoralise}</span>`);
  if (b.ralenti > 0) chips.push(`<span class="chip debuff">Ralenti ${b.ralenti}</span>`);
  if (b.armureFracassee > 0) chips.push(`<span class="chip debuff">Armure fracassée ${b.armureFracassee}</span>`);
  if (b.saignement > 0) chips.push(`<span class="chip saigne">Saignement ${b.saignement}</span>`);
  return chips.join('');
}

function intentHtml(c: CombatState, e: EnemyState): string {
  const i = e.intent;
  if (e.interrupted) return `<div class="intention interrompu">Interrompu</div>`;
  if (i.cast) {
    const effet =
      i.kind === 'attack' ? `${previewIntentDamage(c, e)} dégâts à la fin de ce tour`
      : i.kind === 'heal' ? `Soigne un allié de ${i.amount} PV à la fin de ce tour`
      : 'Prend effet à la fin de ce tour';
    return `<div class="cast"><div class="tete"><span>${i.cast}${e.delayed ? ' (retardé)' : ''}</span><b>Interruptible</b></div><div class="jauge"><div></div></div><div class="effet">${effet}</div></div>`;
  }
  switch (i.kind) {
    case 'attack': {
      const dmg = previewIntentDamage(c, e) ?? 0;
      const times = i.times && i.times > 1 ? ` × ${i.times}` : '';
      const zone = i.addZone ? ' + Zone de feu' : '';
      return `<div class="intention">${ICON.epee}<span>${dmg}${times}${zone}</span></div>`;
    }
    case 'block':
      return `<div class="intention defense">${ICON.bouclier}<span>+${i.amount}</span></div>`;
    case 'buff':
      return `<div class="intention soutien">${ICON.hausse}<span>Puissance +${i.puissance}</span></div>`;
    case 'heal':
      return `<div class="intention soutien">${ICON.coeur}<span>Soin ${i.amount}</span></div>`;
  }
}

function needsEnemyTarget(c: CombatState): boolean {
  const sel = ui.selection;
  if (!sel) return false;
  if (sel.kind === 'card') {
    const card = c.hand[sel.index];
    return !!card && CARDS[card.id].needsTarget;
  }
  return SPELLS[c.spells[sel.index].id].needsTarget;
}

function combatScreen(run: RunState, c: CombatState): string {
  const p = c.player;
  const targeting = needsEnemyTarget(c);
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);

  const rage = Array.from({ length: p.maxRage }, (_, i) => `<i class="${i < p.rage ? 'plein' : ''}"></i>`).join('');
  const postures = POSTURES.map((po) => {
    const actif = p.posture === po.id;
    const disabled = !actif && p.postureChanged;
    return `<button type="button" class="${actif ? 'actif' : ''}" data-action="posture" data-posture="${po.id}" ${disabled ? 'disabled' : ''} aria-pressed="${actif}">${po.label}</button>`;
  }).join('');
  const aidePosture = POSTURES.find((po) => po.id === p.posture)?.aide ?? '';

  const enemies = c.enemies.filter((e) => !e.dead).map((e) => {
    const def = ENEMIES[e.defId];
    const big = e.defId === 'seigneur' || e.defId === 'brannoc';
    const small = e.defId === 'etincelle';
    const size = big ? 192 : small ? 96 : 144;
    const pct = Math.max(0, (e.hp / e.maxHp) * 100);
    const tag = targeting ? 'button' : 'div';
    return `<${tag} ${targeting ? 'type="button"' : ''} class="ennemi ${targeting ? 'ciblable' : ''}" data-action="cible" data-uid="${e.uid}" aria-label="${e.name}, ${e.hp} PV">
      ${intentHtml(c, e)}
      <img class="px" src="${A(`ennemi_${e.defId}.png`)}" alt="" style="width:${size}px;height:${size}px">
      <span class="nom ${def.elite ? 'elite' : ''}">${def.elite ? 'Boss secondaire · ' : ''}${e.name}</span>
      <div class="barre-pv"><div style="width:${pct}%"></div><span>${e.hp} / ${e.maxHp}</span></div>
      <div class="infos">${e.block > 0 ? `<span class="bloc">${ICON.bouclier} ${e.block}</span>` : ''}${enemyChips(e)}</div>
    </${tag}>`;
  }).join('');

  const spells = c.spells.map((s, i) => {
    const def = SPELLS[s.id];
    const ready = canUseSpell(c, i);
    const selected = ui.selection?.kind === 'spell' && ui.selection.index === i;
    return s.cooldown > 0
      ? `<button type="button" class="sort recharge" disabled aria-label="${def.name}, recharge ${s.cooldown} tours"><b>${s.cooldown}</b>${def.name}</button>`
      : `<button type="button" class="sort ${selected ? 'choisi' : ''}" data-action="sort" data-index="${i}" ${ready ? '' : 'disabled'} aria-label="${def.name}, prêt. ${def.text}" title="${def.text}">${ICON.charge}${def.name}</button>`;
  }).join('');

  const hand = c.hand.map((card, i) => cardHtml(card, {
    action: `data-action="carte" data-index="${i}"`,
    disabled: !canPlayCard(c, i),
    selected: ui.selection?.kind === 'card' && ui.selection.index === i,
    combat: c,
  })).join('');

  let enrage = '';
  if (c.enrageTurn !== null) {
    enrage = isEnraged(c)
      ? `<div class="enrage actif">${ICON.sablier}<span>ENRAGE : dégâts du boss doublés</span></div>`
      : `<div class="enrage">${ICON.sablier}<span>Enrage dans ${c.enrageTurn - c.turn} tour${c.enrageTurn - c.turn > 1 ? 's' : ''}</span></div>`;
  }

  const journal = c.log.slice(-9).map((l) => `<p>${l}</p>`).join('');
  const consigne = targeting ? `<div class="consigne">Choisis une cible</div>` : '';

  return `<div class="sol"></div>
    ${topbar(run, p.hp)}
    ${enrage}
    <div class="heros">
      <div class="buffs">${p.puissance > 0 ? `<span class="chip">Puissance ${p.puissance}</span>` : ''}</div>
      <img class="px" src="${A('guerrier.png')}" alt="Le Guerrier" style="width:192px;height:192px">
      <div class="jauges">
        <div class="ligne">
          <div class="bouclier-badge" title="Blocage"><svg width="32" height="32" viewBox="0 0 24 24" fill="#1d2633" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg><span>${p.block}</span></div>
          <div class="barre-pv"><div style="width:${hpPct}%"></div><span>${p.hp} / ${p.maxHp}</span></div>
        </div>
        <div class="ligne"><span class="rage-label">RAGE</span><div class="rage">${rage}</div><span class="rage-label" style="width:auto">${p.rage}</span></div>
        <div class="postures" role="group" aria-label="Posture">${postures}</div>
        <div class="aide-posture">${aidePosture}${p.postureChanged ? ' · déjà changée ce tour' : ''}</div>
      </div>
    </div>
    <div class="ennemis">${enemies}</div>
    ${consigne}
    <div class="barre-sorts"><span class="titre">SORTS</span>${spells}</div>
    <div class="energie ${p.energy === 0 ? 'vide' : ''}" aria-label="Énergie">${p.energy}/${p.maxEnergy}</div>
    <div class="piles"><span class="pile">Pioche ${c.draw.length}</span><span class="pile">Défausse ${c.discard.length}</span></div>
    <div class="main">${hand}</div>
    <div class="journal" aria-live="polite">${journal}</div>
    <button type="button" class="fin-tour" data-action="fin-tour" ${c.phase === 'player' ? '' : 'disabled'}>Fin du tour</button>`;
}

// ---------- Autres écrans ----------

function titleScreen(): string {
  const saved = localSave.load();
  const canContinue = saved && saved.screen !== 'victory' && saved.screen !== 'gameover';
  return `<div class="ecran">
    <img class="px sprite-titre" src="${A('guerrier.png')}" alt="">
    <div class="titre-jeu">Wipe &amp; Loot</div>
    <div class="sous-titre">Prototype · Le Guerrier dans les Profondeurs Ardentes</div>
    <div class="actions">
      ${canContinue ? `<button type="button" class="gros-bouton" data-action="continuer">Continuer</button>` : ''}
      <button type="button" class="gros-bouton ${canContinue ? 'secondaire' : ''}" data-action="nouvelle">Nouvelle partie</button>
    </div>
    <p>3 combats, un feu de camp, puis le Héraut Brannoc. Interromps ses Soins de flamme avec Coup de bouclier, ou tue-le avant l'enrage. La partie est sauvegardée automatiquement dans ce navigateur.</p>
  </div>`;
}

function rewardScreen(run: RunState): string {
  const cards = run.rewardChoices.map((id) => cardHtml({ uid: 0, id, upgraded: false }, { action: `data-action="recompense" data-id="${id}"` })).join('');
  return `${topbar(run, run.hp)}<div class="ecran">
    <h2>Victoire !</h2>
    <p>Choisis une carte à ajouter à ton deck.</p>
    <div class="choix-cartes">${cards}</div>
    <button type="button" class="gros-bouton secondaire" data-action="recompense" data-id="">Passer</button>
  </div>`;
}

function campfireScreen(run: RunState): string {
  if (ui.campfireUpgrade) {
    const cards = run.deck.map((card) => cardHtml(card, {
      action: card.upgraded ? 'disabled' : `data-action="ameliorer" data-uid="${card.uid}"`,
      disabled: card.upgraded,
    })).join('');
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>Le maître de classe</h2>
      <p>Choisis une carte à améliorer.</p>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="feu-retour">Retour</button>
    </div>`;
  }
  const heal = Math.min(run.maxHp - run.hp, Math.floor(run.maxHp * 0.3));
  return `${topbar(run, run.hp)}<div class="ecran">
    <h2>Feu de camp</h2>
    <p>Le Héraut Brannoc t'attend au bout de la galerie. Prends un instant avant le combat.</p>
    <div class="actions">
      <button type="button" class="gros-bouton" data-action="repos">Se reposer (+${heal} PV)</button>
      <button type="button" class="gros-bouton secondaire" data-action="feu-ameliorer">Améliorer une carte</button>
    </div>
  </div>`;
}

function wipeScreen(run: RunState): string {
  return `${topbar(run, 0)}<div class="ecran">
    <h1>Wipe !</h1>
    <p>Tu peux retenter le combat depuis le début, avec au moins la moitié de tes PV. Il te reste ${run.wipesLeft} wipe${run.wipesLeft > 1 ? 's' : ''}. (Dans le jeu complet, il faudra aussi payer la réparation.)</p>
    <div class="actions">
      <button type="button" class="gros-bouton" data-action="retenter">Retenter le combat</button>
      <button type="button" class="gros-bouton secondaire" data-action="abandonner">Abandonner la run</button>
    </div>
  </div>`;
}

function endScreen(run: RunState, victory: boolean): string {
  return `<div class="ecran">
    <img class="px sprite-titre" src="${A(victory ? 'guerrier.png' : 'ennemi_brannoc.png')}" alt="">
    <h1>${victory ? 'Le Héraut est tombé !' : 'Fin de la run'}</h1>
    <p>${victory ? `Bravo : tu as terminé le prototype avec ${run.hp} PV et ${MAX_WIPES - run.wipesLeft} wipe${MAX_WIPES - run.wipesLeft > 1 ? 's' : ''}.` : 'Les Profondeurs Ardentes ont eu raison de toi. La guilde enverra un autre champion.'}</p>
    <div class="actions"><button type="button" class="gros-bouton" data-action="nouvelle">Nouvelle partie</button></div>
  </div>`;
}

function overlayHtml(run: RunState): string {
  if (ui.overlay === 'deck') {
    const cards = run.deck.map((card) => cardHtml(card, { action: 'disabled' })).join('');
    return `<div class="overlay"><div class="ecran" style="justify-content:flex-start;padding-top:40px;gap:14px">
      <h2>Ton deck (${run.deck.length} cartes)</h2>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button>
    </div></div>`;
  }
  if (ui.overlay === 'menu') {
    return `<div class="overlay"><div class="ecran">
      <h2>Menu</h2>
      <p>La partie est sauvegardée après chaque action : tu peux fermer le navigateur et revenir plus tard.</p>
      <div class="actions">
        <button type="button" class="gros-bouton" data-action="fermer">Reprendre</button>
        <button type="button" class="gros-bouton secondaire" data-action="titre">Écran titre</button>
        <button type="button" class="gros-bouton secondaire" data-action="nouvelle">Recommencer une run</button>
      </div>
    </div></div>`;
  }
  return '';
}

// ---------- Boucle de rendu ----------

export function render(): void {
  const run = ui.run;
  if (!run) {
    stage.innerHTML = titleScreen();
    return;
  }
  let html = '';
  switch (run.screen) {
    case 'combat': html = run.combat ? combatScreen(run, run.combat) : ''; break;
    case 'reward': html = rewardScreen(run); break;
    case 'campfire': html = campfireScreen(run); break;
    case 'wipe': html = wipeScreen(run); break;
    case 'victory': html = endScreen(run, true); break;
    case 'gameover': html = endScreen(run, false); break;
  }
  stage.innerHTML = html + overlayHtml(run);
}

function commit(): void {
  const run = ui.run;
  if (run) {
    afterCombatAction(run);
    localSave.save(run);
  }
  render();
}

function startNewRun(): void {
  ui.run = newRun();
  ui.selection = null;
  ui.overlay = null;
  ui.campfireUpgrade = false;
  commit();
}

function onCard(index: number): void {
  const c = ui.run?.combat;
  if (!c || !canPlayCard(c, index)) return;
  const sel = ui.selection;
  if (sel?.kind === 'card' && sel.index === index) {
    ui.selection = null;
    render();
    return;
  }
  const def = CARDS[c.hand[index].id];
  const alive = c.enemies.filter((e) => !e.dead);
  if (def.needsTarget && alive.length > 1) {
    ui.selection = { kind: 'card', index };
    render();
    return;
  }
  playCard(c, index);
  ui.selection = null;
  commit();
}

function onSpell(index: number): void {
  const c = ui.run?.combat;
  if (!c || !canUseSpell(c, index)) return;
  const sel = ui.selection;
  if (sel?.kind === 'spell' && sel.index === index) {
    ui.selection = null;
    render();
    return;
  }
  const def = SPELLS[c.spells[index].id];
  if (def.needsTarget && c.enemies.filter((e) => !e.dead).length > 1) {
    ui.selection = { kind: 'spell', index };
    render();
    return;
  }
  useSpell(c, index);
  ui.selection = null;
  commit();
}

function onTarget(uid: number): void {
  const c = ui.run?.combat;
  const sel = ui.selection;
  if (!c || !sel) return;
  if (sel.kind === 'card') playCard(c, sel.index, uid);
  else useSpell(c, sel.index, uid);
  ui.selection = null;
  commit();
}

function handleClick(ev: MouseEvent): void {
  const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!el || (el as HTMLButtonElement).disabled) return;
  const run = ui.run;
  const action = el.dataset.action;
  switch (action) {
    case 'nouvelle': startNewRun(); return;
    case 'continuer': ui.run = localSave.load(); ui.overlay = null; render(); return;
    case 'titre': ui.run = null; ui.overlay = null; render(); return;
    case 'deck': ui.overlay = 'deck'; render(); return;
    case 'menu': ui.overlay = 'menu'; render(); return;
    case 'fermer': ui.overlay = null; render(); return;
  }
  if (!run) return;
  switch (action) {
    case 'carte': onCard(Number(el.dataset.index)); break;
    case 'sort': onSpell(Number(el.dataset.index)); break;
    case 'cible': onTarget(Number(el.dataset.uid)); break;
    case 'posture':
      if (run.combat) changePosture(run.combat, el.dataset.posture as Posture);
      ui.selection = null;
      commit();
      break;
    case 'fin-tour':
      if (run.combat) endTurn(run.combat);
      ui.selection = null;
      commit();
      break;
    case 'recompense': chooseReward(run, el.dataset.id || null); commit(); break;
    case 'repos': campfireRest(run); commit(); break;
    case 'feu-ameliorer': ui.campfireUpgrade = true; render(); break;
    case 'feu-retour': ui.campfireUpgrade = false; render(); break;
    case 'ameliorer': campfireUpgrade(run, Number(el.dataset.uid)); ui.campfireUpgrade = false; commit(); break;
    case 'retenter': retryAfterWipe(run); commit(); break;
    case 'abandonner': abandonRun(run); commit(); break;
  }
}

function fit(): void {
  // La zone de jeu fait 1280 × 720 ; on l'agrandit ou la réduit pour qu'elle tienne dans l'écran.
  const w = window.visualViewport?.width ?? document.documentElement.clientWidth;
  const h = window.visualViewport?.height ?? document.documentElement.clientHeight;
  const scale = Math.min(w / 1280, h / 720);
  const x = (w - 1280 * scale) / 2;
  const y = (h - 720 * scale) / 2;
  stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

const PRELOAD = [
  'guerrier.png', 'icone_epee.png', 'icone_bouclier.png', 'icone_pouvoir.png', 'icone_feu.png',
  ...Object.keys(ENEMIES).map((id) => `ennemi_${id}.png`),
  ...Object.values(RARITY_FRAME).flatMap((r) => [`cadre_${r}.png`, `cadre_${r}_rage.png`]),
];

export function mount(root: HTMLElement): void {
  for (const file of PRELOAD) new Image().src = A(file);
  stage = root;
  stage.addEventListener('click', handleClick);
  window.addEventListener('resize', fit);
  window.visualViewport?.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 200));
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && (ui.selection || ui.overlay)) {
      ui.selection = null;
      ui.overlay = null;
      render();
    }
  });
  fit();
  render();
}
