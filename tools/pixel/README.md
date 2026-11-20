# Générateur de pixel art

Ces scripts dessinent les sprites et les cartes de Wipe & Loot **en code**, dans le style décrit dans [la direction artistique](../../docs/DIRECTION_ARTISTIQUE.md).

## Prérequis

- Python 3
- [Pillow](https://pypi.org/project/pillow/) : `pip install pillow`

## Utilisation

Depuis la racine du dépôt :

```bash
python3 tools/pixel/sprites.py
```

```bash
python3 tools/pixel/cartes.py
```

Les images sont écrites dans `assets/essais/` : une version à la taille réelle, et une version agrandie (× 3, × 5 ou × 6) pour les aperçus.

## Les fichiers

| Fichier | Contenu |
|---|---|
| `sprites.py` | Le moteur de dessin (la classe `Sprite`) et deux sprites d'essai : le Guerrier (64 × 64) et Vulkhar (96 × 96). |
| `cartes.py` | Les cadres de carte (70 × 98) par rareté, et trois illustrations de cartes (32 × 32) : Frappe héroïque, Coup de bouclier, Frappe mortelle. |

## Comment dessiner un nouveau sprite

Un sprite est une **pile de formes** (polygones, rectangles, ellipses, lignes, points), dessinées de l'arrière vers l'avant. Chaque forme a une couleur de base. Le moteur ajoute ensuite automatiquement :

- un **reflet** sur les bords haut-gauche de chaque forme (la lumière vient d'en haut à gauche) ;
- une **ombre** sur les bords bas-droite ;
- un **contour coloré** autour de la silhouette, plus sombre que la forme voisine, plutôt qu'un contour noir.

Les formes marquées `glow=True` (feu, lave, magie, éclats) n'ont **ni ombre ni contour** : elles paraissent briller. `shade=False` garde une forme d'une seule couleur (petits détails comme une boucle de ceinture).

```python
from sprites import Sprite

s = Sprite(32, 32)
s.poly([(12, 22), (25, 6), (27, 8), (14, 24)], '#DCE3EC')       # lame
s.poly([(8, 19), (15, 26), (17, 24), (10, 17)], '#E6B84A')      # garde
s.dots([(27, 4)], '#FFE27A', glow=True)                         # éclat lumineux
s.render().save('mon_icone.png')
```

## Limites

Le générateur produit une **bonne base**, mais pas un sprite fini : les visages, les mains et les petits détails gagneront à être retouchés pixel par pixel dans un éditeur (Aseprite, Piskel, LibreSprite…).

- `illustrations.py` : les illustrations des cartes (32 × 32), une par carte, exportées en `public/assets/carte_<id>.png`. Lancer `python3 illustrations.py` depuis `tools/pixel/`.

## Animer un sprite

Les sprites animés sont des **planches de 4 images côte à côte** (`public/assets/anim_<nom>.png`), jouées en boucle par le jeu comme le feu de camp. Les règles sont dans la [direction artistique](../../docs/DIRECTION_ARTISTIQUE.md), §7.

```python
from sprites import RESPIRE, Sprite, danse

def mon_heros(f=0):          # f = numéro de l'image, de 0 à 3
    s = Sprite(64, 64)
    s.rect(24, 47, 38, 60, '#5E6670')              # les jambes ne bougent pas
    with s.bouge(0, RESPIRE[f]):                    # le haut du corps respire
        s.rect(22, 24, 42, 46, '#8C96A3')
        s.poly(danse([(30, 20), (33, 8), (36, 20)], f), '#F59A2E', glow=True)  # une flamme qui danse
    return s.render()
```

Puis l'ajouter à `ANIMES` dans `animations.py` et lancer `python3 animations.py` depuis `tools/pixel/` : la planche va dans `public/assets/`, l'image fixe (l'image 0) aussi, et un GIF agrandi dans `assets/essais/` pour vérifier. Enfin, déclarer le fichier dans `ANIMES` de `src/ui.ts`.

### Les ennemis : animation automatique

Les ennemis n'ont pas besoin d'être redessinés : `anime_auto(fn, profil)` rejoue les formes de leur sprite image par image. Le haut du corps respire, le bas (pattes, socle) reste au sol, les pointes des flammes dansent et les grandes lueurs pulsent. Profils : `sol` (par défaut), `vol` (tout le sprite flotte), `fixe` (seules les lueurs vivent). Ils sont réglés dans `PROFILS` de `animations.py`.

**Après avoir ajouté un ennemi**, lancer `python3 animations.py` : sa planche `anim_ennemi_<nom>.png` est créée. Sans elle, `tests/animations.test.ts` échoue.
