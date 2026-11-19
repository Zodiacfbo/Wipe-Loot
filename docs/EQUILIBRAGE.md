# L'équilibrage

> Wipe & Loot · Document vivant · Dernière passe : l'acte 2

## 1. La méthode

On ne règle pas les chiffres « au feeling » : un **bot** joue des centaines de runs complètes avec le vrai moteur du jeu, et on regarde les résultats.

- **Le bot** (`tools/balance/bot.ts`) joue toute la run : bénédiction de Brégan, carte, combats, récompenses, vendeur, feux de camp, événements, wipes.
- **En combat**, il essaie chaque action possible (chaque carte, sur chaque cible, et chaque sort) sur une copie du combat, et garde celle qui donne le meilleur résultat : dégâts infligés, dégâts qu'il va encaisser au tour ennemi, ressources gagnées. Il joue donc correctement les 52 cartes sans règle écrite pour chacune.
- **Ses limites** : il ne regarde qu'une action à l'avance, il **ne change jamais de posture**, et il utilise mal certains outils (Cri de défi). Un bon joueur humain fera **mieux** que lui. Les chiffres ci-dessous sont donc plutôt un plancher.

**Relancer les mesures :**

```bash
npm run balance
```

Variables utiles : `RUNS=300` (nombre de runs par profil), `PROFIL="Niveau 1"` (un seul profil). Le poids de chaque talent pris seul se mesure avec :

```bash
npx vitest run --config tools/balance/vitest.config.ts --root . --silent=false tools/balance/talents.sim.ts
```

## 2. Les objectifs (difficulté 0)

| Profil | Objectif | Pourquoi |
|---|---|---|
| **Niveau 1, sans talent** | 15 à 25 % de victoire | Dur mais faisable : on apprend, on wipe, on revient plus fort. |
| **Niveau 5** | 50 à 70 % | La progression se sent nettement. |
| **Niveau 10** | 85 à 100 % | La classe est maîtrisée à la difficulté 0. Le défi vient ensuite des **niveaux de difficulté 1 à 20**. |
| **Les arbres entre eux** | Moins de 10 points d'écart au niveau 10 | Aucun arbre ne doit être le seul choix raisonnable. |

## 3. Les résultats (300 runs par profil)

| Profil | Avant | Après | Wipe au 1er essai contre Vulkhar |
|---|---|---|---|
| Niveau 1 (aucun talent) | 3 % | **19 %** | 87 % |
| Niveau 5 (Protection 3, Fureur 2) | 50 % | **70 %** | 41 % |
| Niveau 10 (Protection 5, Fureur 5) | 95 % | **99 %** | 5 % |
| Niveau 10 (Armes 5, Fureur 5) | 52 % | **93 %** | 17 % |

**Les boss secondaires au niveau 1** (wipe au premier essai) : Krâgg 78 %, Saldris 90 %, Gorlok 45 %, Brannoc 16 %, Croc-de-lave 12 %, Morvax 6 %, Cendrine, Vossk et Zhaal 0 %. Krâgg et Saldris restent les plus durs : c'est voulu (ils sont facultatifs et rapportent leur loot), mais à surveiller avec des joueurs humains.

## 4. Ce qui a changé

**Les ennemis :**

| Ennemi | Avant | Après |
|---|---|---|
| **Vulkhar** | 300 PV ; Poing de lave 14, puis 18 en phase 2 ; Éruption +4 ; chaque Rejeton absorbé soigne 15 | **225 PV** ; Poing de lave **12**, puis **15** ; Éruption **+3** ; un Rejeton soigne **10** |
| **Seigneur des cendres** | 40 PV, Boule de lave 18, Attise +3 Puissance | **36 PV**, Boule de lave **15**, Attise **+2** |
| **Krâgg** | 110 PV, Écrasement 14, Molosses 30 PV / Morsure 6 | **95 PV**, Écrasement **10**, Molosses **24 PV / Morsure 5** |
| **Saldris** | Coup de bâton 8, donne 8 blocage | Coup de bâton **6**, donne **6** blocage |
| **Gardien de lave** | +6 blocage par tour, Coup de bouclier 7 | **+4**, **5** |
| **Prêtre de la flamme** | Soin 12, Trait de feu 5, Bénédiction +2 Puissance | Soin **10**, Trait de feu **4**, Bénédiction **+1** |
| **Gorlok** | +4 blocage par Éclat, Éclat qui explose : 5 | **+3**, **4** |

**Les talents et les cartes du Guerrier :**

| Élément | Avant | Après | Constat du bot |
|---|---|---|---|
| Garde haute | 10 blocage au départ | **5** | Protection écrasait tout |
| Bouclier lourd | +2 blocage | **+1** | +13 points de victoire à lui seul |
| Rempart | 0 énergie | **1 énergie** | +28 points : trop fort pour un palier 3 |
| Dernier rempart | Soigne 25 % | **15 %** | +22 points, et c'est lui (avec Sanguinaire) qui rendait le build Protection intouchable en haute difficulté |
| Sanguinaire | 1 + 2 rage, soin 4 | **1 + 3 rage, soin 2** | +34 points |
| Frappe mortelle | 2 + 3 rage | **1 + 4 rage** | +0 point : inutile |
| Heurt de bouclier | Blocage | **Blocage + 4** | +0 point : inutile |
| Lame aiguisée | +2 | **+3** | L'arbre Armes était loin derrière |
| Entaille | Saignement 2 | **3** | idem |
| Arme lourde | +4 | **+6** | idem |
| Colère intérieure | +1 rage par tour | **+2** | ne changeait rien |
| Fureur sans fin | Rage max 15 | **+ 3 rage au départ** | rendait le bot plus faible |
| Implacable | 2 rage | **3 rage** | ne changeait rien |

Tous ces réglages sont regroupés pour pouvoir y revenir facilement : les mécaniques spéciales des ennemis sont dans `TUNING` (`src/engine/enemies.ts`).

## 5. Les niveaux de difficulté

Taux de victoire du bot (200 runs par case) :

| Difficulté | Niveau 1 | Niveau 10 (Protection + Fureur) | Niveau 10 (Armes + Fureur) |
|---|---|---|---|
| 0 | 16 % | 99 % | 94 % |
| 5 | 8 % | 96 % | 84 % |
| 10 | 4 % | 96 % | 78 % |
| 15 | 2 % | 91 % | 59 % |
| 20 | 0 % | 23 % | 17 % |

La colonne « Niveau 1 » n'est là que pour comparaison : on ne débloque la difficulté qu'en gagnant. Ce qui compte : **la difficulté 20 est dure pour tous les builds**, et chaque niveau se sent. Le build Protection + Fureur reste très confortable jusqu'à la difficulté 15 : ce sont ses soins (Sanguinaire, Dernier rempart) qui annulent l'usure. À surveiller.

Mesure : `tools/balance/difficulte.sim.ts`.

## 6. À surveiller ensuite

**Le principe :** ce n'est pas grave qu'un build soit un peu plus fort qu'un autre. Ce qu'on évite, ce sont les gros déséquilibres : un arbre ou une carte qui devient le seul choix raisonnable, ou un talent qui ne sert à rien.

- **Les postures** : le bot ne les utilise pas. Un humain qui joue bien la posture Défensive ou Berserker pourrait trouver le jeu plus facile que prévu.
- **Krâgg et Saldris** au niveau 1.
- **L'écart entre le niveau 1 et le niveau 5** reste grand (19 % → 70 %). Si les premiers joueurs trouvent les débuts frustrants, on pourra adoucir les paliers 1 à 3.
- **Vague de choc** (sort de loot) : à la limite de la « carte gratuite » (voir le concept, §6.6).
- Refaire une passe à chaque nouvelle classe.

## 7. Le Mage

Mesuré avec les mêmes objectifs que le Guerrier (200 runs par profil, difficulté 0). Le bot sait lire la Brûlure, le Gel et les charges arcaniques.

| Profil | Première version | Après réglages | Wipe au 1er essai contre Vulkhar |
|---|---|---|---|
| Niveau 1 (aucun talent) | 1 % | **11 %** | 95 % |
| Niveau 5 (Givre 3, Feu 2) | 63 % | **71 %** | 48 % |
| Niveau 10 (Givre 5, Feu 5) | 92 % | **83 %** | 33 % |
| Niveau 10 (Arcane 5, Feu 5) | 46 % | **94 %** | 27 % |

**Ce qui a changé :**

| Élément | Avant | Après | Constat du bot |
|---|---|---|---|
| PV max | 65 | **72** | Trop fragile au niveau 1 |
| Contresort | 1 énergie, interruption seule | **0 énergie, interruption + 4 dégâts** | Inutile contre Vulkhar (son Marteau ne s'interrompt pas), alors que la Charge du Guerrier sert à chaque combat |
| Trait de magie, Barrière | 6 dégâts, 5 blocage | **7, 6** | Le deck de départ manquait de dégâts : le Mage mourait plus tôt que le Guerrier contre Vulkhar |
| Boule de feu, Éclair de givre | 12 + Brûlure 3, 5 + Gel 2 | **14 + Brûlure 4, 7 + Gel 2** | idem |
| Subtilité arcanique | 1 charge | **2 charges** | L'arbre Arcane était loin derrière |
| Carapace de glace | 0 énergie, recharge 5 | **1 énergie, recharge 6** | +31 points à elle seule |
| Clignement | recharge 3 | **recharge 4** | +24 points (Vulkhar pose une Zone de feu à chaque tour) |
| Souffle ardent | 6 dégâts | **4** | +14 points |
| Souffle du dragon | Brûlure 3 | **Brûlure 2** | +18 points |
| Fracas glaciaire | 12 dégâts | **14** | −3 points : la carte épique du Givre ne servait à rien |

**À surveiller :** le Mage de niveau 1 reste un peu en dessous de l'objectif (11 % contre 15 à 25 %). C'est cohérent avec sa difficulté (⭐⭐), et le bot joue mal le contrôle (Métamorphose, Contresort au bon moment, Carapace de glace avant le Marteau) : un humain fera mieux. Vulkhar reste son mur : à revoir avec les premiers retours.

Mesures : `PROFIL="Mage" npm run balance` et `CLASSE=mage npx vitest run --config tools/balance/vitest.config.ts --root . --silent=false tools/balance/talents.sim.ts`.

## 8. Les deux actes

Depuis l'acte 2, **gagner une expédition, c'est vaincre Vulkhar puis Vhaeryx**, avec 3 wipes pour toute la run. Les chiffres ne sont donc plus comparables à ceux des sections précédentes (qui mesuraient l'acte 1 seul).

Taux de victoire du bot (150 runs par profil, difficulté 0) :

| Profil | Vulkhar vaincu (acte 2 atteint) | Run gagnée | Wipe au 1er essai contre Vhaeryx |
|---|---|---|---|
| Guerrier niveau 1 | 19 % | 3 % | 89 % |
| Guerrier niveau 5 | 72 % | 30 % | 68 % |
| Guerrier niveau 10 (Protection + Fureur) | 99 % | 73 % | 40 % |
| Guerrier niveau 10 (Armes + Fureur) | 93 % | 74 % | 35 % |
| Mage niveau 1 | 9 % | 0 % | — |
| Mage niveau 5 | 71 % | 27 % | 64 % |
| Mage niveau 10 (Givre + Feu) | 83 % | 64 % | 37 % |
| Mage niveau 10 (Arcane + Feu) | 92 % | 73 % | 42 % |

**Les réglages de l'acte 2** sont détaillés dans sa fiche (§11) : Vhaeryx allégé (420 → 320 PV), le trash et les boss secondaires renforcés.

**À surveiller :**
- **Vhaeryx** reste le gros verrou de la run. C'est voulu (boss de fin d'acte), mais à revoir avec les premiers joueurs.
- **Les boss secondaires de l'acte 2** restent plus faciles que ceux de l'acte 1 pour un personnage de niveau 10 : le joueur arrive avec tout son butin.

Mesures : `npm run balance` et `tools/balance/vhaeryx.sim.ts` (les morts contre Vhaeryx).

## 9. Les niveaux de difficulté sur deux actes

La première courbe (§5) avait été réglée pour l'acte 1 seul. Avec deux actes, elle s'effondrait en haut : 0 à 9 % de victoires au niveau 20, surtout à cause du niveau 17 (plus aucun wipe, avec deux boss de fin d'acte à passer).

**Ce qui a changé :**

| Niveau | Avant | Après |
|---|---|---|
| 8 et 9 | Ennemis normaux, puis boss secondaires : +15 % de dégâts | **+10 %** (ces contraintes pèsent sur tous les combats des deux actes) |
| 16 | Vulkhar : +20 % de PV | **Les boss de fin d'acte : +15 % de PV** |
| 17 | Plus aucun wipe autorisé | **Les boss de fin d'acte infligent +10 % de dégâts** (il reste 1 wipe, depuis le niveau 12) |
| 18 | Boss secondaires : 2 Puissance | **1 Puissance** |
| 19 | Ennemis normaux : 1 Puissance | **+10 % de PV en plus (20 % au total)** |
| 20 | Vulkhar : 2 Puissance, enrage 3 tours plus tôt | **Les boss de fin d'acte : 2 Puissance, enrage 2 tours plus tôt** |

**Taux de victoire du bot** (personnages de niveau 10, 80 à 100 runs par case ; entre parenthèses, la part des runs qui atteignent l'acte 2) :

| Difficulté | Guerrier Protection + Fureur | Guerrier Armes + Fureur | Mage Givre + Feu | Mage Arcane + Feu |
|---|---|---|---|---|
| 0 | 70 % (99 %) | 78 % (94 %) | 64 % (84 %) | 71 % (90 %) |
| 5 | 66 % (98 %) | 60 % (83 %) | 55 % (79 %) | 60 % (88 %) |
| 10 | 70 % (98 %) | 46 % (81 %) | 44 % (66 %) | 40 % (75 %) |
| 15 | 59 % (90 %) | 41 % (63 %) | 33 % (58 %) | 28 % (60 %) |
| 17 | 31 % (76 %) | 16 % (44 %) | 20 % (47 %) | 11 % (48 %) |
| 20 | 14 % (44 %) | 7 % (29 %) | 14 % (32 %) | 4 % (27 %) |

Chaque niveau se sent, et le niveau 20 reste le défi ultime. Le bot est un plancher : un joueur humain qui maîtrise sa classe fera mieux.

**À surveiller :** le Mage Arcane est le plus en difficulté en haut de l'échelle (sa Surcharge coûte cher quand tout frappe plus fort), et le Guerrier Protection reste le plus confortable.

Mesure : `tools/balance/difficulte.sim.ts` (variables `RUNS` et `NIVEAUX`).

## 10. Le Démoniste

Mesuré sur la run complète (actes 1 et 2), difficulté 0, 100 runs par profil.

| Profil | Première version | Après réglages | Vulkhar vaincu (acte 2 atteint) |
|---|---|---|---|
| Niveau 1 | 0 % | 0 % | 22 % |
| Niveau 5 (Affliction 3, Destruction 2) | 2 % | **27 %** | 98 % |
| Niveau 10 (Affliction 5, Destruction 5) | 1 % | **46 %** | 95 % |
| Niveau 10 (Démonologie 5, Destruction 5) | 2 % | **55 %** | 99 % |

C'est un cran en dessous du Guerrier et du Mage au niveau 10 (64 à 74 %) : c'est cohérent avec sa difficulté (⭐⭐⭐), et le bot joue mal ce qui demande de prévoir (gérer ses PV et ses éclats sur toute la run).

**Ce qui a changé :**

| Élément | Avant | Après | Constat du bot |
|---|---|---|---|
| PV max | 70 | **74** | Il se blesse lui-même avec ses pactes |
| Diablotin, Rôdeur du néant | 3 dégâts, 4 blocage | **4, 5** | Le familier pesait trop peu |
| Trait de l'ombre, Garde sombre, Siphon d'âme | 6, 5, 5 | **7, 6, 7** | Le deck de départ manquait de dégâts : il laissait 104 PV à Vulkhar en mourant, contre 53 pour le Mage |
| Corruption | DoT 3 | **DoT 4** | idem |
| Corruption améliorée, Démon robuste, Trait de l'ombre amélioré, Dévastation | +1, +1, +2, +2 | **+2, +2, +3, +3** | Le niveau 10 ne progressait presque pas par rapport au niveau 5 |
| Peau démoniaque, Lien du maître, Maître invocateur | +6 PV, 1 blocage, agit 1 fois | **+10 PV, 3 blocage, agit 2 fois** | L'arbre Démonologie était le plus faible |
| Seigneur infernal | 10 dégâts | **12** | idem |
| Malédiction de lignée | Le familier retourné garde ses bonus ; le Rôdeur protège Vhaeryx | **Sans ses bonus ; le Rôdeur ne protège plus personne** | La plus dure des Malédictions de lignée (déjà signalée dans la fiche) |

**Le bot :** il ne voit qu'une action à l'avance, il n'aurait jamais lancé Pacte de sang. Il le lance donc quand il n'a plus d'énergie, qu'il a une carte jouable et plus de 45 % de ses PV. Il prend le Rôdeur du néant contre les boss, et il garde la Pierre d'âme pour eux. Prendre le Rôdeur contre les boss a été le plus gros changement : 2 % → 30 % au niveau 5.

**À surveiller :** Vhaeryx reste son combat le plus dur (48 à 76 % de wipe au premier essai), et l'arbre Affliction est un peu derrière Démonologie.

## 11. Le Prêtre

Mesuré sur la run complète (actes 1 et 2), difficulté 0, 100 runs par profil.

| Profil | Première version | Après réglages | Vulkhar vaincu (acte 2 atteint) |
|---|---|---|---|
| Niveau 1 | 2 % | **8 %** | 31 % |
| Niveau 5 (Discipline 3, Sacré 2) | 10 % | **15 %** | 61 % |
| Niveau 10 (Discipline 5, Sacré 5) | 44 % | **63 %** | 96 % |
| Niveau 10 (Ombre 5, Sacré 5) | 29 % | **53 %** | 95 % |

**Ce qui a changé :**

| Élément | Avant | Après | Constat du bot |
|---|---|---|---|
| Égide sacrée (sort de départ) | 1 énergie, 8 Égide | **0 énergie, 5 Égide** | Comme Charge, Contresort et Pacte de sang, le sort de départ doit servir à chaque combat. À 8 Égide gratuite, le Prêtre écrasait tout (80 % au niveau 10) |
| Châtiment, Prière de garde, Murmure de douleur | 6, 5, DoT 3 | **7, 6, DoT 4** | Le même renfort de départ que les autres classes |
| Égide améliorée, Soins améliorés, Douleur améliorée | +2, +2, +1 | **+3, +3, +2** | Les premiers paliers pesaient trop peu |

**À surveiller :** le niveau 5 reste un peu bas par rapport aux autres classes, et l'Égide persistante avec Lumière persistante et Âme inébranlable (signalée dans la fiche) n'a pas encore été vue sur des combats très longs.
