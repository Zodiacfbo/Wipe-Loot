// La run : enchaînement des combats, récompenses, feu de camp, wipes.
import { CARDS, REWARD_POOL, STARTER_DECK } from './cards';
import { createCombat } from './combat';
import { ROUTE, type Encounter } from './enemies';
import { random } from './rng';
import type { CardInstance, RunState } from './types';

export const MAX_WIPES = 3;

export function newRun(seed: number = Date.now() % 2147483647): RunState {
  let uid = 1;
  const deck: CardInstance[] = STARTER_DECK.map((id) => ({ uid: uid++, id, upgraded: false }));
  const run: RunState = {
    version: 1, seed, rng: seed, maxHp: 80, hp: 80, deck, wipesLeft: MAX_WIPES, step: 0, screen: 'combat',
    combat: null, entry: null, rewardChoices: [], nextUid: uid,
  };
  enterStep(run);
  return run;
}

export function currentStep(run: RunState) {
  return ROUTE[run.step];
}

function enterStep(run: RunState): void {
  const step = ROUTE[run.step];
  if (!step) {
    run.screen = 'victory';
    run.combat = null;
    return;
  }
  if (step.kind === 'campfire') {
    run.screen = 'campfire';
    run.combat = null;
    return;
  }
  run.entry = { hp: run.hp, deck: run.deck.map((c) => ({ ...c })) };
  startEncounter(run, step);
}

function startEncounter(run: RunState, step: Encounter): void {
  run.combat = createCombat(step, run.deck, run.hp, run.maxHp, run.rng, run.nextUid);
  run.screen = 'combat';
}

/** À appeler après chaque action de combat : gère la victoire et la défaite. */
export function afterCombatAction(run: RunState): void {
  const c = run.combat;
  if (!c) return;
  run.rng = c.rng;
  run.nextUid = c.nextUid;
  if (c.phase === 'victory') {
    run.hp = c.player.hp;
    const isLast = run.step === ROUTE.length - 1;
    if (isLast) {
      run.step += 1;
      run.screen = 'victory';
      run.combat = null;
    } else {
      run.rewardChoices = rollRewards(run);
      run.screen = 'reward';
    }
  } else if (c.phase === 'defeat') {
    run.screen = run.wipesLeft > 0 ? 'wipe' : 'gameover';
  }
}

function rollRewards(run: RunState): string[] {
  const choices: string[] = [];
  let guard = 0;
  while (choices.length < 3 && guard++ < 100) {
    const roll = random(run);
    const rarity = roll < 0.6 ? 'commune' : roll < 0.9 ? 'peu_commune' : 'rare';
    const pool = REWARD_POOL.filter((id) => CARDS[id].rarity === rarity && !choices.includes(id));
    if (pool.length === 0) continue;
    choices.push(pool[Math.floor(random(run) * pool.length)]);
  }
  return choices;
}

export function chooseReward(run: RunState, cardId: string | null): void {
  if (run.screen !== 'reward') return;
  if (cardId && run.rewardChoices.includes(cardId)) {
    run.deck.push({ uid: run.nextUid++, id: cardId, upgraded: false });
  }
  run.rewardChoices = [];
  run.combat = null;
  run.step += 1;
  enterStep(run);
}

export function retryAfterWipe(run: RunState): void {
  if (run.screen !== 'wipe' || !run.entry || run.wipesLeft <= 0) return;
  run.wipesLeft -= 1;
  run.hp = Math.max(run.entry.hp, Math.ceil(run.maxHp * 0.5));
  run.deck = run.entry.deck.map((c) => ({ ...c }));
  const step = ROUTE[run.step];
  if (step.kind === 'combat') startEncounter(run, step);
}

export function abandonRun(run: RunState): void {
  run.screen = 'gameover';
  run.combat = null;
}

export function campfireRest(run: RunState): void {
  if (run.screen !== 'campfire') return;
  run.hp = Math.min(run.maxHp, run.hp + Math.floor(run.maxHp * 0.3));
  run.step += 1;
  enterStep(run);
}

export function campfireUpgrade(run: RunState, uid: number): void {
  if (run.screen !== 'campfire') return;
  const card = run.deck.find((c) => c.uid === uid);
  if (!card || card.upgraded) return;
  card.upgraded = true;
  run.step += 1;
  enterStep(run);
}
