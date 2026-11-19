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
- [x] Les 9 boss secondaires de l'acte 1, avec leurs mécaniques et leurs sprites (Morvax, Croc-de-lave, Cendrine, Gorlok, Vossk, Zhaal, Brannoc, Krâgg, Saldris)
- [x] Équilibrer les boss secondaires (voir [l'équilibrage](EQUILIBRAGE.md))
- [x] Vulkhar, Souverain des flammes (phases, plongée dans la lave, Rejetons de flamme, Marteau des flammes, Éruption)
- [ ] La quête des Gardiens des Sources qui affaiblit Vulkhar
- [ ] Cartes-statut de l'acte : Bombe vivante, Paniqué, Fardeau, Cendres
- [ ] Infobulles des mots-clés, des buffs et des débuffs (appui long sur téléphone, survol sur PC)
- [ ] Prévisualisation des dégâts sur les cartes (en tenant compte de la Puissance, de la posture, de l'Armure fracassée)

### 1.3 Le Guerrier complet
- [x] Les 52 cartes du Guerrier (les épiques apparaissent rarement chez les boss secondaires, en attendant les talents)
- [x] Les sorts de barre du Guerrier : les 7 de sa fiche + 2 sorts de loot (Cri de commandement, Vague de choc), 3 emplacements
- [x] Le 4ᵉ emplacement de la barre (talent Protection)
- [ ] Améliorer un sort de barre (feu de camp, vendeur) : prévu par le concept, pas encore fait
- [x] Une illustration en pixel art par carte (62 illustrations, `tools/pixel/illustrations.py`)
- [x] Le légendaire Brisemonts et sa quête (forge éteinte → Krâgg → Reforger au feu de camp)
- [ ] Le râtelier de la guilde : garder le légendaire forgé d'une run à l'autre (phase 2)

### 1.4 Le loot et l'économie
- [x] L'or (99 au départ, gains après chaque combat, plus sur les boss secondaires)
- [x] L'équipement : 6 emplacements, règle de remplacement, fenêtre « Équipement » (16 objets dans le prototype)
- [x] Les tables de loot des 9 boss secondaires (36 objets), avec les « ??? » jusqu'au premier drop (mémorisé entre les runs)
- [x] Les coffres donnent un objet (70 % commun, 30 % rare)
- [x] Les sorts de barre dans les tables de loot (1 chance sur 5 sur un boss secondaire ; en attendant les talents, tous les sorts du Guerrier sont dans ce lot)
- [ ] Le butin de boss : 1 objet épique parmi 3
- [x] Les potions : 3 emplacements, 8 potions, 40 % de chance après un combat gagné, retrouvées après un wipe
- [x] Le coffre de la guilde : 6 places, 1 objet déposé après une victoire, 1 objet emporté au départ (perdu si la run échoue)
- [ ] Les potions dans les événements (Potions de route de Brégan, laboratoire…)
- [x] Le vendeur gobelin : 5 cartes dont une en promo, retrait et amélioration d'une carte (prix croissant)
- [x] Le vendeur gobelin : 2 objets d'équipement et 3 potions à vendre
- [x] Le vendeur gobelin : réparation des objets brisés (50 / 75 / 100 or selon la rareté)
- [x] La facture de réparation après un wipe (50, 100, 150 or), et les objets brisés

### 1.5 Les nœuds « ? »
- [x] Les événements narratifs de l'acte 1 : 9 de la fiche + la source chaude et le raideur tombé (Ventor viendra avec le Voleur) ; choix grisés avec leur raison ; chacun une fois par run
- [x] Les combats cachés : embuscade cendreuse (les ennemis frappent d'abord), gobelin mimique (vole de l'or), patrouille de la flamme
- [x] La bénédiction d'entrée de Brégan le Passeur (4 bonus parmi 8)
- [x] La quête des Gardiens des Sources (Vulkhar −15 % de PV, Marteau des flammes retardé)
- [x] ~~Les cartes de profession~~ : retirées du concept (pas de cartes neutres) ; la Potion de purification couvre la Dissipation

### 1.6 Équilibrage
- [x] Un bot qui joue des runs complètes (`npm run balance`), et une première passe sur les ennemis et les talents : voir [l'équilibrage](EQUILIBRAGE.md)
- [ ] Refaire une passe avec les retours de vrais joueurs (postures, Krâgg, Saldris, écart niveau 1 → 5)
- [ ] Noter les retours de partie dans ce document (section « Idées et retours »)

---

## Phase 2 — La progression entre les runs

- [x] Le profil du joueur (sauvegardé à part de la run) : objets découverts, coffre de la guilde, expérience des classes, statistiques
- [x] L'expérience et le niveau de classe (1 à 10) : bilan de fin de run (score ligne par ligne), 1 440 exp. pour le niveau 10, niveau affiché sur l'écran titre
- [x] Premier lancement : choix libre de la classe de départ parmi les 9, avec une fiche de présentation (seul le Guerrier est jouable pour l'instant)
- [x] Déblocage des autres classes par paliers d'expérience totale (300, 700, 1 200, 1 800, 2 500, 3 300, 4 200, 5 200), au choix du joueur — prêt, il servira avec la 2e classe
- [x] Le rattrapage : expérience doublée pour une classe tant qu'elle est en dessous du meilleur niveau atteint (prêt, il servira avec la 2e classe)
- [x] Les talents permanents du Guerrier : écran des 3 arbres (27 talents), choix avant la run, respec gratuit, récompenses orientées vers les arbres investis
- [ ] Les déblocages de cartes et d'objets par niveau
- [x] Les niveaux de difficulté (1 à 20) : choix dans le hall, débloqués en gagnant, +5 % de score par niveau
- [x] Les archives de la guilde : cartes, objets (par source), potions et monstres (histoire, PV, passif, nombre de victoires), « ??? » tant que ce n'est pas découvert
- [x] Le hall de la guilde comme écran principal : héros (niveau, talents, classes), expédition (continuer ou partir), coffre de la guilde (choisir l'objet à emporter), statistiques

---

## Phase 3 — Le contenu

### 3.1 Les actes
- [x] Acte 2 : l'Aire de Vhaeryx (Souffles, Envol, mutations, morts-vivants, 8 boss secondaires, Vhaeryx en 3 phases, Malédiction de lignée, 9 événements). La run enchaîne désormais les actes 1 et 2, avec les récompenses et le butin de boss de Vulkhar entre les deux
- [ ] Acte 3 : Irem (Folie, Hallucinations, ensevelissement, immunités)
- [ ] Acte bonus : la Nécropole céleste (éclats de clé, Gruthak, Sarvok)

### 3.2 Les classes (dans l'ordre de développement)
- [x] Guerrier (prototype)
- [x] Mage : Brûlure, Gel et Fracasser, charges arcaniques et Surcharge ; 52 cartes illustrées, 10 sorts de barre, 27 talents, sprite, et 3 objets de Sorts dans les coffres. Reste : son légendaire (Bâton du Veilleur, avec l'acte 2)
- [x] Démoniste : éclats d'âme conservés d'un combat à l'autre, prix du sang, familier (4 démons et le Seigneur infernal), DoT et Malédictions ; 52 cartes illustrées, 9 sorts de barre, 27 talents, sprites, et sa version du Bâton du Veilleur
- [x] Prêtre : l'Égide (bouclier persistant, soins excédentaires convertis), la Foi, la Forme d'Ombre ; 53 cartes illustrées, 9 sorts de barre, 27 talents, sprite, et son légendaire Équinoxe avec sa quête
- [ ] Voleur
- [ ] Paladin
- [ ] Chasseur
- [ ] Chaman
- [ ] Druide

Pour chaque classe : ses mécaniques, ses cartes et illustrations, ses sorts de barre, ses talents, son légendaire et sa quête, et son sprite.

### 3.3 Les légendaires
- [ ] Le légendaire forgé est gardé pour toujours (râtelier de la guilde), à emporter en plus d'un objet du coffre (si on prend le légendaire, l'objet du coffre ne peut pas être une arme)
- [x] Brisemonts (Guerrier) et le Bâton du Veilleur (Mage, Démoniste) se forgent à l'acte 2
- [x] Équinoxe (Prêtre)
- [ ] Les légendaires restants et leurs quêtes (Sillon d'orage, l'Aurore ardente, Corde-des-anciens, le Marteau des ancêtres), avec leurs classes
- [x] Refaire la passe sur les niveaux de difficulté pour deux actes (voir l'équilibrage, §9)

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
- [ ] Polish visuel de la présentation des classes : portraits, emblèmes dessinés, mise en page plus soignée de l'écran des classes et du hall
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
- [x] Voir ce que font les cartes épiques dans les talents → illustration, coût et effets
- [x] Passe de cohérence : aperçu avant/après des améliorations, passifs des ennemis affichés, textes d'Exécution, de Pourfendre et de la Zone de feu qui suivent les talents et l'équipement, pioche et défausse consultables, objets sans effet pour le Guerrier signalés, Potion de force et Malédiction renommées, barre du haut cliquable partout
- [ ] …
