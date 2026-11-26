"""Le Druide et ses formes (ils regardent vers la droite, comme le héros), 64 x 64.
Chaque fonction prend f, l'image de l'animation (0 à 3)."""
import math
import os
from sprites import RESPIRE, Sprite

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))
FEUILLE, FEUILLE_F, FEUILLE_C = '#4E8A3A', '#2E5A22', '#9AD87A'
ECORCE, ECORCE_F = '#7A5434', '#4A321E'
LUNE, LUNE_C = '#8FB8E8', '#E8F4FF'


def druide(f=0):
    """Le Druide en forme normale : robe de feuilles, bois de cerf, bâton noueux fleuri.
    f : il respire, sa robe ondule et les feuilles de son bâton tombent en tournant."""
    s = Sprite(64, 64)
    b = RESPIRE[f]
    c = [0, -1, -2, -1][f]
    # robe longue
    s.poly([(22, 22 + b), (42, 22 + b), (46 + c, 59), (18 + c, 59)], FEUILLE_F)
    s.poly([(24, 24 + b), (40, 24 + b), (42, 58), (22, 58)], FEUILLE)
    s.line([(32, 26 + b), (32, 57)], FEUILLE_F)
    s.rect(24, 57, 30, 60, ECORCE_F)
    s.rect(34, 57, 40, 60, ECORCE_F)
    with s.bouge(0, b):
        s.rect(23, 38, 41, 40, ECORCE, shade=False)  # ceinture de liane
        s.dots([(32, 39)], '#E8D84A', glow=True)
        # tête, barbe, bois de cerf
        s.ellipse(26, 9, 38, 22, '#C8A078')
        s.poly([(27, 17), (37, 17), (35, 27), (29, 27)], '#D8D2C4')  # barbe
        s.rect(29, 14, 30, 15, '#2A6A3A', shade=False)
        s.rect(34, 14, 35, 15, '#2A6A3A', shade=False)
        s.ellipse(25, 6, 39, 14, FEUILLE)  # capuche de feuilles
        for side in (-1, 1):
            x = 32 + side * 6
            s.line([(x, 8), (x + side * 4, 2), (x + side * 7, 0)], ECORCE, width=1)
            s.line([(x + side * 4, 2), (x + side * 3, -1)], ECORCE)
            s.line([(x + side * 2, 5), (x + side * 6, 4)], ECORCE)
        # bras et bâton noueux
        s.rect(40, 27, 46, 33, FEUILLE)
        s.line([(48, 60), (47, 40), (49, 24), (47, 12), (50, 6)], ECORCE, width=2)
        s.ellipse(44, 4, 54, 12, FEUILLE)
        s.dots([(46, 6), (51, 9), (49, 5)], '#E87AA8', glow=True)
        # feuilles qui tombent
        for k in range(2):
            x, y = 54 - k * 4, (14 + k * 16 + f * 6) % 56
            s.dots([(x + (f + k) % 2, y), (x + 1, y + 1)], FEUILLE_C, glow=True)
    return s.render()


def druide_ours(f=0):
    """Le Druide en ours : massif, brun, une rune verte sur le front. Il se balance et grogne."""
    s = Sprite(64, 64)
    e = [0, 1, 1, 0][f]
    s.rect(14, 44 + e, 22, 60, '#4A2E1A')
    s.rect(38, 44 - e + 1, 46, 60, '#4A2E1A')
    s.ellipse(8, 22 - e, 52, 54, '#6A4428')
    s.ellipse(18, 34 - e, 42, 52, '#8A5E3A')
    with s.bouge(0, e):
        s.ellipse(32, 10, 58, 36, '#7A5030')
        s.ellipse(32, 8, 40, 17, '#5A3820')
        s.ellipse(48, 8, 56, 17, '#5A3820')
        s.ellipse(46, 22, 62, 34, '#A07850')
        s.ellipse(58, 24, 62, 28, '#1A1210')
        s.rect(44, 18, 46, 20, '#1A1210', shade=False)
        s.dots([(40, 15), (41, 14), (42, 15)], FEUILLE_C, glow=True)  # rune
        if f % 2:
            s.poly([(50, 32), (60, 32), (56, 36)], '#5A1A1A')
            s.dots([(52, 32), (58, 32)], '#F4F0E8')
    return s.render()


def druide_felin(f=0):
    """Le Druide en félin : un grand chat sombre aux marques vertes, la queue qui fouette."""
    s = Sprite(64, 64)
    e = [0, 1, 1, 0][f]
    q = [0, -2, 0, 2][f]
    s.line([(10, 36), (4, 28 + q), (6, 20 + q)], '#3A3440', width=4)  # queue
    s.rect(12, 46, 17, 60, '#2A2430')
    s.rect(40, 46, 45, 60, '#2A2430')
    s.ellipse(8, 30 - e, 50, 50 - e, '#3A3440')
    for x in (16, 24, 32):
        s.line([(x, 34 - e), (x + 3, 40 - e)], FEUILLE_C, glow=True)
    with s.bouge(0, e):
        s.ellipse(38, 20, 58, 38, '#4A4250')
        s.poly([(40, 22), (42, 12), (47, 21)], '#4A4250')
        s.poly([(49, 21), (54, 12), (56, 23)], '#4A4250')
        s.poly([(52, 28), (62, 30), (58, 35), (50, 34)], '#5A5260')
        s.rect(47, 25, 49, 26, '#E8D84A', glow=True, shade=False)
        s.dots([(61, 30)], '#1A1A1E')
    return s.render()


def druide_astrale(f=0):
    """Le Druide en forme astrale : robe bleu nuit semée d'étoiles, un croissant de lune qui flotte et pulse."""
    s = Sprite(64, 64)
    b = RESPIRE[f]
    c = [0, -1, -2, -1][f]
    s.poly([(22, 22 + b), (42, 22 + b), (46 + c, 59), (18 + c, 59)], '#1E2A5A')
    s.poly([(24, 24 + b), (40, 24 + b), (42, 58), (22, 58)], '#2A3A7A')
    for k, (x, y) in enumerate([(27, 34), (36, 30), (30, 46), (38, 50), (25, 54)]):
        s.dots([(x, y + b)], LUNE_C if (k + f) % 2 else LUNE, glow=True)
    with s.bouge(0, b):
        s.ellipse(26, 9, 38, 22, '#C8A078')
        s.poly([(27, 17), (37, 17), (35, 27), (29, 27)], '#D8D2C4')
        s.rect(29, 14, 30, 15, LUNE_C, glow=True, shade=False)
        s.rect(34, 14, 35, 15, LUNE_C, glow=True, shade=False)
        s.ellipse(25, 6, 39, 14, '#2A3A7A')
        s.rect(40, 27, 46, 33, '#2A3A7A')
    # le croissant de lune qui flotte au-dessus de la main
    y = 6 + [0, -1, -2, -1][f]
    pts = [(52 + math.cos(math.radians(t)) * 7, y + 8 + math.sin(math.radians(t)) * 7) for t in range(60, 300, 12)]
    s.line(pts, ['#C8E0FF', '#E8F4FF', '#FFFFFF', '#E8F4FF'][f], width=3, glow=True)
    for k in range(8):
        a = k / 8 * math.pi * 2 + f * 0.4
        s.dots([(52 + math.cos(a) * 11, y + 8 + math.sin(a) * 11)], LUNE, glow=True)
    return s.render()


if __name__ == '__main__':
    for name, fn in (('druide', druide), ('druide_ours', druide_ours), ('druide_felin', druide_felin), ('druide_astrale', druide_astrale)):
        fn().save(os.path.join(DEST, f'{name}.png'))
    print('ok')
