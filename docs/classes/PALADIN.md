# Classe : le Paladin (refonte « Puissance sacrée »)

> Wipe & Loot · Fiche de classe · **Version 0.3, concept à tester** (26 novembre 2026 ; points tranchés le 27 novembre 2026)
> **En jeu depuis le 27 novembre 2026** (test de concept). Elle remplace la version 0.2 (Sceaux et Jugement), gardée dans `PALADIN_V2_SCEAUX.md`.
> Les chiffres sont **indicatifs** : ils serviront de base au test de concept et aux passes du bot.

---

## 0. Pourquoi une refonte

La version 0.2 empile quatre systèmes : 6 Sceaux (un bonus permanent et un effet de Jugement chacun), le Jugement qui les consomme, les Auras en Pouvoir et la Censure. Cela fait beaucoup de règles pour une classe ⭐, et un équilibrage difficile (Double sceau avec Verdict des cieux, Juste châtiment, cartes épiques à reprendre).

La version 0.3 garde le thème (chevalier sacré, Jugement, Auras, tueur de Morts-vivants et de Démons) et le ramène à **une jauge et un choix d'Aura** :

- **on dépense de l'énergie pour gagner de la Puissance sacrée** ;
- **on dépense la Puissance sacrée pour infliger des dégâts, soigner ou bloquer** ;
- **l'Aura (fixe, comme les Postures du Guerrier) décide de ce qui est renforcé**.

---

## 1. Identité

> *« La Lumière ne se prie pas. Elle se gagne, coup après coup. »*

- **Rôle :** hybride : dégâts, tank ou soins selon les talents.
- **Richesse du jeu :** ⭐ Simple.
- **Déblocage :** par l'expérience.
- **Fantasme de jeu :** remplir sa jauge de Lumière en frappant, bloquant ou soignant, puis la libérer au bon moment, sous la bonne Aura.

| Statistique | Valeur |
|---|---|
| **PV max** | 80 |
| **Énergie** | 3 par tour |
| **Ressource de classe** | Puissance sacrée (0 à 5) |
| **Aura de départ** | Aura de dévotion |
| **Sort de barre de départ** | Jugement (générateur) |

Le **tag d'ennemi Mort-vivant / Démon** est conservé, sans changement.

---

## 2. Mécanique 1 : la Puissance sacrée (PS)

| Règle | Valeur |
|---|---|
| Jauge | **0 à 5** (le surplus est perdu) |
| Début du combat | 0 |
| D'un tour à l'autre | elle reste, elle ne baisse pas |
| Fin du combat | elle est perdue |

**La gagner :**

| Source | Gain |
|---|---|
| Cartes **génératrices**, marquées **✦** sur la carte | ✦1 ou ✦2 |
| Le sort de barre **Jugement** | ✦2 |
| L'effet passif de l'**Aura active** (§3) | 1 par tour au plus |

**La dépenser :** les cartes **Dépense** (bandeau doré, comme « Finisher » pour le Voleur).
- Elles coûtent **toujours 3 PS et 0 énergie**.
- Avec un plafond à 5, on peut garder 2 PS en réserve pour enchaîner deux Dépenses au tour suivant.
- Une Dépense ne peut pas être jouée avec moins de 3 PS (carte grisée, raison : « Il faut 3 Puissance sacrée »).

**L'intérêt :** l'énergie produit la PS, la PS produit l'effet. Chaque tour pose une question simple : « je dépense maintenant, ou je garde pour la prochaine attaque du boss ? ».

**En quoi c'est différent :**
- **Voleur** : ses finishers consomment *tous* les points de combo. Ici le coût est fixe (3), et la Dépense peut protéger autant qu'attaquer.
- **Guerrier** : la rage s'ajoute au coût en énergie et se gagne en encaissant ; la pleine rage se vide d'un coup. Ici les Dépenses ne coûtent pas d'énergie, leur coût est fixe, et la PS se gagne selon l'Aura (bloquer, frapper ou soigner).

---

## 3. Mécanique 2 : les Auras (fixes)

Le Paladin a **toujours une Aura active** parmi trois. Elles sont toutes disponibles dès le départ, comme les Postures du Guerrier.

| Aura | Génération passive | Bonus des Dépenses | Contrepartie |
|---|---|---|---|
| 🛡️ **Dévotion** (départ) | +1 PS la 1re fois par tour qu'une attaque ennemie est **entièrement bloquée** | **+4 blocage** | Aucune |
| ⚔️ **Vindicte** | +1 PS à ta **1re Attaque** de chaque tour | **+4 dégâts** | Tes soins sont réduits de 30 % |
| ✨ **Concentration** | +1 PS à ton **1er soin** de chaque tour | **+3 PV de soin** | Tes Attaques infligent 20 % de dégâts en moins |

**Changer d'Aura :**
- avec le bouton d'Aura à côté du héros ;
- le **1er changement de chaque tour est gratuit** ; **chaque changement de plus ce tour-ci coûte 1 énergie** ;
- **la PS est conservée** quand on change d'Aura (comme la rage du Guerrier depuis le 27 novembre 2026) ;
- le bonus d'une Aura s'applique à toute Dépense jouée pendant qu'elle est active, quelle que soit la Dépense.

**Le bonus s'ajoute à l'effet de la Dépense, en plus.** Exemple : *Verdict du templier* (18 dégâts) sous Dévotion inflige 18 dégâts **et** donne 4 blocage ; sous Vindicte, il inflige 22 dégâts.

**L'Aura de résistance** (Zones de feu) n'est plus une Aura : elle devient la carte *Résistance sacrée* du tronc commun (§5.1).

---

## 4. Deck de départ et barre de sorts

### 4.1 Deck de départ (10 cartes)

| Carte | Qté | Coût | Type | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Frappe** | 4 | 1 | Attaque | Inflige 6 dégâts. | 9 dégâts |
| **Parade** | 3 | 1 | Compétence | Gagne 6 blocage. | 9 blocage |
| **Frappe du croisé** | 2 | 1 | Attaque | Inflige 6 dégâts. ✦1 | 9 dégâts |
| **Parole de lumière** | 1 | 0 + 3 PS | Dépense | Selon l'Aura : 9 blocage, 8 dégâts ou 7 PV de soin. | 12 / 11 / 10 |

**Selon l'arbre principal (décidé le 27 novembre 2026, comme le Guerrier)** : l'arbre qui a strictement le plus de points choisit l'Aura de départ et change une carte du paquet (`starterSwaps`, et une Aura de départ sur le modèle de `startPosture`). Sans arbre principal (aucun talent ou égalité) : Dévotion et le paquet ci-dessus.

| Arbre principal | Aura de départ | Carte changée |
|---|---|---|
| Vindicte | Vindicte | 1 Parade → Ferveur |
| Protection | Dévotion | 1 Frappe → Pavois sacré |
| Sacré | Concentration | 1 Frappe → Horion sacré |

**Parole de lumière** est la carte emblème : la seule Dépense « universelle ». Sous Dévotion elle donne du blocage, sous Vindicte elle inflige des dégâts, sous Concentration elle soigne (le bonus d'Aura s'ajoute : 13 blocage, 12 dégâts ou 10 PV). Elle demande une cible seulement sous Vindicte.

### 4.2 Sort de barre de départ

| Sort | Coût | Recharge | Effet |
|---|---|---|---|
| **Jugement** | 0 | 2 tours | Inflige 5 dégâts. ✦2 |

**Ouverture typique (tour 1) :** Jugement (2 PS), Frappe du croisé (3 PS), Parole de lumière sous Dévotion (13 blocage), Frappe, Parade.

**Rythme visé :** environ 3 à 4 PS par tour (Jugement 1 en moyenne, Aura 1, générateurs 1 à 2), soit **une Dépense par tour**, parfois deux.

---

## 5. Les cartes (51)

**Légende :** C = Commune · PC = Peu commune · R = Rare · É = Épique (palier 5). **✦n** = gagne n PS. Toutes les Dépenses coûtent **0 énergie + 3 PS** (sauf mention).

### 5.1 Tronc commun (9 cartes)

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Frappe du croisé** | 1 | Attaque | C | Inflige 6 dégâts. ✦1 | 9 dégâts |
| **Parole de lumière** | 3 PS | Dépense | C | Selon l'Aura : 9 blocage, 8 dégâts ou 7 PV de soin. | 12 / 11 / 10 |
| **Bouclier de la foi** | 1 | Compétence | C | Gagne 6 blocage. ✦1 | 9 blocage |
| **Lumière bienfaisante** | 1 | Compétence | C | Soigne 5 PV. ✦1 | 8 PV |
| **Exorcisme** | 1 | Sort | C | Inflige 8 dégâts, 16 contre un Mort-vivant ou un Démon. | 11 / 22 |
| **Prière du croisé** | 0 | Compétence | PC | ✦1. **Éphémère.** | Pioche aussi 1 carte |
| **Colère sacrée** | 2 | Sort | PC | Inflige 6 dégâts à tous, doublés contre les Morts-vivants et les Démons. | 9 dégâts |
| **Résistance sacrée** | 1 | Compétence | PC | 2 tours : Zones de feu et DoT ennemis t'infligent 50 % de moins. | Coûte 0 |
| **Bénédiction de puissance** | 1 | Pouvoir | R | Ta 1re Dépense de chaque tour a +3 à son effet. | Inné |

### 5.2 Arbre Vindicte (14 cartes) : la croisade

**Dépenses :** dégâts sur une cible, dégâts de zone, exécution.

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Verdict du templier** | 3 PS | Dépense | C | Inflige 18 dégâts. | 24 dégâts |
| **Tempête divine** | 3 PS | Dépense | PC | Inflige 9 dégâts à tous les ennemis. | 12 dégâts |
| **Sentence** | 3 PS | Dépense | R | Inflige 12 dégâts, triplés si la cible a 20 % de PV ou moins. | 16 dégâts |
| **Lame de justice** | 2 | Attaque | C | Inflige 12 dégâts. ✦2 | 16 dégâts |
| **Ferveur** | 1 | Attaque | C | Inflige 4 dégâts 2 fois. ✦1 | 6 × 2 |
| **Frappe divine** | 2 | Attaque | C | Inflige 16 dégâts. | 21 dégâts |
| **Tourbillon sacré** | 2 | Attaque | C | Inflige 6 dégâts à tous les ennemis. ✦1 | 9 dégâts |
| **Marteau de courroux** | 1 | Attaque | PC | Inflige 8 dégâts. ✦2 si la cible a 20 % de PV ou moins. | 11 dégâts |
| **Zèle** | 1 | Pouvoir | PC | Chaque Dépense te donne 1 Puissance (5 au plus). | Inné |
| **Art de la guerre** | 1 | Pouvoir | PC | Après ta 2e Attaque de chaque tour, ✦1. | Coûte 0 |
| **Repentance** | 1 | Compétence | R | La cible (sauf boss) est **Contrôlée** 2 tours. **Épuisé.** | 3 tours |
| **Croisade** | 2 | Pouvoir | R | Tes Attaques infligent +2 dégâts, +4 contre Morts-vivants et Démons. | Coûte 1 |
| **Vengeance** | 1 | Pouvoir | R | Quand tu tues un ennemi : gagne 1 Puissance. ✦1 | Coûte 0 |
| **Courroux vengeur** | 2 | Compétence | É | 3 tours : tes cartes ✦ donnent 1 PS de plus, tes Dépenses +4 dégâts. **Épuisé.** | Coûte 1 |

### 5.3 Arbre Protection (14 cartes) : le rempart

**Dépenses :** blocage immédiat (avec dégâts), défense qui grandit pendant le combat, riposte.

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Bouclier du vertueux** | 3 PS | Dépense | C | Gagne 14 blocage. Inflige 4 dégâts à tous les ennemis. | 18 / 6 |
| **Rempart de lumière** | 3 PS | Dépense | PC | Gagne 6 blocage et 2 Robustesse (pour ce combat). | 9 / 3 |
| **Juste châtiment** | 3 PS | Dépense | R | Inflige les dégâts que tu as bloqués depuis ton dernier tour. | +5 dégâts |
| **Pavois sacré** | 1 | Compétence | C | Gagne 7 blocage. ✦1 | 10 blocage |
| **Bouclier béni** | 2 | Compétence | C | Gagne 15 blocage. | 20 blocage |
| **Marteau de piété** | 1 | Attaque | C | Inflige 5 dégâts à tous. Gagne 4 blocage. ✦1 | 7 / 5 |
| **Résolution sacrée** | 1 | Compétence | C | Gagne 6 blocage. **Dissipation (Magie).** | 9 blocage |
| **Garde vigilante** | 0 | Compétence | C | Gagne 4 blocage. **Éphémère.** | 6 blocage |
| **Consécration** | 2 | Sort | PC | À la fin de ce tour et du suivant, inflige 5 dégâts à tous. | 7 dégâts |
| **Bouclier lancé** | 1 | Attaque | PC | 7 dégâts, rebondit sur 2 ennemis. **Interruption** (1re cible). ✦1 | 10 dégâts |
| **Sanctuaire** | 1 | Pouvoir | PC | Chaque attaque ennemie t'inflige 1 dégât de moins. | 2 de moins |
| **Ferveur du gardien** | 1 | Pouvoir | PC | 1re attaque entièrement bloquée de chaque tour : ✦1 de plus. | Inné |
| **Dernier serment** | 1 | Pouvoir | R | 1re fois du combat sous 20 % de tes PV max : soigne 15 PV. | Coûte 0 |
| **Gardien des rois** | 2 | Pouvoir | É | Tes Dépenses donnent +6 blocage. Toute attaque bloquée renvoie 3 dégâts. | Coûte 1 |

### 5.4 Arbre Sacré (14 cartes) : la lumière

**Dépenses :** gros soin, soin et dégâts de zone, soin et blocage.

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Mot de gloire** | 3 PS | Dépense | C | Soigne 14 PV. | 18 PV |
| **Aurore sacrée** | 3 PS | Dépense | PC | Soigne 8 PV. Inflige 6 à tous (12 aux Morts-vivants et Démons). | 10 / 8 |
| **Égide de lumière** | 3 PS | Dépense | R | Soigne 8 PV. Gagne autant de blocage que le soin. | 11 PV |
| **Horion sacré** | 1 | Sort | C | Sous la moitié de tes PV : soigne 7 PV. Sinon : 7 dégâts. ✦1 | 10 |
| **Lumière sacrée** | 2 | Compétence | C | Soigne 14 PV. ✦1 | 19 PV |
| **Éclair de foi** | 1 | Sort | C | Inflige 6 dégâts. Soigne 3 PV. ✦1 | 9 / 4 |
| **Main sacrée** | 1 | Compétence | C | Gagne 6 blocage. Soigne 4 PV. | 8 / 6 |
| **Lueur protectrice** | 0 | Compétence | C | Gagne 3 blocage. Pioche 1 carte. | 5 blocage |
| **Lumière purificatrice** | 1 | Compétence | PC | **Dissipation de tous les types.** Soigne 3 PV. | Coûte 0 |
| **Faveur divine** | 0 | Compétence | PC | Ta prochaine Dépense ce tour-ci a son effet doublé. **Épuisé.** | ✦1 aussi |
| **Rayonnement** | 1 | Pouvoir | PC | Chaque fois que tu te soignes, inflige 2 dégâts à tous les ennemis. | 3 dégâts |
| **Grâce du croisé** | 1 | Pouvoir | PC | Au début de ton tour, soigne 2 PV. | 3 PV |
| **Illumination** | 1 | Pouvoir | R | 1re Dépense de chaque tour : gagne 1 énergie. | Inné |
| **Avatar de lumière** | 3 | Pouvoir | É | Tes soins +25 %. La moitié de chaque soin frappe un ennemi au hasard. | Coûte 2 |

---

## 6. La barre de sorts

| Sort | Coût | Recharge | Effet | Source principale |
|---|---|---|---|---|
| **Jugement** | 0 | 2 tours | Inflige 5 dégâts. ✦2 | Départ |
| **Imposition des mains** | 0 | 1 fois par combat | Sous 30 % de tes PV : soigne 30 % de tes PV max. | Talent Sacré, palier 3 |
| **Purification** | 0 | 3 tours | **Dissipation (Magie, Poison, Maladie).** | Talent Sacré, palier 3 |
| **Bouclier divin** | 1 | 7 tours | Immunisé à tous les dégâts jusqu'à ton prochain tour. Tes Attaques –50 % ce tour-ci. | Talent Protection, palier 3 |
| **Marteau du jugement** | 1 | 4 tours | Inflige 6 dégâts. **Interruption.** Cible (sauf boss) Contrôlée 1 tour. | Talents Protection et Vindicte, palier 3 |
| **Ailes de justice** | 0 | 6 tours | Gagne 2 Puissance pendant 3 tours. ✦1 | Talent Vindicte, palier 3 |

**Sorts de loot :** *Bénédiction de sauvegarde* (12 blocage et Dissipation Poison, recharge 4), *Charge sacrée* (8 dégâts, ✦1, recharge 3), *Lumière de l'aube* (Dissipation de tous les types et 6 PV, une fois par combat).

---

## 7. Les talents

Chaque arbre joue sur **trois leviers seulement** : la génération de PS, la puissance des Dépenses, et ce qui se passe à 5 PS.

### 7.1 Arbre Vindicte

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Précision** : commence chaque combat avec 1 Puissance. | **Élan sacré** : commence chaque combat avec 1 PS. |
| **2** | **Conviction** : tes Attaques infligent +3 dégâts aux Morts-vivants et aux Démons. | **Jugement aiguisé** : Jugement inflige 8 dégâts (au lieu de 5). |
| **3** | **Ailes de justice** : ajoute ce sort à ta barre. | **Marteau du jugement** : ajoute ce sort à ta barre. |
| **4** | **Fin de l'ère** : à 5 PS, une Dépense peut prendre les 5 PS pour **doubler** son effet. | **Vengeance divine** : après un Jugement, ta prochaine Attaque inflige +4 dégâts. |
| **5** | **Courroux vengeur** (carte épique) | — |

### 7.2 Arbre Protection

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Bouclier amélioré** : tes cartes de blocage donnent +1 blocage. | **Robustesse** : +8 PV max. |
| **2** | **Garde sacrée** : commence chaque combat avec 8 blocage. | **Jugement du croisé** : Jugement donne aussi 5 blocage. |
| **3** | **Bouclier divin** : ajoute ce sort à ta barre. | **Marteau du jugement** : ajoute ce sort à ta barre. |
| **4** | **Ardent défenseur** : chaque Dépense te donne 2 Robustesse jusqu'à la fin du tour. | **Rétribution** : Juste châtiment ne coûte que 2 PS. |
| **5** | **Gardien des rois** (carte épique) | — |

### 7.3 Arbre Sacré

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Lumière améliorée** : tes cartes de soin rendent +2 PV. | **Esprit divin** : +6 PV max. |
| **2** | **Purification rapide** : Lumière purificatrice coûte 0. | **Sagesse** : Jugement te soigne aussi de 3 PV. |
| **3** | **Imposition des mains** : ajoute ce sort à ta barre. | **Purification** : ajoute ce sort à ta barre. |
| **4** | **Lumière infusée** : ta 1re Dépense de chaque tour te rend 1 PS. | **Quatrième emplacement** : ta barre de sorts gagne un 4e emplacement. |
| **5** | **Avatar de lumière** (carte épique) | — |

---

## 8. Le légendaire : l'Aurore ardente

La quête ne change pas (voir `PALADIN_V2_SCEAUX.md` §8 et §12). Seul l'effet change :

| Emplacement | Effet |
|---|---|
| **Arme** (légendaire) | Tes Dépenses infligent **double dégâts** aux Morts-vivants et aux Démons, et **te soignent de 5 PV**. |

---

## 9. Les builds

| Build | Arbres | Aura principale | Cartes clés | Plan de jeu |
|---|---|---|---|---|
| **Le Croisé** | Vindicte | Vindicte | Verdict du templier, Lame de justice, Zèle, Courroux vengeur | Générer vite, dépenser chaque tour, garder 5 PS pour Fin de l'ère sur le boss. |
| **Le Rempart** | Protection | Dévotion | Bouclier du vertueux, Rempart de lumière, Juste châtiment, Gardien des rois | Bloquer entièrement pour générer, empiler la Robustesse, renvoyer les coups. |
| **Le Lumineux** | Sacré | Concentration | Mot de gloire, Rayonnement, Illumination, Avatar de lumière | Chaque soin génère, et chaque soin fait des dégâts. |
| **Le Juge** | Vindicte + Protection | Dévotion, puis Vindicte | Parole de lumière, Bouclier lancé, Verdict du templier | Encaisser l'attaque annoncée en Dévotion, passer en Vindicte le tour où l'on frappe. |

---

## 10. Forces et faiblesses face aux mécaniques de raid

| Mécanique | Le Paladin… |
|---|---|
| **Survie** | ✅✅ 80 PV, Dépenses de blocage ou de soin au choix, Bouclier divin, Imposition des mains. |
| **Dissipation** | ✅ Lumière purificatrice, Purification, Résolution sacrée. |
| **Interruption** | ✅ Marteau du jugement, Bouclier lancé. |
| **Morts-vivants et Démons** | ✅✅ Exorcisme, Colère sacrée, Aurore sacrée, Croisade, l'Aurore ardente. |
| **Zones de feu** | ✅ Résistance sacrée. |
| **Enrage timer** | ➖ Correct, fort en Vindicte (Fin de l'ère). |
| **Adds** | ➖ Tempête divine, Tourbillon sacré, Consécration, Marteau de piété, Colère sacrée. |
| **Malédiction de lignée** (Vhaeryx, 2 tours) | Ta PS tombe à 0 et tu n'en génères plus. |

---

## 11. Équilibrage : la grille de référence

Toute la classe se règle avec **un seul taux de conversion** :

| Grandeur | Valeur de référence |
|---|---|
| 1 énergie | environ 7 points d'effet (comme les autres classes) |
| 1 PS | environ 3 points d'effet |
| Générateur à 1 énergie | 6 points d'effet + ✦1 |
| Dépense de base (Parole de lumière) | 8 à 9 points + le bonus d'Aura (+3 ou +4) |
| Dépense d'arbre | 14 à 18 points, sur un seul type d'effet |

Si une spécialisation est trop forte, on ne touche qu'**un chiffre** : le bonus d'Aura, la génération passive, ou la valeur de la Dépense phare.

**Bot :** valeur de la PS dans `evaluate()` (environ 3 par point, un peu moins à 5 puisque le surplus est perdu). Règle simple pour le profil : dépenser dès 3 PS ; passer en Dévotion si une attaque ennemie est annoncée et que le blocage ne suffit pas ; sinon, Aura de l'arbre principal. Cibles habituelles (CLAUDE.md, recette « Ajouter une classe », point 11).

---

## 12. Notes de conception et points à surveiller

- **Trop de souplesse ?** Changer d'Aura sans perdre de PS peut rendre le Paladin bon partout. Le coût de 1 énergie dès le 2e changement du tour devrait suffire ; sinon, le 1er changement fera perdre 1 PS.
- **Dépenses à 0 énergie :** avec beaucoup de génération (Courroux vengeur, Art de la guerre, Ferveur), surveiller le nombre de Dépenses par tour. Le plafond à 5 limite déjà à deux Dépenses d'affilée ; si besoin, limite de 2 Dépenses par tour.
- **Fin de l'ère + Faveur divine (décidé le 27 novembre 2026) :** pas de cumul. Une Dépense n'est doublée qu'une fois ; si Fin de l'ère la double déjà, Faveur divine reste en attente pour la Dépense suivante du tour (elle se perd en fin de tour). L'aperçu de la carte le montre.
- **Juste châtiment** reste à surveiller après un gros tour de blocage (il était déjà signalé en 0.2).
- **Les 3 Dépenses par arbre** donnent de la diversité : chaque arbre a une Dépense de base, une de zone ou de durée, et une rare plus situationnelle. Avec Parole de lumière, un paquet a jusqu'à 4 Dépenses possibles, et le choix des récompenses compte.
- **Ce qui disparaît** par rapport à la 0.2 : les 6 Sceaux, la Censure, Double sceau, Inquisition, Exaltation, Science du combat, Bénédiction royale, Aube purificatrice, Bouclier du croisé, Verdict des cieux, les Auras en Pouvoir (Dévotion, Résistance, Épines sacrées).

---

## 13. Pour le test de concept (fait le 27 novembre 2026)

1. Ressource `ps` (0 à 5) sur le joueur, et les mots-clés ✦ et « Dépense » (bandeau doré, raison de carte grisée).
2. Bouton d'Aura (1 changement gratuit par tour, puis 1 énergie), avec trois emblèmes ; sous la barre de PV, une jauge de 5 losanges dorés.
3. Les 51 cartes, les 6 sorts, les 15 talents (`classes.ts`, cartes, `spells.ts`, `talents.ts`, `talent_icons.ts`).
4. Tutoriel du Paladin (`CLASS_STEPS`) : 3 bulles (la jauge, les Dépenses, le bouton d'Aura).
5. Bot : valeur de la PS et choix de l'Aura, puis 200 runs par profil (Vindicte, Protection, Sacré, et un hybride), notées dans `EQUILIBRAGE.md`.
6. **Conversion (décidé le 27 novembre 2026)** : une expédition en cours avec l'ancien Paladin est convertie (étape de `migrate()` dans `save.ts`). Chaque ancienne carte devient sa plus proche cousine, amélioration gardée : Sceaux de droiture, du croisé → Parole de lumière ; Sceau du rempart → Bouclier du vertueux ; Sceau de vengeance → Verdict du templier ; Sceaux de lumière, de sagesse → Mot de gloire ; Auras de dévotion, d'épines sacrées → Rempart de lumière ; Aura de résistance → Résistance sacrée ; Inquisition, Exaltation → Prière du croisé ; Science du combat → Art de la guerre ; Bénédiction royale → Bénédiction de puissance ; Aube purificatrice → Aurore sacrée ; Bouclier du croisé → Gardien des rois ; Verdict des cieux → Courroux vengeur. Les sorts disparus quittent la barre, et les points de talent du Paladin sont rendus (profil), avec le message « Le Paladin a changé : replace tes talents ».
7. **Publication (décidé le 27 novembre 2026)** : sur `dev` et `playtest` ensemble, dès que les tests sont verts et qu'une première passe du bot (niveau 1 contre Vulkhar, 50 runs) ne montre rien d'aberrant ; news pour les testeurs. Les réglages fins suivront leurs retours.

---

## 14. Ce qui est en jeu (27 novembre 2026)

**Le code :** `src/engine/paladin.ts` (Puissance sacrée, Auras, Dépenses), `cards_paladin.ts` (53 cartes avec Frappe et Parade ; `OLD_PALADIN_CARDS` pour la conversion), sorts dans `spells.ts`, arbres dans `talents.ts`, Aura de départ `startAura` dans `run.ts`, paquet de départ `starterSwaps` dans `classes.ts`, conversion dans `save.ts` (run version 29, profil version 9), tests dans `tests/paladin.test.ts`.

**Les règles précisées en codant :**
- **Une Dépense** a le champ `holyCost` (3). Les Dépenses qui font des dégâts (Verdict du templier, Tempête divine, Sentence, Juste châtiment) sont des **Attaques** : Croisade, Conviction et la contrepartie de Concentration (−20 %) s'y appliquent. Les autres sont des Compétences.
- **Le bonus d'Aura** arrive après l'effet de la Dépense, une fois (même doublée) : Dévotion +4 blocage, Concentration +3 PV, Vindicte un coup de 4 dégâts sur la cible (sur tous les ennemis pour une Dépense de zone : Tempête divine, Bouclier du vertueux, Aurore sacrée). **Sous Vindicte, une Dépense sans cible en demande une** (Parole de lumière, Mot de gloire…).
- **Le gain passif d'Aura** : 1 par tour au plus. Concentration compte un soin lancé même à PV pleins. Dévotion compte une attaque entièrement bloquée pendant le tour ennemi. Ferveur du gardien s'y ajoute (2 pour la même attaque).
- **Fin de l'ère** est automatique : une Dépense jouée à 5 PS les prend toutes. **Faveur divine** attend alors la Dépense suivante du tour ; elle se perd en fin de tour.
- **Courroux vengeur** : les cartes ✦ (et Marteau de courroux, Faveur divine+) donnent 1 de plus ; les coups des Dépenses +4 dégâts. Le Jugement n'est pas une carte ✦.
- **Bénédiction de puissance** : +3 au bonus d'Aura de la 1re Dépense du tour.
- **Égide de lumière** : le blocage suit le soin prévu, même à PV pleins.
- **Le Jugement** n'est plus touché par une recharge réduite (Jugements rapides disparaît) : recharge 2.
- **Illustrations** : les 19 nouvelles cartes reprennent les dessins des 19 cartes retirées (`tools/pixel/illustrations_paladin.py`, fonctions renommées). À redessiner plus tard pour certaines (Tempête divine garde le dessin du Sceau du croisé).
- **Interface** : sous la barre de PV, la jauge « SACRÉE » (5 losanges), les 3 boutons d'Aura (comme les Postures) et une ligne d'aide ; un losange doré montre le coût en PS sur les Dépenses ; pastilles Faveur divine, Courroux, Résistance, Ardent défenseur. Tuto : 3 bulles (jauge, Dépense, Aura).
- **Conversion** : la carte la plus proche (§13), amélioration gardée, aussi dans un combat en cours (PS à 0, Dévotion) ; les talents de la run suivent (Double sceau → Fin de l'ère…). Le profil rend les points de talent du Paladin ; un message « Le Paladin a changé » s'affiche une fois dans le hall.
- **Le bot** : la PS vaut environ 3 par point ; il change d'Aura seulement quand c'est gratuit, selon sa main (Dépenses à venir, Attaques, soins, coup annoncé).
