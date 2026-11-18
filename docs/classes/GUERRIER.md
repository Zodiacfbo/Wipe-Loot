# Classe : le Guerrier

> Wipe & Loot · Fiche de classe · Version 0.1
> Les chiffres sont **indicatifs** : ils serviront de base aux premiers tests d'équilibrage.

---

## 1. Identité

> *« Chaque coup reçu me rend plus fort. Chaque coup donné rapproche la fin. »*

Le Guerrier est un combattant au corps à corps qui **se nourrit du combat**. Il commence chaque affrontement sans ressource et la construit en frappant et en encaissant, jusqu'à libérer des coups dévastateurs.

- **Rôle :** dégâts physiques ou tank, selon les talents.
- **Difficulté :** ⭐ Facile. C'est la **classe de départ**, débloquée dès le début.
- **Fantasme de jeu :** démarrer lentement, monter en puissance, puis tout raser avec une Exécution à pleine rage.

| Statistique | Valeur |
|---|---|
| **PV max** | 80 |
| **Énergie** | 3 par tour |
| **Ressource de classe** | Rage (0 à 10) |
| **Posture de départ** | Posture de combat |
| **Sort de barre de départ** | Charge |

---

## 2. Mécanique 1 : la Rage

- La rage va de **0 à 10**.
- Elle est **à 0 au début de chaque combat** et se perd à la fin du combat.
- Elle **ne diminue pas** d'un tour à l'autre pendant le combat.

**Comment gagner de la rage :**

| Source | Gain |
|---|---|
| Jouer une **Attaque** qui inflige des dégâts | +1 rage (par carte, pas par coup) |
| **Perdre des PV** à cause d'une attaque ennemie | +1 rage (par attaque reçue) |
| Les cartes et sorts qui en donnent | Charge, Cri de guerre, Rage sanglante… |

**Comment la dépenser :**
- Certaines cartes ont un **coût en rage** en plus de leur coût en énergie (affiché en rouge sur la carte). Exemple : *Frappe héroïque* coûte **1 énergie + 3 rage**.
- **Exécution** consomme **toute** la rage pour un coup proportionnel.

**L'intérêt :** le Guerrier est faible au premier tour et fort au troisième. Le joueur doit construire sa rage rapidement, puis choisir entre la dépenser régulièrement en Frappes héroïques ou la stocker pour une grosse Exécution.

---

## 3. Mécanique 2 : les Postures

Le Guerrier est toujours dans **une posture** parmi trois :

| Posture | Bonus | Contrepartie |
|---|---|---|
| ⚔️ **Combat** (posture de départ) | Tes Attaques qui coûtent de la rage infligent **+3 dégâts**. | Aucune. |
| 🔥 **Berserker** | **+1 rage supplémentaire** chaque fois que tu joues une Attaque. | Tu subis **20 % de dégâts en plus**. |
| 🛡️ **Défensive** | Tes cartes de blocage donnent **+3 blocage**. Tu gagnes 1 rage à chaque attaque reçue, **même si elle est entièrement bloquée**. | Tes Attaques infligent **20 % de dégâts en moins**. |

**Changer de posture :**
- **Une fois par tour, gratuitement**, avec le bouton de posture à côté du héros.
- Quand tu changes de posture, ta rage est **plafonnée à 3**. Le surplus est perdu. Le talent *Maîtrise tactique* relève ce plafond à 6.
- Certaines cartes changent aussi la posture, sans compter dans la limite d'un changement par tour.

**L'intérêt :** une décision à chaque tour. Le joueur peut passer en Défensive avant le gros coup annoncé par le boss, mais il perdra une partie de sa rage.

---

## 4. Deck de départ et barre de sorts

### 4.1 Deck de départ (10 cartes)

| Carte | Qté | Coût | Type | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Frappe** | 4 | 1 | Attaque | Inflige 6 dégâts. | 9 dégâts |
| **Parade** | 4 | 1 | Compétence | Gagne 5 blocage. | 8 blocage |
| **Frappe héroïque** | 1 | 1 + 3 rage | Attaque | Inflige 14 dégâts. | 18 dégâts |
| **Cri de guerre** | 1 | 0 | Compétence | Gagne 2 rage. Pioche 1 carte. | Gagne 3 rage |

### 4.2 Sort de barre de départ

| Sort | Coût | Recharge | Effet |
|---|---|---|---|
| **Charge** | 0 | 3 tours | Inflige 3 dégâts et gagne 3 rage. |

Au premier tour, Charge permet de lancer une Frappe héroïque immédiatement. C'est l'ouverture typique du Guerrier.

---

## 5. Les cartes (52)

**Légende des raretés :** C = Commune · PC = Peu commune · R = Rare · É = Épique (débloquée par le dernier palier de talent de son arbre).

**Nouveau mot-clé :** **Saignement (X)** : un DoT physique. La cible subit X dégâts au début de chacun de ses tours, pendant 3 tours. Appliquer un nouveau Saignement **ajoute** X et remet la durée à 3 tours.

**Précisions (prototype) :**
- **Peur** : l'ennemi ne fait rien à son prochain tour. « Sauf boss » vaut aussi pour les boss secondaires (même règle pour Désarmement).
- **Pouvoir** : la carte reste active jusqu'à la fin du combat (elle ne revient pas dans la pioche).
- **Éphémère** : si la carte est encore en main à la fin du tour, elle disparaît (Frappe de la main gauche).
- **Les cartes épiques** sont débloquées par le palier 5 de leur arbre : un exemplaire dans le deck de départ, et elles peuvent ensuite apparaître (rarement) dans les récompenses des boss secondaires.
- **Les récompenses de cartes** penchent vers les arbres où tu as mis des points (+50 % de chances par point pour les cartes de cet arbre).

### 5.1 Tronc commun (9 cartes)

Ces cartes apparaissent quel que soit l'arbre de talents investi.

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Enchaînement** | 1 | Attaque | C | Inflige 8 dégâts à la cible et 4 dégâts à un autre ennemi. | 11 / 6 |
| **Coup de tonnerre** | 1 | Attaque | C | Inflige 4 dégâts à tous les ennemis et leur applique Ralenti 1. | 7 dégâts |
| **Fracasser armure** | 1 | Compétence | C | Applique Armure fracassée (2 tours). Gagne 2 rage. | 3 tours |
| **Cri démoralisant** | 1 | Compétence | C | Applique Démoralisé à tous les ennemis (2 tours). Gagne 1 rage. | Coûte 0 |
| **Coup de bouclier** | 1 | Compétence | PC | **Interruption.** Inflige 4 dégâts. | 8 dégâts |
| **Interception** | 1 | Attaque | PC | Inflige 6 dégâts. Si la cible prépare une Incantation, elle est **retardée d'un tour**. | 9 dégâts |
| **Cri de bataille** | 1 | Pouvoir | PC | Gagne 2 Puissance. | 3 Puissance |
| **Ignorer la douleur** | 1 | Compétence | PC | Gagne 8 blocage. Ce tour-ci, gagne 1 rage à chaque attaque reçue, même bloquée. | 11 blocage |
| **Exécution** | 1 + toute la rage | Attaque | R | Inflige **4 dégâts par point de rage** dépensé. Si la cible a 30 % de PV ou moins : **8 dégâts par point**. | 5 / 10 par point |

### 5.2 Arbre Armes (14 cartes) : gros coups et saignements

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Taillade** | 0 | Attaque | C | Inflige 3 dégâts. Applique Saignement 2. | 5 / 3 |
| **Pourfendre** | 1 | Attaque | C | Applique Saignement 5. | Saignement 7 |
| **Fulgurance** | 0 + 1 rage | Attaque | C | Inflige 6 dégâts. **Ignore le blocage.** | 9 dégâts |
| **Frappe écrasante** | 2 | Attaque | C | Inflige 16 dégâts. | 21 dégâts |
| **Parade ripostée** | 1 | Compétence | C | Gagne 6 blocage. La prochaine attaque ennemie reçue ce tour-ci inflige 6 dégâts à l'attaquant. | 9 / 9 |
| **Coup de grâce** | 1 | Attaque | PC | Inflige 7 dégâts. Si la cible meurt, gagne 1 énergie et 3 rage. | 10 dégâts |
| **Balayage** | 1 | Compétence | PC | Tes 2 prochaines Attaques ce tour-ci touchent aussi un deuxième ennemi. | 3 Attaques |
| **Entaille profonde** | 1 | Pouvoir | PC | Chaque fois qu'une Attaque coûtant de la rage touche, applique Saignement 2. | Saignement 3 |
| **Cri d'intimidation** | 1 | Compétence | PC | Applique Peur à un ennemi (sauf boss). Les autres ennemis sont Démoralisés (1 tour). **Épuisé.** | Démoralisé 2 tours |
| **Concentration martiale** | 1 | Pouvoir | R | Au début de ton tour, si tu as 5 rage ou plus, gagne 1 énergie. | Coûte 0 |
| **Frappe du colosse** | 2 | Attaque | R | Inflige 10 dégâts. La cible **perd tout son blocage** et reçoit Armure fracassée (2 tours). | 14 dégâts |
| **Tempête d'acier** | 3 | Attaque | R | Inflige 4 dégâts à tous les ennemis, 4 fois. | 5 dégâts × 4 |
| **Maître d'armes** | 2 | Pouvoir | R | Tes Attaques qui coûtent de la rage infligent +4 dégâts. | Coûte 1 |
| **Frappe mortelle** | 2 + 3 rage | Attaque | É | Inflige 18 dégâts. La cible **ne peut plus être soignée** ce combat et reçoit Armure fracassée (1 tour). | 24 dégâts |

### 5.3 Arbre Fureur (14 cartes) : attaques en rafale et rage illimitée

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Coup de folie** | 0 | Attaque | C | Inflige 3 dégâts deux fois. Gagne 1 rage. | 4 × 2 |
| **Rage sanglante** | 0 | Compétence | C | Perds 3 PV. Gagne 4 rage. | Gagne 6 rage |
| **Frappe frénétique** | 1 | Attaque | C | Inflige 5 dégâts, +2 par Attaque déjà jouée ce tour-ci. | 7 dégâts, +3 par Attaque |
| **Hurlement furieux** | 1 | Compétence | C | Gagne 3 rage. Pioche 1 carte. | Pioche 2 cartes |
| **Soif de bataille** | 1 | Compétence | C | Pioche 2 Attaques depuis ta pioche. | Coûte 0 |
| **Ruée sanguinaire** | 2 | Attaque | PC | Inflige 3 dégâts 5 fois, sur des ennemis au hasard. | 3 dégâts × 7 |
| **Tourbillon** | 2 | Attaque | PC | Inflige 8 dégâts à tous les ennemis. | 11 dégâts |
| **Enragé** | 1 | Pouvoir | PC | Chaque fois que tu perds des PV, ta prochaine Attaque inflige +3 dégâts. | +5 dégâts |
| **Rafale** | 1 | Pouvoir | PC | Chaque fois que tu joues ta 3ᵉ Attaque d'un tour, pioche 1 carte. | Coûte 0 |
| **Ambidextrie** | 2 | Pouvoir | R | Au début de ton tour, ajoute une **Frappe de la main gauche** à ta main (0 énergie, 4 dégâts, Éphémère). | Coûte 1 |
| **Furie croissante** | 1 | Pouvoir | R | Chaque fois que ta rage atteint son maximum, gagne 1 Puissance. | Inné |
| **Fureur suicidaire** | 1 | Compétence | R | Pendant 3 tours, tes Attaques infligent 50 % de dégâts en plus, et tu subis 25 % de dégâts en plus. **Épuisé.** | 4 tours |
| **Furie inextinguible** | 2 | Pouvoir | R | Ta rage maximale passe à 15. Gagne 1 rage au début de chaque tour. | Gagne 2 rage par tour |
| **Sanguinaire** | 1 + 2 rage | Attaque | É | Inflige 12 dégâts. Te soigne de 4 PV. | 16 dégâts, soin 6 |

### 5.4 Arbre Protection (15 cartes) : blocage et contre-attaque

| Carte | Coût | Type | Rareté | Effet | Amélioration (+) |
|---|---|---|---|---|---|
| **Levée de bouclier** | 1 | Compétence | C | Gagne 9 blocage. Gagne 1 rage. | 12 blocage |
| **Inébranlable** | 2 | Compétence | C | Gagne 14 blocage. | 18 blocage |
| **Coup de semonce** | 1 | Attaque | C | Inflige 6 dégâts. Applique Démoralisé (1 tour). | 9 dégâts |
| **Vengeance** | 1 | Attaque | C | Inflige 8 dégâts. Coûte 0 si tu as entièrement bloqué une attaque depuis ton dernier tour. | 11 dégâts |
| **Résolution** | 0 | Compétence | C | Dépense la moitié de ta rage. Gagne 3 blocage par point de rage dépensé. | 4 blocage par point |
| **Provocation** | 1 | Compétence | PC | L'intention de la cible devient une **Attaque** de ses dégâts habituels. Si elle préparait une Incantation, celle-ci est annulée. **Épuisé.** | N'est plus Épuisé |
| **Désarmement** | 1 | Compétence | PC | La cible (sauf boss) ne peut pas attaquer à son prochain tour. Un boss inflige 30 % de dégâts en moins à son prochain tour. | Coûte 0 |
| **Charge du bouclier** | 2 | Attaque | PC | Inflige 10 dégâts. Gagne 10 blocage. | 13 / 13 |
| **Ténacité** | 1 | Pouvoir | PC | Au début de ton tour, gagne 3 blocage. | 5 blocage |
| **Peau de fer** | 1 | Pouvoir | PC | Gagne 2 Robustesse. | 3 Robustesse |
| **Cri de ralliement** | 1 | Compétence | PC | Gagne 6 blocage et 1 Robustesse. **Épuisé.** | 9 blocage |
| **Riposte au bouclier** | 1 | Pouvoir | R | Chaque fois qu'une attaque ennemie est entièrement bloquée, inflige 5 dégâts à l'attaquant. | 8 dégâts |
| **Garde de fer** | 2 | Pouvoir | R | Au début de ton tour, tu conserves la moitié de ton blocage au lieu de tout perdre. | Coûte 1 |
| **Bastion** | 2 | Pouvoir | R | Chaque fois que tu joues une carte qui donne du blocage, inflige 3 dégâts à tous les ennemis. | 5 dégâts |
| **Heurt de bouclier** | 1 + 2 rage | Attaque | É | Inflige des dégâts **égaux à ton blocage actuel**. | + 6 dégâts |

---

## 6. La barre de sorts

Le Guerrier commence avec **Charge**. Les autres sorts s'obtiennent par les **talents** (voir §7) et les **tables de loot** des boss secondaires.

| Sort | Coût | Recharge | Effet | Source principale |
|---|---|---|---|---|
| **Charge** | 0 | 3 tours | Inflige 3 dégâts et gagne 3 rage. | Départ |
| **Coup de pommeau** | 0 | 4 tours | **Interruption.** Inflige 2 dégâts. | Talent Armes, palier 3 |
| **Rage du berserker** | 0 | 3 tours | Gagne 5 rage. Immunité à la Peur et aux cartes rendues injouables jusqu'à ton prochain tour. | Talent Fureur, palier 3 |
| **Témérité** | 1 | 5 tours | Ce tour-ci, tes Attaques infligent 50 % de dégâts en plus. Tu subis 25 % de dégâts en plus jusqu'à ton prochain tour. | Talent Fureur, palier 4 |
| **Rempart** | 0 | 5 tours | Jusqu'à ton prochain tour, les dégâts que tu subis sont **réduits de moitié**. | Talent Protection, palier 3 |
| **Cri de défi** | 1 | 4 tours | L'intention de **tous les ennemis** devient une Attaque. Les Incantations en cours sont annulées. | Talent Protection, palier 3 |
| **Dernier rempart** | 0 | 1 fois par combat | Soigne 25 % de tes PV max. | Talent Protection, palier 4 |

**Les sorts de barre qu'on peut trouver dans les tables de loot** : *Cri de commandement* (1 énergie, recharge 4 : tous les ennemis Démoralisés 2 tours et +1 Robustesse), *Vague de choc* (1 énergie, recharge 3 : 6 dégâts à tous et Ralenti 1).

**Dans le prototype :** les sorts de talent sont dans la barre dès le début de la run. Seuls *Cri de commandement* et *Vague de choc* tombent sur les boss secondaires (1 chance sur 5). La barre a **3 emplacements** (4 avec le talent Quatrième emplacement) ; si les talents donnent plus de sorts que d'emplacements, la barre s'agrandit pour tous les accueillir. Un sort trouvé s'ajoute ou en remplace un.

**Rappel de règle :** un sort de barre ne se pioche pas : il est toujours là, mais il a un temps de recharge. Sur téléphone, un premier appui affiche le sort, un second le lance.

---

## 7. Les talents

**Rappel des règles (voir le concept, §9) :**
- Les talents sont **permanents** et se choisissent **avant la run**, dans le hall de la guilde. Le respec est gratuit entre deux runs.
- **1 point par niveau de classe**, jusqu'à **10 points** au niveau 10.
- 3 arbres de 5 paliers. Il faut avoir **1 point dans le palier précédent** d'un arbre pour accéder au suivant.
- Aux paliers 1 à 4, le joueur **choisit 1 talent parmi 2**.
- Le palier 5 débloque la **carte épique** de l'arbre : un exemplaire est ajouté au deck de départ de chaque run, et la carte peut aussi apparaître dans les récompenses.

### 7.1 Arbre Armes

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Lame aiguisée** : Frappe et Frappe héroïque infligent +2 dégâts. | **Maîtrise tactique** : changer de posture conserve jusqu'à 6 rage (au lieu de 3). |
| **2** | **Plaies profondes** : tes Saignements durent 1 tour de plus. | **Entaille** : tes Attaques qui coûtent 2 énergie ou plus appliquent Saignement 2. |
| **3** | **Coup de pommeau** : ajoute ce sort à ta barre. | **Impact** : Exécution passe au bonus de dégâts à 40 % de PV de la cible au lieu de 30 %. |
| **4** | **Implacable** : quand tu tues un ennemi, gagne 2 rage et pioche 1 carte. | **Arme lourde** : tes Attaques qui coûtent 2 énergie ou plus infligent +4 dégâts. |
| **5** | **Frappe mortelle** (carte épique) | — |

### 7.2 Arbre Fureur

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Cruauté** : commence chaque combat avec 1 Puissance. | **Colère intérieure** : gagne 1 rage au début de chaque tour. |
| **2** | **Voix de stentor** : tes cartes de Cri donnent 1 rage de plus, et leurs débuffs durent 1 tour de plus. | **Main gauche** : tes Attaques qui coûtent 0 énergie infligent +2 dégâts. |
| **3** | **Rage du berserker** : ajoute ce sort à ta barre. | **Fureur sans fin** : ta rage maximale passe à 15. |
| **4** | **Témérité** : ajoute ce sort à ta barre. | **Frénésie** : quand tu joues ta 3ᵉ Attaque d'un tour, gagne 1 énergie (1 fois par tour). |
| **5** | **Sanguinaire** (carte épique) | — |

### 7.3 Arbre Protection

| Palier | Choix A | Choix B |
|---|---|---|
| **1** | **Bouclier lourd** : tes cartes de blocage donnent +2 blocage. | **Robuste** : +8 PV max. |
| **2** | **Garde haute** : commence chaque combat avec 10 blocage. | **Présence menaçante** : au début de chaque combat, tous les ennemis sont Démoralisés (1 tour). |
| **3** | **Rempart** : ajoute ce sort à ta barre. | **Cri de défi** : ajoute ce sort à ta barre. |
| **4** | **Dernier rempart** : ajoute ce sort à ta barre. | **Quatrième emplacement** : ta barre de sorts gagne un 4ᵉ emplacement. |
| **5** | **Heurt de bouclier** (carte épique) | — |

---

## 8. Le légendaire : Brisemonts

> *L'épée des anciens rois nains du mont Durgal, brisée lorsque les forges ont sombré dans la lave.*

| Emplacement | Effet |
|---|---|
| **Arme** (légendaire) | Gagne **+1 rage supplémentaire** chaque fois que tu perds des PV. **Exécution** inflige toujours son bonus de dégâts, quels que soient les PV de la cible. |

**La quête (acte 1, 3 étapes) :**
1. **Événement « La forge éteinte »** : dans une forge naine abandonnée, le Guerrier trouve la **Lame brisée de Brisemonts**.
2. **Vaincre Krâgg le Mange-roche** (boss secondaire) : il fait tomber le **Cœur de la montagne**, une pierre en fusion.
3. **À un feu de camp de l'acte 2 ou plus** : une option **« Reforger »** remplace le repos et l'amélioration. Brisemonts est équipée dans l'emplacement Arme. On garde la Lame et le Cœur en attendant.

Si Krâgg n'est pas présent sur la carte de cette run, la quête ne peut pas être terminée. C'est voulu : un légendaire reste un moment rare.

---

## 9. Les builds

| Build | Arbres | Cartes clés | Plan de jeu |
|---|---|---|---|
| **L'Exécuteur** | Armes | Pourfendre, Entaille profonde, Frappe du colosse, Exécution, Frappe mortelle | Saigner la cible, accumuler la rage, puis finir le boss en une Exécution. |
| **Le Berserker** | Fureur | Coup de folie, Ambidextrie, Rafale, Furie inextinguible, Sanguinaire | Jouer beaucoup d'Attaques bon marché en posture Berserker. La rage ne s'arrête jamais. |
| **Le Mur** | Protection | Levée de bouclier, Garde de fer, Bastion, Riposte au bouclier, Heurt de bouclier | Empiler le blocage, puis le convertir en dégâts avec Heurt de bouclier. |
| **Le Tank qui tape** | Protection + Fureur | Ignorer la douleur, Enragé, Vengeance, Sanguinaire | Encaisser en posture Défensive pour générer de la rage, puis frapper fort en Berserker. |

---

## 10. Forces et faiblesses face aux mécaniques de raid

| Mécanique | Le Guerrier… |
|---|---|
| **Interruption** | ✅ A plusieurs options : Coup de bouclier, Coup de pommeau, Provocation, Cri de défi. Interception retarde une incantation. |
| **Enrage timer** | ✅ Très bon : Exécution et les builds Fureur finissent vite les boss. |
| **Adds** | ✅ Bon : Enchaînement, Coup de tonnerre, Tourbillon, Tempête d'acier. |
| **Peur, cartes injouables** | ✅ Rage du berserker l'immunise. |
| **Dissipation** | ❌ **Aucune.** Le Guerrier ne peut pas retirer les malédictions, poisons ou effets magiques. Il doit compter sur les potions (Purification), l'équipement (Amulette de purification) ou encaisser. C'est sa vraie faiblesse. |
| **Zones de feu** | ➖ Neutre : il paie le coût de 1 énergie comme tout le monde. |
| **Début de combat** | ❌ Lent : sans rage au tour 1, il dépend de Charge et du Cri de guerre. |

---

## 11. Notes de conception

- **Classe de départ :** les mécaniques sont faciles à comprendre (« je frappe, j'ai de la rage, je fais un gros coup »), mais les postures et Exécution donnent de la profondeur.
- **À surveiller à l'équilibrage :**
  - Exécution avec 15 rage (Furie inextinguible) : jusqu'à 120 dégâts sous 30 % de PV. C'est voulu comme fantasme, mais il faudra peut-être plafonner.
  - Garde de fer combinée à Bastion et Heurt de bouclier pourrait rendre le build Mur trop sûr.
  - La pénalité de rage au changement de posture doit rester assez forte pour que la posture soit une vraie décision.
- **Testé en premier dans le prototype :** le deck de départ, Charge, les 3 postures, et 10 à 15 cartes du tronc commun et de l'arbre Armes.
