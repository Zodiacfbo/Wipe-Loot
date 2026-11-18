# Wipe & Loot

Un deckbuilder roguelite dans la lignée de *Slay the Spire*, dans un univers de fantasy héroïque original inspiré des MMO de raid. Projet personnel.

- **Concept complet :** [docs/CONCEPT.md](docs/CONCEPT.md)
- **Classes :** [docs/classes/](docs/classes/README.md)
- **Actes :** [docs/actes/](docs/actes/)
- **Direction artistique :** [docs/DIRECTION_ARTISTIQUE.md](docs/DIRECTION_ARTISTIQUE.md)
- **Feuille de route :** [docs/ROADMAP.md](docs/ROADMAP.md)

## Le prototype

Le prototype jouable contient :
- le **Guerrier** : rage, postures, barre de sorts (Charge), deck de départ et une vingtaine de cartes à gagner ;
- une **run dans l'acte 1** sur une **carte à embranchements** de 10 étages : combats, boss secondaires (Sœur Cendrine, le Héraut Brannoc), « ? » (événements et embuscades), coffre, feux de camp, puis **Vulkhar, Souverain des flammes** (deux phases, plongée dans la lave) ;
- l'**or** et le **vendeur gobelin** (cartes, objets, potions, retrait, amélioration) ;
- les **potions** (3 emplacements), à boire sans dépenser d'énergie ;
- l'**équipement** (6 emplacements) et les **tables de loot** des boss secondaires, cachées en « ??? » tant qu'un objet n'a jamais été obtenu ;
- les **incantations interruptibles**, les **Zones de feu**, le **Saignement**, les **wipes** (3 nouveaux essais) ;
- la **sauvegarde automatique** dans le navigateur, après chaque action.

### Jouer en local

Il faut [Node.js](https://nodejs.org/) 22 ou plus récent.

```bash
npm install
```

```bash
npm run dev
```

Puis ouvrir l'adresse affichée (par défaut http://localhost:5173).

### Autres commandes

| Commande | Rôle |
|---|---|
| `npm test` | Lance les tests du moteur de jeu. |
| `npm run build` | Vérifie les types et construit le site dans `dist/`. |
| `npm run preview` | Sert le site construit, pour le tester comme en ligne. |

### Organisation du code

| Dossier | Contenu |
|---|---|
| `src/engine/` | Le moteur de jeu, indépendant de l'affichage : cartes, ennemis, combat, run, sauvegarde. |
| `src/ui.ts`, `src/style.css` | L'interface (HTML et CSS). |
| `tests/` | Les tests du moteur. |
| `public/assets/` | Les images du jeu (générées par `tools/pixel/`). |
| `tools/pixel/` | Le générateur de pixel art (Python). |

## Mise en ligne (GitHub Pages)

Le workflow `.github/workflows/deploy.yml` construit et publie le jeu à chaque push :
- la branche **`main`** (version officielle) à la racine du site ;
- la branche **`dev`** (version de test) dans le sous-dossier **`/dev/`**.

Les deux versions ont chacune leur propre sauvegarde.

**À faire une fois dans GitHub :** *Settings → Pages → Build and deployment → Source : **GitHub Actions***.
