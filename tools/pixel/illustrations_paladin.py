"""Les illustrations des cartes du Paladin (32 x 32 pixels).
Palette : l'or et le blanc de la Lumière, l'acier des armes, le violet des Morts-vivants et des Démons."""
import math
from illustrations import ACIER, OR, arc, bouclier, coeur, crane, eclat, epee, etoile, flamme_de, goutte_de, marteau, nouveau, ondes, vitesse
from illustrations_mage import main

LUM, LUM_C, LUM_F = '#FFE27A', '#FFFFFF', '#D8B04A'
SOIN = '#7ED87A'
IMPIE = '#9A6AB8'
BLANC = '#E8E4DC'


# ---------- Formes de base ----------

def soleil(s, cx, cy, r, couleur=LUM, rayons=8):
    s.ellipse(cx - r, cy - r, cx + r, cy + r, couleur, glow=True)
    s.ellipse(cx - r * 0.5, cy - r * 0.5, cx + r * 0.3, cy + r * 0.3, LUM_C, glow=True)
    for i in range(rayons):
        a = i / rayons * math.pi * 2
        s.line([(cx + math.cos(a) * (r + 2), cy + math.sin(a) * (r + 2)), (cx + math.cos(a) * (r + 4), cy + math.sin(a) * (r + 4))], couleur, glow=True)


def sceau(s, cx, cy, r, couleur, motif):
    """Un sceau rond gravé (un disque doré, un motif au centre)."""
    s.ellipse(cx - r, cy - r, cx + r, cy + r, LUM_F)
    s.ellipse(cx - r + 2, cy - r + 2, cx + r - 2, cy + r - 2, couleur)
    arc(s, cx, cy, r - 1, 0, 360, LUM, glow=True)
    motif(s, cx, cy)


def halo(s, cx, cy, rx, ry, couleur=LUM):
    pts = [(cx + math.cos(t / 20 * math.pi * 2) * rx, cy + math.sin(t / 20 * math.pi * 2) * ry) for t in range(21)]
    s.line(pts, couleur, width=2, glow=True)


def marteau_sacre(s, x0, y0, x1, y1):
    marteau(s, x0, y0, x1, y1, tete='#E0D8C0')
    s.dots([(x1, y1 - 2), (x1 + 2, y1 - 4)], LUM_C, glow=True)


def bouclier_or(s, x0, y0, x1, y1):
    bouclier(s, x0, y0, x1, y1, bord=OR, fond=BLANC, centre=False)
    mx = (x0 + x1) // 2
    my = y0 + (y1 - y0) * 0.38
    r = max(2, (x1 - x0) // 6)
    s.ellipse(mx - r, my - r, mx + r, my + r, LUM, glow=True)


def soin(s, cx, cy, r=3):
    s.rect(cx - 1, cy - r, cx + 1, cy + r, SOIN, glow=True)
    s.rect(cx - r, cy - 1, cx + r, cy + 1, SOIN, glow=True)


def rayon(s, x, y0, y1, w=3, couleur=LUM):
    s.rect(x - w // 2, y0, x + w // 2, y1, couleur, glow=True)
    s.rect(x, y0, x, y1, LUM_C, glow=True)


# ---------- Départ ----------

def frappe_pal():
    s = nouveau()
    epee(s, 6, 27, 27, 5)
    s.dots([(26, 4), (29, 7)], LUM, glow=True)
    return s.render()


def parade_pal():
    s = nouveau()
    bouclier_or(s, 7, 4, 25, 29)
    return s.render()


# ---------- Tronc commun ----------

def parole_lumiere():
    s = nouveau()
    # Un livre saint ouvert, d'où monte la Lumière.
    s.poly([(3, 20), (16, 24), (16, 29), (3, 25)], BLANC)
    s.poly([(29, 20), (16, 24), (16, 29), (29, 25)], '#D8D0BC')
    s.line([(16, 24), (16, 29)], LUM_F)
    s.rect(3, 25, 29, 26, '#8A5A2A')
    rayon(s, 16, 4, 21, w=5)
    soleil(s, 16, 9, 4, rayons=8)
    return s.render()


def tempete_divine():
    s = nouveau()
    # Des éclairs de Lumière tombent du ciel sur toute la ligne.
    s.rect(0, 0, 31, 5, '#4A4058')
    for x in (6, 16, 26):
        s.poly([(x + 2, 4), (x - 2, 14), (x + 1, 14), (x - 2, 25), (x + 4, 11), (x + 1, 11), (x + 4, 4)], LUM, glow=True)
    s.rect(0, 27, 31, 31, '#4A3A28')
    s.dots([(4, 26), (14, 26), (24, 26), (28, 26)], LUM_C, glow=True)
    return s.render()


def frappe_croise():
    s = nouveau()
    epee(s, 4, 28, 24, 8)
    eclat(s, 25, 7, 6, LUM, LUM_C)
    return s.render()


def exorcisme():
    s = nouveau()
    crane(s, 9, 12, couleur='#C8B8D8', yeux='#3A1A48')
    rayon(s, 16, 0, 12)
    s.dots([(5, 6), (27, 8), (24, 28)], IMPIE, glow=True)
    return s.render()


def lumiere_bienfaisante():
    s = nouveau()
    main(s, 10, 18, couleur='#E8C6A4', manche=BLANC)
    soleil(s, 14, 10, 4)
    soin(s, 25, 22)
    return s.render()


def rempart_lumiere():
    s = nouveau()
    halo(s, 16, 7, 9, 3)
    bouclier_or(s, 9, 11, 23, 30)
    return s.render()


def mot_gloire():
    s = nouveau()
    # Un grand cœur de lumière, la croix de soin au centre.
    halo(s, 16, 16, 14, 14, LUM_F)
    coeur(s, 6, 7, 20, '#F0D070')
    soin(s, 16, 15, 4)
    return s.render()


def resistance_sacree():
    s = nouveau()
    halo(s, 16, 16, 13, 13, '#F0E6C0')
    flamme_de(s, 10, 9, 12, 16)
    return s.render()


def colere_sacree():
    s = nouveau()
    soleil(s, 16, 9, 5)
    for x in (4, 16, 28):
        s.line([(16, 12), (x, 30)], LUM, width=2, glow=True)
    return s.render()


# ---------- Arbre Sacré ----------

def lumiere_sacree():
    s = nouveau()
    rayon(s, 16, 0, 22, w=5)
    halo(s, 16, 25, 11, 4)
    soin(s, 16, 26, 3)
    return s.render()


def horion_sacre():
    s = nouveau()
    ondes(s, 4, 16, LUM, n=4, a0=-60, a1=60)
    s.ellipse(1, 13, 7, 19, LUM_C, glow=True)
    return s.render()


def main_sacree():
    s = nouveau()
    bouclier_or(s, 14, 4, 30, 26)
    main(s, 3, 18, couleur='#E8C6A4', manche=BLANC)
    soin(s, 7, 10)
    return s.render()


def lueur_protectrice():
    s = nouveau()
    arc(s, 16, 18, 12, 180, 360, LUM, width=2)
    arc(s, 16, 18, 8, 180, 360, LUM_C)
    s.rect(14, 18, 18, 29, '#C8A050')
    return s.render()


def eclair_foi():
    s = nouveau()
    s.poly([(18, 2), (9, 17), (15, 17), (11, 30), (24, 12), (17, 12), (22, 2)], LUM, glow=True)
    soin(s, 26, 25)
    return s.render()


def egide_lumiere():
    s = nouveau()
    # Un bouclier de lumière qui soigne.
    halo(s, 16, 16, 14, 14)
    bouclier_or(s, 7, 4, 25, 29)
    soin(s, 16, 18, 4)
    return s.render()


def faveur_divine():
    s = nouveau()
    etoile(s, 16, 14, 10)
    etoile(s, 6, 26, 3, LUM_C)
    etoile(s, 26, 26, 3, LUM_C)
    return s.render()


def lumiere_purificatrice():
    s = nouveau()
    goutte_de(s, 16, 4, 20, '#8FD8FF')
    s.dots([(8, 10), (24, 9), (6, 22), (26, 22)], LUM, glow=True)
    return s.render()


def rayonnement():
    s = nouveau()
    soleil(s, 16, 16, 6, rayons=12)
    ondes(s, 16, 16, LUM, n=2, a0=0, a1=360)
    return s.render()


def grace_croise():
    s = nouveau()
    coeur(s, 8, 9, 16, '#E8C860')
    soin(s, 16, 15, 3)
    return s.render()


def illumination():
    s = nouveau()
    s.ellipse(9, 4, 23, 18, LUM, glow=True)
    s.ellipse(12, 7, 18, 13, LUM_C, glow=True)
    s.rect(12, 19, 20, 24, '#8A8A94')
    s.rect(13, 25, 19, 27, '#6A6A74')
    return s.render()


def benediction_puissance():
    s = nouveau()
    s.poly([(5, 22), (5, 10), (10, 16), (16, 6), (22, 16), (27, 10), (27, 22)], OR)
    s.rect(5, 22, 27, 26, LUM_F)
    s.dots([(16, 18), (10, 22), (22, 22)], '#C83A4A', glow=True)
    return s.render()


def aurore_sacree():
    s = nouveau()
    s.rect(0, 22, 31, 31, '#3A2E40')
    soleil(s, 16, 22, 7)
    crane(s, 2, 22, couleur='#8A7A9A', yeux='#2A1A38')
    return s.render()


def avatar_lumiere():
    s = nouveau()
    halo(s, 16, 5, 7, 2)
    s.poly([(16, 8), (24, 18), (20, 30), (12, 30), (8, 18)], LUM, glow=True)
    for side in (-1, 1):
        s.poly([(16 + side * 4, 14), (16 + side * 15, 6), (16 + side * 13, 20)], LUM_C, glow=True)
    return s.render()


# ---------- Arbre Protection ----------

def bouclier_beni():
    s = nouveau()
    bouclier_or(s, 5, 3, 27, 30)
    halo(s, 16, 3, 8, 2)
    return s.render()


def pavois_sacre():
    s = nouveau()
    s.rect(7, 3, 25, 29, OR)
    s.rect(9, 5, 23, 27, BLANC)
    s.ellipse(13, 12, 19, 18, LUM, glow=True)
    for (x, y) in ((4, 8), (28, 14), (3, 24)):
        s.line([(x, y), (x + (3 if x < 16 else -3), y + 2)], '#F07A6A', glow=True)
    return s.render()


def marteau_piete():
    s = nouveau()
    marteau_sacre(s, 6, 28, 18, 10)
    ondes(s, 18, 26, LUM, n=2, a0=180, a1=360)
    return s.render()


def resolution_sacree():
    s = nouveau()
    bouclier_or(s, 8, 6, 24, 28)
    s.dots([(4, 4), (28, 6), (5, 26), (27, 27)], IMPIE)
    return s.render()


def garde_vigilante():
    s = nouveau()
    bouclier_or(s, 10, 8, 24, 29)
    s.ellipse(6, 2, 14, 8, BLANC)
    s.ellipse(8, 3, 12, 7, '#2A3A6A')
    return s.render()


def consecration():
    s = nouveau()
    s.rect(0, 24, 31, 31, '#4A3A28')
    for x in (5, 13, 21, 28):
        flamme_de(s, x - 3, 14, 7, 12, ext=LUM_F, mil=LUM, coeur=LUM_C)
    return s.render()


def bouclier_lance():
    s = nouveau()
    bouclier_or(s, 16, 4, 30, 22)
    vitesse(s, [(2, 8, 13, 10), (4, 14, 14, 14), (2, 20, 13, 18)], LUM)
    return s.render()


def bouclier_foi():
    s = nouveau()
    # Un écu simple marqué du losange de la Puissance sacrée.
    bouclier(s, 7, 4, 25, 29, bord=ACIER, fond='#5A6A80', centre=False)
    s.poly([(16, 9), (21, 15), (16, 21), (11, 15)], LUM, glow=True)
    s.poly([(16, 12), (18, 15), (16, 18), (14, 15)], LUM_C, glow=True)
    return s.render()


def sanctuaire():
    s = nouveau()
    s.poly([(16, 2), (29, 12), (3, 12)], OR)
    s.rect(6, 12, 26, 28, BLANC)
    s.rect(13, 18, 19, 28, '#3A2E20')
    soleil(s, 16, 8, 2, rayons=0)
    return s.render()


def ferveur_gardien():
    s = nouveau()
    bouclier_or(s, 4, 6, 20, 28)
    s.poly([(25, 4), (20, 15), (24, 15), (21, 26), (29, 12), (25, 12), (28, 4)], LUM, glow=True)
    return s.render()


def gardien_rois():
    s = nouveau()
    # La couronne des anciens rois au-dessus d'un grand bouclier.
    bouclier_or(s, 6, 9, 26, 31)
    s.poly([(8, 8), (8, 2), (12, 5), (16, 0), (20, 5), (24, 2), (24, 8)], OR)
    s.dots([(12, 6), (16, 3), (20, 6)], '#C83A4A', glow=True)
    return s.render()


def dernier_serment():
    s = nouveau()
    epee(s, 16, 4, 16, 28)
    halo(s, 16, 26, 10, 3)
    coeur(s, 22, 4, 8, '#D8303A')
    return s.render()


def juste_chatiment():
    s = nouveau()
    bouclier_or(s, 3, 6, 17, 26)
    s.line([(17, 15), (29, 9)], LUM, width=2, glow=True)
    eclat(s, 27, 10, 4, LUM, LUM_C)
    return s.render()


def bouclier_vertueux():
    s = nouveau()
    bouclier_or(s, 6, 2, 26, 30)
    epee(s, 4, 28, 28, 4)
    return s.render()


# ---------- Arbre Vindicte ----------

def lame_justice():
    s = nouveau()
    epee(s, 5, 28, 26, 4, lame=LUM_C)
    s.line([(9, 22), (25, 6)], LUM, glow=True)
    return s.render()


def ferveur():
    s = nouveau()
    epee(s, 4, 26, 22, 4)
    epee(s, 10, 30, 28, 8)
    return s.render()


def frappe_divine():
    s = nouveau()
    marteau_sacre(s, 4, 29, 20, 10)
    rayon(s, 22, 0, 8)
    eclat(s, 22, 10, 5, LUM, LUM_C)
    return s.render()


def priere_croise():
    s = nouveau()
    # Une bougie de prière, et sa petite flamme de Lumière.
    halo(s, 16, 9, 7, 7, LUM_F)
    flamme_de(s, 13, 4, 6, 9, ext=LUM_F, mil=LUM, coeur=LUM_C)
    s.rect(12, 13, 20, 27, BLANC)
    s.rect(9, 27, 23, 29, OR)
    return s.render()


def tourbillon_sacre():
    s = nouveau()
    arc(s, 16, 16, 12, 0, 300, LUM, width=2)
    arc(s, 16, 16, 7, 90, 400, LUM_C)
    marteau_sacre(s, 16, 16, 25, 6)
    return s.render()


def sentence():
    s = nouveau()
    # La hache du bourreau, lame dorée.
    s.line([(8, 30), (22, 6)], '#6A4426', width=2)
    s.poly([(18, 4), (29, 6), (27, 16), (21, 12)], LUM_F)
    s.poly([(20, 6), (27, 8), (25, 14)], LUM_C, glow=True)
    s.dots([(5, 6), (9, 3), (4, 12)], '#D8303A', glow=True)
    return s.render()


def marteau_courroux():
    s = nouveau()
    marteau_sacre(s, 6, 29, 22, 9)
    s.rect(2, 2, 10, 4, '#3A1A1A')
    s.rect(2, 2, 4, 4, '#D8303A')
    return s.render()


def zele():
    s = nouveau()
    flamme_de(s, 8, 3, 16, 26, ext=LUM_F, mil=LUM, coeur=LUM_C)
    return s.render()


def art_guerre():
    s = nouveau()
    # Deux épées croisées, le losange de la Puissance sacrée au-dessus.
    epee(s, 4, 29, 26, 7)
    epee(s, 28, 29, 6, 7)
    s.poly([(16, 1), (20, 5), (16, 9), (12, 5)], LUM, glow=True)
    return s.render()


def courroux_vengeur():
    s = nouveau()
    # Une épée ailée, nimbée d'une colère dorée.
    for side in (-1, 1):
        s.poly([(16 + side * 2, 12), (16 + side * 15, 4), (16 + side * 13, 10), (16 + side * 15, 14), (16 + side * 3, 18)], LUM_C, glow=True)
    epee(s, 16, 30, 16, 2, lame=LUM_C)
    s.dots([(5, 24), (27, 24), (9, 29), (23, 29)], '#E8562A', glow=True)
    return s.render()


def repentance():
    s = nouveau()
    s.ellipse(9, 6, 23, 20, '#8A7A6A')
    s.rect(9, 20, 23, 28, '#6A5A4A')
    for y in (10, 18):
        s.line([(4, y), (28, y + 4)], LUM, width=2, glow=True)
    return s.render()


def vengeance_pal():
    s = nouveau()
    crane(s, 3, 14, couleur='#8A7A9A', yeux='#2A1A38')
    epee(s, 12, 30, 28, 4)
    return s.render()


def croisade():
    s = nouveau()
    s.line([(8, 30), (8, 3)], '#6A4426', width=2)
    s.poly([(9, 3), (28, 6), (24, 11), (28, 16), (9, 18)], BLANC)
    soleil(s, 17, 10, 3, rayons=0)
    return s.render()


def verdict_templier():
    s = nouveau()
    rayon(s, 16, 0, 31, w=7)
    epee(s, 16, 4, 16, 28, lame=LUM_C)
    eclat(s, 16, 28, 5, LUM, LUM_C)
    return s.render()


ILLUSTRATIONS_PALADIN = {name: fn for name, fn in list(globals().items()) if callable(fn) and name in {
    'frappe_pal', 'parade_pal', 'parole_lumiere', 'tempete_divine', 'frappe_croise', 'exorcisme', 'lumiere_bienfaisante',
    'rempart_lumiere', 'mot_gloire', 'resistance_sacree', 'colere_sacree',
    'lumiere_sacree', 'horion_sacre', 'main_sacree', 'lueur_protectrice', 'eclair_foi', 'egide_lumiere', 'faveur_divine',
    'lumiere_purificatrice', 'rayonnement', 'grace_croise', 'illumination', 'benediction_puissance', 'aurore_sacree', 'avatar_lumiere',
    'bouclier_beni', 'pavois_sacre', 'marteau_piete', 'resolution_sacree', 'garde_vigilante', 'consecration', 'bouclier_lance',
    'bouclier_foi', 'sanctuaire', 'ferveur_gardien', 'gardien_rois', 'dernier_serment', 'juste_chatiment', 'bouclier_vertueux',
    'lame_justice', 'ferveur', 'frappe_divine', 'priere_croise', 'tourbillon_sacre', 'sentence', 'marteau_courroux',
    'zele', 'art_guerre', 'courroux_vengeur', 'repentance', 'vengeance_pal', 'croisade', 'verdict_templier',
}}
