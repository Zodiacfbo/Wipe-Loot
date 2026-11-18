// Animations du combat : attaques au corps à corps, projectiles, chiffres flottants, morts.
// Le moteur produit une liste d'événements ; on les joue ici, sur l'écran tel qu'il était
// avant l'action, puis l'interface affiche le nouvel état.
import type { FxEvent, FxTarget } from './engine/types';

let stage: HTMLElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Vitesse globale des animations : 1 = rapide, plus grand = plus lent.
const SPEED = 1.6;
const ms = (n: number) => (reduceMotion ? 1 : Math.round(n * SPEED));
const wait = (n: number) => new Promise<void>((resolve) => setTimeout(resolve, ms(n)));

export function initFx(root: HTMLElement): void {
  stage = root;
}

function node(t: FxTarget): HTMLElement | null {
  return stage.querySelector<HTMLElement>(`[data-fx="${t}"]`);
}

/** Centre d'un élément, en coordonnées de la zone de jeu (1280 × 720), quelle que soit l'échelle. */
function center(el: HTMLElement): { x: number; y: number } {
  const s = stage.getBoundingClientRect();
  const k = s.width / 1280;
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2 - s.left) / k, y: (r.top + r.height / 2 - s.top) / k };
}

function floatText(t: FxTarget, text: string, color: string, delay = 0, size = 26): void {
  const el = node(t);
  if (!el) return;
  const c = center(el);
  const d = document.createElement('div');
  d.className = 'fx-texte';
  d.textContent = text;
  d.style.left = `${c.x}px`;
  d.style.top = `${c.y - 50}px`;
  d.style.color = color;
  d.style.fontSize = `${size}px`;
  d.style.opacity = '0';
  stage.appendChild(d);
  const anim = d.animate(
    [
      { transform: 'translate(-50%, 0) scale(0.7)', opacity: 0 },
      { transform: 'translate(-50%, -16px) scale(1.15)', opacity: 1, offset: 0.12 },
      { transform: 'translate(-50%, -24px) scale(1)', opacity: 1, offset: 0.7 },
      { transform: 'translate(-50%, -56px) scale(1)', opacity: 0 },
    ],
    { duration: ms(1100), delay: ms(delay), easing: 'ease-out' },
  );
  anim.finished.then(() => d.remove()).catch(() => d.remove());
}

function shake(t: FxTarget): void {
  node(t)?.animate(
    [
      { transform: 'translateX(0)', filter: 'brightness(1)' },
      { transform: 'translateX(-8px)', filter: 'brightness(2.4)' },
      { transform: 'translateX(7px)', filter: 'brightness(1.6)' },
      { transform: 'translateX(-4px)', filter: 'brightness(1.2)' },
      { transform: 'translateX(0)', filter: 'brightness(1)' },
    ],
    { duration: ms(280) },
  );
}

function glow(t: FxTarget, color: string): void {
  node(t)?.animate(
    [
      { filter: 'drop-shadow(0 0 0 transparent)' },
      { filter: `drop-shadow(0 0 14px ${color})`, offset: 0.4 },
      { filter: 'drop-shadow(0 0 0 transparent)' },
    ],
    { duration: ms(600) },
  );
}

/** L'attaquant fonce vers sa cible. Renvoie quand il touche. */
async function lunge(from: FxTarget, to: FxTarget): Promise<void> {
  const a = node(from);
  const b = node(to);
  if (!a || !b) return;
  const p = center(a);
  const q = center(b);
  const dx = (q.x - p.x) * 0.55;
  const dy = (q.y - p.y) * 0.25;
  a.animate(
    [
      { transform: 'translate(0, 0)' },
      { transform: `translate(${dx * -0.08}px, 0)`, offset: 0.2 },
      { transform: `translate(${dx}px, ${dy}px)`, offset: 0.5 },
      { transform: 'translate(0, 0)' },
    ],
    { duration: ms(420), easing: 'ease-in-out' },
  );
  await wait(210);
}

/** Un projectile part de l'attaquant vers la cible. Renvoie quand il arrive. */
async function projectile(from: FxTarget, to: FxTarget, color: string, size = 22): Promise<void> {
  const a = node(from);
  const b = node(to);
  if (!a || !b) return;
  const p = center(a);
  const q = center(b);
  const d = document.createElement('div');
  d.className = 'fx-projectile';
  d.style.width = `${size}px`;
  d.style.height = `${size}px`;
  d.style.background = color;
  d.style.boxShadow = `0 0 14px 6px ${color}`;
  d.style.left = `${p.x - size / 2}px`;
  d.style.top = `${p.y - size / 2}px`;
  stage.appendChild(d);
  const arc = Math.min(120, Math.abs(q.x - p.x) * 0.2);
  const anim = d.animate(
    [
      { transform: 'translate(0, 0) scale(0.6)' },
      { transform: `translate(${(q.x - p.x) / 2}px, ${(q.y - p.y) / 2 - arc}px) scale(1.1)`, offset: 0.5 },
      { transform: `translate(${q.x - p.x}px, ${q.y - p.y}px) scale(1)` },
    ],
    { duration: ms(360), easing: 'ease-in' },
  );
  await anim.finished.catch(() => undefined);
  d.remove();
}

function impact(ev: Extract<FxEvent, { kind: 'hit' }>, delay = 0): void {
  const hpLoss = ev.amount - ev.blocked;
  shake(ev.to);
  if (hpLoss > 0) floatText(ev.to, `-${hpLoss}`, '#ff6a5a', delay);
  if (ev.blocked > 0) floatText(ev.to, `${ev.blocked} bloqué${ev.blocked > 1 ? 's' : ''}`, '#8fb8e8', delay + 120, 18);
  if (ev.amount === 0) floatText(ev.to, '0', '#c9bcab', delay);
}

function fade(who: number): void {
  node(who)?.animate(
    [
      { opacity: 1, transform: 'translateY(0)', filter: 'grayscale(0)' },
      { opacity: 0, transform: 'translateY(14px)', filter: 'grayscale(1) brightness(2)' },
    ],
    { duration: ms(450), fill: 'forwards' },
  );
}

/** Joue une liste d'événements, dans l'ordre. */
export async function playFx(events: FxEvent[]): Promise<void> {
  let i = 0;
  while (i < events.length) {
    const ev = events[i];

    // Plusieurs coups du joueur d'affilée sur des cibles différentes : attaque de zone.
    if (ev.kind === 'hit' && ev.from === 'player') {
      const group: FxEvent[] = [];
      let j = i;
      while (j < events.length) {
        const e = events[j];
        if ((e.kind === 'hit' && e.from === 'player') || e.kind === 'death') group.push(e);
        else break;
        j++;
      }
      const hits = group.filter((e): e is Extract<FxEvent, { kind: 'hit' }> => e.kind === 'hit');
      const targets = new Set(hits.map((h) => h.to));
      if (targets.size > 1) {
        const hero = node('player');
        hero?.animate(
          [{ transform: 'translateX(0) scale(1)' }, { transform: 'translateX(40px) scale(1.08)', offset: 0.5 }, { transform: 'translateX(0) scale(1)' }],
          { duration: ms(420), easing: 'ease-in-out' },
        );
        await wait(200);
        hits.forEach((h) => impact(h));
        await wait(260);
      } else {
        for (const h of hits) {
          await lunge('player', h.to);
          impact(h);
          await wait(140);
        }
      }
      group.filter((e) => e.kind === 'death').forEach((d) => fade((d as { who: number }).who));
      if (group.some((e) => e.kind === 'death')) await wait(250);
      i = j;
      continue;
    }

    switch (ev.kind) {
      case 'hit':
        if (ev.ranged) await projectile(ev.from, ev.to, '#ff8a2a', 26);
        else await lunge(ev.from, ev.to);
        impact(ev);
        await wait(220);
        break;
      case 'tick':
        shake(ev.who);
        floatText(ev.who, `-${ev.amount} ${ev.label}`, ev.label === 'Saignement' ? '#ff5a6a' : '#ffa04a', 0, 20);
        await wait(320);
        break;
      case 'block':
        glow(ev.who, '#8fb8e8');
        floatText(ev.who, `+${ev.amount} blocage`, '#8fb8e8', 0, 18);
        await wait(ev.who === 'player' ? 120 : 280);
        break;
      case 'buff':
        glow(ev.who, '#e6c36a');
        floatText(ev.who, ev.label, '#f5dfa0', 0, 18);
        await wait(260);
        break;
      case 'heal':
        await projectile(ev.from, ev.to, '#7be07b', 18);
        glow(ev.to, '#7be07b');
        floatText(ev.to, `+${ev.amount}`, '#8fe08a');
        await wait(260);
        break;
      case 'interrupt':
        shake(ev.who);
        floatText(ev.who, 'Interrompu !', '#f5dfa0', 0, 22);
        await wait(320);
        break;
      case 'death':
        fade(ev.who);
        await wait(300);
        break;
    }
    i++;
  }
}
