# Wipe & Loot — Document de concept

> Version 0.4 · Univers original · Projet personnel

---

## Sommaire

1. [Pitch](#1-pitch)
2. [Piliers de design](#2-piliers-de-design)
3. [L'univers](#3-lunivers)
4. [Structure d'une run](#4-structure-dune-run)
5. [Le héros](#5-le-héros)
6. [Le combat](#6-le-combat)
7. [Les cartes](#7-les-cartes)
8. [Les classes](#8-les-classes)
9. [Spécialisations et talents](#9-spécialisations-et-talents)
10. [Les ennemis](#10-les-ennemis)
11. [Les raids (actes)](#11-les-raids-actes)
12. [Récompenses](#12-récompenses)
13. [Les événements](#13-les-événements)
14. [Le vendeur gobelin](#14-le-vendeur-gobelin)
15. [Progression](#15-progression)
16. [Plateformes et interface](#16-plateformes-et-interface)
17. [Direction artistique et ambiance](#17-direction-artistique-et-ambiance)
18. [Décisions prises](#18-décisions-prises)
19. [Questions ouvertes](#19-questions-ouvertes)
20. [Prochaines étapes](#20-prochaines-étapes)

---

## 1. Pitch

**Wipe & Loot** est un **deckbuilder roguelite** dans la lignée de *Slay the Spire*, dans un univers de **fantasy héroïque original** inspiré des grands MMO.

Le joueur incarne **seul** un champion de l'une des 9 classes du jeu. Il s'attaque aux **raids** les plus redoutés du monde d'**Eldrava** : les Profondeurs Ardentes, l'Aire de Vhaeryx, la cité ensevelie d'Irem… Chaque boss a des **mécaniques de raid** traduites en règles de cartes. On meurt (« wipe »), on recommence, on débloque, on progresse.

**Phrase d'accroche :** *« Chaque boss est une mécanique, chaque loot est une décision. »*

**Ce qui le distingue de Slay the Spire :**
1. **Une barre de sorts à temps de recharge**, en plus du deck : les gros sorts de classe sont toujours disponibles, mais il faut les planifier (§6.6).
2. **Le droit de wiper** : une défaite n'est pas forcément la fin de la run. On paie la réparation et on retente le combat, avec un nombre d'essais limité (§6.7).
3. **Des tables de loot** sur les boss, qui se révèlent au fil des parties et guident le choix du chemin (§12.7).
4. **Des talents permanents** : on monte sa classe en niveau et on choisit sa spécialisation avant d'entrer dans le raid, comme dans un MMO (§9).

**Plateformes :** navigateur sur PC et smartphone.

---

## 2. Piliers de design

1. **L'identité de classe avant tout**
   Chaque classe a sa propre ressource, ses propres contraintes et ses sorts signatures. Jouer un Guerrier et jouer un Mage doivent donner deux expériences différentes.

2. **Les boss sont des mécaniques, pas des sacs à PV**
   Interrompre, sortir du feu, dissiper, gérer les phases, battre l'enrage : le joueur doit *lire* le combat comme un raideur lit un boss.

3. **La saveur des MMO, en restant simple**
   Arbres de talents, clés de raid, armes légendaires, professions, buffs de raid. On garde la saveur sans la complexité d'un MMO.

4. **Facile à prendre en main, profond à maîtriser**
   Les systèmes annexes (l'équipement par exemple) restent volontairement légers. La profondeur vient des cartes et des synergies.

5. **Des runs courtes et jouables partout**
   Une run complète doit tenir en une session raisonnable, sur PC comme sur téléphone.

6. **L'expérience du raid : cooldowns, wipes et loot**
   Planifier ses gros sorts, wiper puis retenter, viser un objet précis sur un boss. C'est ce qui donne au jeu une identité propre face à Slay the Spire.

---

## 3. L'univers

### 3.1 Principe

Le jeu se déroule dans un **univers original**. Il reprend les **archétypes** de la fantasy héroïque et des MMO (guerriers, mages, démonistes, dragons, seigneur du feu, dieu ancien, nécropole…) avec **ses propres noms, lieux, personnages et histoires**.

**Les règles qu'on se fixe :**
- **Aucun nom propre** repris d'une œuvre existante (personnages, lieux, objets, factions).
- **Pas de noms trop ressemblants** à des noms existants : ils posent les mêmes problèmes qu'une copie.
- **Les mots génériques restent libres** : Guerrier, Mage, Boule de feu, Charge, Exécution, Métamorphose, Bouclier divin…
- **Les visuels, icônes et interface** sont créés pour le jeu, jamais repris.
- **Des clins d'œil discrets** à la culture MMO sont bienvenus (wipe, loot, aggro, le joueur qui fonce dans le tas…), tant qu'ils ne renvoient pas à un jeu précis.

Les inspirations d'origine sont notées dans un document de travail séparé, conservé hors du dépôt.

### 3.2 Le monde d'Eldrava

**Eldrava** est un monde de royaumes, de forges naines, de forêts anciennes et de déserts oubliés. Depuis la **Grande Brèche**, une fissure entre les plans, d'anciennes puissances se réveillent une à une :
- sous le **mont Durgal**, un seigneur élémentaire du feu est revenu ;
- au sommet du mont, un dragon-alchimiste façonne une armée de dragons hybrides ;
- sous les sables de l'Est, un dieu endormi commence à rêver ;
- et dans le ciel, une nécropole volante projette son ombre sur les royaumes.

### 3.3 Le joueur et la guilde

Le joueur est le **champion d'une guilde d'aventuriers**. Chaque run est une **expédition** envoyée contre ces menaces.

- Le **menu principal** est le **hall de la guilde**.
- Le **compendium** devient les **archives de la guilde** : on y consigne les monstres, cartes et objets découverts.
- Les **wipes** et les **morts** font partie de l'histoire : la guilde renvoie un champion, et on retente.

---

## 4. Structure d'une run

### 4.1 Vue d'ensemble

```
Choix de la classe ─► Bénédiction d'entrée
   └─► Acte 1 : Les Profondeurs Ardentes  (10 étages)
   └─► Acte 2 : L'Aire de Vhaeryx         (10 étages)
   └─► Acte 3 : Irem, la cité ensevelie   (10 étages)
   └─► [Acte bonus : La Nécropole céleste] (court, si les 3 éclats de clé sont réunis)
```

- Une **run** = **3 actes de 10 étages**, plus un acte bonus facultatif.
- **Durée visée :** environ **45 minutes à 1 heure** pour une run complète.
- Chaque acte est une **carte à embranchements** : le joueur choisit son chemin d'étage en étage.
- **Après chaque combat**, le joueur choisit une carte parmi 3 (ou n'en prend aucune).
- **Après chaque boss**, il récupère un objet de sa **table de loot** (voir §12.7).
- **Les talents sont choisis avant la run** et ne changent pas pendant celle-ci (voir §9).
- **Un wipe n'est pas forcément la fin** : le joueur peut retenter un combat perdu, dans la limite de 3 wipes par run (voir §6.7).
- **Quand la run s'arrête**, le joueur gagne quand même de l'expérience pour sa classe (voir §15).

### 4.2 Les nœuds de la carte

| Nœud | Équivalent StS | Description |
|---|---|---|
| ⚔️ **Pack de trash** | Combat | Combat standard contre les monstres du raid. |
| 💀 **Boss secondaire** | Élite | Un boss du raid avec sa mécanique. Le nœud indique **quel boss** s'y trouve, et on peut consulter sa table de loot (§12.7). |
| 🔥 **Feu de camp** | Repos | **Se reposer** (soigne 30 % des PV max) **ou** aller voir le **maître de classe** (améliorer une carte ou un sort). |
| 💰 **Vendeur gobelin** | Marchand | Achat de cartes, de potions et d'objets, retrait de cartes, réparations (voir §14). |
| ❓ **Quête** | Événement | Rencontres avec des PNJ, choix narratifs et étapes des quêtes légendaires (voir §13). |
| 📦 **Coffre** | Trésor | Loot gratuit : un objet d'équipement. |
| 👑 **Boss de fin d'acte** | Boss | Le boss final du raid. |

### 4.3 Structure d'un acte (10 étages)

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

### 4.4 Modes futurs (hors première version)

- **Mode rapide** : un seul acte (ou 3 actes de 5 étages), pour une partie de 15 à 20 minutes.
- **Mode infini (endless)** : après la Nécropole, les raids recommencent en boucle avec une difficulté croissante, jusqu'à la fin de la run. Le but est le meilleur score.
- Plus tard, de **nouveaux raids** pourraient s'ajouter comme nouveaux actes ou nouvelles campagnes.

---

## 5. Le héros

### 5.1 Statistiques de base

| Statistique | Valeur de départ (indicative) |
|---|---|
| **PV max** | 65 à 80 selon la classe (les classes en armure lourde ont plus de PV que les classes en tissu) |
| **Énergie** | **3 par tour**, commune à toutes les classes |
| **Pioche** | 5 cartes par tour |
| **Ressource de classe** | Propre à chaque classe (voir §5.2) |
| **Barre de sorts** | 3 emplacements, dont 1 occupé par le sort de départ de la classe (voir §6.6) |
| **Wipes autorisés** | 3 par run (voir §6.7) |
| **Emplacements de potions** | 3 |
| **Or** | 99 au départ |
| **Deck de départ** | 10 cartes (voir §7.5) |

Les PV **ne remontent pas** automatiquement entre les combats. On se soigne aux feux de camp, avec des potions, de l'équipement ou des cartes.

### 5.2 Énergie commune + ressource de classe

**Toutes les classes** jouent leurs cartes avec la même **énergie (3 par tour)**, comme dans StS. Cela rend l'équilibrage plus simple.

**En plus**, chaque classe a **sa ressource à elle**, qui porte son identité :

| Classe | Ressource de classe | Fonctionnement |
|---|---|---|
| **Guerrier** | **Rage** | Se gagne en frappant et en étant frappé. Certaines cartes coûtent de l'énergie **et** de la rage, ou deviennent plus fortes avec plus de rage. |
| **Voleur** | **Points de combo** (max 5) | Les générateurs en donnent, les finishers les consomment pour un effet proportionnel. |
| **Mage** | **Charges d'école** | Givre : Gel sur l'ennemi. Feu : Brûlure. Arcane : Charges arcaniques. |
| **Démoniste** | **Éclats d'âme** (0 à 5) | Gagnés quand un ennemi meurt sous un de ses DoT ou une de ses Malédictions (Siphon d'âme en donne plus). **Conservés d'un combat à l'autre.** Consommés par les sorts les plus puissants. |
| **Chasseur** | **Compagnon** | Pas une ressource chiffrée : le compagnon animal est une entité alliée qui attaque chaque tour. |
| **Paladin** | **Sceau actif** | Un seul Sceau à la fois. Le Jugement le consomme pour un effet puissant. |
| **Prêtre** | **Foi** (0 à 10) et **Égide** | La Foi se gagne à chaque carte qui soigne ou donne de l'Égide, et se dépense en colère divine. L'Égide est un bouclier qui ne disparaît pas d'un tour à l'autre. |
| **Chaman** | **Totems** (4 emplacements) | Les totems posés restent en jeu et agissent chaque tour. |
| **Druide** | **Forme** | La forme active (Ours, Félin, Astrale) change ce que les cartes font. |

---

## 6. Le combat

### 6.1 Le tour de jeu

1. **Début du tour du joueur** : le blocage restant disparaît, le joueur récupère 3 énergie et pioche 5 cartes. Les temps de recharge de la barre de sorts diminuent de 1.
2. **Phase du joueur** : il joue ses cartes et ses sorts prêts dans l'ordre qu'il veut, tant qu'il a de l'énergie.
3. **Fin du tour du joueur** : les cartes restantes en main sont défaussées (sauf effets contraires). Les effets « en fin de tour » s'appliquent (Zone de feu, Bombe vivante…).
4. **Tour des ennemis** : chaque ennemi exécute l'**intention** qu'il affichait, puis montre la suivante.

Quand la pioche est vide, la défausse est mélangée pour former une nouvelle pioche.

### 6.2 Les intentions des ennemis

Les ennemis annoncent toujours leur prochaine action. Les types d'intention :

| Intention | Icône (idée) | Effet |
|---|---|---|
| **Attaque** | Épée | Inflige des dégâts (le montant est affiché). |
| **Défense** | Bouclier | Gagne du blocage. |
| **Renforcement** | Flèche vers le haut | Se renforce, ou renforce un allié. |
| **Affaiblissement** | Crâne | Applique un débuff au joueur, ou ajoute une carte-statut dans son deck. |
| **Invocation** | Portail | Fait apparaître des adds. |
| **Incantation** | **Barre de cast** | Un sort puissant qui prend effet **au tour suivant**. Il peut être **interrompu**. |

L'**Incantation** est la mécanique signature du combat. Un boss commence à lancer un gros sort : la barre de cast s'affiche, et le joueur a un tour pour réagir (interrompre, se protéger, utiliser un sort de sa barre ou tuer le lanceur avant la fin de l'incantation).

### 6.3 Les mécaniques de raid

| Mécanique de raid | Traduction en cartes |
|---|---|
| **Interruption** | Les cartes et les sorts avec le mot-clé **Interruption** (Coup de pied, Contresort, Coup de bouclier, Choc tellurique…) annulent l'incantation en cours. |
| **Enrage timer** | Après un nombre de tours défini, le boss passe en **Berserk** : ses dégâts sont fortement augmentés. Le compteur est visible en permanence. Cela empêche le jeu trop défensif. |
| **Phases** | Le boss change de comportement et de règles à certains seuils de PV (75 %, 50 %, 25 %…). |
| **« Ne restez pas dans le feu »** | Une carte-statut **Zone de feu** est ajoutée à la main du joueur. S'il ne la joue pas (coût 1 : « Bouger »), elle lui inflige des dégâts en fin de tour. |
| **Malédictions, poisons, magie, maladies** | Des débuffs typés qui ne s'enlèvent qu'avec une carte de **Dissipation** du bon type. Toutes les classes ne peuvent pas tout dissiper, et c'est voulu. |
| **Adds** | Des ennemis secondaires invoqués par le boss. Le **contrôle des foules** (Métamorphose, Peur, Piège givrant, Assommer) prend tout son sens. |

### 6.4 Mots-clés

| Mot-clé | Effet |
|---|---|
| **Interruption** | Annule l'incantation en cours de la cible. |
| **Dissipation (type)** | Retire un débuff du type indiqué (Magie, Malédiction, Poison, Maladie). |
| **DoT (X)** | Inflige X dégâts au début de chaque tour de l'ennemi, pendant plusieurs tours. |
| **Saignement (X)** | Un DoT physique de 3 tours. Un nouveau Saignement s'ajoute au précédent et remet la durée à 3 tours. |

**Mots-clés propres à une classe ou à un acte** (définis dans leur fiche) :
- **Classes :** Brûlure, Gel et Fracasser (Mage), Poison et Ouverture (Voleur), Égide (Prêtre), Résonance (Chaman), Piège (Chasseur), tags de forme [Ours] / [Félin] / [Astrale] (Druide).
- **Actes :** Zone de feu et Bombe vivante (acte 1), Souffle, Mutation et Envol (acte 2), Folie, Hallucination, Ensevelissement et Résistance (acte 3), Givre de la mort (acte bonus).
- **Tags d'ennemis :** Mort-vivant, Démon, Dragon, Élémentaire, Bête, Humanoïde, Insecte, Construct, Aberration. Certaines cartes sont plus fortes contre certains tags.
| **Contrôle** | La cible saute son prochain tour. Les boss y sont immunisés. |
| **Épuisé** | La carte est retirée pour le reste du combat une fois jouée. |
| **Éphémère** | Si la carte est encore en main à la fin du tour, elle est retirée du combat. |
| **Persistant** | La carte n'est pas défaussée en fin de tour. |
| **Inné** | La carte est toujours dans la main de départ du combat. |
| **Injouable** | La carte ne peut pas être jouée (statuts, malédictions). |

### 6.5 Buffs et débuffs principaux

On garde une liste **courte** :

| Effet | Type | Effet en jeu |
|---|---|---|
| **Puissance** | Buff | +1 dégât par point sur chaque attaque et chaque sort de dégâts. |
| **Robustesse** | Buff | +1 blocage par point sur chaque carte qui donne du blocage. |
| **Armure fracassée** | Débuff | La cible subit 50 % de dégâts en plus. |
| **Démoralisé** | Débuff | La cible inflige 25 % de dégâts en moins. |
| **Ralenti** | Débuff | Le blocage gagné par la cible est réduit de 25 %. |
| **Gel** | Débuff | Spécifique au Mage : la cible gelée subit des critiques garantis avec Fracasser. |
| **Peur** | Débuff | La cible ne peut pas agir pendant un tour (comme Contrôle). |

### 6.6 La barre de sorts (temps de recharge)

**C'est la première mécanique qui distingue le jeu de Slay the Spire.**

Le héros dispose de deux sources d'actions :
- son **deck**, qui contient la rotation de base : les cartes sont piochées au hasard ;
- sa **barre de sorts**, qui contient les **gros sorts de classe** : ils sont **toujours visibles et disponibles**, sans pioche, mais ont un **temps de recharge**.

**Les règles :**
- **3 emplacements** au départ, jusqu'à **4** grâce à un talent ou à un objet d'équipement.
- Chaque classe commence avec **1 sort de départ** dans sa barre.
- Utiliser un sort coûte de l'**énergie** (de 0 à 2), comme une carte. Le sort passe ensuite en **recharge** pendant X tours (de 2 à 5 selon sa puissance).
- Certains sorts très puissants sont **« 1 fois par combat »**.
- **Au début de chaque combat**, tous les sorts sont prêts.
- **Obtenir de nouveaux sorts :** par les **talents** (voir §9), sur les **tables de loot** des boss (voir §12.7) et auprès du **maître de classe**.
- Quand la barre est pleine, un nouveau sort **remplace** un sort existant, ou on le refuse. C'est la même règle simple que pour l'équipement.
- Les sorts de la barre peuvent être **améliorés** au feu de camp, comme les cartes (temps de recharge réduit ou effet renforcé).

**Exemples par classe :**

| Classe | Sort de départ | Autres sorts de barre (exemples) |
|---|---|---|
| **Guerrier** | Charge (gagne de la rage, recharge 3) | Rempart, Témérité, Cri de défi |
| **Voleur** | Sprint (pioche des cartes, recharge 3) | Disparition, Poussée d'adrénaline, Évasion |
| **Mage** | Contresort (Interruption, recharge 3) | Carapace de glace, Combustion, Évocation, Pouvoir des arcanes |
| **Démoniste** | Pacte de sang (PV contre énergie, recharge 2) | Spirale mortelle, Pacte démoniaque, Pierre d'âme |
| **Chasseur** | Tir arcanique (recharge 2) | Feindre la mort, Fureur bestiale, Tir rapide |
| **Paladin** | Jugement (recharge 2) | Bouclier divin, Imposition des mains (1 fois par combat), Marteau du jugement |
| **Prêtre** | Égide sacrée (recharge 2) | Transfusion de puissance, Focalisation intérieure, Cri psychique |
| **Chaman** | Choc tellurique (Interruption, recharge 3) | Maîtrise élémentaire, Totem de mana, Rappel totémique |
| **Druide** | Sève vitale (gagne de l'énergie, recharge 4) | Renaissance (1 fois par combat), Régénération sauvage, Écorce |

**Pourquoi c'est intéressant :** le joueur gère deux choses à la fois. Sa main dépend du hasard, alors que sa barre se **planifie**. Il doit sans cesse se demander s'il utilise son sort maintenant ou s'il le garde pour l'incantation que le boss prépare au tour suivant.

### 6.7 Wipe et nouvel essai

**C'est la deuxième mécanique qui distingue le jeu de Slay the Spire, et elle justifie le titre.**

Dans un raid, quand tout le monde meurt, on paie les réparations et on retente. Ici, c'est pareil.

**Les règles :**
- Quand les PV du héros tombent à 0, quel que soit le combat, c'est un **wipe**.
- Le joueur peut **retenter le combat depuis le début**. Il repart avec le deck, l'équipement et les potions qu'il avait en entrant dans le combat. Les potions utilisées pendant l'essai raté sont perdues.
- Ses PV sont remis à leur niveau d'entrée dans le combat, avec un **minimum de 50 % des PV max**.
- **La facture de réparation :** chaque wipe coûte de l'**or** (par exemple 50, puis 100, puis 150). Si le joueur ne peut pas payer, un objet d'équipement au hasard est **brisé** : son effet est désactivé jusqu'à ce qu'il soit réparé chez le vendeur gobelin.
- **3 wipes autorisés par run.** Un 4ᵉ wipe met fin à la run.
- Le nouvel essai utilise une **nouvelle graine aléatoire** : la pioche et les actions des ennemis ne seront pas identiques.
- Chaque wipe **réduit le score** de fin de run (voir §15.3).
- Le joueur peut aussi **renoncer** et terminer sa run immédiatement.

**Ce que ça change :**
- Les boss peuvent être **plus durs et plus mécaniques**, car le joueur a le droit d'apprendre le combat, comme en raid.
- Le jeu est **moins punitif sur mobile**, où une erreur de toucher est vite arrivée.
- Les niveaux de difficulté peuvent **réduire le nombre de wipes** jusqu'à 0, pour un vrai mode « hardcore » (voir §15.2).

---

## 7. Les cartes

### 7.1 Types de cartes

| Type | Description |
|---|---|
| **Attaque** | Inflige des dégâts physiques (Frappe héroïque, Attaque sinistre…). |
| **Sort** | Inflige des dégâts magiques, ou produit un effet magique (Boule de feu, Corruption…). |
| **Compétence** | Défense et utilitaire : blocage, pioche, interruption, dissipation… |
| **Pouvoir** | Un effet permanent pour tout le combat (Posture de combat, Forme d'Ombre, Aura de dévotion…). |
| **Statut** | Une carte négative temporaire ajoutée par un ennemi (Zone de feu, Bombe vivante…). Elle disparaît à la fin du combat. |
| **Malédiction** | Une carte négative **permanente** dans le deck, obtenue via certains événements ou certains objets. Il faut l'enlever chez le vendeur. |

La distinction entre **Attaque** et **Sort** permet des mécaniques de raid : un ennemi qui *réduit au silence* bloque les Sorts, un autre qui *désarme* bloque les Attaques.

### 7.2 Raretés

| Rareté | Couleur | Fréquence |
|---|---|---|
| **De départ** | Gris | Uniquement dans le deck de départ. |
| **Commune** | Blanc | Très fréquente dans les récompenses. |
| **Peu commune** | Vert | Fréquente. |
| **Rare** | Bleu | Peu fréquente, plus probable après un boss secondaire. |
| **Épique** | Violet | Les cartes signatures de spécialisation, débloquées par les talents (voir §9). |

L'**orange (légendaire)** est réservé aux **armes légendaires** (voir §12.3).

### 7.3 Amélioration

- Chaque carte peut être **améliorée une fois** (Frappe héroïque → **Frappe héroïque+**).
- L'amélioration augmente les chiffres, réduit le coût ou ajoute un effet.
- On améliore une carte de deux façons :
  - au **feu de camp**, avec le maître de classe, **à la place du repos**. C'est un vrai dilemme : se soigner ou devenir plus fort ;
  - chez le **vendeur gobelin**, contre de l'or.
- Quelques événements peuvent aussi proposer une amélioration.

### 7.4 Les cartes neutres : les professions

Les cartes neutres, jouables par toutes les classes, viennent des **professions** :

| Profession | Exemples de cartes |
|---|---|
| **Ingénierie** | Bombe en fer (dégâts à tous les ennemis), Lance-filet (Contrôle), Grenade gobeline |
| **Alchimie** | Transmutation (transforme une carte), Pierre philosophale |
| **Premiers soins** | Bandage de lin (soin), Antidote (dissipe un Poison) |
| **Forge, Enchantement…** | Pierre à aiguiser (+dégâts à une attaque), Enchantement d'arme (bonus pour le combat) |

On les obtient surtout via les **événements** et le **vendeur gobelin**.

### 7.5 Taille du pool

- **Deck de départ :** 10 cartes, par exemple 4 attaques basiques, 4 défenses basiques et 2 cartes de classe.
- **Pool par classe :** environ **50 cartes** pour la première version, réparties sur les 3 arbres de talents et un tronc commun.
- **Cartes neutres :** environ 15 à 20.
- **Statuts et malédictions :** environ 10 à 15.

---

## 8. Les classes

Le jeu proposera **9 classes**, chacune avec une **mécanique principale** qui la rend unique. Le détail de chaque classe (cartes, talents, deck de départ) fera l'objet d'un document séparé.

| Classe | Mécanique principale | Sorts signatures |
|---|---|---|
| **Guerrier** | **Rage** : se gagne en frappant et en étant frappé, sans régénération naturelle. **Postures** (Combat / Berserker / Défensive) qui modifient les effets des cartes. | Charge, Frappe héroïque, Frappe mortelle, **Exécution** (consomme toute la rage), Tourbillon, Sanguinaire, Heurt de bouclier, Rempart |
| **Voleur** | **Points de combo** : les générateurs en donnent, les finishers les consomment. **Camouflage** : une carte d'ouverture spéciale jouable au tour 1. | Attaque sinistre, Coup dans le dos, Éviscération, Danse des lames, Coup aux reins, Disparition, Poisons |
| **Mage** | **Écoles de magie** : Givre (geler l'ennemi, puis *Fracasser* = critiques garantis), Feu (*Brûlure* qui s'accumule, Combustion), Arcane (charges arcaniques). | Éclair de givre, Boule de feu, Pyrolance, Nova de givre, Métamorphose, Carapace de glace, Évocation, Contresort |
| **Démoniste** | **Démon familier** permanent (Diablotin, Rôdeur du néant, Succube, Molosse infernal). **DoTs** qui s'accumulent. **Pacte de sang** : sacrifier des PV contre de l'énergie. **Éclats d'âme**. | Corruption, Malédiction de souffrance, Immolation, Trait de l'ombre, Feu de l'âme, Peur, Spirale mortelle |
| **Chasseur** | **Compagnon animal** autonome qui attaque chaque tour et obéit à des cartes d'ordre. **Aspects** (sortes de postures). **Pièges** posés à l'avance, qui se déclenchent quand l'ennemi agit. | Tir ajusté, Flèches multiples, Flèche venimeuse, Marque de la proie, Piège givrant, Feindre la mort |
| **Paladin** | **Sceaux et Jugement** : un Sceau actif améliore les attaques, le Jugement le consomme pour un effet puissant. **Auras** passives. | Sceau de droiture, Sceau du croisé, Jugement, Consécration, Marteau du jugement, Bouclier divin, Imposition des mains |
| **Prêtre** | **Boucliers persistants** (Égide sacrée) et **Foi** gagnée avec les soins en excès. **Forme d'Ombre** qui transforme le style de jeu. | Murmure de douleur, Fouet psychique, Étreinte vampirique, Châtiment, Feu sacré, Transfusion de puissance |
| **Chaman** | **4 emplacements de totems** (Terre, Feu, Eau, Air) : des entités persistantes avec un effet à chaque tour. **Réincarnation** : une résurrection par run. | Éclair, Chaîne d'éclairs, Choc tellurique, Choc de flammes, Arme des vents, Frappe d'orage, Vague de soins |
| **Druide** | **Formes** : Ours (blocage, rage), Félin (combo), Forme astrale (sorts). Les cartes ont un **tag de forme**, et changer de forme coûte une action. | Lacération, Morsure féroce, Rugissement, Feu de lune, Feu stellaire, Colère, Renouveau, Renaissance |

**Pour la première version**, on vise **3 classes** très différentes (voir §19). Les autres arriveront ensuite.

---

## 9. Spécialisations et talents

**Les talents sont permanents et se choisissent avant la run**, comme dans un MMO : on monte sa classe en niveau, on gagne des points de talent, et on choisit sa spécialisation avant d'entrer dans le raid.

### 9.1 Les points de talent
- Chaque classe a un **niveau de classe, de 1 à 10**, qui monte avec l'expérience gagnée à la fin de chaque run (voir §15.2).
- **Chaque niveau donne 1 point de talent**. Une classe de niveau 1 a 1 point, une classe de niveau 10 en a **10, le maximum**.
- On atteint le niveau 10 en environ **10 à 15 runs** avec cette classe.
- **10 points pour 15 paliers** : on ne peut pas tout prendre. Une fois au maximum, on peut par exemple compléter un arbre (5 points) et en monter un deuxième jusqu'au palier 5, ou répartir ses points sur les trois arbres.

### 9.2 Les arbres
- Chaque classe possède **3 arbres de talents** (Guerrier : Armes / Fureur / Protection ; Mage : Arcane / Feu / Givre ; etc.).
- Chaque arbre compte **5 paliers**. Il faut avoir un point dans un palier pour accéder au suivant.
- **Paliers 1 à 4 :** chaque point permet de choisir **1 talent parmi 2**.
- **Palier 5 :** la **carte épique** de la spécialisation (Frappe mortelle, Sanguinaire, Heurt de bouclier, Pyrolance, Forme d'Ombre…). Elle est **ajoutée au deck de départ** de chaque run, et peut aussi apparaître dans les récompenses.
- Certains paliers donnent un **sort de barre** (voir §6.6) au lieu d'un bonus passif. Par exemple, le palier 3 de l'arbre Givre donne Carapace de glace. Ces sorts sont dans la barre **dès le début de la run**.

### 9.3 Choisir sa spécialisation
- Les talents se répartissent dans le **hall de la guilde**, avant de lancer une run.
- **Le respec est gratuit entre deux runs** : on peut jouer Mage Feu un jour et Mage Givre le lendemain.
- **Pendant la run, les talents sont fixés.**
- Plus le joueur a de points dans un arbre, plus les **récompenses de cartes** proposées après les combats penchent vers cet arbre. La spécialisation oriente le deck **dès le premier combat**.
- Les **builds hybrides** sont possibles et encouragés.

> **Exemple :** un Guerrier de niveau 7 met 5 points en Protection et 2 en Fureur. Il commence chaque run avec Heurt de bouclier dans son deck, Rempart dans sa barre, et voit surtout des cartes de blocage après les combats. C'est un « tank qui tape ».

### 9.4 Ce que ça change pour l'équilibrage
- Le jeu devient un **roguelite** : le joueur devient **plus fort d'une run à l'autre** tant que sa classe n'est pas au niveau 10.
- Les **premières runs** d'une classe sont plus difficiles, avec peu de talents. Elles servent aussi à apprendre la classe.
- Une fois au niveau 10, ce sont les **niveaux de difficulté** (§15.2) qui prennent le relais comme défi.

---

## 10. Les ennemis

### 10.1 Les trois catégories

| Catégorie | Description | Exemples (Profondeurs Ardentes) |
|---|---|---|
| **Trash** | Ennemis standard, souvent en groupe de 1 à 4. Comportements simples et prévisibles. | Molosse de braise, Géant de lave, Éclaireur cendreux |
| **Boss secondaire** | Un boss du raid avec **une mécanique principale** à gérer. Plus de PV, meilleur loot. | Croc-de-lave, Gorlok le Fragmenté, Baron Vossk |
| **Boss de fin d'acte** | Le boss final, avec **plusieurs phases**, un **enrage timer** et au moins une mécanique unique. | Vulkhar, Souverain des flammes |

### 10.2 Principes de design

- **Une mécanique claire par ennemi.** Le joueur doit comprendre en un tour ce que fait l'ennemi.
- **Des combats qui posent une question.** Chaque boss secondaire teste une compétence : interrompre, dissiper, tuer les adds, tenir sous la pression, faire beaucoup de dégâts vite…
- **Aucune classe ne doit être bloquée.** Si un boss exige une Dissipation, il doit exister une alternative (une potion, une carte neutre, encaisser).
- **Les packs de trash ont un thème.** Ils annoncent les mécaniques du raid et préparent aux boss.

### 10.3 Progression de la difficulté

- L'acte 2 et l'acte 3 ont des ennemis plus nombreux, plus résistants et plus complexes.
- Les **premiers combats de chaque acte** sont plus faciles, pour laisser le joueur s'adapter.
- Les niveaux de difficulté (voir §15.2) ajoutent des modificateurs par-dessus.

---

## 11. Les raids (actes)

Chaque raid est un acte, avec ses monstres de trash, un pool de boss secondaires et son boss final. L'**histoire** du raid sert de fil narratif à l'acte. Le détail complet (ennemis, boss, tables de loot, événements, chiffres) est dans les fiches d'acte.

| Acte | Raid | Rôle dans la run | Mécaniques signatures | Boss secondaires (pool) | Boss final |
|---|---|---|---|---|---|
| **1** | [Les Profondeurs Ardentes](actes/ACTE1_PROFONDEURS_ARDENTES.md) | Apprentissage : une mécanique par boss | Le feu (Zones de feu), interruption, adds | 9 : Morvax, Croc-de-lave, Sœur Cendrine, Gorlok, Baron Vossk, Zhaal, Héraut Brannoc, Krâgg, Grand Intendant Saldris | **Vulkhar, Souverain des flammes** (300 PV, enrage tour 14) |
| **2** | [L'Aire de Vhaeryx](actes/ACTE2_AIRE_DE_VHAERYX.md) | Maîtrise : anticiper ce qu'on ne peut pas interrompre | Souffles non interruptibles, mutations, morts-vivants | 8 : Skarn, Ysolde la Rouge, Contremaître Draksis, les Trois Souffles, Prismagor, Grizzik, Ossyrax, Vashka | **Vhaeryx, le Dragon-Alchimiste** (420 PV, enrage tour 16) |
| **3** | [Irem, la cité ensevelie](actes/ACTE3_IREM.md) | Test final : un build complet | Folie et Hallucinations, ensevelissement, immunités | 7 : Prophète Méhkar, Rois-Jumeaux, Gharul, Triade de la Ruche, Limon primordial, Sartaq, Nebet | **Yzhar, le Dieu dormant** (Œil 200 PV + Corps 340 PV, enrage tour 18) |
| **Bonus** | [La Nécropole céleste](actes/ACTE_BONUS_NECROPOLE.md) | La vraie fin, avec les 3 éclats de clé | Uniquement des morts-vivants, Givre de la mort | 1 fixe : Gruthak, l'Abomination | **L'Archiliche Sarvok** (480 PV, enrage tour 20) |

**Règles communes aux boss secondaires :** 70 à 160 PV selon l'acte, enrage au tour 10, une table de loot de 4 objets propres plus 1 sort de barre de la classe du joueur.

### Plus tard
- **Pools de boss de fin d'acte** : comme dans StS, chaque acte pourrait tirer son boss final parmi plusieurs. Par exemple, l'acte 1 pourrait se terminer par Vulkhar **ou Sythra, la Matriarche des cendres** (une reine-dragon et ses dragonnets), et l'acte 2 par Vhaeryx **ou Ekhara, le Serpent de sang** (un dieu-serpent dans une cité de la jungle).

---

## 12. Récompenses

### 12.1 Les cartes
Après chaque combat, le joueur choisit une carte parmi 3, ou n'en prend aucune. Les cartes proposées dépendent de la classe et des talents investis (voir §9). Après un boss secondaire, les chances d'obtenir une carte rare sont plus élevées.
### 12.2 L'équipement (volontairement simple)

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
- pas de restrictions d'armure lourde, moyenne ou légère : le loot proposé est déjà adapté à la classe.

**Où trouver de l'équipement :** dans les coffres, sur les tables de loot des boss (voir §12.7), chez le vendeur gobelin et dans certains événements.

### 12.3 Les légendaires de classe

Chaque classe a **son arme légendaire**, qui amplifie sa mécanique principale.

| Classe | Légendaire | Effet (première idée) |
|---|---|---|
| **Guerrier** | **Brisemonts**, l'épée des rois nains | Chaque fois que tu prends des dégâts, gagne +1 rage supplémentaire. Exécution inflige toujours son bonus de dégâts. |
| **Paladin** | **L'Aurore ardente** | Tes Jugements infligent des dégâts doublés aux morts-vivants et aux démons, et te soignent. |
| **Chasseur** | **Corde-des-anciens**, l'arc du premier chasseur | Ton compagnon attaque une fois de plus chaque tour. |
| **Voleur** | **Sillon d'orage** | Toutes les 3 Attaques, un éclair inflige 6 dégâts à tous les ennemis. |
| **Prêtre** | **Équinoxe**, le bâton de lumière et d'ombre | Une arme double : elle change d'effet selon que tu es en forme Sacrée ou en forme d'Ombre. |
| **Chaman** | **Le Marteau des ancêtres** | Tes totems agissent deux fois par tour. |
| **Mage** | **Le Bâton du Veilleur (version Mage)** | Le premier sort de chaque tour coûte 0. |
| **Démoniste** | **Le Bâton du Veilleur (version Démoniste)** | Pacte de sang ne coûte plus de PV une fois par tour, et tes DoTs durent 1 tour de plus. |
| **Druide** | **Le Bâton du Veilleur (version Druide)** | Changer de forme ne coûte plus d'action. |

**Règles d'obtention :**
- chaque légendaire s'obtient via une **petite chaîne de quête de 2 ou 3 étapes**, réparties sur les événements « ? » et les boss de la run ;
- **un seul légendaire par run** ;
- *Exemple (Voleur, Sillon d'orage)* : récupérer le Fermoir gauche de l'orage sur **Gorlok le Fragmenté**, le Fermoir droit sur le **Baron Vossk**, puis trouver l'événement **Ventor, Prince des tempêtes**, qui forge l'arme.

### 12.4 Pas de reliques : tout passe par l'équipement

Pour simplifier, le jeu **n'a pas de reliques** comme dans StS. Tous les effets passifs viennent des **6 emplacements d'équipement**.

**Ce que ça change :**
- Le joueur porte **6 objets au maximum**, au lieu d'accumuler des dizaines de reliques. Chaque objet compte, et chaque nouveau loot est une vraie décision de remplacement.
- Les objets peuvent donc être **plus puissants** qu'une relique de StS, surtout les **Bijoux**, qui portent les effets spéciaux qui changent un build.
- **Le butin de boss de fin d'acte** devient un **choix parmi 3 objets d'équipement épiques**, souvent avec un inconvénient (« +1 énergie par tour, mais tes soins sont réduits de moitié »).

**Ce que deviennent les anciennes idées de reliques :**
- **Les objets d'histoire** deviennent des **Bijoux** : Pierre de retour, Sceau de l'Aire, Cœur de Vulkhar, Croc de la Matriarche…
- **Les buffs de raid** deviennent des **bénédictions temporaires** données par les événements, actives pour quelques combats seulement : Fleur des fées, Cri du Héraut, Cri du Tueur de dragons.

### 12.5 Les potions (consommables)
- **3 emplacements** au départ.
- Elles se trouvent après les combats (une chance), dans les événements et chez le vendeur.
- Exemples : Flacon du colosse, Élixir du félin, Pierre de vie, Potion de protection contre le feu, Potion de soins majeure, Potion de rage…

### 12.6 L'or
L'or se gagne après chaque combat (plus sur les boss secondaires) et dans certains événements. Il se dépense chez le vendeur gobelin et sert à payer les **factures de réparation** après un wipe (voir §6.7).

### 12.7 Les tables de loot

**C'est la troisième mécanique qui distingue le jeu de Slay the Spire.**

Chaque **boss secondaire** et chaque **boss de fin d'acte** a sa propre **table de loot**.

**Les règles :**
- Une table contient **4 à 6 objets** propres à ce boss : de l'équipement et des sorts de barre, adaptés à la classe du joueur.
- Après la victoire, le boss fait tomber **1 objet tiré de sa table**, en plus des récompenses habituelles (carte, or).
- Sur la carte de l'acte, les nœuds de boss secondaire indiquent **quel boss s'y trouve**. Le joueur peut consulter sa table de loot avant de choisir son chemin.

**Le loot se révèle au fil des parties :**
- Un objet que le joueur **n'a encore jamais obtenu** apparaît dans la table sous forme de **silhouette « ??? »**. Seuls son emplacement (Arme, Bijou…) et sa couleur sont visibles.
- Dès qu'un objet a été **obtenu une fois**, dans n'importe quelle run, il devient **visible pour toujours** dans la table de ce boss. Cette découverte est enregistrée dans le profil et dans les archives de la guilde.
- Ainsi, au début, le joueur découvre le loot. Plus tard, il connaît les tables et peut **viser un objet précis** : « Je passe par Croc-de-lave pour essayer d'avoir son bijou, qui va avec mon build Feu ».

**Ce que ça change :** le choix du chemin sur la carte n'est plus seulement une question de risque. Il devient aussi une question de **build**. Cela donne une raison d'affronter des boss secondaires, et une raison de rejouer pour compléter les tables.

---

## 13. Les événements

Les nœuds « ? » proposent une petite scène narrative avec **2 ou 3 choix**, souvent avec un risque ou une contrepartie. Ils font vivre l'**univers** et portent les **quêtes légendaires**.

**Un « ? » ne dit pas ce qu'il cache.** Comme dans StS, un nœud « ? » peut se révéler être :
- un **événement** narratif (le cas le plus fréquent) ;
- un **combat caché** : une embuscade de trash, ou parfois un ennemi rare avec un meilleur butin ;
- plus rarement, un **vendeur** ou un **coffre**.

Les chances de tomber sur un combat augmentent à chaque « ? » qui n'en était pas un, puis retombent après un combat caché. Un chemin plein de « ? » reste donc risqué.

**Exemples de combats cachés :**
- **L'embuscade cendreuse** (acte 1) : des Éclaireurs cendreux surgissent de la lave.
- **Le gobelin mimique** (tous les actes) : le « coffre » est un monstre. Il est dangereux, mais il fait tomber beaucoup d'or.
- **La patrouille d'élite** (actes 2 et 3) : un groupe renforcé, avec un objet d'équipement à la clé.

**Exemples :**

| Événement | Acte | Choix (idée) |
|---|---|---|
| **Les Gardiens des Sources** | 1 | Accepter leur quête (affaiblit Vulkhar, mais il faut battre un boss secondaire) / Refuser. |
| **Un gobelin coincé dans un coffre** | Tous | Le libérer (récompense aléatoire, ou un piège) / Prendre le coffre et partir (or, mais une malédiction). |
| **Le cercle d'appel** | Tous | Appeler un membre de la guilde en renfort : gagner une carte neutre / Payer en PV pour retirer une carte du deck. |
| **Le joueur qui fonce** | Tous | Un aventurier fonce dans le pack en hurlant son propre nom. L'aider (combat difficile, grosse récompense) / Le laisser (rien ne se passe). |
| **Ventor, Prince des tempêtes** | 1 | Étape de la quête de Sillon d'orage. |
| **Les œufs de dragon** | 2 | Détruire les œufs (combat contre des dragonnets, puis récompense) / Les laisser (Vhaeryx aura un add de plus). |
| **Le gong des Sables** | 3 | Frapper le gong (un objet d'équipement puissant, mais le prochain combat est plus dur) / Passer son chemin. |
| **Les Veilleurs de l'Aurore** | 3 | Recevoir une bénédiction contre les morts-vivants / Obtenir un indice sur un éclat de clé. |
| **Le fantôme du raideur** | Tous | Un aventurier mort lors d'un wipe précédent. Récupérer son équipement (un objet, plus une malédiction) / Le laisser reposer (soin). |

---

## 14. Le vendeur gobelin

Le vendeur propose à chaque visite :

| Rayon | Contenu | Prix (indicatif) |
|---|---|---|
| **Cartes de classe** | 5 cartes | 50 à 150 or selon la rareté |
| **Cartes de profession** | 2 cartes neutres | 80 à 180 or |
| **Équipement** | 3 objets | 120 à 300 or selon la puissance |
| **Potions** | 3 potions | 50 à 100 or |
| **Service : améliorer une carte** | Une carte ou un sort de barre, 1 fois par visite | 75 or, puis +25 à chaque utilisation pendant la run |
| **Service : retirer une carte** | 1 fois par visite | 75 or, puis +25 à chaque utilisation pendant la run |
| **Service : réparation** | Répare un objet brisé (voir §6.7) | 50 à 100 or |

Le prix d'une des cartes est réduit de moitié (« promo du jour »).

---

## 15. Progression (inspirée de Slay the Spire, avec des talents permanents)

La structure d'une run reprend celle de StS. Entre les runs, le joueur débloque du **contenu** (nouvelles cartes, nouveaux objets, nouvelles classes) et de la **difficulté**, comme dans StS. **En plus**, chaque classe gagne des **niveaux** qui donnent des **points de talent permanents** (voir §9) : le joueur devient plus fort au fil des runs, jusqu'au niveau 10.

### 15.1 Pendant la run

| Élément StS | Version Wipe & Loot |
|---|---|
| **Bénédiction** en début de run | **Bénédiction d'entrée** : **Brégan le Passeur**, qui guide les expéditions jusqu'aux Profondeurs Ardentes, propose un choix parmi 4 bonus de départ, dont certains avec une contrepartie (« Perds 10 PV max, obtiens un objet rare »). |
| Deck de départ basique | **Deck de départ de la classe** : 10 cartes (voir §7.5). |
| Récompenses de cartes après combat | Inchangé : 1 carte parmi 3, influencée par les talents (§9). |
| Amélioration de cartes au feu de camp | **Maître de classe** au feu de camp : améliore une carte ou un sort de barre, **à la place du repos**. On peut aussi acheter une amélioration chez le vendeur gobelin. |
| **Relique de boss** après chaque boss de fin d'acte | **Butin de boss** : choix parmi 3 objets d'équipement épiques, souvent avec un inconvénient (il n'y a pas de reliques, voir §12.4). |
| Ordre fixe des actes | **Ordre fixe des raids** : Profondeurs Ardentes → Aire de Vhaeryx → Irem. |
| **Acte 4** débloqué par 3 clés | **La Nécropole céleste**, débloquée par **3 éclats de clé** récupérés pendant la run (voir ci-dessous). |

**Les 3 éclats de clé de la Nécropole :**
- 🔴 **Éclat de braise** : à la place du repos ou de l'amélioration, sur un feu de camp.
- 🔵 **Éclat d'écaille** : en battant un **boss secondaire renforcé** (signalé sur la carte).
- 🟡 **Éclat de sable** : en renonçant à la récompense d'un coffre.

### 15.2 Entre les runs

- **Niveau de classe (1 à 10)** : à la fin de chaque run, victoire ou défaite, le joueur gagne de l'expérience selon son **score** (voir §15.3). Chaque niveau donne :
  - **1 point de talent permanent** (voir §9) ;
  - **un lot de nouvelles cartes ou de nouveaux objets** pour cette classe.
- **Après le niveau 10**, l'expérience continue de débloquer du contenu cosmétique et des entrées dans les archives, mais plus de points de talent.
- **Déblocage des classes** : au départ, 1 classe est disponible. Les autres se débloquent en accumulant de l'expérience au total (comme les personnages de StS).
- **Niveaux de difficulté** (l'équivalent de l'Ascension de StS) : un défi optionnel pour les joueurs qui ont déjà gagné.
  - Au départ, on joue en **difficulté 0** (normale).
  - **Gagner une run** (battre le boss de l'acte 3) avec une classe débloque la **difficulté 1** pour cette classe. Gagner en difficulté 1 débloque la 2, et ainsi de suite jusqu'à **20**.
  - Avant chaque run, le joueur choisit la difficulté qu'il veut, parmi celles qu'il a débloquées.
  - Chaque niveau **ajoute une contrainte, qui s'ajoute à toutes celles des niveaux précédents**. La difficulté 5 contient donc les contraintes des niveaux 1 à 5.
  - Ce n'est jamais obligatoire : c'est la façon de garder le jeu difficile une fois la classe maîtrisée et ses talents au maximum.
  - Exemples de contraintes :
    - *Difficulté 1 : les boss secondaires sont plus fréquents sur la carte*
    - *Difficulté 2 : les ennemis normaux ont plus de PV*
    - *Difficulté 4 : l'enrage des boss arrive un tour plus tôt*
    - *Difficulté 5 : le feu de camp soigne moins*
    - *Difficulté 7 : un wipe autorisé de moins* (ce type de contrainte revient aux niveaux 12 et 17, jusqu'à 0 wipe autorisé)
    - *Difficulté 10 : le deck de départ contient une carte de malédiction*
    - *Difficulté 14 : les factures de réparation coûtent plus cher*
    - *Difficulté 20 : deux boss d'affilée à la fin de l'acte 3*
- **Archives de la guilde** (compendium) : une encyclopédie qui recense les cartes, objets et monstres découverts, avec un petit texte d'histoire pour chaque entrée.

### 15.3 Score et fin de run

À la fin de chaque run, un écran récapitule :
- les étages atteints, les boss vaincus et les boss secondaires tués ;
- le deck final, l'équipement et la barre de sorts ;
- des **bonus de score** (« Aucun dégât sur un boss », « Légendaire forgé », « Speedrun », « Aucun wipe »…) ;
- un **malus pour chaque wipe**.

Le score détermine l'expérience gagnée. Il servira aussi de base au futur **mode infini**.


### 15.4 Récapitulatif des progressions

#### 🔁 Pendant la run (tout repart à zéro à la fin de la run)

**Au départ de la run :**
- le **deck de départ** de la classe (10 cartes), plus la **carte épique** de chaque arbre de talents complété ;
- la **barre de sorts** : le sort de départ, plus les sorts donnés par les talents ;
- la **bénédiction d'entrée** de Brégan le Passeur (1 bonus au choix parmi 4).

**Ce que le joueur gagne en avançant :**

| Moment | Ce qu'il gagne |
|---|---|
| **Après chaque combat** | 1 carte parmi 3 (orientée par les talents), de l'or, parfois une potion |
| **Après chaque boss** | 1 objet de sa **table de loot** |
| **Après un boss de fin d'acte** | En plus : 1 objet épique au choix parmi 3 (le butin de boss) |
| **Feu de camp** | Se soigner **ou** améliorer une carte ou un sort de barre (le dilemme) |
| **Vendeur gobelin** | Cartes, équipement, potions, amélioration, retrait de carte, réparation |
| **Coffre** | Un objet d'équipement |
| **Nœud « ? »** | Un événement (récompenses, étapes du légendaire, bénédictions temporaires)… ou un **combat caché** |

**Ce qui se construit pendant la run :**
- le **deck** : on ajoute, on améliore et on retire des cartes ;
- l'**équipement** : 6 emplacements, chaque nouvel objet remplace l'ancien ;
- les **sorts de barre** trouvés en chemin ;
- le **légendaire** de la classe (un par run, via sa quête) ;
- les **3 éclats de clé** qui ouvrent la Nécropole céleste.

**Les limites :**
- **3 wipes autorisés** : on paie la réparation et on retente le combat. Le 4ᵉ wipe met fin à la run.
- **Les talents ne changent pas** pendant la run.

#### ♾️ Hors run (permanent)

| Progression | Comment ça marche |
|---|---|
| **Niveau de classe (1 à 10)** | Chaque run, même perdue, rapporte de l'expérience selon le score. |
| **Points de talent** | 1 par niveau de classe, 10 au maximum. On les répartit dans le hall de la guilde, avec un respec gratuit entre deux runs. |
| **Nouvelles cartes et nouveaux objets** | Chaque niveau de classe ajoute un lot de nouvelles cartes ou de nouveaux objets aux récompenses possibles. |
| **Nouvelles classes** | On commence avec le Guerrier. L'expérience totale débloque les 8 autres. |
| **Niveaux de difficulté** | Gagner une run débloque la difficulté suivante pour cette classe, jusqu'à 20. C'est un défi optionnel. |
| **Tables de loot** | Un objet obtenu une fois reste visible pour toujours dans la table de son boss. |
| **Archives de la guilde** | L'encyclopédie des cartes, objets et monstres découverts. |

#### 📈 La courbe d'ensemble

```
Runs 1 à ~5         Niveau 1-4 : peu de talents. On apprend la classe et les boss.
Runs ~5 à ~15       Niveau 5-10 : premières cartes épiques, la spécialisation prend forme.
Après le niveau 10  Plus de nouveaux points. Le défi vient des niveaux de difficulté,
                    des tables de loot à compléter et des autres classes.
```

---

## 16. Plateformes et interface

### 16.1 Cible

- **Navigateur web**, sur **PC** et sur **smartphone**. Pas d'installation nécessaire.
- Plus tard, le jeu pourra être installable sur téléphone en tant qu'application web (PWA), et éventuellement distribué sur PC.

### 16.1 bis Hébergement et données

| Besoin | Solution | Remarques |
|---|---|---|
| **Héberger le jeu** | **GitHub Pages**, depuis le dépôt du projet | Un site statique : tout le jeu tourne dans le navigateur du joueur. |
| **Comptes joueurs** | **Firebase Authentication** | Connexion **anonyme** au premier lancement (aucune inscription), puis possibilité de **lier un compte** (Google, e-mail) pour retrouver sa partie sur un autre appareil. |
| **Sauvegardes et profil** | **Cloud Firestore** | Le profil (niveaux, talents, déblocages, tables de loot découvertes) et la run en cours. |
| **Contenu du jeu** (cartes, ennemis, objets, actes) | **Fichiers de données dans le dépôt** (JSON), livrés avec le jeu | Le contenu évolue avec le code et reste versionné dans Git. Il n'a pas besoin d'être dans Firebase. |

**Points d'attention :**
- **Sécurité :** la configuration Firebase est visible par tout le monde dans le code du jeu, c'est normal. La protection vient des **règles de sécurité Firestore** : chaque joueur ne peut lire et écrire **que ses propres données**.
- **Triche :** comme tout tourne chez le joueur, il est impossible d'empêcher complètement la triche. Pour un jeu solo, ce n'est pas un problème. Ça le deviendrait seulement pour un classement en ligne.
- **Coût :** le palier gratuit de Firebase (Spark) suffit largement pour commencer. Il faut quand même limiter le nombre d'écritures (voir ci-dessous).

### 16.2 Contraintes d'interface

| Contrainte | Conséquence |
|---|---|
| **Smartphone en mode paysage** | Le jeu se joue **en paysage**, sur téléphone comme sur PC, comme *Slay the Spire* : héros à gauche, ennemis à droite, **barre de sorts** au-dessus de la main, main de cartes en bas. PC et téléphone partagent la même disposition (format 16:9), adaptée aux écrans plus larges ou plus étroits. En portrait, le jeu affiche simplement « Tourne ton téléphone ». |
| **Tactile** | Toucher une carte pour la sélectionner, puis toucher la cible. Sur PC, on peut aussi glisser-déposer. |
| **Pas de survol sur mobile** | Les infobulles (description d'un mot-clé, d'un buff…) s'ouvrent par **appui long** sur mobile et par **survol** sur PC. |
| **Lisibilité** | Textes de cartes courts, chiffres en gros, icônes claires. Une carte doit se comprendre en un coup d'œil sur un petit écran. |
| **Sessions interrompues** | La run est **sauvegardée automatiquement** en permanence. On peut fermer le navigateur à tout moment et reprendre plus tard (voir §16.4). |

### 16.3 Écrans principaux

1. **Hall de la guilde** (menu principal) : nouvelle partie, continuer, talents, archives, options.
2. **Choix de la classe**, de ses **talents** (respec gratuit) et du niveau de difficulté.
3. **Carte de l'acte** : les étages, les chemins et les tables de loot des boss.
4. **Combat**.
5. **Récompenses** : choix de carte, or, objet.
6. **Fiche du héros** : deck, barre de sorts, équipement (6 emplacements), talents (consultables, non modifiables pendant la run).
7. **Arbre de talents** : dans le hall de la guilde, avant la run.
8. **Feu de camp**, **vendeur**, **événement**.
9. **Wipe** : réessayer (avec le coût de réparation affiché) ou renoncer.
10. **Fin de run** : score et expérience.

### 16.4 Sauvegarde et reprise

Le joueur doit pouvoir **arrêter et reprendre sa partie quand il veut**, sans rien perdre.

**Ce qui est sauvegardé :**

| Sauvegarde | Contenu |
|---|---|
| **La run en cours** | Classe, acte et étage, carte de l'acte et chemin parcouru, PV, or, deck, barre de sorts, équipement, potions, talents choisis pour cette run, wipes restants, étapes de quête légendaire, éclats de clé. **En combat :** l'état exact du combat (main, pioche, défausse, énergie, ressource de classe, temps de recharge, ennemis, buffs et débuffs). |
| **Le profil du joueur** | Expérience et niveaux de chaque classe, **talents de chaque classe**, classes et cartes débloquées, niveaux de difficulté atteints, **objets découverts dans les tables de loot**, archives de la guilde, statistiques, options. |

**Les règles :**
- **Sauvegarde automatique** après chaque action : chaque carte jouée, chaque choix, chaque nœud. Il n'y a pas de bouton à penser.
- **Bouton « Sauvegarder et quitter »** dans le menu pause, pour ceux qui veulent quitter proprement.
- **Reprise exacte** : en relançant le jeu, « Continuer » ramène le joueur exactement où il en était, même au milieu d'un combat.
- **Une seule run en cours à la fois.** Lancer une nouvelle partie demande de confirmer l'abandon de la run en cours (qui compte alors comme une défaite pour l'expérience).
- **Pas de triche par rechargement** : les tirages aléatoires (récompenses, pioche, événements) sont déterminés par une **graine** propre à la run. Recharger la partie ne change pas ce qui va sortir. Seul un wipe donne une nouvelle graine pour le combat retenté (voir §6.7).

**Où sont stockées les sauvegardes :** sur deux niveaux.

| Niveau | Où | Quand | Rôle |
|---|---|---|---|
| **Local** | Le navigateur de l'appareil | **Après chaque action** | La reprise exacte, même au milieu d'un combat, même sans réseau. |
| **En ligne** | **Cloud Firestore** (Firebase) | À chaque **changement de nœud** (fin d'un combat, d'un événement, d'une visite chez le vendeur…), à la **fin d'une run**, et quand le joueur fait « Sauvegarder et quitter » | Retrouver sa partie sur un autre appareil, et ne rien perdre si le navigateur est vidé. |

- Ce rythme limite les écritures en ligne à quelques dizaines par run, ce qui reste dans le palier gratuit de Firebase.
- **Sans réseau**, le jeu continue de fonctionner avec la sauvegarde locale, puis synchronise quand la connexion revient.
- **En cas de conflit** (deux appareils), le jeu garde la sauvegarde **la plus avancée** et prévient le joueur.
- **Organisation des données (première idée) :**
  - `joueurs/{id}/profil` : niveaux et talents de chaque classe, déblocages, tables de loot découvertes, difficultés atteintes, statistiques, options ;
  - `joueurs/{id}/runs/en_cours` : l'état complet de la run en cours ;
  - `joueurs/{id}/historique/{run}` : un résumé de chaque run terminée (classe, score, étage atteint), pour les statistiques et les archives.

---

## 17. Direction artistique et ambiance

- **Style : pixel art moderne pour tout le jeu** (héros, ennemis, boss, cartes, objets, décors). Lumière venant d'en haut à gauche, contours colorés, éléments lumineux (feu, lave, magie) sans contour. Le détail (règles, tailles, palettes, polices, animations, production) est dans **[la direction artistique](DIRECTION_ARTISTIQUE.md)**.
- **Production :** les images sont dessinées en code avec le générateur du dépôt (`tools/pixel/`), puis retouchées si besoin.
- Une interface qui évoque les **MMO de raid**, avec un style propre au jeu : barre de cast des ennemis, barre de sorts avec des temps de recharge visibles, alertes de boss (« ⚠ Bombe vivante sur toi ! »).
- Des cartes avec un **cadre en pixel art par rareté**, une illustration de 32 × 32 pixels, et un texte posé par-dessus en Nunito, une police arrondie très lisible sur téléphone.
- Une carte d'acte dessinée comme un plan du raid.
- Un ton qui joue sur la **culture raid** (wipes, loot, le joueur qui fonce dans le tas…), sans tomber dans la parodie.
- Musique et sons : ambiance épique, et des sons distincts pour les moments clés (une interruption réussie, un sort qui revient de recharge, un loot légendaire).

---

## 18. Décisions prises

| Sujet | Décision |
|---|---|
| **Titre** | **Wipe & Loot** |
| **Genre** | Deckbuilder roguelite à la *Slay the Spire* |
| **Univers** | **Original** (le monde d'Eldrava), inspiré des MMO de fantasy, sans noms ni éléments repris d'une œuvre existante |
| **Mode de jeu** | **Solo pur** : un seul héros. Les familiers, compagnons et totems sont les seules entités alliées. |
| **Énergie** | **3 par tour, commune à toutes les classes**, plus une **ressource de classe** propre à chacune |
| **Structure** | **3 actes de 10 étages**, plus un acte bonus (la Nécropole céleste) |
| **Spécialisation** | **Talents permanents** choisis avant la run : 3 arbres de 5 paliers, 1 point par niveau de classe, 10 points maximum, respec gratuit entre les runs |
| **Récompense de boss** | Un objet de la table de loot (et, pour un boss de fin d'acte, un choix parmi 3 objets épiques) |
| **Reliques** | **Aucune** : tous les effets passifs passent par l'équipement |
| **Amélioration de cartes** | Au feu de camp (à la place du repos) ou contre de l'or chez le vendeur |
| **Événements « ? »** | Peuvent cacher un combat, comme dans StS |
| **Barre de sorts** | 3 à 4 emplacements de gros sorts à temps de recharge, en plus du deck |
| **Wipe** | 3 wipes autorisés par run : on paie la réparation et on retente le combat |
| **Tables de loot** | Chaque boss a sa table. Un objet reste caché (« ??? ») tant qu'il n'a pas été obtenu une fois. |
| **Équipement** | 6 emplacements (Arme, Amulette, 2 Bagues, 2 Bijoux), une seule règle de remplacement |
| **Légendaires** | Un par classe, obtenu par une petite quête, un seul par run |
| **Progression** | Déblocages de contenu et 20 niveaux de difficulté comme dans StS, **plus** des talents permanents jusqu'au niveau 10 de chaque classe |
| **Plateformes** | Navigateur, sur PC et smartphone, **en mode paysage** |
| **Sauvegarde** | Automatique et permanente, reprise exacte à tout moment (même en combat). Locale après chaque action, en ligne (Firestore) à chaque nœud |
| **Hébergement** | GitHub Pages (site statique) + Firebase (Authentication et Firestore) pour les comptes, le profil et les sauvegardes |
| **Direction artistique** | Pixel art moderne pour tout le jeu, généré en code puis retouché (voir [la direction artistique](DIRECTION_ARTISTIQUE.md)) |
| **Modes futurs** | Mode rapide et mode infini |

---

## 19. Questions ouvertes

| # | Question | Pistes |
|---|---|---|
| 1 | **Classes du premier prototype** | Proposition : **Guerrier** (rage), **Mage** (écoles), **Démoniste** (familier + DoTs), pour 3 styles de jeu très différents. |
| 2 | **Ordre de déblocage des classes** | Le Guerrier est disponible dès le départ. Dans quel ordre débloquer les 8 autres ? |
| 3 | **Technologie** | Pour un jeu statique sur GitHub Pages avec Firebase : TypeScript avec un moteur 2D web (Phaser ou PixiJS), ou une interface web classique (HTML/CSS avec un framework comme React ou Svelte), puisque le jeu est surtout fait de cartes et de menus. À décider au moment du prototype. |
| 4 | **Noms de l'univers** | Les noms actuels (Eldrava, Vulkhar, Vhaeryx, Irem, Sarvok…) sont une première proposition. On pourra les ajuster. |

---

## 20. Prochaines étapes

1. ~~Écrire le concept général~~ ✅
2. ~~Passer en univers original~~ ✅
3. **Concevoir les classes** une par une : deck de départ, environ 50 cartes, 3 arbres de talents, sorts de barre, légendaire. On commence par les 3 classes du prototype.
   - [Guerrier](classes/GUERRIER.md) ✅ (version 0.1)
   - [Mage](classes/MAGE.md) ✅ (version 0.1)
   - [Démoniste](classes/DEMONISTE.md) ✅ (version 0.1)
   - [Prêtre](classes/PRETRE.md) ✅ (version 0.1)
   - [Voleur](classes/VOLEUR.md) ✅ (version 0.1)
   - [Paladin](classes/PALADIN.md) ✅ (version 0.1)
   - [Chasseur](classes/CHASSEUR.md) ✅ (version 0.1)
   - [Chaman](classes/CHAMAN.md) ✅ (version 0.1)
   - [Druide](classes/DRUIDE.md) ✅ (version 0.1)
   - Règles communes : [fonctionnement des classes](classes/README.md)
4. **Concevoir l'acte 1 (les Profondeurs Ardentes)** en détail : trash, boss secondaires, Vulkhar, tables de loot, événements, chiffres.
   - [Acte 1 : les Profondeurs Ardentes](actes/ACTE1_PROFONDEURS_ARDENTES.md) ✅ (version 0.1)
   - [Acte 2 : l'Aire de Vhaeryx](actes/ACTE2_AIRE_DE_VHAERYX.md) ✅ (version 0.1)
   - [Acte 3 : Irem, la cité ensevelie](actes/ACTE3_IREM.md) ✅ (version 0.1)
   - [Acte bonus : la Nécropole céleste](actes/ACTE_BONUS_NECROPOLE.md) ✅ (version 0.1)
5. **Prototyper le combat** (sur papier ou en code) avec 1 classe et quelques ennemis.
