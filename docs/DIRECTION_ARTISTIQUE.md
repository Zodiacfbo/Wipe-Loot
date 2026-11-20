# Direction artistique

> Wipe & Loot · Version 0.1

---

## 1. Le choix : du pixel art moderne pour tout le jeu

Wipe & Loot est entièrement en **pixel art moderne** : les héros, les monstres, les boss, les illustrations de cartes, les objets et les décors.

**Pourquoi ce style :**
- **Un style unifié :** les cartes, les personnages et les décors parlent la même langue visuelle.
- **Une production réaliste :** les images sont dessinées en code avec le générateur du dépôt (`tools/pixel/`), puis retouchées si besoin. On peut tenir un style cohérent sur des centaines d'images.
- **Lisible sur téléphone :** des formes simples, des couleurs franches, de bons contrastes.
- **Facile à animer :** une respiration, un coup ou une mort se font en ne changeant que quelques pixels.

Les essais (le Guerrier, Vulkhar et trois cartes) sont dans `assets/essais/`.

---

## 2. Les règles du style

| Règle | Détail |
|---|---|
| **Lumière** | Elle vient **d'en haut à gauche**. Chaque forme a un reflet sur ses bords haut-gauche et une ombre sur ses bords bas-droite. |
| **Contours** | Des **contours colorés** (une version sombre de la couleur voisine), jamais un noir pur. Ça adoucit les silhouettes. |
| **Éléments lumineux** | Le feu, la lave, la magie et les éclats n'ont **ni contour ni ombre** : ils « brillent ». |
| **Couleurs par forme** | 3 tons par couleur au maximum : la base, un ton clair et un ton sombre. |
| **Pas d'anticrénelage** | Les pixels restent nets. À l'affichage, on agrandit toujours par un **nombre entier** (× 2, × 3…), avec un rendu « pixelated ». |
| **Silhouette d'abord** | Un personnage doit être reconnaissable à sa seule silhouette, même en petit. |

---

## 3. Les tailles

| Élément | Taille en pixels | Affichage sur PC | Affichage sur téléphone |
|---|---|---|---|
| **Héros** | 64 × 64 | × 3 ou × 4 | × 2 |
| **Ennemis normaux** | 48 × 48 à 64 × 64 | × 3 | × 2 |
| **Boss secondaires** | 64 × 64 à 80 × 80 | × 3 | × 2 |
| **Boss de fin d'acte** | 96 × 96 (ou plus pour Yzhar et Sarvok) | × 3 à × 5 | × 2 |
| **Illustrations de cartes** | 32 × 32 | × 3 | × 2 |
| **Cadres de cartes** | 70 × 98 | × 3 (210 × 294) | × 2 (140 × 196) |
| **Icônes** (objets, sorts de barre, buffs) | 16 × 16 ou 24 × 24 | × 2 ou × 3 | × 2 |
| **Décors des actes** | 480 × 270 | × 4 (plein écran) | × 2 à × 3 |

---

## 4. Les cartes

- **Un cadre par rareté**, le même pour toutes les classes :

| Rareté | Couleur du cadre |
|---|---|
| De départ | Gris `#8A8178` |
| Commune | Blanc cassé `#E9E1D3` |
| Peu commune | Vert `#5FB86B` |
| Rare | Bleu `#4C8FE0` |
| Épique | Violet `#A66BE0` |
| Légendaire (objets uniquement) | Orange `#E8742A` |

- **La gemme de coût** (énergie) en haut à gauche, orange. **Une gemme de ressource** en dessous si la carte coûte de la rage, des éclats d'âme, de la Foi…, à la couleur de la ressource.
- **L'illustration** de 32 × 32 pixels au centre.
- **Le texte n'est pas dessiné dans l'image :** il est posé par-dessus par le jeu, en Nunito, pour rester net, traduisible et modifiable.
- **Textes courts :** sur téléphone, une carte ne dépasse pas 2 ou 3 lignes de texte.

---

## 5. Les polices

| Usage | Police | Remarque |
|---|---|---|
| **Textes en jeu** (cartes, PV, dégâts, boutons, menus, petits titres) | **Nunito** (graisses 600 à 800) | Arrondie et grasse : la plus lisible en petit, notamment sur téléphone où l'écran de jeu est réduit d'environ moitié. Elle se marie bien avec le pixel art. |
| **Grands titres** (nom du jeu, écrans de victoire, de wipe, de récompense) | **Cinzel** | Pour la touche fantasy, uniquement en grande taille (30 px et plus). |

Les deux sont des polices Google Fonts, gratuites.

**Pourquoi pas une police pixel ?** Une comparaison à la taille réelle d'un téléphone a montré que les polices pixel (Pixelify Sans, VT323) deviennent difficiles à lire une fois l'écran réduit. Le pixel art reste réservé aux images.

## 6. Les palettes

### 6.1 Interface

| Rôle | Couleur |
|---|---|
| Fond | `#17110D` |
| Panneaux | `#2B211A` |
| Bordures | `#4A372A` |
| Texte | `#F3EBDD` |
| Texte secondaire | `#B9AE9F` |
| Accent (énergie, boutons principaux) | `#E8742A` |
| Or (titres, sorts prêts) | `#E6C36A` |
| PV | `#C8413A` |
| Blocage | `#8FB8E8` |

### 6.2 Palettes des actes

| Acte | Couleurs dominantes |
|---|---|
| **Acte 1 — Les Profondeurs Ardentes** | Basalte `#3A2A26`, lave `#E8562A`, flamme `#F59A2E`, braise `#FFE27A` |
| **Acte 2 — L'Aire de Vhaeryx** | Pierre noire `#2A2030`, pourpre `#5A3A6E`, écailles chromatiques (rouge, bleu, vert, bronze), vert toxique `#7BD15A` |
| **Acte 3 — Irem** | Sable `#D9B27A`, ocre `#A8743A`, carapace noire `#1E1A22`, chair violette `#7A3A6E` |
| **Acte bonus — La Nécropole céleste** | Glace `#9FD3E8`, vert spectral `#7BE0B0`, os `#E3DCC8`, nuit `#141826` |

### 6.3 Couleurs des classes

Chaque classe a une couleur, utilisée pour son liseré dans l'interface et ses effets :

| Classe | Couleur |
|---|---|
| Guerrier | Rouge brique `#A8322A` |
| Mage | Bleu glace `#6FB6E8` |
| Démoniste | Violet sombre `#7A4AB0` |
| Prêtre | Blanc doré `#F0E6C8` |
| Voleur | Jaune `#E8D25A` |
| Paladin | Rose doré `#E8A0B8` |
| Chasseur | Vert mousse `#8AB85A` |
| Chaman | Bleu profond `#3A6AD0` |
| Druide | Orange feuille `#E8883A` |

---

## 7. Animations

**Tout sprite de héros, de familier ou d'ennemi est animé au repos**, y compris ceux des classes et des actes à venir (Chasseur, Chaman, Druide, acte 3, acte bonus) : on le dessine directement avec l'animation.

Le style est **marqué, comme le feu de camp** : 4 images en boucle, 0,2 s par image, des mouvements de 2 pixels, et les éléments lumineux qui changent de forme à chaque image.

| Animation | Images | Remarque |
|---|---|---|
| **Repos** | 4 | Le haut du corps descend de 2 pixels puis remonte (les jambes restent fixes). Les capes et les plumets flottent avec un léger retard. Les flammes dansent, la magie pulse, les créatures volantes flottent. |
| **Arrêt sur image** (à l'impact) | — | Fait par le jeu (`fx.ts`) : l'attaquant et la cible se figent un instant et la cible flashe en blanc ; plus long sur un gros coup. |
| **Changement de tenue** | — | Fait par le jeu : flash et onde de la couleur de la nouvelle tenue (le Prêtre en Forme d'Ombre). |
| **Attaque** *(à venir)* | 2 | Élan, puis frappe, joués pendant la charge vers la cible. |
| **Dégâts subis** *(à venir)* | 1 | Le sprite recule et grimace, en plus du flash. |
| **Incantation** *(à venir)* | 1 à 2 | Bras levé et lueur de la couleur du sort. |
| **Mort** *(à venir)* | 4 à 6 | Chute ou dissolution (en cendres, en lave, en poussière selon l'acte). |

**Comment on anime un sprite** (voir `tools/pixel/README.md`) :
- sa fonction de dessin prend le numéro de l'image `f` (0 à 3) ; l'image 0 sert aussi d'image fixe (archives, fiches) ;
- `s.bouge(dx, dy)` décale un groupe de formes, `danse(points, f)` fait danser les pointes d'une flamme, `RESPIRE[f]` donne le décalage de la respiration ;
- on l'ajoute à `ANIMES` dans `tools/pixel/animations.py` (qui exporte la planche `anim_<nom>.png` et un GIF d'aperçu dans `assets/essais/`) et dans `ANIMES` de `src/ui.ts`.
- **les ennemis sont animés automatiquement** : `anime_auto` rejoue les formes du sprite (le haut du corps respire, les pattes restent au sol, les flammes dansent, la magie pulse). Il suffit de leur donner un profil dans `PROFILS` (`sol` par défaut, `vol`, `fixe`) et de relancer `python3 animations.py`. Un boss peut ensuite recevoir une animation dessinée à la main (comme Vulkhar), qui remplace l'automatique ;
- **un nouvel ennemi** : l'ajouter au `SPRITES` de son acte, puis lancer `python3 animations.py` depuis `tools/pixel/`. Le test `tests/animations.test.ts` échoue si un ennemi ou une classe jouable n'a pas sa planche.

---

## 8. Production

1. **Générer** la base avec `tools/pixel/` (voir son README).
2. **Retoucher** à la main les détails importants (visages, mains, armes) dans un éditeur de pixel art (Aseprite, Piskel, LibreSprite…).
3. **Exporter** en PNG à la taille réelle. Le jeu se charge de l'agrandissement.
4. **Ranger** les fichiers dans `assets/` selon leur type (`heros/`, `ennemis/`, `boss/`, `cartes/`, `objets/`, `decors/`).

**Ordre de production conseillé :** d'abord ce qu'il faut pour le prototype (le Guerrier, ses cartes de départ, les ennemis de l'acte 1 et Vulkhar), puis classe par classe et acte par acte.
