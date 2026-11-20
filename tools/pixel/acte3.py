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


CARTES = {'sable': carte_sable, 'hallucination': carte_hallucination}


if __name__ == '__main__':
    os.makedirs(DEST, exist_ok=True)
    for name, fn in SPRITES.items():
        fn().save(os.path.join(DEST, f'ennemi_{name}.png'))
    for name, fn in CARTES.items():
        fn().save(os.path.join(DEST, f'carte_{name}.png'))
    print(len(SPRITES), 'sprites,', len(CARTES), 'cartes')
