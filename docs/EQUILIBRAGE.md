# L'équilibrage

> Wipe & Loot · Document vivant · Dernière passe : les talents (palier 5 à 3 points)

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

## 12. Le Voleur

Mesuré sur la run complète (actes 1 et 2), difficulté 0, 50 runs par profil.

| Profil | Première version | Après réglages | Vulkhar vaincu (acte 2 atteint) |
|---|---|---|---|
| Niveau 1 | 2 % | **0 %** | 4 % |
| Niveau 5 (Assassinat 3, Combat 2) | 8 % | **16 %** | 56 % |
| Niveau 10 (Assassinat 5, Combat 5) | 78 % | **72 %** | 86 % |
| Niveau 10 (Finesse 5, Combat 5) | 48 % | **66 %** | 80 % |

**Ce qui a changé :**

| Élément | Avant | Après | Constat du bot |
|---|---|---|---|
| Esquive, Éviscération (départ) | 5 blocage, 4 + 5 par point | **6 blocage, 4 + 6 par point** | Le même renfort de départ que les autres classes ; le niveau 5 était trop bas |
| Maître de la discrétion | +3 | **+4** | L'arbre Finesse était derrière Assassinat |
| Vendetta (épique) | coût 1 (0 améliorée) | **coût 2 (1 améliorée)** | Avec Impitoyable, l'Assassinat dépassait 80 % au niveau 10 |

**Le bot :** il valorise les points de combo, le Camouflage tant qu'il lui reste une Ouverture en main, le Poison posé et le Poison d'arme. Il prend toujours Sillon d'orage chez Ventor.

**À surveiller :** le niveau 1 est au plancher (0 à 2 %), comme le Démoniste. Le Voleur encaisse mal les longs combats (pression continue) : Vhaeryx et Vulkhar sont ses murs. Seigneur des ombres avec Égorgement, et Ambidextrie experte avec les gros finishers, restent à surveiller sur des runs de joueurs.

## 13. Le Paladin

Mesuré sur la run complète (actes 1 et 2), difficulté 0, 50 runs par profil.

| Profil | Première version | Après réglages | Vulkhar vaincu (acte 2 atteint) |
|---|---|---|---|
| Niveau 1 | 4 % | **2 %** | 14 % |
| Niveau 5 (Vindicte 3, Sacré 2) | 30 % | **22 %** | 68 % |
| Niveau 10 (Vindicte 5, Sacré 5) | 100 % | **72 %** | 96 % |
| Niveau 10 (Protection 5, Sacré 5) | 100 % | **78 %** | 92 % |

**Ce qui a changé** (le détail est dans la fiche, §12) :

| Élément | Avant | Après | Constat du bot |
|---|---|---|---|
| Jugement | recharge 2, 4 dégâts sans Sceau ; droiture 10 | **recharge 3, 6 sans Sceau ; droiture 12** | Avec Jugements rapides, Sceaux bénis et Vengeance divine, un Jugement par tour faisait plus que doubler le niveau 5 |
| Imposition des mains | 50 % des PV, quand on veut | **sous 30 % des PV, soigne 30 %** | Un grand soin à chaque combat : à lui seul +20 % de victoires |
| Verdict des cieux | coût 2, 12 × 2 | **coût 3 (2), 8 × 2** | Le bot le jouait presque à chaque tour (deck fin) : 36 dégâts et un Jugement pour 2 énergie |
| Avatar de lumière | coût 2, soins +50 %, soin entier en dégâts | **coût 3 (2), +25 %, la moitié en dégâts** | Il faisait passer Sacré 4 → 5 de 38 % à 83 % |
| Bouclier du croisé | 20 blocage, renvoi 6 | **18 blocage, renvoi 6, Épuisé** | Seul, il faisait passer le niveau 1 de 3 % à 43 % |
| Lumière améliorée, Lumière bénie | soins +2 ; ½ du soin en blocage | **cartes de soin +2 ; ¼ en blocage** | Les petits soins du Sceau de lumière en profitaient à chaque Attaque |
| Bouclier amélioré, Vengeance divine, Bouclier divin | +2 ; +6 ; recharge 6 | **+1 ; +4 ; recharge 7** | Les derniers points de trop au niveau 10 |

**Le bot :** il valorise chaque Sceau actif (5), l'Aura (8), la Censure posée et la Consécration à venir. Il prend la Lame ternie au Reliquaire et rallume toujours l'Aurore ardente au feu de camp.

**À surveiller :** Protection + Sacré reste un peu au-dessus de la cible (78 %) : c'est la classe ⭐ la plus facile, c'est attendu. À regarder sur des runs de joueurs : Double sceau avec Verdict des cieux (deux Jugements gratuits), Juste châtiment après un gros tour de blocage, et la Censure qui ne diminue pas dans les longs combats.

---

## 14. Les talents : le palier 5 à 3 points (novembre 2026)

**La décision** (`CONCEPT.md` §9) : le palier 5 coûte 3 points, un arbre complet en coûte 7, et deux arbres complets deviennent impossibles. Une carte épique doit donc valoir environ 3 talents des paliers 1 à 4, soit **+15 à +25 points** de victoire du bot. La règle est codée (`tierCost` dans `talents.ts`) ; les anciennes sauvegardes 5 + 5 deviennent 7 + 3 au chargement.

**La mesure** (200 runs par build, difficulté 0, option A à chaque palier, mêmes graines) : pour chaque arbre, la carte épique est comparée à 3 talents des paliers 1 à 4, sur la même base (paliers 1 à 4 de l'arbre + 3 paliers d'un autre). Seules 7 cartes épiques sur 18 valent 3 points : Frappe mortelle, Sanguinaire, Seigneur infernal, Égide des anciens, Frénésie meurtrière, Avatar de lumière, Verdict des cieux. Le diagnostic des 11 autres et les pistes sont dans les fiches de classe (§11, « Carte épique à revoir »). Trois arbres sont faibles dans leur ensemble : Arcane, Destruction, Assassinat.

**Le bot, corrigé :** il ne jouait **jamais** la Forme d'Ombre (elle passe par `c.shadowForm`, pas par `c.powers`). Elle vaut maintenant un Pouvoir posé (8). Effet sur le Prêtre (100 runs) :

| Profil | Avant la correction | Après |
|---|---|---|
| Niveau 10 (Discipline 5, Sacré 5) | 63 % | 63 % |
| Niveau 10 (Ombre 5, Sacré 5) | 53 % | **37 %** |

Les 53 % de l'Ombre (§11) étaient donc flatteurs : ils venaient d'un bot qui ne basculait jamais. Jouée, la Forme d'Ombre coûte cher avec le Sacré (soins divisés par deux, plus de Foi). C'est à reprendre avec la carte (fiche du Prêtre, §11).

**Autre limite connue :** le bot ne valorise pas Ténèbres (Voleur), dont l'effet ne joue qu'aux combats suivants.

**Le niveau 10 avec la règle** (profils passés de 5 + 5 à 7 + 3, 50 runs, difficulté 0 ; à ±7 points près). Avant : les chiffres des §§ précédents.

| Profil (7 + 3) | Avant (5 + 5) | Après |
|---|---|---|
| Guerrier Protection / Fureur | 64-74 % | **54 %** |
| Guerrier Armes / Fureur | 64-74 % | **58 %** |
| Mage Givre / Feu | 64-74 % | **36 %** |
| Mage Arcane / Feu | 64-74 % | **46 %** |
| Démoniste Affliction / Destruction | 46 % | **34 %** |
| Démoniste Démonologie / Destruction | 55 % | **64 %** |
| Prêtre Discipline / Sacré | 63 % | **58 %** |
| Prêtre Ombre / Sacré | 37 % (bot corrigé) | **34 %** |
| Voleur Assassinat / Combat | 72 % | **30 %** |
| Voleur Finesse / Combat | 66 % | **24 %** |
| Paladin Vindicte / Sacré | 72 % | **74 %** |
| Paladin Protection / Sacré | 78 % | **30 %** |

**Ce qu'on en tire :** les builds dont la carte épique gardée est forte tiennent (Démonologie, Vindicte, Armes, Discipline) ; ceux qui perdaient une épique forte du deuxième arbre chutent (Voleur : Frénésie meurtrière ; Paladin Protection : Avatar de lumière). C'est l'effet attendu : la passe sur les cartes épiques faibles (fiches de classe, §11) et sur les arbres Arcane, Destruction et Assassinat doit les ramener vers la cible.

**Voleur, cartes épiques (novembre 2026).** Diagnostic (200 runs) : Combat 7 + Finesse 3 = 79 %, Combat 7 + Assassinat 3 = 54 %, Assassinat 7 + Combat 3 = 33 %, Finesse 7 + Combat 3 = 22 %. Le bot n'y est pour rien (valeur du Camouflé et poids des récompenses testés : pas d'écart au-delà de ±5).

| Carte | Avant | Après | Valeur de la carte |
|---|---|---|---|
| Vendetta | coût 2 (1) | **coût 1 (0)** | +5 → **+17** |
| Seigneur des ombres | Camouflé à chaque tour | **+50 % aux Attaques tant que tu es Camouflé** | −1 → **+20** |

Profils du banc (100 runs) : Voleur niveau 10 Assassinat 7 + Combat 3 : 30 → **45 %** ; Finesse 7 + Combat 3 : 24 → **50 %**. Restent les paliers 1 à 4 d'Assassinat et de Finesse (fiche du Voleur, §11).

**Voleur, paliers (novembre 2026).** Finesse meurtrière : +3 par point de combo pour tous les finishers qui frappent (Assassinat 7 + Combat 3 : 45 → 55 % ; Combat 7 + Assassinat 3 : 54 → 64 %). Maître de la discrétion : aussi sur Coup dans le dos (Finesse 7 + Combat 3 : 43 → 51 %). Banc (100 runs) : Assassinat 7 + 3 **55 %**, Finesse 7 + 3 **49 %**, Combat 7 + Finesse 3 ≈ 80 % (accepté).

**Les arbres de chaque classe (novembre 2026).** Consigne : des arbres à peu près équivalents dans chaque classe, sans chercher la perfection ; une classe peut rester un peu plus forte qu'une autre. Diagnostic (150 runs, chaque arbre à 7 points avec son meilleur complément à 3) :

| Classe | Avant | Après |
|---|---|---|
| Guerrier | Armes 71 · Fureur 57 · Protection 71 | inchangé (acceptable) |
| Mage | Arcane 27 · Feu 55 · Givre 24 | Arcane **58** · Feu 55 · Givre **63** |
| Démoniste | Affliction 9 · Démonologie 48 · Destruction 19 | Affliction **66** · Démonologie 59 · Destruction **65** |
| Prêtre | Discipline 57 · Ombre 45 · Sacré 63 | Discipline 57 · Ombre **74** · Sacré 63 |
| Paladin | Protection 53 · Sacré 58 · Vindicte 65 | Protection **73** · Sacré 58 · Vindicte 65 |
| Voleur | Assassinat 33 · Combat 79 · Finesse 22 | Assassinat **55** · Combat 80 · Finesse **49** |

**Mage :** Fracas glaciaire (Gel 3 sur la cible, puis 8 dégâts à tous, doublés sur chaque ennemi fracassable), Tempête arcanique (ne consomme plus les charges), Subtilité arcanique (3 charges), Stabilité (+3 par charge au lieu de +2).

**Démoniste :** Tempête d'afflictions (coût 1, prolonge les DoT), Cataclysme de l'âme (ne dépense plus les éclats, 5 par éclat possédé), Corruption améliorée (tous les DoT +2), Contagion naturelle (DoT +1 tour), Trait de l'ombre amélioré (+5). Le bot n'utilise pas Amplifier la malédiction : l'Affliction se mesure avec Spirale mortelle (palier 3 B).

**Prêtre :** Forme d'Ombre (coût 1 (0), tick immédiat des DoT, Sorts d'Ombre +50 %, DoT +2, soins −25 % au lieu de −50 %, la Foi reste). Mesuré avec les choix des profils du bot (Ombre avec le palier 3 B), pas avec l'option A partout.

**Paladin :** Bouclier du croisé n'est plus Épuisé (12 blocage, renvoi de 4 dégâts, 2 PV). Non Épuisé avec ses anciens chiffres, il portait la Protection à 89 %.

**Le banc au niveau 10 après tout le chantier** (profils 7 + 3, 100 runs, difficulté 0) — tous dans la cible de 50 à 75 % (à ±5 près) :

| Classe | Profil 1 | Profil 2 |
|---|---|---|
| Guerrier | Protection 7 + Fureur 3 : 56 % | Armes 7 + Fureur 3 : 53 % |
| Mage | Givre 7 + Feu 3 : 74 % | Arcane 7 + Feu 3 : 58 % |
| Démoniste | Affliction 7 + Destruction 3 : 71 % | Démonologie 7 + Destruction 3 : 69 % |
| Prêtre | Discipline 7 + Sacré 3 : 54 % | Ombre 7 + Sacré 3 : 71 % |
| Voleur | Assassinat 7 + Combat 3 : 55 % | Finesse 7 + Combat 3 : 49 % |
| Paladin | Vindicte 7 + Sacré 3 : 71 % | Protection 7 + Sacré 3 : 70 % |

---

## 15. Les trois actes (acte 3, lot 5)

> **Attention :** ces mesures ont été faites **avant** la réforme des talents (§14 : palier 5 à 3 points). Les profils de niveau 10 étaient alors en 5 + 5 ; elles sont à refaire avec les profils 7 + 3.

Depuis l'acte 3, **gagner une expédition, c'est vaincre Vulkhar, Vhaeryx puis Yzhar**, toujours avec 3 wipes pour toute la run. Les chiffres ne sont donc plus comparables à ceux des sections précédentes (deux actes).

**Yzhar d'après sa fiche était infaisable pour le bot :** 84 à 100 % de wipe au premier essai avec des personnages de niveau 10, et 0 à 20 % de runs gagnées. Les morts venaient du Corps : avec −75 % de dégâts, ses 340 PV en valaient 1 360, et les Tentacules oculaires restés en jeu achevaient les classes fragiles. Ce qui a changé (détail dans la fiche de l'acte 3, §12) : Corps à 260 PV, Carapace à −50 % (les dégâts dans le temps passent dessous), Tentacules oculaires qui se ferment avec l'Œil (1 tous les 2 tours, 3 au plus), Rayon 8, Regard sombre 10, Coup de tentacule géant 12, Murmures +2 Folie, Tentacule géant de 30 PV qui frappe à 10, 1 à la fois, tous les 3 tours.

**Yzhar seul** (`tools/balance/yzhar.sim.ts` : le combat rejoué avec les PV pleins, sur 15 runs réelles du bot de niveau 10) :

| Classe | Fiche | Après réglages |
|---|---|---|
| Guerrier | 3 / 15 | **13 / 15** |
| Mage | 0 / 15 | **10 / 15** |
| Voleur | 2 / 15 | **13 / 15** |
| Paladin | 1 / 15 | **10 / 15** |
| Prêtre | — | **11 / 15** |
| Démoniste (Démonologie) | — | **6 / 15** |
| Démoniste (Affliction) | — | **1 / 15** |

**La run complète** (40 runs par profil, difficulté 0) :

| Profil | Vulkhar vaincu | Vhaeryx vaincu | Run gagnée |
|---|---|---|---|
| Guerrier niveau 1 / 5 | 15 % / 70 % | 5 % / 35 % | 0 % / **20 %** |
| Guerrier niveau 10 (Protection + Fureur) | 98 % | 63 % | **58 %** |
| Guerrier niveau 10 (Armes + Fureur) | 98 % | 78 % | **58 %** |
| Mage niveau 1 / 5 | 13 % / 70 % | 3 % / 35 % | 0 % / **15 %** |
| Mage niveau 10 (Givre + Feu) | 88 % | 70 % | **48 %** |
| Mage niveau 10 (Arcane + Feu) | 100 % | 83 % | **40 %** |
| Démoniste niveau 1 / 5 | 33 % / 100 % | 0 % / 23 % | 0 % / **5 %** |
| Démoniste niveau 10 (Affliction + Destruction) | 95 % | 40 % | **5 %** |
| Démoniste niveau 10 (Démonologie + Destruction) | 100 % | 65 % | **23 %** |
| Voleur niveau 1 / 5 | 3 % / 58 % | 0 % / 15 % | 0 % / **0 %** |
| Voleur niveau 10 (Assassinat + Combat) | 83 % | 70 % | **60 %** |
| Voleur niveau 10 (Finesse + Combat) | 83 % | 70 % | **48 %** |
| Prêtre niveau 1 / 5 | 28 % / 65 % | 8 % / 15 % | 8 % / **13 %** |
| Prêtre niveau 10 (Discipline + Sacré) | 95 % | 55 % | **50 %** |
| Prêtre niveau 10 (Ombre + Sacré) | 100 % | 70 % | **65 %** |
| Paladin niveau 1 / 5 | 15 % / 70 % | 3 % / 25 % | 3 % / **15 %** |
| Paladin niveau 10 (Vindicte + Sacré) | 98 % | 73 % | **63 %** |
| Paladin niveau 10 (Protection + Sacré) | 93 % | 78 % | **63 %** |

**Les niveaux de difficulté** (personnages de niveau 10, 25 runs par case ; entre parenthèses, l'acte 2 atteint) :

| Difficulté | Guerrier Protection + Fureur | Guerrier Armes + Fureur | Mage Givre + Feu | Mage Arcane + Feu |
|---|---|---|---|---|
| 0 | 64 % (96 %) | 52 % (96 %) | 40 % (84 %) | 32 % (100 %) |
| 10 | 40 % (92 %) | 36 % (88 %) | 36 % (68 %) | 8 % (72 %) |
| 15 | 28 % (80 %) | 12 % (64 %) | 16 % (48 %) | 8 % (52 %) |
| 20 | 4 % (40 %) | 4 % (36 %) | 8 % (32 %) | 0 % (12 %) |

La courbe garde sa forme : chaque palier se sent, et le niveau 20 reste le défi ultime. Les contraintes « boss de fin d'acte » (niveaux 16, 17, 20) s'appliquent aussi à Yzhar.

**Le bot :** il se met à couvert sous le Regard sombre, vise en priorité les Tentacules intérieurs quand il est avalé, garde ses DoT pour le boss plutôt que pour les adds, et choisit dans les événements d'Irem (il prend la purification des Veilleurs avec le Paladin).

**À surveiller :**
- **Le Démoniste Affliction** tombe très bas (5 %). Le journal montre un bot qui arrive au Corps avec peu de PV, que la Folie fait tomber en Crise, et qui joue défensif. C'est en partie une faiblesse du bot (il ne voit qu'une action à l'avance), mais c'est la classe à regarder en premier sur des runs de joueurs. Le Démoniste ⭐⭐⭐ a le droit d'être un cran en dessous, pas autant.
- **Le Mage** a peu de PV max dans les runs du bot (55 à 80) : Vhaeryx et Yzhar sont ses murs.
- **La Folie** fait perdre des tours entiers contre Yzhar (+1 par tour, Murmures, Tentacules). C'est le cœur de l'acte, mais à surveiller avec des joueurs.

Mesures : `npm run balance` (tous les bancs), `tools/balance/yzhar.sim.ts` (Yzhar seul, variable `CLASSES`), `tools/balance/difficulte.sim.ts`.

## 16. Les armes jumelles (novembre 2026)

Chaque arme de boss existe en mêlée et en incantation (`CONCEPT.md` §12.2). Les classes de Sorts ne tombent plus sur des armes inutiles. Mesure rapide, 30 runs, difficulté 0, profils 7 + 3 du bot :

| Profil | Avant | Après |
|---|---|---|
| Prêtre niveau 1 | 7 % | 7 % |
| Prêtre niveau 5 (Discipline 3, Sacré 2) | 17 % | 33 % |
| Prêtre niveau 10 (Discipline 7, Sacré 3) | 67 % | 73 % |
| Prêtre niveau 10 (Ombre 7, Sacré 3) | 67 % | 83 % |
| Mage niveau 10 (Givre 7, Feu 3 / Arcane 7, Feu 3) | — | 50 % / 47 % |

Les classes de Sorts gagnent environ 5 à 15 points (30 runs : marge d'erreur large). Le Prêtre passe un peu au-dessus de la cible au niveau 10. À reprendre dans l'équilibrage des trois actes avec les talents en 7 + 3, prévu en priorité.
