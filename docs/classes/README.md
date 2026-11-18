# Fonctionnement des classes

> Wipe & Loot · Règles communes à toutes les classes · Version 0.1

Ce document explique **ce que toutes les classes ont en commun**. Le détail de chaque classe est dans sa fiche.

| Classe | Fiche | Difficulté | Déblocage |
|---|---|---|---|
| Guerrier | [GUERRIER.md](GUERRIER.md) | ⭐ | Disponible dès le départ |
| Mage | [MAGE.md](MAGE.md) | ⭐⭐ | Expérience |
| Paladin | [PALADIN.md](PALADIN.md) | ⭐ | Expérience |
| Voleur | [VOLEUR.md](VOLEUR.md) | ⭐⭐ | Expérience |
| Chasseur | [CHASSEUR.md](CHASSEUR.md) | ⭐⭐ | Expérience |
| Prêtre | [PRETRE.md](PRETRE.md) | ⭐⭐ | Expérience |
| Démoniste | [DEMONISTE.md](DEMONISTE.md) | ⭐⭐⭐ | Expérience |
| Chaman | [CHAMAN.md](CHAMAN.md) | ⭐⭐⭐ | Expérience |
| Druide | [DRUIDE.md](DRUIDE.md) | ⭐⭐⭐ | Expérience (dernière classe) |

L'ordre exact de déblocage reste à décider.

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
| **Barre de sorts** | 3 emplacements (4 avec un talent ou une relique) | Le sort de départ et les sorts à débloquer |
| **Cartes** | Environ 50 : un tronc commun (9 à 10 cartes) + 3 arbres (14 cartes chacun) | Le contenu |
| **Talents** | 3 arbres de 5 paliers | Le contenu |
| **Légendaire** | 1 arme, obtenue par une quête de 3 étapes | L'arme et la quête |

---

## 2. Comment on choisit sa spécialisation

**On ne la choisit pas au départ.** On choisit seulement une **classe**. La spécialisation se construit **pendant la run**, au fil des points de talent.

```
Début de run          Après le 1er boss       Après le 3e boss        Fin de run
─────────────         ─────────────────       ────────────────        ──────────
Guerrier              1 point en Armes        3 points en Armes       Un Guerrier
(aucune spé)    ─►    (les récompenses   ─►   (Coup de pommeau   ─►   Armes, avec
                       penchent vers           dans la barre)          Frappe mortelle
                       Armes)                                          et 1-2 points
                                                                       ailleurs
```

1. **Après chaque boss** (boss secondaire ou boss de fin d'acte), le joueur gagne **1 point de talent**. Sur une run complète, cela fait environ **6 à 9 points**.
2. Il place ce point dans **l'un des 3 arbres** de sa classe.
3. **Plus il investit dans un arbre, plus les cartes proposées après les combats viennent de cet arbre.** C'est ce qui fait naître la spécialisation : un Guerrier qui met ses points en Protection verra surtout des cartes de blocage.
4. Le **tronc commun** reste proposé quels que soient les talents.
5. On peut **mélanger** les arbres pour un build hybride, mais on n'aura alors pas les cartes épiques de chaque arbre.

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
- **Paliers 1 à 4 :** le joueur choisit **1 talent parmi 2**. L'autre talent du palier est perdu pour cette run.
- **Il faut avoir 1 point dans le palier précédent** pour accéder au suivant. On monte l'arbre dans l'ordre.
- **Palier 5 :** pas de choix. Il débloque la **carte épique** de l'arbre : un exemplaire est ajouté au deck, et la carte peut ensuite apparaître dans les récompenses.
- **Le contenu des paliers suit une logique commune :**

| Palier | Ce qu'on y trouve en général |
|---|---|
| **1** | Un petit bonus simple (+dégâts, +PV max, +1 ressource au départ). |
| **2** | Un bonus qui oriente le style de jeu. |
| **3** | **Un sort de barre** à choisir parmi deux. |
| **4** | Un bonus fort, ou un **4ᵉ emplacement** de barre de sorts. |
| **5** | **La carte épique** de la spécialisation. |

**Exemple de répartition sur une run de 8 points :**

| Arbre | Points | Résultat |
|---|---|---|
| Armes | 5 | Les 5 paliers, Frappe mortelle débloquée |
| Fureur | 2 | Paliers 1 et 2 |
| Protection | 1 | Palier 1 |

Avec 6 à 9 points, on peut **compléter un arbre** et en entamer un ou deux autres, ou **monter deux arbres jusqu'au palier 3 ou 4** pour un vrai hybride.

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

Chaque classe a des **forces et des faiblesses** face aux mécaniques des boss. Aucune classe n'est bloquée, mais certaines devront compter sur les potions ou les cartes de profession.

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
