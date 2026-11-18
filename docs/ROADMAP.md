# Feuille de route

> Wipe & Loot · Document vivant : on coche ce qui est fait et on ajoute les idées au fur et à mesure.
> Légende : `[x]` fait · `[ ]` à faire. Les étapes de chaque phase sont rangées dans l'ordre conseillé.

---

## Comment on travaille

| Branche | Rôle | Adresse |
|---|---|---|
| `dev` | Version de test : chaque nouveauté arrive ici d'abord. | https://zodiacfbo.github.io/Wipe-Loot/dev/ |
| `main` | Version officielle : on y passe une version de `dev` quand elle est stable. | https://zodiacfbo.github.io/Wipe-Loot/ |

**Le cycle d'une nouveauté :** on la conçoit dans `docs/`, on la code, on la teste (tests automatiques et partie sur téléphone), on la publie sur `dev`, puis sur `main` quand elle est jugée stable.

---

## Phase 0 — Fondations ✅

- [x] Concept général ([CONCEPT.md](CONCEPT.md))
- [x] Univers original (Eldrava), sans éléments repris d'une œuvre existante
- [x] Les 9 fiches de classe ([classes/](classes/README.md))
- [x] Les 4 fiches d'acte ([actes/](actes/))
- [x] Direction artistique : pixel art moderne, polices Nunito et Cinzel ([DIRECTION_ARTISTIQUE.md](DIRECTION_ARTISTIQUE.md))
- [x] Générateur de pixel art (`tools/pixel/`)
- [x] Prototype jouable : le Guerrier dans une mini-run de l'acte 1
- [x] Sauvegarde automatique dans le navigateur
- [x] Mise en ligne sur GitHub Pages (`main` et `dev`)
- [x] Plein écran et installation comme application (PWA)
- [x] Animations de combat et chiffres flottants

---

## Phase 1 — L'acte 1 complet avec le Guerrier

**Objectif :** une vraie run de l'acte 1, du début à Vulkhar, avec tous les systèmes d'une run. C'est la « tranche verticale » qui prouve que le jeu est amusant.

### 1.1 La run
- [x] Carte de l'acte à embranchements (10 étages, combats, boss secondaires, « ? », coffre, feux de camp, boss)
- [x] Ajouter le vendeur gobelin sur la carte (au moins un par run)
- [x] Remplacer le boss provisoire (Brannoc) par Vulkhar
- [ ] Bénédiction d'entrée de Brégan le Passeur
- [ ] Écran de fin de run (score, statistiques)

### 1.2 Le combat
- [ ] Tous les ennemis de trash de l'acte 1, et leurs packs
- [ ] Les 9 boss secondaires de l'acte 1, avec leurs mécaniques (fait : Sœur Cendrine, Héraut Brannoc)
- [x] Vulkhar, Souverain des flammes (phases, plongée dans la lave, Rejetons de flamme, Marteau des flammes, Éruption)
- [ ] La quête des Gardiens des Sources qui affaiblit Vulkhar
- [ ] Cartes-statut de l'acte : Bombe vivante, Paniqué, Fardeau, Cendres
- [ ] Infobulles des mots-clés, des buffs et des débuffs (appui long sur téléphone, survol sur PC)
- [ ] Prévisualisation des dégâts sur les cartes (en tenant compte de la Puissance, de la posture, de l'Armure fracassée)

### 1.3 Le Guerrier complet
- [ ] Les 52 cartes du Guerrier
- [ ] Les 7 sorts de barre, et le 4ᵉ emplacement
- [ ] Une illustration en pixel art par carte
- [ ] Le légendaire Brisemonts et sa quête

### 1.4 Le loot et l'économie
- [x] L'or (99 au départ, gains après chaque combat, plus sur les boss secondaires)
- [x] L'équipement : 6 emplacements, règle de remplacement, fenêtre « Équipement » (16 objets dans le prototype)
- [x] Les tables de loot des boss secondaires (Cendrine, Brannoc), avec les « ??? » jusqu'au premier drop (mémorisé entre les runs)
- [x] Les coffres donnent un objet (70 % commun, 30 % rare)
- [ ] Les tables de loot des 7 autres boss secondaires de l'acte 1, et les sorts de barre dans les tables
- [ ] Le butin de boss : 1 objet épique parmi 3
- [x] Les potions : 3 emplacements, 8 potions, 40 % de chance après un combat gagné, retrouvées après un wipe
- [x] Le coffre de la guilde : 6 places, 1 objet déposé après une victoire, 1 objet emporté au départ (perdu si la run échoue)
- [ ] Les potions dans les événements (Potions de route de Brégan, laboratoire…)
- [x] Le vendeur gobelin : 5 cartes dont une en promo, retrait et amélioration d'une carte (prix croissant)
- [x] Le vendeur gobelin : 2 objets d'équipement et 3 potions à vendre
- [x] Le vendeur gobelin : réparation des objets brisés (50 / 75 / 100 or selon la rareté)
- [ ] Le vendeur gobelin : ajouter les cartes de profession
- [x] La facture de réparation après un wipe (50, 100, 150 or), et les objets brisés

### 1.5 Les nœuds « ? »
- [ ] Les événements narratifs de l'acte 1 (premiers événements simples en place : la source chaude, le raideur tombé)
- [ ] Les combats cachés (fait : embuscade ; reste : gobelin mimique, patrouille)
- [ ] La quête des Gardiens des Sources (affaiblit Vulkhar)

### 1.6 Équilibrage
- [ ] Tester des runs complètes et ajuster les PV, les dégâts et les récompenses
- [ ] Noter les retours de partie dans ce document (section « Idées et retours »)

---

## Phase 2 — La progression entre les runs

- [ ] Le profil du joueur (sauvegardé à part de la run)
- [ ] L'expérience et le niveau de classe (1 à 10)
- [ ] Premier lancement : choix libre de la classe de départ parmi les 9, avec une fiche de présentation
- [ ] Déblocage des autres classes par paliers d'expérience, au choix du joueur
- [ ] Le rattrapage : expérience doublée pour une classe tant qu'elle est en dessous du meilleur niveau atteint
- [ ] Les talents permanents : écran des 3 arbres, choix avant la run, respec gratuit
- [ ] Les déblocages de cartes et d'objets par niveau
- [ ] Les niveaux de difficulté (1 à 20)
- [ ] Les archives de la guilde (compendium : cartes, objets, monstres découverts)
- [ ] Le hall de la guilde comme écran principal

---

## Phase 3 — Le contenu

### 3.1 Les actes
- [ ] Acte 2 : l'Aire de Vhaeryx (Souffles, mutations, Malédiction de lignée)
- [ ] Acte 3 : Irem (Folie, Hallucinations, ensevelissement, immunités)
- [ ] Acte bonus : la Nécropole céleste (éclats de clé, Gruthak, Sarvok)

### 3.2 Les classes (dans l'ordre de développement)
- [x] Guerrier (prototype)
- [ ] Mage
- [ ] Démoniste
- [ ] Prêtre
- [ ] Voleur
- [ ] Paladin
- [ ] Chasseur
- [ ] Chaman
- [ ] Druide

Pour chaque classe : ses mécaniques, ses cartes et illustrations, ses sorts de barre, ses talents, son légendaire et sa quête, et son sprite.

### 3.3 Les légendaires
- [ ] Le légendaire forgé est gardé pour toujours (râtelier de la guilde), à emporter à la place de l'objet du coffre
- [ ] Les 7 légendaires restants et leurs quêtes (Bâton du Veilleur, Sillon d'orage, Équinoxe, l'Aurore ardente, Corde-des-anciens, le Marteau des ancêtres)

---

## Phase 4 — Comptes et sauvegarde en ligne

- [ ] Firebase : création du projet, règles de sécurité Firestore
- [ ] Connexion anonyme au premier lancement, puis liaison d'un compte Google ou e-mail
- [ ] Synchronisation du profil et de la run en cours (à chaque nœud)
- [ ] Gestion des conflits entre deux appareils
- [ ] Export et import de la sauvegarde (fichier ou code)

---

## Phase 5 — Finition

- [ ] Sons et musique (ambiance par acte, sons des moments clés)
- [ ] Animations des sprites (respiration, attaque, mort)
- [ ] Options : vitesse des animations, volume, réduction des effets
- [ ] Tutoriel et aide en jeu
- [ ] Disposition dédiée au téléphone (texte et cartes plus grands)
- [ ] Accessibilité (contrastes, tailles de texte, lecteurs d'écran)
- [ ] Performances sur les téléphones modestes
- [ ] Tests avec d'autres joueurs

---

## Phase 6 — Sortie de la version officielle

- [ ] Définir ce qu'est la « version 1.0 » (contenu minimum)
- [ ] Numéroter les versions et tenir un journal des changements
- [ ] Passer la version stable de `dev` sur `main`
- [ ] Page d'accueil du site (présentation, captures)

---

## Plus tard

- [ ] Mode rapide (un acte, 15 à 20 minutes)
- [ ] Mode infini (les raids en boucle, difficulté croissante, meilleur score)
- [ ] Plusieurs boss possibles par acte (Sythra la Matriarche des cendres, Ekhara le Serpent de sang…)
- [ ] Nouveaux raids et nouvelles campagnes
- [ ] Classement en ligne (demanderait une vérification côté serveur contre la triche)

---

## Technique et entretien

- [ ] Mettre à jour les actions GitHub du déploiement (avertissement sur l'ancienne version de Node.js)
- [x] Migration des sauvegardes quand leur format change (la version 2 est convertie en version 3)
- [ ] Ajouter des tests à chaque nouvelle mécanique
- [ ] Suivre les bugs et les idées avec les « Issues » GitHub (optionnel)

---

## Questions encore ouvertes

Reprises du [concept](CONCEPT.md#19-questions-ouvertes) :
- [ ] Classes du premier prototype jouable en plus du Guerrier
- [x] Ordre de déblocage des classes → classe de départ au choix, puis déblocages au choix du joueur (reste à fixer les paliers)
- [ ] Noms de l'univers à ajuster (Eldrava, Vulkhar, Vhaeryx, Irem, Sarvok…)

---

## Idées et retours

*Ajoute ici tes idées et tes retours de partie, en vrac. On les rangera dans les phases au fur et à mesure.*

- [x] Lire les cartes plus facilement sur téléphone → police Nunito
- [x] Jouer en plein écran → bouton Plein écran et installation comme application
- [x] Rendre les attaques plus vivantes → animations de combat
- [x] Animations un peu trop rapides → ralenties
- [ ] …
