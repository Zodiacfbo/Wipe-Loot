"""Sprites des ennemis de l'acte 1 utilisés par le prototype.
Les sprites regardent vers la gauche (vers le héros)."""
import os
from sprites import Sprite, vulkhar

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

def rejeton():
    """Rejeton de flamme : une flamme vivante, plus grande et plus féroce qu'une Étincelle."""
    s = Sprite(32, 32)
    s.poly([(16, 1), (20, 7), (24, 4), (25, 14), (28, 20), (24, 29), (8, 29), (4, 20), (7, 14), (8, 4), (12, 7)], '#C23A1E', glow=True)
    s.poly([(16, 6), (21, 14), (23, 21), (19, 27), (13, 27), (9, 21), (11, 14)], '#F59A2E', glow=True)
    s.ellipse(11, 16, 21, 26, '#FFE27A', glow=True)
    s.poly([(11, 18), (15, 20), (15, 21), (11, 20)], '#2A0E05', glow=True)
    s.poly([(21, 18), (17, 20), (17, 21), (21, 20)], '#2A0E05', glow=True)
    s.line([(13, 24), (19, 24)], '#2A0E05', glow=True)
    return s.render()

def gobelin():
    """Le vendeur gobelin (regarde vers la gauche)."""
    s = Sprite(64, 64)
    s.poly([(30, 30), (58, 28), (60, 56), (34, 58)], '#7A4A2A')  # gros sac
    s.ellipse(40, 22, 54, 34, '#8A5A32')
    s.line([(46, 22), (48, 18)], '#5A3822', width=2)
    s.dots([(44, 40), (50, 44), (54, 38)], '#FFD45E', glow=True)  # pièces qui dépassent
    s.rect(18, 48, 22, 60, '#3A5A2A')  # jambes
    s.rect(26, 48, 30, 60, '#3A5A2A')
    s.rect(16, 58, 23, 61, '#4A2E1E')
    s.rect(25, 58, 32, 61, '#4A2E1E')
    s.poly([(14, 30), (34, 30), (36, 50), (12, 50)], '#6A3A6E')  # gilet
    s.rect(22, 32, 25, 48, '#E6B84A', shade=False)
    s.ellipse(12, 12, 34, 32, '#6AA84A')  # tête
    s.poly([(12, 18), (2, 12), (4, 22), (13, 24)], '#5A9A3E')  # oreilles pointues
    s.poly([(34, 18), (44, 12), (42, 22), (33, 24)], '#5A9A3E')
    s.ellipse(14, 6, 32, 16, '#5A3822')  # chapeau
    s.rect(10, 13, 36, 15, '#4A2E1E')
    s.rect(16, 19, 19, 21, '#FFE27A', glow=True)  # yeux malins
    s.rect(25, 19, 28, 21, '#FFE27A', glow=True)
    s.poly([(19, 26), (27, 26), (25, 28), (21, 28)], '#2A1C18')  # sourire
    s.dots([(20, 26), (24, 26)], '#F4F7FB', glow=True)
    s.ellipse(4, 34, 12, 42, '#6AA84A')  # main tendue
    s.ellipse(2, 30, 10, 38, '#FFD45E', glow=True)  # pièce
    return s.render()


# ---------- Boss secondaires de l'acte 1 et leurs adds ----------

def morvax():
    """Morvax le Maudisseur : un démon mineur, cornes et grimoire."""
    s = Sprite(64, 64)
    s.poly([(22, 28), (44, 28), (50, 62), (14, 62)], '#3A1E3E')  # robe
    s.poly([(28, 30), (38, 30), (42, 62), (24, 62)], '#5A2A5E')
    s.dots([(26, 44), (38, 50), (30, 56)], '#B86AE8', glow=True)  # runes
    s.ellipse(18, 22, 32, 32, '#4A2A4E')
    s.ellipse(34, 22, 48, 32, '#4A2A4E')
    s.ellipse(22, 8, 42, 28, '#A8443A')  # tête rouge
    s.poly([(24, 12), (16, 2), (20, 0), (28, 10)], '#2A1C18')  # cornes
    s.poly([(40, 12), (48, 2), (44, 0), (36, 10)], '#2A1C18')
    s.rect(26, 16, 29, 18, '#B86AE8', glow=True)  # yeux violets
    s.rect(35, 16, 38, 18, '#B86AE8', glow=True)
    s.poly([(28, 23), (36, 23), (32, 26)], '#2A1C18')
    s.poly([(4, 30), (16, 28), (18, 42), (6, 44)], '#4A2E1E')  # grimoire
    s.rect(9, 32, 14, 40, '#B86AE8', glow=True, shade=False)
    s.ellipse(2, 18, 14, 30, '#8E4AC8', glow=True)  # malédiction qui flotte
    s.ellipse(5, 21, 11, 27, '#E0B8FF', glow=True)
    s.poly([(50, 40), (60, 56), (56, 58), (48, 44)], '#A8443A')  # queue
    return s.render()


def croc():
    """Croc-de-lave : un molosse ancestral, énorme, crinière de flammes."""
    s = Sprite(64, 64)
    s.poly([(50, 26), (60, 16), (62, 22), (54, 32)], '#F59A2E', glow=True)  # queue
    s.rect(42, 44, 47, 58, '#3A2A26')
    s.rect(20, 44, 25, 58, '#3A2A26')
    s.ellipse(16, 26, 56, 50, '#4E3A33')  # corps massif
    s.rect(46, 46, 51, 58, '#4E3A33')
    s.rect(24, 46, 29, 58, '#4E3A33')
    s.line([(22, 34), (48, 34)], '#FF8A2A', glow=True)
    s.line([(26, 40), (44, 40)], '#FF8A2A', glow=True)
    s.line([(30, 30), (36, 44)], '#FF8A2A', glow=True)
    s.poly([(16, 26), (22, 12), (28, 22), (34, 10), (40, 22), (46, 14), (50, 28), (16, 30)], '#F59A2E', glow=True)  # crinière
    s.poly([(20, 22), (26, 16), (30, 24), (36, 16), (40, 24)], '#FFE27A', glow=True)
    s.ellipse(2, 20, 26, 40, '#4E3A33')  # tête
    s.poly([(0, 30), (12, 30), (12, 40), (2, 39)], '#3A2A26')  # gueule
    s.poly([(14, 20), (18, 10), (22, 22)], '#2A1C18')  # oreille
    s.rect(8, 25, 11, 27, '#FFE27A', glow=True)  # œil
    s.dots([(2, 32), (5, 32), (8, 32), (3, 38), (7, 38)], '#FFE27A', glow=True)  # crocs
    return s.render()


def gorlok():
    """Gorlok le Fragmenté : un élémentaire de roche fendu de lave."""
    s = Sprite(64, 64)
    s.ellipse(14, 54, 50, 63, '#2A1C18')
    s.rect(20, 46, 28, 62, '#4A4038')  # jambes
    s.rect(36, 46, 44, 62, '#4A4038')
    s.poly([(14, 22), (50, 22), (54, 48), (10, 48)], '#5E544A')  # torse de pierre
    s.line([(24, 24), (30, 36), (26, 46)], '#FF8A2A', glow=True)  # fissures
    s.line([(40, 26), (36, 38), (42, 46)], '#FF8A2A', glow=True)
    s.ellipse(28, 30, 36, 38, '#FFB04A', glow=True)
    s.ellipse(4, 24, 18, 40, '#6E6458')  # bras
    s.ellipse(46, 24, 60, 40, '#6E6458')
    s.ellipse(0, 36, 16, 52, '#5E544A')  # poings
    s.ellipse(48, 36, 64, 52, '#5E544A')
    s.poly([(22, 8), (42, 8), (46, 22), (18, 22)], '#6E6458')  # tête
    s.rect(25, 13, 29, 15, '#FFE27A', glow=True)
    s.rect(35, 13, 39, 15, '#FFE27A', glow=True)
    s.poly([(4, 6), (8, 2), (12, 6), (8, 10)], '#8A8A94')  # éclats en orbite
    s.poly([(52, 4), (56, 0), (60, 4), (56, 8)], '#8A8A94')
    s.dots([(8, 6), (56, 4)], '#FF8A2A', glow=True)
    return s.render()


def eclat():
    """Éclat de Gorlok : un fragment de roche instable."""
    s = Sprite(32, 32)
    s.poly([(16, 2), (26, 12), (22, 28), (8, 26), (4, 12)], '#6E6458')
    s.poly([(16, 6), (22, 13), (19, 23), (11, 22), (8, 13)], '#8A8A94')
    s.line([(12, 10), (16, 16), (14, 24)], '#FF8A2A', glow=True)
    s.line([(20, 10), (17, 16)], '#FF8A2A', glow=True)
    s.rect(11, 14, 12, 15, '#FFE27A', glow=True)
    s.rect(19, 14, 20, 15, '#FFE27A', glow=True)
    s.dots([(4, 4), (28, 6), (27, 26), (3, 28)], '#FFC24B', glow=True)
    return s.render()


def vossk():
    """Le Baron Vossk : seigneur élémentaire au cœur de magma, en armure noire."""
    s = Sprite(64, 64)
    s.ellipse(12, 54, 52, 63, '#E8742A', glow=True)
    s.poly([(18, 26), (46, 26), (52, 60), (12, 60)], '#2E2A30')  # armure
    s.poly([(26, 28), (38, 28), (40, 52), (24, 52)], '#3E3840')
    s.ellipse(26, 32, 38, 44, '#FF6A2A', glow=True)  # cœur de magma
    s.ellipse(29, 35, 35, 41, '#FFE27A', glow=True)
    s.ellipse(10, 20, 26, 32, '#3E3840')  # épaulières
    s.ellipse(38, 20, 54, 32, '#3E3840')
    s.poly([(10, 20), (14, 12), (18, 20)], '#F59A2E', glow=True)
    s.poly([(46, 20), (50, 12), (54, 20)], '#F59A2E', glow=True)
    s.ellipse(22, 6, 42, 26, '#2E2A30')  # heaume
    s.rect(25, 15, 39, 17, '#FF8A2A', glow=True)  # visière
    s.poly([(26, 6), (32, 0), (38, 6)], '#F59A2E', glow=True)
    s.ellipse(0, 34, 14, 48, '#F59A2E', glow=True)  # bombe dans la main
    s.ellipse(3, 37, 11, 45, '#FFE27A', glow=True)
    s.ellipse(8, 40, 16, 48, '#3E3840')
    return s.render()


def zhaal():
    """Zhaal le Tisseur d'arcanes : un mage élémentaire, flamme et arcane."""
    s = Sprite(64, 64)
    s.poly([(20, 26), (44, 26), (50, 58), (32, 62), (14, 58)], '#5A3A8E', glow=True)  # corps d'énergie
    s.poly([(26, 28), (38, 28), (42, 56), (22, 56)], '#8E6AE0', glow=True)
    s.poly([(28, 34), (36, 34), (38, 52), (26, 52)], '#F59A2E', glow=True)
    s.ellipse(22, 6, 42, 28, '#3A2A5E')  # capuche
    s.ellipse(26, 11, 38, 25, '#1A1230', shade=False)
    s.rect(28, 16, 30, 18, '#E0B8FF', glow=True)
    s.rect(34, 16, 36, 18, '#E0B8FF', glow=True)
    s.ellipse(14, 22, 26, 32, '#3A2A5E')
    s.ellipse(38, 22, 50, 32, '#3A2A5E')
    s.line([(8, 8), (12, 58)], '#5A3822', width=2)  # bâton brisé
    s.poly([(2, 2), (10, 0), (14, 8), (6, 12)], '#B86AE8', glow=True)  # fragment du Veilleur
    s.ellipse(4, 2, 12, 10, '#E0B8FF', glow=True)
    s.dots([(52, 10), (58, 24), (50, 40), (56, 52), (20, 4)], '#B86AE8', glow=True)  # runes flottantes
    s.dots([(46, 6), (60, 36)], '#FFC24B', glow=True)
    return s.render()


def kragg():
    """Krâgg le Mange-roche : un géant de roche massif, des cristaux sur le dos."""
    s = Sprite(64, 64)
    s.ellipse(8, 54, 56, 63, '#2A1C18')
    s.poly([(18, 6), (24, 0), (28, 8)], '#E8742A', glow=True)  # cristaux de magma
    s.poly([(30, 4), (36, -2), (40, 6)], '#E8742A', glow=True)
    s.poly([(42, 8), (48, 2), (50, 12)], '#E8742A', glow=True)
    s.ellipse(12, 6, 56, 46, '#5A4A3E')  # dos énorme
    s.ellipse(20, 20, 50, 52, '#6E5A4A')  # ventre
    s.line([(28, 28), (34, 40), (30, 50)], '#FF8A2A', glow=True)
    s.rect(18, 48, 28, 62, '#4A3C32')  # jambes
    s.rect(38, 48, 48, 62, '#4A3C32')
    s.ellipse(2, 16, 22, 34, '#5A4A3E')  # tête basse
    s.rect(6, 22, 9, 24, '#FFE27A', glow=True)
    s.rect(13, 22, 16, 24, '#FFE27A', glow=True)
    s.poly([(4, 28), (18, 28), (16, 32), (6, 32)], '#2A1C18')  # mâchoire
    s.dots([(7, 28), (11, 28), (15, 28)], '#E6E0D0')
    s.ellipse(0, 34, 18, 54, '#6E5A4A')  # poing
    s.dots([(4, 40), (10, 46)], '#FF8A2A', glow=True)
    return s.render()


def molosse_enrage():
    """Molosse enragé : un molosse de braise, plus sombre et plus massif."""
    s = Sprite(48, 48)
    s.poly([(36, 20), (44, 12), (46, 18), (40, 24)], '#E8442A', glow=True)
    s.rect(30, 32, 34, 43, '#2A1C18')
    s.rect(14, 32, 18, 43, '#2A1C18')
    s.ellipse(10, 18, 42, 37, '#3A2A26')
    s.rect(34, 33, 38, 43, '#3A2A26')
    s.rect(18, 33, 22, 43, '#3A2A26')
    s.line([(16, 26), (36, 26)], '#E8442A', glow=True)
    s.line([(20, 31), (32, 31)], '#E8442A', glow=True)
    s.ellipse(2, 13, 19, 29, '#3A2A26')
    s.poly([(0, 22), (10, 22), (10, 29), (2, 28)], '#2A1C18')
    s.poly([(10, 14), (13, 6), (16, 15)], '#1A1210')
    s.rect(6, 17, 9, 19, '#FF5A3A', glow=True)
    s.dots([(3, 24), (5, 24), (7, 24), (4, 27)], '#FFE27A', glow=True)
    s.poly([(14, 16), (18, 8), (22, 14), (26, 6), (30, 14), (34, 10), (36, 18), (14, 20)], '#E8442A', glow=True)
    return s.render()


def saldris():
    """Le Grand Intendant Saldris : vieil intendant en robe, bâton et bouclier magique."""
    s = Sprite(64, 64)
    s.ellipse(0, 6, 22, 58, '#4C8FE0', glow=True)  # bouclier magique
    s.ellipse(3, 9, 19, 55, '#1A2A40', glow=True)
    s.poly([(24, 26), (46, 26), (52, 62), (18, 62)], '#6A4A2A')  # robe d'intendant
    s.poly([(30, 28), (40, 28), (44, 62), (26, 62)], '#8A6A3A')
    s.line([(35, 28), (35, 60)], '#E6B84A')
    s.dots([(32, 40), (38, 46), (33, 52)], '#E6B84A')  # clés
    s.ellipse(22, 22, 34, 32, '#5A3A22')
    s.ellipse(36, 22, 48, 32, '#5A3A22')
    s.ellipse(26, 6, 44, 26, '#C8A27A')  # tête
    s.poly([(26, 10), (35, 2), (44, 10)], '#5A3A22')  # bonnet
    s.rect(29, 15, 32, 16, '#2A1C18')
    s.rect(37, 15, 40, 16, '#2A1C18')
    s.poly([(28, 20), (42, 20), (40, 30), (30, 30)], '#E6E0D0')  # longue barbe
    s.line([(54, 4), (52, 60)], '#5A3822', width=2)  # bâton
    s.ellipse(48, 0, 60, 10, '#F59A2E', glow=True)
    return s.render()


def pretre():
    """Prêtre de la flamme : robe rouge, mains en feu."""
    s = Sprite(48, 48)
    s.poly([(16, 20), (32, 20), (36, 46), (12, 46)], '#8A2A1E')
    s.poly([(20, 22), (28, 22), (30, 46), (18, 46)], '#B8402A')
    s.line([(24, 22), (24, 44)], '#E6B84A')
    s.ellipse(16, 4, 32, 22, '#6A1E16')  # capuche
    s.ellipse(19, 9, 29, 20, '#C8A27A')
    s.rect(21, 13, 22, 14, '#FF8A2A', glow=True)
    s.rect(26, 13, 27, 14, '#FF8A2A', glow=True)
    s.ellipse(4, 22, 14, 32, '#F59A2E', glow=True)  # flamme dans la main
    s.ellipse(6, 24, 12, 30, '#FFE27A', glow=True)
    s.ellipse(8, 28, 15, 34, '#C8A27A')
    return s.render()


def gardien():
    """Gardien de lave : un élémentaire en armure avec un grand bouclier."""
    s = Sprite(48, 48)
    s.rect(18, 36, 23, 46, '#3A2A26')
    s.rect(27, 36, 32, 46, '#3A2A26')
    s.poly([(16, 16), (36, 16), (38, 38), (14, 38)], '#4E3A33')
    s.line([(26, 18), (24, 36)], '#FF8A2A', glow=True)
    s.ellipse(18, 2, 34, 18, '#4E3A33')  # tête
    s.rect(21, 9, 31, 11, '#FF8A2A', glow=True)
    s.poly([(2, 14), (16, 12), (18, 40), (4, 42)], '#6E5A4A')  # bouclier
    s.poly([(5, 17), (14, 16), (15, 37), (7, 38)], '#8A6A4A')
    s.ellipse(6, 22, 14, 30, '#FF8A2A', glow=True)
    return s.render()



def mimique():
    """Le Gobelin mimique : un coffre à dents, une langue, des yeux de gobelin."""
    s = Sprite(48, 48)
    s.rect(6, 26, 42, 44, '#7A4A2A')  # caisse
    s.rect(6, 26, 42, 28, '#5A3822')
    s.rect(22, 30, 26, 36, '#E6B84A')  # serrure
    s.poly([(4, 8), (44, 8), (42, 22), (6, 22)], '#8A5A32')  # couvercle ouvert
    s.rect(4, 8, 44, 10, '#E6B84A')
    s.poly([(8, 22), (40, 22), (40, 26), (8, 26)], '#2A0E0A')  # gueule
    s.dots([(10, 22), (14, 22), (18, 22), (22, 22), (26, 22), (30, 22), (34, 22), (38, 22)], '#F4F7FB')
    s.dots([(12, 25), (18, 25), (24, 25), (30, 25), (36, 25)], '#F4F7FB')
    s.poly([(18, 24), (30, 24), (34, 34), (26, 32), (20, 36)], '#D8505A')  # langue
    s.rect(14, 13, 17, 16, '#FFE27A', glow=True)  # yeux
    s.rect(31, 13, 34, 16, '#FFE27A', glow=True)
    s.dots([(8, 44), (40, 44)], '#3A2418')
    return s.render()


def bregan():
    """Brégan le Passeur : un vieux nain à la longue barbe, une lanterne et une perche."""
    s = Sprite(48, 48)
    s.line([(40, 2), (36, 46)], '#5A3822', width=2)  # perche
    s.rect(16, 36, 21, 46, '#3A2A26')  # jambes
    s.rect(26, 36, 31, 46, '#3A2A26')
    s.poly([(12, 22), (36, 22), (38, 40), (10, 40)], '#3A5A6A')  # manteau
    s.rect(12, 32, 36, 34, '#5A3822')  # ceinture
    s.ellipse(14, 6, 34, 24, '#C8A27A')  # tête
    s.poly([(13, 10), (24, 2), (35, 10)], '#4A3A44')  # capuchon
    s.rect(18, 12, 21, 13, '#2A1C18')
    s.rect(27, 12, 30, 13, '#2A1C18')
    s.poly([(15, 16), (33, 16), (30, 34), (24, 38), (18, 34)], '#E6E0D0')  # grande barbe
    s.poly([(21, 18), (27, 18), (25, 22), (23, 22)], '#D8B89A')  # nez
    s.ellipse(2, 26, 10, 36, '#F59A2E', glow=True)  # lanterne
    s.ellipse(4, 28, 8, 34, '#FFE27A', glow=True)
    s.line([(6, 22), (6, 26)], '#5A3822')
    return s.render()

ELITES = {
    'morvax': morvax, 'croc': croc, 'gorlok': gorlok, 'eclat': eclat, 'vossk': vossk, 'zhaal': zhaal,
    'kragg': kragg, 'molosse_enrage': molosse_enrage, 'saldris': saldris, 'pretre': pretre, 'gardien': gardien, 'mimique': mimique,
}

if __name__ == '__main__':
    os.makedirs(DEST, exist_ok=True)
    for name, fn in (('molosse', molosse), ('eclaireur', eclaireur), ('etincelle', etincelle),
                     ('seigneur', seigneur), ('lieutenant', lieutenant), ('brannoc', brannoc), ('cendrine', cendrine)):
        fn().save(os.path.join(DEST, f'ennemi_{name}.png'))
    gobelin().save(os.path.join(DEST, 'vendeur_gobelin.png'))
    rejeton().save(os.path.join(DEST, 'ennemi_rejeton.png'))
    # Vulkhar est dessiné dans sprites.py ; il regarde vers la gauche en jeu.
    vulkhar().transpose(0).save(os.path.join(DEST, 'ennemi_vulkhar.png'))
    for name, fn in ELITES.items():
        fn().save(os.path.join(DEST, f'ennemi_{name}.png'))
    bregan().save(os.path.join(DEST, 'bregan.png'))
    print('ok')
