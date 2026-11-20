"""Sprites des ennemis de l'acte 2 : l'Aire de Vhaeryx.
Palette de l'acte : noir et pourpre de la citadelle, écailles chromatiques, vert toxique des fioles.
Les sprites regardent vers la gauche (vers le héros)."""
import os
from sprites import BATTEMENT, RESPIRE, Sprite, danse

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))

NOIR, NOIR2, VIOLET, POURPRE = '#2A2430', '#3E3448', '#6A4A8E', '#8E3A6E'
TOXIQUE, TOXIQUE_C = '#7ED84A', '#C8FF8A'
OS, OS2 = '#E6E0D0', '#B8B0A0'
FEU, JAUNE, LAVE = '#F59A2E', '#FFE27A', '#FF8A2A'
PEAU_GOB = '#7AA84A'


def aile(s, pts, membrane=VIOLET, os_=NOIR2):
    """Une aile : le premier point est l'attache sur le dos (l'animateur la fait battre autour)."""
    with s.marque('aile'):
        s.poly(pts, membrane)
        s.line(pts[:2], os_, width=1)


def dragonnet(couleur=NOIR, aile_c=VIOLET):
    s = Sprite(32, 32)
    aile(s, [(16, 12), (28, 2), (30, 12), (22, 16)], aile_c)
    s.ellipse(10, 14, 26, 24, couleur)  # corps
    s.poly([(24, 18), (31, 22), (30, 24), (24, 22)], couleur)  # queue
    s.ellipse(3, 9, 13, 18, couleur)  # tête
    s.poly([(1, 13), (6, 13), (6, 16), (2, 16)], NOIR2)  # museau
    s.poly([(9, 9), (12, 4), (13, 10)], NOIR2)  # corne
    s.rect(5, 11, 6, 12, JAUNE, glow=True)  # œil
    s.rect(12, 22, 14, 27, couleur)
    s.rect(20, 22, 22, 27, couleur)
    return s.render()


def oeuf(coque='#3E3448', veine=POURPRE):
    s = Sprite(32, 32)
    s.ellipse(8, 4, 24, 30, coque)
    s.ellipse(11, 7, 18, 16, '#5A4E66')
    s.line([(12, 18), (16, 22), (14, 26)], veine, glow=True)
    s.line([(19, 12), (21, 18), (18, 21)], veine, glow=True)
    s.rect(8, 28, 24, 30, '#1E1824')
    return s.render()


def drakonide(ecailles='#5A3A6E', armure='#3A3440', yeux=JAUNE):
    s = Sprite(48, 48)
    aile(s, [(24, 14), (42, 2), (46, 20), (32, 24)])
    s.poly([(30, 30), (44, 40), (42, 44), (30, 36)], ecailles)  # queue
    s.rect(18, 34, 22, 46, armure)  # jambes
    s.rect(26, 34, 30, 46, armure)
    s.poly([(16, 18), (32, 18), (34, 36), (14, 36)], ecailles)  # torse
    s.poly([(18, 22), (30, 22), (30, 32), (18, 32)], armure)  # plastron
    s.ellipse(12, 4, 28, 20, ecailles)  # tête
    s.poly([(6, 12), (14, 10), (14, 16), (8, 16)], ecailles)  # museau
    s.poly([(20, 6), (26, 0), (26, 8)], '#2A1C18')  # cornes
    s.poly([(24, 8), (30, 2), (30, 10)], '#2A1C18')
    s.rect(14, 10, 16, 11, yeux, glow=True)
    s.poly([(4, 20), (16, 24), (16, 28), (2, 24)], '#C9D2DE')  # griffes
    return s.render()


def alchimiste():
    s = Sprite(48, 48)
    s.poly([(16, 22), (32, 22), (36, 44), (12, 44)], '#6E5A44')  # blouse
    s.rect(14, 30, 34, 32, '#4A3A2A')  # ceinture à fioles
    for x, c in ((16, TOXIQUE), (22, '#E85A9A'), (28, '#5AA0E8')):
        s.rect(x, 32, x + 3, 37, c, glow=True)
    s.ellipse(14, 6, 34, 24, PEAU_GOB)  # tête
    s.poly([(14, 12), (4, 8), (12, 16)], PEAU_GOB)  # oreille
    s.poly([(34, 12), (44, 8), (36, 16)], PEAU_GOB)
    s.ellipse(17, 11, 23, 17, '#C9D2DE')  # lunettes
    s.ellipse(25, 11, 31, 17, '#C9D2DE')
    s.ellipse(18, 12, 22, 16, TOXIQUE, glow=True)
    s.ellipse(26, 12, 30, 16, TOXIQUE, glow=True)
    s.poly([(20, 20), (28, 20), (24, 23)], '#2A1C18')
    s.ellipse(2, 22, 12, 34, '#C9D2DE')  # fiole levée
    s.ellipse(4, 26, 10, 32, TOXIQUE, glow=True)
    s.rect(6, 18, 8, 22, '#8A6A44')
    return s.render()


def serviteur():
    s = Sprite(48, 48)
    s.rect(16, 34, 21, 46, '#7A8A6E')
    s.rect(26, 34, 31, 46, '#7A8A6E')
    s.poly([(12, 16), (36, 16), (34, 36), (14, 36)], '#8A9A7A')  # corps recousu
    s.line([(18, 18), (22, 34)], '#3A2A26')  # coutures
    s.line([(30, 18), (28, 34)], '#3A2A26')
    s.dots([(17, 22), (19, 22), (20, 28), (22, 28), (29, 22), (27, 26)], '#3A2A26')
    s.rect(6, 18, 12, 32, '#7A8A6E')  # bras
    s.rect(36, 18, 42, 30, '#7A8A6E')
    s.ellipse(16, 2, 32, 18, '#8A9A7A')  # tête
    s.rect(18, 8, 21, 10, TOXIQUE, glow=True)
    s.rect(26, 8, 29, 10, '#3A2A26')
    s.line([(16, 14), (32, 12)], '#3A2A26')
    s.ellipse(2, 30, 10, 38, '#5A6A4E')  # poing
    return s.render()


def drake_os():
    s = Sprite(48, 48)
    aile(s, [(22, 12), (40, 0), (46, 16), (30, 20)], '#3A3440', OS2)
    s.line([(28, 6), (34, 14)], OS2)
    s.poly([(30, 26), (46, 34), (44, 38), (30, 32)], OS)  # queue
    s.ellipse(12, 16, 34, 34, OS2)  # cage thoracique
    for y in (20, 24, 28):
        s.line([(15, y), (31, y)], '#5A5048')
    s.rect(14, 32, 18, 44, OS)
    s.rect(26, 32, 30, 44, OS)
    s.ellipse(2, 8, 18, 22, OS)  # crâne
    s.poly([(0, 14), (8, 14), (8, 20), (1, 19)], OS2)
    s.ellipse(6, 11, 10, 15, '#5AC8E8', glow=True)  # œil
    s.poly([(10, 8), (16, 0), (16, 10)], OS2)
    s.ellipse(0, 22, 6, 28, '#7ED8E8', glow=True)  # souffle de mort
    return s.render()


def chimere():
    s = Sprite(48, 48)
    s.poly([(30, 24), (44, 18), (46, 24), (34, 30)], '#4A8A4A')  # queue de serpent
    s.ellipse(32, 14, 44, 24, '#4A8A4A')
    s.rect(38, 17, 40, 18, JAUNE, glow=True)
    s.ellipse(10, 18, 38, 38, '#8A5A3A')  # corps de lion
    aile(s, [(22, 16), (34, 2), (38, 14), (28, 20)], POURPRE)
    s.rect(12, 34, 16, 46, '#6A4A2E')
    s.rect(30, 34, 34, 46, '#6A4A2E')
    s.ellipse(2, 10, 20, 28, '#C8843A')  # crinière
    s.ellipse(5, 13, 17, 25, '#8A5A3A')  # tête
    s.rect(7, 17, 9, 18, '#E8402A', glow=True)
    s.poly([(4, 22), (10, 22), (8, 25)], '#2A1C18')
    s.dots([(22, 26), (26, 30), (18, 30)], TOXIQUE, glow=True)  # pustules
    return s.render()


def garde_draconique():
    s = Sprite(48, 48)
    aile(s, [(26, 12), (42, 0), (46, 18), (32, 22)], '#5A2A2A')
    s.rect(18, 34, 23, 46, '#4A4A54')
    s.rect(27, 34, 32, 46, '#4A4A54')
    s.poly([(16, 16), (34, 16), (36, 36), (14, 36)], '#5A6270')  # armure
    s.rect(22, 18, 28, 34, '#8E2A2A')
    s.ellipse(14, 2, 32, 18, '#6E3A3A')  # tête
    s.poly([(18, 2), (26, -2), (32, 6)], '#4A4A54')  # heaume
    s.rect(17, 8, 19, 9, JAUNE, glow=True)
    s.poly([(2, 14), (14, 14), (14, 40), (8, 46), (2, 40)], '#8A8A94')  # grand bouclier
    s.poly([(4, 16), (12, 16), (12, 38), (8, 42), (4, 38)], '#8E2A2A')
    s.line([(40, 10), (40, 44)], '#C9D2DE', width=2)  # lance
    s.poly([(38, 10), (40, 2), (42, 10)], '#DCE3EC')
    return s.render()


def drakonide_chroma():
    return drakonide('#3A7A8E', '#3A3440', '#E85AE8')


def serviteur_os():
    s = Sprite(32, 32)
    s.rect(11, 22, 13, 31, OS)
    s.rect(18, 22, 20, 31, OS)
    s.ellipse(9, 12, 23, 24, OS2)
    for y in (15, 18, 21):
        s.line([(11, y), (21, y)], '#5A5048')
    s.ellipse(10, 2, 22, 13, OS)
    s.rect(12, 6, 14, 8, TOXIQUE, glow=True)
    s.rect(17, 6, 19, 8, TOXIQUE, glow=True)
    s.line([(4, 12), (10, 16)], OS, width=2)
    return s.render()


# ---------- Boss secondaires ----------

def skarn():
    s = Sprite(64, 64)
    aile(s, [(32, 18), (56, 0), (62, 26), (42, 30)])
    s.poly([(40, 40), (60, 54), (56, 58), (40, 46)], '#3A2A4E')
    s.rect(24, 46, 30, 62, NOIR2)
    s.rect(34, 46, 40, 62, NOIR2)
    s.poly([(20, 22), (44, 22), (46, 48), (18, 48)], '#3A2A4E')
    s.poly([(24, 26), (40, 26), (40, 42), (24, 42)], '#5A4A6E')
    s.ellipse(26, 30, 38, 40, POURPRE, glow=True)  # cristal de couvée
    s.ellipse(16, 4, 38, 26, '#3A2A4E')
    s.poly([(8, 14), (18, 12), (18, 20), (10, 20)], '#3A2A4E')
    s.poly([(26, 6), (34, -2), (36, 8)], '#2A1C18')
    s.rect(18, 12, 21, 13, '#E85AE8', glow=True)
    s.line([(6, 22), (6, 60)], '#5A4A6E', width=2)  # bâton
    s.ellipse(1, 14, 11, 24, VIOLET, glow=True)
    return s.render()


def ysolde():
    s = Sprite(64, 64)
    aile(s, [(28, 14), (54, 0), (62, 30), (40, 30)], '#C84A3A', '#7A1E1A')
    s.poly([(40, 40), (62, 50), (60, 56), (40, 46)], '#B83A2A')
    s.ellipse(18, 22, 50, 50, '#B83A2A')  # corps
    s.rect(22, 44, 28, 60, '#8E2A1E')
    s.rect(38, 44, 44, 60, '#8E2A1E')
    s.ellipse(22, 34, 40, 46, '#E8A04A')  # ventre
    s.poly([(10, 12), (26, 16), (24, 32), (12, 30)], '#B83A2A')  # cou
    s.ellipse(0, 4, 18, 18, '#C84A3A')  # tête
    s.poly([(6, 4), (2, -2), (10, 4)], '#E6C89A')
    s.rect(4, 9, 6, 10, JAUNE, glow=True)
    for x in (16, 26, 36):  # chaînes
        s.line([(x, 30), (x + 4, 44)], '#8A8A94', width=2)
    s.ellipse(14, 40, 20, 46, '#8A8A94')
    return s.render()


def draksis():
    s = Sprite(64, 64)
    s.rect(22, 46, 30, 62, '#4A3A2A')
    s.rect(36, 46, 44, 62, '#4A3A2A')
    s.poly([(14, 18), (50, 18), (52, 48), (12, 48)], '#7A4A2E')  # torse massif
    s.poly([(18, 24), (46, 24), (46, 44), (18, 44)], '#5A3A2A')
    s.line([(20, 30), (44, 30)], '#3A2A1E')
    s.ellipse(8, 18, 22, 30, '#7A4A2E')  # épaules
    s.ellipse(42, 18, 56, 30, '#7A4A2E')
    s.ellipse(20, 2, 44, 24, '#8A5A3A')  # tête
    s.poly([(12, 12), (22, 10), (22, 18), (14, 18)], '#8A5A3A')
    s.poly([(26, 4), (22, -2), (30, 4)], '#2A1C18')
    s.poly([(36, 4), (42, -2), (40, 6)], '#2A1C18')
    s.rect(22, 10, 25, 12, '#E8402A', glow=True)
    s.line([(4, 30), (0, 54)], '#5A3822', width=2)  # fouet
    s.line([(0, 54), (8, 60)], '#8A6A44')
    return s.render()


def drake(couleur, souffle, souffle_c):
    s = Sprite(64, 64)
    aile(s, [(28, 18), (50, 2), (58, 26), (38, 30)], couleur, '#1E1824')
    s.poly([(40, 36), (62, 46), (60, 50), (40, 42)], couleur)
    s.ellipse(18, 24, 46, 46, couleur)
    s.rect(22, 42, 28, 58, '#1E1824')
    s.rect(36, 42, 42, 58, '#1E1824')
    s.poly([(12, 18), (26, 20), (24, 32), (14, 30)], couleur)
    s.ellipse(2, 10, 20, 24, couleur)
    s.poly([(10, 10), (14, 2), (16, 12)], '#1E1824')
    s.rect(6, 14, 8, 15, JAUNE, glow=True)
    s.ellipse(0, 20, 8, 28, souffle, glow=True)
    s.ellipse(1, 22, 5, 26, souffle_c, glow=True)
    return s.render()


def drake_braise():
    return drake('#A83A1E', FEU, JAUNE)


def drake_ombre():
    return drake('#2A2238', VIOLET, '#C8A0FF')


def drake_cendre():
    return drake('#6E6A66', '#A8A098', '#E6E0D0')


def prismagor():
    s = Sprite(64, 64)
    s.poly([(44, 40), (62, 52), (58, 56), (44, 46)], '#4A3A44')
    s.ellipse(16, 26, 52, 54, '#4A3A44')  # corps de chien-dragon
    s.rect(20, 48, 26, 62, '#2A2430')
    s.rect(42, 48, 48, 62, '#2A2430')
    # cinq têtes (rouge, bleue, verte, noire, bronze)
    for (x, y, c) in ((0, 18, '#C8402A'), (6, 6, '#3A7ACC'), (18, 0, '#4AA84A'), (30, 4, '#1E1824'), (38, 14, '#B8843A')):
        s.ellipse(x, y, x + 14, y + 12, c)
        s.rect(x + 3, y + 4, x + 4, y + 5, JAUNE, glow=True)
    for (x, y) in ((10, 26), (14, 16), (24, 12), (36, 14), (44, 24)):
        s.line([(x, y), (32, 32)], '#4A3A44', width=3)
    return s.render()


def grizzik():
    s = Sprite(64, 64)
    s.poly([(20, 28), (44, 28), (50, 60), (14, 60)], '#6E5A44')
    s.rect(18, 40, 46, 43, '#4A3A2A')
    for x, c in ((20, TOXIQUE), (27, '#E85A9A'), (34, '#5AA0E8'), (41, JAUNE)):
        s.rect(x, 43, x + 4, 50, c, glow=True)
    s.ellipse(18, 6, 46, 30, PEAU_GOB)
    s.poly([(18, 14), (4, 8), (16, 20)], PEAU_GOB)
    s.poly([(46, 14), (60, 8), (48, 20)], PEAU_GOB)
    s.ellipse(22, 12, 30, 20, '#C9D2DE')
    s.ellipse(32, 12, 40, 20, '#C9D2DE')
    s.ellipse(23, 13, 29, 19, '#E85A9A', glow=True)
    s.ellipse(33, 13, 39, 19, TOXIQUE, glow=True)
    s.poly([(24, 24), (40, 24), (32, 28)], '#2A1C18')
    s.poly([(26, 4), (30, 0), (34, 4), (38, 0), (40, 6)], '#E6E0D0')  # cheveux en bataille
    s.line([(6, 30), (12, 54)], '#8A8A94', width=3)  # clé à molette
    s.poly([(2, 26), (10, 26), (10, 32), (2, 32)], '#8A8A94')
    return s.render()


def ossyrax():
    s = Sprite(64, 64)
    aile(s, [(28, 16), (52, 0), (60, 26), (40, 28)], '#2A2A34', OS2)
    s.line([(36, 8), (46, 18)], OS2)
    s.poly([(40, 40), (62, 50), (60, 54), (40, 46)], OS)
    s.ellipse(16, 22, 46, 48, OS2)
    for y in (28, 33, 38, 43):
        s.line([(20, y), (42, y)], '#4A4440')
    s.rect(20, 44, 26, 60, OS)
    s.rect(36, 44, 42, 60, OS)
    s.ellipse(0, 6, 22, 24, OS)
    s.poly([(0, 14), (10, 14), (10, 22), (2, 21)], OS2)
    s.ellipse(6, 9, 12, 15, '#5AC8E8', glow=True)
    s.poly([(12, 6), (18, -2), (20, 8)], OS2)
    s.ellipse(22, 26, 34, 38, '#5AC8E8', glow=True)  # cœur spectral
    return s.render()


def vashka():
    s = Sprite(64, 64)
    aile(s, [(30, 16), (54, 0), (62, 28), (42, 30)], '#3A2A4E', '#1E1824')
    s.poly([(42, 40), (62, 52), (58, 56), (42, 46)], '#2A2238')
    s.rect(24, 46, 30, 62, '#1E1824')
    s.rect(36, 46, 42, 62, '#1E1824')
    s.poly([(18, 20), (46, 20), (48, 48), (16, 48)], '#2A2238')
    s.poly([(22, 26), (42, 26), (42, 44), (22, 44)], '#4A3A5E')
    s.ellipse(14, 2, 38, 24, '#2A2238')
    s.poly([(6, 12), (16, 10), (16, 18), (8, 18)], '#2A2238')
    s.poly([(22, 4), (18, -2), (26, 4)], '#8E3A6E')
    s.poly([(30, 4), (34, -2), (34, 6)], '#8E3A6E')
    s.rect(16, 10, 19, 11, '#E85AE8', glow=True)
    s.poly([(4, 24), (16, 26), (16, 32), (2, 28)], '#C9D2DE')
    return s.render()


# ---------- Vhaeryx ----------

def vhaeryx(f=0):
    """Phase 1 : l'alchimiste à forme humaine, entouré de fioles.
    f = image de l'animation (0 à 3) : il respire, ses fioles flottent autour de lui chacune à son rythme
    et bouillonnent, l'orbe de son sceptre pulse et les runes de sa robe s'allument."""
    s = Sprite(96, 96)
    b = RESPIRE[f]
    s.poly([(30, 34 + b), (66, 34 + b), (76, 94), (20, 94)], '#2A1E38')  # grande robe
    s.poly([(40, 36 + b), (56, 36 + b), (62, 94), (34, 94)], '#4A2A5E')
    runes = [(38, 60), (58, 70), (44, 80), (54, 54)]
    s.dots([r for k, r in enumerate(runes) if k != f], '#E85AE8', glow=True)
    s.dots([runes[f]], '#FFB0FF', glow=True)
    with s.bouge(0, b):
        s.poly([(24, 30), (36, 26), (34, 44), (20, 46)], '#3A2A4E')  # épaulières
        s.poly([(72, 30), (60, 26), (62, 44), (76, 46)], '#3A2A4E')
        s.ellipse(34, 6, 62, 34, '#8A7A6E')  # tête
        s.poly([(36, 10), (26, 0), (32, 14)], '#2A1C18')  # cornes
        s.poly([(60, 10), (70, 0), (64, 14)], '#2A1C18')
        yeux = ['#E85AE8', '#FF8AFF', '#FFB0FF', '#FF8AFF'][f]
        s.rect(40, 18, 44, 20, yeux, glow=True)
        s.rect(52, 18, 56, 20, yeux, glow=True)
        s.poly([(42, 26), (54, 26), (48, 34)], '#3A2A26')  # barbe
        s.line([(18, 34), (22, 90)], '#5A3822', width=2)  # sceptre
        g = [0, 1, 2, 1][f]
        s.ellipse(12 - g, 26 - g, 26 + g, 38 + g, '#E85AE8', glow=True)
        s.ellipse(17, 30, 21, 34, '#FFD8FF', glow=True)
    # les fioles flottent autour de lui, chacune à son rythme, et bouillonnent
    for k, (x, y, c) in enumerate(((4, 44, TOXIQUE), (12, 60, '#E85A9A'), (6, 76, '#5AA0E8'), (82, 50, JAUNE), (86, 70, TOXIQUE))):
        dy = [0, -2, -3, -2][(f + k) % 4]
        with s.bouge(0, dy):
            s.ellipse(x, y, x + 9, y + 12, '#C9D2DE')
            s.ellipse(x + 2, y + 4, x + 7, y + 10, c, glow=True)
            s.dots([(x + 3 + (f + k) % 3, y + 2 - (f + k) % 2)], '#FFFFFF', glow=True)  # bulle
    return s.render()


def vhaeryx_dragon(f=0):
    """Phases 2 et 3 : le dragon chromatique.
    f = image de l'animation (0 à 3) : il bat des ailes, respire, balance la queue
    et son souffle couve dans sa gueule."""
    s = Sprite(96, 96)
    b = RESPIRE[f]
    k = BATTEMENT[f]

    def battre(pts):  # l'aile bat autour de son attache (le premier point)
        rx, ry = pts[0]
        return [(x, round(ry + (y - ry) * k)) for x, y in pts]

    with s.bouge(0, b):
        s.poly(battre([(44, 26), (84, 0), (94, 42), (62, 46)]), '#4A2A6E')  # aile
        s.poly(battre([(50, 30), (82, 8), (88, 38), (62, 42)]), '#6A4A8E')
        s.line(battre([(44, 26), (84, 0)]), '#2A1A3E', width=2)
    q = [0, 2, 4, 2][f]  # la queue balance
    s.poly([(60, 64), (94, 80 + q), (90, 86 + q), (60, 72)], '#3A7A8E')  # queue
    s.rect(32, 70, 40, 94, '#2A4A5E')  # pattes (fixes)
    s.rect(56, 70, 64, 94, '#2A4A5E')
    with s.bouge(0, b):
        s.ellipse(26, 36, 72, 76, '#3A7A8E')  # corps
        v = [0, 1, 2, 1][f]
        s.ellipse(32 - v, 52 - v, 60 + v, 72, '#C84A6E')  # ventre qui se gonfle
        s.dots([(40, 44), (52, 40), (62, 50), (46, 58)], '#5AA0E8', glow=True)  # écailles bleues
        s.dots([(38, 60), (66, 58)], '#B8843A', glow=True)
    t = [0, 1, 2, 1][f]  # la tête suit, un peu plus fort
    with s.bouge(0, t):
        s.poly([(16, 26), (36, 30), (34, 48), (18, 46)], '#4AA84A')  # cou vert
        s.ellipse(0, 12, 28, 34, '#C8402A')  # tête rouge
        s.poly([(0, 22), (10, 22), (10, 32), (2, 30)], '#8E2A1E')
        s.poly([(14, 12), (20, 0), (24, 14)], '#E6C89A')
        s.poly([(20, 14), (30, 4), (30, 18)], '#E6C89A')
        s.rect(8, 18, 11, 20, JAUNE, glow=True)
        # le souffle couve dans la gueule
        g = [0, 1, 2, 1][f]
        s.ellipse(0, 30 - g, 10 + g, 40 + g, '#E85AE8', glow=True)
        s.poly(danse([(0, 34), (2, 28), (4, 32), (6, 26), (9, 34), (5, 38)], f, 1.5), FEU, glow=True)
        s.ellipse(2, 32, 7, 37, JAUNE, glow=True)
    # fumée qui s'échappe des naseaux
    s.dots([(2 + (j + f) % 2, 10 - 3 * ((j + f) % 4)) for j in range(2)], '#8A7A8E', glow=True)
    return s.render()


SPRITES = {
    'dragonnet': dragonnet, 'oeuf': oeuf, 'oeuf_skarn': lambda: oeuf('#4A3A5E', '#E85AE8'),
    'oeuf_vashka': lambda: oeuf('#1E1824', '#8E3A6E'), 'drakonide': drakonide, 'alchimiste': alchimiste,
    'serviteur': serviteur, 'drake_os': drake_os, 'chimere': chimere, 'garde_draconique': garde_draconique,
    'drakonide_chroma': drakonide_chroma, 'serviteur_os': serviteur_os,
    'skarn': skarn, 'ysolde': ysolde, 'draksis': draksis, 'drake_braise': drake_braise, 'drake_ombre': drake_ombre,
    'drake_cendre': drake_cendre, 'prismagor': prismagor, 'grizzik': grizzik, 'ossyrax': ossyrax, 'vashka': vashka,
    'vhaeryx': vhaeryx, 'vhaeryx_dragon': vhaeryx_dragon,
}

if __name__ == '__main__':
    import shutil
    os.makedirs(DEST, exist_ok=True)
    for name, fn in SPRITES.items():
        fn().save(os.path.join(DEST, f'ennemi_{name}.png'))
    # Le Gobelin mimique de l'acte 2 a la même tête que celui de l'acte 1.
    shutil.copy(os.path.join(DEST, 'ennemi_mimique.png'), os.path.join(DEST, 'ennemi_mimique_2.png'))
    print(len(SPRITES) + 1, 'sprites')
