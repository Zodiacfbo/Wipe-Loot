"""Le Chasseur et ses compagnons (ils regardent vers la droite, comme le héros).
Chaque fonction prend f, l'image de l'animation (0 à 3)."""
import os
from sprites import RESPIRE, Sprite

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))
VERT, VERT_F, VERT_C = '#4E7A34', '#2E4A22', '#8FD49A'
CUIR, CUIR_F = '#7A5434', '#4A321E'
BOIS = '#8A5A2E'


def chasseur(f=0):
    """Le Chasseur : cape verte à capuche, carquois dans le dos, arc tendu vers la droite.
    f : il respire, sa cape flotte, la corde de l'arc vibre et la pointe de la flèche brille."""
    s = Sprite(64, 64)
    b = RESPIRE[f]
    c = [0, -1, -2, -1][f]
    # cape
    s.poly([(20, 20 + b), (40, 20 + b), (44 + c, 58), (14 + c, 58)], VERT_F)
    # carquois et flèches (dans le dos)
    with s.bouge(0, b):
        s.poly([(16, 18), (21, 16), (27, 40), (22, 42)], CUIR_F)
        for x in (17, 19, 21):
            s.line([(x, 17), (x - 2, 10)], '#C8B88A')
            s.dots([(x - 2, 9), (x - 3, 9)], '#E8402A')
    # jambes et bottes (fixes)
    s.rect(24, 46, 30, 57, '#4A4030')
    s.rect(34, 46, 40, 57, '#5A4E3A')
    s.rect(23, 55, 31, 60, CUIR_F)
    s.rect(33, 55, 41, 60, '#5A3E26')
    with s.bouge(0, b):
        # tunique de cuir, ceinture et sacoche
        s.poly([(24, 24), (40, 24), (42, 46), (22, 46)], CUIR)
        s.poly([(25, 25), (39, 25), (40, 32), (24, 32)], VERT)
        s.rect(22, 40, 42, 42, CUIR_F)
        s.rect(31, 40, 33, 42, '#D8B04A', shade=False)
        s.rect(36, 42, 41, 47, '#5A3E26')
        # capuche, visage dans l'ombre, yeux verts
        s.ellipse(23, 6, 41, 26, VERT)
        s.poly([(23, 16), (41, 16), (44, 26), (20, 26)], VERT)
        s.ellipse(27, 12, 37, 23, '#2A2014')
        s.rect(30, 16, 31, 17, VERT_C, glow=True, shade=False)
        s.rect(35, 16, 36, 17, VERT_C, glow=True, shade=False)
        s.poly([(28, 20), (36, 20), (34, 23), (30, 23)], '#8A6A4A')  # barbe courte
        # bras arrière (tient la corde) et bras avant (tient l'arc)
        t = [0, 1, 1, 0][f]
        s.rect(38, 28, 46, 32, CUIR)
        s.rect(26 - t, 28, 33 - t, 32, CUIR_F)
        # l'arc : un grand arc de bois, la corde tirée vers l'arrière
        s.line([(50, 8), (54, 14), (56, 22), (56, 34), (54, 42), (50, 48)], BOIS, width=2)
        s.rect(52, 27, 57, 31, CUIR_F)
        s.line([(50, 8), (34 - t, 29), (50, 48)], '#E8E0C8')
        # la flèche encochée
        s.line([(34 - t, 29), (60, 29)], '#C8B88A')
        s.poly([(60, 27), (63, 29), (60, 31)], '#DCE3EC')
        s.dots([(62, 29)], ['#F4F7FB', '#FFFFFF', '#F4F7FB', '#DCE3EC'][f], glow=True)
        s.dots([(35 - t, 28), (35 - t, 30)], '#E8402A')
    return s.render()


def loup(f=0):
    """Le Loup : gris, il halète et remue la queue."""
    s = Sprite(32, 32)
    e = [0, 1, 1, 0][f]
    q = [0, -1, 0, 1][f]
    s.line([(5, 16), (2, 12 + q), (1, 9 + q)], '#7A7E86', width=3)  # queue
    s.rect(6, 22, 9, 30, '#5A5E66')
    s.rect(18, 22, 21, 30, '#5A5E66')
    s.ellipse(4, 13 - e, 24, 25, '#8A8E96')
    s.ellipse(8, 18 - e, 20, 25, '#C8CCD2')  # ventre clair
    with s.bouge(0, [0, 1, 1, 0][f]):
        s.ellipse(17, 8, 28, 19, '#9A9EA6')  # tête
        s.poly([(19, 9), (20, 3), (23, 8)], '#7A7E86')  # oreilles
        s.poly([(23, 8), (25, 3), (27, 9)], '#7A7E86')
        s.poly([(25, 13), (32, 14), (31, 18), (25, 18)], '#B8BCC2')  # museau
        s.dots([(31, 14)], '#1A1A1E')
        s.rect(24, 11, 25, 12, '#FFE27A', glow=True, shade=False)
        if f % 2:
            s.poly([(27, 18), (30, 18), (29, 21)], '#E8607A')  # langue
    return s.render()


def ours(f=0):
    """L'Ours : massif et brun, il se balance d'une patte sur l'autre."""
    s = Sprite(32, 32)
    e = [0, 1, 1, 0][f]
    s.rect(5, 22 + e, 10, 30, '#4A2E1A')
    s.rect(17, 22 - e + 1, 22, 30, '#4A2E1A')
    s.ellipse(2, 10 - e, 26, 27, '#6A4428')
    s.ellipse(8, 17 - e, 20, 26, '#8A5E3A')
    with s.bouge(0, e):
        s.ellipse(17, 6, 30, 19, '#7A5030')  # tête
        s.ellipse(17, 4, 21, 9, '#5A3820')  # oreilles
        s.ellipse(24, 4, 28, 9, '#5A3820')
        s.ellipse(24, 11, 31, 18, '#A07850')  # museau
        s.dots([(30, 13)], '#1A1210')
        s.rect(22, 9, 23, 10, '#1A1210', shade=False)
    return s.render()


def raptor(f=0):
    """Le Raptor : vert, il penche la tête, griffes en avant, la queue en balancier."""
    s = Sprite(32, 32)
    e = [0, 1, 1, 0][f]
    q = [0, 1, 0, -1][f]
    s.poly([(10, 16 - e), (0, 12 + q), (1, 15 + q), (10, 20 - e)], '#4A7A3A')  # queue
    s.line([(12, 22), (10, 30)], '#3A5A2A', width=2)
    s.line([(16, 22), (18, 30)], '#3A5A2A', width=2)
    s.dots([(9, 30), (19, 30), (20, 30)], '#E8E0C8')
    s.ellipse(8, 12 - e, 22, 24 - e, '#5A9A44')
    s.line([(11, 15 - e), (18, 14 - e)], '#E8742A', width=1)  # rayures
    s.line([(12, 18 - e), (19, 17 - e)], '#E8742A', width=1)
    with s.bouge(0, [0, -1, 0, 1][f]):
        s.line([(19, 14), (23, 8)], '#5A9A44', width=3)  # cou
        s.poly([(21, 4), (30, 6), (31, 10), (22, 11)], '#6AAA4A')  # tête
        s.line([(23, 10), (30, 10)], '#2A3A1A')
        s.dots([(25, 6)], '#FFE27A', glow=True)
        s.poly([(21, 4), (23, 1), (24, 5)], '#E8742A')  # crête
        s.line([(20, 17), (24, 19), (25, 21)], '#4A7A3A')  # bras
        s.dots([(25, 21), (26, 20)], '#E8E0C8')
    return s.render()


if __name__ == '__main__':
    chasseur().save(os.path.join(DEST, 'chasseur.png'))
    for name, fn in (('loup', loup), ('ours', ours), ('raptor', raptor)):
        fn().save(os.path.join(DEST, f'familier_{name}.png'))
    print('ok')
