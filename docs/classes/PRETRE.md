# Classe : le Prêtre

> Wipe & Loot · Fiche de classe · Version 0.1
> Les chiffres ont été réglés par une première passe d'équilibrage (voir [l'équilibrage](../EQUILIBRAGE.md), §11).

---

## 1. Identité

> *« La lumière protège. L'ombre dévore. Je porte les deux. »*

Le Prêtre puise dans la **foi** pour protéger, soigner et punir. Seul face aux raids, il ne soigne pas un groupe : il **se rend presque intouchable**, transforme ses soins en boucliers et sa foi en colère divine. Il peut aussi basculer vers l'**Ombre** et ronger ses ennemis de l'intérieur.

- **Rôle :** survie, dégâts sacrés ou dégâts d'ombre dans la durée.
- **Difficulté :** ⭐⭐ Moyenne.
- **Déblocage :** par l'expérience.
- **Fantasme de jeu :** encaisser tout ce que le boss envoie derrière une Égide, puis le foudroyer d'un Courroux céleste à pleine Foi.

| Statistique | Valeur |
|---|---|
| **PV max** | 70 |
| **Énergie** | 3 par tour |
| **Ressource de classe** | Foi (0 à 10) et Égide (bouclier persistant, 30 max) |
| **Sort de barre de départ** | Égide sacrée |

---

## 2. Mécanique 1 : l'Égide

L'**Égide** est un bouclier sacré propre au Prêtre.

- Comme le blocage, elle **absorbe les dégâts**. Le blocage normal est consommé en premier, puis l'Égide.
- **Différence clé :** l'Égide **ne disparaît pas** au début de ton tour. Elle reste jusqu'à ce qu'elle soit absorbée, ou jusqu'à la fin du combat.
- **Maximum : 30 Égide** (certains talents et cartes augmentent ce plafond).
- **Rien n'est perdu :** quand un soin te ferait dépasser tes PV max, **la moitié du soin excédentaire** devient de l'Égide.

**L'intérêt :** le Prêtre construit une défense qui dure. Il peut préparer son Égide avant un gros coup annoncé, et aucun soin n'est gâché.

---

## 3. Mécanique 2 : la Foi et les deux voies

### La Foi
- De **0 à 10**. Elle commence à 0 à chaque combat.
- **Gagner de la Foi :** +1 chaque fois qu'une de tes cartes **te soigne** ou **te donne de l'Égide**, et grâce à certaines cartes.
- **Dépenser de la Foi :** certaines cartes ont un **coût en Foi** (affiché en doré). La plus emblématique est **Courroux céleste**, qui consomme toute la Foi pour un coup proportionnel.

### Lumière ou Ombre
- Par défaut, le Prêtre est dans la **Lumière**.
- La carte épique **Forme d'Ombre** le fait basculer dans l'**Ombre** pour le reste du combat :
  - ses Sorts d'Ombre infligent **30 % de dégâts en plus** et ses DoT **+1 dégât** ;
  - en contrepartie, ses **soins sont réduits de moitié** et il **ne gagne plus de Foi**.
- Le légendaire **Équinoxe** change d'effet selon la voie (voir §8).

**L'intérêt :** un Prêtre de Lumière accumule la Foi en se protégeant, puis la libère. Un Prêtre d'Ombre renonce à cette sécurité pour des dégâts continus.

---

## 4. Deck de départ et barre de sorts

### 4.1 Deck de départ (10 cartes)

| Carte | Qté | Coût | Type | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Châtiment** | 4 | 1 | Sort (Sacré) | Inflige 7 dégâts. | 10 dégâts |
| **Prière de garde** | 4 | 1 | Compétence | Gagne 6 blocage. | 9 blocage |
| **Soins rapides** | 1 | 1 | Compétence | Soigne 6 PV. | 9 PV |
| **Murmure de douleur** | 1 | 1 | Sort (Ombre) | Applique DoT 4 pendant 4 tours. | DoT 5 |

### 4.2 Sort de barre de départ

| Sort | Coût | Recharge | Effet |
|---|---|---|---|
| **Égide sacrée** | 0 | 2 tours | Gagne 5 Égide. |

---

## 5. Les cartes (52)

**Légende des raretés :** C = Commune · PC = Peu commune · R = Rare · É = Épique (débloquée par le dernier palier de talent de son arbre).

### 5.1 Tronc commun (10 cartes)

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Châtiment** | 1 | Sort | C | Inflige 7 dégâts. | 10 dégâts |
| **Soins rapides** | 1 | Compétence | C | Soigne 6 PV. | 9 PV |
| **Grâce** | 1 | Compétence | C | Soigne 3 PV au début de tes 3 prochains tours. | 4 PV |
| **Dissipation de la magie** | 0 | Compétence | C | **Dissipation (Magie).** Pioche 1 carte. | Pioche 2 cartes |
| **Purification** | 0 | Compétence | C | **Dissipation (Maladie et Poison).** | Soigne aussi 3 PV |
| **Nova sacrée** | 1 | Sort | PC | Inflige 4 dégâts à tous les ennemis. Soigne 3 PV. | 6 / 4 |
| **Effacement** | 0 | Compétence | PC | Tous les ennemis sont Démoralisés 1 tour. Pioche 1 carte. | 2 tours |
| **Feu intérieur** | 1 | Pouvoir | PC | Gagne 1 Puissance et 1 Robustesse. | 2 et 2 |
| **Inspiration divine** | 2 | Pouvoir | R | Pioche 1 carte de plus au début de chaque tour. | Coûte 1 |
| **Bénédiction de vigueur** | 1 | Compétence | R | Gagne **4 PV max de façon permanente** (pour toute la run). **Épuisé.** | 6 PV max |

### 5.2 Arbre Discipline (14 cartes) : l'Égide

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Égide renforcée** | 1 | Compétence | C | Gagne 7 Égide. | 10 Égide |
| **Pénitence** | 1 | Sort | C | Inflige 4 dégâts 2 fois. Gagne 2 Égide. | 5 × 2, 3 Égide |
| **Bastion sacré** | 2 | Compétence | C | Gagne 13 Égide. | 17 Égide |
| **Sacrifice de soi** | 0 | Compétence | C | Perds 4 PV. Gagne 8 Égide. | 11 Égide |
| **Prière de protection** | 1 | Compétence | C | Gagne 5 blocage et 3 Égide. | 7 et 5 |
| **Discernement** | 1 | Compétence | C | Pioche 2 cartes. Gagne 1 Foi. | Coûte 0 |
| **Éclat de foi** | 1 | Sort | PC | Inflige des dégâts égaux à la **moitié de ton Égide**. Ne la consomme pas. | Égale à ton Égide |
| **Rayon de lumière** | 2 | Sort | PC | Inflige 12 dégâts. Gagne 4 Égide. | 16 / 6 |
| **Méditation** | 1 | Pouvoir | PC | Au début de ton tour, si tu as de l'Égide, gagne 1 Foi. | Coûte 0 |
| **Lumière persistante** | 1 | Pouvoir | PC | Au début de ton tour, gagne 3 Égide. | 5 Égide |
| **Clarté** | 0 | Compétence | PC | Si tu as 10 Égide ou plus, gagne 1 énergie. | 2 énergie |
| **Expiation** | 1 | Pouvoir | R | Chaque fois que tu infliges des dégâts avec un Sort, soigne 2 PV. | 3 PV |
| **Âme inébranlable** | 2 | Pouvoir | R | Ton Égide maximale passe à 50. Au début de ton tour, gagne 2 Égide. | Coûte 1 |
| **Égide des anciens** | 1 + toute la Foi | Compétence | É | Dépense toute ta Foi : gagne 4 Égide par point. Ce tour-ci et le suivant, **tes PV ne peuvent pas descendre sous 1**. | 5 Égide par point |

### 5.3 Arbre Sacré (14 cartes) : soins et colère divine

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Châtiment ardent** | 1 | Sort | C | Inflige 8 dégâts. Gagne 1 Foi. | 11 dégâts |
| **Feu sacré** | 2 | Sort | C | Inflige 10 dégâts. Applique DoT 3 pendant 3 tours. Gagne 1 Foi. | 14 / DoT 4 |
| **Soins supérieurs** | 2 | Compétence | C | Soigne 12 PV. Gagne 1 Foi de plus. | 16 PV |
| **Cercle de soins** | 1 | Compétence | C | Soigne 4 PV et gagne 4 blocage. | 6 et 6 |
| **Grâce divine** | 0 | Compétence | C | Gagne 2 Foi. Pioche 1 carte. | 3 Foi |
| **Colère divine** | 1 + 3 Foi | Sort | PC | Inflige 15 dégâts. | 20 dégâts |
| **Lumière éclatante** | 2 | Sort | PC | Inflige 8 dégâts à tous les ennemis. Gagne 2 Foi. | 11 dégâts |
| **Sol sacré** | 1 | Pouvoir | PC | Au début de ton tour, inflige 3 dégâts à tous les ennemis et soigne 2 PV. | 4 et 3 |
| **Chant de lumière** | 1 | Pouvoir | PC | Chaque fois que tu gagnes de la Foi, inflige 2 dégâts à un ennemi au hasard. | 3 dégâts |
| **Cantique** | 2 | Compétence | R | Soigne 10 PV. Gagne 3 Foi. **Épuisé.** | N'est plus Épuisé |
| **Courroux céleste** | 1 + toute la Foi | Sort | R | Inflige **4 dégâts par point de Foi** dépensé. | 5 par point |
| **Ange gardien** | 2 | Pouvoir | R | La première fois de ce combat que tu tomberais à 0 PV, tu restes à 1 PV et tu es soigné de 15 PV. | Coûte 1 |
| **Esprit de guérison** | 1 | Pouvoir | R | **Tout** le soin excédentaire devient de l'Égide (au lieu de la moitié). | Coûte 0 |
| **Ascension lumineuse** | 3 | Pouvoir | É | Chaque fois que tu te soignes, inflige le même montant de dégâts à un ennemi au hasard. Gagne 1 Foi au début de chaque tour. | Coûte 2 |

### 5.4 Arbre Ombre (14 cartes) : DoT et dégâts mentaux

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Murmure de douleur** | 1 | Sort | C | Applique DoT 4 pendant 4 tours. | DoT 5 |
| **Attaque mentale** | 1 | Sort | C | Inflige 9 dégâts. | 12 dégâts |
| **Fouet psychique** | 2 | Sort | C | Inflige 4 dégâts 3 fois. Applique Ralenti (1 tour). | 5 × 3 |
| **Éclat d'ombre** | 1 | Sort | C | Inflige 5 dégâts à tous les ennemis. | 8 dégâts |
| **Voile d'ombre** | 1 | Compétence | C | Gagne 8 blocage, +3 si tu es en Forme d'Ombre. | 11 blocage |
| **Murmures du néant** | 0 | Compétence | C | Perds 2 PV. Pioche 2 cartes. | Pioche 3 cartes |
| **Toucher vampirique** | 1 | Sort | PC | Applique DoT 3 pendant 3 tours. À chaque fois qu'il inflige des dégâts, soigne 1 PV. | DoT 4, soigne 2 |
| **Murmure de mort** | 1 | Sort | PC | Inflige 14 dégâts. Perds 4 PV. | 19 dégâts |
| **Étreinte vampirique** | 1 | Pouvoir | PC | Chaque fois que tu infliges des dégâts avec un Sort d'Ombre, soigne 2 PV. | 3 PV |
| **Esprit tourmenté** | 1 | Pouvoir | PC | Quand un de tes DoT tue un ennemi, pioche 2 cartes. | Gagne aussi 1 énergie |
| **Peste mentale** | 2 | Sort | R | Applique DoT 5 pendant 4 tours. À chaque fois qu'il inflige des dégâts, soigne 2 PV. | DoT 7 |
| **Contrôle mental** | 2 | Compétence | R | Un ennemi (sauf boss) attaque un autre ennemi à la place de toi ce tour-ci. **Épuisé.** | Coûte 1 |
| **Ténèbres intérieures** | 1 | Pouvoir | R | Tes DoT infligent +1 dégât. | +2 dégâts |
| **Forme d'Ombre** | 2 | Pouvoir | É | Tu entres en **Forme d'Ombre** pour le reste du combat (voir §3). | Coûte 1 |

---

## 6. La barre de sorts

| Sort | Coût | Recharge | Effet | Source principale |
|---|---|---|---|---|
| **Égide sacrée** | 0 | 2 tours | Gagne 5 Égide. | Départ |
| **Transfusion de puissance** | 0 | 5 tours | Ce tour-ci, tes cartes coûtent 1 de moins (minimum 0). | Talent Discipline, palier 3 |
| **Focalisation intérieure** | 0 | 4 tours | Ta prochaine carte coûte 0. | Talent Discipline, palier 3 |
| **Prière désespérée** | 0 | 1 fois par combat | Soigne 20 PV. | Talent Sacré, palier 3 |
| **Nova de lumière** | 1 | 3 tours | Inflige 6 dégâts à tous les ennemis et soigne 6 PV. | Talent Sacré, palier 3 |
| **Silence** | 0 | 4 tours | **Interruption.** La cible ne peut pas lancer de Sort à son prochain tour. | Talent Ombre, palier 3 |
| **Cri psychique** | 1 | 5 tours | Tous les ennemis (sauf boss) sont Apeurés 1 tour. Les boss sont Démoralisés 2 tours. | Talent Ombre, palier 3 |

**Sorts de barre dans les tables de loot** (exemples) : *Lien de lumière* (soigne 8 PV et gagne 8 Égide, recharge 4), *Pacte de l'ombre* (pioche 3 cartes, perds 5 PV, recharge 3).

---

## 7. Les talents

### 7.1 Arbre Discipline

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Égide améliorée** : tes cartes d'Égide donnent +3 Égide. | **Volonté** : +6 PV max. |
| **2** | **Méditation profonde** : ton Égide maximale passe à 40. | **Esprit martyr** : quand ton Égide est entièrement détruite, pioche 2 cartes. |
| **3** | **Transfusion de puissance** : ajoute ce sort à ta barre. | **Focalisation intérieure** : ajoute ce sort à ta barre. |
| **4** | **Lumière intérieure** : commence chaque combat avec 8 Égide. | **Quatrième emplacement** : ta barre de sorts gagne un 4ᵉ emplacement. |
| **5** | **Égide des anciens** (carte épique) | — |

### 7.2 Arbre Sacré

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Soins améliorés** : tes soins rendent +3 PV. | **Châtiment amélioré** : Châtiment et Châtiment ardent infligent +2 dégâts. |
| **2** | **Foi ardente** : ta Foi maximale passe à 15. | **Lumière bénie** : chaque soin excédentaire te donne aussi 1 Foi. |
| **3** | **Prière désespérée** : ajoute ce sort à ta barre. | **Nova de lumière** : ajoute ce sort à ta barre. |
| **4** | **Gardien céleste** : Ange gardien est Inné. | **Courroux sacré** : Courroux céleste inflige +1 dégât par point de Foi. |
| **5** | **Ascension lumineuse** (carte épique) | — |

### 7.3 Arbre Ombre

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Douleur améliorée** : Murmure de douleur inflige +2 dégâts par tour. | **Concentration de l'ombre** : Fouet psychique frappe une fois de plus. |
| **2** | **Ombres tenaces** : tes DoT durent 1 tour de plus. | **Esprit sombre** : Attaque mentale inflige +4 dégâts. |
| **3** | **Silence** : ajoute ce sort à ta barre. | **Cri psychique** : ajoute ce sort à ta barre. |
| **4** | **Puissance du vide** : commence chaque combat avec 1 Puissance. | **Faim vampirique** : Étreinte vampirique soigne 1 PV de plus. |
| **5** | **Forme d'Ombre** (carte épique) | — |

---

## 8. Le légendaire : Équinoxe

> *Un bâton forgé à l'heure où le jour et la nuit sont égaux. Sa tête est faite d'une pierre qui brille ou s'éteint selon l'âme de celui qui la porte.*

| Emplacement | Effet |
|---|---|
| **Arme** (légendaire) | **Dans la Lumière :** tes soins rendent +3 PV et chaque soin te donne 1 Foi de plus. **En Forme d'Ombre :** tes DoT infligent +2 dégâts et chaque dégât de DoT te soigne de 1 PV. |

**La quête (actes 1 et 2, 3 étapes) :**
1. **Événement « La chapelle effondrée »** (acte 1) : sous les décombres, le Prêtre trouve le **Bâton nu**, une arme sans pierre.
2. **Vaincre Ysolde la Rouge** (boss secondaire, acte 2) : libérée de son asservissement, la dragonne laisse une **Larme d'Ysolde**, une pierre qui contient la lumière et l'ombre.
3. **Au feu de camp suivant** : option **« Rituel de l'équinoxe »**. Le Prêtre sertit la pierre et Équinoxe est équipée dans l'emplacement Arme.

---

## 9. Les builds

| Build | Arbres | Cartes clés | Plan de jeu |
|---|---|---|---|
| **Le Bastion** | Discipline | Lumière persistante, Âme inébranlable, Bastion sacré, Éclat de foi | Empiler l'Égide jusqu'à devenir intouchable, puis la convertir en dégâts. |
| **Le Juge céleste** | Sacré | Grâce divine, Chant de lumière, Cantique, Courroux céleste | Accumuler la Foi en se soignant, puis tout libérer en un Courroux céleste. |
| **Le Prêtre noir** | Ombre | Murmure de douleur, Peste mentale, Ténèbres intérieures, Forme d'Ombre | Basculer dans l'Ombre et laisser les DoT faire fondre les ennemis. |
| **Le Martyr lumineux** | Sacré + Discipline | Esprit de guérison, Ascension lumineuse, Expiation | Chaque soin devient à la fois de l'Égide et des dégâts. |

---

## 10. Forces et faiblesses face aux mécaniques de raid

| Mécanique | Le Prêtre… |
|---|---|
| **Dissipation** | ✅✅ La meilleure classe : il retire la **Magie**, les **Maladies** et les **Poisons**. |
| **Survie** | ✅✅ Égide persistante, soins, Ange gardien. |
| **Gros coups annoncés** | ✅ L'Égide se prépare plusieurs tours à l'avance. |
| **Interruption** | ❌ Seulement **Silence**, et seulement par l'arbre Ombre. |
| **Enrage timer** | ❌ Ses dégâts sont lents, sauf avec Courroux céleste à pleine Foi. |
| **Adds** | ➖ Nova sacrée, Lumière éclatante, Éclat d'ombre. Correct sans être excellent. |

---

## 11. Notes de conception

- **Un soigneur en solo :** le pari de la classe est de rendre les soins utiles même à pleins PV, grâce à la conversion en Égide.
- **À surveiller à l'équilibrage :**
  - Âme inébranlable et Lumière persistante pourraient rendre le Prêtre impossible à tuer dans les combats longs. **L'enrage timer** est le garde-fou prévu.
  - Ascension lumineuse combinée à Esprit de guérison crée beaucoup de valeur sur chaque soin.
  - Bénédiction de vigueur donne des PV max permanents : il faudra vérifier qu'elle reste rare.
- **Forme d'Ombre :** le choix de basculer doit rester une vraie décision. Si elle est trop forte, plus personne ne jouera la Lumière.
- **Carte épique à revoir (mesure du bot, novembre 2026).** Contexte : le palier 5 coûte **3 points** (décidé, CONCEPT.md §9 ; pas encore dans le code). Une carte épique doit alors valoir environ 3 talents des paliers 1 à 4, soit **+15 à +25 points** de victoire du bot. Build mesuré : paliers 1 à 4 de l'arbre + 3 paliers d'un autre, 200 runs, difficulté 0.
  - **Forme d'Ombre : −6 points** (contre +32 pour 3 talents). Le bot ne la jouait **jamais** : il compte les Pouvoirs par `c.powers`, et la Forme d'Ombre passe par `c.shadowForm` (corrigé en novembre 2026 dans `tools/balance/bot.ts`). Mais une fois le bot corrigé (jouée 842 fois), elle reste à −6 : le contrecoup (soins ÷2, plus de Foi) coûte plus que +30 % aux sorts d'Ombre et DoT +1, et elle n'a aucun effet immédiat. Avec des points en Discipline (l'arbre de la Foi), elle coupe la ressource dont cet arbre vit.
  - **Piste :** coût 1 (0 améliorée), un contrecoup plus doux (soins −25 %, ou la Foi se garde mais ne se dépense plus), et un effet immédiat (par exemple : tes DoT actifs infligent un tick tout de suite). Garder l'esprit de la note ci-dessus : basculer doit rester une décision.
  - **Ascension lumineuse : +3 points** (contre +18 pour 3 talents ; +6 sans les copies reprises en récompense). C'est un Pouvoir à **3 énergie** : le bot finit 5 492 tours avec la carte en main, presque toujours faute d'énergie, et ne la pose qu'au tour 3,9 en moyenne. Une fois posée, elle attend des soins pour rapporter. **C'est la carte :** trop chère pour un effet lent.
  - **Piste :** coût 2 (1 améliorée), et un effet immédiat (par exemple : te soigne de 5 PV, ce qui déclenche déjà l'Ascension).

---

## 12. Ce qui est en jeu dans le prototype

- **La Foi** se gagne quand une **carte** te soigne ou te donne de l'Égide (+1 par carte, quel que soit le nombre de soins), et avec les cartes qui en donnent directement. Les sorts de barre et les soins automatiques (Grâce, Sol sacré) n'en donnent pas.
- **Les dissipations :** Dissipation de la magie retire les malédictions (Démoralisé, Impie, cartes Paniquées, Malédiction de lignée…) ; Purification retire la Toxine, la Peste et les Afflictions de sang verte et noire.
- **La Malédiction de lignée** de Vhaeryx (2 tours) : tes soins te blessent au lieu de te soigner.
- **Équinoxe :** le Bâton nu à la chapelle effondrée (acte 1), la Larme d'Ysolde sur Ysolde la Rouge (acte 2), puis le Rituel de l'équinoxe au feu de camp.
