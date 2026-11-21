"""Pixel art de l'acte 3 : Irem, la cité ensevelie.
Palette de l'acte : ocre et or du sable, noir brillant des carapaces, violet malsain de la chair d'Yzhar.
Les sprites regardent vers la gauche (vers le héros).
Sortie : public/assets/ennemi_<id>.png (ennemis) et carte_<id>.png (cartes-statut de l'acte)."""
import os
from sprites import Sprite

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))

SABLE, SABLE_C, SABLE_F = '#C8A060', '#E8CC8A', '#8A6A3A'
OR, OR_C = '#E0B040', '#FFE27A'
CARAPACE, CARAPACE_C, CARAPACE_R = '#1E1A22', '#3A3446', '#5A6A8E'  # noir, reflet bleuté
CHAIR, CHAIR_C, CHAIR_F = '#8E3A8E', '#C86AC8', '#4A1A4E'
BANDE, BANDE_F = '#D8CCB0', '#9A8E70'
OBSI, OBSI_C = '#1A1420', '#4A3E5E'
VERT_MOMIE = '#7ED8A0'


# ---------- Ennemis ----------

def scarabee():
    s = Sprite(32, 32)
    s.ellipse(8, 10, 28, 26, CARAPACE)  # élytres
    s.line([(18, 11), (18, 25)], CARAPACE_R)
    s.ellipse(11, 12, 16, 17, CARAPACE_R)  # reflet
    s.ellipse(2, 13, 11, 22, CARAPACE_C)  # tête
    s.poly([(0, 14), (4, 12), (3, 16)], OR)  # mandibules
    s.poly([(0, 21), (4, 22), (3, 18)], OR)
    s.rect(5, 15, 6, 16, OR_C, glow=True)  # œil
    for x in (11, 17, 23):  # pattes
        s.line([(x, 25), (x - 2, 29)], CARAPACE_C)
    return s.render()


def soldat_irem():
    s = Sprite(48, 48)
    s.rect(19, 34, 23, 46, CARAPACE_C)  # pattes
    s.rect(27, 34, 31, 46, CARAPACE_C)
    s.poly([(16, 16), (34, 16), (36, 36), (14, 36)], CARAPACE)  # thorax
    s.poly([(18, 18), (30, 18), (30, 30), (18, 30)], CARAPACE_R)  # plaque
    s.rect(14, 26, 36, 28, OR)  # ceinture d'or
    s.ellipse(16, 4, 30, 18, CARAPACE_C)  # tête
    s.poly([(12, 10), (17, 8), (17, 14)], OR)  # mandibule
    s.rect(18, 9, 20, 11, OR_C, glow=True)
    s.line([(22, 4), (18, 0)], CARAPACE_R)  # antennes
    s.line([(26, 4), (28, 0)], CARAPACE_R)
    s.line([(2, 30), (14, 2)], SABLE_F, width=2)  # lance
    s.poly([(12, 0), (17, 2), (14, 7)], '#C9D2DE')
    s.rect(8, 20, 14, 24, CARAPACE_C)  # bras
    return s.render()


def pretre_insecte():
    s = Sprite(48, 48)
    s.poly([(14, 18), (34, 18), (40, 46), (8, 46)], CHAIR_F)  # robe
    s.poly([(18, 20), (30, 20), (32, 44), (16, 44)], CHAIR)
    s.line([(24, 22), (24, 42)], OR)
    s.ellipse(15, 2, 31, 20, CARAPACE_C)  # tête
    s.poly([(10, 10), (16, 7), (16, 14)], OR)
    s.ellipse(18, 7, 22, 11, CHAIR_C, glow=True)  # yeux du rêve
    s.ellipse(24, 7, 28, 11, CHAIR_C, glow=True)
    s.line([(20, 2), (14, -2)], CARAPACE_R)
    s.line([(26, 2), (32, -2)], CARAPACE_R)
    s.line([(4, 44), (8, 12)], OR, width=2)  # bâton
    s.ellipse(3, 6, 13, 16, CHAIR_C, glow=True)  # œil au sommet
    s.ellipse(6, 9, 10, 13, CHAIR_F)
    return s.render()


def momie():
    s = Sprite(48, 48)
    s.rect(18, 34, 23, 46, BANDE_F)
    s.rect(26, 34, 31, 46, BANDE_F)
    s.poly([(14, 16), (34, 16), (33, 36), (15, 36)], BANDE)  # corps bandé
    for y in (19, 24, 29, 34):
        s.line([(15, y), (33, y - 2)], BANDE_F)
    s.rect(4, 18, 14, 22, BANDE)  # bras tendu
    s.line([(5, 19), (13, 21)], BANDE_F)
    s.ellipse(16, 2, 32, 18, BANDE)  # tête
    s.line([(16, 8), (32, 6)], BANDE_F)
    s.line([(16, 13), (32, 12)], BANDE_F)
    s.rect(19, 9, 21, 11, VERT_MOMIE, glow=True)
    s.rect(26, 9, 28, 11, VERT_MOMIE, glow=True)
    s.poly([(14, 2), (34, 2), (30, -1), (18, -1)], OR)  # coiffe royale
    s.dots([(2, 16), (6, 14), (10, 24)], VERT_MOMIE, glow=True)  # miasmes
    return s.render()


def ver_mineur():
    s = Sprite(48, 48)
    s.ellipse(4, 36, 46, 48, SABLE_F)  # le sable soulevé
    s.ellipse(8, 38, 42, 46, SABLE)
    s.poly([(18, 40), (30, 40), (32, 16), (16, 16)], '#8A6A4A')  # corps segmenté
    for y in (20, 26, 32, 38):
        s.line([(17, y), (31, y)], '#5A4430')
    s.ellipse(10, 2, 34, 22, '#9A7A54')  # gueule
    s.ellipse(14, 6, 30, 18, '#3A1A1A')
    s.dots([(15, 9), (18, 6), (22, 5), (26, 6), (29, 9), (16, 15), (28, 15)], '#F0E6D0')  # dents en cercle
    s.dots([(6, 34), (40, 32), (44, 40), (2, 42)], SABLE_C)
    return s.render()


def gardien_obsidienne():
    s = Sprite(64, 64)
    s.rect(20, 46, 28, 62, OBSI)
    s.rect(36, 46, 44, 62, OBSI)
    s.poly([(14, 18), (50, 18), (48, 48), (16, 48)], OBSI)  # torse taillé
    s.poly([(18, 22), (30, 20), (26, 36)], OBSI_C)  # facettes
    s.poly([(34, 24), (46, 22), (44, 40)], OBSI_C)
    s.line([(32, 26), (32, 42)], OR, glow=True)  # runes d'or
    s.line([(26, 32), (38, 32)], OR, glow=True)
    s.rect(2, 24, 14, 42, OBSI)  # bras massifs
    s.rect(50, 24, 60, 40, OBSI)
    s.ellipse(0, 38, 14, 50, OBSI_C)  # poing
    s.poly([(22, 2), (42, 2), (44, 18), (20, 18)], OBSI)  # tête
    s.rect(26, 9, 30, 11, OR_C, glow=True)
    s.rect(35, 9, 39, 11, OR_C, glow=True)
    return s.render()


def tentacule():
    s = Sprite(32, 32)
    s.poly([(12, 31), (20, 31), (22, 16), (14, 12)], CHAIR)  # tige
    s.line([(14, 28), (20, 26)], CHAIR_F)
    s.line([(14, 22), (21, 20)], CHAIR_F)
    s.ellipse(6, 2, 26, 18, CHAIR_C)  # globe oculaire
    s.ellipse(9, 5, 23, 15, '#F0E6D0')
    s.ellipse(11, 6, 19, 14, '#E0B040', glow=True)  # iris
    s.ellipse(13, 8, 17, 12, '#1A0A1A')
    s.dots([(5, 10), (27, 8), (24, 20)], CHAIR_C, glow=True)
    return s.render()


def garde_royale():
    s = Sprite(64, 64)
    s.rect(24, 46, 30, 62, CARAPACE_C)
    s.rect(36, 46, 42, 62, CARAPACE_C)
    s.poly([(16, 18), (50, 18), (52, 48), (14, 48)], CARAPACE)  # carapace massive
    s.poly([(20, 22), (46, 22), (44, 40), (22, 40)], CARAPACE_R)
    s.line([(33, 22), (33, 40)], CARAPACE)
    s.rect(14, 40, 52, 43, OR)
    s.ellipse(14, 2, 38, 22, CARAPACE_C)  # tête
    s.poly([(8, 8), (16, 6), (16, 14)], OR)  # mandibules
    s.poly([(8, 18), (16, 18), (16, 13)], OR)
    s.rect(18, 9, 21, 12, '#FF5A3A', glow=True)
    s.poly([(20, 2), (26, -2), (32, 2)], OR_C)  # couronne de garde
    s.line([(4, 50), (14, 26)], '#C9D2DE', width=2)  # lames d'avant-bras
    s.line([(54, 50), (58, 26)], '#C9D2DE', width=2)
    return s.render()


SPRITES = {
    'scarabee': scarabee, 'soldat_irem': soldat_irem, 'pretre_insecte': pretre_insecte, 'momie': momie,
    'ver_mineur': ver_mineur, 'gardien_obsidienne': gardien_obsidienne, 'tentacule': tentacule,
    'garde_royale': garde_royale,
}


# ---------- Boss secondaires (64 × 64) ----------

def mehkar():
    s = Sprite(64, 64)
    s.poly([(18, 22), (44, 22), (52, 62), (10, 62)], CHAIR_F)  # robe de prophète
    s.poly([(22, 24), (40, 24), (44, 60), (18, 60)], CHAIR)
    s.line([(31, 26), (31, 58)], OR)
    s.rect(18, 40, 44, 42, OR)
    s.ellipse(20, 2, 42, 24, CARAPACE_C)  # tête d'insecte
    s.poly([(14, 12), (21, 9), (21, 17)], OR)
    s.ellipse(23, 8, 28, 13, CHAIR_C, glow=True)  # yeux qui ont vu le dieu
    s.ellipse(32, 8, 37, 13, CHAIR_C, glow=True)
    s.line([(26, 2), (20, -2)], CARAPACE_R)
    s.line([(36, 2), (42, -2)], CARAPACE_R)
    s.poly([(24, 0), (31, -3), (38, 0), (31, 3)], OR_C)  # diadème
    s.rect(6, 30, 18, 34, CHAIR)  # bras levé
    s.ellipse(0, 20, 12, 32, CHAIR_C, glow=True)  # orbe arcanique
    s.ellipse(3, 23, 9, 29, '#F0E6D0', glow=True)
    s.dots([(14, 18), (8, 38), (50, 30), (56, 18), (48, 8)], CHAIR_C, glow=True)  # reflets
    return s.render()


def roi(c_main, c_eclat, mage):
    s = Sprite(64, 64)
    s.rect(24, 46, 30, 62, CARAPACE_C)
    s.rect(36, 46, 42, 62, CARAPACE_C)
    s.poly([(16, 20), (50, 20), (52, 50), (14, 50)], CARAPACE)
    s.poly([(20, 24), (46, 24), (44, 44), (22, 44)], c_main)
    s.rect(14, 44, 52, 47, OR)
    s.ellipse(18, 4, 42, 24, CARAPACE_C)  # tête
    s.poly([(12, 10), (20, 8), (20, 16)], OR)
    s.rect(22, 11, 25, 14, c_eclat, glow=True)
    s.poly([(20, 4), (24, -2), (28, 3), (32, -3), (36, 3), (40, -2), (42, 4)], OR_C)  # couronne
    if mage:
        s.line([(6, 60), (10, 20)], OR, width=2)  # sceptre
        s.ellipse(4, 12, 16, 24, c_eclat, glow=True)
        s.ellipse(7, 15, 13, 21, '#1A0A1A')
    else:
        s.line([(2, 54), (16, 22)], '#C9D2DE', width=3)  # lame royale
        s.poly([(14, 18), (20, 20), (16, 26)], OR)
    return s.render()


def asheth():
    return roi('#7A2A2A', '#FF5A3A', False)


def neshet():
    return roi('#2A2A6A', '#9A7AFF', True)


def gharul():
    s = Sprite(64, 64)
    s.ellipse(0, 46, 64, 64, SABLE_F)  # le désert soulevé
    s.ellipse(4, 50, 60, 62, SABLE)
    s.poly([(22, 52), (44, 52), (48, 22), (40, 10), (20, 14)], '#8A6A4A')  # corps énorme
    for y in (20, 28, 36, 44):
        s.line([(20, y), (46, y - 2)], '#5A4430')
    s.ellipse(4, 0, 40, 30, '#9A7A54')  # gueule béante
    s.ellipse(8, 4, 36, 26, '#3A1A1A')
    s.ellipse(14, 9, 30, 21, '#5A1A2A')
    s.dots([(10, 8), (14, 5), (19, 3), (24, 3), (29, 5), (33, 8), (9, 15), (35, 15), (11, 22), (33, 22), (16, 25), (28, 25)], '#F0E6D0')
    s.dots([(2, 44), (58, 40), (62, 50), (6, 56), (50, 58)], SABLE_C)
    return s.render()


def kesh():
    s = Sprite(48, 48)
    s.rect(16, 34, 20, 46, CARAPACE_C)
    s.rect(28, 34, 32, 46, CARAPACE_C)
    s.ellipse(10, 14, 40, 38, CARAPACE)  # carapace bombée
    s.ellipse(14, 17, 36, 34, '#3A4A6E')
    s.line([(25, 17), (25, 34)], CARAPACE)
    s.ellipse(4, 12, 18, 26, CARAPACE_C)  # tête basse, prête à charger
    s.poly([(0, 16), (5, 14), (4, 20)], OR)
    s.rect(6, 17, 8, 19, OR_C, glow=True)
    s.poly([(10, 10), (14, 4), (18, 12)], OR_C)  # petite couronne
    return s.render()


def vorra():
    s = Sprite(48, 48)
    s.poly([(14, 18), (34, 18), (38, 46), (10, 46)], '#2A5A4A')  # robe de soigneuse
    s.poly([(18, 20), (30, 20), (32, 44), (16, 44)], '#3A8A6A')
    s.ellipse(15, 2, 31, 20, CARAPACE_C)
    s.rect(18, 9, 20, 11, '#7EF0B0', glow=True)
    s.rect(25, 9, 27, 11, '#7EF0B0', glow=True)
    s.poly([(16, 2), (20, -2), (24, 2), (28, -2), (32, 2)], OR_C)
    with s.marque('aile'):
        s.poly([(30, 18), (46, 10), (44, 26)], '#C8E8F0')  # ailes translucides
        s.poly([(18, 18), (2, 10), (4, 26)], '#C8E8F0')
    s.dots([(6, 34), (10, 30), (40, 34), (36, 38)], '#7EF0B0', glow=True)  # chant de soin
    return s.render()


def tazz():
    s = Sprite(48, 48)
    s.ellipse(14, 16, 38, 34, CARAPACE)  # corps fin
    s.ellipse(17, 19, 35, 31, '#5A6A2A')
    s.poly([(36, 24), (46, 20), (46, 34), (40, 30)], CARAPACE_C)  # abdomen
    s.line([(44, 34), (40, 44)], '#9AE04A', width=2)  # dard
    s.dots([(39, 45), (41, 46)], '#9AE04A', glow=True)
    s.ellipse(4, 14, 18, 26, CARAPACE_C)
    s.rect(6, 18, 8, 20, '#9AE04A', glow=True)
    s.poly([(8, 12), (11, 7), (14, 12)], OR_C)
    for x in (18, 24, 30):
        s.line([(x, 33), (x - 3, 42)], CARAPACE_C)
    return s.render()


def limon():
    s = Sprite(64, 64)
    s.ellipse(2, 26, 62, 62, '#2A6A3A')  # masse visqueuse
    s.ellipse(8, 18, 54, 56, '#3A8A4A')
    s.ellipse(16, 22, 40, 40, '#5AB06A')
    s.ellipse(20, 26, 28, 32, '#9AE0A0', glow=True)  # reflet
    s.ellipse(14, 34, 22, 42, '#F0E6D0')  # yeux noyés dans la gelée
    s.ellipse(16, 36, 20, 40, '#1A0A1A')
    s.ellipse(34, 30, 40, 36, '#F0E6D0')
    s.ellipse(35, 31, 38, 34, '#1A0A1A')
    s.dots([(46, 20), (52, 26), (8, 24), (4, 50), (58, 48)], '#9AE0A0', glow=True)  # bulles
    s.poly([(22, 58), (26, 63), (30, 58)], '#2A6A3A')
    return s.render()


def limon_mineur():
    s = Sprite(32, 32)
    s.ellipse(2, 12, 30, 31, '#2A6A3A')
    s.ellipse(5, 9, 27, 28, '#3A8A4A')
    s.ellipse(9, 12, 16, 18, '#9AE0A0', glow=True)
    s.ellipse(8, 18, 13, 23, '#F0E6D0')
    s.ellipse(9, 19, 12, 22, '#1A0A1A')
    s.dots([(24, 8), (27, 13)], '#9AE0A0', glow=True)
    return s.render()


def sartaq():
    s = Sprite(64, 64)
    s.rect(18, 46, 28, 63, OBSI)
    s.rect(36, 46, 46, 63, OBSI)
    s.poly([(10, 14), (54, 14), (52, 48), (12, 48)], OBSI)  # torse colossal
    s.poly([(14, 18), (30, 16), (24, 36)], OBSI_C)
    s.poly([(34, 20), (50, 18), (46, 40)], OBSI_C)
    s.poly([(26, 22), (38, 22), (32, 34)], '#9A7AFF', glow=True)  # cœur de suprématie
    s.line([(14, 44), (50, 44)], OR, glow=True)
    s.rect(0, 18, 12, 44, OBSI)  # bras énormes
    s.rect(52, 18, 63, 40, OBSI)
    s.ellipse(0, 40, 14, 54, OBSI_C)
    s.poly([(22, 0), (42, 0), (46, 14), (18, 14)], OBSI)  # tête
    s.rect(25, 6, 29, 8, OR_C, glow=True)
    s.rect(35, 6, 39, 8, OR_C, glow=True)
    s.dots([(8, 6), (58, 8), (4, 58), (60, 56)], SABLE_C)  # poussière
    return s.render()


def nebet():
    s = Sprite(64, 64)
    s.poly([(18, 22), (46, 22), (54, 62), (10, 62)], '#2A1A3A')  # robe noire
    s.poly([(22, 24), (42, 24), (46, 60), (18, 60)], CHAIR_F)
    s.line([(32, 26), (32, 58)], OR)
    s.ellipse(20, 2, 44, 24, CARAPACE_C)  # tête
    s.rect(22, 9, 42, 13, BANDE)  # bandeau sur les yeux arrachés
    s.dots([(26, 14), (37, 14), (26, 16), (37, 16)], '#8A1A2A')
    s.poly([(14, 12), (21, 9), (21, 17)], OR)
    s.ellipse(26, -2, 38, 6, CHAIR_C, glow=True)  # le troisième œil, celui des rêves
    s.ellipse(30, 0, 34, 4, '#1A0A1A')
    s.rect(6, 30, 18, 34, CHAIR_F)
    s.line([(4, 62), (8, 22)], OR, width=2)  # bâton
    s.dots([(2, 18), (10, 14), (52, 26), (58, 36), (48, 12)], CHAIR_C, glow=True)  # murmures
    return s.render()


SPRITES.update({
    'mehkar': mehkar, 'mehkar_copie': mehkar, 'asheth': asheth, 'neshet': neshet, 'gharul': gharul,
    'kesh': kesh, 'vorra': vorra, 'tazz': tazz, 'limon': limon, 'limon_mineur': limon_mineur,
    'sartaq': sartaq, 'nebet': nebet,
})


# ---------- Cartes-statut de l'acte ----------

def carte_sable():
    s = Sprite(32, 32)
    s.ellipse(2, 18, 30, 30, SABLE_F)
    s.ellipse(6, 14, 26, 26, SABLE)
    s.dots([(8, 8), (14, 5), (20, 9), (25, 6), (11, 12), (22, 12), (17, 3)], SABLE_C)
    s.line([(4, 22), (12, 20), (20, 23), (28, 21)], SABLE_C)
    return s.render()


def carte_hallucination():
    s = Sprite(32, 32)
    s.ellipse(4, 4, 28, 28, CHAIR_F)
    s.ellipse(7, 9, 25, 23, '#F0E6D0')  # un œil qui regarde à travers la carte
    s.ellipse(11, 11, 21, 21, CHAIR_C, glow=True)
    s.ellipse(14, 14, 18, 18, '#1A0A1A')
    s.dots([(3, 3), (28, 5), (5, 27), (27, 27)], CHAIR_C, glow=True)
    return s.render()


def carte_cristal_obsidienne():
    s = Sprite(32, 32)
    s.poly([(16, 1), (26, 12), (20, 30), (12, 30), (6, 12)], OBSI)
    s.poly([(16, 3), (22, 12), (16, 26), (10, 12)], OBSI_C)
    s.poly([(14, 8), (18, 8), (16, 18)], '#9A7AFF', glow=True)
    s.line([(9, 20), (23, 14)], OR_C, glow=True)  # la fêlure
    s.dots([(4, 4), (28, 6), (27, 26), (3, 26)], '#9A7AFF', glow=True)
    return s.render()


CARTES = {'sable': carte_sable, 'hallucination': carte_hallucination, 'cristal_obsidienne': carte_cristal_obsidienne}


if __name__ == '__main__':
    os.makedirs(DEST, exist_ok=True)
    for name, fn in SPRITES.items():
        fn().save(os.path.join(DEST, f'ennemi_{name}.png'))
    for name, fn in CARTES.items():
        fn().save(os.path.join(DEST, f'carte_{name}.png'))
    print(len(SPRITES), 'sprites,', len(CARTES), 'cartes')
