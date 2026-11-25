"""Les illustrations des cartes du Chasseur (32 x 32 pixels).
Palette : le bois et le cuir de l'arc, le vert de la forêt, le gris du loup, l'orange des pièges."""
import math
from illustrations import ACIER, ACIER_CLAIR, FEU, JAUNE, ROUGE, arc, bouclier, eclat, flamme_de, goutte_de, hache, nouveau, ondes, vitesse

BOIS, BOIS_F, CORDE = '#8A5A2E', '#5A3A1E', '#E8E0C8'
VERT, VERT_C, VERT_F = '#5A9A44', '#8FD49A', '#2E4A22'
LOUP, LOUP_C = '#8A8E96', '#C8CCD2'
PIEGE, PIEGE_C = '#9A9AA4', '#D8DCE4'
POISON = '#7ED84A'
GIVRE, GIVRE_C = '#8FB8E8', '#E8F4FF'
VIOLET = '#A66BE0'


# ---------- Formes de base ----------

def trait(s, x0, y0, x1, y1, pointe=ACIER, plumes=ROUGE, bois=BOIS):
    """Une flèche de (x0, y0) (l'empennage) à (x1, y1) (la pointe)."""
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy) or 1
    ux, uy = dx / n, dy / n
    px, py = -uy, ux
    s.line([(x0, y0), (x1 - ux * 2, y1 - uy * 2)], bois, width=1)
    s.poly([(x1 + ux * 2, y1 + uy * 2), (x1 - ux * 3 + px * 2, y1 - uy * 3 + py * 2), (x1 - ux * 3 - px * 2, y1 - uy * 3 - py * 2)], pointe)
    for k in (0, 2):
        bx, by = x0 + ux * k, y0 + uy * k
        s.line([(bx, by), (bx - ux * 2 + px * 2, by - uy * 2 + py * 2)], plumes)
        s.line([(bx, by), (bx - ux * 2 - px * 2, by - uy * 2 - py * 2)], plumes)


def arc_tendu(s, x, y0, y1, tire=6):
    """Un arc vertical (bois à gauche), la corde tirée de `tire` pixels vers la gauche."""
    m = (y0 + y1) / 2
    h = (y1 - y0) / 2
    pts = [(x + math.sin(t / 10 * math.pi) * 5, y0 + t / 10 * (y1 - y0)) for t in range(11)]
    s.line(pts, BOIS, width=2)
    s.line([(x, y0), (x - tire, m), (x, y1)], CORDE)
    s.rect(x + 3, m - 2, x + 6, m + 2, BOIS_F)
    return x - tire, m, h


def patte(s, cx, cy, r=6, couleur=LOUP_C):
    s.ellipse(cx - r * 0.8, cy - r * 0.2, cx + r * 0.8, cy + r, couleur)
    for i, (dx, dy) in enumerate([(-1, -0.6), (-0.4, -1.1), (0.4, -1.1), (1, -0.6)]):
        s.ellipse(cx + dx * r - 2, cy + dy * r - 2, cx + dx * r + 2, cy + dy * r + 2, couleur)


def tete_loup(s, x, y, couleur=LOUP, yeux=JAUNE, gueule=False):
    """Une tête de loup de profil, tournée vers la droite (environ 20 x 16)."""
    s.poly([(x + 2, y + 4), (x + 5, y - 2), (x + 8, y + 3)], couleur)
    s.poly([(x + 7, y + 3), (x + 10, y - 3), (x + 12, y + 4)], couleur)
    s.ellipse(x, y + 2, x + 14, y + 14, couleur)
    s.poly([(x + 10, y + 6), (x + 20, y + 8), (x + 19, y + 11), (x + 10, y + 13)], LOUP_C)
    s.dots([(x + 19, y + 8)], '#1A1A1E')
    s.rect(x + 9, y + 5, x + 10, y + 6, yeux, glow=True, shade=False)
    if gueule:
        s.poly([(x + 11, y + 12), (x + 19, y + 12), (x + 16, y + 15)], '#7A1A1A')
        s.dots([(x + 13, y + 12), (x + 16, y + 12)], ACIER_CLAIR)


def machoires(s, cx, cy, r=10, couleur=PIEGE, dents=PIEGE_C, ouvert=True):
    """Un piège à mâchoires vu de face : deux arcs dentés et un socle."""
    s.ellipse(cx - 4, cy + 2, cx + 4, cy + 6, '#5A5A64')
    if ouvert:
        arc(s, cx, cy, r, 200, 340, couleur, width=2, glow=False)
        arc(s, cx, cy + 4, r, 20, 160, couleur, width=2, glow=False)
        for k in range(5):
            a = math.radians(210 + k * 30)
            s.dots([(cx + math.cos(a) * (r - 2), cy + math.sin(a) * (r - 2))], dents)
            a = math.radians(30 + k * 30)
            s.dots([(cx + math.cos(a) * (r - 2), cy + 4 + math.sin(a) * (r - 2))], dents)
    else:
        s.rect(cx - r, cy, cx + r, cy + 3, couleur)
        for k in range(-r + 2, r - 1, 3):
            s.dots([(cx + k, cy - 1), (cx + k + 1, cy + 4)], dents)


def cible(s, cx, cy, r, couleur=ROUGE):
    arc(s, cx, cy, r, 0, 360, couleur, glow=False)
    arc(s, cx, cy, r * 0.55, 0, 360, '#E8E0C8', glow=False)
    s.ellipse(cx - 1.5, cy - 1.5, cx + 1.5, cy + 1.5, couleur)


def viseur(s, cx, cy, r, couleur=ROUGE):
    arc(s, cx, cy, r, 0, 360, couleur, glow=True)
    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        s.line([(cx + dx * (r - 3), cy + dy * (r - 3)), (cx + dx * (r + 3), cy + dy * (r + 3))], couleur, glow=True)


def plume(s, x, y, couleur='#E8E0C8'):
    s.poly([(x, y), (x + 4, y + 6), (x + 2, y + 14), (x - 2, y + 6)], couleur)
    s.line([(x + 1, y + 3), (x + 1, y + 16)], BOIS_F)


# ---------- Départ ----------

def tir():
    s = nouveau()
    x, m, _ = arc_tendu(s, 10, 4, 28)
    trait(s, x, m, 30, m)
    return s.render()


def repli():
    s = nouveau()
    bouclier(s, 9, 5, 25, 28, bord=BOIS, fond=VERT_F, centre=False)
    vitesse(s, [(2, 10, 8, 10), (1, 16, 7, 16), (2, 22, 8, 22)], LOUP_C)
    return s.render()


# ---------- Tronc commun ----------

def fleches_multiples():
    s = nouveau()
    for k, y in enumerate((8, 16, 24)):
        trait(s, 2, y + (k - 1) * 3, 29, y)
    return s.render()


def fleche_venimeuse():
    s = nouveau()
    trait(s, 3, 26, 26, 5, pointe=POISON, plumes=VERT)
    goutte_de(s, 25, 12, 8, POISON)
    return s.render()


def rappel():
    s = nouveau()
    ondes(s, 6, 16, VERT_C, n=3)
    patte(s, 24, 18, 5)
    return s.render()


def esprit_aigle():
    s = nouveau()
    s.poly([(2, 14), (12, 10), (16, 14), (20, 10), (30, 14), (20, 18), (16, 24), (12, 18)], '#C8A070')
    s.ellipse(13, 9, 19, 15, '#F4F0E8')
    s.poly([(18, 11), (22, 12), (18, 13)], JAUNE)
    arc(s, 16, 16, 14, 200, 340, '#FFE27A')
    return s.render()


def esprit_tortue():
    s = nouveau()
    s.ellipse(5, 9, 27, 25, '#4A7A3A')
    for cx, cy in [(11, 14), (16, 12), (21, 14), (13, 19), (19, 19)]:
        s.ellipse(cx - 2, cy - 2, cx + 2, cy + 2, '#7AAA5A')
    s.ellipse(25, 14, 31, 20, '#8AAA6A')
    s.rect(7, 23, 10, 28, '#8AAA6A')
    s.rect(21, 23, 24, 28, '#8AAA6A')
    arc(s, 16, 17, 14, 200, 340, GIVRE)
    return s.render()


def esprit_guepard():
    s = nouveau()
    s.ellipse(4, 12, 24, 22, '#E8B84A')
    s.ellipse(20, 9, 30, 18, '#E8B84A')
    s.dots([(8, 15), (12, 17), (15, 14), (18, 18), (10, 19), (23, 12)], '#3A2A1A')
    s.line([(6, 22), (2, 28)], '#C8983A', width=2)
    s.line([(20, 21), (24, 28)], '#C8983A', width=2)
    vitesse(s, [(0, 8, 6, 8), (0, 12, 3, 12)], JAUNE)
    return s.render()


def marque_proie():
    s = nouveau()
    viseur(s, 16, 16, 10)
    s.dots([(16, 16)], ROUGE, glow=True)
    return s.render()


def fleche_anciens():
    # La flèche que la corde tire toute seule : une flèche dorée, une lueur verte d'ancien bois.
    s = nouveau()
    viseur(s, 22, 10, 7)
    trait(s, 4, 28, 22, 10, pointe=JAUNE, plumes=VERT_C, bois=BOIS)
    s.dots([(22, 10)], ROUGE, glow=True)
    return s.render()


def piege_givrant():
    s = nouveau()
    machoires(s, 16, 16, 11, couleur=GIVRE, dents=GIVRE_C)
    for x, y in [(6, 4), (26, 6), (16, 2)]:
        s.dots([(x, y), (x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)], GIVRE_C, glow=True)
    return s.render()


def tir_recul():
    s = nouveau()
    trait(s, 28, 16, 4, 16)
    vitesse(s, [(18, 6, 28, 6), (20, 26, 30, 26)], LOUP_C)
    eclat(s, 6, 16, 5, '#E8E0C8', JAUNE)
    return s.render()


# ---------- Maîtrise des bêtes ----------

def ordre_attaque():
    s = nouveau()
    tete_loup(s, 4, 9, gueule=True)
    vitesse(s, [(24, 8, 30, 8), (25, 22, 31, 22)], JAUNE)
    return s.render()


def ordre_protege():
    s = nouveau()
    bouclier(s, 12, 4, 30, 28, bord=BOIS, fond=VERT_F, centre=False)
    patte(s, 21, 14, 4)
    tete_loup(s, 0, 14)
    return s.render()


def ordre_hurlement():
    s = nouveau()
    s.poly([(4, 30), (6, 16), (14, 6), (18, 8), (16, 18), (12, 30)], LOUP)
    s.poly([(14, 6), (20, 2), (18, 8)], LOUP_C)
    s.dots([(15, 9)], JAUNE, glow=True)
    ondes(s, 18, 6, '#C8CCD2', n=3, a0=-80, a1=10)
    return s.render()


def ordre_egorge():
    s = nouveau()
    tete_loup(s, 2, 8, gueule=True)
    for k in range(3):
        s.line([(20 + k * 3, 4), (26 + k * 3, 26)], ROUGE, width=1, glow=True)
    return s.render()


def bete_interieure():
    s = nouveau()
    s.ellipse(6, 6, 26, 26, '#3A1A12')
    tete_loup(s, 6, 9, couleur='#C8402A', yeux=JAUNE, gueule=True)
    arc(s, 16, 16, 13, 0, 360, FEU)
    return s.render()


def rage_compagnon():
    s = nouveau()
    patte(s, 14, 18, 7, couleur=LOUP)
    flamme_de(s, 20, 2, 10, 14)
    return s.render()


def morsure_partagee():
    s = nouveau()
    trait(s, 2, 8, 22, 8)
    tete_loup(s, 4, 14, gueule=True)
    return s.render()


def lien_sauvage():
    s = nouveau()
    patte(s, 9, 12, 5)
    bouclier(s, 17, 10, 30, 28, bord=BOIS, fond=VERT_F, centre=False)
    s.line([(12, 22), (16, 26), (20, 20)], VERT_C, glow=True)
    return s.render()


def frenesie_chasseur():
    s = nouveau()
    tete_loup(s, 4, 9, couleur='#9A6A6A', gueule=True)
    for k in range(3):
        s.poly([(25 + k, 4 + k * 8), (29, 6 + k * 8), (25 + k, 8 + k * 8)], ROUGE, glow=True)
    return s.render()


def intimidation_bete():
    s = nouveau()
    tete_loup(s, 2, 8, gueule=True)
    s.ellipse(22, 4, 30, 12, '#E8E0C8')
    s.dots([(25, 7), (27, 7)], '#1A1A1E')
    s.dots([(26, 10)], '#1A1A1E')
    return s.render()


def dressage():
    s = nouveau()
    s.line([(4, 28), (14, 14), (22, 10), (28, 14), (26, 20)], BOIS, width=2)
    patte(s, 22, 24, 4)
    s.dots([(28, 14), (27, 15)], JAUNE, glow=True)
    return s.render()


def esprit_meute():
    s = nouveau()
    tete_loup(s, 8, 9, couleur='#7AC8E8', yeux='#FFFFFF')
    tete_loup(s, 1, 14, couleur='#5AA8C8', yeux='#FFFFFF')
    s.dots([(4, 4), (28, 6), (26, 28)], '#C8F0FF', glow=True)
    return s.render()


def instinct_tueur():
    s = nouveau()
    tete_loup(s, 2, 9, gueule=True)
    s.poly([(24, 2), (30, 2), (27, 10)], JAUNE, glow=True)
    s.poly([(26, 10), (30, 10), (25, 18), (27, 12)], JAUNE, glow=True)
    return s.render()


def fureur_primitive():
    s = nouveau()
    s.ellipse(1, 1, 31, 31, '#3A1A12')
    tete_loup(s, 1, 6, couleur='#C8402A', yeux=JAUNE, gueule=True)
    tete_loup(s, 10, 13, couleur='#E8742A', yeux=JAUNE, gueule=True)
    eclat(s, 27, 5, 4, JAUNE, '#FFFFFF')
    return s.render()


# ---------- Précision ----------

def tir_ajuste():
    s = nouveau()
    viseur(s, 22, 16, 6)
    x, m, _ = arc_tendu(s, 8, 4, 28, tire=4)
    trait(s, x, m, 28, m)
    return s.render()


def tir_percant():
    s = nouveau()
    bouclier(s, 12, 6, 22, 26, bord=PIEGE, fond='#5A5A64', centre=False)
    trait(s, 1, 16, 30, 16)
    s.dots([(17, 12), (17, 20), (18, 15)], ACIER_CLAIR, glow=True)
    return s.render()


def tir_rafale():
    s = nouveau()
    for k in range(3):
        trait(s, 2 + k * 4, 6 + k * 9, 22 + k * 4, 6 + k * 9)
    return s.render()


def tir_double():
    s = nouveau()
    trait(s, 2, 18, 28, 8)
    trait(s, 2, 18, 28, 26)
    return s.render()


def fleche_ardente():
    s = nouveau()
    flamme_de(s, 20, 6, 10, 14)
    trait(s, 2, 22, 26, 14, pointe=FEU)
    return s.render()


def concentration_tir():
    s = nouveau()
    s.ellipse(6, 10, 26, 22, '#E8E0C8')
    s.ellipse(12, 11, 20, 21, VERT)
    s.ellipse(14, 13, 18, 19, '#1A1A1E')
    s.dots([(15, 14)], '#FFFFFF', glow=True)
    viseur(s, 16, 16, 13, '#FFE27A')
    return s.render()


def respiration_lente():
    s = nouveau()
    for k in range(3):
        arc(s, 16, 30, 8 + k * 6, 200, 340, '#C8E8F8')
    trait(s, 4, 26, 28, 26)
    return s.render()


def tir_fatal():
    s = nouveau()
    s.ellipse(8, 4, 24, 18, '#E6E0D0')
    s.rect(11, 16, 21, 21, '#E6E0D0')
    s.ellipse(10, 9, 14, 13, '#2A1C18', shade=False)
    s.ellipse(18, 9, 22, 13, '#2A1C18', shade=False)
    trait(s, 0, 28, 20, 8)
    return s.render()


def visee_assuree():
    s = nouveau()
    cible(s, 16, 16, 12)
    trait(s, 2, 2, 15, 15)
    return s.render()


def salve():
    s = nouveau()
    for x in (6, 13, 20, 27):
        trait(s, x - 4, 2, x, 22)
    eclat(s, 16, 26, 5, FEU, JAUNE)
    return s.render()


def tir_precision():
    s = nouveau()
    cible(s, 24, 16, 7)
    x, m, _ = arc_tendu(s, 7, 3, 29, tire=5)
    trait(s, x, m, 22, m)
    s.dots([(24, 16)], '#FFFFFF', glow=True)
    return s.render()


def calme_absolu():
    s = nouveau()
    s.ellipse(4, 18, 28, 26, '#3A6A8A')
    s.ellipse(8, 20, 24, 24, '#5A9AC8')
    plume(s, 15, 3)
    return s.render()


def maitre_tireur():
    s = nouveau()
    viseur(s, 16, 14, 9)
    s.poly([(10, 24), (22, 24), (20, 30), (12, 30)], JAUNE)
    s.dots([(16, 14)], JAUNE, glow=True)
    return s.render()


def tir_du_coeur():
    s = nouveau()
    from illustrations import coeur
    coeur(s, 9, 9, 15, '#D8303A')
    trait(s, 1, 30, 26, 6, pointe=ACIER_CLAIR, plumes=JAUNE)
    viseur(s, 17, 16, 13, JAUNE)
    return s.render()


# ---------- Survie ----------

def piege_immolation():
    s = nouveau()
    machoires(s, 16, 20, 10, ouvert=False)
    flamme_de(s, 8, 2, 16, 18)
    return s.render()


def piege_venin():
    s = nouveau()
    machoires(s, 16, 18, 10)
    goutte_de(s, 9, 2, 8, POISON)
    goutte_de(s, 22, 4, 7, POISON)
    return s.render()


def riposte_sauvage():
    s = nouveau()
    bouclier(s, 3, 6, 15, 26, bord=BOIS, fond=VERT_F, centre=False)
    hache(s, 14, 28, 22, 8)
    return s.render()


def coup_hachette():
    s = nouveau()
    hache(s, 6, 28, 16, 8)
    goutte_de(s, 26, 18, 8)
    return s.render()


def desengagement():
    s = nouveau()
    vitesse(s, [(16, 8, 30, 8), (14, 16, 30, 16), (16, 24, 30, 24)], LOUP_C)
    s.poly([(2, 16), (10, 8), (10, 24)], VERT_C, glow=True)
    return s.render()


def lancer_filet():
    s = nouveau()
    for k in range(5):
        s.line([(4 + k * 6, 4), (2 + k * 7, 28)], '#C8B88A')
        s.line([(2, 6 + k * 6), (30, 4 + k * 6)], '#C8B88A')
    s.dots([(3, 28), (30, 27), (29, 4), (4, 4)], PIEGE)
    return s.render()


def sens_aiguises():
    s = nouveau()
    s.poly([(2, 16), (16, 6), (30, 16), (16, 26)], '#E8E0C8')
    s.ellipse(10, 10, 22, 22, VERT)
    s.ellipse(13, 13, 19, 19, '#1A1A1E')
    s.dots([(14, 14)], '#FFFFFF', glow=True)
    return s.render()


def piege_explosif():
    s = nouveau()
    machoires(s, 16, 22, 9, ouvert=False)
    eclat(s, 16, 12, 10, FEU, JAUNE)
    return s.render()


def contre_attaque():
    s = nouveau()
    bouclier(s, 4, 4, 20, 28, bord=BOIS, fond=VERT_F, centre=False)
    s.poly([(20, 12), (30, 16), (20, 20)], JAUNE, glow=True)
    vitesse(s, [(22, 8, 28, 4), (22, 24, 28, 28)], JAUNE)
    return s.render()


def dard_paralysant():
    s = nouveau()
    s.line([(4, 28), (24, 8)], '#C8B88A', width=1)
    s.poly([(24, 8), (29, 3), (26, 10)], ACIER)
    s.poly([(4, 28), (2, 24), (8, 26)], VIOLET)
    for k in range(3):
        s.dots([(10 + k * 6, 6 + k * 2)], VIOLET, glow=True)
    return s.render()


def instinct_survie():
    s = nouveau()
    s.poly([(16, 3), (28, 8), (26, 20), (16, 29), (6, 20), (4, 8)], VERT_F)
    patte(s, 16, 15, 5, couleur=VERT_C)
    return s.render()


def maitre_pieges():
    s = nouveau()
    machoires(s, 10, 12, 7)
    machoires(s, 22, 22, 7)
    s.dots([(26, 6), (4, 26)], JAUNE, glow=True)
    return s.render()


def pieges_serie():
    s = nouveau()
    for k in range(3):
        machoires(s, 7 + k * 9, 10 + k * 7, 5, ouvert=k != 1)
    return s.render()


def champ_pieges():
    s = nouveau()
    s.rect(0, 24, 31, 31, '#3A2A1E')
    for x in (6, 16, 26):
        machoires(s, x, 22, 5, ouvert=False)
    eclat(s, 16, 10, 9, FEU, JAUNE)
    eclat(s, 6, 13, 4, ROUGE, FEU)
    eclat(s, 26, 13, 4, ROUGE, FEU)
    return s.render()


ILLUSTRATIONS_CHASSEUR = {name: fn for name, fn in list(globals().items()) if callable(fn) and name in {
    'tir', 'repli', 'fleche_anciens',
    'fleches_multiples', 'fleche_venimeuse', 'rappel', 'esprit_aigle', 'esprit_tortue', 'esprit_guepard', 'marque_proie',
    'piege_givrant', 'tir_recul',
    'ordre_attaque', 'ordre_protege', 'ordre_hurlement', 'ordre_egorge', 'bete_interieure', 'rage_compagnon', 'morsure_partagee',
    'lien_sauvage', 'frenesie_chasseur', 'intimidation_bete', 'dressage', 'esprit_meute', 'instinct_tueur', 'fureur_primitive',
    'tir_ajuste', 'tir_percant', 'tir_rafale', 'tir_double', 'fleche_ardente', 'concentration_tir', 'respiration_lente',
    'tir_fatal', 'visee_assuree', 'salve', 'tir_precision', 'calme_absolu', 'maitre_tireur', 'tir_du_coeur',
    'piege_immolation', 'piege_venin', 'riposte_sauvage', 'coup_hachette', 'desengagement', 'lancer_filet', 'sens_aiguises',
    'piege_explosif', 'contre_attaque', 'dard_paralysant', 'instinct_survie', 'maitre_pieges', 'pieges_serie', 'champ_pieges',
}}
