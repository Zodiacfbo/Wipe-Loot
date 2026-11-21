"""Le Démoniste et ses familiers (ils regardent vers la droite, comme le héros)."""
import os
from sprites import RESPIRE, Sprite, danse

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))
FEL, FEL_C = '#7ED84A', '#C8FF8A'
VIOLET, VIOLET_F = '#6A3A9E', '#3E2260'
FEU, JAUNE = '#F59A2E', '#FFE27A'


def demoniste(f=0):
    """Le Démoniste. f = image de l'animation (0 à 3) : il respire, sa cape flotte, la flamme gangrenée
    danse, ses runes s'allument tour à tour et des braises vertes s'envolent."""
    s = Sprite(64, 64)
    b = RESPIRE[f]
    c = [0, -1, -2, -1][f]
    s.poly([(20, 20 + b), (32, 18 + b), (30 + c, 58), (12 + c, 59)], '#2A1A3A')  # cape
    s.poly([(24, 26 + b), (40, 26 + b), (46, 59), (18, 59)], VIOLET_F)  # robe
    s.poly([(29, 30 + b), (35, 30 + b), (38, 59), (26, 59)], '#5A2A4E')
    runes = [(30, 40), (34, 48), (28, 54)]  # les runes s'allument tour à tour
    s.dots([r for k, r in enumerate(runes) if k != f % 3], FEL, glow=True)
    s.dots([runes[f % 3]], FEL_C, glow=True)
    s.rect(18, 57, 46, 59, '#8E3A6E', shade=False)
    s.rect(22, 59, 29, 61, '#1E1424')
    s.rect(35, 59, 42, 61, '#2A1A30')
    with s.bouge(0, b):
        s.rect(23, 37, 41, 39, '#3A2430')
        s.ellipse(30, 36, 34, 40, FEL, glow=True)
        s.poly([(24, 22), (40, 22), (41, 37), (23, 37)], VIOLET)
        s.ellipse(16, 20, 27, 28, '#4A2A5E')  # épaulières à pointes
        s.ellipse(37, 20, 48, 28, '#4A2A5E')
        s.poly([(17, 21), (14, 13), (21, 20)], '#1E1424')
        s.poly([(47, 21), (50, 13), (43, 20)], '#1E1424')
        s.poly([(24, 6), (40, 6), (42, 22), (22, 22)], '#2A1A3A')  # capuche
        s.ellipse(27, 11, 37, 22, '#C8B0A0')  # visage pâle
        yeux = FEL_C if f == 2 else FEL
        s.rect(29, 15, 31, 16, yeux, glow=True)
        s.rect(33, 15, 35, 16, yeux, glow=True)
        s.poly([(26, 6), (32, 0), (38, 6)], '#2A1A3A')
        # main gauche : flamme gangrenée
        s.rect(16, 28, 21, 34, VIOLET)
        s.ellipse(12, 32, 19, 38, '#C8B0A0')
        s.poly(danse([(10, 33), (12, 24), (15, 29), (17, 22), (20, 32)], f, 1.5), FEL, glow=True)
        s.poly(danse([(12, 33), (14, 28), (16, 31), (17, 33)], f + 1), FEL_C, glow=True)
        # braises vertes qui s'envolent de la flamme
        s.dots([(14 + (k + f) % 2 * 3, 20 - 3 * ((k + f) % 4)) for k in range(2)], FEL, glow=True)
        # main droite : grimoire
        s.rect(40, 28, 45, 34, VIOLET)
        s.poly([(42, 30), (54, 28), (55, 40), (43, 42)], '#4A2A1E')
        s.rect(46, 32, 51, 37, [FEL, FEL_C, FEL_C, FEL][f], glow=True, shade=False)
    return s.render()


# Les familiers : f = image de l'animation (0 à 3), comme les héros.
VOL = [0, -1, -2, -1]  # flottement des créatures qui volent


def diablotin(f=0):
    """Le diablotin : il voltige en battant de l'aile, sa boule de feu danse."""
    s = Sprite(32, 32)
    with s.bouge(0, VOL[f] + 1):
        s.poly([(8, 12), (2, [6, 3, 1, 3][f]), (6, 14)], '#8E2A1E')  # aile qui bat
        s.ellipse(8, 12, 22, 26, '#C8402A')
        s.ellipse(10, 4, 22, 15, '#D8502A')
        s.poly([(11, 6), (9, 0), (13, 5)], '#2A1C18')
        s.poly([(20, 6), (22, 0), (18, 5)], '#2A1C18')
        s.rect(17, 8, 18, 9, JAUNE, glow=True)
        s.rect(14, 26, 16, 29, '#8E2A1E')
        s.rect(18, 26, 20, 29, '#8E2A1E')
        g = [0, 1, 0, -1][f]
        s.poly(danse([(22, 17), (23, 11), (26, 13), (28, 9 - g), (30, 16), (26, 20)], f), FEU, glow=True)  # boule de feu
        s.ellipse(24, 14, 28, 18, JAUNE, glow=True)
    return s.render()


def rodeur(f=0):
    """Le marcheur du Vide : il flotte, ses bandes d'énergie défilent et ses yeux pulsent."""
    s = Sprite(32, 32)
    with s.bouge(0, VOL[f] + 1):
        s.ellipse(6, 8, 26, 30, '#3A5ACC')  # silhouette du néant
        s.ellipse(9, 2, 23, 14, '#4A6ADC')
        yeux = ['#E0F0FF', '#FFFFFF', '#B8D8FF', '#FFFFFF'][f]
        s.rect(12, 6, 14, 8, yeux, glow=True)
        s.rect(18, 6, 20, 8, yeux, glow=True)
        bras = [0, 1, 1, 0][f]
        s.rect(4, 12 + bras, 8, 24 + bras, '#2A3A8E')  # bras qui balancent
        s.rect(24, 12 - bras + 1, 28, 24 - bras + 1, '#2A3A8E')
        for y in (16, 20, 24):  # les bandes d'énergie descendent
            yy = y + f % 4
            if yy <= 27:
                s.line([(10, yy), (22, yy + 1)], '#8AA8FF', glow=True)
    return s.render()


def succube(f=0):
    """La succube : elle flotte, ses ailes battent et son fouet ondule."""
    s = Sprite(32, 32)
    with s.bouge(0, [0, 0, 1, 1][f]):
        w = [2, 0, 1, 3][f]
        s.poly([(6, 10), (0, w), (4, 14)], '#5A2A6E')  # ailes
        s.poly([(26, 10), (31, w), (28, 14)], '#5A2A6E')
        s.poly([(10, 14), (22, 14), (24, 30), (8, 30)], '#8E3A6E')
        s.ellipse(11, 3, 21, 14, '#C88AA0')
        s.poly([(12, 4), (9, -1), (14, 4)], '#2A1C18')
        s.poly([(20, 4), (23, -1), (18, 4)], '#2A1C18')
        s.rect(17, 7, 18, 8, ['#E85AE8', '#FF8AFF', '#E85AE8', '#C83AC8'][f], glow=True)
        bout = [(30, 26), (31, 23), (29, 28), (27, 29)][f]  # le fouet ondule
        s.line([(24, 18), (27, 22), bout], '#C8A0FF', glow=True)
    return s.render()


def molosse_infernal(f=0):
    """Le chasseur corrompu : il halète, ses tentacules ondulent et ses taches gangrenées brillent."""
    s = Sprite(32, 32)
    e = [0, 1, 1, 0][f]
    s.rect(6, 22, 9, 30, '#3A5220')
    s.rect(18, 22, 21, 30, '#3A5220')
    s.ellipse(4, 12 - e, 24, 24, '#4A6A2A')
    with s.bouge(0, [0, 1, 1, 0][f]):
        s.ellipse(18, 8, 30, 20, '#5A7A3A')  # tête
        s.poly([(26, 14), (32, 14), (30, 19), (26, 18)], '#3A5220')
        s.rect(25, 11, 26, 12, '#E8402A', glow=True)
        o = [0, -1, 0, 1][f]  # tentacules qui ondulent
        s.line([(19, 9), (18 + o, 6), (17 - o, 3)], FEL, glow=True)
        s.line([(22, 8), (22 - o, 5), (22 + o, 2)], FEL, glow=True)
    taches = [(8, 14), (14, 13), (11, 18)]
    s.dots([(x, y - e) for x, y in taches], FEL_C if f % 2 else FEL, glow=True)
    return s.render()


def seigneur_infernal(f=0):
    """L'infernal : il respire au milieu de son cratère, ses poings gangrenés flambent."""
    s = Sprite(48, 48)
    b = RESPIRE[f]
    s.ellipse(4, 36, 44, 48, FEL, glow=True)  # cratère
    s.dots([[(10, 42), (34, 45)], [(18, 46), (38, 41)], [(26, 42), (8, 45)], [(14, 40), (30, 46)]][f], FEL_C, glow=True)
    s.rect(12, 30, 20, 44, '#3A3A30')
    s.rect(28, 30, 36, 44, '#3A3A30')
    with s.bouge(0, b):
        s.poly([(10, 10), (38, 10), (40, 32), (8, 32)], '#4A4A3E')
        fis = FEL_C if f == 2 else FEL
        s.line([(14, 14), (22, 26)], fis, glow=True)
        s.line([(34, 14), (26, 26)], fis, glow=True)
        s.ellipse(16, 0, 32, 14, '#5A5A4A')
        s.rect(19, 5, 21, 7, FEL_C, glow=True)
        s.rect(27, 5, 29, 7, FEL_C, glow=True)
        s.ellipse(2, 14, 12, 26, '#4A4A3E')
        s.ellipse(36, 14, 46, 26, '#4A4A3E')
        s.poly(danse([(1, 14), (2, 7), (5, 10), (7, 4), (10, 14)], f, 1.5), FEL, glow=True)  # poings en flammes
        s.poly(danse([(38, 14), (40, 4), (42, 10), (45, 7), (46, 14)], f + 2, 1.5), FEL, glow=True)
    return s.render()



# Les deux tenues du Prêtre : la lumière (normale) et la Forme d'Ombre.
TENUES = {
    'lumiere': dict(robe='#E8E4DC', etole='#D8B04A', croix='#F4E8C8', ourlet='#D8B04A', capuche='#C8C0B0',
                    peau='#E8C6A4', yeux='#2A1C18', orbe=('#FFE27A', '#FFFFFF'), livre='#7A2A2A', glyphe='#D8B04A'),
    'ombre': dict(robe='#3A2E4E', etole='#6A3A9E', croix='#B07AFF', ourlet='#6A3A9E', capuche='#2A2238',
                  peau='#8A7A9A', yeux='#C89AFF', orbe=('#7A3AD0', '#D8B0FF'), livre='#2A1A3A', glyphe='#B07AFF'),
}


def pretre(f=0, tenue='lumiere'):
    """Le Prêtre. f = image de l'animation (0 à 3) : il respire, l'auréole flotte au-dessus de sa tête,
    la lumière de sa main pulse. En Forme d'Ombre (tenue='ombre') : robe sombre, yeux violets,
    pas d'auréole mais des volutes d'ombre qui montent autour de lui."""
    import math
    T = TENUES[tenue]
    s = Sprite(64, 64)
    b = RESPIRE[f]
    p = [0, 1, 2, 1][f]  # la lumière de la main pulse
    if tenue == 'ombre':  # volutes d'ombre derrière lui
        for k, (x, y) in enumerate([(12, 56), (52, 54), (17, 40), (48, 36), (32, 14)]):
            dy = -3 * ((k + f) % 4)
            c = '#6A3AA8' if (k + f) % 4 < 2 else '#4A2A78'  # elles pâlissent en montant
            s.line([(x, y + dy), (x - 2, y - 4 + dy), (x, y - 8 + dy), (x + 2, y - 11 + dy)], c, width=2, glow=True)
    # jambes (elles ne bougent pas)
    s.rect(22, 59, 29, 61, '#5A4A3A')
    s.rect(35, 59, 42, 61, '#6A5A4A')
    s.poly([(22, 22 + b), (42, 22 + b), (48, 59), (16, 59)], T['robe'])  # robe
    s.rect(16, 57, 48, 59, T['ourlet'], shade=False)
    with s.bouge(0, b):
        s.poly([(29, 22), (35, 22), (37, 57), (27, 57)], T['etole'])  # étole
        if tenue == 'lumiere':  # la croix sacrée
            s.rect(27, 32, 37, 34, T['croix'], shade=False)
            s.rect(31, 28, 33, 38, T['croix'], shade=False)
        else:  # l'œil du Vide
            s.poly([(27, 33), (32, 29), (37, 33), (32, 37)], T['croix'], glow=True)
            s.rect(31, 32, 33, 34, '#1A0E2A', glow=True)
        s.ellipse(16, 20, 26, 28, T['robe'])  # épaules
        s.ellipse(38, 20, 48, 28, T['robe'])
        # capuche arrondie, visage
        s.poly([(22, 24), (22, 15), (25, 10), (32, 8), (39, 10), (42, 15), (42, 24)], T['capuche'])
        s.ellipse(27, 12, 37, 23, T['peau'])
        oeil = dict(shade=False, glow=tenue == 'ombre')
        s.rect(29, 16, 31, 17, T['yeux'], **oeil)
        s.rect(33, 16, 35, 17, T['yeux'], **oeil)
        # main gauche : lumière (ou ombre)
        s.rect(14, 28, 19, 34, T['robe'])
        s.ellipse(10, 32, 17, 38, T['peau'])
        o1, o2 = T['orbe']
        s.ellipse(6 - p, 24 - p, 18 + p, 36 + p, o1, glow=True)
        s.ellipse(9, 27, 15, 33, o2, glow=True)
        # main droite : livre de prières
        s.rect(42, 28, 47, 34, T['robe'])
        s.poly([(44, 30), (56, 28), (57, 40), (45, 42)], T['livre'])
        s.rect(49, 32, 52, 37, T['glyphe'], glow=True, shade=False)
    if tenue == 'lumiere':
        # l'auréole flotte au-dessus de la tête, sans toucher la capuche
        h = [0, -1, -1, 0][f] + b
        ring = [(32 + math.cos(t / 24 * math.pi * 2) * 9, 4 + h + math.sin(t / 24 * math.pi * 2) * 2.5) for t in range(25)]
        s.line(ring, '#FFE27A', width=1, glow=True)
        s.dots([(23, 4 + h), (41, 4 + h)], '#FFE27A', glow=True)
    return s.render()


def voleur(f=0):
    """Le Voleur. f = image de l'animation (0 à 3) : il sautille d'un pied sur l'autre, prêt à bondir,
    sa cape flotte et un éclat passe sur une dague puis sur l'autre."""
    s = Sprite(64, 64)
    b = RESPIRE[f]
    c = [0, -1, -2, -1][f]
    # cape
    s.poly([(20, 20 + b), (44, 20 + b), (50 + c, 58), (14 + c, 58)], '#2E2634')
    # jambes et bottes (fixes)
    s.rect(24, 46, 30, 57, '#3A3440')
    s.rect(34, 46, 40, 57, '#463E4C')
    s.rect(23, 55, 31, 60, '#2A1E16')
    s.rect(33, 55, 41, 60, '#3A2A1E')
    with s.bouge(0, b):
        # tunique de cuir et ceinture
        s.poly([(24, 24), (40, 24), (42, 46), (22, 46)], '#5A4632')
        s.line([(25, 26), (39, 44)], '#3A2A1E', width=2)
        s.rect(22, 40, 42, 42, '#2A1E16')
        s.rect(31, 40, 33, 42, '#E8D84A', shade=False)
        # capuche
        s.ellipse(23, 6, 41, 26, '#3A3040')
        s.poly([(23, 16), (41, 16), (44, 26), (20, 26)], '#3A3040')
        s.ellipse(27, 12, 37, 23, '#120E16')
        # les yeux regardent à gauche puis à droite
        r = [0, 0, 1, 1][f]
        s.rect(29 + r, 16, 30 + r, 17, '#E8D84A', glow=True, shade=False)
        s.rect(34 + r, 16, 35 + r, 17, '#E8D84A', glow=True, shade=False)
        s.rect(27, 20, 37, 23, '#4A3E54')  # masque
        # bras et dagues (elles tournent un peu dans les mains)
        d = [0, 1, 0, -1][f]
        s.rect(16, 28, 21, 36, '#5A4632')
        s.rect(43, 28, 48, 36, '#5A4632')
        s.poly([(14, 36), (16, 35), (10 + d, 50), (9 + d, 49)], '#DCE3EC')
        s.rect(14, 33, 19, 36, '#8A7A5A')
        s.poly([(48, 36), (50, 35), (58, 22 - d), (57, 21 - d)], '#DCE3EC')
        s.rect(45, 34, 50, 37, '#8A7A5A')
        s.dots([(9 + d, 49), (57, 21 - d)], '#F4F7FB', glow=True)
        # éclat qui passe sur une dague puis sur l'autre
        x, y = [(12, 43), (52, 30), (11, 46), (55, 25)][f]
        s.dots([(x, y), (x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)], '#FFFFFF', glow=True)
        s.dots([(x - 2, y), (x + 2, y), (x, y - 2), (x, y + 2)], '#E8D84A', glow=True)
    return s.render()


def paladin(f=0):
    """Le Paladin : armure de plaques dorée, tabard blanc au soleil, marteau levé et écu.
    f = image de l'animation (0 à 3) : il respire, sa cape flotte, le soleil de sa cuirasse rayonne
    et le marteau brille."""
    s = Sprite(64, 64)
    import math
    b = RESPIRE[f]
    c = [0, -1, -2, -1][f]
    # cape blanche
    s.poly([(20, 20 + b), (30, 18 + b), (29 + c, 57), (13 + c, 59)], '#D8D2C4')
    s.line([(13 + c, 58), (29 + c, 57)], '#D8B04A', width=2)
    # jambes et solerets (fixes)
    s.rect(24, 46, 30, 57, '#A89060')
    s.rect(33, 46, 39, 57, '#C8A868')
    s.rect(23, 55, 31, 60, '#7A6438')
    s.rect(32, 55, 40, 60, '#8A7244')
    with s.bouge(0, b):
        # tabard
        s.poly([(24, 38), (40, 38), (42, 51), (22, 51)], '#E8E4DC')
        s.rect(22, 50, 42, 51, '#D8B04A', shade=False)
        # cuirasse dorée et soleil (les rayons s'allongent un sur deux)
        s.poly([(23, 23), (41, 23), (42, 41), (22, 41)], '#C8A050')
        s.ellipse(28, 27, 36, 35, '#FFE27A', glow=True)
        for t in range(8):
            a = t / 8 * math.pi * 2
            long = 8 if (t + f) % 2 == 0 and f % 2 == 1 else 7
            s.line([(32 + math.cos(a) * 5, 31 + math.sin(a) * 5), (32 + math.cos(a) * long, 31 + math.sin(a) * long)], '#FFE27A', glow=True)
        s.rect(22, 39, 42, 41, '#6A4A2A')
        s.rect(31, 39, 33, 41, '#FFE27A', shade=False)
        # épaulière arrière
        s.ellipse(18, 20, 28, 28, '#B08A40')
        # écu
        s.poly([(8, 25), (24, 25), (24, 40), (16, 49), (8, 40)], '#D8B04A')
        s.poly([(10, 27), (22, 27), (22, 39), (16, 46), (10, 39)], '#E8E4DC')
        s.ellipse(12, 30, 20, 38, '#D8B04A')
        s.ellipse(14, 32, 18, 36, ['#FFE27A', '#FFF2B0', '#FFFFFF', '#FFF2B0'][f], glow=True)
        # casque à visière et crête (la crête traîne un peu)
        s.ellipse(25, 8, 39, 24, '#D0A850')
        s.rect(29, 15, 38, 16, '#1A1210', shade=False)
        s.rect(31, 13, 32, 19, '#1A1210', shade=False)
        p = [0, -1, -1, 0][f]
        s.poly([(30, 9), (32 + p, 2), (34, 9)], '#E8E4DC')
        # épaulière avant
        s.ellipse(35, 20, 46, 29, '#D8B04A')
        # bras et gantelet
        s.rect(38, 27, 43, 35, '#C8A050')
        s.ellipse(40, 32, 46, 38, '#A88A48')
        # marteau levé, tête lumineuse
        s.line([(43, 38), (52, 10)], '#6A4426', width=3)
        s.poly([(46, 4), (58, 8), (56, 15), (44, 11)], '#E0D8C0')
        s.poly([(47, 6), (56, 9), (55, 12), (46, 9)], ['#FFF2B0', '#FFFFFF', '#FFF2B0', '#FFE27A'][f], glow=True)
        # étincelles de lumière autour du marteau
        tour = [(60, 4), (42, 2), (61, 14), (50, 0)]
        s.dots([tour[(k + f) % 4] for k in range(3)], '#FFE27A', glow=True)
    return s.render()


if __name__ == '__main__':
    paladin().save(os.path.join(DEST, 'paladin.png'))
    voleur().save(os.path.join(DEST, 'voleur.png'))
    pretre().save(os.path.join(DEST, 'pretre.png'))
    demoniste().save(os.path.join(DEST, 'demoniste.png'))
    for name, fn in (('diablotin', diablotin), ('rodeur', rodeur), ('succube', succube), ('molosse', molosse_infernal), ('seigneur', seigneur_infernal)):
        fn().save(os.path.join(DEST, f'familier_{name}.png'))
    print('ok')
