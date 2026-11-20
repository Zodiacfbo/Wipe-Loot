# Classe : le Voleur

> Wipe & Loot · Fiche de classe · Version 0.2 (jouable dans le prototype)
> Les chiffres sont **indicatifs** : ils serviront de base aux premiers tests d'équilibrage.

---

## 1. Identité

> *« Tu ne m'as pas vu arriver. Tu ne me verras pas repartir. »*

Le Voleur frappe vite, frappe juste, et disparaît. Il **enchaîne de petites attaques** pour accumuler des points de combo, puis les libère dans un **coup de grâce**. Il ouvre chaque combat depuis l'**ombre**, avec des attaques d'ouverture dévastatrices, et enduit ses lames de **poisons**.

- **Rôle :** dégâts physiques rapides, contrôle.
- **Difficulté :** ⭐⭐ Moyenne.
- **Déblocage :** par l'expérience.
- **Fantasme de jeu :** un premier tour parfait depuis le camouflage, cinq points de combo, et une Éviscération qui achève le boss.

| Statistique | Valeur |
|---|---|
| **PV max** | 70 |
| **Énergie** | 3 par tour |
| **Ressource de classe** | Points de combo (0 à 5) |
| **État spécial** | Camouflage au début de chaque combat |
| **Sort de barre de départ** | Sprint |

---

## 2. Mécanique 1 : les points de combo

- De **0 à 5 points de combo**, portés par le Voleur.
- Ils **se conservent d'un tour à l'autre** pendant le combat, et repartent à 0 au combat suivant.
- **Les générateurs** (Attaque sinistre, Coup dans le dos, Mutiler…) donnent +1 ou +2 points.
- **Les finishers** (Éviscération, Coup aux reins, Rupture…) **consomment tous les points** : leur effet augmente avec le nombre de points dépensés.
- Au-delà de 5, les points supplémentaires sont perdus.

**L'intérêt :** un rythme clair, « je construis, je dépense ». Le joueur se demande s'il dépense ses 3 points maintenant ou s'il attend d'en avoir 5.

---

## 3. Mécanique 2 : le Camouflage et les poisons

### Le Camouflage
- **Au début de chaque combat**, le Voleur est **Camouflé**.
- Tant qu'il est Camouflé, il peut jouer des cartes **Ouverture** : des attaques très fortes, jouables **uniquement** en camouflage.
- Le Camouflage prend fin dès que le Voleur joue une carte d'Attaque **qui n'est pas une Ouverture**, ou à la fin de son premier tour.
- Certains sorts et cartes (Disparition, Fumigène…) permettent de **redevenir Camouflé** pendant le combat.

### Les poisons
- Les cartes **Poison d'arme** sont des Pouvoirs. **Un seul Poison d'arme actif à la fois** : en jouer un nouveau remplace l'ancien.
- **Poison (X)** (mot-clé du Voleur) : chaque fois que tu **touches** la cible avec une Attaque, elle subit **X dégâts supplémentaires**. Le Poison diminue de 1 à la fin de chaque tour de la cible.
- Le Poison récompense donc les **nombreuses petites attaques**, qui sont la spécialité du Voleur.

**L'intérêt :** chaque combat commence par une décision forte (quelle Ouverture jouer), et le poison change la valeur de chaque attaque.

---

## 4. Deck de départ et barre de sorts

### 4.1 Deck de départ (10 cartes)

| Carte | Qté | Coût | Type | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Attaque sinistre** | 4 | 1 | Attaque | Inflige 6 dégâts. +1 combo. | 9 dégâts |
| **Esquive** | 4 | 1 | Compétence | Gagne 6 blocage. | 9 blocage |
| **Éviscération** | 1 | 1 | Attaque (finisher) | Inflige 4 dégâts + 6 par point de combo. | 4 + 8 par point |
| **Embuscade** | 1 | 0 | Attaque (Ouverture) | Inflige 10 dégâts. +2 combo. | 14 dégâts |

### 4.2 Sort de barre de départ

| Sort | Coût | Recharge | Effet |
|---|---|---|---|
| **Sprint** | 0 | 3 tours | Pioche 2 cartes. |

---

## 5. Les cartes (51)

**Légende des raretés :** C = Commune · PC = Peu commune · R = Rare · É = Épique (débloquée par le dernier palier de talent de son arbre).

### 5.1 Tronc commun (9 cartes)

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Attaque sinistre** | 1 | Attaque | C | Inflige 6 dégâts. +1 combo. | 9 dégâts |
| **Éviscération** | 1 | Attaque (finisher) | C | Inflige 4 dégâts + 5 par point de combo. | 4 + 7 par point |
| **Embuscade** | 0 | Attaque (Ouverture) | C | Inflige 10 dégâts. +2 combo. | 14 dégâts |
| **Feinte** | 1 | Compétence | C | Gagne 6 blocage. La cible est Démoralisée 1 tour. | 9 blocage |
| **Couteaux de lancer** | 1 | Attaque | C | Inflige 3 dégâts à tous les ennemis. +1 combo. | 5 dégâts |
| **Poison mortel** | 1 | Pouvoir (Poison d'arme) | C | Tes Attaques appliquent Poison 1. | Poison 2 |
| **Coup aux reins** | 1 | Compétence (finisher) | PC | La cible (sauf boss) est **Contrôlée** 1 tour. Un boss est Démoralisé 1 tour par point de combo. | Contrôle 2 tours à 4 points ou plus |
| **Danse des lames** | 1 | Compétence (finisher) | PC | Pendant 1 tour par point de combo, tes Attaques infligent +3 dégâts. | +4 dégâts |
| **Assommer** | 0 | Compétence (Ouverture) | PC | La cible (sauf boss) est **Contrôlée** 2 tours. L'effet prend fin si elle subit des dégâts. | 3 tours |

### 5.2 Arbre Assassinat (14 cartes) : poisons et coups mortels

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Mutiler** | 1 | Attaque | C | Inflige 4 dégâts 2 fois. +2 combo. | 5 × 2 |
| **Frappe à la gorge** | 1 | Attaque | C | Inflige 7 dégâts. +1 combo, ou +2 si la cible est empoisonnée. | 10 dégâts |
| **Fiole de venin** | 0 | Compétence | C | Applique Poison 3 à la cible. | Poison 5 |
| **Rupture** | 1 | Attaque (finisher) | C | Applique Saignement 3 par point de combo. | 4 par point |
| **Poison affaiblissant** | 1 | Pouvoir (Poison d'arme) | PC | Tes Attaques appliquent Poison 1 et Démoralisé 1 tour. | Poison 2 |
| **Poison engourdissant** | 1 | Pouvoir (Poison d'arme) | PC | Tes Attaques appliquent Poison 1. Quand tu touches un ennemi qui prépare une Incantation, elle est **retardée d'un tour** (1 fois par tour). | Poison 2 |
| **Envenimer** | 1 | Attaque (finisher) | PC | **Double** le Poison de la cible. Inflige 3 dégâts par point de combo. | 5 par point |
| **Garrot** | 1 | Attaque (Ouverture) | PC | Applique Saignement 4. La cible ne peut pas lancer de Sort à son prochain tour. +1 combo. | Saignement 6 |
| **Sang-froid** | 0 | Compétence | PC | Ta prochaine Attaque inflige double dégâts. **Épuisé.** | N'est plus Épuisé |
| **Toxines virulentes** | 1 | Pouvoir | PC | Quand un ennemi empoisonné meurt, son Poison passe à un autre ennemi. | Inné |
| **Lames empoisonnées** | 2 | Pouvoir | R | Le Poison ne diminue plus à la fin des tours ennemis. | Coûte 1 |
| **Opportunité** | 1 | Pouvoir | R | Quand tu joues un finisher à 5 points de combo, gagne 1 énergie et 1 combo. | Gagne 2 combo |
| **Coup au cœur** | 2 | Attaque (finisher) | R | Inflige 6 dégâts par point de combo. Si la cible a 30 % de PV ou moins, inflige double dégâts. | 8 par point |
| **Vendetta** | 1 | Compétence | É | Marque la cible pour tout le combat : tes Attaques contre elle infligent 50 % de dégâts en plus et appliquent 2 Poison supplémentaires. **Épuisé.** | Coûte 0 |

### 5.3 Arbre Combat (14 cartes) : attaques en série

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Double frappe** | 1 | Attaque | C | Inflige 4 dégâts 2 fois. +1 combo. | 5 × 2 |
| **Tir de pistolet** | 1 | Attaque | C | Inflige 8 dégâts. +1 combo. | 11 dégâts |
| **Riposte** | 1 | Compétence | C | Gagne 6 blocage. La prochaine attaque ennemie reçue ce tour-ci inflige 8 dégâts à l'attaquant et te donne +1 combo. | 9 / 10 |
| **Esquive agile** | 1 | Compétence | C | Gagne 8 blocage. +1 combo. | 11 blocage |
| **Remise en garde** | 0 | Compétence | C | +2 combo. **Éphémère.** | +3 combo |
| **Bagarreur** | 1 | Pouvoir | C | Gagne 1 Puissance. | 2 Puissance |
| **Frappe d'élan** | 1 | Attaque | PC | Inflige 5 dégâts. Si c'est ta 3ᵉ Attaque du tour, gagne 1 énergie. | 8 dégâts |
| **Coup bas** | 0 | Compétence | PC | La cible (sauf boss) est **Contrôlée** 1 tour. Contre un boss : son Incantation en cours est retardée d'un tour. | Pioche 1 carte |
| **Tourbillon de lames** | 1 | Pouvoir | PC | Tes Attaques à cible unique touchent aussi un autre ennemi, pour la moitié des dégâts. | Coûte 0 |
| **Second souffle** | 1 | Pouvoir | PC | Chaque fois que tu joues un finisher, gagne 4 blocage. | 6 blocage |
| **Valse des lames** | 2 | Attaque | R | Inflige 3 dégâts à tous les ennemis, 4 fois. +2 combo. | 4 × 4 |
| **Embrocher** | 1 | Attaque (finisher) | R | Inflige 6 dégâts par point de combo à la cible et 3 par point aux autres ennemis. | 8 / 4 |
| **Ambidextrie experte** | 2 | Pouvoir | R | La première Attaque que tu joues chaque tour est jouée **deux fois**. | Coûte 1 |
| **Frénésie meurtrière** | 2 | Attaque | É | Frappe 6 fois pour 4 dégâts, sur des ennemis au hasard. +1 combo par coup. | 5 dégâts × 6 |

### 5.4 Arbre Finesse (14 cartes) : ombres et ouvertures

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Coup dans le dos** | 1 | Attaque | C | Inflige 9 dégâts, ou 18 si tu es Camouflé. +1 combo. | 12 / 24 |
| **Hémorragie** | 1 | Attaque | C | Inflige 5 dégâts. Applique Saignement 3. +1 combo. | 7 / 4 |
| **Préméditation** | 0 | Compétence (Ouverture) | C | +3 combo. | +4 combo |
| **Lame de l'ombre** | 1 | Attaque | C | Inflige 7 dégâts. Pioche 1 carte. | 10 dégâts |
| **Plan parfait** | 1 | Compétence | C | Pioche 2 cartes. Si l'une d'elles est une Ouverture, elle coûte 0 ce tour-ci. | Pioche 3 cartes |
| **Bond de l'ombre** | 0 | Compétence | PC | Ta prochaine Attaque ce tour-ci est jouée comme si tu étais Camouflé (elle peut être une Ouverture). | Pioche 1 carte |
| **Fumigène** | 1 | Compétence | PC | Gagne 6 blocage. Tous les ennemis sont Démoralisés 1 tour. Tu es Camouflé au début de ton prochain tour. | 9 blocage |
| **Initiative** | 1 | Pouvoir | PC | Chaque fois que tu joues une Ouverture, +2 combo. | Inné |
| **Marque de mort** | 1 | Compétence | PC | +5 combo. **Épuisé.** | Coûte 0 |
| **Coup fourré** | 1 | Compétence (finisher) | PC | Gagne 5 blocage par point de combo. Tu es Camouflé au début de ton prochain tour. | 7 par point |
| **Égorgement** | 2 | Attaque (Ouverture) | R | Inflige 24 dégâts. +2 combo. | 32 dégâts |
| **Opportuniste** | 1 | Pouvoir | R | Tes Attaques infligent +4 dégâts aux ennemis Contrôlés ou Apeurés. | +6 dégâts |
| **Ténèbres** | 1 | Pouvoir | R | Au début de chaque combat, ton Camouflage dure 2 tours. Ce pouvoir est actif pour les combats suivants s'il est joué une fois (jusqu'à la fin de la run). **Épuisé.** | Coûte 0 |
| **Seigneur des ombres** | 2 | Pouvoir | É | Au début de chacun de tes tours, tu es **Camouflé** jusqu'à ta première Attaque qui n'est pas une Ouverture. | Coûte 1 |

---

## 6. La barre de sorts

| Sort | Coût | Recharge | Effet | Source principale |
|---|---|---|---|---|
| **Sprint** | 0 | 3 tours | Pioche 2 cartes. | Départ |
| **Coup de pied** | 0 | 3 tours | **Interruption.** Inflige 3 dégâts. | Talent Assassinat, palier 3 · Talent Combat, palier 4 |
| **Voile de l'ombre** | 0 | 1 fois par combat | **Retire tous tes débuffs** (Dissipation de tous les types). | Talent Assassinat, palier 3 |
| **Poussée d'adrénaline** | 0 | 5 tours | Gagne 2 énergie. | Talent Combat, palier 3 |
| **Évasion** | 0 | 4 tours | Jusqu'à ton prochain tour, les Attaques ennemies t'infligent 50 % de dégâts en moins. | Talent Combat, palier 3 |
| **Disparition** | 1 | 5 tours | Gagne 10 blocage. Tu redeviens **Camouflé**. | Talent Finesse, palier 3 |
| **Préparation** | 0 | 1 fois par combat | Les temps de recharge de tous tes autres sorts sont remis à zéro. | Talent Finesse, palier 3 |

**Sorts de barre dans les tables de loot** (exemples) : *Lancer de poison* (Poison 4 à tous les ennemis, recharge 4), *Pas de côté* (retire toutes les cartes-statut de ta main, recharge 3).

---

## 7. Les talents

### 7.1 Arbre Assassinat

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Lames malicieuses** : Attaque sinistre inflige +2 dégâts. | **Poison renforcé** : tes applications de Poison sont augmentées de 1. |
| **2** | **Finesse meurtrière** : Éviscération inflige +2 dégâts par point de combo. | **Réflexes** : Coup aux reins retarde aussi l'Incantation en cours d'un boss. |
| **3** | **Coup de pied** : ajoute ce sort à ta barre. | **Voile de l'ombre** : ajoute ce sort à ta barre. |
| **4** | **Impitoyable** : tes finishers comptent comme s'ils avaient 1 point de combo de plus. | **Quatrième emplacement** : ta barre de sorts gagne un 4ᵉ emplacement. |
| **5** | **Vendetta** (carte épique) | — |

### 7.2 Arbre Combat

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Précision** : tes Attaques infligent +1 dégât. | **Endurance** : +6 PV max. |
| **2** | **Agression** : commence chaque combat avec 2 points de combo. | **Lames sanglantes** : tes Attaques qui coûtent 0 infligent +2 dégâts. |
| **3** | **Poussée d'adrénaline** : ajoute ce sort à ta barre. | **Évasion** : ajoute ce sort à ta barre. |
| **4** | **Coup de pied** : ajoute ce sort à ta barre (si tu ne l'as pas déjà). | **Maître d'armes** : Double frappe et Valse des lames frappent une fois de plus. |
| **5** | **Frénésie meurtrière** (carte épique) | — |

### 7.3 Arbre Finesse

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Maître de la discrétion** : tes Ouvertures infligent +3 dégâts. | **Pas de velours** : la première carte que tu joues dans chaque combat coûte 0. |
| **2** | **Préparé** : tes Ouvertures donnent +1 combo. | **Insaisissable** : Esquive et Esquive agile donnent +2 blocage. |
| **3** | **Disparition** : ajoute ce sort à ta barre. | **Préparation** : ajoute ce sort à ta barre. |
| **4** | **Ombres profondes** : ton Camouflage de début de combat dure 2 tours. | **Quatrième emplacement** : ta barre de sorts gagne un 4ᵉ emplacement. |
| **5** | **Seigneur des ombres** (carte épique) | — |

---

## 8. Le légendaire : Sillon d'orage

> *Une lame forgée dans la foudre d'un prince des tempêtes, et scellée par deux fermoirs que ses geôliers se sont partagés.*

| Emplacement | Effet |
|---|---|
| **Arme** (légendaire) | Toutes les **3 Attaques** que tu joues, un éclair inflige **6 dégâts à tous les ennemis**. |

**La quête (acte 1, 3 étapes) :**
1. **Vaincre Gorlok le Fragmenté** (boss secondaire) : il fait tomber le **Fermoir gauche de l'orage**.
2. **Vaincre le Baron Vossk** (boss secondaire) : il fait tomber le **Fermoir droit de l'orage**.
3. **Événement « Ventor, Prince des tempêtes »** : une fois les deux fermoirs réunis, cet événement apparaît sur la carte. Ventor, libéré, forge Sillon d'orage.

Il faut affronter deux boss secondaires précis dans l'acte 1 : c'est un objectif de chemin exigeant, et c'est voulu.

---

## 9. Les builds

| Build | Arbres | Cartes clés | Plan de jeu |
|---|---|---|---|
| **L'Empoisonneur** | Assassinat | Poison mortel, Lames empoisonnées, Mutiler, Envenimer, Vendetta | Empiler le Poison sur un boss, puis le doubler et frapper vite. |
| **Le Bretteur** | Combat | Double frappe, Tourbillon de lames, Ambidextrie experte, Frénésie meurtrière | Enchaîner une avalanche de petites attaques et de finishers. |
| **L'Ombre** | Finesse | Seigneur des ombres, Coup dans le dos, Égorgement, Initiative | Redevenir Camouflé sans cesse pour jouer des Ouvertures à chaque tour. |
| **L'Assassin de l'ombre** | Finesse + Assassinat | Garrot, Préméditation, Coup au cœur, Opportuniste | Un premier tour explosif qui contrôle la cible, puis un finisher mortel. |

---

## 10. Forces et faiblesses face aux mécaniques de raid

| Mécanique | Le Voleur… |
|---|---|
| **Interruption** | ✅ Coup de pied, Coup bas, Poison engourdissant, Garrot (bloque les sorts). |
| **Enrage timer** | ✅✅ Excellent : ses dégâts sont rapides et explosifs. |
| **Adds** | ✅ Couteaux de lancer, Valse des lames, Embrocher, Tourbillon de lames. |
| **Contrôle** | ✅ Assommer, Coup aux reins, Coup bas. |
| **Dissipation** | ➖ Seulement **Voile de l'ombre**, une fois par combat. |
| **Pression continue** | ❌ Peu de blocage durable. Il doit tuer vite ou esquiver au bon moment. |

---

## 11. Notes de conception

- **Le premier tour compte :** le Camouflage donne au Voleur une identité forte dès l'ouverture de chaque combat.
- **À surveiller à l'équilibrage :**
  - Lames empoisonnées rend le Poison permanent : combiné à Vendetta, il peut devenir écrasant contre un boss.
  - Seigneur des ombres combiné à Égorgement (32 dégâts amélioré) chaque tour pourrait être trop fort.
  - Ambidextrie experte double la meilleure attaque du tour : à vérifier avec Égorgement ou Coup au cœur.
- **Ténèbres** est la seule carte qui reste active d'un combat à l'autre. Si l'idée plaît, on pourra en faire une petite famille de cartes « de run ».
- **Carte épique à revoir (mesure du bot, novembre 2026).** Contexte : le palier 5 devrait coûter **3 points** (projet, pas encore dans CONCEPT.md §9). Une carte épique doit alors valoir environ 3 talents des paliers 1 à 4, soit **+15 à +25 points** de victoire du bot. Build mesuré : paliers 1 à 4 de l'arbre + 3 paliers d'un autre, 200 runs, difficulté 0.
  - **Vendetta : +5 points** (contre +10 pour 3 talents ; +7 sans les copies). Jouée tôt (tour 2,1). La marquer sur l'ennemi le plus solide ne change rien (+3). Tout l'Assassinat est assez faible (+10 pour 3 talents). La carte a été baissée de coût 1 à 2 parce qu'avec Impitoyable l'Assassinat passait 80 % : ce cas ne se voit plus.
  - **Piste :** revenir à 1 énergie (0 améliorée) maintenant que le palier coûtera 3 points, ou la garder à 2 mais sans Épuisé.
  - **Seigneur des ombres : +4 points** (contre +32 pour 3 talents ; +8 sans les copies). Pouvoir à 2 énergie, posé au tour 2,9 en moyenne. Le Camouflé ne sert qu'aux **5 Ouvertures** du Voleur (et à Coup dans le dos, qui double ses dégâts) : sans Ouvertures en main, le tour de Camouflé est perdu. **C'est la carte :** elle dépend d'une densité d'Ouvertures que le deck a rarement. L'arbre Finesse, lui, est fort.
  - **Piste :** que le Camouflé donne aussi un bonus à toutes les Attaques (par exemple +3 dégâts à la première Attaque du tour), ou que la carte pioche une Ouverture au début de chaque tour.

---

## 12. Ce qui est en jeu dans le prototype

**Les chiffres retenus après l'équilibrage** (voir `docs/EQUILIBRAGE.md`, §12) : Esquive donne 6 blocage (9 améliorée), Éviscération 4 + 6 par point (4 + 8), Maître de la discrétion +4 aux Ouvertures, et Vendetta coûte 2 (1 améliorée). Le reste suit la fiche.

- **Les points de combo** se gardent d'un tour à l'autre et repartent à 0 (ou à 2 avec Agression) à chaque combat. On peut jouer un finisher à 0 point : il ne fait presque rien. Impitoyable ajoute 1 point à chaque finisher, même à 0.
- **Le Camouflage** dure le premier tour (2 tours avec Ombres profondes ou Ténèbres, qui ne s'additionnent pas). Le sprite du Voleur devient transparent tant qu'il est Camouflé. Une Ouverture Compétence (Assommer, Préméditation) ne profite pas de Bond de l'ombre, qui ne vaut que pour une Attaque.
- **Le Poison** frappe à chaque Attaque qui touche la cible (même si le coup est bloqué), puis le Poison d'arme s'applique : un coup en plusieurs frappes (Mutiler, Double frappe) le déclenche à chaque frappe. Les sorts de barre (Coup de pied) ne sont pas des Attaques.
- **Contrôlé** (Coup aux reins, Coup bas) : l'ennemi ne fait rien ; **Assommé** (Assommer) : pareil, mais il se réveille s'il est blessé. Les boss et boss secondaires y sont insensibles.
- **Garrot** fait échouer l'Incantation en cours (si elle peut être interrompue). **Poison engourdissant**, **Coup bas** (sur un boss) et **Réflexes** la retardent d'un tour.
- **Plan parfait :** si l'une des cartes piochées est une Ouverture, toutes tes Ouvertures coûtent 0 ce tour-ci.
- **Seigneur des ombres** te Camoufle aussi tout de suite, au moment où tu le joues.
- **Ambidextrie experte** rejoue la carte entière (un finisher compte les mêmes points deux fois).
- **La Malédiction de lignée** de Vhaeryx (2 tours) : tes points de combo tombent à 0, et tu n'en gagnes plus.
- **Sillon d'orage :** les deux Fermoirs de l'orage tombent sur Gorlok le Fragmenté et le Baron Vossk (acte 1, dans n'importe quel ordre). Avec les deux, Ventor, Prince des tempêtes, attend au premier « ? » de l'acte 2 (comme les autres légendaires, il ne se forge pas avant l'acte 2) : il forge la lame, ou tu revends les fermoirs (75 or).
