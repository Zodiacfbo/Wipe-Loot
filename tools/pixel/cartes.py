"""Essai de cartes en pixel art pour Wipe & Loot.
Génère :
- des cadres de carte (70 x 98 pixels) pour 3 raretés, avec la gemme de coût et, au besoin, la gemme de rage ;
- 3 illustrations de cartes (32 x 32 pixels) : Frappe héroïque, Coup de bouclier, Frappe mortelle.
Le texte des cartes n'est pas dans les images : il est posé par-dessus dans la page, pour rester lisible.
"""
import os
from PIL import Image, ImageDraw
from sprites import Sprite, hexrgb, shift

# Les images sont écrites dans assets/essais/, à la racine du dépôt.
OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'essais'))
os.makedirs(OUT, exist_ok=True)
OUTLINE = (18, 10, 8)


def cadre(rarete_hex, rage=False):
    W, H = 70, 98
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rar = hexrgb(rarete_hex)
    clair = shift(rar, 0.15, 0)
    sombre = shift(rar, -0.2, 0.02)
    # silhouette et contour
    d.rectangle([1, 1, W - 2, H - 2], fill=OUTLINE)
    # bordure biseautée
    d.rectangle([2, 2, W - 3, H - 3], fill=sombre)
    d.rectangle([2, 2, W - 4, H - 4], fill=clair)
    d.rectangle([3, 3, W - 4, H - 4], fill=rar)
    d.rectangle([5, 5, W - 6, H - 6], fill=OUTLINE)
    # fond intérieur
    d.rectangle([6, 6, W - 7, H - 7], fill=(43, 33, 26))
    # plaque du titre
    d.rectangle([8, 7, W - 9, 16], fill=(90, 68, 51))
    d.rectangle([9, 8, W - 10, 15], fill=(58, 44, 34))
    # fenêtre de l'illustration
    d.rectangle([8, 18, W - 9, 52], fill=sombre)
    d.rectangle([9, 19, W - 10, 51], fill=(30, 23, 18))
    # bandeau du type
    d.rectangle([18, 54, W - 19, 61], fill=sombre)
    d.rectangle([19, 55, W - 20, 60], fill=(58, 44, 34))
    # zone de texte
    d.rectangle([8, 63, W - 9, 90], fill=(90, 68, 51))
    d.rectangle([9, 64, W - 10, 89], fill=(36, 26, 19))
    # coins décoratifs
    for (x, y) in ((4, 4), (W - 5, 4), (4, H - 5), (W - 5, H - 5)):
        d.point((x, y), fill=clair)
    # gemme de coût (énergie)
    gemme(d, 1, 1, 14, hexrgb('#E8742A'))
    if rage:
        gemme(d, 2, 16, 11, hexrgb('#B8352B'))
    return img


def gemme(d, x, y, size, col):
    d.ellipse([x, y, x + size - 1, y + size - 1], fill=OUTLINE)
    d.ellipse([x + 1, y + 1, x + size - 2, y + size - 2], fill=shift(col, -0.12, 0.02))
    d.ellipse([x + 1, y + 1, x + size - 3, y + size - 3], fill=col)
    d.point((x + 3, y + 3), fill=shift(col, 0.3, 0))
    d.point((x + 4, y + 3), fill=shift(col, 0.2, 0))
    d.point((x + 3, y + 4), fill=shift(col, 0.2, 0))


def frappe_heroique():
    s = Sprite(32, 32)
    s.poly([(27, 0), (28, 4), (32, 5), (28, 6), (27, 10), (26, 6), (22, 5), (26, 4)], '#FFE27A', glow=True)
    s.line([(3, 13), (9, 7)], '#F59A2E', glow=True)
    s.line([(6, 17), (13, 10)], '#F59A2E', glow=True)
    s.poly([(12, 22), (25, 6), (27, 8), (14, 24)], '#DCE3EC')
    s.poly([(25, 6), (29, 2), (27, 8)], '#F4F7FB')
    s.poly([(8, 19), (15, 26), (17, 24), (10, 17)], '#E6B84A')
    s.poly([(11, 23), (13, 25), (8, 30), (6, 28)], '#5A3822')
    s.ellipse(3, 27, 7, 31, '#E6B84A')
    return s.render()


def coup_de_bouclier():
    s = Sprite(32, 32)
    s.line([(0, 9), (4, 9)], '#8FB8E8', glow=True)
    s.line([(0, 15), (3, 15)], '#8FB8E8', glow=True)
    s.line([(0, 21), (4, 21)], '#8FB8E8', glow=True)
    s.poly([(27, 9), (28, 13), (32, 14), (28, 15), (27, 19), (26, 15), (22, 14), (26, 13)], '#FFE27A', glow=True)
    s.poly([(6, 4), (24, 4), (24, 18), (15, 28), (6, 18)], '#D9A441')
    s.poly([(8, 6), (22, 6), (22, 17), (15, 25), (8, 17)], '#9E2B24')
    s.ellipse(12, 10, 18, 16, '#C9D2DE')
    return s.render()


def frappe_mortelle():
    s = Sprite(32, 32)
    s.poly([(3, 8), (6, 5), (30, 26), (27, 29)], '#E8402A', glow=True)
    s.poly([(5, 8), (7, 7), (28, 26), (27, 27)], '#FFB0A0', glow=True)
    s.poly([(15, 3), (17, 1), (19, 3), (19, 20), (15, 20)], '#DCE3EC')
    s.rect(11, 20, 23, 22, '#E6B84A')
    s.rect(16, 23, 18, 27, '#5A3822')
    s.ellipse(15, 27, 19, 31, '#E6B84A')
    s.dots([(24, 6), (27, 10), (6, 22), (9, 27)], '#E8402A', glow=True)
    return s.render()


def cri():
    s = Sprite(32, 32)
    s.poly([(16, 1), (19, 10), (29, 7), (22, 15), (31, 21), (20, 20), (16, 30), (12, 20), (1, 21), (10, 15), (3, 7), (13, 10)], '#E8402A', glow=True)
    s.poly([(16, 7), (18, 13), (24, 12), (19, 16), (23, 21), (16, 18), (9, 21), (13, 16), (8, 12), (14, 13)], '#FFB04A', glow=True)
    s.ellipse(13, 12, 19, 18, '#FFE27A', glow=True)
    return s.render()


def flamme():
    s = Sprite(32, 32)
    s.poly([(16, 2), (22, 12), (26, 20), (22, 29), (10, 29), (6, 20), (10, 12)], '#E8562A', glow=True)
    s.poly([(16, 10), (20, 17), (21, 24), (16, 28), (11, 24), (12, 17)], '#F59A2E', glow=True)
    s.poly([(16, 17), (18, 22), (16, 27), (14, 22)], '#FFE27A', glow=True)
    return s.render()


def goutte():
    """Une goutte de sang : l'icône des cartes de Saignement."""
    s = Sprite(32, 32)
    s.poly([(16, 2), (19, 9), (24, 16), (25, 22), (22, 28), (16, 30), (10, 28), (7, 22), (8, 16), (13, 9)], '#B8202A')
    s.poly([(16, 8), (19, 13), (22, 19), (22, 24), (19, 27), (16, 27)], '#D83A3A', shade=False)
    s.ellipse(11, 16, 15, 23, '#FF9A9A', glow=True)
    s.dots([(5, 26), (27, 25), (25, 8)], '#D83A3A')
    return s.render()


def big(img, scale):
    return img.resize((img.width * scale, img.height * scale), Image.NEAREST)


if __name__ == '__main__':
    images = {
        'cadre_depart_rage': cadre('#8A8178', rage=True),
        'cadre_peu_commune': cadre('#5FB86B'),
        'cadre_epique_rage': cadre('#A66BE0', rage=True),
        'icone_frappe_heroique': frappe_heroique(),
        'icone_coup_de_bouclier': coup_de_bouclier(),
        'icone_frappe_mortelle': frappe_mortelle(),
    }
    for name, img in images.items():
        img.save(os.path.join(OUT, name + '.png'))
        big(img, 3).save(os.path.join(OUT, name + '_x3.png'))
    print('ok')
