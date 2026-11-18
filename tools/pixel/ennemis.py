"""Sprites des ennemis de l'acte 1 utilisés par le prototype.
Les sprites regardent vers la gauche (vers le héros)."""
import os
from sprites import Sprite

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))


def molosse():
    s = Sprite(48, 48)
    s.poly([(36, 20), (44, 14), (46, 18), (40, 24)], '#F59A2E', glow=True)  # queue enflammée
    s.rect(30, 32, 34, 42, '#3A2A26')  # pattes arrière
    s.rect(14, 32, 18, 42, '#3A2A26')
    s.ellipse(12, 20, 40, 36, '#4E3A33')  # corps
    s.rect(34, 33, 38, 42, '#4E3A33')
    s.rect(18, 33, 22, 42, '#4E3A33')
    s.line([(16, 26), (34, 26)], '#FF8A2A', glow=True)  # fissures
    s.line([(20, 30), (30, 30)], '#FF8A2A', glow=True)
    s.ellipse(3, 14, 19, 28, '#4E3A33')  # tête
    s.poly([(2, 22), (10, 22), (10, 28), (3, 27)], '#3A2A26')  # gueule
    s.poly([(10, 14), (13, 7), (16, 15)], '#2A1C18')  # oreille
    s.rect(7, 18, 9, 19, '#FFE27A', glow=True)  # œil
    s.dots([(4, 24), (6, 24), (8, 24)], '#FFE27A', glow=True)  # crocs
    s.poly([(14, 16), (18, 10), (22, 15), (26, 8), (30, 16), (34, 12), (36, 20), (14, 20)], '#F59A2E', glow=True)
    return s.render()


def eclaireur():
    s = Sprite(48, 48)
    s.poly([(18, 18), (30, 18), (34, 44), (14, 44)], '#4A3A44')  # cape
    s.poly([(20, 20), (28, 20), (30, 40), (18, 40)], '#5E4A52')  # tunique
    s.rect(18, 38, 21, 45, '#2A2028')
    s.rect(26, 38, 29, 45, '#2A2028')
    s.ellipse(17, 6, 31, 22, '#4A3A44')  # capuche
    s.ellipse(19, 11, 27, 19, '#1A1214', shade=False)  # visage dans l'ombre
    s.rect(20, 14, 21, 15, '#FF8A2A', glow=True)
    s.rect(24, 14, 25, 15, '#FF8A2A', glow=True)
    s.poly([(6, 30), (16, 24), (17, 26), (8, 32)], '#C9D2DE')  # dague
    s.rect(15, 24, 19, 28, '#3A2A26')
    s.dots([(10, 12), (36, 20), (34, 8)], '#9A8A80', glow=True)  # cendres
    return s.render()


def etincelle():
    s = Sprite(32, 32)
    s.poly([(16, 2), (22, 12), (25, 20), (21, 28), (11, 28), (7, 20), (10, 12)], '#E8562A', glow=True)
    s.poly([(16, 9), (20, 16), (21, 23), (16, 27), (11, 23), (12, 16)], '#F59A2E', glow=True)
    s.ellipse(12, 16, 20, 25, '#FFE27A', glow=True)
    s.rect(13, 19, 14, 20, '#2A0E05', glow=True)
    s.rect(18, 19, 19, 20, '#2A0E05', glow=True)
    s.dots([(5, 8), (27, 10), (26, 26), (4, 24)], '#FFC24B', glow=True)
    return s.render()


def seigneur():
    s = Sprite(64, 64)
    s.ellipse(14, 52, 50, 62, '#E8742A', glow=True)
    s.poly([(20, 26), (44, 26), (48, 56), (16, 56)], '#3A2A26')  # corps de roche
    s.line([(32, 30), (32, 54)], '#FF8A2A', glow=True)
    s.line([(22, 40), (30, 46)], '#FF8A2A', glow=True)
    s.ellipse(27, 36, 37, 46, '#FFB04A', glow=True)  # cœur
    s.ellipse(10, 24, 24, 36, '#4E3A33')  # épaules
    s.ellipse(40, 24, 54, 36, '#4E3A33')
    s.poly([(6, 34), (14, 32), (12, 46), (4, 46)], '#3A2A26')  # bras
    s.ellipse(2, 42, 14, 52, '#4E3A33')
    s.ellipse(2, 36, 16, 50, '#F59A2E', glow=True)  # boule de lave en main
    s.ellipse(5, 39, 13, 47, '#FFE27A', glow=True)
    s.poly([(24, 20), (28, 4), (32, 12), (36, 2), (40, 20)], '#F59A2E', glow=True)  # crête de feu
    s.ellipse(22, 10, 42, 30, '#4A3630')  # tête
    s.poly([(24, 18), (30, 20), (30, 22), (24, 20)], '#FFE27A', glow=True)
    s.poly([(40, 18), (34, 20), (34, 22), (40, 20)], '#FFE27A', glow=True)
    s.line([(28, 26), (36, 26)], '#FF8A2A', glow=True)
    return s.render()


def lieutenant():
    s = Sprite(48, 48)
    s.rect(18, 36, 22, 45, '#5E6670')
    s.rect(26, 36, 30, 45, '#5E6670')
    s.poly([(16, 18), (32, 18), (34, 38), (14, 38)], '#7A3A2A')  # armure brûlée
    s.rect(22, 20, 26, 36, '#A8322A')
    s.ellipse(12, 16, 22, 24, '#8C6A5A')  # épaulières
    s.ellipse(26, 16, 36, 24, '#8C6A5A')
    s.ellipse(17, 4, 31, 19, '#6E5A50')  # casque
    s.rect(18, 10, 24, 11, '#1A1210', shade=False)
    s.poly([(24, 3), (28, 0), (30, 5)], '#F59A2E', glow=True)  # plumet de feu
    s.poly([(4, 8), (12, 30), (14, 29), (7, 7)], '#C9D2DE')  # épée
    s.rect(9, 28, 15, 30, '#E6B84A')
    s.ellipse(32, 22, 44, 36, '#5A3822')  # bouclier
    s.ellipse(35, 25, 41, 33, '#F59A2E', glow=True)
    return s.render()


def brannoc():
    s = Sprite(64, 64)
    s.poly([(20, 24), (44, 24), (52, 62), (12, 62)], '#5A1E1A')  # robe
    s.poly([(26, 26), (38, 26), (42, 62), (22, 62)], '#A8322A')
    s.line([(32, 28), (32, 60)], '#E6B84A')
    s.ellipse(16, 20, 30, 30, '#E6B84A')  # épaulières dorées
    s.ellipse(34, 20, 48, 30, '#E6B84A')
    s.ellipse(22, 6, 42, 26, '#C8A27A')  # tête
    s.poly([(22, 10), (32, 2), (42, 10), (40, 14), (24, 14)], '#E6B84A')  # couronne
    s.dots([(32, 5)], '#FF8A2A', glow=True)
    s.rect(25, 16, 29, 17, '#FFE27A', glow=True)
    s.rect(35, 16, 39, 17, '#FFE27A', glow=True)
    s.rect(28, 21, 36, 23, '#7A3A2A')  # barbe
    s.line([(8, 6), (12, 60)], '#5A3822', width=2)  # bâton
    s.ellipse(2, 0, 16, 14, '#F59A2E', glow=True)  # flamme du bâton
    s.ellipse(5, 3, 13, 11, '#FFE27A', glow=True)
    s.ellipse(8, 30, 16, 38, '#C8A27A')  # main
    return s.render()


def cendrine():
    s = Sprite(64, 64)
    s.ellipse(8, 2, 22, 16, '#F59A2E', glow=True)  # flamme de l'encensoir
    s.ellipse(11, 5, 19, 13, '#FFE27A', glow=True)
    s.line([(15, 14), (18, 34)], '#5A3822', width=1)  # chaîne
    s.ellipse(12, 30, 22, 40, '#7A5A2A')  # encensoir
    s.poly([(22, 26), (42, 26), (52, 62), (12, 62)], '#3A2A30')  # robe de cendre
    s.poly([(27, 28), (37, 28), (42, 62), (22, 62)], '#5A4A52')
    s.line([(32, 30), (32, 60)], '#F59A2E', glow=True)
    s.ellipse(20, 22, 32, 32, '#4A3A44')  # épaules
    s.ellipse(32, 22, 44, 32, '#4A3A44')
    s.ellipse(24, 6, 40, 26, '#4A3A44')  # capuche
    s.ellipse(27, 11, 37, 24, '#C8A27A')  # visage
    s.rect(29, 16, 31, 17, '#FF8A2A', glow=True)
    s.rect(34, 16, 36, 17, '#FF8A2A', glow=True)
    s.dots([(46, 10), (50, 20), (44, 4), (54, 30), (6, 46), (56, 44)], '#9A8A80', glow=True)  # cendres
    s.ellipse(16, 30, 24, 38, '#C8A27A')  # main
    return s.render()

if __name__ == '__main__':
    os.makedirs(DEST, exist_ok=True)
    for name, fn in (('molosse', molosse), ('eclaireur', eclaireur), ('etincelle', etincelle),
                     ('seigneur', seigneur), ('lieutenant', lieutenant), ('brannoc', brannoc), ('cendrine', cendrine)):
        fn().save(os.path.join(DEST, f'ennemi_{name}.png'))
    print('ok')
