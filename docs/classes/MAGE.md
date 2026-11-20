# Classe : le Mage

> Wipe & Loot · Fiche de classe · Version 0.1
> Les chiffres ont été réglés par une première passe d'équilibrage (voir [l'équilibrage](../EQUILIBRAGE.md), §7).

---

## 1. Identité

> *« Le feu consume, la glace emprisonne, l'arcane plie le monde. Choisis ta perte. »*

Le Mage est un lanceur de sorts fragile mais redoutable. Il maîtrise **trois écoles de magie** qui jouent chacune différemment : le **Feu** fait fondre les ennemis dans la durée, le **Givre** les ralentit puis les brise, l'**Arcane** accumule une puissance brute qui finit par déborder.

- **Rôle :** dégâts magiques à distance, contrôle.
- **Difficulté :** ⭐⭐ Moyenne.
- **Déblocage :** par l'expérience (ou comme classe de départ).
- **Fantasme de jeu :** geler un boss sur place, ou le regarder brûler pendant qu'on se protège derrière une Carapace de glace.

| Statistique | Valeur |
|---|---|
| **PV max** | 72 |
| **Énergie** | 3 par tour |
| **Ressource de classe** | Charges d'école : Gel et Brûlure (sur les ennemis), Charges arcaniques (sur le Mage) |
| **Sort de barre de départ** | Contresort |

---

## 2. Mécanique 1 : les trois écoles

Les cartes du Mage sont presque toutes des **Sorts**. Chaque école laisse une trace différente.

### 🔥 Feu : la Brûlure (sur l'ennemi)
- **Brûlure (X)** : au début du tour de la cible, elle subit X dégâts, puis la Brûlure **diminue de 1**.
- Appliquer de la Brûlure s'**ajoute** à celle déjà présente.
- Les gros sorts de feu (Combustion, Éruption) **exploitent** la Brûlure accumulée.

### ❄️ Givre : le Gel (sur l'ennemi)
- **Gel (X)** : des cumuls qui s'empilent sur la cible. Le Gel diminue de 1 à la fin de chaque tour de la cible.
- **À 5 cumuls**, la cible devient **Gelée**, puis son Gel retombe à 0.
  - Un ennemi normal **perd son prochain tour**.
  - Un **boss** voit sa prochaine attaque **réduite de moitié**.
- **Fracasser** (mot-clé) : le sort inflige **double dégâts** si la cible a **3 Gel ou plus**, ou si elle est **Gelée**.

### ✨ Arcane : les Charges arcaniques (sur le Mage)
- De **0 à 4 charges**. Chaque charge donne **+2 dégâts** à tes Sorts arcaniques.
- Les charges se conservent d'un tour à l'autre pendant le combat.
- **Surcharge :** à la fin de ton tour, si tu as 4 charges, tu perds 2 PV.
- Certaines cartes (Barrage arcanique, Tempête arcanique) **consomment** toutes les charges pour un gros effet.

**L'intérêt :** chaque école a son rythme. Le Feu prépare, le Givre contrôle, l'Arcane prend des risques. Les builds hybrides (« Feu et Glace ») sont possibles.

---

## 3. Mécanique 2 : la fragilité et la protection

Le Mage a **peu de PV** et peu de blocage classique. Pour survivre, il compte sur :
- le **contrôle** : Gel, Métamorphose, Nova de givre, Contresort ;
- des **protections ponctuelles** très fortes dans sa barre : **Carapace de glace** (immunité totale pendant un tour) et **Clignement** (sortir du feu) ;
- la règle **« tuer avant d'être tué »**.

**L'intérêt :** le Mage doit **anticiper**. Il lit les intentions ennemies et place sa Carapace de glace ou son Contresort au bon moment.

---

## 4. Deck de départ et barre de sorts

### 4.1 Deck de départ (10 cartes)

| Carte | Qté | Coût | Type | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Trait de magie** | 4 | 1 | Sort (Arcane) | Inflige 7 dégâts. | 10 dégâts |
| **Barrière** | 4 | 1 | Compétence | Gagne 6 blocage. | 9 blocage |
| **Boule de feu** | 1 | 2 | Sort (Feu) | Inflige 14 dégâts. Applique Brûlure 4. | 18 dégâts, Brûlure 5 |
| **Éclair de givre** | 1 | 1 | Sort (Givre) | Inflige 7 dégâts. Applique Gel 2. | 9 dégâts, Gel 3 |

### 4.2 Sort de barre de départ

| Sort | Coût | Recharge | Effet |
|---|---|---|---|
| **Contresort** | 0 | 3 tours | **Interruption** de l'Incantation de la cible. Inflige 4 dégâts. |

---

## 5. Les cartes (52)

**Légende des raretés :** C = Commune · PC = Peu commune · R = Rare · É = Épique (débloquée par le dernier palier de talent de son arbre).

### 5.1 Tronc commun (10 cartes)

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Explosion des arcanes** | 1 | Sort | C | Inflige 5 dégâts à tous les ennemis. | 8 dégâts |
| **Nova de givre** | 1 | Sort | C | Applique Gel 2 à tous les ennemis. Gagne 3 blocage. | Gel 3, 5 blocage |
| **Lenteur** | 1 | Compétence | C | Applique Ralenti (2 tours) et Démoralisé (1 tour) à la cible. | Coûte 0 |
| **Siphon de mana** | 1 | Sort | C | Inflige 6 dégâts. Si la cible prépare une Incantation, gagne 1 énergie. | 9 dégâts |
| **Délivrance** | 0 | Compétence | C | **Dissipation (Malédiction).** Pioche 1 carte. | Pioche 2 cartes |
| **Bouclier de mana** | 1 | Compétence | PC | Gagne 7 blocage. S'il en reste au début de ton prochain tour, pioche 1 carte. | 10 blocage |
| **Métamorphose** | 1 | Compétence | PC | La cible (sauf boss) est transformée en mouton : **Contrôle** pendant 2 tours. L'effet prend fin si elle subit des dégâts. | Contrôle 3 tours |
| **Inspiration** | 0 | Compétence | PC | Ta prochaine carte ce tour-ci coûte 0. **Épuisé.** | N'est plus Épuisé |
| **Image miroir** | 1 | Compétence | PC | Gagne 4 blocage. Ajoute 2 **Reflets** à ta main (0 énergie, 3 dégâts, Éphémère). | 3 Reflets |
| **Érudition** | 2 | Pouvoir | R | Pioche 1 carte de plus au début de chaque tour. | Coûte 1 |

### 5.2 Arbre Arcane (14 cartes) : puissance brute et pioche

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Projectiles arcaniques** | 1 | Sort | C | Inflige 3 dégâts 3 fois. Gagne 1 charge. | 4 × 3 |
| **Déflagration arcanique** | 1 | Sort | C | Inflige 6 dégâts. Gagne 1 charge. | 9 dégâts |
| **Focalisation** | 1 | Compétence | C | Pioche 3 cartes. Gagne 1 charge. | Coûte 0 |
| **Flux arcanique** | 0 | Compétence | C | Gagne 1 énergie et 1 charge. **Éphémère.** | N'est plus Éphémère |
| **Bouclier arcanique** | 1 | Compétence | C | Gagne 5 blocage, +3 par charge. | 7, +4 par charge |
| **Rayon arcanique** | 2 | Sort | PC | Inflige 14 dégâts. Gagne 2 charges. | 19 dégâts |
| **Barrage arcanique** | 1 | Sort | PC | Consomme toutes tes charges. Inflige 5 dégâts et pioche 1 carte par charge consommée. | 7 dégâts par charge |
| **Présence d'esprit** | 0 | Compétence | PC | Ton prochain Sort ce tour-ci coûte 0. Gagne 1 charge. **Épuisé.** | N'est plus Épuisé |
| **Résonance** | 1 | Pouvoir | PC | Tes charges maximales passent à 6. | Coûte 0 |
| **Réflexion des sorts** | 1 | Compétence | PC | Gagne 6 blocage. Si un ennemi termine une Incantation sur toi ce tour-ci, il en subit la moitié des dégâts. | 9 blocage |
| **Distorsion temporelle** | 2 | Compétence | R | Au début de ton prochain tour, gagne 1 énergie et pioche 2 cartes de plus. **Épuisé.** | Coûte 1 |
| **Concentration arcanique** | 1 | Pouvoir | R | Chaque fois que tu joues ton 3ᵉ Sort d'un tour, gagne 1 énergie. | Inné |
| **Esprit vif** | 1 | Pouvoir | R | Au début de ton tour, gagne 1 charge. | Coûte 0 |
| **Tempête arcanique** | 2 | Sort | É | Consomme toutes tes charges. Inflige 6 dégâts **à tous les ennemis** par charge consommée. | 8 par charge |

### 5.3 Arbre Feu (14 cartes) : la Brûlure

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Roussir** | 0 | Sort | C | Inflige 3 dégâts. Applique Brûlure 2. | 4 / 3 |
| **Étincelle** | 0 | Sort | C | Applique Brûlure 3. **Éphémère.** | Brûlure 5 |
| **Boule de feu** | 2 | Sort | C | Inflige 14 dégâts. Applique Brûlure 4. | 18 / 5 |
| **Cône de flammes** | 1 | Sort | C | Inflige 5 dégâts à tous les ennemis. Applique Brûlure 1 à tous. | 7 / 2 |
| **Bouclier de flammes** | 1 | Compétence | C | Gagne 6 blocage. Applique Brûlure 2 à un ennemi au hasard. | 9 / 3 |
| **Éruption** | 1 | Sort | PC | Inflige des dégâts égaux à **2 fois** la Brûlure de la cible. | 3 fois |
| **Incendie** | 1 | Compétence | PC | Applique à **tous les autres ennemis** la même Brûlure que la cible. | Coûte 0 |
| **Embrasement** | 1 | Pouvoir | PC | Chaque fois qu'un de tes Sorts inflige 10 dégâts ou plus, applique Brûlure 3 à la cible. | Brûlure 4 |
| **Armure de lave** | 1 | Pouvoir | PC | Chaque fois qu'un ennemi t'attaque, il reçoit Brûlure 2. | Brûlure 3 |
| **Explosion de flammes** | 2 | Sort | R | Inflige 8 dégâts à tous les ennemis. Applique Brûlure 3 à tous. | 11 / 4 |
| **Météore** | 3 | Sort | R | Inflige 20 dégâts à la cible et 8 aux autres ennemis. Applique Brûlure 4 à la cible. | 26 / 10 |
| **Chaleur intense** | 2 | Pouvoir | R | Au début du tour des ennemis, avant les dégâts, leur Brûlure augmente de 1. | Coûte 1 |
| **Pyromanie** | 1 | Pouvoir | R | Tes Sorts de Feu qui coûtent 2 ou plus infligent +5 dégâts. | +8 dégâts |
| **Pyrolance** | 2 | Sort | É | Inflige 24 dégâts. Applique Brûlure 6. | 30 / 8 |

### 5.4 Arbre Givre (14 cartes) : contrôle et Fracasser

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Éclair de givre** | 1 | Sort | C | Inflige 7 dégâts. Applique Gel 2. | 9 / 3 |
| **Lance de glace** | 0 | Sort | C | Inflige 3 dégâts. **Fracasser.** | 5 dégâts |
| **Gelure** | 1 | Sort | C | Applique Gel 4. | Gel 5 |
| **Cône de froid** | 2 | Sort | C | Inflige 7 dégâts à tous les ennemis. Applique Gel 2 à tous. | 10 / 3 |
| **Barrière de glace** | 1 | Compétence | C | Gagne 9 blocage. Applique Gel 1 à tous les ennemis. | 12 blocage |
| **Armure de givre** | 1 | Pouvoir | PC | Chaque fois qu'un ennemi t'attaque, il reçoit Gel 1. | Gel 2 |
| **Morsure du froid** | 1 | Pouvoir | PC | Chaque fois qu'un ennemi devient Gelé, il subit 10 dégâts. | 15 dégâts |
| **Toucher glacial** | 0 | Compétence | PC | Ta prochaine carte avec **Fracasser** s'applique comme si la cible avait 3 Gel. | Pioche 1 carte |
| **Souffle polaire** | 1 | Sort | PC | Inflige 5 dégâts. **Fracasser.** Si la cible est Gelée, gagne 1 énergie. | 8 dégâts |
| **Tempête de neige** | 2 | Sort | R | Inflige 4 dégâts à tous les ennemis, 3 fois. Chaque fois, applique Gel 1. | 5 × 3 |
| **Prison de glace** | 1 | Compétence | R | La cible (sauf boss) devient immédiatement **Gelée**. **Épuisé.** | Fonctionne aussi sur un boss (attaque réduite de moitié) |
| **Fragmentation** | 2 | Pouvoir | R | **Fracasser** inflige **triple** dégâts au lieu de double. | Coûte 1 |
| **Cœur de glace** | 1 | Pouvoir | R | Au début de ton tour, applique Gel 1 à tous les ennemis. | Inné |
| **Fracas glaciaire** | 2 | Sort | É | Inflige 14 dégâts. **Fracasser.** Si la cible est Gelée, inflige aussi ces dégâts à tous les autres ennemis. | 18 dégâts |

---

## 6. La barre de sorts

| Sort | Coût | Recharge | Effet | Source principale |
|---|---|---|---|---|
| **Contresort** | 0 | 3 tours | **Interruption** de l'Incantation de la cible. Inflige 4 dégâts. | Départ |
| **Évocation** | 0 | 5 tours | Gagne 2 énergie et pioche 1 carte. | Talent Arcane, palier 3 |
| **Pouvoir des arcanes** | 0 | 5 tours | Ce tour-ci, tes Sorts infligent 50 % de dégâts en plus. | Talent Arcane, palier 3 |
| **Clignement** | 0 | 4 tours | Retire de ta main toutes les cartes-statut (Zone de feu, Bombe vivante…) **sans subir leur effet**. Gagne 4 blocage. | Talent Arcane, palier 4 |
| **Combustion** | 1 | 4 tours | **Double** la Brûlure de tous les ennemis. | Talent Feu, palier 3 |
| **Souffle ardent** | 1 | 3 tours | Inflige 4 dégâts à tous les ennemis et leur applique Brûlure 2. | Talent Feu, palier 3 |
| **Carapace de glace** | 1 | 6 tours | Tu es **immunisé à tous les dégâts** jusqu'à ton prochain tour. Ton tour se termine immédiatement. | Talent Givre, palier 3 |
| **Orbe glaciale** | 1 | 3 tours | Inflige 4 dégâts à tous les ennemis et leur applique Gel 2. | Talent Givre, palier 3 |

**Sorts de barre dans les tables de loot** (exemples) : *Bouclier de feu ancestral* (8 blocage et Brûlure 3 à l'attaquant, recharge 3), *Vortex temporel* (les temps de recharge des autres sorts diminuent de 2, 1 fois par combat).

---

## 7. Les talents

Mêmes règles que pour toutes les classes (voir [le fonctionnement des classes](README.md)) : talents permanents choisis avant la run, paliers 1 à 4 avec **1 choix parmi 2**, palier 5 = **carte épique** ajoutée au deck de départ.

### 7.1 Arbre Arcane

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Subtilité arcanique** : commence chaque combat avec 2 charges. | **Méditation** : pioche 1 carte de plus au premier tour de chaque combat. |
| **2** | **Stabilité** : la Surcharge ne fait plus perdre de PV. | **Esprit clair** : Barrage arcanique pioche 1 carte de plus. |
| **3** | **Évocation** : ajoute ce sort à ta barre. | **Pouvoir des arcanes** : ajoute ce sort à ta barre. |
| **4** | **Clignement** : ajoute ce sort à ta barre. | **Quatrième emplacement** : ta barre de sorts gagne un 4ᵉ emplacement. |
| **5** | **Tempête arcanique** (carte épique) | — |

### 7.2 Arbre Feu

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Feu intense** : toutes tes applications de Brûlure sont augmentées de 1. | **Impact** : Boule de feu inflige +3 dégâts. |
| **2** | **Brasier** : quand tu appliques de la Brûlure à une cible qui en a déjà 5 ou plus, applique 2 de plus. | **Souffle du dragon** : au début de chaque combat, applique Brûlure 2 à tous les ennemis. |
| **3** | **Combustion** : ajoute ce sort à ta barre. | **Souffle ardent** : ajoute ce sort à ta barre. |
| **4** | **Pyromane** : la recharge de Combustion et de Souffle ardent diminue de 1. | **Flammes éternelles** : la Brûlure des boss ne diminue plus. |
| **5** | **Pyrolance** (carte épique) | — |

### 7.3 Arbre Givre

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Hiver précoce** : toutes tes applications de Gel sont augmentées de 1. | **Givre durable** : le Gel ne diminue plus à la fin des tours ennemis. |
| **2** | **Froid glacial** : un ennemi devient Gelé à 4 cumuls au lieu de 5. | **Fragilité** : tes cartes avec Fracasser infligent +3 dégâts. |
| **3** | **Carapace de glace** : ajoute ce sort à ta barre. | **Orbe glaciale** : ajoute ce sort à ta barre. |
| **4** | **Cœur gelé** : chaque fois qu'un ennemi devient Gelé, gagne 1 énergie. | **Hiver sans fin** : la recharge de Carapace de glace diminue de 2. |
| **5** | **Fracas glaciaire** (carte épique) | — |

---

## 8. Le légendaire : le Bâton du Veilleur (version Mage)

> *Le Veilleur fut le premier gardien des arcanes d'Eldrava. À sa mort, son bâton fut brisé en trois, pour que nul ne puisse en abuser seul.*

| Emplacement | Effet |
|---|---|
| **Arme** (légendaire) | Le **premier Sort** de chaque tour coûte 0. |

**La quête (actes 1 et 2, 3 étapes)** — commune au Mage, au Démoniste et au Druide, avec une étape finale propre à chaque classe :
1. **Vaincre Zhaal le Tisseur d'arcanes** (boss secondaire, acte 1) : il fait tomber le **Fragment du Veilleur**.
2. **Événement « L'observatoire en ruine »** (acte 2) : l'esprit du Veilleur demande une preuve de sagesse. Le joueur accepte de perdre 8 PV max pour obtenir la **Tête du bâton**.
3. **Étape du Mage :** au feu de camp suivant, option **« Lier les fragments »**. Le Mage doit retirer de son deck une carte rare de son choix pour sceller le bâton.

---

## 9. Les builds

| Build | Arbres | Cartes clés | Plan de jeu |
|---|---|---|---|
| **Le Pyromane** | Feu | Boule de feu, Embrasement, Chaleur intense, Éruption, Combustion, Pyrolance | Empiler la Brûlure sur un boss, la doubler avec Combustion, puis finir avec Éruption. |
| **Le Glacier** | Givre | Cœur de glace, Armure de givre, Fragmentation, Lance de glace, Fracas glaciaire | Garder les ennemis Gelés en permanence et les briser avec Fracasser. |
| **L'Arcaniste** | Arcane | Projectiles arcaniques, Esprit vif, Résonance, Concentration arcanique, Tempête arcanique | Piocher beaucoup, accumuler les charges en frôlant la Surcharge, puis tout libérer. |
| **Feu et Glace** | Givre + Feu | Nova de givre, Barrière de glace, Cône de flammes, Explosion de flammes | Contrôler les adds avec le Gel pendant que la Brûlure travaille. |

---

## 10. Forces et faiblesses face aux mécaniques de raid

| Mécanique | Le Mage… |
|---|---|
| **Interruption** | ✅ Contresort dès le départ, Siphon de mana récompense le timing. |
| **Adds** | ✅✅ Excellent : Explosion des arcanes, Cône de flammes, Tempête de neige, Explosion de flammes, Métamorphose. |
| **Enrage timer** | ✅ Bon, surtout en Feu et en Arcane. |
| **Dissipation** | ➖ Seulement les **Malédictions** (Délivrance). |
| **Zones de feu** | ✅ Clignement les retire sans dégâts. |
| **Gros coups annoncés** | ✅ Carapace de glace annule une attaque énorme. |
| **Pression continue** | ❌ **Fragile** : 72 PV et peu de blocage. Un combat long contre plusieurs attaquants est dangereux. |

---

## 11. Notes de conception

- **Trois écoles, trois rythmes :** c'est la classe qui montre le mieux la profondeur des talents.
- **À surveiller à l'équilibrage :**
  - Chaleur intense combinée à Combustion peut faire exploser la Brûlure sur les boss.
  - Cœur de glace et Armure de givre peuvent garder un boss presque toujours à moitié de dégâts.
  - Érudition et Concentration arcanique pourraient rendre l'Arcane trop fluide.
- **Gel sur les boss :** l'effet « attaque réduite de moitié » doit rester fort, sinon l'arbre Givre perd son intérêt sur les combats qui comptent.
- **Carte épique à revoir (mesure du bot, novembre 2026).** Contexte : le palier 5 coûte **3 points** (décidé, CONCEPT.md §9 ; pas encore dans le code). Une carte épique doit alors valoir environ 3 talents des paliers 1 à 4, soit **+15 à +25 points** de victoire du bot. Build mesuré : paliers 1 à 4 de l'arbre + 3 paliers d'un autre, 200 runs, difficulté 0.
  - **Fracas glaciaire : −4 points** (contre +26 pour 3 talents). Jouée sur une cible gelée ou fracassable seulement **14 %** du temps : le reste du temps, c'est 14 dégâts pour 2 énergie. Avec un bot qui ne la joue que sur une cible gelée, elle remonte à **+1** seulement : elle attend en main, faute de cible. **C'est la carte, pas le bot :** le Givre gèle trop rarement pour qu'une épique dépende de cette condition, et la zone demande « Gelée », plus strict que Fracasser (Gel 3 ou plus).
  - **Piste :** rendre la carte autonome : « Applique 3 Gel, puis Fracasse », et la zone si la cible est fracassable (plus seulement Gelée). À mesurer avant de figer les chiffres.
  - **Tempête arcanique : +4 points** (contre +9 pour 3 talents). Bien jouée : en moyenne 31 dégâts répartis sur 2,5 ennemis pour 2 énergie, avec 2,4 charges. Un bot qui attend 4 charges ne fait pas mieux (+2). **C'est la carte et son arbre :** vider ses charges coûte le bonus qu'elles donnent aux sorts suivants, et tout l'Arcane est faible (3 talents n'y valent que +9).
  - **Piste :** ne pas vider les charges (« garde 1 charge », ou la Tempête en rend 2 si elle tue). Revoir l'arbre Arcane dans son ensemble avant de fixer la carte.
  - **Pyrolance : +12 points** (contre +17 pour 3 talents). Bien jouée : 22 dégâts et Brûlure 6 pour 2 énergie. Elle vaut environ 2 talents : il manque peu, mais c'est un gros chiffre sans lien avec la Brûlure déjà posée.
  - **Piste :** la lier à l'identité du Feu : « +1 dégât par Brûlure sur la cible » ou « double la Brûlure de la cible ».
