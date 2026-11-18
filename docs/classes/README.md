# Fonctionnement des classes

> Wipe & Loot · Règles communes à toutes les classes · Version 0.1

Ce document explique **ce que toutes les classes ont en commun**. Le détail de chaque classe est dans sa fiche.

| Classe | Fiche | Difficulté | Déblocage |
|---|---|---|---|
| Guerrier | [GUERRIER.md](GUERRIER.md) | ⭐ | Expérience (ou classe de départ) |
| Mage | [MAGE.md](MAGE.md) | ⭐⭐ | Expérience |
| Paladin | [PALADIN.md](PALADIN.md) | ⭐ | Expérience |
| Voleur | [VOLEUR.md](VOLEUR.md) | ⭐⭐ | Expérience |
| Chasseur | [CHASSEUR.md](CHASSEUR.md) | ⭐⭐ | Expérience |
| Prêtre | [PRETRE.md](PRETRE.md) | ⭐⭐ | Expérience |
| Démoniste | [DEMONISTE.md](DEMONISTE.md) | ⭐⭐⭐ | Expérience |
| Chaman | [CHAMAN.md](CHAMAN.md) | ⭐⭐⭐ | Expérience |
| Druide | [DRUIDE.md](DRUIDE.md) | ⭐⭐⭐ | Expérience (dernière classe) |

**Le déblocage :** au premier lancement, le joueur choisit librement sa **classe de départ** parmi les 9. Les autres se débloquent par paliers d'**expérience totale**, et c'est le joueur qui choisit laquelle (voir le concept, §15.2). Les étoiles indiquent la difficulté conseillée.

---

## 1. Ce que chaque classe possède

Toutes les classes sont construites sur le **même modèle** :

| Élément | Commun à toutes les classes | Propre à chaque classe |
|---|---|---|
| **Énergie** | 3 par tour | — |
| **Pioche** | 5 cartes par tour | — |
| **PV max** | — | De 65 (Mage) à 80 (Guerrier, Paladin) |
| **Ressource de classe** | — | Rage, combo, Foi, totems, formes… |
| **Deck de départ** | 10 cartes : 4 attaques basiques, 4 défenses basiques, 2 cartes de classe | Le nom et l'effet des 2 cartes de classe |
| **Barre de sorts** | 3 emplacements (4 avec un talent ou un objet d'équipement) | Le sort de départ et les sorts à débloquer |
| **Cartes** | Environ 50 : un tronc commun (9 à 10 cartes) + 3 arbres (14 cartes chacun) | Le contenu |
| **Talents** | 3 arbres de 5 paliers | Le contenu |
| **Légendaire** | 1 arme, obtenue par une quête de 3 étapes | L'arme et la quête |

---

## 2. Comment on choisit sa spécialisation

**Comme dans un MMO : avant d'entrer dans le raid.** Les talents sont **permanents**. Ils se répartissent dans le **hall de la guilde**, avant de lancer une run, et restent fixés pendant toute la run.

```
Hors run (hall de la guilde)                    Pendant la run
────────────────────────────                    ──────────────
Guerrier niveau 7  →  7 points de talent        Deck de départ + Frappe mortelle
5 en Armes, 2 en Fureur                    ─►   Coup de pommeau dans la barre
(respec gratuit entre deux runs)                Les cartes proposées penchent vers Armes
```

1. Chaque classe a un **niveau de 1 à 10**, qui monte avec l'expérience gagnée à la fin de chaque run, victoire ou défaite.
2. **Chaque niveau donne 1 point de talent.** Au niveau 10, la classe a **10 points**, le maximum. Il faut environ **10 à 15 runs** pour y arriver.
3. Avant la run, le joueur répartit ses points dans **les 3 arbres** de sa classe. Le **respec est gratuit** entre deux runs.
4. **Plus il a de points dans un arbre, plus les cartes proposées après les combats viennent de cet arbre**, dès le premier combat.
5. Le **tronc commun** reste proposé quels que soient les talents.
6. On peut **mélanger** les arbres pour un build hybride. Avec 10 points pour 15 paliers, on ne peut pas tout prendre : il faut choisir.

**Pendant la run**, les boss ne donnent pas de point de talent. Ils donnent un objet de leur table de loot (ou, parfois, un sort de barre).

---

## 3. À quoi ressemble un arbre de talents

Chaque classe a **3 arbres**, et chaque arbre a **5 paliers**.

```
                ARBRE ARMES (Guerrier)

  Palier 1   [ Lame aiguisée ]   ou   [ Maîtrise tactique ]
                      │
  Palier 2   [ Plaies profondes ] ou  [ Entaille ]
                      │
  Palier 3   [ Sort : Coup de pommeau ] ou [ Impact ]
                      │
  Palier 4   [ Implacable ]      ou   [ Arme lourde ]
                      │
  Palier 5   ★ FRAPPE MORTELLE (carte épique) ★
```

**Les règles :**
- **Paliers 1 à 4 :** chaque point permet de choisir **1 talent parmi 2**. On peut changer ce choix gratuitement entre deux runs.
- **Il faut avoir 1 point dans le palier précédent** pour accéder au suivant. On monte l'arbre dans l'ordre.
- **Palier 5 :** pas de choix. Il débloque la **carte épique** de l'arbre : un exemplaire est ajouté au **deck de départ** de chaque run, et la carte peut aussi apparaître dans les récompenses.
- Les **sorts de barre** donnés par les talents sont dans la barre dès le début de la run.
- **Le contenu des paliers suit une logique commune :**

| Palier | Ce qu'on y trouve en général |
|---|---|
| **1** | Un petit bonus simple (+dégâts, +PV max, +1 ressource au départ). |
| **2** | Un bonus qui oriente le style de jeu. |
| **3** | **Un sort de barre** à choisir parmi deux. |
| **4** | Un bonus fort, ou un **4ᵉ emplacement** de barre de sorts. |
| **5** | **La carte épique** de la spécialisation. |

**Exemples de répartition pour un Guerrier de niveau 10 (10 points) :**

| Build | Armes | Fureur | Protection | Résultat |
|---|---|---|---|---|
| **Spécialiste** | 5 | 5 | 0 | Frappe mortelle **et** Sanguinaire dans le deck de départ |
| **Tank qui tape** | 0 | 5 | 5 | Sanguinaire et Heurt de bouclier |
| **Hybride large** | 4 | 3 | 3 | Pas de carte épique, mais beaucoup de bonus et plusieurs sorts de barre |

**Au début (niveau 1 à 4)**, avec peu de points, le joueur n'a pas encore de carte épique. C'est la phase d'apprentissage de la classe.

---

## 4. Les familles de mécaniques

Pour que les classes restent lisibles, leurs mécaniques reprennent quelques **familles** :

| Famille | Classes concernées |
|---|---|
| **Ressource qui se construit puis se dépense** | Guerrier (rage), Voleur (combo), Prêtre (Foi), Druide (rage et combo selon la forme), Mage (charges arcaniques) |
| **État à choisir (posture, forme, sceau…)** | Guerrier (postures), Druide (formes), Paladin (sceaux et auras), Chasseur (esprits) |
| **Entités alliées** | Démoniste (familier), Chasseur (compagnon), Chaman (totems) |
| **Effets sur la durée** | Démoniste et Prêtre (DoT), Mage (Brûlure), Voleur (Poison), Guerrier Armes (Saignement) |
| **Défense persistante** | Prêtre (Égide), Paladin (blocage renvoyé) |

---

## 5. Les rôles face aux mécaniques de raid

Chaque classe a des **forces et des faiblesses** face aux mécaniques des boss. Aucune classe n'est bloquée, mais certaines devront compter sur les potions et l'équipement.

| Classe | Interruption | Dissipation | Adds | Enrage | Survie |
|---|---|---|---|---|---|
| Guerrier | ✅ | ❌ | ✅ | ✅ | ✅ |
| Mage | ✅ | ➖ Malédiction | ✅✅ | ✅ | ❌ |
| Démoniste | ➖ | ➖ Magie (Molosse) | ✅ | ➖ | ✅ |
| Prêtre | ❌ (sauf Ombre) | ✅✅ | ➖ | ❌ | ✅✅ |
| Voleur | ✅ | ➖ (1 fois par combat) | ✅ | ✅✅ | ❌ |
| Paladin | ✅ | ✅ | ➖ | ➖ | ✅✅ |
| Chasseur | ✅ | ❌ | ✅✅ | ✅✅ | ➖ |
| Chaman | ✅ | ✅ Poison, Maladie | ✅ | ➖ | ✅ |
| Druide | ✅ | ✅ Malédiction, Poison | ➖ | ➖ | ✅ |
