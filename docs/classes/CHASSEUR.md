# Classe : le Chasseur

> Wipe & Loot · Fiche de classe · Version 0.1
> Les chiffres sont **indicatifs** : ils serviront de base aux premiers tests d'équilibrage.

---

## 1. Identité

> *« Mon arc vise, ma bête mord. Toi, tu cours. »*

Le Chasseur combat **à distance**, accompagné d'un **compagnon animal** fidèle. Il marque sa proie, la crible de flèches, pose des **pièges** sur son chemin et adapte son style en invoquant l'**esprit** d'un animal.

- **Rôle :** dégâts physiques à distance, contrôle, gestion des adds.
- **Difficulté :** ⭐⭐ Moyenne.
- **Déblocage :** par l'expérience.
- **Fantasme de jeu :** un duo inséparable, le chasseur et sa bête, qui abat un boss pendant que les pièges s'occupent des adds.

| Statistique | Valeur |
|---|---|
| **PV max** | 70 |
| **Énergie** | 3 par tour |
| **Ressource de classe** | Compagnon animal (entité alliée) |
| **Esprit** | Un esprit animal actif à la fois |
| **Sort de barre de départ** | Tir arcanique |

---

## 2. Mécanique 1 : le compagnon animal

- Le Chasseur choisit son compagnon **au début de la run**, parmi trois :

| Compagnon | Action en fin de tour | Rôle |
|---|---|---|
| 🐺 **Loup** | Inflige 5 dégâts à ta cible. | Dégâts |
| 🐻 **Ours** | Inflige 3 dégâts à ta cible et te donne 3 blocage. | Défense |
| 🦖 **Raptor** | Inflige 3 dégâts à ta cible et applique Saignement 2. | Dégâts dans la durée |

- Le compagnon **agit automatiquement à la fin de chaque tour du joueur**, sur la **dernière cible** que le Chasseur a visée.
- Il **ne peut pas mourir**. Certains ennemis peuvent cependant l'**étourdir** : il ne fait rien pendant un tour.
- Les cartes **Ordre** lui font faire une action supplémentaire ou spéciale.
- D'autres compagnons pourront être débloqués plus tard par l'expérience.

**L'intérêt :** le compagnon donne une base de dégâts constante, et le choix du compagnon oriente toute la run.

---

## 3. Mécanique 2 : les Esprits et les Pièges

### Les Esprits animaux
- Les cartes **Esprit** sont des Compétences à 0 énergie. **Un seul Esprit actif à la fois** : en jouer un autre le remplace.

| Esprit | Effet |
|---|---|
| 🦅 **Esprit de l'aigle** | Tes Attaques infligent +2 dégâts. |
| 🐢 **Esprit de la tortue** | Tes cartes de blocage donnent +3 blocage. |
| 🐆 **Esprit du guépard** | Pioche 1 carte de plus au début de ton tour. Tu subis 20 % de dégâts en plus. |

### Les Pièges
- Les cartes **Piège** se posent sur le terrain (3 Pièges maximum en même temps).
- Un Piège se **déclenche au début du prochain tour ennemi**, sur le **premier ennemi qui agit**. Les Pièges se déclenchent dans l'ordre où ils ont été posés.
- Un Piège non déclenché reste en place jusqu'à son déclenchement ou la fin du combat.

**L'intérêt :** les Pièges sont des effets **préparés à l'avance**. Le Chasseur doit anticiper quel ennemi va agir en premier.

---

## 4. Deck de départ et barre de sorts

### 4.1 Deck de départ (10 cartes)

| Carte | Qté | Coût | Type | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Tir** | 4 | 1 | Attaque | Inflige 6 dégâts. | 9 dégâts |
| **Repli** | 4 | 1 | Compétence | Gagne 5 blocage. | 8 blocage |
| **Tir ajusté** | 1 | 2 | Attaque | Inflige 13 dégâts. | 18 dégâts |
| **Ordre : Attaque** | 1 | 0 | Compétence (Ordre) | Ton compagnon agit immédiatement. | Pioche 1 carte |

### 4.2 Sort de barre de départ

| Sort | Coût | Recharge | Effet |
|---|---|---|---|
| **Tir arcanique** | 0 | 2 tours | Inflige 5 dégâts. **Ignore le blocage.** |

---

## 5. Les cartes (51)

**Légende des raretés :** C = Commune · PC = Peu commune · R = Rare · É = Épique (débloquée par le dernier palier de talent de son arbre).

### 5.1 Tronc commun (9 cartes)

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Flèches multiples** | 1 | Attaque | C | Inflige 5 dégâts à tous les ennemis. | 8 dégâts |
| **Flèche venimeuse** | 1 | Attaque | C | Inflige 3 dégâts. Applique DoT 3 pendant 4 tours. | 4 / DoT 4 |
| **Rappel** | 0 | Compétence | C | Pioche 1 carte. Ton compagnon inflige +2 dégâts ce tour-ci. | +4 dégâts |
| **Esprit de l'aigle** | 0 | Compétence (Esprit) | C | Active l'Esprit de l'aigle. | Pioche 1 carte |
| **Esprit de la tortue** | 0 | Compétence (Esprit) | C | Active l'Esprit de la tortue. | Pioche 1 carte |
| **Esprit du guépard** | 0 | Compétence (Esprit) | PC | Active l'Esprit du guépard. | Pioche 1 carte |
| **Marque de la proie** | 0 | Compétence | PC | Marque la cible pour le combat : elle subit +3 dégâts de chacune de tes Attaques et de chaque attaque de ton compagnon. Une seule cible marquée à la fois. | +4 dégâts |
| **Piège givrant** | 1 | Compétence (Piège) | PC | **Piège :** l'ennemi qui le déclenche est **Contrôlé** 1 tour (un boss voit sa prochaine attaque réduite de moitié). | Coûte 0 |
| **Tir de recul** | 1 | Attaque | PC | Inflige 4 dégâts. La cible (sauf boss) est Contrôlée 1 tour. **Épuisé.** | N'est plus Épuisé |

### 5.2 Arbre Maîtrise des bêtes (14 cartes) : le compagnon

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Ordre : Attaque** | 0 | Compétence (Ordre) | C | Ton compagnon agit immédiatement. | Pioche 1 carte |
| **Ordre : Protège-moi** | 1 | Compétence (Ordre) | C | Ton compagnon te donne 8 blocage. | 11 blocage |
| **Ordre : Hurlement** | 1 | Compétence (Ordre) | C | Tous les ennemis sont Démoralisés 1 tour. Ton compagnon inflige +2 dégâts ce tour-ci. | 2 tours |
| **Ordre : Égorge** | 2 | Compétence (Ordre) | C | Ton compagnon inflige 15 dégâts à ta cible. | 20 dégâts |
| **Bête intérieure** | 1 | Compétence | C | Toi et ton compagnon infligez +3 dégâts ce tour-ci. | +5 dégâts |
| **Rage du compagnon** | 0 | Compétence | C | La prochaine attaque de ton compagnon inflige +4 dégâts. | +6 dégâts |
| **Morsure partagée** | 0 | Attaque | C | Inflige 3 dégâts. Ton compagnon agit immédiatement. **Éphémère.** | 5 dégâts |
| **Lien sauvage** | 1 | Pouvoir | PC | Chaque fois que ton compagnon agit, gagne 2 blocage. | 3 blocage |
| **Frénésie** | 1 | Pouvoir | PC | Ton compagnon inflige +1 dégât de plus chaque fois qu'il agit (cumulatif pour le combat). | Inné |
| **Intimidation** | 1 | Compétence (Ordre) | PC | Ton compagnon effraie la cible : un ennemi normal est Contrôlé 1 tour. Contre un boss : **Interruption**. | Coûte 0 |
| **Dressage** | 1 | Pouvoir | PC | Tes cartes Ordre coûtent 1 de moins (minimum 0). | Coûte 0 |
| **Esprit de meute** | 2 | Pouvoir | R | Un **Loup spectral** se joint à toi pour ce combat : il inflige 3 dégâts à la fin de chacun de tes tours. | 5 dégâts |
| **Instinct de tueur** | 1 | Pouvoir | R | Quand ton compagnon tue un ennemi, gagne 1 énergie et pioche 1 carte. | Inné |
| **Fureur primitive** | 2 | Pouvoir | É | Ton compagnon agit **deux fois** à la fin de chacun de tes tours. | Coûte 1 |

### 5.3 Arbre Précision (14 cartes) : le tireur d'élite

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Tir ajusté** | 2 | Attaque | C | Inflige 13 dégâts. | 18 dégâts |
| **Tir perçant** | 1 | Attaque | C | Inflige 7 dégâts. **Ignore le blocage.** | 10 dégâts |
| **Tir en rafale** | 1 | Attaque | C | Inflige 3 dégâts 3 fois. | 4 × 3 |
| **Tir double** | 1 | Attaque | C | Inflige 5 dégâts à deux ennemis. | 7 dégâts |
| **Flèche ardente** | 1 | Attaque | C | Inflige 6 dégâts. Applique DoT 2 pendant 3 tours. | 8 / DoT 3 |
| **Concentration** | 0 | Compétence | C | Ta prochaine Attaque ce tour-ci inflige +6 dégâts. | +9 dégâts |
| **Respiration lente** | 1 | Compétence | C | Gagne 6 blocage. Ta première Attaque du prochain tour inflige +4 dégâts. | 9 / +6 |
| **Tir fatal** | 1 | Attaque | PC | Inflige 8 dégâts, **triplés** si la cible a 20 % de PV ou moins. | 11 dégâts |
| **Visée assurée** | 1 | Pouvoir | PC | Tes Attaques qui coûtent 2 énergie ou plus infligent +5 dégâts. | +8 dégâts |
| **Salve** | 2 | Attaque | R | Inflige 4 dégâts à tous les ennemis, 3 fois. | 5 × 3 |
| **Tir de précision** | 3 | Attaque | R | Inflige 30 dégâts. | 40 dégâts |
| **Calme absolu** | 1 | Pouvoir | R | Le premier Tir ajusté ou Tir de précision de chaque tour coûte 1 de moins. | Inné |
| **Maître tireur** | 1 | Pouvoir | R | Marque de la proie donne +5 dégâts au lieu de +3. | Coûte 0 |
| **Tir du cœur** | 2 | Attaque | É | Inflige 20 dégâts. **Ignore le blocage.** Double dégâts si la cible est Marquée. | 26 dégâts |

### 5.4 Arbre Survie (14 cartes) : pièges et corps à corps

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Piège immolation** | 1 | Compétence (Piège) | C | **Piège :** applique DoT 4 pendant 3 tours à l'ennemi qui le déclenche. | DoT 6 |
| **Piège à venin** | 1 | Compétence (Piège) | C | **Piège :** applique DoT 2 pendant 3 tours à **tous** les ennemis. | DoT 3 |
| **Riposte sauvage** | 1 | Attaque | C | Inflige 8 dégâts. Coûte 0 si tu as bloqué une attaque depuis ton dernier tour. | 11 dégâts |
| **Coup de hachette** | 1 | Attaque | C | Inflige 7 dégâts. Applique Saignement 2. | 9 / 3 |
| **Désengagement** | 0 | Compétence | C | Gagne 4 blocage. Pioche 1 carte. | 6 blocage |
| **Lancer de filet** | 1 | Compétence | C | La cible (sauf boss) est Contrôlée 1 tour. | Coûte 0 |
| **Sens aiguisés** | 1 | Compétence | C | Pioche 2 cartes. Gagne 2 blocage. | Pioche 3 cartes |
| **Piège explosif** | 1 | Compétence (Piège) | PC | **Piège :** inflige 8 dégâts à **tous** les ennemis. | 12 dégâts |
| **Contre-attaque** | 1 | Compétence | PC | Gagne 6 blocage. Le prochain ennemi qui t'attaque ce tour-ci est Contrôlé à son prochain tour (sauf boss). | 9 blocage |
| **Dard paralysant** | 1 | Attaque | PC | Inflige 4 dégâts. Applique Ralenti 3 tours. Si la cible prépare une Incantation, elle est **retardée d'un tour**. | 6 dégâts |
| **Instinct de survie** | 1 | Pouvoir | PC | Gagne 2 Robustesse. | 3 Robustesse |
| **Maître des pièges** | 2 | Pouvoir | R | Tes Pièges se déclenchent **deux fois**. | Coûte 1 |
| **Pièges en série** | 1 | Pouvoir | R | Chaque fois qu'un de tes Pièges se déclenche, pioche 1 carte. | Gagne aussi 2 blocage |
| **Champ de pièges** | 2 | Compétence | É | Pose 3 **Pièges explosifs**. | Coûte 1 |

---

## 6. La barre de sorts

| Sort | Coût | Recharge | Effet | Source principale |
|---|---|---|---|---|
| **Tir arcanique** | 0 | 2 tours | Inflige 5 dégâts. Ignore le blocage. | Départ |
| **Fureur bestiale** | 0 | 5 tours | Ton compagnon agit **3 fois** immédiatement. | Talent Maîtrise des bêtes, palier 3 |
| **Feindre la mort** | 0 | 5 tours | Jusqu'à ton prochain tour, les ennemis te croient mort : **leurs Attaques visent ton compagnon** (tu ne subis aucun dégât d'Attaque). | Talent Maîtrise des bêtes, palier 3 · Talent Survie, palier 3 |
| **Tir rapide** | 0 | 4 tours | Ce tour-ci, tes Attaques coûtent 1 de moins (minimum 0). | Talent Précision, palier 3 |
| **Flèche muselière** | 0 | 4 tours | Inflige 3 dégâts. **Interruption.** | Talent Précision, palier 3 |
| **Flèche apaisante** | 0 | 5 tours | Retire tous les buffs de la cible. Si elle est en **Berserk** (enrage), le Berserk est suspendu pendant 1 tour. | Talent Survie, palier 3 |

**Sorts de barre dans les tables de loot** (exemples) : *Fusée éclairante* (révèle les deux prochaines intentions de tous les ennemis, recharge 3), *Appel du compagnon* (ton compagnon agit et te donne 6 blocage, recharge 3).

---

## 7. Les talents

### 7.1 Arbre Maîtrise des bêtes

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Compagnon robuste** : ton compagnon inflige +1 dégât. | **Lien endurant** : +6 PV max. |
| **2** | **Férocité** : les attaques de ton compagnon appliquent Saignement 1. | **Esprit animal** : ton compagnon agit une fois au tout début de chaque combat. |
| **3** | **Fureur bestiale** : ajoute ce sort à ta barre. | **Feindre la mort** : ajoute ce sort à ta barre. |
| **4** | **Maître de meute** : Esprit de meute coûte 0. | **Quatrième emplacement** : ta barre de sorts gagne un 4ᵉ emplacement. |
| **5** | **Fureur primitive** (carte épique) | — |

### 7.2 Arbre Précision

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Tirs améliorés** : Tir et Tir ajusté infligent +2 dégâts. | **Œil de faucon** : Marque de la proie donne +1 dégât de plus. |
| **2** | **Mortalité** : Tir fatal triple ses dégâts sous 30 % de PV au lieu de 20 %. | **Sang-froid** : ta première Attaque de chaque combat coûte 0. |
| **3** | **Tir rapide** : ajoute ce sort à ta barre. | **Flèche muselière** : ajoute ce sort à ta barre. |
| **4** | **Tireur d'élite** : tes Attaques qui coûtent 2 énergie ou plus infligent +3 dégâts. | **Quatrième emplacement** : ta barre de sorts gagne un 4ᵉ emplacement. |
| **5** | **Tir du cœur** (carte épique) | — |

### 7.3 Arbre Survie

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Pièges améliorés** : tes Pièges infligent +3 dégâts. | **Endurance** : +8 PV max. |
| **2** | **Réflexes** : Désengagement donne +3 blocage de plus. | **Piégeur né** : commence chaque combat avec un Piège explosif posé. |
| **3** | **Flèche apaisante** : ajoute ce sort à ta barre. | **Feindre la mort** : ajoute ce sort à ta barre. |
| **4** | **Instinct du chasseur** : quand un de tes Pièges se déclenche, gagne 1 énergie (1 fois par tour). | **Survivant** : à la fin de chaque combat gagné, soigne 4 PV. |
| **5** | **Champ de pièges** (carte épique) | — |

---


> **Armes (préparé en novembre 2026) :** famille mêlée (épées, haches, lances… : le bonus va aux Attaques). Les objets « alliés » (bagues du familier) lui servent pour son compagnon. Déjà réglé dans `WEAPON_FAMILIES` et `KEY_CLASSES` (`items.ts`) : aucun objet de la réserve commune ne lui sera inutile.

## 8. Le légendaire : Corde-des-anciens

> *L'arc du premier chasseur d'Eldrava, taillé dans le cœur d'un arbre millénaire et tendu avec un tendon de drake.*

| Emplacement | Effet |
|---|---|
| **Arme** (légendaire) | Ton compagnon **agit une fois de plus** à la fin de chacun de tes tours. |

**La quête (actes 1 et 2, 3 étapes) :**
1. **Événement « Le campement du vieux trappeur »** (acte 1) : un vieux chasseur confie au joueur un morceau de **Bois ancien**.
2. **Vaincre les Trois Souffles** (boss secondaire, acte 2) : ils font tomber un **Tendon de drake**.
3. **Au feu de camp suivant** : option **« Façonner l'arc »**. Corde-des-anciens est équipée dans l'emplacement Arme.

---

## 9. Les builds

| Build | Arbres | Cartes clés | Plan de jeu |
|---|---|---|---|
| **Le Maître des bêtes** | Maîtrise des bêtes | Dressage, Frénésie, Ordre : Égorge, Fureur primitive | Le compagnon fait l'essentiel des dégâts, le Chasseur l'appuie avec des Ordres. |
| **Le Tireur d'élite** | Précision | Marque de la proie, Visée assurée, Tir de précision, Tir du cœur | De gros tirs lents qui frappent une cible marquée. |
| **Le Piégeur** | Survie | Piège explosif, Maître des pièges, Pièges en série, Champ de pièges | Couvrir le terrain de pièges et laisser les ennemis s'y jeter. |
| **Le Chasseur de meute** | Maîtrise des bêtes + Survie | Ours, Lien sauvage, Esprit de meute, Piège à venin | Un build solide qui encaisse et use les ennemis. |

---

## 10. Forces et faiblesses face aux mécaniques de raid

| Mécanique | Le Chasseur… |
|---|---|
| **Enrage timer** | ✅✅ Unique : **Flèche apaisante** suspend le Berserk d'un boss. |
| **Adds** | ✅✅ Flèches multiples, Salve, Piège explosif, Piège à venin, Tir de recul. |
| **Interruption** | ✅ Flèche muselière, Intimidation. Le Dard paralysant retarde les incantations. |
| **Gros coups annoncés** | ✅ Feindre la mort détourne les Attaques vers le compagnon. |
| **Dissipation** | ❌ **Aucune.** Il doit compter sur les potions (Purification) et l'équipement, ou attendre que les effets expirent. |
| **Soins** | ❌ Presque aucun soin en combat. |

---

## 11. Notes de conception

- **Le compagnon choisi en début de run** est une décision forte, proche du choix de classe. Il faudra que les 3 compagnons soient équilibrés.
- **À surveiller à l'équilibrage :**
  - Fureur primitive combinée à Corde-des-anciens donne 3 actions du compagnon par tour.
  - Maître des pièges combiné à Champ de pièges : 6 explosions de 8 dégâts à tous les ennemis.
  - Feindre la mort annule entièrement un tour d'attaques : la recharge de 5 tours doit rester stricte.
- **Lisibilité des Pièges :** l'interface devra montrer clairement les Pièges posés et quel ennemi les déclenchera.

---

## 12. Ce qui est en jeu dans le prototype

**Les chiffres retenus après l'équilibrage** (voir `docs/EQUILIBRAGE.md`, §17) :

| Élément | Fiche | En jeu |
|---|---|---|
| Repli (départ) | 5 blocage (8 améliorée) | **6 blocage (9)** : le renfort de départ des autres classes |
| Esprit du guépard | tu subis 20 % de dégâts en plus | **10 %** (décidé avant le code : le contrecoup ne doit pas dépasser le gain) |
| Feindre la mort | les Attaques visent le compagnon, aucun dégât | **les attaques ennemies t'infligent 50 % de dégâts en moins** jusqu'à ton prochain tour (décidé avant le code) |
| Fureur primitive (épique) | coût 2 (1) | **coût 1 (0)** |
| Tir du cœur (épique) | 20 dégâts (26), double sur une cible Marquée | **pareil, et il Marque la cible** (le bot marquait trop rarement pour en profiter) |
| Champ de pièges (épique) | coût 2 (1), 3 Pièges explosifs | **coût 1 (0), 2 Pièges explosifs, Épuisé** |
| Pièges améliorés | +3 dégâts | **+3 au Piège explosif, +1 par tour aux Pièges à DoT** |
| Maître tireur | la Marque passe de +3 à +5 | **la Marque donne 2 dégâts de plus** (le même effet, écrit pour toutes les Marques) |

**Les règles précisées :**
- **Le compagnon** se choisit sur un écran au départ de l'expédition, avant Brégan. Le dernier choisi est sélectionné par défaut. Il agit à la fin de ton tour sur ta dernière cible, ou sur le premier ennemi si elle est morte. Une étiquette « cible » le montre sur l'ennemi.
- **Il ne meurt pas.** Le Rayon oculaire d'Yzhar l'étourdit, et la Malédiction de lignée de Vhaeryx le fait fuir pendant 2 tours.
- **Ses bonus :** les bagues des alliés (`allyBonus`) et du familier (`petBonus`) valent pour lui. La Marque s'ajoute à ses attaques.
- **Les Pièges :** 3 au plus. Un 4ᵉ remplace le plus ancien. Ils partent tous au début du tour ennemi, sur le premier ennemi vivant de la ligne, celui qui agit en premier. Une étiquette « ici » le montre. Le Piège givrant contrôle un ennemi normal et divise par deux la prochaine attaque d'un boss.
- **Instinct du chasseur** donne son énergie au début de ton tour suivant, puisque les Pièges se déclenchent pendant le tour ennemi.
- **Riposte sauvage** coûte 0 si tu as bloqué une attaque pendant le dernier tour ennemi.
- **Flèche apaisante** retire la Puissance et le blocage de la cible. Le Berserk de tous les ennemis est suspendu jusqu'à la fin du tour ennemi qui suit.
- **Interface (maquette C) :** sous le héros, une rangée de tuiles avec le compagnon et ses dégâts, l'Esprit, puis 3 cases de Pièges.
- **Sorts de loot :** Fusée éclairante, Appel du compagnon, et **Tir de dispersion** (3 dégâts à tous les ennemis, Démoralisés 1 tour, recharge 4).
- **Quête de Corde-des-anciens :** le Bois ancien se trouve dans l'événement « Le campement du vieux trappeur » (un 3ᵉ choix réservé au Chasseur, l'événement passe en premier pour lui). Le Tendon de drake tombe des Trois Souffles, et l'arc se façonne au feu de camp à partir de l'acte 2.
