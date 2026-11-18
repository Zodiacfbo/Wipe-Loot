# Wipe & Loot — Document de concept

> Titre provisoire · Version 0.2 · Projet personnel / fan game

---

## Sommaire

1. [Pitch](#1-pitch)
2. [Piliers de design](#2-piliers-de-design)
3. [Structure d'une run](#3-structure-dune-run)
4. [Le héros](#4-le-héros)
5. [Le combat](#5-le-combat)
6. [Les cartes](#6-les-cartes)
7. [Les classes](#7-les-classes)
8. [Spécialisations et talents](#8-spécialisations-et-talents)
9. [Les ennemis](#9-les-ennemis)
10. [Les raids (actes)](#10-les-raids-actes)
11. [Récompenses](#11-récompenses)
12. [Les événements](#12-les-événements)
13. [Le vendeur gobelin](#13-le-vendeur-gobelin)
14. [Progression](#14-progression)
15. [Plateformes et interface](#15-plateformes-et-interface)
16. [Direction artistique et ambiance](#16-direction-artistique-et-ambiance)
17. [Décisions prises](#17-décisions-prises)
18. [Questions ouvertes](#18-questions-ouvertes)
19. [Prochaines étapes](#19-prochaines-étapes)

---

## 1. Pitch

**Wipe & Loot** est un **deckbuilder roguelike** dans la lignée de *Slay the Spire*, situé dans l'univers de **World of Warcraft**.

Le joueur incarne **seul** un héros d'une des 9 classes de WoW Classic et s'attaque aux **raids mythiques d'Azeroth** : le Cœur du Magma, le Repaire de l'Aile noire, Ahn'Qiraj… Chaque boss reprend ses **mécaniques iconiques**, traduites en règles de cartes. On meurt (« wipe »), on recommence, on débloque, on progresse.

**Phrase d'accroche :** *« Chaque boss est une mécanique, chaque loot est une décision. »*

**Plateformes :** navigateur sur PC et smartphone.

---

## 2. Piliers de design

1. **L'identité de classe avant tout**
   Chaque classe a sa propre ressource, ses propres contraintes et ses sorts iconiques. Jouer un Guerrier et jouer un Mage doivent donner deux expériences différentes.

2. **Les boss sont des mécaniques, pas des sacs à PV**
   Interrompre, sortir du feu, dissiper, gérer les phases, battre l'enrage : le joueur doit *lire* le combat comme un raideur lit un boss.

3. **La nostalgie Classic, en restant simple**
   Arbres de talents, fragments d'harmonisation, objets légendaires, professions, buffs mondiaux. On garde la saveur sans la complexité d'un MMO.

4. **Facile à prendre en main, profond à maîtriser**
   Les systèmes annexes (l'équipement par exemple) restent volontairement légers. La profondeur vient des cartes et des synergies.

5. **Des runs courtes et jouables partout**
   Une run complète doit tenir en une session raisonnable, sur PC comme sur téléphone.

---

## 3. Structure d'une run

### 3.1 Vue d'ensemble

```
Choix de la classe ─► Bénédiction d'entrée
   └─► Acte 1 : Cœur du Magma        (10 étages)
   └─► Acte 2 : Repaire de l'Aile noire (10 étages)
   └─► Acte 3 : Ahn'Qiraj             (10 étages)
   └─► [Acte bonus : Naxxramas]       (court, si les 3 fragments sont réunis)
```

- Une **run** = **3 actes de 10 étages**, plus un acte bonus facultatif.
- **Durée visée :** environ **45 minutes à 1 heure** pour une run complète.
- Chaque acte est une **carte à embranchements** : le joueur choisit son chemin d'étage en étage.
- **Après chaque combat**, le joueur choisit une carte parmi 3 (ou n'en prend aucune).
- **Après chaque boss**, il gagne un **point de talent** (voir §8).
- **La mort met fin à la run.** Le joueur gagne quand même de l'expérience pour sa classe (voir §14).

### 3.2 Les nœuds de la carte

| Nœud | Équivalent StS | Description |
|---|---|---|
| ⚔️ **Pack de trash** | Combat | Combat standard contre les monstres du raid. |
| 💀 **Boss secondaire** | Élite | Un boss du raid avec sa mécanique (Magmadar, Garr…). Meilleur loot. |
| 🔥 **Feu de camp** | Repos | **Se reposer** (soigne 30 % des PV max) **ou** aller voir le **maître de classe** (améliorer une carte). |
| 💰 **Vendeur gobelin** | Marchand | Achat de cartes, de potions et d'objets, retrait de cartes (voir §13). |
| ❓ **Quête** | Événement | Rencontres avec des PNJ du lore, choix narratifs et étapes des quêtes légendaires (voir §12). |
| 📦 **Coffre** | Trésor | Loot gratuit : équipement ou relique. |
| 👑 **Boss de fin d'acte** | Boss | Le boss final du raid : Ragnaros, Nefarian, C'Thun… |

### 3.3 Structure d'un acte (10 étages)

| Étage | Contenu |
|---|---|
| **1** | Toujours un **pack de trash** (combat facile). |
| **2 à 4** | Trash, quêtes, vendeur. Pas encore de boss secondaire. |
| **5** | Toujours un **coffre**. |
| **6 à 8** | Tout type de nœud, **boss secondaires possibles**. |
| **9** | Toujours un **feu de camp**, juste avant le boss. |
| **10** | **Boss de fin d'acte.** |

- La carte propose **3 à 4 chemins** qui se croisent, comme dans StS.
- Un chemin « prudent » passe par peu de boss secondaires. Un chemin « gourmand » en enchaîne 2 ou 3, pour plus de loot et de risque.
- Les boss secondaires sont **tirés au hasard** dans le pool du raid : on ne les affronte pas tous à chaque run. Cela renouvelle les parties.

### 3.4 Modes futurs (hors première version)

- **Mode rapide** : un seul acte (ou 3 actes de 5 étages), pour une partie de 15 à 20 minutes.
- **Mode infini (endless)** : après Naxxramas, les raids recommencent en boucle avec une difficulté croissante, jusqu'à la mort. Le but est le meilleur score.
- Plus tard, de **nouveaux raids** (The Burning Crusade, Wrath of the Lich King…) pourraient s'ajouter comme nouveaux actes ou nouvelles campagnes.

---

## 4. Le héros

### 4.1 Statistiques de base

| Statistique | Valeur de départ (indicative) |
|---|---|
| **PV max** | 65 à 80 selon la classe (les classes en plaques ont plus de PV que les classes en tissu) |
| **Énergie** | **3 par tour**, commune à toutes les classes |
| **Pioche** | 5 cartes par tour |
| **Ressource de classe** | Propre à chaque classe (voir §4.2) |
| **Emplacements de potions** | 3 |
| **Or** | 99 au départ |
| **Deck de départ** | 10 cartes (voir §6.5) |

Les PV **ne remontent pas** automatiquement entre les combats. On se soigne aux feux de camp, avec des potions, des reliques ou des cartes.

### 4.2 Énergie commune + ressource de classe

**Toutes les classes** jouent leurs cartes avec la même **énergie (3 par tour)**, comme dans StS. Cela rend l'équilibrage plus simple.

**En plus**, chaque classe a **sa ressource à elle**, qui porte son identité :

| Classe | Ressource de classe | Fonctionnement |
|---|---|---|
| **Guerrier** | **Rage** | Se gagne en frappant et en étant frappé. Certaines cartes coûtent de l'énergie **et** de la rage, ou deviennent plus fortes avec plus de rage. |
| **Voleur** | **Points de combo** (max 5) | Les générateurs en donnent, les finishers les consomment pour un effet proportionnel. |
| **Mage** | **Charges d'école** | Givre : Gel sur l'ennemi. Feu : Enflammer. Arcane : Charges arcaniques. |
| **Démoniste** | **Fragments d'âme** | Gagnés quand un ennemi meurt sous Drain d'âme. Consommés par les sorts les plus puissants. |
| **Chasseur** | **Familier** | Pas une ressource chiffrée : le familier est une entité alliée qui attaque chaque tour. |
| **Paladin** | **Sceau actif** | Un seul Sceau à la fois. Le Jugement le consomme pour un effet puissant. |
| **Prêtre** | **Foi** | Gagnée en soignant au-delà de ses PV max ou en protégeant avec un Bouclier. |
| **Chaman** | **Totems** (4 emplacements) | Les totems posés restent en jeu et agissent chaque tour. |
| **Druide** | **Forme** | La forme active (Ours, Félin, Sélénien) change ce que les cartes font. |

---

## 5. Le combat

### 5.1 Le tour de jeu

1. **Début du tour du joueur** : le blocage restant disparaît, le joueur récupère 3 énergie et pioche 5 cartes.
2. **Phase du joueur** : il joue ses cartes dans l'ordre qu'il veut, tant qu'il a de l'énergie.
3. **Fin du tour du joueur** : les cartes restantes en main sont défaussées (sauf effets contraires). Les effets « en fin de tour » s'appliquent (Zone de feu, Bombe vivante…).
4. **Tour des ennemis** : chaque ennemi exécute l'**intention** qu'il affichait, puis montre la suivante.

Quand la pioche est vide, la défausse est mélangée pour former une nouvelle pioche.

### 5.2 Les intentions des ennemis

Les ennemis annoncent toujours leur prochaine action. Les types d'intention :

| Intention | Icône (idée) | Effet |
|---|---|---|
| **Attaque** | Épée | Inflige des dégâts (le montant est affiché). |
| **Défense** | Bouclier | Gagne du blocage. |
| **Renforcement** | Flèche vers le haut | Se renforce, ou renforce un allié. |
| **Affaiblissement** | Crâne | Applique un débuff au joueur, ou ajoute une carte-statut dans son deck. |
| **Invocation** | Portail | Fait apparaître des adds. |
| **Incantation** | **Barre de cast** | Un sort puissant qui prend effet **au tour suivant**. Il peut être **interrompu**. |

L'**Incantation** est la mécanique signature du jeu. Un boss commence à lancer *Pyroblast* : la barre de cast s'affiche, et le joueur a un tour pour réagir (interrompre, se protéger ou tuer le lanceur avant la fin de l'incantation).

### 5.3 Les ajouts WoW

| Mécanique WoW | Traduction en cartes |
|---|---|
| **Interruption** | Les cartes avec le mot-clé **Interruption** (Coup de pied, Contresort, Volée de coups, Horion de terre…) annulent l'incantation en cours. |
| **Enrage timer** | Après un nombre de tours défini, le boss passe en **Berserk** : ses dégâts sont fortement augmentés. Le compteur est visible en permanence. Cela empêche le jeu trop défensif. |
| **Phases** | Le boss change de comportement et de règles à certains seuils de PV (75 %, 50 %, 25 %…). |
| **« Ne restez pas dans le feu »** | Une carte-statut **Zone de feu** est ajoutée à la main du joueur. S'il ne la joue pas (coût 1 : « Bouger »), elle lui inflige des dégâts en fin de tour. |
| **Malédictions, poisons, magie, maladies** | Des débuffs typés qui ne s'enlèvent qu'avec une carte de **Dissipation** du bon type. Toutes les classes ne peuvent pas tout dissiper, et c'est voulu. |
| **Adds** | Des ennemis secondaires invoqués par le boss. Le **contrôle des foules** (Métamorphose, Peur, Piège givrant, Assommer) prend tout son sens. |

### 5.4 Mots-clés

| Mot-clé | Effet |
|---|---|
| **Interruption** | Annule l'incantation en cours de la cible. |
| **Dissipation (type)** | Retire un débuff du type indiqué (Magie, Malédiction, Poison, Maladie). |
| **DoT (X)** | Inflige X dégâts au début de chaque tour de l'ennemi, pendant plusieurs tours. |
| **Contrôle** | La cible saute son prochain tour. Les boss y sont immunisés. |
| **Épuisé** | La carte est retirée pour le reste du combat une fois jouée. |
| **Éphémère** | Si la carte est encore en main à la fin du tour, elle est retirée du combat. |
| **Persistant** | La carte n'est pas défaussée en fin de tour. |
| **Inné** | La carte est toujours dans la main de départ du combat. |
| **Injouable** | La carte ne peut pas être jouée (statuts, malédictions). |

### 5.5 Buffs et débuffs principaux

On garde une liste **courte**, avec des noms qui sentent WoW :

| Effet | Type | Effet en jeu |
|---|---|---|
| **Puissance** | Buff | +1 dégât par point sur chaque attaque et chaque sort de dégâts. |
| **Robustesse** | Buff | +1 blocage par point sur chaque carte qui donne du blocage. |
| **Armure fracassée** | Débuff | La cible subit 50 % de dégâts en plus (inspiré de Fracasser armure). |
| **Démoralisé** | Débuff | La cible inflige 25 % de dégâts en moins (inspiré de Cri démoralisant). |
| **Ralenti** | Débuff | Le blocage gagné par la cible est réduit de 25 %. |
| **Gel** | Débuff | Spécifique au Mage : la cible gelée subit des critiques garantis avec Fracasser. |
| **Peur** | Débuff | La cible ne peut pas agir pendant un tour (comme Contrôle). |

---

## 6. Les cartes

### 6.1 Types de cartes

| Type | Description |
|---|---|
| **Attaque** | Inflige des dégâts physiques (Frappe héroïque, Attaque pernicieuse…). |
| **Sort** | Inflige des dégâts magiques, ou produit un effet magique (Boule de feu, Corruption…). |
| **Compétence** | Défense et utilitaire : blocage, pioche, interruption, dissipation… |
| **Pouvoir** | Un effet permanent pour tout le combat (Posture de combat, Forme d'Ombre, Aura de dévotion…). |
| **Statut** | Une carte négative temporaire ajoutée par un ennemi (Zone de feu, Bombe vivante…). Elle disparaît à la fin du combat. |
| **Malédiction** | Une carte négative **permanente** dans le deck, obtenue via certains événements ou certaines reliques. Il faut l'enlever chez le vendeur. |

La distinction entre **Attaque** et **Sort** permet des mécaniques WoW : un ennemi qui *réduit au silence* bloque les Sorts, un autre qui *désarme* bloque les Attaques.

### 6.2 Raretés (couleurs WoW)

| Rareté | Couleur | Fréquence |
|---|---|---|
| **De départ** | Gris | Uniquement dans le deck de départ. |
| **Commune** | Blanc | Très fréquente dans les récompenses. |
| **Peu commune** | Vert | Fréquente. |
| **Rare** | Bleu | Peu fréquente, plus probable après un boss secondaire. |
| **Épique** | Violet | Les cartes signatures de spécialisation, débloquées par les talents (voir §8). |

L'**orange (légendaire)** est réservé aux **armes légendaires** (voir §11.3).

### 6.3 Amélioration

- Chaque carte peut être **améliorée une fois** (Frappe héroïque → **Frappe héroïque+**).
- L'amélioration augmente les chiffres, réduit le coût ou ajoute un effet.
- On améliore une carte au **feu de camp** (maître de classe), grâce à certains événements ou à certaines reliques.

### 6.4 Les cartes neutres : les professions

Les cartes neutres, jouables par toutes les classes, viennent des **professions** de WoW :

| Profession | Exemples de cartes |
|---|---|
| **Ingénierie** | Bombe en fer (dégâts à tous les ennemis), Filet-o-matic (Contrôle), Grenade gobeline |
| **Alchimie** | Transmutation (transforme une carte), Pierre philosophale |
| **Premiers soins** | Bandage en étoffe runique (soin), Antidote (dissipe un Poison) |
| **Forge, Enchantement…** | Pierre à aiguiser (+dégâts à une attaque), Enchantement de l'arme (bonus pour le combat) |

On les obtient surtout via les **événements** et le **vendeur gobelin**.

### 6.5 Taille du pool

- **Deck de départ :** 10 cartes, par exemple 4 attaques basiques, 4 défenses basiques et 2 cartes de classe.
- **Pool par classe :** environ **50 cartes** pour la première version, réparties sur les 3 arbres de talents et un tronc commun.
- **Cartes neutres :** environ 15 à 20.
- **Statuts et malédictions :** environ 10 à 15.

---

## 7. Les classes

Le jeu proposera les **9 classes de WoW Classic**. Chacune a une **mécanique principale** qui la rend unique. Le détail de chaque classe (cartes, talents, deck de départ) fera l'objet d'un document séparé.

| Classe | Mécanique principale | Sorts iconiques |
|---|---|---|
| **Guerrier** | **Rage** : se gagne en frappant et en étant frappé, sans régénération naturelle. **Postures** (Armes / Fureur / Défensive) qui modifient les effets des cartes. | Charge, Frappe héroïque, Frappe mortelle, **Exécution** (consomme toute la rage), Tourbillon, Sanguinaire, Heurt de bouclier, Mur protecteur |
| **Voleur** | **Points de combo** : les générateurs en donnent, les finishers les consomment. **Camouflage** : une carte d'ouverture spéciale jouable au tour 1. | Attaque pernicieuse, Attaque sournoise, Éviscération, Débiter, Aiguillon perfide, Disparition, Poisons |
| **Mage** | **Écoles de magie** : Givre (geler l'ennemi, puis *Fracasser* = critiques garantis), Feu (*Enflammer* qui s'accumule, Combustion), Arcane (charges arcaniques, Arcanes surpuissants). | Éclair de givre, Boule de feu, Pyroblast, Nova de givre, Métamorphose, Bloc de glace, Évocation, Contresort |
| **Démoniste** | **Démon familier** permanent (Diablotin, Marcheur du Vide, Succube, Chasseur corrompu). **DoTs** qui s'accumulent. **Connexion** : sacrifier des PV contre de l'énergie. **Fragments d'âme**. | Corruption, Malédiction d'agonie, Immolation, Trait de l'ombre, Feu de l'âme, Peur, Voile mortel |
| **Chasseur** | **Familier** autonome qui attaque chaque tour et obéit à des cartes d'ordre. **Aspects** (sortes de postures). **Pièges** posés à l'avance, qui se déclenchent quand l'ennemi agit. | Visée, Flèches multiples, Piqûre de serpent, Marque du chasseur, Piège givrant, Feindre la mort |
| **Paladin** | **Sceaux et Jugement** : un Sceau actif améliore les attaques, le Jugement le consomme pour un effet puissant. **Auras** passives. | Sceau de vertu, Sceau du croisé, Jugement, Consécration, Marteau de la justice, Bouclier divin, Imposition des mains |
| **Prêtre** | **Boucliers persistants** (Mot de pouvoir : Bouclier) et **Foi** gagnée avec les soins en excès. **Forme d'Ombre** qui transforme le style de jeu. | Mot de l'ombre : Douleur, Fouet mental, Étreinte vampirique, Châtiment, Flammes sacrées, Infusion de puissance |
| **Chaman** | **4 emplacements de totems** (Terre, Feu, Eau, Air) : des entités persistantes avec un effet à chaque tour. **Réincarnation** : une résurrection par run. | Éclair, Chaîne d'éclairs, Horion de terre, Horion de flammes, Arme Furie-des-vents, Frappe-tempête, Vague de soins |
| **Druide** | **Formes** : Ours (blocage, rage), Félin (combo), Sélénien / lanceur de sorts. Les cartes ont un **tag de forme**, et changer de forme coûte une action. | Mutilation, Morsure féroce, Rugissement, Éclat lunaire, Feu stellaire, Colère, Récupération, Renaissance, Innervation |

**Pour la première version**, on vise **3 classes** très différentes (voir §18). Les autres arriveront ensuite.

---

## 8. Spécialisations et talents

Le joueur ne choisit **pas sa spécialisation au départ**. Il choisit une **classe**, et sa spé se construit **au fil de la run**, comme les arbres de talents de Classic.

- Chaque classe possède **3 arbres de talents**, ceux de Classic (Guerrier : Armes / Fureur / Protection ; Mage : Arcane / Feu / Givre ; etc.).
- Le joueur gagne **un point de talent après chaque boss** (secondaire ou de fin d'acte). Sur une run complète, cela représente environ **6 à 9 points**.
- Chaque arbre compte **5 paliers**. Il faut avoir investi dans un palier pour accéder au suivant.
- Plus le joueur investit dans un arbre, plus les **récompenses de cartes** proposées après les combats penchent vers cet arbre.
- Le **dernier palier** de chaque arbre débloque les **cartes épiques** de la spécialisation (Frappe mortelle, Sanguinaire, Heurt de bouclier, Pyroblast, Forme d'Ombre…), qui apparaissent alors dans les récompenses.
- Les **builds hybrides** sont possibles et encouragés, dans l'esprit de Classic.

> **Exemple :** un Guerrier qui met ses 3 premiers points en Protection verra plus de cartes de blocage et de Heurt de bouclier, mais il peut ensuite basculer vers Fureur pour un build « tank qui tape ».

---

## 9. Les ennemis

### 9.1 Les trois catégories

| Catégorie | Description | Exemples (Cœur du Magma) |
|---|---|---|
| **Trash** | Ennemis standard, souvent en groupe de 1 à 4. Comportements simples et prévisibles. | Chien du Magma, Géant de lave, Surineur du Magma |
| **Boss secondaire** | Un boss du raid avec **une mécanique principale** à gérer. Plus de PV, meilleur loot. | Magmadar, Garr, Baron Geddon |
| **Boss de fin d'acte** | Le boss final, avec **plusieurs phases**, un **enrage timer** et au moins une mécanique unique. | Ragnaros |

### 9.2 Principes de design

- **Une mécanique claire par ennemi.** Le joueur doit comprendre en un tour ce que fait l'ennemi.
- **Des combats qui posent une question.** Chaque boss secondaire teste une compétence : interrompre, dissiper, tuer les adds, tenir sous la pression, faire beaucoup de dégâts vite…
- **Aucune classe ne doit être bloquée.** Si un boss exige une Dissipation, il doit exister une alternative (une potion, une carte neutre, encaisser).
- **Les packs de trash ont un thème.** Ils annoncent les mécaniques du raid et préparent aux boss.

### 9.3 Progression de la difficulté

- L'acte 2 et l'acte 3 ont des ennemis plus nombreux, plus résistants et plus complexes.
- Les **premiers combats de chaque acte** sont plus faciles, pour laisser le joueur s'adapter.
- Les niveaux de difficulté (voir §14.2) ajoutent des modificateurs par-dessus.

---

## 10. Les raids (actes)

On commence par **WoW Classic**. Chaque raid est un acte, avec ses monstres de trash, un pool de boss secondaires (élites) et son boss final. Le **lore** du raid sert de fil narratif à l'acte.

### Acte 1 — Le Cœur du Magma
*Les profondeurs du mont Rochenoire. Le Seigneur du feu Ragnaros est revenu.*

- **Trash** : Chiens du Magma, Géants de lave, Seigneurs du feu, Surineurs du Magma
- **Pool de boss secondaires** :
  - **Lucifron** : lance des malédictions qu'il faut dissiper.
  - **Magmadar** : *Panique*, certaines cartes en main deviennent injouables pendant un tour.
  - **Gehennas** : *Pluie de feu*, des cartes Zone de feu arrivent en main.
  - **Garr** : accompagné d'adds qui explosent à leur mort.
  - **Baron Geddon** : *Bombe vivante*, une carte qui t'inflige de lourds dégâts si elle est encore dans ta main en fin de tour.
  - **Shazzrah** : se téléporte et contre tes sorts.
  - **Sulfuron** : soigne ses lieutenants, qu'il faut interrompre.
  - **Golemagg** : accompagné de deux Rageurs du Magma.
  - **Majordome Executus** : entouré de ses gardes, qu'il protège avec des boucliers.
- **Boss final** : **Ragnaros**
  - *Courroux de Ragnaros* : défausse ta main.
  - Au tour X, il **submerge** : des **Fils de la flamme** apparaissent et il faut les tuer avant son retour.
- **Événement spécial** : les **Seigneurs de l'eau d'Hydraxis** te confient de quoi éteindre les runes du Cœur du Magma, ce qui affaiblit Ragnaros.

### Acte 2 — Le Repaire de l'Aile noire
*Le sommet du mont Rochenoire. Nefarian mène ses expériences sur les dragons chromatiques.*

- **Pool de boss secondaires** :
  - **Tranchetripe l'Indompté** : une phase de contrôle d'orbe.
  - **Vaelastrasz le Corrompu** : *Adrénaline brûlante*, énergie illimitée mais tu brûles à chaque tour. Une course contre la montre.
  - **Seigneur des couvées Lashlayer** : il frappe de plus en plus fort tant qu'on ne le tue pas.
  - **Gueule-de-feu, Ebonroc, Flamegor** : les souffles des dragons.
  - **Chromaggus** : souffles aléatoires et 5 afflictions de couvée. Si elles s'accumulent, tu es transformé.
- **Boss final** : **Nefarian**
  - **Appels de classe** : des effets qui visent **spécifiquement la classe du joueur**.

### Acte 3 — Ahn'Qiraj
*Les profondeurs du temple d'Ahn'Qiraj. Un Dieu très ancien rêve sous le sable.*

- **Pool de boss secondaires** :
  - **Le Prophète Skeram** : crée des copies de lui-même.
  - **Les Empereurs jumeaux** : ils échangent leurs positions et chacun est immunisé à un type de dégâts (l'un aux Attaques, l'autre aux Sorts).
  - **Ouro**, **la Famille royale insectoïde**, **Viscidus**…
- **Boss final** : **C'Thun**
  - Phase 1 : l'**Œil**, avec des rayons qui se propagent.
  - Phase 2 : le corps, et une phase **dans l'estomac** où le joueur combat avec une main réduite.

### Acte bonus — Naxxramas
*La nécropole flottante du Fléau.*

- Débloqué en récupérant les **3 fragments d'harmonisation** pendant la run (voir §14.1), comme l'acte 4 de StS avec ses 3 clés.
- **Acte court** : un feu de camp, un vendeur, un boss secondaire, puis le boss final.
- **Boss final** : **Kel'Thuzad**. C'est la vraie fin du jeu.

### Plus tard
- **Pools de boss de fin d'acte** : comme dans StS, chaque acte pourrait tirer son boss final parmi plusieurs. Par exemple, l'acte 1 pourrait se terminer par Ragnaros **ou Onyxia** (« Many whelps! Handle it! »), et l'acte 2 par Nefarian **ou Hakkar** (Zul'Gurub).

---

## 11. Récompenses

### 11.1 Les cartes
Après chaque combat, le joueur choisit une carte parmi 3, ou n'en prend aucune. Les cartes proposées dépendent de la classe et des talents investis (voir §8). Après un boss secondaire, les chances d'obtenir une carte rare sont plus élevées.

### 11.2 L'équipement (volontairement simple)

**6 emplacements :**

| Emplacement | Rôle |
|---|---|
| **Arme** | Renforce les attaques ou les sorts. C'est l'emplacement des légendaires. |
| **Amulette** | Un bonus défensif ou de survie (PV max, blocage de départ, soins). |
| **Bague 1** | Un petit bonus de statistiques (+dégâts, +blocage, +or…). |
| **Bague 2** | Un petit bonus de statistiques. |
| **Bijou 1** | Un effet spécial ou un déclencheur (« le premier sort de chaque combat coûte 0 »). |
| **Bijou 2** | Un effet spécial ou un déclencheur. |

**Une seule règle :** un nouvel objet **remplace** celui de son emplacement, ou le joueur le **refuse**.

**Ce qu'on ne fait volontairement pas :**
- pas d'inventaire ;
- pas de statistiques chiffrées à comparer ;
- pas de raretés à gérer (la couleur est purement visuelle) ;
- pas de bonus de set ;
- pas de restrictions plaque / maille / cuir / tissu : le loot proposé est déjà adapté à la classe.

**Où trouver de l'équipement :** dans les coffres, sur les boss secondaires (une chance), chez le vendeur gobelin et dans certains événements.

### 11.3 Les légendaires de classe

Chaque classe a **son arme légendaire**, qui amplifie sa mécanique principale.

| Classe | Légendaire | Effet (première idée) |
|---|---|---|
| **Guerrier** | **Quel'Serrar** | Chaque fois que tu prends des dégâts, gagne +1 rage supplémentaire. |
| **Paladin** | **Porte-cendres** | Tes Jugements infligent des dégâts doublés aux morts-vivants et aux démons, et te soignent. |
| **Chasseur** | **Rhok'delar** | Ton familier attaque une fois de plus chaque tour. |
| **Voleur** | **Tonnerre-furie** | Tes attaques ont une chance de déclencher un éclair qui frappe tous les ennemis. |
| **Prêtre** | **Bénédiction / Anathème** | Une arme double : elle change d'effet selon que tu es en forme Sacrée ou en forme d'Ombre. |
| **Chaman** | **Marteau-du-destin** | Tes totems ont un emplacement de plus, ou se déclenchent deux fois. |
| **Mage** | **Atiesh (version Mage)** | Le premier sort de chaque tour coûte 0. |
| **Démoniste** | **Atiesh (version Démoniste)** | Connexion ne coûte plus de PV une fois par tour, et tes DoTs durent 1 tour de plus. |
| **Druide** | **Atiesh (version Druide)** | Changer de forme ne coûte plus d'action. |

**Règles d'obtention :**
- chaque légendaire s'obtient via une **petite chaîne de quête de 2 ou 3 étapes**, réparties sur les événements « ? » et les boss de la run ;
- **un seul légendaire par run** ;
- *Exemple (Voleur, Tonnerre-furie)* : récupérer la Garde liée de gauche sur **Garr**, celle de droite sur le **Baron Geddon**, puis trouver l'événement **Prince Tonneraan** pour forger l'arme.

### 11.4 Les reliques
Des **objets passifs** sans emplacement, qui s'accumulent comme dans StS. Trois sources :
- **Reliques communes** : dans les coffres et sur les boss secondaires.
- **Butin de boss** : après chaque boss de fin d'acte, choix parmi 3 reliques puissantes, souvent avec un inconvénient (voir §14.1).
- **Reliques de boutique** : chez le vendeur gobelin.

Exemples d'inspiration :
- **Objets de lore** : Pierre de foyer, Clé du Repaire de l'Aile noire, Œil de Sulfuron, Tête d'Onyxia…
- **Buffs mondiaux** (actifs pour quelques combats seulement) : Fleur-de-chant, Bénédiction du Chef de guerre, Cri de ralliement du Pourfendeur de dragons.

### 11.5 Les potions (consommables)
- **3 emplacements** au départ.
- Elles se trouvent après les combats (une chance), dans les événements et chez le vendeur.
- Exemples : Flacon des Titans, Élixir de la mangouste, Pierre de soins, Potion de protection contre le feu, Potion de soins majeure, Potion de rage puissante…

### 11.6 L'or
L'or se gagne après chaque combat (plus sur les boss secondaires) et dans certains événements. Il se dépense chez le vendeur gobelin.

---

## 12. Les événements

Les nœuds « ? » proposent une petite scène narrative avec **2 ou 3 choix**, souvent avec un risque ou une contrepartie. Ils font vivre le **lore** et portent les **quêtes légendaires**.

**Exemples :**

| Événement | Acte | Choix (idée) |
|---|---|---|
| **Les Seigneurs de l'eau d'Hydraxis** | 1 | Accepter la quête (affaiblit Ragnaros, mais il faut battre un boss secondaire) / Refuser. |
| **Un gobelin coincé dans un coffre** | Tous | Le libérer (récompense aléatoire, ou un piège) / Prendre le coffre et partir (or, mais une malédiction). |
| **Pierre d'invocation** | Tous | Invoquer un « membre du raid » : gagner une carte neutre / Payer en PV pour retirer une carte du deck. |
| **Le joueur qui fonce** | Tous | Un aventurier fonce dans le pack en criant son nom. L'aider (combat difficile, grosse récompense) / Le laisser (rien ne se passe). |
| **Le Prince Tonneraan** | 1 | Étape de la quête de Tonnerre-furie. |
| **Les œufs de dragon** | 2 | Détruire les œufs (combat contre des dragonnets, puis récompense) / Les laisser (Nefarian aura un add de plus). |
| **Le gong du Seigneur Scarabée** | 3 | Frapper le gong (une relique puissante, mais le prochain combat est plus dur) / Passer son chemin. |
| **L'Aube d'argent** | 3 | Recevoir une bénédiction contre les morts-vivants / Obtenir un indice sur un fragment d'harmonisation. |
| **Le fantôme du raideur** | Tous | Un raideur mort dans un wipe précédent. Récupérer son équipement (un objet, plus une malédiction) / Le laisser reposer (soin). |

---

## 13. Le vendeur gobelin

Le vendeur propose à chaque visite :

| Rayon | Contenu | Prix (indicatif) |
|---|---|---|
| **Cartes de classe** | 5 cartes | 50 à 150 or selon la rareté |
| **Cartes de profession** | 2 cartes neutres | 80 à 180 or |
| **Équipement** | 1 ou 2 objets | 120 à 200 or |
| **Reliques** | 2 reliques | 150 à 300 or |
| **Potions** | 3 potions | 50 à 100 or |
| **Service : retirer une carte** | 1 fois par visite | 75 or, puis +25 à chaque utilisation pendant la run |

Le prix d'une des cartes est réduit de moitié (« promo du jour »).

---

## 14. Progression (inspirée de Slay the Spire)

Le principe de StS est repris tel quel : **le joueur ne devient pas plus fort d'une run à l'autre**. Il débloque du **contenu** (nouvelles cartes, reliques, classes) et de la **difficulté**. Toute la puissance se gagne pendant la run.

### 14.1 Pendant la run

| Élément StS | Version WoW |
|---|---|
| **Bénédiction de Neow** en début de run | **Bénédiction à l'entrée du raid** : un PNJ (par exemple Lothos Rift-waker à l'entrée du Cœur du Magma) propose un choix parmi 4 bonus de départ, dont certains avec une contrepartie (« Perds 10 PV max, obtiens une relique rare »). |
| Deck de départ basique | **Deck de départ de la classe** : 10 cartes (voir §6.5). |
| Récompenses de cartes après combat | Inchangé : 1 carte parmi 3, influencée par les talents (§8). |
| Amélioration de cartes au feu de camp | **Maître de classe** au feu de camp : améliore une carte. |
| **Relique de boss** après chaque boss de fin d'acte | **Butin de boss** : choix parmi 3 reliques puissantes, souvent avec un inconvénient. |
| Ordre fixe des actes | **Ordre fixe des raids** : Cœur du Magma → Repaire de l'Aile noire → Ahn'Qiraj. |
| **Acte 4** débloqué par 3 clés | **Naxxramas** débloqué par **3 fragments d'harmonisation** récupérés pendant la run (voir ci-dessous). |

**Les 3 fragments d'harmonisation pour Naxxramas** (équivalents des 3 clés de StS) :
- 🔴 **Fragment de feu** : à la place du repos ou de l'amélioration, sur un feu de camp.
- 🔵 **Fragment des dragons** : en battant un **boss secondaire renforcé** (signalé sur la carte).
- 🟢 **Fragment ancien** : en renonçant à la récompense d'un coffre.

### 14.2 Entre les runs

- **Barre d'expérience par classe** : à la fin de chaque run, victoire ou défaite, le joueur gagne de l'expérience selon son **score** (voir §14.3). Chaque niveau débloque **un lot de nouvelles cartes ou de nouvelles reliques** pour cette classe.
- **Déblocage des classes** : au départ, 1 classe est disponible. Les autres se débloquent en accumulant de l'expérience au total (comme les personnages de StS).
- **Niveaux de difficulté** (l'équivalent de l'Ascension) : **20 niveaux par classe**, débloqués un par un en gagnant une run au niveau précédent. Chaque niveau ajoute un modificateur cumulable, par exemple :
  - *Les ennemis ont plus de PV*
  - *Les boss secondaires sont plus dangereux*
  - *L'enrage arrive un tour plus tôt*
  - *Le feu de camp soigne moins*
  - *Le deck de départ contient une carte de malédiction*
  - *Niveau 20 : deux boss d'affilée à la fin de l'acte 3*
- **Compendium** : une encyclopédie qui recense les cartes, reliques, objets et monstres découverts, avec un petit texte de lore pour chaque entrée.

### 14.3 Score et fin de run

À la fin de chaque run, un écran récapitule :
- les étages atteints, les boss vaincus et les boss secondaires tués ;
- le deck final, l'équipement et les reliques ;
- des **bonus de score** (« Aucun dégât sur un boss », « Légendaire forgé », « Speedrun »…).

Le score détermine l'expérience gagnée. Il servira aussi de base au futur **mode infini**.

---

## 15. Plateformes et interface

### 15.1 Cible

- **Navigateur web**, sur **PC** et sur **smartphone**. Pas d'installation nécessaire.
- Plus tard, le jeu pourra être installable sur téléphone en tant qu'application web (PWA), et éventuellement distribué sur PC.

### 15.2 Contraintes d'interface

| Contrainte | Conséquence |
|---|---|
| **Smartphone en mode portrait** | L'écran de combat doit tenir en **portrait** : ennemis en haut, héros au milieu, main de cartes en bas. Sur PC, la même disposition s'élargit. |
| **Tactile** | Toucher une carte pour la sélectionner, puis toucher la cible. Sur PC, on peut aussi glisser-déposer. |
| **Pas de survol sur mobile** | Les infobulles (description d'un mot-clé, d'un buff…) s'ouvrent par **appui long** sur mobile et par **survol** sur PC. |
| **Lisibilité** | Textes de cartes courts, chiffres en gros, icônes claires. Une carte doit se comprendre en un coup d'œil sur un petit écran. |
| **Sessions interrompues** | La run est **sauvegardée automatiquement** en permanence. On peut fermer le navigateur à tout moment et reprendre plus tard (voir §15.4). |

### 15.3 Écrans principaux

1. **Menu principal** : nouvelle partie, continuer, compendium, options.
2. **Choix de la classe** et du niveau de difficulté.
3. **Carte de l'acte** : les étages et les chemins.
4. **Combat**.
5. **Récompenses** : choix de carte, or, objet.
6. **Fiche du héros** : deck, équipement (6 emplacements), reliques, talents.
7. **Arbre de talents**.
8. **Feu de camp**, **vendeur**, **événement**.
9. **Fin de run** : score et expérience.

### 15.4 Sauvegarde et reprise

Le joueur doit pouvoir **arrêter et reprendre sa partie quand il veut**, sans rien perdre.

**Ce qui est sauvegardé :**

| Sauvegarde | Contenu |
|---|---|
| **La run en cours** | Classe, acte et étage, carte de l'acte et chemin parcouru, PV, or, deck, équipement, reliques, potions, talents, étapes de quête légendaire, fragments d'harmonisation. **En combat :** l'état exact du combat (main, pioche, défausse, énergie, ressource de classe, ennemis, buffs et débuffs). |
| **Le profil du joueur** | Expérience et niveaux de chaque classe, classes et cartes débloquées, niveaux de difficulté atteints, compendium, statistiques, options. |

**Les règles :**
- **Sauvegarde automatique** après chaque action : chaque carte jouée, chaque choix, chaque nœud. Il n'y a pas de bouton à penser.
- **Bouton « Sauvegarder et quitter »** dans le menu pause, pour ceux qui veulent quitter proprement.
- **Reprise exacte** : en relançant le jeu, « Continuer » ramène le joueur exactement où il en était, même au milieu d'un combat.
- **Une seule run en cours à la fois.** Lancer une nouvelle partie demande de confirmer l'abandon de la run en cours (qui compte alors comme une défaite pour l'expérience).
- **Pas de triche par rechargement** : les tirages aléatoires (récompenses, pioche, événements) sont déterminés par une **graine** propre à la run. Recharger la partie ne change pas ce qui va sortir, comme dans StS.

**Où sont stockées les sauvegardes :**
- **Première version :** dans le navigateur de l'appareil (stockage local). Simple, sans compte ni serveur.
- **Limite à connaître :** si le joueur vide les données de son navigateur ou change d'appareil, il perd sa sauvegarde.
- **Plus tard :**
  - un **export/import** de la sauvegarde (un fichier ou un code à copier), pour la conserver ou la transférer ;
  - éventuellement une **synchronisation en ligne** avec un compte, pour commencer une run sur PC et la finir sur téléphone.

---

## 16. Direction artistique et ambiance

- Une interface qui évoque celle de WoW : barre de cast des ennemis, icônes de sorts reconnaissables, alertes de boss façon add-on de raid (« ⚠ Bombe vivante sur toi ! »).
- Des cartes illustrées avec les **icônes de sorts**, une bordure aux couleurs de rareté et un liseré de la couleur de la classe.
- Une carte d'acte dessinée comme un plan du raid.
- Un ton qui joue aussi sur la **culture raid** (wipes, loot, « Leeroy Jenkins »…), sans tomber dans la parodie.
- Musique et sons : ambiance épique, et des sons qui rappellent les sorts (un « clic » distinct pour une interruption réussie, par exemple).

---

## 17. Décisions prises

| Sujet | Décision |
|---|---|
| **Genre** | Deckbuilder roguelike à la *Slay the Spire* |
| **Univers** | World of Warcraft, en commençant par les raids de Classic |
| **Mode de jeu** | **Solo pur** : un seul héros. Les familiers (Chasseur, Démoniste) et les totems (Chaman) sont les seules entités alliées. |
| **Énergie** | **3 par tour, commune à toutes les classes**, plus une **ressource de classe** propre à chacune |
| **Structure** | **3 actes de 10 étages**, plus un acte bonus (Naxxramas) |
| **Spécialisation** | Construite pendant la run via 3 arbres de talents |
| **Équipement** | 6 emplacements (Arme, Amulette, 2 Bagues, 2 Bijoux), une seule règle de remplacement |
| **Légendaires** | Un par classe, obtenu par une petite quête, un seul par run |
| **Progression** | Calquée sur StS : déblocages de contenu et 20 niveaux de difficulté, pas de puissance permanente |
| **Plateformes** | Navigateur, sur PC et smartphone |
| **Sauvegarde** | Automatique et permanente, reprise exacte à tout moment (même en combat), stockée dans le navigateur au départ |
| **Modes futurs** | Mode rapide et mode infini |

---

## 18. Questions ouvertes

| # | Question | Pistes |
|---|---|---|
| 1 | **Classes du premier prototype** | Proposition : **Guerrier** (rage), **Mage** (écoles), **Démoniste** (familier + DoTs), pour 3 styles de jeu très différents. |
| 2 | **Classe disponible dès le départ** | Le Guerrier, la plus simple à comprendre ? |
| 3 | **Technologie** | Pour un jeu navigateur PC + mobile : TypeScript avec un moteur 2D web (Phaser ou PixiJS), ou Godot avec export web. À décider au moment du prototype. |
| 4 | **Visuels** | Faits main, générés, ou des éléments simples (icônes et formes) pour le prototype ? |
| 5 | **Titre définitif** | « Wipe & Loot » est provisoire. |

---

## 19. Prochaines étapes

1. ~~Écrire le concept général~~ ✅
2. **Concevoir les classes** une par une : deck de départ, environ 50 cartes, 3 arbres de talents, légendaire. On commence par les 3 classes du prototype.
3. **Concevoir l'acte 1 (Cœur du Magma)** en détail : trash, boss secondaires, Ragnaros, événements, chiffres.
4. **Prototyper le combat** (sur papier ou en code) avec 1 classe et quelques ennemis.

---

> **Note :** World of Warcraft et tous ses éléments (noms, personnages, lieux, objets) appartiennent à Blizzard Entertainment. Ce projet est un fan game personnel et non commercial. Une sortie commerciale nécessiterait de passer à un univers original.
