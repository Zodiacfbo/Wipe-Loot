"""Le Démoniste et ses familiers (ils regardent vers la droite, comme le héros)."""
import os
from sprites import Sprite

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))
FEL, FEL_C = '#7ED84A', '#C8FF8A'
VIOLET, VIOLET_F = '#6A3A9E', '#3E2260'
FEU, JAUNE = '#F59A2E', '#FFE27A'


def demoniste():
    s = Sprite(64, 64)
    s.poly([(20, 20), (32, 18), (30, 58), (12, 59)], '#2A1A3A')  # cape
    s.poly([(24, 26), (40, 26), (46, 59), (18, 59)], VIOLET_F)  # robe
    s.poly([(29, 30), (35, 30), (38, 59), (26, 59)], '#5A2A4E')
    s.dots([(30, 40), (34, 48), (28, 54)], FEL, glow=True)  # runes
    s.rect(18, 57, 46, 59, '#8E3A6E', shade=False)
    s.rect(22, 59, 29, 61, '#1E1424')
    s.rect(35, 59, 42, 61, '#2A1A30')
    s.rect(23, 37, 41, 39, '#3A2430')
    s.ellipse(30, 36, 34, 40, FEL, glow=True)
    s.poly([(24, 22), (40, 22), (41, 37), (23, 37)], VIOLET)
    s.ellipse(16, 20, 27, 28, '#4A2A5E')  # épaulières à pointes
    s.ellipse(37, 20, 48, 28, '#4A2A5E')
    s.poly([(17, 21), (14, 13), (21, 20)], '#1E1424')
    s.poly([(47, 21), (50, 13), (43, 20)], '#1E1424')
    s.poly([(24, 6), (40, 6), (42, 22), (22, 22)], '#2A1A3A')  # capuche
    s.ellipse(27, 11, 37, 22, '#C8B0A0')  # visage pâle
    s.rect(29, 15, 31, 16, FEL, glow=True)
    s.rect(33, 15, 35, 16, FEL, glow=True)
    s.poly([(26, 6), (32, 0), (38, 6)], '#2A1A3A')
    # main gauche : flamme gangrenée
    s.rect(16, 28, 21, 34, VIOLET)
    s.ellipse(12, 32, 19, 38, '#C8B0A0')
    s.poly([(10, 33), (12, 24), (15, 29), (17, 22), (20, 32)], FEL, glow=True)
    s.poly([(12, 33), (14, 28), (16, 31), (17, 33)], FEL_C, glow=True)
    # main droite : grimoire
    s.rect(40, 28, 45, 34, VIOLET)
    s.poly([(42, 30), (54, 28), (55, 40), (43, 42)], '#4A2A1E')
    s.rect(46, 32, 51, 37, FEL, glow=True, shade=False)
    return s.render()


def diablotin():
    s = Sprite(32, 32)
    s.poly([(8, 12), (2, 6), (6, 14)], '#8E2A1E')  # aile
    s.ellipse(8, 12, 22, 26, '#C8402A')
    s.ellipse(10, 4, 22, 15, '#D8502A')
    s.poly([(11, 6), (9, 0), (13, 5)], '#2A1C18')
    s.poly([(20, 6), (22, 0), (18, 5)], '#2A1C18')
    s.rect(17, 8, 18, 9, JAUNE, glow=True)
    s.rect(14, 26, 16, 30, '#8E2A1E')
    s.rect(18, 26, 20, 30, '#8E2A1E')
    s.ellipse(22, 12, 30, 20, FEU, glow=True)  # boule de feu
    s.ellipse(24, 14, 28, 18, JAUNE, glow=True)
    return s.render()


def rodeur():
    s = Sprite(32, 32)
    s.ellipse(6, 8, 26, 30, '#3A5ACC')  # silhouette du néant
    s.ellipse(9, 2, 23, 14, '#4A6ADC')
    s.rect(12, 6, 14, 8, '#E0F0FF', glow=True)
    s.rect(18, 6, 20, 8, '#E0F0FF', glow=True)
    s.rect(4, 12, 8, 24, '#2A3A8E')  # bras
    s.rect(24, 12, 28, 24, '#2A3A8E')
    for y in (16, 20, 24):
        s.line([(10, y), (22, y + 1)], '#8AA8FF', glow=True)
    return s.render()


def succube():
    s = Sprite(32, 32)
    s.poly([(6, 10), (0, 2), (4, 14)], '#5A2A6E')  # ailes
    s.poly([(26, 10), (32, 2), (28, 14)], '#5A2A6E')
    s.poly([(10, 14), (22, 14), (24, 30), (8, 30)], '#8E3A6E')
    s.ellipse(11, 3, 21, 14, '#C88AA0')
    s.poly([(12, 4), (9, -1), (14, 4)], '#2A1C18')
    s.poly([(20, 4), (23, -1), (18, 4)], '#2A1C18')
    s.rect(17, 7, 18, 8, '#E85AE8', glow=True)
    s.line([(24, 18), (30, 26)], '#C8A0FF', glow=True)  # fouet
    return s.render()


def molosse_infernal():
    s = Sprite(32, 32)
    s.ellipse(4, 12, 24, 24, '#4A6A2A')
    s.rect(6, 22, 9, 30, '#3A5220')
    s.rect(18, 22, 21, 30, '#3A5220')
    s.ellipse(18, 8, 30, 20, '#5A7A3A')  # tête
    s.poly([(26, 14), (32, 14), (30, 19), (26, 18)], '#3A5220')
    s.rect(25, 11, 26, 12, '#E8402A', glow=True)
    s.line([(19, 9), (17, 3)], FEL, glow=True)  # tentacules
    s.line([(22, 8), (22, 2)], FEL, glow=True)
    s.dots([(8, 14), (14, 13), (11, 18)], FEL_C, glow=True)
    return s.render()


def seigneur_infernal():
    s = Sprite(48, 48)
    s.ellipse(4, 36, 44, 48, FEL, glow=True)  # cratère
    s.rect(12, 30, 20, 44, '#3A3A30')
    s.rect(28, 30, 36, 44, '#3A3A30')
    s.poly([(10, 10), (38, 10), (40, 32), (8, 32)], '#4A4A3E')
    s.line([(14, 14), (22, 26)], FEL, glow=True)
    s.line([(34, 14), (26, 26)], FEL, glow=True)
    s.ellipse(16, 0, 32, 14, '#5A5A4A')
    s.rect(19, 5, 21, 7, FEL_C, glow=True)
    s.rect(27, 5, 29, 7, FEL_C, glow=True)
    s.ellipse(2, 14, 12, 26, '#4A4A3E')
    s.ellipse(36, 14, 46, 26, '#4A4A3E')
    s.ellipse(0, 6, 8, 14, FEL, glow=True)
    s.ellipse(40, 6, 48, 14, FEL, glow=True)
    return s.render()



def pretre():
    s = Sprite(64, 64)
    import math
    ring = [(32 + math.cos(t / 20 * math.pi * 2) * 13, 12 + math.sin(t / 20 * math.pi * 2) * 5) for t in range(21)]
    s.line(ring, '#FFE27A', width=2, glow=True)  # halo
    s.poly([(22, 22), (42, 22), (48, 59), (16, 59)], '#E8E4DC')  # robe blanche
    s.poly([(29, 22), (35, 22), (37, 59), (27, 59)], '#D8B04A')  # étole dorée
    s.rect(27, 32, 37, 34, '#F4E8C8', shade=False)
    s.rect(31, 28, 33, 38, '#F4E8C8', shade=False)
    s.rect(16, 57, 48, 59, '#D8B04A', shade=False)
    s.rect(22, 59, 29, 61, '#5A4A3A')
    s.rect(35, 59, 42, 61, '#6A5A4A')
    s.ellipse(16, 20, 26, 28, '#E8E4DC')
    s.ellipse(38, 20, 48, 28, '#E8E4DC')
    s.poly([(24, 8), (40, 8), (42, 24), (22, 24)], '#C8C0B0')  # capuche
    s.ellipse(27, 11, 37, 22, '#E8C6A4')
    s.rect(29, 15, 31, 16, '#2A1C18', shade=False)
    s.rect(33, 15, 35, 16, '#2A1C18', shade=False)
    # main gauche : lumière
    s.rect(14, 28, 19, 34, '#E8E4DC')
    s.ellipse(10, 32, 17, 38, '#E8C6A4')
    s.ellipse(6, 24, 18, 36, '#FFE27A', glow=True)
    s.ellipse(9, 27, 15, 33, '#FFFFFF', glow=True)
    # main droite : livre de prières
    s.rect(42, 28, 47, 34, '#E8E4DC')
    s.poly([(44, 30), (56, 28), (57, 40), (45, 42)], '#7A2A2A')
    s.rect(49, 32, 52, 37, '#D8B04A', glow=True, shade=False)
    return s.render()

if __name__ == '__main__':
    pretre().save(os.path.join(DEST, 'pretre.png'))
    demoniste().save(os.path.join(DEST, 'demoniste.png'))
    for name, fn in (('diablotin', diablotin), ('rodeur', rodeur), ('succube', succube), ('molosse', molosse_infernal), ('seigneur', seigneur_infernal)):
        fn().save(os.path.join(DEST, f'familier_{name}.png'))
    print('ok')
