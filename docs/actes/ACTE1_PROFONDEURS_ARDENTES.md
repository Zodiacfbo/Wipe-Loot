# Acte 1 : les Profondeurs Ardentes

> Wipe & Loot · Fiche d'acte · Version 0.1
> Les chiffres sont **indicatifs** : ils serviront de base aux premiers tests d'équilibrage.

---

## 1. Ambiance et histoire

> *Sous le mont Durgal, les anciennes forges naines se sont effondrées dans un océan de lave. Vulkhar, Souverain des flammes, a été arraché à son plan par la Grande Brèche. Ses serviteurs préparent son retour complet, et la montagne tout entière commence à brûler.*

- **Lieu :** des forges naines englouties, des galeries de basalte, des rivières de lave, des salles de runes de feu.
- **Ennemis :** des élémentaires de feu et de roche, des molosses de lave, des cultistes de la flamme, et les **fantômes des forgerons nains** morts lors de l'effondrement.
- **Couleurs :** noir basalte, orange et rouge de la lave, éclats dorés des runes naines.
- **Musique :** percussions lourdes comme des marteaux de forge, grondements graves, chœurs qui montent à l'approche de Vulkhar.
- **Rôle dans la run :** c'est l'acte d'**apprentissage**. Il présente les mécaniques de raid une par une : la barre de cast et l'interruption, les zones de feu, les adds, les malédictions, l'enrage.

**Mécanique signature de l'acte : le feu.** Beaucoup d'ennemis ajoutent des cartes **Zone de feu** dans la main du joueur. Les classes qui savent s'en débarrasser (Clignement du Mage, Pas du loup spectral du Chaman, Aura de résistance du Paladin) y sont à l'aise.

---

## 2. La carte de l'acte

### 2.1 Structure (rappel)

| Étage | Contenu |
|---|---|
| **1** | Toujours un pack de trash facile. |
| **2 à 4** | Trash facile, « ? », vendeur. Pas de boss secondaire. |
| **5** | Toujours un **coffre**. |
| **6 à 8** | Tout type de nœud. **Boss secondaires** possibles, trash difficile. |
| **9** | Toujours un **feu de camp**. |
| **10** | **Vulkhar, Souverain des flammes.** |

### 2.2 Exemple de carte générée

```
Étage 10                    👑 VULKHAR
                          /     |     \
Étage 9              🔥          🔥          🔥
                    /  \        |          /  \
Étage 8           💀    ❓      ⚔️         💀    ❓
                  |      \    /   \       |
Étage 7          ⚔️       💰  💀    ❓      ⚔️
                  \      /     \  /       |
Étage 6           ❓   ⚔️       ⚔️        💀
                    \  |       /  \      /
Étage 5              📦      📦      📦
                    /  \     |     /
Étage 4           ⚔️    ❓    💰   ⚔️
                  |    /     \   |
Étage 3          ❓  ⚔️        ⚔️  ❓
                   \ |         | /
Étage 2            ⚔️          ❓
                     \        /
Étage 1               ⚔️    ⚔️
```

- 3 ou 4 chemins de départ, qui se croisent.
- Chaque nœud 💀 affiche le **nom du boss secondaire** et permet de consulter sa **table de loot**.
- Un chemin compte en général **0 à 3 boss secondaires**.

### 2.3 Répartition des nœuds (indicative, étages 2 à 8)

| Nœud | Part |
|---|---|
| ⚔️ Pack de trash | 45 % |
| ❓ Quête | 25 % |
| 💀 Boss secondaire | 15 % (étages 6 à 8 uniquement) |
| 💰 Vendeur gobelin | 8 % |
| 🔥 Feu de camp | 7 % (en plus de l'étage 9) |

---

## 3. Les ennemis de trash

**Tags :** 🔥 Élémentaire · 💀 Mort-vivant · 👤 Humanoïde · 🐺 Bête.

**Lecture des cycles :** chaque ennemi suit un cycle d'intentions, affiché un tour à l'avance. Certains ennemis ont une part d'aléatoire, indiquée entre parenthèses.

| Ennemi | Tag | PV | Cycle d'intentions | Particularité |
|---|---|---|---|---|
| **Molosse de braise** | 🐺 | 18 à 22 | Morsure (6) → Morsure (6) → Souffle de braise (4 dégâts + 1 Zone de feu) | Souvent en meute de 2 ou 3. |
| **Éclaireur cendreux** | 👤 | 14 à 16 | Embuscade (9, au premier tour uniquement) → Coup de dague (5) en boucle | Le premier tour fait mal : il faut bloquer tôt. |
| **Étincelle vivante** | 🔥 | 8 | Crépitement (3) en boucle | **À sa mort, elle explose : 4 dégâts au joueur.** Toujours en groupe de 3 ou 4. |
| **Forgeron spectral** | 💀 | 26 | Coup de marteau (8) → Forger l'armure (un allié gagne 8 blocage) | Rend les autres ennemis plus résistants : à tuer en premier. |
| **Gardien de lave** | 🔥 | 32 | Au début de son tour : +6 blocage. Coup de bouclier (7) en boucle. | S'il lui reste du blocage, il renvoie 3 dégâts à chaque Attaque reçue. |
| **Prêtre de la flamme** | 👤 | 22 | Soins de flamme (soigne un allié de 12) → Trait de feu (5) → **Incantation : Bénédiction ardente** (tous les alliés +2 Puissance) | L'incantation est **interruptible**. |
| **Seigneur des cendres** | 🔥 | 40 | **Incantation : Boule de lave** (18) → Coup ardent (7) → Attise (un allié +3 Puissance) | Le gros danger des étages 6 à 8 : il faut interrompre ou se protéger. |
| **Géant de lave** | 🔥 | 55 | Se redresse (+10 blocage) → Écrasement (16) → Piétinement (8 + Ralenti 1 tour sur le joueur) | Lent et lisible, mais il frappe très fort. |

### 3.1 Les packs

**Étages 1 à 4 (faciles) :**
- 2 Molosses de braise
- 3 Éclaireurs cendreux
- 1 Forgeron spectral + 2 Étincelles vivantes
- 1 Gardien de lave
- 4 Étincelles vivantes

**Étages 6 à 8 (difficiles) :**
- 1 Géant de lave
- 1 Seigneur des cendres + 2 Molosses de braise
- 1 Prêtre de la flamme + 1 Gardien de lave + 1 Forgeron spectral
- 2 Éclaireurs cendreux + 1 Prêtre de la flamme
- 1 Seigneur des cendres + 3 Étincelles vivantes

---

## 4. Les cartes-statut de l'acte

| Carte | Coût | Effet |
|---|---|---|
| **Zone de feu** | 1 | « Bouger » : la carte est retirée sans effet. **Si elle est encore en main à la fin de ton tour : tu subis 6 dégâts.** Éphémère. |
| **Bombe vivante** | 1 | « S'éloigner » : la carte est retirée sans effet. **Si elle est encore en main à la fin de ton tour : tu subis 15 dégâts, et chaque ennemi subit 5 dégâts.** Éphémère. |
| **Paniqué** | — | Marque posée sur une carte de ta main : elle est **injouable ce tour-ci**. |
| **Fardeau** | — | Malédiction temporaire, **injouable**. Elle disparaît à la fin du combat, ou avec une Dissipation (Malédiction). |
| **Cendres** | 0 | Injouable. Quand tu la pioches, elle prend une place dans ta main. **Épuisé** à la fin du tour. |

---

## 5. Les boss secondaires

Chaque run tire **3 à 5 boss secondaires** dans ce pool de 9, répartis sur les étages 6 à 8.

### 5.1 Règles communes

- **PV :** de 70 à 110.
- **Enrage :** chaque boss secondaire passe en **Berserk au tour 10** : ses dégâts sont doublés. Le compteur est visible en permanence.
- **Table de loot :** chaque boss a **4 objets d'équipement** qui lui sont propres, plus **1 sort de barre de ta classe** (tiré de la liste des sorts de loot de la classe). Il en fait tomber **1** à sa mort.
- **Objets de quête :** certains boss font aussi tomber un **objet de quête légendaire**, en plus de leur loot, si le joueur joue la bonne classe. Les objets de quête **n'occupent pas d'emplacement**.
- Une **silhouette « ??? »** cache chaque objet tant qu'il n'a pas été obtenu une fois (voir le concept, §12.7).

---

### 5.2 Morvax le Maudisseur

> *Un démon mineur, lié à Vulkhar par un pacte de feu. Il ne frappe pas fort, mais ses malédictions rongent ceux qui l'approchent.*

- **Tag :** Démon · **PV :** 85
- **Question posée :** sais-tu gérer les malédictions ?

| Tour | Intention |
|---|---|
| Cycle | **Malédiction de faiblesse** (tu es Démoralisé 4 tours) → Trait d'ombre (12) → **Malédiction du fardeau** (ajoute 2 Fardeaux dans ta pioche) → Trait d'ombre (14) |
| Sous 50 % PV | Il ajoute à son cycle **Malédiction de l'impie** : ta première carte de chaque tour coûte 1 de plus pendant 3 tours. |

- **Réponses :** Dissipation (Malédiction) pour le Mage et le Druide ; tuer vite pour les autres. Toutes ses malédictions **expirent seules** après quelques tours, donc aucune classe n'est bloquée.

| Table de loot | Emplacement | Effet |
|---|---|---|
| **Bague de l'impie** | Bague | Les débuffs que tu subis durent 1 tour de moins. |
| **Grimoire de Morvax** | Bijou | Au début de chaque combat, tous les ennemis sont Démoralisés 2 tours. |
| **Lame maudite** | Arme | Tes Attaques infligent +3 dégâts. Au début de chaque combat, un Fardeau est ajouté à ta pioche. |
| **Amulette de purification** | Amulette | Au début de ton tour, dissipe automatiquement une Malédiction. |
| *Sort de barre de ta classe* | Barre | — |

---

### 5.3 Croc-de-lave, le Molosse ancestral

> *Le premier des molosses de lave, aussi vieux que la montagne. Son hurlement glace le sang, même au cœur du brasier.*

- **Tag :** Bête · **PV :** 90
- **Question posée :** sais-tu jouer avec une main réduite ?

| Tour | Intention |
|---|---|
| Cycle | Morsure (10) → Morsure (10) → **Hurlement de terreur** : au début de ton prochain tour, **2 cartes au hasard de ta main sont Paniquées** |
| Sous 50 % PV | **Frénésie** : ses Morsures frappent deux fois (10 + 10). |

- **Réponses :** Rage du berserker (Guerrier), immunité à la Peur, cartes à 0 énergie pour compenser, piocher plus.

| Table de loot | Emplacement | Effet |
|---|---|---|
| **Collier de crocs** | Amulette | +6 PV max. Tu es immunisé à la Peur et aux cartes Paniquées. |
| **Croc de lave** | Bijou | Ta première Attaque de chaque tour applique Saignement 2. |
| **Hache du molosse** | Arme | Tes Attaques infligent +2 dégâts, et +4 contre une cible sous 50 % de PV. |
| **Anneau du chasseur de lave** | Bague | Gagne 1 Puissance au début de chaque combat. |
| *Sort de barre de ta classe* | Barre | — |

---

### 5.4 Sœur Cendrine, prêtresse des braises

> *Elle fut la première à entendre l'appel de Vulkhar. Depuis, elle répand ses cendres sur chaque intrus.*

- **Tag :** Humanoïde · **PV :** 75
- **Question posée :** sais-tu sortir du feu ?

| Tour | Intention |
|---|---|
| Cycle | **Pluie de cendres** (ajoute 2 Zones de feu à ta main) → Fouet de flammes (8) → **Incantation : Embrasement** (20 dégâts, interruptible) |
| Sous 50 % PV | Pluie de cendres ajoute **3** Zones de feu au lieu de 2. |

- **Réponses :** Clignement (Mage), Pas du loup spectral (Chaman), Aura de résistance (Paladin), interrompre Embrasement.

| Table de loot | Emplacement | Effet |
|---|---|---|
| **Amulette des cendres** | Amulette | Les Zones de feu t'infligent 50 % de dégâts en moins. |
| **Bâton de Cendrine** | Arme | Tes Sorts infligent +3 dégâts. |
| **Encensoir ardent** | Bijou | Quand tu joues une Zone de feu (« Bouger »), gagne 4 blocage. |
| **Bague de la prêtresse** | Bague | Tes soins rendent +2 PV. |
| *Sort de barre de ta classe* | Barre | — |

---

### 5.5 Gorlok le Fragmenté

> *Un élémentaire de roche brisé par la chute des forges. Ses éclats gravitent autour de lui, et chacun d'eux est une bombe.*

- **Tag :** Élémentaire · **PV :** 70, accompagné de **4 Éclats de Gorlok** (10 PV chacun)
- **Question posée :** sais-tu gérer des adds qui punissent quand on les tue ?

| Ennemi | Intention |
|---|---|
| **Gorlok** | Au début de son tour, gagne **4 blocage par Éclat encore en vie**. Cycle : Poing de roche (10) → Rappel des éclats (si un Éclat est mort, il en recrée un, 1 fois par tour) → Poing de roche (12). |
| **Éclats** | Projection (3) chacun. **À sa mort, un Éclat explose : 5 dégâts au joueur.** |

- **Réponses :** contrôler les Éclats (Métamorphose, Assommer) au lieu de les tuer, ou les tuer un par un en gardant du blocage ; ou ignorer les Éclats et percer le blocage de Gorlok (Fulgurance, Tir perçant, Trait du chaos).

| Table de loot | Emplacement | Effet |
|---|---|---|
| **Éclat de Gorlok** | Bijou | Quand un ennemi meurt, il explose : 5 dégâts à tous les autres ennemis. |
| **Masse de basalte** | Arme | Tes Attaques infligent +2 dégâts. Ta première Attaque de chaque combat inflige +10 dégâts. |
| **Anneau de pierre** | Bague | Gagne 1 Robustesse au début de chaque combat. |
| **Amulette de granit** | Amulette | Commence chaque combat avec 8 blocage. |
| *Sort de barre de ta classe* | Barre | — |
| *Objet de quête (Voleur)* | — | **Fermoir gauche de l'orage** (quête de Sillon d'orage) |

---

### 5.6 Le Baron Vossk

> *Un seigneur élémentaire au cœur de magma, qui transforme ses ennemis en torches vivantes.*

- **Tag :** Élémentaire · **PV :** 95
- **Question posée :** sais-tu gérer une carte qui doit absolument quitter ta main ?

| Tour | Intention |
|---|---|
| Cycle | **Bombe vivante** (ajoute une Bombe vivante à ta main) → Coup de lave (11) → **Embrasement de mana** (tu as 1 énergie de moins à ton prochain tour) → Coup de lave (11) |
| Tous les 4 tours | **Incantation : Inferno** : 4 dégâts, 4 fois (interruptible). |

- **Réponses :** garder 1 énergie pour la Bombe vivante, interrompre l'Inferno, ou accepter la Bombe quand on a beaucoup de blocage (elle blesse aussi les ennemis).

| Table de loot | Emplacement | Effet |
|---|---|---|
| **Cœur de la bombe** | Bijou | Quand tu perds 10 PV ou plus en une fois, inflige 8 dégâts à tous les ennemis. |
| **Bague de mana brûlant** | Bague | Gagne 1 énergie de plus au premier tour de chaque combat. |
| **Sceptre du Baron** | Arme | Tes Sorts infligent +2 dégâts. Tes applications de DoT et de Brûlure sont augmentées de 1. |
| **Amulette de l'inferno** | Amulette | Les DoT ennemis t'infligent 2 dégâts de moins par tour. |
| *Sort de barre de ta classe* | Barre | — |
| *Objet de quête (Voleur)* | — | **Fermoir droit de l'orage** (quête de Sillon d'orage) |

---

### 5.7 Zhaal le Tisseur d'arcanes

> *Un mage élémentaire qui tisse la flamme et l'arcane. Il a volé un fragment du bâton du Veilleur, et sa puissance le rend insaisissable.*

- **Tag :** Élémentaire · **PV :** 80
- **Question posée :** sais-tu jouer quand on te contre ?

| Tour | Intention |
|---|---|
| Passif | **Contresort** : chaque tour, ta **3ᵉ carte de Sort** est contrée (annulée, mais elle va quand même à la défausse). |
| Cycle | Explosion arcanique (12) → **Clignement** : jusqu'à son prochain tour, il ne peut pas être ciblé (les effets de zone le touchent quand même) → Explosion arcanique (12) → Malédiction arcanique (tes Sorts coûtent 1 de plus au prochain tour) |

- **Réponses :** jouer des Attaques et des Compétences plutôt que des Sorts, utiliser les effets de zone pendant son Clignement. C'est un boss **difficile pour les lanceurs de sorts**.

| Table de loot | Emplacement | Effet |
|---|---|---|
| **Bague du tisseur** | Bague | La première carte que tu joues dans chaque combat coûte 0. |
| **Orbe de distorsion** | Bijou | Une fois par combat, quand un ennemi termine une Incantation, elle est annulée. |
| **Dague arcanique** | Arme | Tes Sorts infligent +2 dégâts. Pioche 1 carte de plus au premier tour de chaque combat. |
| **Amulette de clairvoyance** | Amulette | Tu vois les **deux** prochaines intentions de chaque ennemi. |
| *Sort de barre de ta classe* | Barre | — |
| *Objet de quête (Mage, Démoniste, Druide)* | — | **Fragment du Veilleur** (quête du Bâton du Veilleur) |

---

### 5.8 Le Héraut Brannoc

> *Le porte-voix de Vulkhar. Il ne combat presque jamais seul : il soigne et galvanise ses lieutenants.*

- **Tag :** Humanoïde · **PV :** 70, accompagné de **2 Lieutenants ardents** (30 PV chacun)
- **Question posée :** sais-tu choisir ta cible et interrompre ?

| Ennemi | Intention |
|---|---|
| **Brannoc** | Cycle : **Incantation : Soins de flamme** (soigne un Lieutenant de 25, interruptible) → **Galvaniser** (les Lieutenants gagnent 3 Puissance) → Coup de masse (9) |
| **Lieutenants** | Taille (7) → Taille (7) → Garde (+8 blocage) |

- **Réponses :** interrompre les Soins de flamme ; tuer Brannoc d'abord (les Lieutenants ne sont plus soignés ni renforcés) ou tuer les Lieutenants d'abord (Brannoc seul est faible).

| Table de loot | Emplacement | Effet |
|---|---|---|
| **Étendard du héraut** | Bijou | Au début de chaque combat, gagne 1 Puissance et 1 Robustesse. |
| **Marteau de Brannoc** | Arme | Tes Attaques infligent +2 dégâts et te soignent de 1 PV. |
| **Bague de commandement** | Bague | Chaque fois que tu interromps une Incantation, pioche 1 carte. |
| **Amulette du héraut** | Amulette | Soigne 5 PV à la fin de chaque combat gagné. |
| *Sort de barre de ta classe* | Barre | — |

---

### 5.9 Krâgg le Mange-roche

> *Un géant de roche qui se nourrit de la montagne elle-même. Ses deux molosses ne le quittent jamais.*

- **Tag :** Élémentaire · **PV :** 110, accompagné de **2 Molosses enragés** (30 PV chacun)
- **Question posée :** sais-tu gérer un boss qui grandit à chaque tour ?

| Ennemi | Intention |
|---|---|
| **Krâgg** | Passif : **Magma en fusion**, il gagne **1 Puissance au début de chacun de ses tours**. Cycle : Écrasement (14) → Écrasement (14) → Dévorer la roche (se soigne de 10). |
| **Molosses** | Morsure (6) en boucle. Tant que Krâgg est en vie, un Molosse tué **se relève** 2 tours plus tard avec la moitié de ses PV. Quand Krâgg meurt, les Molosses s'enfuient. |

- **Réponses :** se concentrer sur Krâgg, vite, avant que sa Puissance ne devienne écrasante. Les Molosses ne valent la peine d'être tués que pour souffler.

| Table de loot | Emplacement | Effet |
|---|---|---|
| **Poing de Krâgg** | Arme | Tes Attaques qui coûtent 2 énergie ou plus infligent +6 dégâts. |
| **Collier du mange-roche** | Amulette | +10 PV max. |
| **Pierre de magma** | Bijou | Tous les 2 tours, gagne 1 Puissance (3 maximum par combat). |
| **Bague des molosses** | Bague | Tes alliés (familier, compagnon, totems, invocations) infligent +2 dégâts. |
| *Sort de barre de ta classe* | Barre | — |
| *Objet de quête (Guerrier)* | — | **Cœur de la montagne** (quête de Brisemonts) |

---

### 5.10 Le Grand Intendant Saldris

> *L'intendant des forges, au service de Vulkhar depuis des siècles. Il protège ses gardes derrière des boucliers magiques qui renvoient les coups.*

- **Tag :** Humanoïde · **PV :** 60, accompagné de **2 Prêtres de la flamme** (22 PV) et **2 Gardiens de lave** (32 PV)
- **Question posée :** sais-tu adapter ton style de jeu d'un tour à l'autre ?

| Ennemi | Intention |
|---|---|
| **Saldris** | Il alterne deux boucliers, annoncés **un tour à l'avance** : **Bouclier anti-sorts** (il renvoie 50 % des dégâts de tes Sorts) ou **Bouclier anti-coups** (il renvoie 50 % des dégâts de tes Attaques). Il donne aussi 8 blocage à un garde chaque tour. Coup de bâton (8). |
| **Gardes** | Leurs cycles habituels (voir §3). |

- **Particularité :** **Saldris se rend** quand ses 4 gardes sont morts **ou** quand il passe sous 10 % de PV. Le combat est alors gagné.
- **Réponses :** jouer des Attaques pendant le Bouclier anti-sorts, et des Sorts pendant le Bouclier anti-coups ; ou concentrer les gardes.

| Table de loot | Emplacement | Effet |
|---|---|---|
| **Bâton de l'intendant** | Arme | Tes Attaques infligent +1 dégât et tes cartes de blocage donnent +2 blocage. |
| **Miroir de l'intendant** | Bijou | Quand tu bloques entièrement une attaque, renvoie 4 dégâts à l'attaquant. |
| **Trousseau de l'intendant** | Bijou | Les coffres te proposent **2 objets au choix** au lieu d'un. |
| **Amulette de l'intendant** | Amulette | Tu as 1 emplacement de potion de plus. |
| *Sort de barre de ta classe* | Barre | — |

---

## 6. Le boss final : Vulkhar, Souverain des flammes

> *« Insectes ! Vous osez troubler mon sommeil ? Vous brûlerez, comme brûle la montagne ! »*

- **Tag :** Élémentaire · **PV :** 300
- **Enrage :** **Berserk au tour 14**.
- **Question posée :** tout ce que l'acte t'a appris : sortir du feu, gérer les adds, encaisser un gros coup annoncé, faire assez de dégâts avant l'enrage.

### Phase 1 : de 100 % à 50 % de PV

| Tour | Intention |
|---|---|
| Cycle | Poing de lave (14) → **Pluie de lave** (2 Zones de feu dans ta main + 6 dégâts) → **Incantation : Marteau des flammes** (**non interruptible**) |
| **Marteau des flammes** | Tu subis 10 dégâts et tu es **assommé** : tu pioches **2 cartes de moins** à ton prochain tour. |

Le Marteau des flammes ne peut pas être interrompu. Le joueur doit **se préparer à jouer un tour réduit** (3 cartes au lieu de 5), par exemple en gardant de la rage ou un sort de barre pour ce tour-là.

> *Adaptation : la première version prévoyait de défausser toute la main. Comme la main est déjà défaussée à la fin de chaque tour, l'effet est devenu « tu pioches 2 cartes de moins ».*

### Transition : Vulkhar plonge dans la lave (à 50 % de PV)

- Vulkhar **disparaît pendant 2 tours** : il ne peut pas être ciblé ni blessé.
- **6 Rejetons de flamme** apparaissent (12 PV chacun, ils attaquent pour 4).
- **Quand Vulkhar revient**, il **absorbe** les Rejetons encore en vie : il se soigne de **15 PV par Rejeton absorbé**.

C'est le moment des effets de zone : Explosion des arcanes, Tourbillon, Flèches multiples, Chaîne d'éclairs, Pluie de feu…

### Phase 2 : de 50 % à 0 % de PV

| Tour | Intention |
|---|---|
| Cycle | Poing de lave (18) → **Éruption** (8 dégâts, +4 à chaque nouvelle Éruption du combat) → **Incantation : Marteau des flammes** (**non interruptible**) |
| Passif | Au début de chacun de ses tours, ajoute 1 Zone de feu dans ta main. |

Le Marteau des flammes revient **tous les 3 tours**, et l'Éruption devient de plus en plus forte. C'est une course contre l'enrage.

### Effet de la quête des Gardiens des Sources

Si le joueur a terminé la quête des Gardiens des Sources (voir §7) :
- Vulkhar commence le combat avec **15 % de PV en moins** ;
- son premier Marteau des flammes arrive **un tour plus tard**.

### Récompenses de Vulkhar

**1. Un objet de sa table de loot :**

| Table de loot | Emplacement | Effet |
|---|---|---|
| **Cœur de Vulkhar** | Bijou | Au début de chaque combat, applique Brûlure 5 à tous les ennemis. |
| **Masse des flammes** | Arme | Tes Attaques infligent +3 dégâts et appliquent Brûlure 1. |
| **Collier du Souverain** | Amulette | +8 PV max. Les Zones de feu ne t'infligent plus de dégâts. |
| **Anneau de lave éternelle** | Bague | Gagne 1 Puissance et 1 Robustesse au début de chaque combat. |
| *Sort de barre de ta classe* | Barre | — |

**2. Le butin de boss : 1 objet épique au choix parmi 3**, tirés de ce pool. Chacun est puissant, avec un inconvénient :

| Objet épique | Emplacement | Effet |
|---|---|---|
| **Cœur de magma** | Bijou | +1 énergie par tour. Tu subis 3 dégâts au début de chacun de tes tours. |
| **Flamme captive** | Bijou | +1 énergie par tour. Tu ne peux plus te reposer aux feux de camp. |
| **Sceau du Souverain** | Amulette | Pioche 1 carte de plus par tour. −10 PV max. |
| **Œil du brasier** | Bijou | Tu vois toutes les intentions des ennemis jusqu'à la fin du combat. Chaque combat commence avec 1 Zone de feu dans ta main. |
| **Marteau des profondeurs** | Arme | Tes Attaques infligent +5 dégâts. Tes Compétences coûtent 1 de plus. |
| **Couronne de cendres** | Amulette | +1 énergie par tour. Les récompenses de cartes ne proposent plus que 2 cartes. |

---

## 7. Les événements de l'acte 1

Rappel : un « ? » peut aussi cacher un **combat**, un **vendeur** ou un **coffre** (voir le concept, §13).

### 7.1 La bénédiction d'entrée : Brégan le Passeur

> *« Les profondeurs n'aiment pas les visiteurs. Prends ceci, ça pourrait te sauver la vie. »*

Au tout début de la run, Brégan propose **4 bonus au hasard** parmi :

| Bonus | Effet |
|---|---|
| **Provisions** | +8 PV max. |
| **Bourse de la guilde** | +100 or. |
| **Potions de route** | 2 potions au hasard. |
| **Entraînement** | Améliore 2 cartes au hasard. |
| **Allègement** | Retire 1 carte de ton deck. |
| **Équipement de prêt** | Un objet d'équipement commun au hasard. |
| **Pari risqué** | Perds 10 % de tes PV max. Choisis un objet rare parmi 3. |
| **Marché de l'ombre** | Ajoute une malédiction **Fardeau** permanente à ton deck. Gagne 200 or. |

### 7.2 Les événements narratifs

| Événement | Choix et conséquences |
|---|---|
| **Les Gardiens des Sources** | Des élémentaires d'eau prisonniers de la lave. **Accepter leur quête :** le prochain boss secondaire que tu affronteras porte une rune ; si tu le bats, tu reçois l'**Eau des profondeurs**, qui affaiblit Vulkhar (voir §6). **Refuser :** ils te soignent de 10 PV. |
| **La rivière de lave** | Un passage étroit au-dessus de la lave. **Traverser :** perds 8 PV. **Faire le détour :** le prochain nœud devient un pack de trash difficile. **Construire un pont** (si tu as une carte d'Ingénierie) : rien ne se passe. |
| **La forge éteinte** | Une forge naine abandonnée. **Guerrier :** tu trouves la **Lame brisée de Brisemonts** (étape 1 de la quête). **Autres classes :** rallumer la forge (perds 6 PV, améliore 2 cartes) ou fouiller les décombres (40 or). |
| **Ventor, Prince des tempêtes** | **N'apparaît que si le Voleur a les deux Fermoirs de l'orage.** Ventor, libéré, forge **Sillon d'orage**. |
| **Le campement du vieux trappeur** | Un vieux chasseur nain blessé. **Chasseur :** il te confie le **Bois ancien** (étape 1 de Corde-des-anciens). **Autres classes :** le soigner (perds 1 potion, il te donne une carte de Premiers soins) ou l'ignorer. |
| **Le cercle des anciens** | Un cercle de pierres où murmurent des esprits. **Chaman :** ils te confient la **Tête du marteau** (étape 1 du Marteau des ancêtres). **Autres classes :** les écouter (retire une Malédiction de ton deck, ou soigne 10 PV). |
| **La chapelle effondrée** | Une chapelle naine écrasée par la roche. **Prêtre :** tu trouves le **Bâton nu** (étape 1 d'Équinoxe). **Autres classes :** prier (+5 PV max) ou piller l'autel (80 or, mais une malédiction Fardeau). |
| **Le fantôme du forgeron** | Un forgeron spectral, paisible, qui veut finir son dernier ouvrage. **L'aider :** perds 10 PV, il améliore ton arme (l'objet de ton emplacement Arme gagne +2 dégâts pour la run). **Le libérer** (Paladin ou Prêtre) : il t'offre un objet d'équipement rare. **Partir :** rien. |
| **Un gobelin coincé dans un coffre** | **Le libérer :** 50 % d'avoir un objet, 50 % que ce soit un Gobelin mimique (combat caché). **Prendre le coffre et partir :** 120 or, mais une malédiction Fardeau. |
| **Le joueur qui fonce** | Un aventurier fonce dans un pack de Molosses en hurlant son propre nom. **L'aider :** combat difficile (pack d'étage 6 à 8), puis il te donne un objet rare. **Le laisser :** rien ne se passe. On entend un wipe au loin. |

### 7.3 Les combats cachés de l'acte 1

| Combat | Ennemis | Récompense |
|---|---|---|
| **L'embuscade cendreuse** | 3 Éclaireurs cendreux, qui agissent **avant** ton premier tour | Récompense normale |
| **Le gobelin mimique** | 1 Gobelin mimique (45 PV, Morsure 9, puis Avaler : vole 15 or s'il touche) | 100 à 150 or |
| **La patrouille de la flamme** | 1 Prêtre de la flamme + 1 Seigneur des cendres | Un objet d'équipement en plus |

---

## 8. Chiffres de référence

Pour guider l'équilibrage, un joueur « moyen » en fin d'acte 1 a environ :
- **70 à 85 PV max** ;
- un deck de **15 à 18 cartes**, dont 3 à 5 améliorées ;
- **2 à 4 objets d'équipement** ;
- **2 à 3 sorts de barre**.

| Combat | Dégâts infligés par les ennemis par tour (ordre de grandeur) | Durée visée |
|---|---|---|
| Trash facile (étages 1 à 4) | 6 à 12 | 3 à 4 tours |
| Trash difficile (étages 6 à 8) | 12 à 20 | 4 à 5 tours |
| Boss secondaire | 10 à 20, avec des pics à 25 | 6 à 8 tours (enrage au tour 10) |
| Vulkhar | 14 à 25, avec le Marteau des flammes | 10 à 12 tours (enrage au tour 14) |

---

## 9. Ce que l'acte teste, classe par classe

| Classe | Combats favorables | Combats difficiles |
|---|---|---|
| **Guerrier** | Croc-de-lave (Rage du berserker), Krâgg (gros dégâts rapides) | Morvax (aucune dissipation) |
| **Mage** | Sœur Cendrine (Clignement), Gorlok (Métamorphose sur les Éclats) | **Zhaal** (contre les Sorts) |
| **Démoniste** | Krâgg (DoT sur un boss qui se soigne), Brannoc | Zhaal, Baron Vossk (Embrasement de mana) |
| **Prêtre** | Morvax (dissipation), Baron Vossk (survie) | Krâgg (dégâts trop lents face à sa Puissance) |
| **Voleur** | Brannoc (interruptions), Krâgg (dégâts rapides) | Gorlok (Éclats qui explosent sur une classe fragile) |
| **Paladin** | Sœur Cendrine (Aura de résistance), les Forgerons spectraux (morts-vivants) | Saldris (renvoi de dégâts sur ses Attaques) |
| **Chasseur** | Gorlok et Vulkhar (adds), Krâgg (Flèche apaisante contre l'enrage) | Morvax (aucune dissipation) |
| **Chaman** | Sœur Cendrine (Pas du loup spectral), Brannoc (Choc tellurique) | Croc-de-lave (main réduite pendant la mise en place des totems) |
| **Druide** | Saldris (changer de forme selon le bouclier), Morvax | Baron Vossk (énergie volée alors que changer de forme coûte de l'énergie) |

---

## 10. Notes de conception

- **Acte d'apprentissage :** chaque boss secondaire présente **une** mécanique. Vulkhar les combine.
- **À surveiller à l'équilibrage :**
  - Zhaal peut être très frustrant pour le Mage et le Démoniste. Si c'est le cas, son Contresort pourrait ne viser que le **4ᵉ** Sort du tour.
  - Le Marteau des flammes (2 cartes de moins au tour suivant) doit rester dangereux sans rendre le tour suivant injouable. À tester.
  - Gorlok doit rester faisable pour les classes sans contrôle : 5 dégâts par Éclat, c'est 20 dégâts si on tue tout.
  - La Couronne de cendres et la Flamme captive doivent rester des choix tentants malgré leur inconvénient.
- **Tags Mort-vivant :** seuls les Forgerons spectraux en ont dans cet acte. C'est suffisant pour l'acte 1, mais il faudra en placer davantage dans les actes 2 et 3 pour le Paladin.
- **Les PV de Vulkhar (300)** sont un premier jet, proche d'un boss d'acte 1 de *Slay the Spire*. Avec la barre de sorts, le joueur fait peut-être plus de dégâts : à ajuster aux premiers tests.
