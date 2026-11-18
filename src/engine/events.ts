// Les événements des nœuds « ? » (premiers événements simples, en attendant ceux de la fiche d'acte).

export interface EventChoice {
  label: string;
  detail: string;
}

export interface EventDef {
  id: string;
  title: string;
  text: string;
  choices: EventChoice[];
}

export const EVENTS: Record<string, EventDef> = {
  source: {
    id: 'source',
    title: 'La source chaude',
    text: 'Entre deux coulées de lave, une source d\'eau claire jaillit de la roche. Elle est brûlante, mais elle sent les herbes des montagnes.',
    choices: [
      { label: 'Boire', detail: 'Soigne 15 PV.' },
      { label: 'Passer ton chemin', detail: 'Rien ne se passe.' },
    ],
  },
  cadavre: {
    id: 'cadavre',
    title: 'Le raideur tombé',
    text: 'Un aventurier gît contre la paroi, son sac encore sur le dos. Il n\'a pas survécu à son dernier wipe. La roche autour de lui est encore chaude.',
    choices: [
      { label: 'Fouiller le sac', detail: 'Perds 6 PV. Choisis une carte parmi 3.' },
      { label: 'Le laisser reposer', detail: 'Rien ne se passe.' },
    ],
  },
};

/** Les « ? » qui cachent un combat (embuscade) plutôt qu'un événement. */
export const AMBUSH = 'embuscade';
