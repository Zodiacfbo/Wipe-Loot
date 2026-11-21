# Classe : le Démoniste

> Wipe & Loot · Fiche de classe · Version 0.1
> Les chiffres ont été réglés par une première passe d'équilibrage (voir [l'équilibrage](../EQUILIBRAGE.md), §10).

---

## 1. Identité

> *« Ma vie est un prix. Ta mort est un gain. »*

Le Démoniste manipule les ombres et les flammes de l'abîme. Il **paie de sa propre vie** pour gagner en puissance, **asservit des démons** qui combattent à ses côtés et **ronge** ses ennemis avec des malédictions et des maux qui durent.

- **Rôle :** dégâts dans la durée, invocations, contrôle.
- **Difficulté :** ⭐⭐⭐ Difficile.
- **Déblocage :** par l'expérience.
- **Fantasme de jeu :** couvrir un boss de malédictions, puis regarder ses PV fondre pendant que son démon le harcèle.

| Statistique | Valeur |
|---|---|
| **PV max** | 74 |
| **Énergie** | 3 par tour |
| **Ressource de classe** | Éclats d'âme (0 à 5), conservés d'un combat à l'autre |
| **Familier** | Un démon permanent (voir §3) |
| **Sort de barre de départ** | Pacte de sang |

---

## 2. Mécanique 1 : les Éclats d'âme et le prix du sang

### Les Éclats d'âme
- De **0 à 5 éclats**.
- **Ils se conservent d'un combat à l'autre** pendant toute la run. C'est la seule ressource de classe qui fonctionne ainsi.
- **Gagner des éclats :**
  - quand un ennemi **meurt avec au moins un de tes DoT ou une de tes Malédictions** sur lui : +1 éclat ;
  - avec **Siphon d'âme** : si la cible meurt ce tour-ci, +2 éclats (au lieu de 1) ;
  - avec certaines cartes et certains sorts.
- **Dépenser des éclats :** certaines cartes ont un **coût en éclats** (affiché en violet). Exemples : Feu de l'âme, les invocations, Cataclysme de l'âme.

### Le prix du sang
Plusieurs cartes et sorts coûtent des **PV** au lieu de l'énergie, ou en plus. Le Démoniste gère donc sa vie comme une ressource. Ses Siphons de vie lui permettent de récupérer une partie de ce qu'il dépense.

### Les Malédictions
- Les cartes de type **Malédiction** (à ne pas confondre avec les cartes Malédiction négatives du deck) sont des débuffs puissants.
- **Une seule de tes Malédictions par ennemi.** En poser une nouvelle remplace l'ancienne.

**L'intérêt :** le Démoniste construit sa puissance sur la durée, et même sur toute la run, grâce aux éclats. Il doit choisir quand dépenser ses éclats et combien de PV il peut sacrifier.

---

## 3. Mécanique 2 : le familier démoniaque

Le Démoniste combat toujours avec **un démon**. Le familier :
- **agit automatiquement à la fin de chaque tour du joueur** ;
- **ne peut pas mourir** (pas de PV à gérer) ;
- peut être **remplacé en cours de combat** par une carte d'Invocation.

**Au début de chaque combat**, le joueur choisit son familier parmi les deux familiers de base :

| Familier | Action en fin de tour | Rôle |
|---|---|---|
| 😈 **Diablotin** (base) | Inflige 4 dégâts de feu à un ennemi au hasard. | Dégâts |
| 🛡️ **Rôdeur du néant** (base) | Te donne 5 blocage. | Défense |
| 💋 **Succube** (par Invocation) | Inflige 2 dégâts à ta cible. Tous les 3 tours, **Séduction** : Contrôle 1 tour sur un ennemi (sauf boss). | Contrôle |
| 🐺 **Molosse infernal** (par Invocation) | Inflige 2 dégâts à ta cible. Au début de ton tour, **dévore 1 débuff Magie** sur toi (Dissipation). Une fois tous les 3 tours, tu peux lui ordonner un **Verrou magique** gratuit (Interruption). | Utilitaire |

**L'intérêt :** le familier donne au Démoniste une source de dégâts ou de défense permanente, et une décision au début de chaque combat. Le Molosse est sa seule réponse fiable aux sorts magiques.

---

## 4. Deck de départ et barre de sorts

### 4.1 Deck de départ (10 cartes)

| Carte | Qté | Coût | Type | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Trait de l'ombre** | 4 | 1 | Sort | Inflige 7 dégâts. | 10 dégâts |
| **Garde sombre** | 4 | 1 | Compétence | Gagne 6 blocage. | 9 blocage |
| **Corruption** | 1 | 1 | Sort | Applique **DoT 4** pendant 4 tours. | DoT 5 |
| **Siphon d'âme** | 1 | 1 | Sort | Inflige 7 dégâts. Si la cible meurt ce tour-ci, gagne 2 éclats d'âme. | 10 dégâts |

### 4.2 Sort de barre de départ

| Sort | Coût | Recharge | Effet |
|---|---|---|---|
| **Pacte de sang** | 0 | 2 tours | Perds 5 PV. Gagne 1 énergie et pioche 1 carte. |

---

## 5. Les cartes (51)

**Légende des raretés :** C = Commune · PC = Peu commune · R = Rare · É = Épique (débloquée par le dernier palier de talent de son arbre).

### 5.1 Tronc commun (9 cartes)

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Siphon d'âme** | 1 | Sort | C | Inflige 7 dégâts. Si la cible meurt ce tour-ci, gagne 2 éclats d'âme. | 10 dégâts |
| **Siphon de vie** | 1 | Sort | C | Inflige 5 dégâts. Te soigne de 5 PV. | 7 / 7 |
| **Peur** | 1 | Compétence | C | La cible (sauf boss) est **Apeurée** 1 tour. Un boss est Démoralisé 2 tours. | Coûte 0 |
| **Pacte noir** | 0 | Compétence | C | Perds 3 PV. Pioche 2 cartes. | Pioche 3 cartes |
| **Malédiction des langages** | 0 | Malédiction | PC | La prochaine Incantation de la cible met **1 tour de plus** à se terminer. | Dure pour 2 Incantations |
| **Pluie de feu** | 2 | Sort | PC | Inflige 5 dégâts à tous les ennemis, 2 fois. | 7 × 2 |
| **Armure démoniaque** | 1 | Pouvoir | PC | Gagne 1 Robustesse. Au début de ton tour, soigne 1 PV. | 2 Robustesse |
| **Hurlement de terreur** | 2 | Compétence | R | Tous les ennemis (sauf boss) sont Apeurés 1 tour. **Épuisé.** | Coûte 1 |
| **Création de pierre de vie** | 1 | Compétence | R | Ajoute une **Pierre de vie** (potion : soigne 15 PV) dans un emplacement de potion libre. **Épuisé.** | Coûte 0 |

### 5.2 Arbre Affliction (14 cartes) : DoT et malédictions

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Corruption** | 1 | Sort | C | Applique DoT 4 pendant 4 tours. | DoT 5 |
| **Malédiction de souffrance** | 1 | Malédiction | C | Pendant 6 tours, la cible subit des dégâts croissants : 1, 2, 3, 4, 5 puis 6. | 2 à 7 |
| **Malédiction de faiblesse** | 1 | Malédiction | C | La cible est Démoralisée pendant 5 tours. | Coûte 0 |
| **Malédiction de fatigue** | 1 | Malédiction | C | La cible est Ralentie pendant 5 tours, et ses Attaques infligent 2 dégâts de moins. | 3 de moins |
| **Pacte de souffrance** | 0 | Sort | C | Perds 4 PV. Applique DoT 4 pendant 4 tours. | DoT 6 |
| **Ombre persistante** | 0 | Compétence | C | Tous tes DoT sur la cible durent 2 tours de plus. | 3 tours |
| **Malédiction des éléments** | 1 | Malédiction | PC | Pendant 5 tours, la cible subit 30 % de dégâts en plus de tes Sorts. | 50 % |
| **Fléau rampant** | 2 | Sort | PC | Applique DoT 2 à **tous les ennemis** pendant 4 tours. | DoT 3 |
| **Hantise** | 1 | Sort | PC | Inflige 8 dégâts. Pendant 2 tours, tes DoT sur la cible infligent 50 % de dégâts en plus. | 11 dégâts |
| **Étreinte de l'ombre** | 1 | Pouvoir | PC | Tes DoT infligent +1 dégât. | +2 dégâts |
| **Contagion** | 1 | Compétence | R | Copie tous tes DoT et ta Malédiction de la cible sur un autre ennemi. | Sur tous les autres ennemis |
| **Moisson sombre** | 2 | Sort | R | Inflige à chaque ennemi 4 dégâts par DoT et Malédiction actifs sur lui. | 6 par effet |
| **Tourment** | 1 | Pouvoir | R | Chaque fois qu'un de tes DoT inflige des dégâts, soigne 1 PV. | Coûte 0 |
| **Tempête d'afflictions** | 1 | Sort | É | **Déclenche immédiatement deux fois** tous tes DoT sur tous les ennemis (sans réduire leur durée), puis les **prolonge de 1 tour**. | Trois fois |

### 5.3 Arbre Démonologie (14 cartes) : le familier

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Ordre : Assaut** | 0 | Compétence | C | Ton familier agit immédiatement une fois de plus. | Pioche 1 carte |
| **Pacte des ombres** | 1 | Compétence | C | Gagne 7 blocage. Ton familier inflige +2 dégâts pour ce combat. | 10 blocage |
| **Rituel de l'invocateur** | 1 | Compétence | C | Pioche 2 cartes. Si tu as 3 éclats ou plus, gagne 1 énergie. | Pioche 3 cartes |
| **Festin démoniaque** | 1 | Compétence | C | Soigne 6 PV. La prochaine action de ton familier est doublée. | Soigne 9 PV |
| **Lien vital** | 0 | Compétence | C | Ton familier te soigne de 3 PV. | 5 PV |
| **Invocation : Succube** | 1 + 1 éclat | Compétence | PC | Ton familier devient la **Succube** jusqu'à la fin du combat. Elle agit immédiatement. | Ne coûte plus d'éclat |
| **Invocation : Molosse infernal** | 1 + 1 éclat | Compétence | PC | Ton familier devient le **Molosse infernal** jusqu'à la fin du combat. Il agit immédiatement. | Ne coûte plus d'éclat |
| **Liens démoniaques** | 1 | Pouvoir | PC | Les effets de ton familier sont augmentés de 50 % (dégâts, blocage, soins). | Coûte 0 |
| **Éclat partagé** | 1 | Pouvoir | PC | Quand ton familier tue un ennemi, gagne 1 éclat d'âme. | Inné |
| **Lien de l'âme** | 2 | Pouvoir | R | Chaque fois que ton familier inflige des dégâts, gagne autant de blocage. | Coûte 1 |
| **Sacrifice démoniaque** | 0 | Compétence | R | Sacrifie ton familier pour le reste du combat. Gagne 2 Puissance et 1 énergie de plus à chaque tour. **Épuisé.** | 3 Puissance |
| **Asservissement** | 1 | Compétence | R | Un ennemi (sauf boss) combat **pour toi** pendant 2 tours : il attaque les autres ennemis. **Épuisé.** | 3 tours |
| **Maître des pactes** | 1 | Pouvoir | R | Pacte de sang, Pacte noir et Pacte de souffrance coûtent 2 PV de moins. | 4 PV de moins |
| **Invocation : Seigneur infernal** | 2 + 2 éclats | Compétence | É | Invoque un **Seigneur infernal** pour ce combat, **en plus** de ton familier. À la fin de chacun de tes tours, il inflige 12 dégâts à tous les ennemis. **Épuisé.** | 16 dégâts |

### 5.4 Arbre Destruction (14 cartes) : ombre et flammes

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Trait de l'ombre** | 1 | Sort | C | Inflige 7 dégâts. | 10 dégâts |
| **Incinérer** | 1 | Sort | C | Inflige 7 dégâts, +4 si la cible est sous Immolation. | 10 / +5 |
| **Immolation** | 2 | Sort | C | Inflige 8 dégâts. Applique **Immolation** (DoT 4 pendant 3 tours). | 11 / DoT 5 |
| **Déflagration d'ombre** | 1 | Sort | C | Inflige 5 dégâts à tous les ennemis. | 8 dégâts |
| **Chaos instable** | 1 | Sort | C | Inflige entre 4 et 16 dégâts (au hasard). | 8 à 20 |
| **Conflagration** | 1 | Sort | PC | Consomme l'Immolation de la cible. Inflige 3 fois les dégâts qu'il lui restait à infliger. | 4 fois |
| **Embrasement de l'âme** | 0 + 1 éclat | Compétence | PC | Gagne 2 énergie. | Pioche 1 carte |
| **Ombre et flammes** | 1 | Pouvoir | PC | Trait de l'ombre, Incinérer et Immolation infligent +3 dégâts. | +5 dégâts |
| **Contrecoup** | 1 | Pouvoir | PC | Chaque fois que tu perds des PV, ton prochain Trait de l'ombre coûte 0. | Inné |
| **Feu de l'âme** | 1 + 1 éclat | Sort | R | Inflige 22 dégâts. | 30 dégâts |
| **Trait du chaos** | 2 | Sort | R | Inflige 18 dégâts. **Ignore le blocage.** | 24 dégâts |
| **Pacte de destruction** | 1 | Compétence | R | Perds 6 PV. Ton prochain Sort inflige double dégâts. | Perds 3 PV |
| **Ruine** | 1 | Pouvoir | R | Tes Sorts qui coûtent 2 énergie ou plus infligent +6 dégâts. | +9 dégâts |
| **Cataclysme de l'âme** | 2 | Sort | É | Inflige 5 dégâts à **tous les ennemis** par éclat que tu possèdes, **sans les dépenser**. | 7 par éclat |

---

## 6. La barre de sorts

| Sort | Coût | Recharge | Effet | Source principale |
|---|---|---|---|---|
| **Pacte de sang** | 0 | 2 tours | Perds 5 PV. Gagne 1 énergie et pioche 1 carte. | Départ |
| **Amplifier la malédiction** | 0 | 4 tours | L'effet de ta prochaine Malédiction est doublé. | Talent Affliction, palier 3 |
| **Spirale mortelle** | 1 | 4 tours | Inflige 8 dégâts et te soigne de 8 PV. La cible (sauf boss) est Apeurée 1 tour. | Talent Affliction, palier 3 |
| **Pacte démoniaque** | 0 | 4 tours | Ton familier agit deux fois de plus immédiatement. | Talent Démonologie, palier 3 |
| **Pierre d'âme** | 0 + 1 éclat | 1 fois par combat | Si tu tombes à 0 PV avant la fin du combat, reviens à 30 % de tes PV max au lieu de wiper. | Talent Démonologie, palier 3 |
| **Brûlure de l'ombre** | 1 | 3 tours | Inflige 10 dégâts. Si la cible meurt ce tour-ci, gagne 1 éclat d'âme. | Talent Destruction, palier 3 |
| **Rempart d'ombre** | 0 | 3 tours | Gagne 10 blocage. | Talent Destruction, palier 3 |

**Sorts de barre dans les tables de loot** (exemples) : *Cercle de téléportation* (retire toutes les cartes-statut de ta main, recharge 4), *Œil de l'abîme* (révèle les deux prochaines intentions des ennemis, recharge 3).

---

## 7. Les talents

### 7.1 Arbre Affliction

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Corruption améliorée** : tes DoT infligent +2 dégâts par tour. | **Malédictions durables** : tes Malédictions durent 2 tours de plus. |
| **2** | **Moisson d'âmes** : quand un ennemi meurt avec un de tes DoT, gagne 1 éclat supplémentaire. | **Double malédiction** : chaque ennemi peut porter 2 de tes Malédictions au lieu d'une. |
| **3** | **Amplifier la malédiction** : ajoute ce sort à ta barre. | **Spirale mortelle** : ajoute ce sort à ta barre. |
| **4** | **Contagion naturelle** : tes DoT durent 1 tour de plus, et quand un ennemi meurt, ses DoT passent à un autre ennemi. | **Quatrième emplacement** : ta barre de sorts gagne un 4ᵉ emplacement. |
| **5** | **Tempête d'afflictions** (carte épique) | — |

### 7.2 Arbre Démonologie

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Démon robuste** : ton familier inflige +2 dégâts et donne +2 blocage. | **Peau démoniaque** : +10 PV max. |
| **2** | **Invocation rapide** : les cartes d'Invocation (sauf le Seigneur infernal) ne coûtent plus d'éclat. | **Lien du maître** : chaque fois que ton familier agit, gagne 3 blocage. |
| **3** | **Pacte démoniaque** : ajoute ce sort à ta barre. | **Pierre d'âme** : ajoute ce sort à ta barre. |
| **4** | **Maître invocateur** : ton familier agit deux fois au tout début de chaque combat. | **Quatrième emplacement** : ta barre de sorts gagne un 4ᵉ emplacement. |
| **5** | **Invocation : Seigneur infernal** (carte épique) | — |

### 7.3 Arbre Destruction

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Trait de l'ombre amélioré** : Trait de l'ombre inflige +5 dégâts. | **Dévastation** : Immolation inflige +3 dégâts par tour. |
| **2** | **Pyroclasme** : Pluie de feu et Déflagration d'ombre appliquent Démoralisé (1 tour). | **Intensité** : Pacte de sang ne coûte que 3 PV. |
| **3** | **Brûlure de l'ombre** : ajoute ce sort à ta barre. | **Rempart d'ombre** : ajoute ce sort à ta barre. |
| **4** | **Ruine améliorée** : Feu de l'âme coûte 0 énergie (il coûte toujours 1 éclat). | **Embrasement durable** : Conflagration ne consomme plus l'Immolation. |
| **5** | **Cataclysme de l'âme** (carte épique) | — |

---

## 8. Le légendaire : le Bâton du Veilleur (version Démoniste)

> *Même le Veilleur avait étudié les ombres. Entre les mains d'un démoniste, le bâton se souvient de cette part sombre.*

| Emplacement | Effet |
|---|---|
| **Arme** (légendaire) | Une fois par tour, **Pacte de sang ne coûte pas de PV**. Tes DoT durent **1 tour de plus**. |

**La quête (actes 1 et 2, 3 étapes)** — commune au Mage, au Démoniste et au Druide :
1. **Vaincre Zhaal le Tisseur d'arcanes** (boss secondaire, acte 1) : il fait tomber le **Fragment du Veilleur**.
2. **Événement « L'observatoire en ruine »** (acte 2) : l'esprit du Veilleur demande une preuve de sagesse. Le joueur accepte de perdre 8 PV max pour obtenir la **Tête du bâton**.
3. **Étape du Démoniste :** au feu de camp suivant, option **« Lier par l'âme »**. Le Démoniste dépense **3 éclats d'âme** pour sceller le bâton.

---

## 9. Les builds

| Build | Arbres | Cartes clés | Plan de jeu |
|---|---|---|---|
| **Le Fléau** | Affliction | Corruption, Malédiction de souffrance, Étreinte de l'ombre, Contagion, Tempête d'afflictions | Couvrir tous les ennemis de DoT, puis les déclencher tous d'un coup. |
| **L'Invocateur** | Démonologie | Liens démoniaques, Ordre : Assaut, Lien de l'âme, Seigneur infernal | Laisser les démons faire le travail et se protéger grâce à eux. |
| **Le Pyromancien noir** | Destruction | Immolation, Conflagration, Ruine, Feu de l'âme, Cataclysme de l'âme | Accumuler les éclats pendant la run, puis les dépenser en sorts dévastateurs. |
| **Le Siphonneur** | Affliction + Démonologie | Siphon de vie, Tourment, Rôdeur du néant, Lien vital | Un build d'endurance qui se soigne en continu et use les boss. |

---

## 10. Forces et faiblesses face aux mécaniques de raid

| Mécanique | Le Démoniste… |
|---|---|
| **Interruption** | ➖ Pas d'interruption directe au départ. Malédiction des langages retarde les incantations. Le **Molosse infernal** apporte un Verrou magique. |
| **Dissipation** | ➖ Seulement la **Magie**, et seulement avec le Molosse infernal. |
| **Adds** | ✅ Pluie de feu, Fléau rampant, Hurlement de terreur, Contagion. |
| **Enrage timer** | ➖ Les DoT sont lents au départ. Le build Destruction compense avec Feu de l'âme. |
| **Combats longs** | ✅✅ Excellent : les DoT et les Siphons de vie usent les boss. |
| **PV** | ❌ Le Démoniste **se fait mal à lui-même**. Une mauvaise gestion des pactes peut coûter un wipe. |

---

## 11. Notes de conception

- **Les éclats conservés entre les combats** sont l'identité unique du Démoniste : ils récompensent le jeu sur toute la run.
- **À surveiller à l'équilibrage :**
  - Tempête d'afflictions avec beaucoup de DoT et Étreinte de l'ombre peut tuer un boss d'un coup.
  - Cataclysme de l'âme à 5 éclats : 40 dégâts à tous les ennemis (55 amélioré).
  - Le cumul Tourment + Siphon de vie + Armure démoniaque pourrait rendre le Démoniste presque immortel dans les combats longs.
- **Complexité :** familier, éclats, DoT et malédictions, c'est beaucoup. Le tutoriel de la classe devra présenter le familier en premier.
- **Carte épique à revoir (mesure du bot, novembre 2026).** Contexte : le palier 5 coûte **3 points** (CONCEPT.md §9, en jeu depuis novembre 2026). Une carte épique doit alors valoir environ 3 talents des paliers 1 à 4, soit **+15 à +25 points** de victoire du bot. Build mesuré : paliers 1 à 4 de l'arbre + 3 paliers d'un autre, 200 runs, difficulté 0.
  - **Tempête d'afflictions : −4 points** (contre +14 pour 3 talents). Le bot la joue bien, mais tard (tour 5,5 en moyenne), et les DoT posés ne font alors que **6,7 dégâts par tick** au total : environ 13 dégâts pour 2 énergie, le niveau d'une commune. **C'est la carte :** elle multiplie des DoT trop petits. La crainte notée plus haut (tuer un boss d'un coup) ne se voit pas en jeu.
  - **Piste :** 1 énergie, ou en plus « prolonge tous tes DoT de 1 tour », pour qu'elle soit à la fois un déclencheur et un amplificateur.
  - **Cataclysme de l'âme : −3 points** (contre +4 pour 3 talents). Bien jouée : 36 dégâts répartis sur 2,2 ennemis pour 2 énergie et 2,7 éclats. Mais les éclats se gardent d'un combat à l'autre : les dépenser tous coûte cher pour la suite de la run. **Tout l'arbre Destruction est faible** (3 talents n'y valent que +4) : le problème dépasse la carte.
  - **Piste :** revoir l'arbre Destruction en premier. Pour la carte : « dépense jusqu'à 3 éclats », ou rend 1 éclat par ennemi tué.
  - **Fait (novembre 2026), arbres à peu près équivalents :** Tempête d'afflictions coûte 1 et prolonge les DoT de 1 tour ; Cataclysme de l'âme ne dépense plus les éclats (5 dégâts par éclat possédé ; en les dépensant, il faisait perdre 16 points à la Destruction) ; Corruption améliorée vaut pour tous les DoT ; Contagion naturelle allonge aussi les DoT de 1 tour ; Trait de l'ombre amélioré passe à +5.
  - **Attention aux mesures :** le bot ne sait pas utiliser Amplifier la malédiction (palier 3 A d'Affliction). Avec Spirale mortelle (palier 3 B), l'Affliction est bien plus forte : on mesure donc avec B.
  - **Résultat (150 runs, meilleur complément) :** Affliction 7 + Démonologie 3 **66 %**, Démonologie 7 + Destruction 3 **59 %**, Destruction 7 + Démonologie 3 **65 %** (avant, avec l'option A partout : 9, 48 et 19 %).

---

## 12. Ce qui est en jeu dans le prototype

- **Le familier** se choisit au premier tour de chaque combat, avant de jouer une carte (Diablotin ou Rôdeur du néant). Le jeu retient le dernier choix.
- **Le Verrou magique** du Molosse infernal est automatique : il interrompt la première Incantation interruptible, tous les 3 tours.
- **La Malédiction de lignée** de Vhaeryx (2 tours) : le Diablotin, la Succube ou le Molosse t'attaquent (sans les bonus que tu leur donnes), et le Rôdeur cesse de te protéger.
- **Le Bâton du Veilleur** : le Fragment tombe sur Zhaal, la Tête s'obtient à l'observatoire en ruine (−8 PV max), et le Démoniste le scelle au feu de camp avec **3 éclats d'âme**.
