"""Les illustrations des cartes du Mage (32 x 32 pixels).
Trois écoles, trois palettes : l'Arcane en violet, le Feu en orange, le Givre en bleu glacé.
Importé par illustrations.py, qui exporte toutes les cartes du jeu."""
import math
from illustrations import (ACIER, CUIR, FEU, JAUNE, OR, arc, bouclier, eclat, etoile, flamme_de, nouveau, ondes,
                           vitesse)

ARC, ARC_C, ARC_F = '#B07AF0', '#E8D4FF', '#5A2E9A'
GLACE, GLACE_C, GLACE_F = '#8FD8FF', '#EAF9FF', '#3A7CC0'
BRAISE, LAVE = '#E8562A', '#FF8A2A'
PEAU, ROBE = '#E8C6A4', '#3D56B0'


# ---------- Formes du Mage ----------

def orbe(s, cx, cy, r, ext=ARC, coeur=ARC_C):
    s.ellipse(cx - r, cy - r, cx + r, cy + r, ext, glow=True)
    s.ellipse(cx - r * 0.5, cy - r * 0.5, cx + r * 0.3, cy + r * 0.3, coeur, glow=True)


def projectile(s, x0, y0, x1, y1, couleur=ARC, coeur=ARC_C, r=3):
    """Un projectile magique de (x0, y0) vers (x1, y1), avec sa traînée."""
    s.line([(x0, y0), (x1, y1)], couleur, width=1, glow=True)
    orbe(s, x1, y1, r, couleur, coeur)


def flocon(s, cx, cy, r, couleur=GLACE, coeur=GLACE_C):
    for i in range(3):
        a = i * math.pi / 3
        dx, dy = math.cos(a) * r, math.sin(a) * r
        s.line([(cx - dx, cy - dy), (cx + dx, cy + dy)], couleur, width=1, glow=True)
        for sign in (-1, 1):
            bx, by = cx + sign * dx * 0.6, cy + sign * dy * 0.6
            px, py = -math.sin(a) * r * 0.3, math.cos(a) * r * 0.3
            s.line([(bx + px, by + py), (bx + sign * dx * 0.3, by + sign * dy * 0.3)], couleur, glow=True)
            s.line([(bx - px, by - py), (bx + sign * dx * 0.3, by + sign * dy * 0.3)], couleur, glow=True)
    s.ellipse(cx - 1, cy - 1, cx + 1, cy + 1, coeur, glow=True)


def cristal(s, x, y, w, h, couleur=GLACE, reflet=GLACE_C):
    """Un éclat de glace pointu vers le haut."""
    s.poly([(x + w / 2, y), (x + w, y + h * 0.35), (x + w * 0.75, y + h), (x + w * 0.25, y + h), (x, y + h * 0.35)], couleur)
    s.line([(x + w / 2, y + 2), (x + w * 0.4, y + h - 2)], reflet, glow=True)


def lance(s, x0, y0, x1, y1, couleur=GLACE):
    """Une lance de glace de (x0, y0) vers la pointe (x1, y1)."""
    s.line([(x0, y0), (x1, y1)], couleur, width=3, glow=True)
    s.line([(x0, y0), (x1, y1)], GLACE_C, width=1, glow=True)
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy) or 1
    ux, uy = dx / n, dy / n
    s.poly([(x1 + ux * 4, y1 + uy * 4), (x1 - uy * 3, y1 + ux * 3), (x1 + uy * 3, y1 - ux * 3)], GLACE_C, glow=True)


def main(s, x, y, couleur=PEAU, manche=ROBE):
    """Une main ouverte, paume vers le haut (doigts vers le haut)."""
    s.rect(x - 1, y + 6, x + 7, y + 11, manche)
    s.poly([(x, y + 3), (x + 7, y + 3), (x + 7, y + 7), (x, y + 7)], couleur)
    for i in range(4):
        s.rect(x + i * 2, y, x + i * 2, y + 3, couleur)


def livre(s, x, y, couv=ARC_F, pages='#F2E8D6'):
    s.poly([(x, y + 2), (x + 10, y), (x + 10, y + 14), (x, y + 16)], couv)
    s.poly([(x + 20, y + 2), (x + 10, y), (x + 10, y + 14), (x + 20, y + 16)], couv)
    s.poly([(x + 2, y + 3), (x + 10, y + 2), (x + 10, y + 13), (x + 2, y + 14)], pages)
    s.poly([(x + 18, y + 3), (x + 10, y + 2), (x + 10, y + 13), (x + 18, y + 14)], pages)
    for i in range(3):
        s.line([(x + 4, y + 6 + i * 3), (x + 8, y + 5 + i * 3)], '#9A8E80')
        s.line([(x + 12, y + 5 + i * 3), (x + 16, y + 6 + i * 3)], '#9A8E80')


def bulle(s, cx, cy, r, couleur=ARC, n=1):
    """Un bouclier magique : un cercle lumineux."""
    for i in range(n):
        arc(s, cx, cy, r - i * 3, 0, 360, couleur)


def rune(s, cx, cy, r, couleur=ARC):
    arc(s, cx, cy, r, 0, 360, couleur)
    tri = [(cx + math.cos(math.radians(a)) * r * 0.8, cy + math.sin(math.radians(a)) * r * 0.8) for a in (-90, 30, 150, -90)]
    s.line(tri, couleur, glow=True)


def meteore(s, cx, cy, r, trainee=8):
    s.poly([(cx - r, cy - r), (cx - r - trainee, cy - r - trainee - 3), (cx - r + 3, cy - r - trainee)], FEU, glow=True)
    s.poly([(cx, cy - r), (cx - trainee, cy - r - trainee - 2), (cx + 3, cy - r - trainee + 1)], BRAISE, glow=True)
    s.ellipse(cx - r, cy - r, cx + r, cy + r, '#5A4038')
    s.ellipse(cx - r + 2, cy - r + 2, cx + r - 3, cy + r - 3, '#7A5848')
    s.dots([(cx, cy + 1), (cx + 2, cy - 1)], LAVE, glow=True)


def braises(s, pts, couleur=LAVE):
    s.dots(pts, couleur, glow=True)


# ---------- Deck de départ ----------

def trait_de_magie():
    s = nouveau()
    projectile(s, 4, 26, 22, 9, r=4)
    vitesse(s, [(3, 20, 11, 13), (8, 28, 15, 21)], ARC)
    return s.render()


def barriere():
    s = nouveau()
    bulle(s, 16, 16, 13, ARC, n=2)
    s.ellipse(11, 11, 21, 21, ARC_F)
    etoile(s, 16, 16, 4, ARC_C)
    return s.render()


# ---------- Tronc commun ----------

def explosion_des_arcanes():
    s = nouveau()
    eclat(s, 16, 16, 13, ARC, ARC_C)
    arc(s, 16, 16, 14, 0, 360, ARC_C)
    return s.render()


def nova_de_givre():
    s = nouveau()
    flocon(s, 16, 16, 13)
    arc(s, 16, 16, 9, 0, 360, GLACE_F)
    return s.render()


def lenteur():
    s = nouveau()
    s.poly([(9, 4), (23, 4), (17, 16), (23, 28), (9, 28), (15, 16)], ARC_F)
    s.poly([(11, 6), (21, 6), (16, 14)], '#E6D29A')
    s.poly([(12, 26), (20, 26), (16, 21)], '#E6D29A')
    s.rect(8, 3, 24, 4, OR)
    s.rect(8, 28, 24, 29, OR)
    arc(s, 16, 16, 14, 200, 340, ARC)
    return s.render()


def siphon_de_mana():
    s = nouveau()
    orbe(s, 8, 10, 5, '#5AA0E8', GLACE_C)
    for i in range(4):
        s.dots([(12 + i * 3, 12 + i * 3)], ARC_C, glow=True)
    main(s, 19, 20)
    return s.render()


def delivrance():
    s = nouveau()
    s.line([(16, 4), (16, 28)], JAUNE, width=3, glow=True)
    s.line([(9, 11), (23, 11)], JAUNE, width=3, glow=True)
    s.dots([(6, 22), (26, 20), (8, 6), (25, 6)], ARC_C, glow=True)
    arc(s, 16, 16, 13, 30, 150, JAUNE)
    return s.render()


def bouclier_de_mana():
    s = nouveau()
    bulle(s, 16, 16, 13, '#5AA0E8')
    s.ellipse(8, 8, 24, 24, '#2E4E8A')
    orbe(s, 16, 16, 5, '#5AA0E8', GLACE_C)
    return s.render()


def metamorphose():
    s = nouveau()
    s.ellipse(7, 10, 25, 23, '#F2EEE6')
    for x in (8, 13, 18, 22):
        s.ellipse(x - 2, 8, x + 3, 13, '#F2EEE6')
    s.ellipse(20, 12, 28, 19, '#3A3036')
    s.dots([(25, 14)], '#F2EEE6')
    s.rect(10, 22, 11, 27, '#3A3036')
    s.rect(20, 22, 21, 27, '#3A3036')
    etoile(s, 6, 6, 3, ARC_C)
    return s.render()


def inspiration():
    s = nouveau()
    s.ellipse(9, 4, 23, 18, JAUNE, glow=True)
    s.rect(12, 18, 20, 23, '#C9D2DE')
    s.rect(13, 24, 19, 26, '#8A8A94')
    s.line([(16, 8), (14, 13), (18, 13), (16, 17)], '#FFFFFF', glow=True)
    vitesse(s, [(3, 10, 6, 10), (26, 10, 29, 10), (5, 3, 7, 5), (27, 3, 25, 5)], JAUNE)
    return s.render()


def image_miroir():
    s = nouveau()
    for x, c in ((4, '#6A5AA0'), (11, '#8A72C8'), (18, ARC)):
        s.ellipse(x + 2, 6, x + 9, 13, c, glow=x != 18)
        s.poly([(x, 28), (x + 11, 28), (x + 8, 13), (x + 3, 13)], c, glow=x != 18)
    return s.render()


def erudition():
    s = nouveau()
    livre(s, 6, 12)
    etoile(s, 16, 7, 4, ARC_C)
    s.dots([(9, 6), (23, 5)], ARC, glow=True)
    return s.render()


# ---------- Arcane ----------

def projectiles_arcaniques():
    s = nouveau()
    projectile(s, 3, 28, 16, 7, r=3)
    projectile(s, 5, 30, 23, 14, r=3)
    projectile(s, 2, 22, 26, 24, r=2)
    return s.render()


def deflagration_arcanique():
    s = nouveau()
    orbe(s, 16, 16, 8)
    ondes(s, 16, 16, ARC, n=2, a0=0, a1=360)
    return s.render()


def focalisation():
    s = nouveau()
    rune(s, 16, 16, 12)
    orbe(s, 16, 16, 4)
    for a in range(0, 360, 90):
        x, y = 16 + math.cos(math.radians(a)) * 14, 16 + math.sin(math.radians(a)) * 14
        s.dots([(x, y)], ARC_C, glow=True)
    return s.render()


def flux_arcanique():
    s = nouveau()
    pts = [(4 + i, 16 + math.sin(i / 3) * 7) for i in range(0, 25, 2)]
    s.line(pts, ARC, width=2, glow=True)
    s.line([(x, y - 4) for x, y in pts], ARC_C, glow=True)
    orbe(s, 27, 13, 3)
    return s.render()


def bouclier_arcanique():
    s = nouveau()
    bouclier(s, 7, 4, 25, 28, bord=ARC_C, fond=ARC_F, centre=False)
    etoile(s, 16, 14, 5, ARC_C)
    return s.render()


def rayon_arcanique():
    s = nouveau()
    s.line([(3, 28), (29, 4)], ARC, width=5, glow=True)
    s.line([(3, 28), (29, 4)], ARC_C, width=1, glow=True)
    orbe(s, 5, 26, 4)
    return s.render()


def barrage_arcanique():
    s = nouveau()
    for i, (x, y) in enumerate([(6, 6), (13, 9), (20, 6), (9, 15), (17, 16), (24, 13)]):
        projectile(s, x - 3, y - 3, x, y, r=2)
    s.rect(4, 24, 28, 27, ARC_F)
    eclat(s, 16, 25, 5, ARC, ARC_C)
    return s.render()


def presence_esprit():
    s = nouveau()
    s.ellipse(8, 8, 24, 24, ARC_F)
    s.ellipse(11, 11, 21, 21, ARC)
    s.ellipse(14, 13, 18, 19, '#1A1020')
    s.dots([(15, 14)], ARC_C, glow=True)
    vitesse(s, [(2, 16, 6, 16), (26, 16, 30, 16), (16, 2, 16, 6), (16, 26, 16, 30)], ARC_C)
    return s.render()


def resonance():
    s = nouveau()
    for r in (4, 8, 12):
        arc(s, 16, 16, r, 0, 360, ARC if r != 8 else ARC_C)
    orbe(s, 16, 16, 2)
    return s.render()


def reflexion_sorts():
    s = nouveau()
    s.poly([(14, 4), (20, 4), (20, 28), (14, 28)], '#C9D2DE')
    s.line([(16, 6), (16, 26)], '#FFFFFF', glow=True)
    projectile(s, 3, 6, 12, 14, BRAISE, JAUNE, r=2)
    projectile(s, 13, 16, 4, 25, BRAISE, JAUNE, r=2)
    return s.render()


def distorsion_temporelle():
    s = nouveau()
    s.poly([(9, 4), (23, 4), (17, 16), (23, 28), (9, 28), (15, 16)], '#2E4E8A')
    s.poly([(11, 6), (21, 6), (16, 14)], ARC_C, glow=True)
    s.poly([(12, 26), (20, 26), (16, 21)], ARC_C, glow=True)
    arc(s, 16, 16, 14, 0, 300, ARC)
    s.poly([(29, 14), (27, 19), (25, 14)], ARC, glow=True)
    return s.render()


def concentration_arcanique():
    s = nouveau()
    for a in (-90, 30, 150):
        x, y = 16 + math.cos(math.radians(a)) * 10, 16 + math.sin(math.radians(a)) * 10
        orbe(s, x, y, 3)
    rune(s, 16, 16, 6, ARC_C)
    return s.render()


def esprit_vif():
    s = nouveau()
    s.ellipse(8, 6, 24, 24, '#3A2E5A')
    s.ellipse(10, 8, 22, 20, ARC_F)
    s.line([(12, 12), (15, 15), (13, 17), (17, 19)], ARC_C, glow=True)
    s.line([(19, 10), (17, 14), (20, 16)], ARC_C, glow=True)
    etoile(s, 25, 6, 3, JAUNE)
    return s.render()


def tempete_arcanique():
    s = nouveau()
    for i, r in enumerate((13, 9, 5)):
        arc(s, 16, 16, r, i * 40, 290 + i * 40, ARC if i != 1 else ARC_C, width=2)
    orbe(s, 16, 16, 3)
    braises(s, [(4, 5), (27, 6), (5, 27), (28, 26)], ARC_C)
    return s.render()


# ---------- Feu ----------

def roussir():
    s = nouveau()
    flamme_de(s, 9, 6, 14, 18)
    s.line([(4, 28), (28, 28)], '#3A2A26', width=2)
    braises(s, [(6, 25), (25, 24)])
    return s.render()


def etincelle():
    s = nouveau()
    etoile(s, 16, 16, 9, JAUNE)
    braises(s, [(7, 7), (25, 8), (8, 25), (24, 25), (16, 4)], FEU)
    return s.render()


def boule_de_feu():
    s = nouveau()
    s.poly([(2, 30), (12, 14), (18, 20)], BRAISE, glow=True)
    s.poly([(5, 29), (13, 18), (16, 21)], FEU, glow=True)
    s.ellipse(12, 5, 28, 21, BRAISE, glow=True)
    s.ellipse(15, 8, 25, 18, FEU, glow=True)
    s.ellipse(18, 10, 23, 15, JAUNE, glow=True)
    return s.render()


def cone_de_flammes():
    s = nouveau()
    s.poly([(4, 16), (29, 3), (29, 29)], BRAISE, glow=True)
    s.poly([(7, 16), (27, 7), (27, 25)], FEU, glow=True)
    s.poly([(10, 16), (24, 11), (24, 21)], JAUNE, glow=True)
    main(s, 1, 12)
    return s.render()


def bouclier_de_flammes():
    s = nouveau()
    bouclier(s, 8, 6, 24, 28, bord=OR, fond='#7A2A1A', centre=False)
    flamme_de(s, 11, 10, 10, 12)
    flamme_de(s, 3, 3, 6, 9)
    flamme_de(s, 23, 2, 6, 9)
    return s.render()


def eruption():
    s = nouveau()
    s.poly([(2, 30), (11, 14), (21, 14), (30, 30)], '#4A3630')
    s.poly([(11, 14), (21, 14), (18, 18), (14, 18)], LAVE, glow=True)
    s.poly([(13, 14), (16, 1), (19, 14)], FEU, glow=True)
    s.poly([(10, 12), (6, 4), (13, 10)], BRAISE, glow=True)
    s.poly([(22, 12), (27, 4), (19, 10)], BRAISE, glow=True)
    return s.render()


def incendie():
    s = nouveau()
    flamme_de(s, 2, 12, 9, 16)
    flamme_de(s, 11, 4, 11, 24)
    flamme_de(s, 22, 12, 9, 16)
    return s.render()


def embrasement():
    s = nouveau()
    eclat(s, 16, 16, 12, BRAISE, JAUNE)
    flamme_de(s, 12, 8, 8, 12)
    return s.render()


def armure_de_lave():
    s = nouveau()
    s.poly([(7, 6), (25, 6), (27, 26), (16, 30), (5, 26)], '#4A3630')
    s.poly([(10, 9), (22, 9), (23, 24), (16, 27), (9, 24)], '#5E4840')
    s.line([(12, 10), (14, 18), (11, 24)], LAVE, glow=True)
    s.line([(20, 10), (18, 16), (22, 22)], LAVE, glow=True)
    s.line([(14, 18), (18, 16)], LAVE, glow=True)
    return s.render()


def explosion_de_flammes():
    s = nouveau()
    eclat(s, 16, 18, 14, BRAISE, JAUNE)
    flamme_de(s, 3, 3, 7, 9)
    flamme_de(s, 22, 3, 7, 9)
    return s.render()


def meteore_():
    s = nouveau()
    meteore(s, 19, 19, 7, trainee=10)
    s.line([(4, 30), (30, 30)], BRAISE, glow=True)
    return s.render()


def chaleur_intense():
    s = nouveau()
    for x in (8, 16, 24):
        s.line([(x, 28), (x - 2, 22), (x + 2, 16), (x - 2, 10), (x, 4)], BRAISE if x != 16 else FEU, width=2, glow=True)
    s.line([(3, 30), (29, 30)], LAVE, glow=True)
    return s.render()


def pyromanie():
    s = nouveau()
    main(s, 12, 18)
    flamme_de(s, 8, 1, 16, 18)
    braises(s, [(5, 12), (27, 10)])
    return s.render()


def pyrolance():
    s = nouveau()
    s.line([(3, 29), (27, 5)], BRAISE, width=5, glow=True)
    s.line([(3, 29), (27, 5)], JAUNE, width=1, glow=True)
    s.poly([(30, 2), (22, 6), (26, 10)], JAUNE, glow=True)
    flamme_de(s, 2, 18, 8, 12)
    return s.render()


# ---------- Givre ----------

def eclair_de_givre():
    s = nouveau()
    projectile(s, 3, 28, 22, 10, GLACE, GLACE_C, r=5)
    flocon(s, 22, 10, 4, GLACE_C)
    vitesse(s, [(3, 21, 10, 14), (8, 29, 15, 22)], GLACE)
    return s.render()


def lance_de_glace():
    s = nouveau()
    lance(s, 4, 28, 25, 7)
    s.dots([(8, 20), (12, 26), (19, 12)], GLACE_C, glow=True)
    return s.render()


def gelure():
    s = nouveau()
    main(s, 12, 14, '#A8C8E0', '#2E4290')
    cristal(s, 6, 4, 6, 12)
    cristal(s, 14, 2, 6, 12)
    cristal(s, 22, 5, 6, 11)
    return s.render()


def cone_de_froid():
    s = nouveau()
    s.poly([(4, 16), (29, 3), (29, 29)], GLACE_F, glow=True)
    s.poly([(7, 16), (27, 7), (27, 25)], GLACE, glow=True)
    s.poly([(10, 16), (24, 11), (24, 21)], GLACE_C, glow=True)
    main(s, 1, 12)
    return s.render()


def barriere_de_glace():
    s = nouveau()
    for x, h in ((3, 18), (10, 24), (17, 26), (24, 20)):
        cristal(s, x, 30 - h, 7, h)
    return s.render()


def armure_de_givre():
    s = nouveau()
    s.poly([(7, 6), (25, 6), (27, 26), (16, 30), (5, 26)], GLACE_F)
    s.poly([(10, 9), (22, 9), (23, 24), (16, 27), (9, 24)], GLACE)
    flocon(s, 16, 17, 6, GLACE_C)
    return s.render()


def morsure_du_froid():
    s = nouveau()
    s.poly([(4, 8), (28, 8), (24, 13), (8, 13)], '#C9D2DE')
    s.poly([(4, 24), (28, 24), (24, 19), (8, 19)], '#C9D2DE')
    for x in range(7, 26, 4):
        s.poly([(x, 13), (x + 2, 13), (x + 1, 17)], GLACE_C)
        s.poly([(x + 1, 19), (x + 3, 19), (x + 2, 15)], GLACE_C)
    flocon(s, 27, 4, 3)
    return s.render()


def toucher_glacial():
    s = nouveau()
    main(s, 10, 12, '#A8C8E0', '#2E4290')
    flocon(s, 14, 6, 5)
    s.dots([(5, 8), (25, 10), (22, 3)], GLACE_C, glow=True)
    return s.render()


def souffle_polaire():
    s = nouveau()
    for i in range(3):
        s.line([(3, 10 + i * 6), (12, 8 + i * 6), (20, 12 + i * 6), (29, 10 + i * 6)], GLACE if i != 1 else GLACE_C, width=2, glow=True)
    flocon(s, 25, 5, 3)
    return s.render()


def tempete_de_neige():
    s = nouveau()
    s.ellipse(4, 2, 20, 12, '#5A6A80')
    s.ellipse(12, 3, 29, 13, '#6E7E94')
    for x, y in ((6, 16), (13, 20), (20, 15), (26, 21), (9, 26), (18, 27), (25, 28)):
        flocon(s, x, y, 2, GLACE_C)
    return s.render()


def prison_de_glace():
    s = nouveau()
    s.poly([(6, 4), (26, 4), (28, 28), (4, 28)], GLACE_F)
    s.poly([(8, 6), (24, 6), (25, 26), (7, 26)], GLACE)
    s.ellipse(12, 9, 20, 17, '#5E6670')
    s.rect(11, 17, 21, 25, '#5E6670')
    s.line([(9, 7), (12, 24)], GLACE_C, glow=True)
    s.line([(22, 7), (20, 14)], GLACE_C, glow=True)
    return s.render()


def fragmentation():
    s = nouveau()
    for (x, y, w, h) in ((4, 4, 8, 12), (18, 2, 9, 11), (10, 17, 9, 12), (22, 18, 7, 10)):
        cristal(s, x, y, w, h)
    eclat(s, 16, 15, 5, GLACE_C, '#FFFFFF')
    return s.render()


def coeur_de_glace():
    s = nouveau()
    h = 24 * 0.9
    s.ellipse(4, 5, 17, 5 + h / 2, GLACE)
    s.ellipse(15, 5, 28, 5 + h / 2, GLACE)
    s.poly([(4, 5 + h * 0.3), (28, 5 + h * 0.3), (16, 5 + h + 2)], GLACE)
    s.line([(10, 9), (12, 15)], GLACE_C, glow=True)
    flocon(s, 16, 14, 4, '#FFFFFF')
    return s.render()


def fracas_glaciaire():
    s = nouveau()
    eclat(s, 16, 16, 14, GLACE, GLACE_C)
    for (x, y) in ((3, 3), (25, 4), (4, 25), (26, 26)):
        cristal(s, x, y, 4, 6)
    return s.render()


def reflet():
    s = nouveau()
    s.ellipse(11, 4, 21, 13, '#8A72C8', glow=True)
    s.poly([(8, 29), (24, 29), (20, 13), (12, 13)], '#8A72C8', glow=True)
    projectile(s, 20, 20, 29, 12, r=2)
    return s.render()


# ---------- Cartes-statut de l'acte 2 ----------

def sceptre_domination():
    s = nouveau()
    s.line([(6, 28), (20, 10)], CUIR, width=2)
    s.ellipse(17, 3, 29, 15, '#8E3A6E', glow=True)
    s.ellipse(20, 6, 26, 12, '#E85AE8', glow=True)
    s.poly([(2, 10), (8, 4), (12, 8), (8, 12)], '#2A2430')  # petit dragonnet
    s.rect(5, 7, 6, 8, JAUNE, glow=True)
    return s.render()


def fiole_instable():
    s = nouveau()
    s.rect(13, 3, 19, 9, '#C9D2DE')
    s.ellipse(7, 8, 25, 28, '#C9D2DE')
    s.ellipse(9, 13, 23, 26, '#7ED84A', glow=True)
    s.dots([(13, 16), (18, 19), (15, 22)], '#C8FF8A', glow=True)
    s.dots([(4, 6), (27, 8), (26, 3)], '#7ED84A', glow=True)
    return s.render()


def cendres():
    s = nouveau()
    s.ellipse(4, 18, 28, 30, '#5A5450')
    s.ellipse(8, 14, 24, 24, '#6E6A66')
    s.dots([(8, 8), (14, 5), (20, 9), (25, 6), (11, 12), (22, 13)], '#A8A098')
    s.dots([(15, 20), (19, 22)], LAVE, glow=True)
    return s.render()


ILLUSTRATIONS_MAGE = {
    'sceptre_domination': sceptre_domination, 'fiole_instable': fiole_instable, 'cendres': cendres,
    'trait_de_magie': trait_de_magie, 'barriere': barriere,
    'explosion_des_arcanes': explosion_des_arcanes, 'nova_de_givre': nova_de_givre, 'lenteur': lenteur,
    'siphon_de_mana': siphon_de_mana, 'delivrance': delivrance, 'bouclier_de_mana': bouclier_de_mana,
    'metamorphose': metamorphose, 'inspiration': inspiration, 'image_miroir': image_miroir, 'erudition': erudition,
    'projectiles_arcaniques': projectiles_arcaniques, 'deflagration_arcanique': deflagration_arcanique,
    'focalisation': focalisation, 'flux_arcanique': flux_arcanique, 'bouclier_arcanique': bouclier_arcanique,
    'rayon_arcanique': rayon_arcanique, 'barrage_arcanique': barrage_arcanique, 'presence_esprit': presence_esprit,
    'resonance': resonance, 'reflexion_sorts': reflexion_sorts, 'distorsion_temporelle': distorsion_temporelle,
    'concentration_arcanique': concentration_arcanique, 'esprit_vif': esprit_vif, 'tempete_arcanique': tempete_arcanique,
    'roussir': roussir, 'etincelle': etincelle, 'boule_de_feu': boule_de_feu, 'cone_de_flammes': cone_de_flammes,
    'bouclier_de_flammes': bouclier_de_flammes, 'eruption': eruption, 'incendie': incendie, 'embrasement': embrasement,
    'armure_de_lave': armure_de_lave, 'explosion_de_flammes': explosion_de_flammes, 'meteore': meteore_,
    'chaleur_intense': chaleur_intense, 'pyromanie': pyromanie, 'pyrolance': pyrolance,
    'eclair_de_givre': eclair_de_givre, 'lance_de_glace': lance_de_glace, 'gelure': gelure, 'cone_de_froid': cone_de_froid,
    'barriere_de_glace': barriere_de_glace, 'armure_de_givre': armure_de_givre, 'morsure_du_froid': morsure_du_froid,
    'toucher_glacial': toucher_glacial, 'souffle_polaire': souffle_polaire, 'tempete_de_neige': tempete_de_neige,
    'prison_de_glace': prison_de_glace, 'fragmentation': fragmentation, 'coeur_de_glace': coeur_de_glace,
    'fracas_glaciaire': fracas_glaciaire, 'reflet': reflet,
}
