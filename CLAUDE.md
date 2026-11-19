# Wipe & Loot — instructions pour Claude

Deckbuilder roguelite à la Slay the Spire, univers original (Eldrava) inspiré de WoW. TypeScript + Vite, sans framework.

## Règles absolues

- **Toujours répondre en français**, à 100 %.
- **Branches : pour l'instant, on travaille sur `dev`.** En début de session, partir de `dev` à jour (`git fetch origin dev` puis `git checkout -B <branche de session> origin/dev`). À la fin du travail, pousser sur la branche de session (`git push -q origin HEAD`) puis sur `dev` (`git push -q origin HEAD:dev`), en avance rapide uniquement : si `dev` a bougé, fusionner d'abord `origin/dev`. Jamais de `push --force` sur `dev`.
- `main` = version officielle : n'y pousser que si on le demande. Pas de pull request sauf demande.
- **Commits :** en français, et jamais d'identifiant de modèle dans les commits ni le code.
- **Ne jamais committer `INSPIRATIONS.md`** (notes privées, hors dépôt).
- Ne pas mettre l'e-mail de l'utilisateur dans le dépôt ni dans des requêtes externes.
- **Mode économe par défaut :** aller droit au but, peu d'allers-retours, comptes rendus courts. Équilibrage : `RUNS=50`, seulement la classe ou l'acte concerné. Une seule vérification dans le navigateur, à la fin.

## Commandes

```bash
npm test            # vitest (doit rester vert)
npm run build       # tsc + vite build
npx tsc --noEmit -p .
RUNS=50 PROFIL="Prêtre" npm run balance -- --silent=false   # équilibrage par le bot
cd tools/pixel && python3 illustrations.py                  # régénère les illustrations de cartes
```

Navigateur : `npx vite preview --port 4173 --strictPort` (après `npm run build`), puis un script Playwright. Le parcours : Commencer → choix de la classe → Brégan (bénédiction) → carte.

## Architecture

- `src/engine/` : moteur **pur et sérialisable en JSON** (RNG déterministe mulberry32 dans `rng.ts`). Aucune dépendance au DOM.
  - `types.ts` (états de run et de combat), `run.ts` (déroulement de la run), `combat.ts` (tours, cartes, ennemis), `actions.ts` (dégâts, blocage, soins, morts).
  - `cards.ts` (Guerrier, cartes-statut, registre `CARDS`), `cards_mage.ts`, `cards_demoniste.ts`, `cards_pretre.ts`, `cards_voleur.ts`.
  - `spells.ts` (sorts de barre de toutes les classes), `talents.ts` (arbres par classe, `CLASS_TREES`), `classes.ts` (fiches et kits de départ).
  - Mécaniques de classe : `demoniste.ts` (familier, DoT, Malédictions, éclats), `pretre.ts` (Égide, Foi), `voleur.ts` (combo, Camouflage, Poison, Contrôle).
  - `enemies.ts` (acte 1) et `enemies_acte2.ts`, `acts.ts` (registre des actes), `map.ts`, `events.ts`, `items.ts` (objets, tables de loot, `uselessFx` par classe), `potions.ts`, `difficulty.ts` (niveaux 0 à 20).
  - `save.ts` : sauvegarde **versionnée** avec `migrate()` (run) et `loadProfile()` (profil). Tout nouveau champ de `RunState` → incrémenter la version et ajouter une étape de migration, et mettre à jour `expect(run.version)` dans les tests.
  - `progression.ts` (score, expérience, niveaux), `guild.ts` (coffre), `archives.ts` (lore des monstres).
- `src/ui.ts` : tout l'affichage (HTML en chaînes, délégation d'événements via `data-action`). `src/style.css`. `src/fx.ts` : animations à partir de `c.fx`.
- `tools/balance/` : le bot (`bot.ts`, regard d'une action à l'avance) et les simulations (`*.sim.ts`).
- `tools/pixel/` : sprites et illustrations en Python/Pillow (classe `Sprite` dans `sprites.py`). Sortie dans `public/assets/` (`carte_<id>.png`, `ennemi_<id>.png`, `<classe>.png`, `familier_<id>.png`).
- `docs/` : `CONCEPT.md`, `ROADMAP.md`, `EQUILIBRAGE.md` (journal des passes du bot), une fiche par classe (`docs/classes/`) et par acte (`docs/actes/`).

## État actuel

- Classes jouables : **Guerrier, Mage, Démoniste, Prêtre, Voleur** (52-53 cartes, 9-10 sorts, 27 talents chacun). Restent : Paladin, Chasseur, Chaman, Druide.
- Actes : **1 (Profondeurs Ardentes, Vulkhar) et 2 (Aire de Vhaeryx)** enchaînés ; la run se termine après Vhaeryx. Acte 3 (Irem) à faire.
- Légendaires faits : Brisemonts (Guerrier), Bâton du Veilleur (Mage, Démoniste), Équinoxe (Prêtre), Sillon d'orage (Voleur, chez l'événement Ventor). Ils se forgent au feu de camp à partir de l'acte 2.

## Ajouter une classe (recette suivie pour Mage, Démoniste, Prêtre, Voleur)

1. Lire la fiche `docs/classes/<CLASSE>.md`.
2. `types.ts` : champs de combat (ressource) et de run si besoin (+ migration `save.ts`). `items.ts` : clés `ItemEffects` des talents, et `KEY_CLASSES` pour les bonus propres à la classe.
3. Mécaniques dans un module `src/engine/<classe>.ts`, branchées dans `combat.ts` (début de tour, `playCard`, fin de tour) et `actions.ts`.
4. `cards_<classe>.ts` (ids uniques ! vérifier les collisions avec `CARDS`), fusion dans `CARDS`. Champ `classId` posé automatiquement.
5. Sorts de barre dans `spells.ts` (+ id du sort de départ dans `lootSpells`), arbres dans `talents.ts` (`CLASS_TREES`), kit dans `classes.ts` (`playable: true`, `starterDeck`, `startSpell`, `sprite`).
6. Malédiction de lignée de Vhaeryx (`lineageCurse` dans `combat.ts`) et texte dans `ui.ts` (`curseText`).
7. Légendaire et quête (item dans `items.ts`, étapes dans `run.ts`/`events.ts`, bouton au feu de camp dans `ui.ts`).
8. UI : jauge de ressource dans `combatScreen` (voir `demonResource`, `priestResource`), chips, `POWER_LABEL`, préchargement du sprite.
9. Sprite + illustrations (`tools/pixel/illustrations_<classe>.py`, ajouté dans `illustrations.py`).
10. Tests `tests/<classe>.test.ts` ; mettre à jour `tests/classes.test.ts` et le compte de talents dans `tests/talents.test.ts`.
11. Bot : valeur de la ressource dans `evaluate()` ; profils dans `balance.sim.ts`. Cibles (run complète, difficulté 0) : niveau 1 ≈ 0-10 %, niveau 5 ≈ 15-30 %, niveau 10 ≈ 50-75 %. Le sort de départ est gratuit (comme Charge, Contresort, Pacte de sang, Égide sacrée) et le deck de départ un peu renforcé par rapport à la fiche.
12. Docs : fiche de classe (chiffres retenus + §« Ce qui est en jeu »), `EQUILIBRAGE.md`, `ROADMAP.md`.

## Pièges connus

- Les scripts Python de remplacement doivent vérifier que l'ancre existe une seule fois (un `replace` peut toucher deux lignes du même tableau).
- Ne pas modifier une liste pendant qu'on la parcourt avec un alias (bug déjà vu dans `placeCurse`).
- Les scripts Playwright échouent parfois à cause de la bénédiction tirée au hasard : relancer, ce n'est pas un bug du jeu.
- Le bot ne voit qu'une action à l'avance : certains choix (Pacte de sang, Rôdeur contre les boss, Pierre d'âme) sont codés en dur dans `bot.ts`.
