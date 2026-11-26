"""Les illustrations des cartes du Druide (32 x 32 pixels).
Palette : le vert des feuilles, le brun de l'ours, le gris sombre du félin, le bleu nuit des étoiles."""
import math
from illustrations import FEU, JAUNE, ROUGE, arc, bouclier, coeur, eclat, etoile, flamme_de, goutte_de, nouveau, ondes, vitesse

FEUILLE, FEUILLE_F, FEUILLE_C = '#4E8A3A', '#2E5A22', '#9AD87A'
ECORCE, ECORCE_F = '#7A5434', '#4A321E'
OURS, OURS_C = '#6A4428', '#A07850'
CHAT, CHAT_C = '#3A3440', '#5A5260'
LUNE, LUNE_C, NUIT = '#8FB8E8', '#E8F4FF', '#1E2A5A'
SOIN = '#7ED87A'
FLEUR = '#E87AA8'


# ---------- Formes de base ----------

def feuille(s, x, y, r=4, couleur=FEUILLE, angle=0):
    a = math.radians(angle)
    ux, uy = math.cos(a), math.sin(a)
    px, py = -uy, ux
    s.poly([(x - ux * r, y - uy * r), (x + px * r * 0.5, y + py * r * 0.5), (x + ux * r, y + uy * r), (x - px * r * 0.5, y - py * r * 0.5)], couleur)
    s.line([(x - ux * r, y - uy * r), (x + ux * r, y + uy * r)], FEUILLE_F)


def croissant(s, cx, cy, r, couleur=LUNE_C, width=3):
    pts = [(cx + math.cos(math.radians(t)) * r, cy + math.sin(math.radians(t)) * r) for t in range(60, 300, 10)]
    s.line(pts, couleur, width=width, glow=True)


def soin(s, cx, cy, r=3, couleur=SOIN):
    s.rect(cx - 1, cy - r, cx + 1, cy + r, couleur, glow=True)
    s.rect(cx - r, cy - 1, cx + r, cy + 1, couleur, glow=True)


def tete_ours(s, x, y, couleur=OURS):
    s.ellipse(x, y + 2, x + 6, y + 8, ECORCE_F)
    s.ellipse(x + 12, y + 2, x + 18, y + 8, ECORCE_F)
    s.ellipse(x, y + 4, x + 18, y + 20, couleur)
    s.ellipse(x + 5, y + 12, x + 13, y + 19, OURS_C)
    s.ellipse(x + 7, y + 12, x + 11, y + 15, '#1A1210')
    s.dots([(x + 5, y + 9), (x + 13, y + 9)], '#1A1210')


def tete_chat(s, x, y, couleur=CHAT):
    s.poly([(x + 1, y + 6), (x + 3, y), (x + 7, y + 5)], couleur)
    s.poly([(x + 11, y + 5), (x + 15, y), (x + 17, y + 6)], couleur)
    s.ellipse(x, y + 3, x + 18, y + 18, couleur)
    s.rect(x + 4, y + 8, x + 6, y + 9, '#E8D84A', glow=True, shade=False)
    s.rect(x + 12, y + 8, x + 14, y + 9, '#E8D84A', glow=True, shade=False)
    s.poly([(x + 8, y + 12), (x + 10, y + 12), (x + 9, y + 13)], FLEUR)


def griffes(s, x, y, couleur='#E8E0C8', n=3):
    for k in range(n):
        s.line([(x + k * 4, y), (x + k * 4 + 6, y + 14)], couleur, width=1, glow=True)


def baton(s, x0, y0, x1, y1):
    s.line([(x0, y0), (x1, y1)], ECORCE, width=2)
    s.ellipse(x1 - 4, y1 - 4, x1 + 4, y1 + 4, FEUILLE)
    s.dots([(x1 - 1, y1 - 2), (x1 + 2, y1)], FLEUR, glow=True)


# ---------- Départ et tronc commun ----------

def garde_sylvestre():
    s = nouveau()
    bouclier(s, 7, 4, 25, 29, bord=ECORCE, fond=FEUILLE_F, centre=False)
    feuille(s, 16, 13, 5, FEUILLE_C, 90)
    return s.render()


def colere():
    s = nouveau()
    s.ellipse(14, 8, 26, 20, FEUILLE_C, glow=True)
    s.ellipse(17, 11, 23, 17, '#FFFFFF', glow=True)
    vitesse(s, [(2, 14, 12, 14), (4, 9, 13, 11), (4, 19, 13, 17)], FEUILLE)
    return s.render()


def feu_de_lune():
    s = nouveau()
    s.rect(13, 0, 19, 31, LUNE, glow=True)
    s.rect(15, 0, 17, 31, LUNE_C, glow=True)
    croissant(s, 16, 8, 5, NUIT, 2)
    eclat(s, 16, 27, 5, LUNE, LUNE_C)
    return s.render()


def renouveau():
    s = nouveau()
    for k in range(3):
        feuille(s, 10 + k * 6, 22 - k * 6, 4, FEUILLE_C, -45)
    arc(s, 16, 16, 12, 0, 300, SOIN)
    return s.render()


def racines():
    s = nouveau()
    for x in (6, 14, 22):
        s.line([(x, 31), (x + 2, 20), (x - 1, 12), (x + 3, 4)], ECORCE, width=2)
    s.line([(4, 18), (28, 14)], ECORCE_F, width=2)
    return s.render()


def epines_druide():
    s = nouveau()
    s.ellipse(8, 8, 24, 24, FEUILLE_F)
    for k in range(10):
        a = k / 10 * math.pi * 2
        s.line([(16 + math.cos(a) * 8, 16 + math.sin(a) * 8), (16 + math.cos(a) * 14, 16 + math.sin(a) * 14)], ECORCE, width=1)
    return s.render()


def instinct_sauvage():
    s = nouveau()
    tete_ours(s, 1, 2, OURS)
    tete_chat(s, 13, 13)
    croissant(s, 26, 5, 4)
    return s.render()


def purge_naturelle():
    s = nouveau()
    goutte_de(s, 16, 3, 18, '#7AC8E8')
    feuille(s, 8, 24, 4, FEUILLE_C, 30)
    feuille(s, 24, 24, 4, FEUILLE_C, -30)
    return s.render()


def poussiere_feerique():
    s = nouveau()
    for x, y in [(6, 8), (12, 20), (20, 6), (26, 18), (16, 13), (8, 26), (24, 27)]:
        etoile(s, x, y, 3, FLEUR if (x + y) % 2 else '#E8D8FF')
    return s.render()


def don_des_bois():
    s = nouveau()
    s.poly([(14, 31), (18, 31), (17, 14), (15, 14)], ECORCE)
    s.ellipse(4, 2, 28, 20, FEUILLE)
    s.ellipse(8, 5, 18, 13, FEUILLE_C)
    s.dots([(22, 12), (10, 16)], JAUNE, glow=True)
    return s.render()


# ---------- Équilibre ----------

def forme_astrale():
    s = nouveau()
    s.ellipse(2, 2, 30, 30, NUIT)
    croissant(s, 16, 16, 9)
    for x, y in [(8, 8), (24, 24), (26, 8)]:
        s.dots([(x, y)], LUNE_C, glow=True)
    return s.render()


def feu_stellaire():
    s = nouveau()
    etoile(s, 16, 12, 10, JAUNE)
    s.ellipse(13, 9, 19, 15, '#FFFFFF', glow=True)
    vitesse(s, [(16, 22, 16, 31), (10, 22, 6, 30), (22, 22, 26, 30)], FEU)
    return s.render()


def eclat_lunaire():
    s = nouveau()
    croissant(s, 14, 16, 9)
    eclat(s, 24, 14, 5, LUNE, LUNE_C)
    return s.render()


def nuee_insectes():
    s = nouveau()
    for k, (x, y) in enumerate([(6, 6), (14, 4), (22, 8), (10, 14), (20, 16), (26, 22), (8, 24), (16, 26)]):
        s.ellipse(x, y, x + 3, y + 2, '#3A3A2A')
        s.dots([(x + 1, y - 1)], '#C8E0C8')
    return s.render()


def lueur_lunaire():
    s = nouveau()
    croissant(s, 16, 16, 10, LUNE)
    arc(s, 16, 16, 13, 0, 360, LUNE_C)
    return s.render()


def etoiles_filantes():
    s = nouveau()
    for x, y in [(8, 8), (18, 14), (26, 24)]:
        etoile(s, x, y, 4, JAUNE)
        vitesse(s, [(x - 8, y - 6, x - 3, y - 2)], LUNE)
    return s.render()


def rayon_lunaire():
    s = nouveau()
    s.poly([(12, 0), (20, 0), (24, 31), (8, 31)], LUNE, glow=True)
    s.rect(15, 0, 17, 31, LUNE_C, glow=True)
    return s.render()


def typhon():
    s = nouveau()
    for k in range(4):
        arc(s, 16, 16, 4 + k * 4, k * 40, 240 + k * 40, LUNE)
    return s.render()


def grace_nature():
    s = nouveau()
    bouclier(s, 8, 6, 24, 28, bord=ECORCE, fond=FEUILLE_F, centre=False)
    etoile(s, 16, 15, 5, LUNE_C)
    return s.render()


def puissance_astrale():
    s = nouveau()
    croissant(s, 16, 16, 8)
    for k in range(4):
        a = k * math.pi / 2
        s.line([(16 + math.cos(a) * 11, 16 + math.sin(a) * 11), (16 + math.cos(a) * 15, 16 + math.sin(a) * 15)], JAUNE, glow=True)
    return s.render()


def ouragan():
    s = nouveau()
    for k in range(5):
        arc(s, 16, 18 - k * 3, 3 + k * 3, 180, 360, LUNE if k % 2 else LUNE_C)
    s.line([(16, 18), (16, 31)], LUNE)
    return s.render()


def eclipse():
    s = nouveau()
    s.ellipse(4, 4, 28, 28, JAUNE, glow=True)
    s.ellipse(9, 4, 31, 26, NUIT)
    arc(s, 16, 16, 13, 0, 360, FEU)
    return s.render()


def sylvains():
    s = nouveau()
    for x in (2, 12, 22):
        s.rect(x + 2, 12, x + 6, 30, ECORCE)
        s.ellipse(x, 4, x + 8, 14, FEUILLE)
        s.dots([(x + 3, 16), (x + 5, 16)], JAUNE, glow=True)
    return s.render()


def convergence():
    s = nouveau()
    s.ellipse(2, 2, 30, 30, NUIT)
    etoile(s, 16, 16, 9, JAUNE)
    croissant(s, 16, 16, 12, LUNE)
    for x, y in [(4, 4), (28, 4), (4, 28), (28, 28)]:
        vitesse(s, [(x, y, 16 + (x - 16) * 0.4, 16 + (y - 16) * 0.4)], LUNE_C)
    return s.render()


# ---------- Combat farouche : l'Ours ----------

def forme_ours():
    s = nouveau()
    tete_ours(s, 7, 6)
    arc(s, 16, 16, 15, 200, 340, FEUILLE_C)
    return s.render()


def coup_de_griffe():
    s = nouveau()
    s.ellipse(2, 14, 16, 28, OURS)
    griffes(s, 12, 4)
    bouclier(s, 20, 16, 30, 30, bord=ECORCE, fond=FEUILLE_F, centre=False)
    return s.render()


def rugissement():
    s = nouveau()
    tete_ours(s, 1, 6)
    s.poly([(7, 20), (13, 20), (10, 24)], '#5A1A1A')
    ondes(s, 18, 16, OURS_C, n=3)
    return s.render()


def revers_patte():
    s = nouveau()
    s.ellipse(2, 4, 18, 20, OURS)
    for x in (4, 9, 14):
        s.ellipse(x - 2, 2, x + 2, 6, OURS_C)
    vitesse(s, [(18, 8, 30, 14), (18, 14, 30, 18), (18, 20, 30, 22)], '#E8E0C8')
    eclat(s, 26, 26, 4, ROUGE, FEU)
    return s.render()


def rage_frenetique():
    s = nouveau()
    tete_ours(s, 7, 8, '#8A3A2A')
    flamme_de(s, 4, 0, 8, 10)
    flamme_de(s, 20, 0, 8, 10)
    return s.render()


def charge_farouche():
    s = nouveau()
    tete_ours(s, 12, 6)
    vitesse(s, [(0, 10, 10, 10), (0, 16, 10, 16), (0, 22, 10, 22)], OURS_C)
    eclat(s, 30, 22, 4, JAUNE, '#FFFFFF')
    return s.render()


def cuir_epais():
    s = nouveau()
    s.poly([(16, 2), (28, 8), (26, 22), (16, 30), (6, 22), (4, 8)], OURS)
    s.poly([(16, 6), (24, 10), (22, 20), (16, 26), (10, 20), (8, 10)], OURS_C)
    return s.render()


def instinct_protecteur():
    s = nouveau()
    bouclier(s, 6, 4, 26, 30, bord=OURS, fond=ECORCE_F, centre=False)
    flamme_de(s, 11, 8, 10, 14, ext=ROUGE)
    return s.render()


# ---------- Combat farouche : le Félin ----------

def forme_felin():
    s = nouveau()
    tete_chat(s, 7, 6)
    arc(s, 16, 16, 15, 200, 340, FEUILLE_C)
    return s.render()


def griffure():
    s = nouveau()
    griffes(s, 6, 6, '#E8E0C8', 3)
    s.dots([(22, 24), (24, 26)], ROUGE, glow=True)
    return s.render()


def laceration():
    s = nouveau()
    griffes(s, 4, 4, ROUGE, 4)
    goutte_de(s, 24, 18, 9)
    return s.render()


def morsure_feroce():
    s = nouveau()
    tete_chat(s, 2, 6)
    s.poly([(20, 10), (30, 12), (28, 24), (20, 22)], '#5A1A1A')
    s.dots([(22, 12), (25, 12), (22, 21), (25, 21)], '#F4F0E8')
    return s.render()


def dechirure():
    s = nouveau()
    for k in range(3):
        s.line([(4 + k * 8, 4), (10 + k * 8, 26)], ROUGE, width=2, glow=True)
    goutte_de(s, 26, 20, 8)
    return s.render()


def roder():
    s = nouveau()
    s.ellipse(2, 16, 26, 28, CHAT)
    s.ellipse(20, 12, 30, 22, CHAT_C)
    s.rect(24, 15, 25, 16, '#E8D84A', glow=True, shade=False)
    for x in (6, 14):
        s.dots([(x, 30), (x + 2, 30)], CHAT_C)
    return s.render()


def fureur_tigre():
    s = nouveau()
    tete_chat(s, 7, 8, '#C8742A')
    for x in (10, 16, 22):
        s.line([(x, 12), (x + 1, 18)], '#1A1210')
    flamme_de(s, 20, 0, 10, 10)
    return s.render()


def coeur_sauvage():
    s = nouveau()
    coeur(s, 6, 6, 20, '#C83A2A')
    tete_ours(s, 1, 14, OURS)
    tete_chat(s, 15, 14)
    return s.render()


# ---------- Restauration ----------

def toucher_guerisseur():
    s = nouveau()
    s.rect(6, 18, 18, 28, '#C8A078')
    for k in range(4):
        s.rect(6 + k * 3, 12, 7 + k * 3, 18, '#C8A078')
    soin(s, 24, 10, 5)
    return s.render()


def retablissement():
    s = nouveau()
    soin(s, 10, 12, 5)
    for k in range(3):
        feuille(s, 18 + k * 4, 26 - k * 5, 3, FEUILLE_C, -60)
    return s.render()


def ecorce_vive():
    s = nouveau()
    bouclier(s, 6, 4, 26, 30, bord=ECORCE_F, fond=ECORCE, centre=False)
    for y in (10, 16, 22):
        s.line([(10, y), (22, y + 1)], ECORCE_F)
    soin(s, 16, 16, 3)
    return s.render()


def bourgeon():
    s = nouveau()
    s.line([(16, 31), (16, 14)], FEUILLE_F, width=2)
    feuille(s, 11, 20, 4, FEUILLE, 20)
    s.ellipse(12, 6, 20, 16, FLEUR)
    s.dots([(16, 10)], '#FFE27A', glow=True)
    return s.render()


def fleurs_sauvages():
    s = nouveau()
    for x, y, c in [(8, 10, FLEUR), (20, 6, '#E8D84A'), (24, 18, '#E8E0FF'), (10, 22, FLEUR)]:
        s.line([(x, y + 4), (x, 31)], FEUILLE_F)
        for k in range(5):
            a = k / 5 * math.pi * 2
            s.ellipse(x + math.cos(a) * 3 - 1.5, y + math.sin(a) * 3 - 1.5, x + math.cos(a) * 3 + 1.5, y + math.sin(a) * 3 + 1.5, c)
        s.dots([(x, y)], JAUNE, glow=True)
    return s.render()


def enracinement():
    s = nouveau()
    s.rect(10, 2, 22, 20, ECORCE)
    for x in (8, 14, 20, 26):
        s.line([(16, 20), (x, 31)], ECORCE_F, width=2)
    s.ellipse(6, 0, 26, 10, FEUILLE)
    return s.render()


def pollen_apaisant():
    s = nouveau()
    for x, y in [(6, 6), (14, 10), (24, 6), (8, 18), (20, 20), (26, 14), (14, 26)]:
        s.ellipse(x - 1, y - 1, x + 2, y + 2, '#F0E08A', glow=True)
    return s.render()


def eclosion():
    s = nouveau()
    for k in range(6):
        a = k / 6 * math.pi * 2
        s.ellipse(16 + math.cos(a) * 7 - 4, 16 + math.sin(a) * 7 - 4, 16 + math.cos(a) * 7 + 4, 16 + math.sin(a) * 7 + 4, FLEUR)
    s.ellipse(12, 12, 20, 20, JAUNE, glow=True)
    return s.render()


def germination():
    s = nouveau()
    s.ellipse(4, 22, 28, 31, ECORCE_F)
    s.line([(16, 24), (16, 10)], FEUILLE, width=2)
    feuille(s, 11, 12, 4, FEUILLE_C, 30)
    feuille(s, 21, 9, 4, FEUILLE_C, -30)
    return s.render()


def elan_nature():
    s = nouveau()
    for k in range(3):
        feuille(s, 6 + k * 9, 16, 4, FEUILLE_C, 0)
    vitesse(s, [(2, 8, 28, 8), (4, 24, 30, 24)], FEUILLE)
    return s.render()


def esprit_foret():
    s = nouveau()
    s.ellipse(8, 4, 24, 20, '#7AC88A', glow=True)
    s.dots([(13, 11), (19, 11)], '#FFFFFF', glow=True)
    s.poly([(10, 18), (22, 18), (16, 30)], '#5AA86A', glow=True)
    return s.render()


def tranquillite():
    s = nouveau()
    for k in range(3):
        arc(s, 16, 26, 6 + k * 5, 200, 340, SOIN)
    for x in (6, 16, 26):
        feuille(s, x, 26, 3, FEUILLE_C, 90)
    return s.render()


def symbiose():
    s = nouveau()
    soin(s, 9, 16, 5)
    s.line([(14, 16), (20, 16)], FEUILLE_C, glow=True)
    eclat(s, 25, 16, 5, FEUILLE_C, '#FFFFFF')
    return s.render()


def arbre_vie():
    s = nouveau()
    s.rect(13, 16, 19, 31, ECORCE)
    s.ellipse(2, 0, 30, 22, FEUILLE)
    s.ellipse(8, 3, 20, 13, FEUILLE_C)
    soin(s, 16, 10, 4, '#FFFFFF')
    return s.render()


ILLUSTRATIONS_DRUIDE = {name: fn for name, fn in list(globals().items()) if callable(fn) and name in {
    'garde_sylvestre', 'colere', 'feu_de_lune', 'renouveau', 'racines', 'epines_druide', 'instinct_sauvage', 'purge_naturelle',
    'poussiere_feerique', 'don_des_bois',
    'forme_astrale', 'feu_stellaire', 'eclat_lunaire', 'nuee_insectes', 'lueur_lunaire', 'etoiles_filantes', 'rayon_lunaire',
    'typhon', 'grace_nature', 'puissance_astrale', 'ouragan', 'eclipse', 'sylvains', 'convergence',
    'forme_ours', 'coup_de_griffe', 'rugissement', 'revers_patte', 'rage_frenetique', 'charge_farouche', 'cuir_epais', 'instinct_protecteur',
    'forme_felin', 'griffure', 'laceration', 'morsure_feroce', 'dechirure', 'roder', 'fureur_tigre', 'coeur_sauvage',
    'toucher_guerisseur', 'retablissement', 'ecorce_vive', 'bourgeon', 'fleurs_sauvages', 'enracinement', 'pollen_apaisant',
    'eclosion', 'germination', 'elan_nature', 'esprit_foret', 'tranquillite', 'symbiose', 'arbre_vie',
}}
