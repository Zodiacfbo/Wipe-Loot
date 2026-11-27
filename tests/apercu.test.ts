import { describe, expect, it } from 'vitest';
import { CARDS } from '../src/engine/cards';
import { canPlayCard, createCombat } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { cardHitValue, previewCard } from '../src/engine/preview';
import type { CardInstance, CombatState } from '../src/engine/types';
import { KEYWORDS, keywordOfLabel, keywordsIn, markKeywords } from '../src/keywords';

function combat(enemies: string[], cards: string[], classId = 'guerrier'): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const deck: CardInstance[] = cards.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
  return createCombat(enc, deck, 80, 80, 42, 1, undefined, undefined, undefined, classId);
}

const idx = (c: CombatState, id: string) => c.hand.findIndex((card) => card.id === id);

describe('aperçu des dégâts', () => {
  it('Frappe : Puissance et Armure fracassée comptent, et le vrai combat ne bouge pas', () => {
    const c = combat(['lieutenant'], ['frappe', 'frappe', 'frappe', 'frappe', 'frappe']);
    c.player.puissance = 2;
    const e = c.enemies[0];
    e.buffs.armureFracassee = 2;
    const before = JSON.stringify(c);
    const p = previewCard(c, idx(c, 'frappe'))!;
    expect(p.hits).toEqual([12]); // (6 + 2) × 1,5
    const blocked = Math.min(e.block, 12);
    expect(p.enemies).toEqual([{ uid: e.uid, hp: 12 - blocked, block: blocked, kill: false }]);
    expect(JSON.stringify(c)).toBe(before);
  });

  it('annonce l\'ennemi achevé', () => {
    const c = combat(['lieutenant'], ['frappe', 'frappe', 'frappe', 'frappe', 'frappe']);
    c.enemies[0].hp = 3;
    c.enemies[0].block = 0;
    expect(previewCard(c, idx(c, 'frappe'))!.enemies[0].kill).toBe(true);
  });

  it('une carte à cible attend sa cible quand il y a plusieurs ennemis', () => {
    const c = combat(['etincelle', 'etincelle'], ['frappe', 'frappe', 'frappe', 'frappe', 'frappe']);
    expect(previewCard(c, idx(c, 'frappe'))).toBeNull();
    const uid = c.enemies[1].uid;
    const p = previewCard(c, idx(c, 'frappe'), uid)!;
    expect(p.enemies.map((x) => x.uid)).toEqual([uid]);
  });

  it('ne dévoile pas un tirage au hasard (Ruée sanguinaire sur plusieurs ennemis)', () => {
    const c = combat(['etincelle', 'etincelle', 'etincelle'], Array(5).fill('ruee_sanguinaire'));
    c.player.energy = 5;
    expect(previewCard(c, 0)).toBeNull();
  });

  it('le chiffre du texte : neutre s\'il y a plusieurs cibles, celui de la cible s\'il n\'y en a qu\'une', () => {
    const c = combat(['etincelle', 'etincelle'], ['frappe', 'frappe', 'frappe', 'frappe', 'frappe']);
    c.player.puissance = 2;
    c.enemies[0].buffs.armureFracassee = 2;
    expect(cardHitValue(c, idx(c, 'frappe'))).toBe(8);
    c.enemies[1].dead = true;
    expect(cardHitValue(c, idx(c, 'frappe'))).toBe(12);
  });

  it('les dégâts au hasard (Chaos instable) ne sont pas corrigés', () => {
    const c = combat(['lieutenant'], Array(5).fill('chaos_instable'), 'demoniste');
    expect(canPlayCard(c, 0)).toBe(true);
    expect(cardHitValue(c, 0)).toBeNull();
  });

  it('une carte sans dégâts n\'a pas d\'aperçu', () => {
    const c = combat(['lieutenant'], ['parade', 'parade', 'parade', 'parade', 'parade']);
    expect(cardHitValue(c, 0)).toBeNull();
    expect(previewCard(c, 0)!.enemies).toEqual([]);
  });
});

describe('lexique des infobulles', () => {
  it('souligne les mots-clés, en distinguant Gel et Gelé', () => {
    expect(markKeywords('Gel 3. Si la cible est Gelée : Fracasser.')).toBe(
      '<span class="mot" data-mot="Gel">Gel</span> 3. Si la cible est <span class="mot" data-mot="Gelé">Gelée</span> : <span class="mot" data-mot="Fracasser">Fracasser</span>.',
    );
    expect(keywordsIn('Inflige 6 dégâts. Saignement 5. Épuisé.').map((k) => k.name)).toEqual(['Saignement', 'Épuisé']);
  });

  it('respecte la casse et les mots entiers', () => {
    expect(keywordsIn('Charge : fonce sur la cible.')).toEqual([]); // le sort, pas les charges du Mage
    expect(keywordsIn('Gagne 1 charge.').map((k) => k.name)).toEqual(['Charges arcaniques']);
    expect(keywordsIn('Ta Foi et ta foire.').map((k) => k.name)).toEqual(['Foi']);
  });

  it('reconnaît le mot-clé d\'une pastille', () => {
    expect(keywordOfLabel('Armure fracassée 2')?.name).toBe('Armure fracassée');
    expect(keywordOfLabel('Gel 2/5')?.name).toBe('Gel');
    expect(keywordOfLabel('Gelé : attaque ÷ 2')?.name).toBe('Gelé');
    expect(keywordOfLabel('Témérité : +50 %')).toBeUndefined();
  });

  it('chaque définition est courte, et le texte de chaque carte se marque sans erreur', () => {
    for (const k of KEYWORDS) expect(k.text.length, k.name).toBeLessThan(200);
    for (const def of Object.values(CARDS)) {
      for (const up of [false, true]) {
        const text = def.text(up);
        const html = markKeywords(text);
        expect(html.replace(/<[^>]+>/g, '')).toBe(text);
      }
    }
  });
});

// Retour du 27 novembre 2026 : la Robustesse ne se voyait pas sur les cartes de blocage.
describe('blocage corrigé sur les cartes', () => {
  it('Parade avec 2 Robustesse : 7 au lieu de 5', async () => {
    const { cardBlockValue } = await import('../src/engine/preview');
    const { placeBlock } = await import('../src/cardtext');
    const c = combat(['lieutenant'], Array(5).fill('parade'));
    c.player.posture = 'combat';
    c.player.robustesse = 2;
    const before = JSON.stringify(c);
    expect(cardBlockValue(c, 0)).toBe(7);
    expect(JSON.stringify(c)).toBe(before);
    expect(placeBlock('Gagne 5 blocage.', 7)).toEqual({ before: 'Gagne ', after: ' blocage.', base: 5 });
    // Pas un gain immédiat, ou rien qui change : le texte reste tel quel.
    expect(placeBlock('Dépense la moitié de ta rage : 3 blocage par point.', 5)).toBeNull();
    expect(placeBlock('Début de ton tour : gagne 3 blocage.', 5)).toBeNull();
    expect(placeBlock('Gagne 5 blocage.', 5)).toBeNull();
  });
});
