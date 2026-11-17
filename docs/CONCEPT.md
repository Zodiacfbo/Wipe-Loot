# Wipe & Loot — Document de concept

> Titre provisoire · Version 0.1 · Projet personnel / fan game

---

## 1. Pitch

**Wipe & Loot** est un **deckbuilder roguelike** dans la lignée de *Slay the Spire*, situé dans l'univers de **World of Warcraft**.

Le joueur incarne un héros d'une des 9 classes de WoW Classic et s'attaque, seul, aux **raids mythiques d'Azeroth** : le Cœur du Magma, le Repaire de l'Aile noire, Ahn'Qiraj… Chaque boss reprend ses **mécaniques iconiques**, traduites en règles de cartes. On meurt (« wipe »), on recommence, on débloque, on progresse.

**Phrase d'accroche :** *« Chaque boss est une mécanique, chaque loot est une décision. »*

---

## 2. Piliers de design

1. **L'identité de classe avant tout**
   Chaque classe a sa propre ressource, ses propres contraintes et ses sorts iconiques. Jouer un Guerrier et jouer un Mage doivent donner deux expériences différentes.

2. **Les boss sont des mécaniques, pas des sacs à PV**
   Interrompre, sortir du feu, dissiper, gérer les phases, battre l'enrage : le joueur doit *lire* le combat comme un raideur lit un boss.

3. **La nostalgie Classic, en restant simple**
   Arbres de talents, fragments d'harmonisation, objets légendaires, buffs mondiaux. On garde la saveur sans la complexité d'un MMO.

4. **Facile à prendre en main, profond à maîtriser**
   Les systèmes annexes (l'équipement par exemple) restent volontairement légers. La profondeur vient des cartes et des synergies.

---

## 3. Boucle de jeu

### 3.1 Boucle d'une run

```
Choix de la classe
   └─► Acte 1 (raid) ─► Acte 2 (raid) ─► Acte 3 (raid) ─► [Acte secret]
          │
          └─ Carte à embranchements : combats, événements, repos, boutique...
               └─ Boss secondaires (élites) ─► Boss final de l'acte
```

- Une **run** correspond à un **palier de raids**, avec 3 actes plus un acte secret.
- Chaque acte est une **carte à embranchements** (comme dans StS) : le joueur choisit son chemin.
- **Après chaque combat**, le joueur choisit une carte parmi 3 (ou n'en prend aucune).
- **Après chaque boss**, il gagne un **point de talent** (voir §6).
- **La mort met fin à la run.** Le joueur gagne quand même de l'expérience pour sa classe (voir §9).

### 3.2 Les nœuds de la carte

| Nœud | Équivalent StS | Description |
|---|---|---|
| ⚔️ **Pack de trash** | Combat | Combat standard contre les monstres du raid. |
| 💀 **Boss secondaire** | Élite | Un boss du raid avec sa mécanique (Magmadar, Garr…). Meilleur loot. |
| 🔥 **Feu de camp** | Repos | **Se reposer** (soigne une partie des PV) **ou** aller voir le **maître de classe** (améliorer une carte). |
| 💰 **Vendeur gobelin** | Marchand | Achat de cartes, de potions et d'équipement. Retrait de cartes contre de l'or. |
| ❓ **Quête** | Événement | Rencontres avec des PNJ du lore, des choix narratifs et les étapes des quêtes légendaires. |
| 📦 **Coffre** | Trésor | Loot gratuit : équipement ou relique. |
| 👑 **Boss de fin d'acte** | Boss | Le boss final du raid : Ragnaros, Nefarian, C'Thun… |

---

## 4. Le combat

### 4.1 La base (comme dans StS)

- Le joueur pioche **5 cartes** par tour.
- Il dispose d'une **réserve d'énergie** par tour pour jouer ses cartes (voir §11, question ouverte).
- Il existe trois types de cartes : **Attaque**, **Compétence** (défense / utilitaire) et **Pouvoir** (effet permanent pour le combat).
- Le **blocage** absorbe les dégâts et disparaît en début de tour.
- Les ennemis affichent leur **intention** pour le prochain tour.

### 4.2 Les ajouts WoW

| Mécanique WoW | Traduction en cartes |
|---|---|
| **Barre d'incantation** | Les intentions des ennemis s'affichent sous forme de **barre de cast**. Les cartes avec le mot-clé **Interruption** (Coup de pied, Contresort, Volée de coups, Horion de terre…) annulent le sort en cours. |
| **Enrage timer** | Après un nombre de tours défini, le boss passe en **Berserk** : ses dégâts sont fortement augmentés. Cela empêche le jeu trop défensif et valorise les decks à dégâts. |
| **Phases** | Le boss change de comportement et de règles à certains seuils de PV (75 %, 50 %, 25 %…). |
| **« Ne restez pas dans le feu »** | Une carte-statut **Zone de feu** est ajoutée à la main du joueur. S'il ne la joue pas (coût 1 : « Bouger »), elle lui inflige des dégâts en fin de tour. |
| **Malédictions, poisons, magie, maladies** | Des débuffs typés qui ne s'enlèvent qu'avec une carte de **Dissipation** du bon type. Toutes les classes ne peuvent pas tout dissiper, et c'est voulu. |
| **Adds** | Des ennemis secondaires invoqués par le boss. Le **contrôle des foules** (Métamorphose, Peur, Piège givrant, Assommer) prend tout son sens. |

### 4.3 Mots-clés de base (première liste)

- **Interruption** : annule l'incantation en cours de la cible.
- **Dissipation (type)** : retire un débuff de ce type.
- **DoT** : dégâts infligés au début de chaque tour de l'ennemi pendant X tours.
- **Contrôle** : la cible saute son prochain tour. Les boss sont immunisés.
- **Instantané** : ne termine pas l'enchaînement et ne coûte pas d'action (à préciser).
- **Épuisé** : la carte est retirée pour le reste du combat une fois jouée.

---

## 5. Les classes

Les **9 classes de WoW Classic**. Chacune a une **mécanique principale** qui la rend unique.

| Classe | Mécanique principale | Sorts iconiques |
|---|---|---|
| **Guerrier** | **Rage** : se gagne en frappant et en étant frappé, sans régénération naturelle. **Postures** (Armes / Fureur / Défensive) qui modifient les effets des cartes. | Charge, Frappe héroïque, Frappe mortelle, **Exécution** (consomme toute la rage), Tourbillon, Sanguinaire, Heurt de bouclier, Mur protecteur |
| **Voleur** | **Points de combo** : les générateurs en donnent, les finishers les consomment. **Camouflage** : une carte d'ouverture spéciale jouable au tour 1. | Attaque pernicieuse, Attaque sournoise, Éviscération, Débiter, Aiguillon perfide, Disparition, Poisons |
| **Mage** | **Écoles de magie** : Givre (geler l'ennemi, puis *Fracasser* = critiques garantis), Feu (*Enflammer* qui s'accumule, Combustion), Arcane (gestion du mana, Arcanes surpuissants). | Éclair de givre, Boule de feu, Pyroblast, Nova de givre, Métamorphose, Bloc de glace, Évocation, Contresort |
| **Démoniste** | **Démon familier** permanent (Diablotin, Marcheur du Vide, Succube, Chasseur corrompu). **DoTs** qui s'accumulent. **Connexion** : sacrifier des PV contre de l'énergie. **Fragments d'âme** gagnés quand un ennemi meurt sous Drain d'âme. | Corruption, Malédiction d'agonie, Immolation, Trait de l'ombre, Feu de l'âme, Peur, Voile mortel |
| **Chasseur** | **Familier** autonome qui attaque chaque tour et qui obéit à des cartes d'ordre. **Aspects** (sortes de postures). **Pièges** posés à l'avance, qui se déclenchent quand l'ennemi agit. | Visée, Flèches multiples, Piqûre de serpent, Marque du chasseur, Piège givrant, Feindre la mort |
| **Paladin** | **Sceaux et Jugement** : un Sceau actif améliore les attaques, le Jugement le consomme pour un effet puissant. **Auras** passives. | Sceau de vertu, Sceau du croisé, Jugement, Consécration, Marteau de la justice, Bouclier divin, Imposition des mains |
| **Prêtre** | **Boucliers persistants** (Mot de pouvoir : Bouclier) et soins dont l'excédent est converti en ressource. **Forme d'Ombre** qui transforme le style de jeu. | Mot de l'ombre : Douleur, Fouet mental, Étreinte vampirique, Châtiment, Flammes sacrées, Infusion de puissance |
| **Chaman** | **4 emplacements de totems** (Terre, Feu, Eau, Air) : des entités persistantes avec un effet à chaque tour. **Réincarnation** : une résurrection par run. | Éclair, Chaîne d'éclairs, Horion de terre, Horion de flammes, Arme Furie-des-vents, Frappe-tempête, Vague de soins |
| **Druide** | **Formes** : Ours (blocage, rage), Félin (énergie, combo), Sélénien / lanceur de sorts. Les cartes ont un **tag de forme**, et changer de forme coûte une action. | Mutilation, Morsure féroce, Rugissement, Éclat lunaire, Feu stellaire, Colère, Récupération, Renaissance, Innervation |

---

## 6. Spécialisations et talents

Le joueur ne choisit **pas sa spécialisation au départ**. Il choisit une **classe**, et sa spé se construit **au fil de la run**, comme les arbres de talents de Classic.

- Chaque classe possède **3 arbres de talents**, ceux de Classic (Guerrier : Armes / Fureur / Protection ; Mage : Arcane / Feu / Givre ; etc.).
- Le joueur gagne **un point de talent après chaque boss** (secondaire ou final).
- Plus il investit dans un arbre, plus les **récompenses de cartes** proposées après les combats penchent vers cet arbre.
- Les **talents finaux** de chaque arbre débloquent les **cartes signatures** de la spécialisation : Frappe mortelle, Sanguinaire, Heurt de bouclier, Pyroblast, Forme d'Ombre…
- Les **builds hybrides** sont possibles et encouragés, dans l'esprit de Classic.

> **Exemple :** un Guerrier qui met ses 3 premiers points en Protection verra plus de cartes de blocage et de Heurt de bouclier, mais il peut ensuite basculer vers Fureur pour un build « tank qui tape ».

---

## 7. Les raids (actes)

On commence par **WoW Classic**. Chaque raid est un acte, avec ses monstres de trash, ses boss secondaires (élites) et son boss final. Le **lore** du raid sert de fil narratif à l'acte.

### Acte 1 — Le Cœur du Magma
*Les profondeurs du mont Rochenoire. Le Seigneur du feu Ragnaros est revenu.*

- **Trash** : Chiens du Magma, Géants de lave, Seigneurs du feu, Surineurs du Magma
- **Boss secondaires** :
  - **Lucifron** : lance des malédictions qu'il faut dissiper.
  - **Magmadar** : *Panique*, certaines cartes en main deviennent injouables pendant un tour.
  - **Gehennas** : *Pluie de feu*, des cartes Zone de feu arrivent en main.
  - **Garr** : accompagné d'adds qui explosent à leur mort.
  - **Baron Geddon** : *Bombe vivante*, une carte qui t'inflige de lourds dégâts si elle est encore dans ta main en fin de tour.
  - **Shazzrah** : se téléporte et contre tes sorts.
  - **Sulfuron** : soigne ses lieutenants, qu'il faut interrompre.
  - **Golemagg** : accompagné de deux Rageurs du Magma.
- **Boss final** : **Majordome Executus**, puis **Ragnaros**
  - *Courroux de Ragnaros* : défausse ta main.
  - Au tour X, il **submerge** : des **Fils de la flamme** apparaissent et il faut les tuer avant son retour.
- **Événement spécial** : les **Seigneurs de l'eau d'Hydraxis** te confient de quoi éteindre les runes du Cœur du Magma, ce qui affaiblit Majordome.

### Acte 2 — Le Repaire de l'Aile noire
*Le sommet du mont Rochenoire. Nefarian mène ses expériences sur les dragons chromatiques.*

- **Boss secondaires** :
  - **Tranchetripe l'Indompté** : une phase de contrôle d'orbe.
  - **Vaelastrasz le Corrompu** : *Adrénaline brûlante*, énergie illimitée mais tu brûles à chaque tour. Une course contre la montre.
  - **Seigneur des couvées Lashlayer**
  - **Gueule-de-feu, Ebonroc, Flamegor** : les souffles des dragons.
  - **Chromaggus** : souffles aléatoires et 5 afflictions de couvée. Si elles s'accumulent, tu es transformé.
- **Boss final** : **Nefarian**
  - **Appels de classe** : des effets qui visent **spécifiquement la classe du joueur**.

### Acte 3 — Ahn'Qiraj
*Les profondeurs du temple d'Ahn'Qiraj. Un Dieu très ancien rêve sous le sable.*

- **Boss secondaires** :
  - **Le Prophète Skeram** : crée des copies de lui-même.
  - **Les Empereurs jumeaux** : ils échangent leurs positions et chacun est immunisé à un type de dégâts.
  - **Ouro**, **la Famille royale insectoïde**, **Viscidus**…
- **Boss final** : **C'Thun**
  - Phase 1 : l'**Œil**, avec des rayons qui se propagent.
  - Phase 2 : le corps, et une phase **dans l'estomac** où le joueur combat avec une main réduite.

### Acte secret — Naxxramas
*La nécropole flottante du Fléau.*

- Débloqué en récupérant les **3 fragments d'harmonisation** pendant la run (voir §9.1), comme l'acte 4 de StS avec ses 3 clés.
- **Boss final** : **Kel'Thuzad**

### Embranchements possibles (plus tard)
- **Onyxia** (« Many whelps! Handle it! ») : un acte court entre deux raids.
- **Zul'Gurub** : un acte alternatif au Repaire de l'Aile noire, avec Hakkar.

---

## 8. Récompenses : cartes, équipement, reliques, potions

### 8.1 Les cartes
Après chaque combat, le joueur choisit une carte parmi 3, ou n'en prend aucune. Les cartes proposées dépendent de la classe et des talents investis (voir §6).

### 8.2 L'équipement (volontairement simple)

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

### 8.3 Les légendaires de classe

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

### 8.4 Les reliques
Des **objets passifs** sans emplacement, qui s'accumulent comme dans StS. Exemples d'inspiration :
- **Buffs mondiaux** (temporaires, pour quelques combats) : Tête d'Onyxia, Fleur-de-chant, Bénédiction du Chef de guerre ;
- **Objets de lore** : Pierre de foyer, Clé du Repaire de l'Aile noire, Œil de Sulfuron…

### 8.5 Les potions (consommables)
Un nombre limité d'emplacements (3 au départ). Exemples : Flacon des Titans, Élixir de la mangouste, Pierre de soins, Potion de protection contre le feu, Potion de mana majeure…

---

## 9. Progression (inspirée de Slay the Spire)

Le principe de StS est repris tel quel : **le joueur ne devient pas plus fort d'une run à l'autre**. Il débloque du **contenu** (nouvelles cartes, reliques, classes) et de la **difficulté**. Toute la puissance se gagne pendant la run.

### 9.1 Pendant la run

| Élément StS | Version WoW |
|---|---|
| **Bénédiction de Neow** en début de run | **Bénédiction à l'entrée du raid** : un PNJ (par exemple Lothos Rift-waker à l'entrée du Cœur du Magma) propose un choix parmi 4 bonus de départ, dont certains avec une contrepartie (« Perds 10 PV max, obtiens une relique rare »). |
| Deck de départ basique | **Deck de départ de la classe** : 10 cartes (attaques basiques, défenses basiques et 1 ou 2 cartes signatures de la classe). |
| Récompenses de cartes après combat | Inchangé : 1 carte parmi 3, influencée par les talents (§6). |
| Amélioration de cartes au feu de camp | **Maître de classe** au feu de camp : améliore une carte (Frappe héroïque → Frappe héroïque+). |
| **Relique de boss** après chaque boss de fin d'acte | **Butin de boss** : choix parmi 3 reliques puissantes, souvent avec un inconvénient. |
| Ordre fixe des actes | **Ordre fixe des raids** : Cœur du Magma → Repaire de l'Aile noire → Ahn'Qiraj. |
| **Acte 4** débloqué par 3 clés | **Naxxramas** débloqué par **3 fragments d'harmonisation** récupérés pendant la run (voir ci-dessous). |

**Les 3 fragments d'harmonisation pour Naxxramas** (équivalents des 3 clés de StS) :
- 🔴 **Fragment de feu** : à la place du repos ou de l'amélioration, sur un feu de camp.
- 🔵 **Fragment des dragons** : en battant un **boss secondaire renforcé** (signalé sur la carte).
- 🟢 **Fragment ancien** : en renonçant à la récompense d'un coffre.

Récupérer les 3 donne accès, après C'Thun, à un dernier acte court à Naxxramas contre **Kel'Thuzad**. C'est la vraie fin du jeu.

### 9.2 Entre les runs

- **Barre d'expérience par classe** : à la fin de chaque run, victoire ou défaite, le joueur gagne de l'expérience selon son score (étages atteints, boss tués, élites vaincus…). Chaque niveau débloque **un lot de nouvelles cartes ou de nouvelles reliques** pour cette classe.
- **Déblocage des classes** : au départ, 3 classes sont disponibles. Les autres se débloquent en accumulant de l'expérience au total (comme les personnages de StS).
- **Niveaux de difficulté** (l'équivalent de l'Ascension) : **20 niveaux par classe**, débloqués un par un en gagnant une run au niveau précédent. Chaque niveau ajoute un modificateur cumulable, par exemple :
  - *Les ennemis ont plus de PV*
  - *Les boss secondaires sont plus dangereux*
  - *L'enrage arrive un tour plus tôt*
  - *Le feu de camp soigne moins*
  - *Le deck de départ contient une carte de malédiction*
  - *Niveau 20 : deux boss d'affilée à la fin de l'acte 3*
- **Compendium** : une encyclopédie qui recense les cartes, reliques, objets et monstres découverts, avec un petit texte de lore pour chaque entrée.

> **Ce qu'on retire par rapport à la version précédente :** les harmonisations qui débloquaient un raid de départ et les réputations. L'ordre des raids reste fixe, comme dans StS. Les réputations pourront revenir plus tard sous forme d'événements pendant la run, sans progression permanente.

---

## 10. Direction artistique et ambiance (pistes)

- Une interface qui évoque celle de WoW : barre de cast des ennemis, icônes de sorts reconnaissables, alertes de boss façon add-on de raid (« ⚠ Bombe vivante sur toi ! »).
- Des cartes illustrées avec les **icônes de sorts** et une couleur de bordure par école de magie ou par classe.
- Un ton qui joue aussi sur la **culture raid** : wipes, loot, « Leeroy Jenkins »… sans tomber dans la parodie.

---

## 11. Questions ouvertes

| # | Question | Pistes |
|---|---|---|
| 1 | **Solo pur, ou héros + groupe PNJ ?** | Le solo pur est plus simple. Piste avancée : les soigneurs jouent avec un **Tank PNJ** à garder en vie. C'est riche, mais plus complexe. |
| 2 | **Modèle d'énergie** | (a) Énergie commune à toutes les classes (3 par tour) + ressource secondaire propre à chaque classe : plus simple à équilibrer. (b) Ressource unique par classe : plus fidèle à WoW. |
| 3 | **Classes du premier prototype** | Proposition : **Guerrier** (rage), **Mage** (écoles), **Démoniste** (familier + DoTs), pour 3 styles de jeu très différents. |
| 4 | **Taille d'un acte** | Combien de nœuds par carte, et combien de boss secondaires par acte ? |
| 5 | **Plateforme et technologie** | Navigateur, PC, mobile ? Moteur (Godot, Unity, web) ? |

---

## 12. Prochaines étapes

1. Trancher les questions ouvertes du §11.
2. Concevoir **une classe complète** : 20 à 30 cartes, ses 3 arbres de talents, son légendaire.
3. Concevoir **l'acte 1 (Cœur du Magma)** en détail : trash, boss secondaires, Ragnaros, événements.
4. Prototyper le combat (sur papier ou en code).

---

> **Note :** World of Warcraft et tous ses éléments (noms, personnages, lieux, objets) appartiennent à Blizzard Entertainment. Ce projet est un fan game personnel et non commercial. Une sortie commerciale nécessiterait de passer à un univers original.
