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
- [ ] Carte de l'acte à embranchements (10 étages, nœuds de combat, boss secondaire, feu de camp, vendeur, quête, coffre)
- [ ] Bénédiction d'entrée de Brégan le Passeur
- [ ] Écran de fin de run (score, statistiques)

### 1.2 Le combat
- [ ] Tous les ennemis de trash de l'acte 1, et leurs packs
- [ ] Les 9 boss secondaires de l'acte 1, avec leurs mécaniques
- [ ] Vulkhar, Souverain des flammes (phases, plongée dans la lave, Marteau des flammes)
- [ ] Cartes-statut de l'acte : Bombe vivante, Paniqué, Fardeau, Cendres
- [ ] Infobulles des mots-clés, des buffs et des débuffs (appui long sur téléphone, survol sur PC)
- [ ] Prévisualisation des dégâts sur les cartes (en tenant compte de la Puissance, de la posture, de l'Armure fracassée)

### 1.3 Le Guerrier complet
- [ ] Les 52 cartes du Guerrier
- [ ] Les 7 sorts de barre, et le 4ᵉ emplacement
- [ ] Une illustration en pixel art par carte
- [ ] Le légendaire Brisemonts et sa quête

### 1.4 Le loot et l'économie
- [ ] L'or (gains après chaque combat)
- [ ] L'équipement : 6 emplacements, règle de remplacement, fiche du héros
- [ ] Les tables de loot des boss, avec les silhouettes « ??? » jusqu'au premier drop
- [ ] Le butin de boss : 1 objet épique parmi 3
- [ ] Les potions (3 emplacements)
- [ ] Le vendeur gobelin : cartes, équipement, potions, amélioration, retrait, réparation
- [ ] La facture de réparation après un wipe, et les objets brisés

### 1.5 Les nœuds « ? »
- [ ] Les événements narratifs de l'acte 1
- [ ] Les combats cachés (embuscade, gobelin mimique, patrouille)
- [ ] La quête des Gardiens des Sources (affaiblit Vulkhar)

### 1.6 Équilibrage
- [ ] Tester des runs complètes et ajuster les PV, les dégâts et les récompenses
- [ ] Noter les retours de partie dans ce document (section « Idées et retours »)

---

## Phase 2 — La progression entre les runs

- [ ] Le profil du joueur (sauvegardé à part de la run)
- [ ] L'expérience et le niveau de classe (1 à 10)
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
- [ ] Prévoir la migration des sauvegardes quand leur format change (numéro de version déjà présent)
- [ ] Ajouter des tests à chaque nouvelle mécanique
- [ ] Suivre les bugs et les idées avec les « Issues » GitHub (optionnel)

---

## Questions encore ouvertes

Reprises du [concept](CONCEPT.md#19-questions-ouvertes) :
- [ ] Classes du premier prototype jouable en plus du Guerrier
- [ ] Ordre de déblocage des classes
- [ ] Noms de l'univers à ajuster (Eldrava, Vulkhar, Vhaeryx, Irem, Sarvok…)

---

## Idées et retours

*Ajoute ici tes idées et tes retours de partie, en vrac. On les rangera dans les phases au fur et à mesure.*

- [x] Lire les cartes plus facilement sur téléphone → police Nunito
- [x] Jouer en plein écran → bouton Plein écran et installation comme application
- [x] Rendre les attaques plus vivantes → animations de combat
- [x] Animations un peu trop rapides → ralenties
- [ ] …
