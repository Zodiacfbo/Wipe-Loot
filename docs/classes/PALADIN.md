# Classe : le Paladin

> Wipe & Loot · Fiche de classe · Version 0.2 (jouable dans le prototype)
> Les chiffres sont **indicatifs** : ils serviront de base aux premiers tests d'équilibrage.

---

## 1. Identité

> *« Par la lumière, je juge. Par l'acier, j'exécute la sentence. »*

Le Paladin est un **guerrier sacré** en armure lourde. Il imprègne ses armes de **Sceaux** de lumière, puis les libère dans un **Jugement**. Il est solide, se soigne lui-même, retire les maux qui l'affligent, et il est le pire ennemi des **morts-vivants** et des **démons**.

- **Rôle :** hybride : dégâts, tank ou survie selon les talents.
- **Difficulté :** ⭐ Facile.
- **Déblocage :** par l'expérience.
- **Fantasme de jeu :** un chevalier presque indestructible qui marche sur la Nécropole en frappant les morts-vivants à coups de Jugements.

| Statistique | Valeur |
|---|---|
| **PV max** | 80 |
| **Énergie** | 3 par tour |
| **Ressource de classe** | Sceau actif (un seul à la fois) |
| **Aura** | Une seule aura active à la fois |
| **Sort de barre de départ** | Jugement |

**Nouveau tag d'ennemi :** certains ennemis sont **Mort-vivant** ou **Démon**. Plusieurs cartes de Paladin sont plus fortes contre eux. Ces tags sont fréquents dans l'acte bonus (la Nécropole céleste).

---

## 2. Mécanique 1 : les Sceaux et le Jugement

- Une carte **Sceau** (1 énergie) active un **Sceau** sur le Paladin. Un seul Sceau à la fois : en activer un nouveau remplace l'ancien.
- Tant qu'un Sceau est actif, il donne un **bonus permanent** aux Attaques.
- Le sort de barre **Jugement** (recharge 2) **consomme** le Sceau actif pour déclencher son **effet de Jugement**. Il faut ensuite activer un nouveau Sceau.

| Sceau | Bonus tant qu'il est actif | Effet du Jugement |
|---|---|---|
| **Sceau de droiture** (base) | Tes Attaques infligent +3 dégâts. | Inflige 10 dégâts. |
| **Sceau du croisé** (base) | Tes Attaques infligent +1 dégât par Attaque déjà jouée ce tour. | La cible reçoit Armure fracassée 2 tours. |
| **Sceau de lumière** (base) | Tes Attaques te soignent de 2 PV. | Soigne 8 PV. |
| **Sceau de sagesse** (Sacré) | Pioche 1 carte de plus au début de ton tour. | Gagne 1 énergie. |
| **Sceau du rempart** (Protection) | Tes Attaques te donnent 3 blocage. | Gagne 12 blocage. |
| **Sceau de vengeance** (Vindicte) | Tes Attaques appliquent 1 cumul de **Censure** (Saignement 1 qui s'accumule). | Inflige 5 dégâts par cumul de Censure sur la cible. |

**L'intérêt :** un cycle simple et satisfaisant : poser un Sceau, frapper avec, puis le juger au meilleur moment.

---

## 3. Mécanique 2 : les Auras

- Les cartes **Aura** sont des Pouvoirs. **Une seule Aura active à la fois** : en jouer une nouvelle remplace l'ancienne.
- Elles donnent un bonus passif pour tout le combat.

| Aura | Effet |
|---|---|
| **Aura de dévotion** | Gagne 2 Robustesse. |
| **Aura de résistance** | Les cartes Zone de feu et les DoT ennemis t'infligent 50 % de dégâts en moins. |
| **Aura d'épines sacrées** | Chaque fois qu'un ennemi t'attaque, il subit 3 dégâts. |

**L'intérêt :** l'Aura s'adapte au combat. L'Aura de résistance est faite pour les Profondeurs Ardentes et leurs zones de feu.

---

## 4. Deck de départ et barre de sorts

### 4.1 Deck de départ (10 cartes)

| Carte | Qté | Coût | Type | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Frappe** | 4 | 1 | Attaque | Inflige 6 dégâts. | 9 dégâts |
| **Parade** | 4 | 1 | Compétence | Gagne 5 blocage. | 8 blocage |
| **Sceau de droiture** | 1 | 1 | Compétence (Sceau) | Active le Sceau de droiture. | Coûte 0 |
| **Lumière bienfaisante** | 1 | 1 | Compétence | Soigne 5 PV. | 8 PV |

### 4.2 Sort de barre de départ

| Sort | Coût | Recharge | Effet |
|---|---|---|---|
| **Jugement** | 0 | 2 tours | Consomme ton Sceau actif et déclenche son effet de Jugement. Sans Sceau actif, inflige seulement 4 dégâts. |

---

## 5. Les cartes (51)

**Légende des raretés :** C = Commune · PC = Peu commune · R = Rare · É = Épique (débloquée par le dernier palier de talent de son arbre).

### 5.1 Tronc commun (9 cartes)

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Sceau de droiture** | 1 | Compétence (Sceau) | C | Active le Sceau de droiture. | Coûte 0 |
| **Sceau du croisé** | 1 | Compétence (Sceau) | C | Active le Sceau du croisé. | Coûte 0 |
| **Frappe du croisé** | 1 | Attaque | C | Inflige 8 dégâts. | 11 dégâts |
| **Exorcisme** | 1 | Sort | C | Inflige 9 dégâts, ou 18 contre un Mort-vivant ou un Démon. | 12 / 24 |
| **Lumière bienfaisante** | 1 | Compétence | C | Soigne 5 PV. | 8 PV |
| **Aura de dévotion** | 1 | Pouvoir (Aura) | C | Gagne 2 Robustesse. | 3 Robustesse |
| **Sceau de lumière** | 1 | Compétence (Sceau) | PC | Active le Sceau de lumière. | Coûte 0 |
| **Aura de résistance** | 1 | Pouvoir (Aura) | PC | Les Zones de feu et les DoT ennemis t'infligent 50 % de dégâts en moins. | Coûte 0 |
| **Colère sacrée** | 2 | Sort | PC | Inflige 6 dégâts à tous les ennemis, doublés contre les Morts-vivants et les Démons. | 9 dégâts |

### 5.2 Arbre Sacré (14 cartes) : soins et lumière

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Lumière sacrée** | 2 | Compétence | C | Soigne 14 PV. | 19 PV |
| **Onde sacrée** | 1 | Sort | C | Au choix : inflige 8 dégâts **ou** soigne 8 PV. | 11 |
| **Main sacrée** | 1 | Compétence | C | Gagne 6 blocage. Soigne 4 PV. | 8 et 6 |
| **Lueur protectrice** | 0 | Compétence | C | Gagne 4 blocage. Pioche 1 carte. | 6 blocage |
| **Éclair de foi** | 1 | Sort | C | Inflige 7 dégâts. Soigne 3 PV. | 10 / 4 |
| **Sceau de sagesse** | 1 | Compétence (Sceau) | PC | Active le Sceau de sagesse. | Coûte 0 |
| **Faveur divine** | 0 | Compétence | PC | Ta prochaine carte de soin ou ton prochain Sort ce tour-ci a son effet **doublé**. **Épuisé.** | N'est plus Épuisé |
| **Lumière purificatrice** | 1 | Compétence | PC | **Dissipation de tous les types.** Soigne 3 PV. | Coûte 0 |
| **Rayonnement** | 1 | Pouvoir | PC | Chaque fois que tu te soignes, inflige 2 dégâts à tous les ennemis. | 3 dégâts |
| **Grâce du croisé** | 1 | Pouvoir | PC | Au début de ton tour, soigne 2 PV. | 3 PV |
| **Illumination** | 1 | Pouvoir | R | La première fois que tu te soignes à chaque tour, gagne 1 énergie. | Inné |
| **Bénédiction royale** | 1 | Pouvoir | R | Gagne 1 Puissance, 1 Robustesse et 3 PV max (pour ce combat). | 2 / 2 / 5 |
| **Aube purificatrice** | 2 | Sort | R | Soigne 10 PV. Inflige 10 dégâts à tous les Morts-vivants et Démons. | 14 / 14 |
| **Avatar de lumière** | 2 | Pouvoir | É | Tes soins sont augmentés de 50 %. Chaque soin inflige le même montant de dégâts à un ennemi au hasard. | Coûte 1 |

### 5.3 Arbre Protection (14 cartes) : le bouclier

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Bouclier béni** | 2 | Compétence | C | Gagne 15 blocage. | 20 blocage |
| **Pavois sacré** | 1 | Compétence | C | Gagne 8 blocage. Chaque attaque ennemie bloquée ce tour-ci inflige 3 dégâts à l'attaquant. | 11 / 4 |
| **Marteau de piété** | 1 | Attaque | C | Inflige 6 dégâts à tous les ennemis. Gagne 4 blocage. | 8 / 6 |
| **Résolution sacrée** | 1 | Compétence | C | Gagne 6 blocage. **Dissipation (Magie).** | 9 blocage |
| **Garde vigilante** | 0 | Compétence | C | Gagne 5 blocage. **Éphémère.** | 7 blocage |
| **Consécration** | 2 | Sort | PC | À la fin de ce tour et du suivant, inflige 5 dégâts à tous les ennemis. | 7 dégâts |
| **Bouclier lancé** | 1 | Attaque | PC | Inflige 7 dégâts à la cible, puis rebondit sur 2 autres ennemis. **Interruption** sur la première cible. | 10 dégâts |
| **Sceau du rempart** | 1 | Compétence (Sceau) | PC | Active le Sceau du rempart. | Coûte 0 |
| **Sanctuaire** | 1 | Pouvoir | PC | Chaque attaque ennemie t'inflige 1 dégât de moins. | 2 de moins |
| **Fervent** | 1 | Pouvoir | PC | Quand tu bloques entièrement une attaque, gagne 1 énergie à ton prochain tour (1 fois par tour). | Inné |
| **Aura d'épines sacrées** | 1 | Pouvoir (Aura) | PC | Chaque fois qu'un ennemi t'attaque, il subit 3 dégâts. | 5 dégâts |
| **Dernier serment** | 1 | Pouvoir | R | La première fois de ce combat que tu passerais sous 20 % de tes PV max, soigne 15 PV. | Coûte 0 |
| **Juste châtiment** | 1 | Attaque | R | Inflige des dégâts égaux au **total des dégâts que tu as bloqués** depuis ton dernier tour. | Coûte 0 |
| **Bouclier du croisé** | 2 | Compétence | É | Gagne 20 blocage. Jusqu'à ton prochain tour, chaque attaque bloquée inflige 6 dégâts à l'attaquant et te soigne de 2 PV. | 26 blocage |

### 5.4 Arbre Vindicte (14 cartes) : la croisade

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Lame de justice** | 1 | Attaque | C | Inflige 9 dégâts, +3 si un Sceau est actif. | 12 / +4 |
| **Ferveur** | 1 | Attaque | C | Inflige 5 dégâts 2 fois. | 7 × 2 |
| **Frappe divine** | 2 | Attaque | C | Inflige 16 dégâts. | 21 dégâts |
| **Inquisition** | 0 | Compétence | C | Active gratuitement un Sceau de base de ton choix. Pioche 1 carte. | Pioche 2 cartes |
| **Tourbillon sacré** | 2 | Attaque | C | Inflige 7 dégâts à tous les ennemis. | 10 dégâts |
| **Sceau de vengeance** | 1 | Compétence (Sceau) | PC | Active le Sceau de vengeance. | Coûte 0 |
| **Marteau du châtiment** | 1 | Attaque | PC | Inflige 10 dégâts, **triplés** si la cible a 20 % de PV ou moins. | 13 dégâts |
| **Zèle** | 1 | Pouvoir | PC | Chaque fois que tu actives un Sceau, gagne 1 Puissance (5 maximum). | Inné |
| **Science du combat** | 1 | Pouvoir | PC | Après ta 2ᵉ Attaque de chaque tour, ta prochaine carte de soin coûte 0. | Coûte 0 |
| **Exaltation** | 0 | Compétence | PC | Gagne 2 énergie. Ton Sceau actif est perdu (sans Jugement). | Gagne 3 énergie |
| **Repentance** | 1 | Compétence | R | La cible (sauf boss) est **Contrôlée** 2 tours. **Épuisé.** | 3 tours |
| **Vengeance** | 1 | Pouvoir | R | Chaque fois que tu tues un ennemi, gagne 1 Puissance. | Coûte 0 |
| **Croisade** | 2 | Pouvoir | R | Tes Attaques infligent +2 dégâts, +4 contre les Morts-vivants et les Démons. | Coûte 1 |
| **Verdict des cieux** | 2 | Attaque | É | Inflige 12 dégâts 2 fois. Déclenche l'effet de Jugement de ton Sceau actif **sans le consommer**. | 16 × 2 |

---

## 6. La barre de sorts

| Sort | Coût | Recharge | Effet | Source principale |
|---|---|---|---|---|
| **Jugement** | 0 | 2 tours | Consomme ton Sceau actif et déclenche son effet de Jugement. Sans Sceau actif, inflige seulement 4 dégâts. | Départ |
| **Imposition des mains** | 0 | 1 fois par combat | Soigne 50 % de tes PV max. | Talent Sacré, palier 3 |
| **Purification** | 0 | 3 tours | **Dissipation (Magie, Poison, Maladie).** | Talent Sacré, palier 3 |
| **Bouclier divin** | 1 | 6 tours | Tu es **immunisé à tous les dégâts** jusqu'à ton prochain tour. Tes Attaques infligent 50 % de dégâts en moins ce tour-ci. | Talent Protection, palier 3 |
| **Marteau du jugement** | 1 | 4 tours | Inflige 6 dégâts. **Interruption.** La cible (sauf boss) est Contrôlée 1 tour. | Talent Protection, palier 3 · Talent Vindicte, palier 3 |
| **Ailes de justice** | 0 | 6 tours | Gagne 2 Puissance pendant 3 tours. | Talent Vindicte, palier 3 |

**Sorts de barre dans les tables de loot** (exemples) : *Bénédiction de sauvegarde* (12 blocage et Dissipation Poison, recharge 4), *Charge sacrée* (8 dégâts et active le Sceau du croisé, recharge 3).

---

## 7. Les talents

### 7.1 Arbre Sacré

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Lumière améliorée** : tes soins rendent +2 PV. | **Esprit divin** : +6 PV max. |
| **2** | **Purification rapide** : Lumière purificatrice coûte 0. | **Sagesse accrue** : le Jugement du Sceau de sagesse donne 1 énergie de plus. |
| **3** | **Imposition des mains** : ajoute ce sort à ta barre. | **Purification** : ajoute ce sort à ta barre. |
| **4** | **Lumière bénie** : chaque soin te donne aussi la moitié de son montant en blocage. | **Quatrième emplacement** : ta barre de sorts gagne un 4ᵉ emplacement. |
| **5** | **Avatar de lumière** (carte épique) | — |

### 7.2 Arbre Protection

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Bouclier amélioré** : tes cartes de blocage donnent +2 blocage. | **Robustesse** : +8 PV max. |
| **2** | **Dévotion accrue** : Aura de dévotion donne 1 Robustesse de plus. | **Garde sacrée** : commence chaque combat avec 8 blocage. |
| **3** | **Bouclier divin** : ajoute ce sort à ta barre. | **Marteau du jugement** : ajoute ce sort à ta barre. |
| **4** | **Consécration durable** : Consécration dure 1 tour de plus. | **Rétribution** : Juste châtiment coûte 0. |
| **5** | **Bouclier du croisé** (carte épique) | — |

### 7.3 Arbre Vindicte

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Jugements rapides** : la recharge de Jugement passe à 1 tour. | **Précision** : commence chaque combat avec 1 Puissance. |
| **2** | **Sceaux bénis** : tous les Sceaux coûtent 0. | **Conviction** : tes Attaques infligent +3 dégâts aux Morts-vivants et aux Démons. |
| **3** | **Ailes de justice** : ajoute ce sort à ta barre. | **Marteau du jugement** : ajoute ce sort à ta barre. |
| **4** | **Vengeance divine** : après un Jugement, ta prochaine Attaque inflige +6 dégâts. | **Double sceau** : tu peux avoir **2 Sceaux actifs** en même temps. Jugement les consomme tous les deux. |
| **5** | **Verdict des cieux** (carte épique) | — |

---

## 8. Le légendaire : l'Aurore ardente

> *L'épée sacrée des Veilleurs de l'Aurore, ternie par la nécromancie. Elle attend qu'un cœur pur rallume sa flamme.*

| Emplacement | Effet |
|---|---|
| **Arme** (légendaire) | Tes Jugements infligent **double dégâts** aux Morts-vivants et aux Démons, et **te soignent de 5 PV**. |

**La quête (actes 2 et 3, 3 étapes) :**
1. **Événement « Le reliquaire profané »** (acte 2) : dans une crypte de l'Aire, le Paladin trouve la **Lame ternie**.
2. **Événement « Les Veilleurs de l'Aurore »** (acte 3) : au lieu de leur bénédiction, le Paladin leur demande de **purifier la lame**.
3. **Vaincre un boss secondaire d'Irem** : la lame purifiée s'embrase. L'Aurore ardente est équipée dans l'emplacement Arme.

La quête se termine tard dans la run, mais l'Aurore ardente est faite pour la **Nécropole céleste** et ses morts-vivants.

---

## 9. Les builds

| Build | Arbres | Cartes clés | Plan de jeu |
|---|---|---|---|
| **Le Croisé** | Vindicte | Sceau de vengeance, Zèle, Croisade, Verdict des cieux | Changer souvent de Sceau, frapper fort et juger dès que possible. |
| **Le Protecteur** | Protection | Pavois sacré, Bouclier béni, Juste châtiment, Bouclier du croisé | Bloquer d'énormes attaques, puis renvoyer les dégâts bloqués. |
| **Le Lumineux** | Sacré | Rayonnement, Illumination, Lumière sacrée, Avatar de lumière | Se soigner en permanence, et transformer chaque soin en dégâts. |
| **Le Juge** | Vindicte + Sacré | Sceau de lumière, Science du combat, Lame de justice | Un combattant qui frappe et se soigne à chaque tour. |

---

## 10. Forces et faiblesses face aux mécaniques de raid

| Mécanique | Le Paladin… |
|---|---|
| **Survie** | ✅✅ 80 PV, soins, blocage, Bouclier divin, Imposition des mains. |
| **Dissipation** | ✅ Lumière purificatrice (tous les types), Purification, Résolution sacrée. |
| **Interruption** | ✅ Marteau du jugement, Bouclier lancé. |
| **Morts-vivants et Démons** | ✅✅ Exorcisme, Colère sacrée, Croisade, l'Aurore ardente. Il brille dans la Nécropole. |
| **Zones de feu** | ✅ Aura de résistance. |
| **Enrage timer** | ➖ Dégâts corrects mais pas explosifs, sauf en Vindicte. |
| **Adds** | ➖ Consécration, Marteau de piété, Tourbillon sacré, Colère sacrée. |

---

## 11. Notes de conception

- **Une classe simple et solide :** le cycle Sceau puis Jugement est facile à comprendre, ce qui en fait une bonne deuxième classe pour un nouveau joueur.
- **À surveiller à l'équilibrage :**
  - Le talent Double sceau combiné à Verdict des cieux peut déclencher deux Jugements par carte.
  - Juste châtiment après un tour de gros blocage peut infliger beaucoup de dégâts pour 1 énergie.
  - La survie globale (soins + blocage + Bouclier divin) ne doit pas rendre les combats ennuyeux : l'enrage timer reste le garde-fou.
- **Tags Mort-vivant et Démon :** il faudra les répartir dans les 4 actes pour que le Paladin ne soit pas fort uniquement dans l'acte bonus.
- **Carte épique à revoir (mesure du bot, novembre 2026).** Contexte : le palier 5 coûte **3 points** (CONCEPT.md §9, en jeu depuis novembre 2026). Une carte épique doit alors valoir environ 3 talents des paliers 1 à 4, soit **+15 à +25 points** de victoire du bot. Build mesuré : paliers 1 à 4 de l'arbre + 3 paliers d'un autre, 200 runs, difficulté 0.
  - **Bouclier du croisé : −7 points** (contre +21 pour 3 talents). Le bot la joue bien (tôt, face à une attaque dans 95 % des cas). Sans les copies reprises en récompense, la victoire revient exactement à la base : **la carte vaut zéro**, et ses copies en plus (1,5 en fin de run) coûtent environ 7 points. 18 blocage pour 2 énergie, Épuisée, riposte d'un seul tour : un profil de peu commune.
  - **Piste :** en faire la carte qui fonde l'arbre : la riposte et le soin **durent tout le combat** (Pouvoir ou effet permanent), quitte à baisser le blocage.

---

## 12. Ce qui est en jeu dans le prototype

**Les chiffres retenus après l'équilibrage** (voir `docs/EQUILIBRAGE.md`, §13) :

| Élément | Fiche | En jeu |
|---|---|---|
| Parade (départ) | 5 blocage (8 améliorée) | **6 blocage (9)** : le renfort de départ des autres classes |
| Jugement | recharge 2 ; sans Sceau : 4 dégâts | **recharge 3** (2 avec Jugements rapides) ; **sans Sceau : 6 dégâts** |
| Jugement du Sceau de droiture | 10 dégâts | **12 dégâts** |
| Imposition des mains | 50 % des PV max, une fois par combat | **seulement sous 30 % des PV**, soigne **30 %** des PV max, une fois par combat |
| Bouclier divin | recharge 6 | **recharge 7** |
| Verdict des cieux (épique) | coût 2, 12 × 2 (16 × 2) | **coût 3 (2 amélioré), 8 × 2** |
| Avatar de lumière (épique) | coût 2 (1), soins +50 %, chaque soin en dégâts | **coût 3 (2), soins +25 %, la moitié du soin en dégâts** |
| Bouclier du croisé (épique) | 20 blocage (26), 6 dégâts et 2 PV | **18 blocage (24), 6 dégâts et 2 PV, Épuisé** |
| Lumière améliorée | tes soins +2 | **tes cartes de soin +2** (pas le Sceau de lumière, le Jugement ni Grâce du croisé) |
| Lumière bénie | la moitié du soin en blocage | **un quart du soin en blocage** |
| Bouclier amélioré | +2 blocage | **+1 blocage** (comme le Guerrier) |
| Vengeance divine | +6 | **+4** |

**Les règles précisées :**
- **Les Sceaux** : une carte Sceau coûte 1 (0 améliorée). Un seul Sceau à la fois (deux avec Double sceau : le plus ancien est remplacé). Les bonus « tes Attaques » ne valent que pour les cartes Attaque (pas les Sorts, ni le Jugement).
- **Le Jugement** est un sort de barre gratuit, qui demande une cible. Il consomme le(s) Sceau(x) actif(s). Verdict des cieux déclenche le même Jugement sans consommer le Sceau.
- **La Censure** (Sceau de vengeance) : chaque Attaque qui touche ajoute 1 cumul ; au début de son tour, l'ennemi subit autant de dégâts que de cumuls (ils ne diminuent pas). Le Jugement du Sceau de vengeance inflige 5 dégâts par cumul et les consomme.
- **Les Auras** sont des Pouvoirs : une seule à la fois. Changer d'Aura retire la Robustesse de l'Aura de dévotion. L'Aura de résistance réduit de moitié les Zones de feu, la Toxine et l'Affliction rouge.
- **Onde sacrée** : au lieu d'un choix, elle soigne si tu es sous la moitié de tes PV, et frappe sinon.
- **Inquisition** réactive le dernier Sceau consommé par un Jugement (le Sceau de droiture s'il n'y en a pas eu).
- **Faveur divine** double le prochain Sort (ses dégâts et ses soins) ou la prochaine carte qui soigne, pendant ce tour.
- **Juste châtiment** compte les dégâts bloqués pendant le dernier tour des ennemis.
- **Science du combat** : la carte de soin gratuite reste valable jusqu'à la fin du tour. Les cartes de soin sont celles qui soignent (Lumière bienfaisante, Lumière sacrée, Main sacrée, Éclair de foi, Onde sacrée, Lumière purificatrice, Aube purificatrice).
- **Dernier serment** se déclenche dès que tu passes sous 20 % de tes PV max, même à 0 PV : tu restes à 1 PV et tu es soigné de 15.
- **Sorts de loot :** Bénédiction de sauvegarde, Charge sacrée, et **Lumière de l'aube** (Dissipation de tous les types et 6 PV, une fois par combat).
- **Les Démons** : Morvax, Croc-de-lave, les Molosses de braise et les Molosses enragés de Krâgg (acte 1). **Les Morts-vivants** : les Serviteurs rapiécés, les Drakes d'os, les Serviteurs d'os et Ossyrax (acte 2). Le Paladin voit ces étiquettes sur les ennemis.
- **La Malédiction de lignée** de Vhaeryx (2 tours) : ton Sceau se brise, et tu ne peux plus en activer.
- **L'Aurore ardente** (en attendant l'acte 3) : au premier « ? » de l'acte 2, le Reliquaire profané attend le Paladin. Au fond de la crypte, il trouve la Lame ternie. Vaincre Ossyrax la purifie, puis on la rallume au feu de camp suivant. L'étape des Veilleurs de l'Aurore viendra avec l'acte 3.
- **L'interface** : sous la barre de PV, deux emblèmes (le Sceau actif, l'Aura active) et une case « Jugement » qui dit ce que fera le Jugement maintenant.
