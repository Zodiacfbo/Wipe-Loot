"""Les illustrations des cartes du Voleur (32 x 32 pixels).
Palette : l'acier des dagues, le vert des poisons, le violet de l'ombre, l'or du combo."""
import math
from illustrations import ACIER, ACIER_CLAIR, CUIR, OR, SANG, arc, bouclier, crane, eclat, etoile, goutte_de, nouveau, vitesse

POISON, POISON_C, POISON_F = '#6AC84A', '#C8F0B0', '#2E5A22'
OMBRE, OMBRE_C, OMBRE_F = '#6A4AB8', '#C8B8F0', '#231A3A'
CAPE = '#3A3040'
COMBO = '#FFE27A'


def dague(s, x0, y0, x1, y1, lame=ACIER, garde='#8A7A5A'):
    """Une dague courte de la poignée (x0, y0) à la pointe (x1, y1)."""
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy) or 1
    ux, uy = dx / n, dy / n
    gx, gy = x0 + ux * 4, y0 + uy * 4
    s.line([(gx, gy), (x1, y1)], lame, width=2)
    s.line([(gx + ux, gy + uy), (x1 - ux, y1 - uy)], ACIER_CLAIR, width=1)
    px, py = -uy, ux
    s.line([(gx + px * 3, gy + py * 3), (gx - px * 3, gy - py * 3)], garde, width=2)
    s.line([(x0, y0), (gx, gy)], CUIR, width=2)


def entaille(s, x0, y0, x1, y1, couleur=ACIER_CLAIR):
    s.line([(x0, y0), (x1, y1)], couleur, width=2, glow=True)


def combo(s, n, y=28):
    for i in range(5):
        x = 6 + i * 5
        s.poly([(x, y - 2), (x + 2, y), (x, y + 2), (x - 2, y)], COMBO if i < n else '#4A4228', glow=i < n)


def fiole(s, x, y, couleur=POISON):
    s.rect(x + 3, y, x + 6, y + 3, '#C8C0B0')
    s.ellipse(x, y + 3, x + 9, y + 13, couleur)
    s.dots([(x + 2, y + 6)], POISON_C, glow=True)


def capuche(s, cx, cy, yeux=OMBRE_C):
    s.ellipse(cx - 7, cy - 7, cx + 7, cy + 7, CAPE)
    s.poly([(cx - 9, cy + 2), (cx + 9, cy + 2), (cx + 11, cy + 14), (cx - 11, cy + 14)], CAPE)
    s.ellipse(cx - 4, cy - 3, cx + 4, cy + 4, '#120E16')
    s.rect(cx - 3, cy, cx - 2, cy, yeux, glow=True)
    s.rect(cx + 2, cy, cx + 3, cy, yeux, glow=True)


def fumee(s, cx, cy, r, couleur='#8A8494'):
    for (dx, dy, k) in ((-r * 0.5, 0, 0.6), (r * 0.4, -r * 0.2, 0.55), (0, r * 0.3, 0.7), (r * 0.1, -r * 0.5, 0.45)):
        s.ellipse(cx + dx - r * k, cy + dy - r * k, cx + dx + r * k, cy + dy + r * k, couleur)


def goutte_poison(s, x, y, h=9):
    goutte_de(s, x, y, h, POISON)


# ---------- Départ et tronc commun ----------

def esquive():
    s = nouveau()
    capuche(s, 20, 12)
    vitesse(s, [(2, 10, 10, 10), (3, 16, 11, 16), (2, 22, 10, 22)], '#B8B0C8')
    return s.render()


def attaque_sinistre():
    s = nouveau()
    dague(s, 6, 26, 24, 8)
    entaille(s, 14, 4, 28, 18)
    return s.render()


def evisceration():
    s = nouveau()
    dague(s, 4, 22, 20, 10)
    entaille(s, 8, 4, 26, 22, SANG)
    entaille(s, 12, 4, 28, 18, '#FF6A5A')
    combo(s, 5)
    return s.render()


def embuscade():
    s = nouveau()
    fumee(s, 10, 12, 8, '#3E3848')
    dague(s, 10, 24, 26, 6)
    s.rect(12, 10, 13, 10, OMBRE_C, glow=True)
    s.rect(16, 10, 17, 10, OMBRE_C, glow=True)
    return s.render()


def feinte():
    s = nouveau()
    dague(s, 6, 8, 20, 22)
    dague(s, 26, 8, 12, 22, lame='#8A8494')
    arc(s, 16, 16, 12, 200, 340, '#B8B0C8')
    return s.render()


def couteaux_lancer():
    s = nouveau()
    for (x, y) in ((4, 8), (6, 16), (4, 24)):
        dague(s, x, y, x + 14, y - 3)
    vitesse(s, [(20, 5, 28, 4), (22, 13, 30, 12), (20, 21, 28, 20)], ACIER_CLAIR)
    return s.render()


def poison_mortel():
    s = nouveau()
    dague(s, 6, 26, 24, 8, lame='#A8C8A0')
    goutte_poison(s, 24, 12, 10)
    goutte_poison(s, 18, 20, 7)
    return s.render()


def coup_aux_reins():
    s = nouveau()
    s.ellipse(8, 6, 24, 26, '#6E6A66')
    etoile(s, 16, 8, 5, COMBO)
    etoile(s, 8, 12, 3, COMBO)
    etoile(s, 24, 12, 3, COMBO)
    dague(s, 26, 28, 18, 18)
    return s.render()


def danse_lames():
    s = nouveau()
    for a in range(0, 360, 90):
        r = math.radians(a)
        dague(s, 16 + math.cos(r) * 4, 16 + math.sin(r) * 4, 16 + math.cos(r + 0.6) * 13, 16 + math.sin(r + 0.6) * 13)
    arc(s, 16, 16, 14, 0, 360, COMBO)
    return s.render()


def assommer():
    s = nouveau()
    s.line([(6, 26), (22, 10)], CUIR, width=4)
    s.ellipse(18, 4, 28, 14, '#7A6A5A')
    etoile(s, 8, 8, 4, COMBO)
    s.dots([(26, 22), (22, 26)], COMBO, glow=True)
    return s.render()


# ---------- Assassinat ----------

def mutiler():
    s = nouveau()
    dague(s, 4, 28, 14, 10)
    dague(s, 28, 28, 18, 10)
    entaille(s, 8, 4, 24, 12, SANG)
    return s.render()


def frappe_gorge():
    s = nouveau()
    s.ellipse(10, 4, 22, 16, '#C8A890')
    s.rect(12, 16, 20, 28, '#A88870')
    entaille(s, 8, 19, 24, 21, SANG)
    goutte_de(s, 16, 22, 7, SANG)
    return s.render()


def fiole_venin():
    s = nouveau()
    fiole(s, 10, 6)
    s.dots([(8, 4), (22, 6), (24, 18)], POISON_C, glow=True)
    return s.render()


def rupture():
    s = nouveau()
    for x in (8, 16, 24):
        goutte_de(s, x, 4 + (x % 3) * 3, 12, SANG)
    entaille(s, 4, 26, 28, 20, '#FF6A5A')
    return s.render()


def poison_affaiblissant():
    s = nouveau()
    fiole(s, 4, 10)
    s.line([(18, 8), (28, 20)], '#8AA87A', width=2)
    s.poly([(24, 20), (30, 20), (27, 26)], '#8AA87A')
    return s.render()


def poison_engourdissant():
    s = nouveau()
    fiole(s, 4, 10, '#7AC8B8')
    for i in range(3):
        s.rect(18 + i * 4, 6 + i * 5, 21 + i * 4, 6 + i * 5, '#C8F0F0', glow=True)
    return s.render()


def envenimer():
    s = nouveau()
    goutte_poison(s, 10, 4, 14)
    goutte_poison(s, 22, 8, 14)
    dague(s, 4, 28, 20, 20)
    return s.render()


def garrot():
    s = nouveau()
    s.ellipse(10, 6, 22, 18, '#C8A890')
    s.line([(4, 22), (10, 19), (22, 19), (28, 22)], '#C8C0B0', width=2)
    s.rect(2, 22, 5, 27, CUIR)
    s.rect(27, 22, 30, 27, CUIR)
    goutte_de(s, 16, 21, 6, SANG)
    return s.render()


def sang_froid():
    s = nouveau()
    s.ellipse(6, 6, 26, 26, '#2A3A4A')
    dague(s, 8, 24, 24, 8, lame='#C8E8FF')
    s.dots([(10, 8), (24, 22), (6, 18)], '#E8F8FF', glow=True)
    return s.render()


def toxines_virulentes():
    s = nouveau()
    crane(s, 3, 10, '#C8D8B8')
    s.line([(18, 16), (26, 10)], POISON, width=2, glow=True)
    goutte_poison(s, 26, 12, 9)
    return s.render()


def lames_empoisonnees():
    s = nouveau()
    dague(s, 4, 26, 18, 6, lame='#A8C8A0')
    dague(s, 14, 28, 28, 8, lame='#A8C8A0')
    s.dots([(18, 10), (26, 14), (12, 18)], POISON_C, glow=True)
    return s.render()


def opportunite():
    s = nouveau()
    combo(s, 5, 26)
    etoile(s, 16, 12, 9, COMBO)
    return s.render()


def coup_au_coeur():
    s = nouveau()
    s.ellipse(6, 8, 16, 18, SANG)
    s.ellipse(14, 8, 24, 18, SANG)
    s.poly([(6, 14), (24, 14), (15, 26)], SANG)
    dague(s, 30, 2, 16, 16)
    return s.render()


def vendetta():
    s = nouveau()
    arc(s, 16, 16, 12, 0, 360, SANG, width=2)
    arc(s, 16, 16, 6, 0, 360, SANG)
    s.line([(16, 2), (16, 30)], SANG, glow=True)
    s.line([(2, 16), (30, 16)], SANG, glow=True)
    goutte_poison(s, 24, 20, 8)
    return s.render()


# ---------- Combat ----------

def double_frappe():
    s = nouveau()
    dague(s, 4, 26, 20, 6)
    dague(s, 12, 28, 28, 8)
    return s.render()


def tir_pistolet():
    s = nouveau()
    s.rect(4, 14, 18, 18, '#4A4A54')
    s.rect(4, 18, 9, 26, CUIR)
    s.rect(17, 13, 19, 19, OR)
    eclat(s, 24, 16, 6, '#F59A2E', '#FFE27A')
    return s.render()


def riposte_voleur():
    s = nouveau()
    dague(s, 6, 24, 22, 8)
    s.poly([(20, 22), (28, 14), (28, 26)], COMBO, glow=True)
    arc(s, 16, 16, 12, 30, 150, '#B8B0C8')
    return s.render()


def esquive_agile():
    s = nouveau()
    capuche(s, 22, 12)
    vitesse(s, [(2, 8, 12, 8), (4, 14, 14, 14), (2, 20, 12, 20)], COMBO)
    return s.render()


def remise_en_garde():
    s = nouveau()
    dague(s, 8, 28, 16, 6)
    dague(s, 24, 28, 16, 6)
    combo(s, 2, 4)
    return s.render()


def bagarreur():
    s = nouveau()
    s.ellipse(6, 8, 22, 24, '#C8A890')
    for i in range(4):
        s.rect(8 + i * 4, 6, 10 + i * 4, 10, '#A88870')
    eclat(s, 24, 10, 6, '#E8562A', COMBO)
    return s.render()


def frappe_elan():
    s = nouveau()
    dague(s, 10, 22, 28, 8)
    vitesse(s, [(2, 14, 12, 12), (2, 20, 10, 19), (4, 26, 12, 25)], '#B8B0C8')
    return s.render()


def coup_bas():
    s = nouveau()
    s.rect(6, 18, 18, 24, '#5A4A3A')
    s.ellipse(16, 16, 26, 26, '#4A3A2A')
    etoile(s, 24, 8, 5, COMBO)
    return s.render()


def tourbillon_lames():
    s = nouveau()
    arc(s, 16, 16, 12, 0, 300, ACIER_CLAIR, width=2)
    arc(s, 16, 16, 7, 90, 390, ACIER)
    dague(s, 12, 18, 26, 4)
    return s.render()


def second_souffle():
    s = nouveau()
    bouclier(s, 6, 6, 22, 26, bord='#8A7A5A', fond=CAPE, centre=False)
    arc(s, 22, 14, 7, -60, 120, '#C8F0FF', width=2)
    return s.render()


def valse_lames():
    s = nouveau()
    for i in range(6):
        a = i * math.pi / 3
        dague(s, 16, 16, 16 + math.cos(a) * 14, 16 + math.sin(a) * 14)
    s.ellipse(13, 13, 19, 19, COMBO, glow=True)
    return s.render()


def embrocher():
    s = nouveau()
    s.line([(2, 16), (30, 16)], ACIER, width=3)
    s.line([(3, 15), (29, 15)], ACIER_CLAIR)
    for x in (10, 20):
        s.ellipse(x - 3, 10, x + 3, 22, '#7A4A3A')
    s.poly([(30, 13), (32, 16), (30, 19)], ACIER_CLAIR)
    return s.render()


def ambidextrie_experte():
    s = nouveau()
    dague(s, 4, 28, 14, 4)
    dague(s, 28, 28, 18, 4)
    etoile(s, 16, 16, 5, COMBO)
    return s.render()


def frenesie_meurtriere():
    s = nouveau()
    for (x0, y0, x1, y1) in ((2, 6, 14, 14), (30, 4, 18, 14), (4, 28, 14, 18), (28, 28, 18, 18), (16, 2, 16, 12), (16, 30, 16, 20)):
        entaille(s, x0, y0, x1, y1, SANG if (x0 + y0) % 3 else ACIER_CLAIR)
    eclat(s, 16, 16, 6, SANG, COMBO)
    return s.render()


# ---------- Finesse ----------

def coup_dans_le_dos():
    s = nouveau()
    s.ellipse(4, 6, 16, 18, '#7A6A5A')
    s.rect(4, 16, 16, 30, '#6A5A4A')
    capuche(s, 24, 10)
    dague(s, 26, 26, 12, 20)
    return s.render()


def hemorragie():
    s = nouveau()
    entaille(s, 4, 6, 26, 24, SANG)
    goutte_de(s, 10, 16, 9, SANG)
    goutte_de(s, 20, 20, 8, SANG)
    return s.render()


def premeditation():
    s = nouveau()
    capuche(s, 16, 10)
    combo(s, 3, 28)
    return s.render()


def lame_ombre():
    s = nouveau()
    dague(s, 6, 26, 24, 8, lame=OMBRE_C)
    for (x, y) in ((24, 8), (20, 12), (16, 16)):
        s.ellipse(x - 2, y - 2, x + 2, y + 2, OMBRE, glow=True)
    return s.render()


def plan_parfait():
    s = nouveau()
    s.rect(4, 6, 28, 26, '#C8B890')
    s.line([(8, 22), (14, 14), (20, 18), (25, 10)], SANG, width=1)
    s.line([(22, 8), (28, 12)], SANG)
    s.line([(22, 12), (28, 8)], SANG)
    return s.render()


def bond_ombre():
    s = nouveau()
    fumee(s, 8, 22, 5, '#3E3848')
    capuche(s, 22, 10)
    arc(s, 15, 22, 9, 200, 320, OMBRE, width=2)
    return s.render()


def fumigene():
    s = nouveau()
    fumee(s, 16, 18, 10)
    s.ellipse(12, 2, 20, 10, '#4A4A54')
    s.rect(15, 0, 17, 3, OR)
    return s.render()


def initiative():
    s = nouveau()
    etoile(s, 10, 10, 7, COMBO)
    dague(s, 8, 28, 26, 12)
    return s.render()


def marque_mort():
    s = nouveau()
    crane(s, 9, 6)
    combo(s, 5, 28)
    return s.render()


def coup_fourre():
    s = nouveau()
    bouclier(s, 4, 6, 20, 26, bord='#8A7A5A', fond=CAPE, centre=False)
    fumee(s, 24, 18, 6, '#3E3848')
    return s.render()


def egorgement():
    s = nouveau()
    capuche(s, 10, 10, SANG)
    dague(s, 14, 28, 30, 10)
    entaille(s, 18, 20, 30, 26, SANG)
    return s.render()


def opportuniste():
    s = nouveau()
    s.ellipse(8, 10, 24, 22, '#1E1424')
    s.ellipse(12, 12, 20, 20, COMBO, glow=True)
    s.ellipse(15, 14, 17, 18, '#120E16')
    return s.render()


def tenebres_voleur():
    s = nouveau()
    s.ellipse(2, 2, 30, 30, OMBRE_F)
    arc(s, 16, 16, 10, 200, 520, OMBRE, width=2)
    s.ellipse(18, 6, 26, 14, '#E8E4DC', glow=True)
    s.ellipse(21, 5, 29, 13, OMBRE_F)
    return s.render()


def seigneur_ombres():
    s = nouveau()
    capuche(s, 16, 11, '#FF6AFF')
    for x in (4, 28):
        s.line([(x, 30), (x + (5 if x < 16 else -5), 14)], OMBRE, width=2, glow=True)
    s.poly([(10, 2), (13, 5), (16, 1), (19, 5), (22, 2), (21, 6), (11, 6)], OR)
    return s.render()


ILLUSTRATIONS_VOLEUR = {name: fn for name, fn in list(globals().items()) if callable(fn) and name in {
    'esquive', 'attaque_sinistre', 'evisceration', 'embuscade', 'feinte', 'couteaux_lancer', 'poison_mortel', 'coup_aux_reins',
    'danse_lames', 'assommer', 'mutiler', 'frappe_gorge', 'fiole_venin', 'rupture', 'poison_affaiblissant', 'poison_engourdissant',
    'envenimer', 'garrot', 'sang_froid', 'toxines_virulentes', 'lames_empoisonnees', 'opportunite', 'coup_au_coeur', 'vendetta',
    'double_frappe', 'tir_pistolet', 'riposte_voleur', 'esquive_agile', 'remise_en_garde', 'bagarreur', 'frappe_elan', 'coup_bas',
    'tourbillon_lames', 'second_souffle', 'valse_lames', 'embrocher', 'ambidextrie_experte', 'frenesie_meurtriere',
    'coup_dans_le_dos', 'hemorragie', 'premeditation', 'lame_ombre', 'plan_parfait', 'bond_ombre', 'fumigene', 'initiative',
    'marque_mort', 'coup_fourre', 'egorgement', 'opportuniste', 'tenebres_voleur', 'seigneur_ombres',
}}
