"""Les illustrations des cartes du Chaman (32 x 32 pixels).
Palette : le bleu de la foudre, l'orange de la lave, le brun de la terre, le bleu clair de l'eau."""
import math
from illustrations import ACIER, FEU, JAUNE, ROUGE, arc, bouclier, eclat, flamme_de, goutte_de, hache, marteau, nouveau, ondes, vitesse

FOUDRE, FOUDRE_C = '#8FD8FF', '#FFFFFF'
LAVE = '#E8562A'
TERRE, TERRE_F = '#8A6A4A', '#5A4430'
EAU, EAU_C = '#5AA0D8', '#BFE2FF'
BOIS = '#7A5434'
SOIN = '#7ED87A'
VENT = '#C8E0F0'


# ---------- Formes de base ----------

def eclair_de(s, x, y, h=20, couleur=FOUDRE):
    """Un éclair en zigzag qui descend de (x, y)."""
    pts = [(x, y), (x - 4, y + h * 0.4), (x + 1, y + h * 0.45), (x - 3, y + h)]
    s.line(pts, couleur, width=2, glow=True)
    s.line(pts, FOUDRE_C, width=1, glow=True)


def totem(s, x, y, couleur, symbole=None, h=22):
    """Un totem de bois sculpté (x, y en haut à gauche), coiffé d'un symbole élémentaire."""
    s.rect(x, y + 4, x + 8, y + h, BOIS)
    s.rect(x - 1, y + 8, x + 9, y + 10, '#5A3A1E')
    s.rect(x - 1, y + 15, x + 9, y + 17, '#5A3A1E')
    s.dots([(x + 2, y + 12), (x + 6, y + 12)], couleur, glow=True)
    s.ellipse(x - 1, y, x + 9, y + 7, couleur, glow=True)
    if symbole:
        symbole(s, x + 4, y + 3)


def soin(s, cx, cy, r=3, couleur=SOIN):
    s.rect(cx - 1, cy - r, cx + 1, cy + r, couleur, glow=True)
    s.rect(cx - r, cy - 1, cx + r, cy + 1, couleur, glow=True)


def vague(s, y, couleur=EAU, amp=2):
    pts = [(x, y + math.sin(x / 3) * amp) for x in range(0, 32, 2)]
    s.line(pts, couleur, width=2)


# ---------- Départ et tronc commun ----------

def garde_de_pierre():
    s = nouveau()
    bouclier(s, 7, 4, 25, 29, bord=TERRE_F, fond=TERRE, centre=False)
    s.line([(11, 12), (16, 9), (21, 13)], TERRE_F)
    return s.render()


def totem_pierre():
    s = nouveau()
    totem(s, 12, 4, TERRE)
    bouclier(s, 22, 16, 30, 28, bord=TERRE_F, fond=TERRE, centre=False)
    return s.render()


def totem_braise():
    s = nouveau()
    totem(s, 6, 6, FEU)
    flamme_de(s, 18, 8, 10, 14)
    return s.render()


def totem_guerisseur():
    s = nouveau()
    totem(s, 6, 6, EAU)
    soin(s, 23, 14, 5)
    return s.render()


def choc_flammes():
    s = nouveau()
    flamme_de(s, 6, 4, 20, 24, ext=LAVE)
    eclat(s, 16, 22, 5, JAUNE, '#FFFFFF')
    return s.render()


def choc_givre():
    s = nouveau()
    eclat(s, 16, 16, 12, EAU, EAU_C)
    for k in range(4):
        a = k * math.pi / 2 + math.pi / 4
        s.line([(16, 16), (16 + math.cos(a) * 14, 16 + math.sin(a) * 14)], EAU_C, glow=True)
    return s.render()


def pas_loup_spectral():
    s = nouveau()
    for x, y in [(6, 24), (14, 18), (22, 12)]:
        s.ellipse(x - 3, y - 2, x + 3, y + 3, '#7AC8E8', glow=True)
        s.dots([(x - 3, y - 4), (x, y - 5), (x + 3, y - 4)], '#7AC8E8', glow=True)
    flamme_de(s, 22, 20, 8, 10)
    return s.render()


def totem_vents():
    s = nouveau()
    totem(s, 6, 6, VENT)
    ondes(s, 18, 12, VENT, n=3, a0=-40, a1=40)
    return s.render()


def totem_purification():
    s = nouveau()
    totem(s, 6, 6, EAU_C)
    goutte_de(s, 23, 6, 14, '#7AC8E8')
    return s.render()


def bouclier_foudre():
    s = nouveau()
    arc(s, 16, 16, 12, 0, 360, FOUDRE)
    for k in range(3):
        a = k * 2 * math.pi / 3
        s.dots([(16 + math.cos(a) * 12, 16 + math.sin(a) * 12)], FOUDRE_C, glow=True)
    eclair_de(s, 17, 6, 20)
    return s.render()


# ---------- Élémentaire ----------

def eclair():
    s = nouveau()
    eclair_de(s, 20, 1, 28)
    eclat(s, 16, 28, 4, FOUDRE, FOUDRE_C)
    return s.render()


def grondement_tonnerre():
    s = nouveau()
    s.ellipse(4, 4, 28, 14, '#5A6A7A')
    eclair_de(s, 12, 12, 16)
    eclair_de(s, 22, 12, 16)
    ondes(s, 16, 26, FOUDRE, n=2, a0=200, a1=340)
    return s.render()


def orbe_foudre():
    s = nouveau()
    s.ellipse(8, 8, 24, 24, FOUDRE, glow=True)
    s.ellipse(12, 12, 20, 20, FOUDRE_C, glow=True)
    for k in range(4):
        a = k * math.pi / 2 + 0.3
        s.line([(16 + math.cos(a) * 9, 16 + math.sin(a) * 9), (16 + math.cos(a) * 14, 16 + math.sin(a) * 13)], FOUDRE, glow=True)
    return s.render()


def courant_ascendant():
    s = nouveau()
    for x in (8, 16, 24):
        s.line([(x, 30), (x - 2, 20), (x + 2, 10), (x, 2)], VENT, glow=True)
    s.poly([(12, 6), (16, 0), (20, 6)], FOUDRE_C, glow=True)
    return s.render()


def rage_elements():
    s = nouveau()
    for (x, y), c in zip([(8, 8), (24, 8), (8, 24), (24, 24)], [TERRE, FEU, EAU, VENT]):
        s.ellipse(x - 5, y - 5, x + 5, y + 5, c, glow=True)
    eclat(s, 16, 16, 6, JAUNE, '#FFFFFF')
    return s.render()


def chaine_eclairs():
    s = nouveau()
    pts = [(2, 6), (12, 14), (8, 18), (20, 24), (16, 28), (30, 30)]
    s.line(pts, FOUDRE, width=2, glow=True)
    s.line(pts, FOUDRE_C, glow=True)
    for x, y in [(12, 14), (20, 24), (30, 30)]:
        s.dots([(x, y)], '#FFFFFF', glow=True)
    return s.render()


def jet_lave():
    s = nouveau()
    s.poly([(2, 28), (6, 24), (28, 4), (30, 8), (10, 28)], LAVE, glow=True)
    s.line([(6, 26), (28, 6)], JAUNE, glow=True)
    eclat(s, 27, 6, 4, ROUGE, FEU)
    return s.render()


def totem_lave():
    s = nouveau()
    totem(s, 12, 2, LAVE)
    s.rect(0, 26, 31, 31, LAVE, glow=True)
    vague(s, 26, JAUNE, 1)
    return s.render()


def concentration_elementaire():
    s = nouveau()
    for k, c in enumerate([TERRE, FEU, EAU, VENT]):
        a = k * math.pi / 2
        s.ellipse(16 + math.cos(a) * 10 - 3, 16 + math.sin(a) * 10 - 3, 16 + math.cos(a) * 10 + 3, 16 + math.sin(a) * 10 + 3, c, glow=True)
    s.ellipse(12, 12, 20, 20, '#FFFFFF', glow=True)
    return s.render()


def appel_foudre():
    s = nouveau()
    s.line([(16, 31), (16, 14)], BOIS, width=2)
    s.ellipse(11, 8, 21, 16, FOUDRE, glow=True)
    eclair_de(s, 8, 0, 10)
    eclair_de(s, 26, 0, 10)
    return s.render()


def seisme():
    s = nouveau()
    s.rect(0, 18, 31, 31, TERRE)
    s.line([(4, 18), (10, 24), (14, 20), (20, 28), (26, 22)], '#1A1210', width=2)
    for x in (6, 16, 26):
        s.poly([(x - 3, 18), (x, 10), (x + 3, 18)], TERRE_F)
    vitesse(s, [(2, 6, 8, 6), (24, 4, 30, 4)], TERRE)
    return s.render()


def fureur_elementaire():
    s = nouveau()
    flamme_de(s, 2, 4, 12, 18)
    eclair_de(s, 22, 2, 18)
    goutte_de(s, 10, 18, 10, EAU)
    s.poly([(18, 30), (24, 22), (30, 30)], TERRE)
    return s.render()


def totem_orage():
    s = nouveau()
    totem(s, 6, 8, FOUDRE)
    s.ellipse(14, 0, 31, 10, '#5A6A7A')
    eclair_de(s, 24, 8, 16)
    return s.render()


def avatar_tempete():
    s = nouveau()
    s.ellipse(2, 2, 30, 30, '#22304A')
    s.ellipse(10, 6, 22, 18, FOUDRE, glow=True)
    s.dots([(13, 11), (19, 11)], '#FFFFFF', glow=True)
    s.poly([(10, 18), (22, 18), (16, 30)], FOUDRE, glow=True)
    eclair_de(s, 6, 2, 12)
    eclair_de(s, 28, 4, 12)
    return s.render()


# ---------- Amélioration ----------

def frappe_primitive():
    s = nouveau()
    marteau(s, 6, 28, 18, 10, tete='#8A8A94')
    eclat(s, 24, 8, 5, '#E8E0C8', JAUNE)
    return s.render()


def coup_lave():
    s = nouveau()
    hache(s, 6, 28, 14, 8, tete=LAVE)
    flamme_de(s, 20, 12, 10, 14)
    return s.render()


def double_impact():
    s = nouveau()
    hache(s, 2, 28, 8, 10)
    hache(s, 14, 28, 20, 10, tete=FOUDRE)
    s.dots([(28, 10), (27, 12)], FOUDRE_C, glow=True)
    return s.render()


def tourbillon_vents():
    s = nouveau()
    for k in range(4):
        arc(s, 16, 16, 4 + k * 4, k * 60, 250 + k * 60, VENT)
    hache(s, 20, 26, 24, 12)
    return s.render()


def arme_flammes():
    s = nouveau()
    hache(s, 6, 28, 14, 10, tete=ACIER)
    flamme_de(s, 14, 0, 14, 20)
    return s.render()


def arme_givre():
    s = nouveau()
    hache(s, 6, 28, 14, 10, tete=EAU_C)
    for x, y in [(24, 6), (28, 14), (22, 20)]:
        s.dots([(x, y), (x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)], EAU_C, glow=True)
    return s.render()


def arme_vents():
    s = nouveau()
    hache(s, 6, 28, 14, 10, tete=VENT)
    vitesse(s, [(18, 6, 30, 6), (20, 12, 31, 12), (18, 18, 30, 18)], VENT)
    return s.render()


def lame_foudroyante():
    s = nouveau()
    hache(s, 4, 28, 12, 8, tete=FOUDRE)
    s.line([(20, 10), (24, 16), (22, 18), (28, 26)], FOUDRE, width=2, glow=True)
    return s.render()


def transe_guerriere():
    s = nouveau()
    s.ellipse(8, 4, 24, 20, '#C8A078')
    s.rect(11, 10, 14, 12, ROUGE, glow=True, shade=False)
    s.rect(18, 10, 21, 12, ROUGE, glow=True, shade=False)
    for k in range(3):
        arc(s, 16, 12, 12 + k * 3, 200, 340, ROUGE)
    return s.render()


def esprit_combatif():
    s = nouveau()
    totem(s, 4, 8, ROUGE)
    marteau(s, 16, 28, 26, 10, tete='#8A8A94')
    eclat(s, 28, 6, 3, JAUNE, '#FFFFFF')
    return s.render()


def totem_force():
    s = nouveau()
    totem(s, 12, 6, TERRE)
    s.poly([(2, 22), (8, 16), (8, 20), (10, 20), (10, 26), (8, 26), (8, 28)], ROUGE, glow=True)
    return s.render()


def esprits_loups():
    s = nouveau()
    for x, y in [(2, 6), (12, 16)]:
        s.ellipse(x, y + 2, x + 14, y + 12, '#7AC8E8')
        s.poly([(x + 10, y + 4), (x + 18, y + 6), (x + 16, y + 10), (x + 10, y + 10)], '#9AD8F0')
        s.poly([(x + 2, y + 4), (x + 4, y - 1), (x + 6, y + 3)], '#7AC8E8')
        s.dots([(x + 9, y + 5)], '#FFFFFF', glow=True)
    return s.render()


def arme_tourbillonnante():
    s = nouveau()
    for k in range(5):
        a = k * 2 * math.pi / 5
        s.ellipse(16 + math.cos(a) * 10 - 2, 16 + math.sin(a) * 10 - 2, 16 + math.cos(a) * 10 + 2, 16 + math.sin(a) * 10 + 2, FOUDRE, glow=True)
    arc(s, 16, 16, 6, 0, 270, VENT)
    return s.render()


def frappe_orage():
    s = nouveau()
    hache(s, 2, 28, 8, 10, tete=FOUDRE)
    hache(s, 14, 28, 20, 10, tete=FOUDRE)
    eclair_de(s, 26, 0, 30)
    return s.render()


# ---------- Restauration ----------

def petite_vague():
    s = nouveau()
    vague(s, 22, EAU)
    vague(s, 27, EAU_C)
    soin(s, 16, 10, 4)
    return s.render()


def vague_soins():
    s = nouveau()
    s.poly([(0, 31), (0, 18), (8, 10), (16, 14), (24, 6), (31, 12), (31, 31)], EAU)
    vague(s, 18, EAU_C)
    soin(s, 16, 24, 4, '#FFFFFF')
    return s.render()


def remous():
    s = nouveau()
    for k in range(4):
        arc(s, 16, 16, 3 + k * 3, k * 80, 260 + k * 80, EAU)
    soin(s, 16, 16, 2)
    return s.render()


def esprit_purifie():
    s = nouveau()
    goutte_de(s, 16, 2, 22, EAU_C)
    soin(s, 16, 18, 3)
    return s.render()


def pluie_guerisseuse():
    s = nouveau()
    s.ellipse(4, 2, 28, 12, '#8A9AAA')
    for x in (8, 14, 20, 26):
        s.line([(x, 14), (x - 2, 22)], EAU, glow=True)
    soin(s, 16, 26, 3)
    return s.render()


def equilibre_chaman():
    s = nouveau()
    s.line([(4, 10), (28, 10)], BOIS, width=2)
    s.line([(16, 10), (16, 28)], BOIS, width=2)
    s.ellipse(2, 12, 10, 18, EAU, glow=True)
    s.ellipse(22, 12, 30, 18, FEU, glow=True)
    soin(s, 16, 4, 3)
    return s.render()


def flots_apaisants():
    s = nouveau()
    bouclier(s, 8, 4, 24, 28, bord=EAU, fond='#1E3A5A', centre=False)
    vague(s, 14, EAU_C, 1)
    return s.render()


def bouclier_eau():
    s = nouveau()
    s.ellipse(4, 4, 28, 28, EAU)
    s.ellipse(8, 8, 24, 24, '#1E3A5A')
    for k in range(3):
        a = k * 2 * math.pi / 3
        s.ellipse(16 + math.cos(a) * 12 - 2, 16 + math.sin(a) * 12 - 2, 16 + math.cos(a) * 12 + 2, 16 + math.sin(a) * 12 + 2, EAU_C, glow=True)
    soin(s, 16, 16, 3)
    return s.render()


def totem_source():
    s = nouveau()
    totem(s, 12, 2, EAU)
    s.ellipse(2, 24, 30, 31, EAU)
    vague(s, 26, EAU_C, 1)
    return s.render()


def rapidite_nature():
    s = nouveau()
    for k in range(3):
        s.poly([(4 + k * 8, 8), (12 + k * 8, 16), (4 + k * 8, 24)], SOIN, glow=True)
    return s.render()


def bouclier_terre():
    s = nouveau()
    s.poly([(16, 2), (28, 8), (26, 22), (16, 30), (6, 22), (4, 8)], TERRE)
    s.poly([(16, 6), (24, 10), (22, 20), (16, 26), (10, 20), (8, 10)], TERRE_F)
    soin(s, 16, 16, 4)
    return s.render()


def maree_montante():
    s = nouveau()
    for k in range(4):
        vague(s, 28 - k * 6, EAU if k % 2 else EAU_C, 2)
    soin(s, 24, 6, 3)
    return s.render()


def vigueur_ancestrale():
    s = nouveau()
    bouclier(s, 6, 4, 26, 30, bord=TERRE_F, fond=TERRE, centre=False)
    soin(s, 16, 14, 5)
    return s.render()


def totem_marees():
    s = nouveau()
    totem(s, 12, 2, EAU)
    s.rect(0, 22, 31, 31, '#1E3A5A')
    vague(s, 22, EAU, 2)
    vague(s, 27, EAU_C, 1)
    s.dots([(4, 8), (28, 6), (26, 14)], JAUNE, glow=True)
    return s.render()


ILLUSTRATIONS_CHAMAN = {name: fn for name, fn in list(globals().items()) if callable(fn) and name in {
    'garde_de_pierre', 'totem_pierre', 'totem_braise', 'totem_guerisseur', 'choc_flammes', 'choc_givre', 'pas_loup_spectral',
    'totem_vents', 'totem_purification', 'bouclier_foudre',
    'eclair', 'grondement_tonnerre', 'orbe_foudre', 'courant_ascendant', 'rage_elements', 'chaine_eclairs', 'jet_lave',
    'totem_lave', 'concentration_elementaire', 'appel_foudre', 'seisme', 'fureur_elementaire', 'totem_orage', 'avatar_tempete',
    'frappe_primitive', 'coup_lave', 'double_impact', 'tourbillon_vents', 'arme_flammes', 'arme_givre', 'arme_vents',
    'lame_foudroyante', 'transe_guerriere', 'esprit_combatif', 'totem_force', 'esprits_loups', 'arme_tourbillonnante', 'frappe_orage',
    'petite_vague', 'vague_soins', 'remous', 'esprit_purifie', 'pluie_guerisseuse', 'equilibre_chaman', 'flots_apaisants',
    'bouclier_eau', 'totem_source', 'rapidite_nature', 'bouclier_terre', 'maree_montante', 'vigueur_ancestrale', 'totem_marees',
}}
