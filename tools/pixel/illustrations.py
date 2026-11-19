"""Les illustrations des cartes (32 x 32 pixels), une par carte.
Exporte public/assets/carte_<id>.png pour chaque carte du jeu.
Style : pixel art moderne, comme les sprites (voir docs/DIRECTION_ARTISTIQUE.md)."""
import math
import os
from sprites import Sprite
from cartes import coup_de_bouclier, frappe_heroique, frappe_mortelle, flamme, goutte

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))

ACIER, ACIER_CLAIR, OR, CUIR = '#DCE3EC', '#F4F7FB', '#E6B84A', '#5A3822'
ROUGE, SANG, FEU, JAUNE, BLEU, VIOLET = '#C8402A', '#B8202A', '#F59A2E', '#FFE27A', '#8FB8E8', '#A66BE0'


# ---------- Formes de base ----------

def epee(s, x0, y0, x1, y1, lame=ACIER, garde=OR, poignee=CUIR):
    """Une épée de la poignée (x0, y0) à la pointe (x1, y1)."""
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy) or 1
    ux, uy = dx / n, dy / n
    gx, gy = x0 + ux * 5, y0 + uy * 5  # garde
    s.line([(gx, gy), (x1, y1)], lame, width=3)
    s.line([(gx + ux, gy + uy), (x1 - ux, y1 - uy)], ACIER_CLAIR, width=1)
    px, py = -uy, ux
    s.line([(gx + px * 4, gy + py * 4), (gx - px * 4, gy - py * 4)], garde, width=2)
    s.line([(x0, y0), (gx, gy)], poignee, width=2)
    s.ellipse(x0 - 2, y0 - 2, x0 + 1, y0 + 1, garde)


def hache(s, x0, y0, x1, y1, tete=ACIER):
    """Une hache : manche de (x0, y0) à (x1, y1), le fer en haut."""
    s.line([(x0, y0), (x1, y1)], CUIR, width=2)
    s.poly([(x1 - 2, y1 - 1), (x1 + 7, y1 - 6), (x1 + 9, y1 + 3), (x1 + 3, y1 + 6)], tete)
    s.line([(x1 + 7, y1 - 5), (x1 + 8, y1 + 2)], ACIER_CLAIR)


def bouclier(s, x0, y0, x1, y1, bord=OR, fond='#9E2B24', centre=True):
    mx = (x0 + x1) // 2
    s.poly([(x0, y0), (x1, y0), (x1, y0 + (y1 - y0) * 0.55), (mx, y1), (x0, y0 + (y1 - y0) * 0.55)], bord)
    s.poly([(x0 + 2, y0 + 2), (x1 - 2, y0 + 2), (x1 - 2, y0 + (y1 - y0) * 0.53), (mx, y1 - 3), (x0 + 2, y0 + (y1 - y0) * 0.53)], fond)
    if centre:
        r = max(2, (x1 - x0) // 6)
        s.ellipse(mx - r, y0 + (y1 - y0) * 0.35 - r, mx + r, y0 + (y1 - y0) * 0.35 + r, '#C9D2DE')


def etoile(s, cx, cy, r, couleur=JAUNE):
    s.poly([(cx, cy - r), (cx + r * 0.3, cy - r * 0.3), (cx + r, cy), (cx + r * 0.3, cy + r * 0.3),
            (cx, cy + r), (cx - r * 0.3, cy + r * 0.3), (cx - r, cy), (cx - r * 0.3, cy - r * 0.3)], couleur, glow=True)


def eclat(s, cx, cy, r, couleur=ROUGE, coeur=FEU):
    """Une explosion en étoile à 12 branches (cris, impacts)."""
    pts = []
    for i in range(12):
        a = i * math.pi / 6 - math.pi / 2
        rr = r if i % 2 == 0 else r * 0.5
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    s.poly(pts, couleur, glow=True)
    s.ellipse(cx - r * 0.35, cy - r * 0.35, cx + r * 0.35, cy + r * 0.35, coeur, glow=True)


def arc(s, cx, cy, r, a0, a1, couleur, width=1, glow=True):
    """Un arc de cercle (angles en degrés, 0 = droite, sens horaire)."""
    pts = [(cx + math.cos(math.radians(a)) * r, cy + math.sin(math.radians(a)) * r) for a in range(a0, a1 + 1, 8)]
    s.line(pts, couleur, width=width, glow=glow)


def ondes(s, cx, cy, couleur=FEU, n=3, a0=-50, a1=50):
    for i in range(n):
        arc(s, cx, cy, 6 + i * 5, a0, a1, couleur)


def goutte_de(s, x, y, h, couleur=SANG):
    s.poly([(x, y), (x + h * 0.35, y + h * 0.55), (x + h * 0.3, y + h * 0.85), (x, y + h), (x - h * 0.3, y + h * 0.85),
            (x - h * 0.35, y + h * 0.55)], couleur)
    s.dots([(x - 1, y + h * 0.6)], '#FF9A9A', glow=True)


def flamme_de(s, x, y, w, h, ext='#E8562A', mil=FEU, coeur=JAUNE):
    s.poly([(x + w / 2, y), (x + w, y + h * 0.6), (x + w * 0.8, y + h), (x + w * 0.2, y + h), (x, y + h * 0.6)], ext, glow=True)
    s.poly([(x + w / 2, y + h * 0.3), (x + w * 0.78, y + h * 0.7), (x + w * 0.62, y + h * 0.95), (x + w * 0.38, y + h * 0.95), (x + w * 0.22, y + h * 0.7)], mil, glow=True)
    s.poly([(x + w / 2, y + h * 0.6), (x + w * 0.6, y + h * 0.85), (x + w / 2, y + h * 0.95), (x + w * 0.4, y + h * 0.85)], coeur, glow=True)


def vitesse(s, lignes, couleur=FEU):
    for (x0, y0, x1, y1) in lignes:
        s.line([(x0, y0), (x1, y1)], couleur, glow=True)


def crane(s, x, y, couleur='#E6E0D0', yeux='#2A1C18'):
    s.ellipse(x, y, x + 14, y + 12, couleur)
    s.rect(x + 3, y + 10, x + 11, y + 14, couleur)
    s.ellipse(x + 2, y + 4, x + 6, y + 8, yeux, shade=False)
    s.ellipse(x + 8, y + 4, x + 12, y + 8, yeux, shade=False)
    s.dots([(x + 5, y + 13), (x + 7, y + 13), (x + 9, y + 13)], yeux)


def coeur(s, x, y, w, couleur='#D8303A'):
    h = w * 0.9
    s.ellipse(x, y, x + w / 2 + 1, y + h / 2, couleur)
    s.ellipse(x + w / 2 - 1, y, x + w, y + h / 2, couleur)
    s.poly([(x, y + h * 0.3), (x + w, y + h * 0.3), (x + w / 2, y + h)], couleur)


def marteau(s, x0, y0, x1, y1, tete='#8A8A94'):
    s.line([(x0, y0), (x1, y1)], CUIR, width=2)
    s.poly([(x1 - 6, y1 - 4), (x1 + 4, y1 - 9), (x1 + 8, y1 - 1), (x1 - 2, y1 + 4)], tete)


def fleche(s, x0, y0, x1, y1, couleur=JAUNE):
    s.line([(x0, y0), (x1, y1)], couleur, width=2, glow=True)
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy) or 1
    ux, uy = dx / n, dy / n
    s.poly([(x1 + ux * 3, y1 + uy * 3), (x1 - ux * 3 - uy * 4, y1 - uy * 3 + ux * 4), (x1 - ux * 3 + uy * 4, y1 - uy * 3 - ux * 4)], couleur, glow=True)


def nouveau():
    return Sprite(32, 32)


# ---------- Deck de départ ----------

def frappe():
    s = nouveau()
    epee(s, 6, 27, 27, 5)
    vitesse(s, [(3, 14, 9, 8), (7, 18, 13, 12)])
    return s.render()


def parade():
    s = nouveau()
    bouclier(s, 7, 4, 25, 28, bord='#C9D2DE', fond='#3E5A7E')
    vitesse(s, [(1, 10, 4, 10), (1, 16, 3, 16), (1, 22, 4, 22)], BLEU)
    return s.render()


def cri_de_guerre():
    s = nouveau()
    eclat(s, 12, 16, 10)
    ondes(s, 12, 16, FEU, 3)
    return s.render()


# ---------- Tronc commun ----------

def enchainement():
    s = nouveau()
    epee(s, 4, 28, 22, 8)
    arc(s, 16, 16, 12, -80, 40, ACIER_CLAIR, 2)
    arc(s, 22, 20, 7, -60, 60, BLEU)
    return s.render()


def coup_de_tonnerre():
    s = nouveau()
    s.poly([(18, 1), (10, 14), (16, 14), (9, 27), (24, 11), (17, 11), (23, 1)], JAUNE, glow=True)
    s.poly([(18, 3), (13, 12), (17, 12)], '#FFFFFF', glow=True)
    arc(s, 16, 28, 12, 190, 350, BLEU, 1)
    arc(s, 16, 28, 7, 200, 340, BLEU, 1)
    return s.render()


def fracasser_armure():
    s = nouveau()
    s.poly([(7, 6), (25, 6), (27, 16), (23, 28), (9, 28), (5, 16)], '#8A8A94')
    s.poly([(11, 9), (21, 9), (22, 16), (19, 24), (13, 24), (10, 16)], '#A8A8B4')
    s.line([(17, 4), (14, 12), (19, 17), (13, 25), (15, 30)], '#FF5A3A', width=1, glow=True)
    s.dots([(24, 3), (28, 9), (4, 4)], '#C9D2DE')
    return s.render()


def cri_demoralisant():
    s = nouveau()
    ondes(s, 6, 14, VIOLET, 3, -40, 40)
    s.poly([(20, 16), (28, 16), (24, 28)], '#8E6AB8', glow=True)
    s.rect(22, 6, 26, 17, '#8E6AB8', glow=True)
    return s.render()


def interception():
    s = nouveau()
    s.ellipse(17, 3, 29, 15, '#E8562A', glow=True)
    s.ellipse(20, 6, 26, 12, JAUNE, glow=True)
    epee(s, 4, 28, 20, 12)
    etoile(s, 17, 15, 4, '#FFFFFF')
    return s.render()


def cri_de_bataille():
    s = nouveau()
    s.line([(7, 2), (7, 30)], CUIR, width=2)
    s.poly([(9, 3), (27, 5), (23, 11), (27, 17), (9, 15)], '#B8322A')
    s.poly([(12, 6), (20, 7), (18, 12), (12, 12)], OR)
    s.dots([(7, 1)], JAUNE, glow=True)
    return s.render()


def ignorer_la_douleur():
    s = nouveau()
    coeur(s, 5, 6, 22)
    s.line([(8, 14), (24, 20)], '#E6E0D0', width=3)
    s.line([(9, 19), (23, 13)], '#E6E0D0', width=3)
    vitesse(s, [(1, 4, 4, 7), (31, 4, 28, 7)], BLEU)
    return s.render()


def execution():
    s = nouveau()
    s.line([(6, 30), (20, 6)], CUIR, width=2)
    s.poly([(14, 4), (28, 2), (30, 16), (20, 14)], '#8A8A94')
    s.line([(28, 3), (29, 14)], ACIER_CLAIR)
    s.dots([(26, 20), (28, 24), (23, 26)], SANG, glow=True)
    return s.render()


# ---------- Arbre Armes ----------

def taillade():
    s = nouveau()
    vitesse(s, [(4, 26, 26, 4), (8, 28, 28, 8)], ACIER_CLAIR)
    goutte_de(s, 10, 6, 12)
    goutte_de(s, 24, 18, 9)
    return s.render()


def pourfendre():
    s = nouveau()
    arc(s, 6, 26, 20, -80, 0, ACIER_CLAIR, 2)
    goutte_de(s, 9, 3, 12)
    goutte_de(s, 18, 12, 11)
    goutte_de(s, 25, 3, 9)
    return s.render()


def fulgurance():
    s = nouveau()
    epee(s, 3, 29, 28, 4, lame='#FFF2B0')
    vitesse(s, [(2, 12, 12, 2), (8, 22, 20, 10), (14, 30, 28, 16)], JAUNE)
    return s.render()


def frappe_ecrasante():
    s = nouveau()
    marteau(s, 4, 6, 18, 22)
    s.line([(4, 30), (12, 26), (16, 30), (22, 25), (28, 30)], '#FF8A2A', glow=True)
    etoile(s, 22, 24, 5)
    return s.render()


def parade_ripostee():
    s = nouveau()
    bouclier(s, 3, 6, 19, 28, bord='#C9D2DE', fond='#3E5A7E')
    fleche(s, 18, 22, 28, 8)
    return s.render()


def coup_de_grace():
    s = nouveau()
    crane(s, 9, 16)
    epee(s, 16, 2, 16, 18, lame='#DCE3EC')
    s.dots([(16, 19)], SANG, glow=True)
    return s.render()


def balayage():
    s = nouveau()
    arc(s, 16, 30, 22, 200, 340, ACIER_CLAIR, 3)
    arc(s, 16, 30, 17, 210, 330, BLEU, 1)
    epee(s, 26, 26, 30, 8)
    return s.render()


def entaille_profonde():
    s = nouveau()
    epee(s, 5, 27, 25, 7, lame='#E8B8B8')
    goutte_de(s, 22, 14, 8)
    goutte_de(s, 27, 22, 6)
    goutte_de(s, 14, 22, 6)
    return s.render()


def cri_intimidation():
    s = nouveau()
    crane(s, 4, 9, couleur='#C9C0E0')
    ondes(s, 13, 16, VIOLET, 3, -45, 45)
    return s.render()


def concentration_martiale():
    s = nouveau()
    s.ellipse(4, 4, 28, 28, '#2A4A7E', glow=True)
    s.ellipse(8, 8, 24, 24, '#4C8FE0', glow=True)
    s.line([(9, 17), (16, 13), (23, 17)], '#1A1230', width=2, glow=True)
    etoile(s, 16, 22, 4, JAUNE)
    return s.render()


def frappe_du_colosse():
    s = nouveau()
    s.poly([(18, 12), (28, 10), (30, 20), (22, 26)], '#9E2B24')
    s.poly([(20, 14), (26, 13), (27, 19), (22, 23)], '#C9D2DE')
    s.line([(18, 10), (26, 26)], '#1A1210', width=2)
    marteau(s, 3, 28, 14, 10, tete='#6E6458')
    etoile(s, 17, 14, 5)
    return s.render()


def tempete_acier():
    s = nouveau()
    for a in range(0, 360, 90):
        r = math.radians(a)
        epee(s, 16 + math.cos(r) * 4, 16 + math.sin(r) * 4, 16 + math.cos(r + 0.6) * 14, 16 + math.sin(r + 0.6) * 14)
    s.ellipse(13, 13, 19, 19, JAUNE, glow=True)
    return s.render()


def maitre_armes():
    s = nouveau()
    epee(s, 5, 28, 26, 7)
    epee(s, 27, 28, 6, 7)
    s.poly([(10, 2), (13, 6), (16, 1), (19, 6), (22, 2), (21, 9), (11, 9)], OR)
    return s.render()


# ---------- Arbre Fureur ----------

def coup_de_folie():
    s = nouveau()
    hache(s, 4, 28, 12, 12)
    hache(s, 18, 30, 20, 14)
    vitesse(s, [(26, 2, 30, 6), (2, 4, 6, 2)], ROUGE)
    return s.render()


def rage_sanglante():
    s = nouveau()
    flamme_de(s, 6, 2, 20, 26, ext='#9E1A1A', mil=ROUGE, coeur=FEU)
    goutte_de(s, 16, 14, 12, couleur='#7A0A10')
    return s.render()


def frappe_frenetique():
    s = nouveau()
    vitesse(s, [(3, 10, 13, 4)], ACIER)
    s.line([(4, 20), (20, 8)], ACIER_CLAIR, width=2)
    s.line([(6, 30), (29, 8)], '#FFFFFF', width=3, glow=True)
    s.dots([(27, 3), (30, 13)], ROUGE, glow=True)
    return s.render()


def hurlement_furieux():
    s = nouveau()
    eclat(s, 10, 16, 8, couleur='#E8402A')
    ondes(s, 10, 16, ROUGE, 4, -55, 55)
    return s.render()


def soif_de_bataille():
    s = nouveau()
    s.poly([(7, 6), (25, 6), (22, 17), (10, 17)], OR)
    s.poly([(9, 8), (23, 8), (21, 13), (11, 13)], SANG)
    s.rect(15, 17, 17, 25, OR)
    s.rect(10, 25, 22, 28, OR)
    s.dots([(12, 4), (20, 3)], ROUGE, glow=True)
    return s.render()


def ruee_sanguinaire():
    s = nouveau()
    for (x, y) in ((3, 8), (10, 20), (16, 6), (20, 24), (6, 28)):
        fleche(s, x, y, x + 9, y - 5, couleur=ROUGE)
    return s.render()


def tourbillon():
    s = nouveau()
    arc(s, 16, 16, 13, 0, 300, ACIER_CLAIR, 2)
    arc(s, 16, 16, 8, 60, 360, BLEU, 2)
    arc(s, 16, 16, 3, 120, 400, '#FFFFFF', 1)
    epee(s, 25, 25, 30, 12)
    return s.render()


def enrage():
    s = nouveau()
    s.ellipse(3, 8, 29, 26, '#5A1A14')
    s.poly([(6, 12), (14, 15), (13, 17), (6, 16)], '#FF3A2A', glow=True)
    s.poly([(26, 12), (18, 15), (19, 17), (26, 16)], '#FF3A2A', glow=True)
    s.line([(5, 9), (14, 13)], '#1A0A08', width=2)
    s.line([(27, 9), (18, 13)], '#1A0A08', width=2)
    s.line([(11, 22), (21, 22)], '#1A0A08', width=2)
    return s.render()


def rafale():
    s = nouveau()
    epee(s, 4, 28, 16, 16)
    epee(s, 10, 30, 22, 18)
    epee(s, 16, 30, 28, 16)
    vitesse(s, [(2, 6, 12, 6), (6, 10, 16, 10)], BLEU)
    return s.render()


def ambidextrie():
    s = nouveau()
    epee(s, 13, 29, 3, 5)
    epee(s, 19, 29, 29, 5)
    vitesse(s, [(14, 4, 18, 4)], JAUNE)
    return s.render()


def main_gauche():
    s = nouveau()
    epee(s, 23, 27, 9, 9, lame='#C9D2DE', garde='#8A8A94')
    vitesse(s, [(26, 8, 30, 12)], BLEU)
    return s.render()


def furie_croissante():
    s = nouveau()
    flamme_de(s, 2, 10, 14, 20, ext='#9E1A1A', mil=ROUGE)
    fleche(s, 12, 28, 26, 6, couleur=FEU)
    return s.render()


def fureur_suicidaire():
    s = nouveau()
    flamme_de(s, 2, 0, 28, 30, ext='#9E1A1A', mil=ROUGE, coeur=FEU)
    crane(s, 9, 11, couleur='#F0E0D0')
    return s.render()


def furie_inextinguible():
    s = nouveau()
    s.rect(9, 24, 23, 29, '#5A5050')
    flamme_de(s, 6, 2, 20, 24, ext='#C21A1A', mil='#FF5A2A', coeur=JAUNE)
    return s.render()


def sanguinaire():
    s = nouveau()
    epee(s, 4, 28, 26, 6, lame='#E8B8B8')
    coeur(s, 18, 18, 11)
    return s.render()


# ---------- Arbre Protection ----------

def levee_de_bouclier():
    s = nouveau()
    bouclier(s, 6, 9, 24, 31)
    fleche(s, 26, 18, 26, 3, couleur=JAUNE)
    return s.render()


def inebranlable():
    s = nouveau()
    s.rect(6, 3, 26, 29, '#8A8A94')
    s.rect(8, 5, 24, 27, '#5E6670')
    s.line([(16, 5), (16, 27)], '#8A8A94', width=2)
    s.line([(8, 14), (24, 14)], '#8A8A94', width=2)
    s.dots([(10, 7), (22, 7), (10, 25), (22, 25)], OR)
    return s.render()


def coup_de_semonce():
    s = nouveau()
    bouclier(s, 3, 8, 17, 28, bord='#C9D2DE', fond='#3E5A7E', centre=False)
    etoile(s, 23, 12, 6)
    ondes(s, 18, 16, VIOLET, 2, -40, 40)
    return s.render()


def vengeance():
    s = nouveau()
    epee(s, 26, 28, 6, 6, lame='#FFB0A0')
    fleche(s, 6, 26, 20, 26, couleur=ROUGE)
    s.dots([(26, 6), (22, 3)], ROUGE, glow=True)
    return s.render()


def resolution():
    s = nouveau()
    for (x, y) in ((3, 4), (9, 2), (15, 4)):
        s.ellipse(x, y, x + 5, y + 5, ROUGE, glow=True)
    fleche(s, 10, 10, 12, 15, couleur=FEU)
    bouclier(s, 8, 15, 26, 31, bord='#C9D2DE', fond='#3E5A7E')
    return s.render()


def provocation():
    s = nouveau()
    s.ellipse(3, 3, 29, 29, ROUGE, glow=True)
    s.ellipse(7, 7, 25, 25, '#2A1410', glow=True)
    s.ellipse(11, 11, 21, 21, ROUGE, glow=True)
    s.ellipse(14, 14, 18, 18, JAUNE, glow=True)
    return s.render()


def desarmement():
    s = nouveau()
    s.line([(10, 22), (16, 12)], ACIER, width=3)
    s.line([(19, 8), (25, 2)], ACIER, width=3)
    s.line([(5, 24), (13, 30)], OR, width=2)
    s.line([(9, 27), (4, 30)], CUIR, width=2)
    etoile(s, 17, 10, 5, '#FFFFFF')
    return s.render()


def charge_du_bouclier():
    s = nouveau()
    bouclier(s, 12, 4, 28, 28)
    vitesse(s, [(1, 8, 9, 8), (1, 14, 10, 14), (1, 20, 9, 20)], FEU)
    return s.render()


def tenacite():
    s = nouveau()
    bouclier(s, 4, 4, 22, 28, bord='#C9D2DE', fond='#3E5A7E', centre=False)
    s.poly([(20, 14), (30, 14), (25, 20)], OR)
    s.poly([(20, 26), (30, 26), (25, 20)], OR)
    s.rect(19, 12, 31, 13, CUIR)
    s.rect(19, 27, 31, 28, CUIR)
    return s.render()


def peau_de_fer():
    s = nouveau()
    s.ellipse(6, 4, 26, 18, '#8A8A94')
    s.rect(10, 12, 22, 28, '#8A8A94')
    s.line([(10, 18), (22, 18)], '#5E6670')
    s.line([(10, 23), (22, 23)], '#5E6670')
    s.dots([(12, 8), (20, 8)], ACIER_CLAIR)
    return s.render()


def cri_de_ralliement():
    s = nouveau()
    s.line([(5, 2), (5, 30)], CUIR, width=2)
    s.poly([(7, 3), (21, 4), (18, 9), (21, 14), (7, 13)], '#3E5A7E')
    bouclier(s, 16, 14, 30, 30, centre=False)
    return s.render()


def riposte_bouclier():
    s = nouveau()
    bouclier(s, 7, 5, 25, 29, bord='#C9D2DE', fond='#5E6670')
    s.poly([(3, 10), (7, 9), (7, 12)], ACIER_CLAIR)
    s.poly([(29, 10), (25, 9), (25, 12)], ACIER_CLAIR)
    s.poly([(16, 1), (14, 5), (18, 5)], ACIER_CLAIR)
    s.poly([(4, 19), (8, 17), (8, 21)], ACIER_CLAIR)
    s.poly([(28, 19), (24, 17), (24, 21)], ACIER_CLAIR)
    return s.render()


def garde_de_fer():
    s = nouveau()
    for row, y in enumerate(range(8, 29, 5)):
        off = 0 if row % 2 == 0 else 4
        for x in range(2 + off - 4, 30, 8):
            s.rect(max(2, x), y, min(29, x + 6), y + 3, '#6E6458')
    s.rect(2, 4, 6, 8, '#6E6458')
    s.rect(13, 4, 18, 8, '#6E6458')
    s.rect(25, 4, 29, 8, '#6E6458')
    return s.render()


def bastion():
    s = nouveau()
    s.rect(4, 12, 28, 30, '#6E6458')
    s.rect(9, 6, 23, 14, '#7E7468')
    for x in (4, 10, 16, 22):
        s.rect(x, 9, x + 3, 12, '#6E6458')
    s.rect(14, 22, 18, 30, '#2A1C18')
    s.poly([(16, 0), (16, 6), (22, 3)], ROUGE)
    etoile(s, 28, 6, 3, FEU)
    etoile(s, 4, 6, 3, FEU)
    return s.render()


def heurt_de_bouclier():
    s = nouveau()
    bouclier(s, 2, 6, 20, 30)
    eclat(s, 23, 13, 8, couleur=JAUNE, coeur='#FFFFFF')
    return s.render()


# ---------- Cartes-statut ----------

def bombe_vivante():
    s = nouveau()
    s.ellipse(5, 9, 25, 29, '#2A2A30')
    s.ellipse(8, 12, 13, 17, '#5A5A64', shade=False)
    s.line([(19, 10), (23, 4)], CUIR, width=2)
    etoile(s, 25, 3, 4, FEU)
    s.line([(9, 20), (21, 20)], '#FF5A2A', glow=True)
    return s.render()


def fardeau():
    s = nouveau()
    s.ellipse(6, 10, 26, 30, '#4A3A5E')
    for (x, y) in ((4, 4), (9, 2), (14, 1), (19, 2), (24, 4)):
        s.ellipse(x, y, x + 4, y + 4, '#8A8A94')
    s.dots([(12, 18), (19, 20), (15, 24)], VIOLET, glow=True)
    return s.render()


def malediction():
    s = nouveau()
    s.ellipse(2, 2, 30, 30, '#3A1E4E', glow=True)
    crane(s, 9, 8, couleur='#C9A8E8', yeux='#1A0A28')
    s.dots([(4, 16), (28, 12), (25, 27)], VIOLET, glow=True)
    return s.render()


ILLUSTRATIONS = {
    'frappe': frappe, 'parade': parade, 'frappe_heroique': frappe_heroique, 'cri_de_guerre': cri_de_guerre,
    'enchainement': enchainement, 'coup_de_tonnerre': coup_de_tonnerre, 'fracasser_armure': fracasser_armure,
    'cri_demoralisant': cri_demoralisant, 'coup_de_bouclier': coup_de_bouclier, 'interception': interception,
    'cri_de_bataille': cri_de_bataille, 'ignorer_la_douleur': ignorer_la_douleur, 'execution': execution,
    'taillade': taillade, 'pourfendre': pourfendre, 'fulgurance': fulgurance, 'frappe_ecrasante': frappe_ecrasante,
    'parade_ripostee': parade_ripostee, 'coup_de_grace': coup_de_grace, 'balayage': balayage,
    'entaille_profonde': entaille_profonde, 'cri_intimidation': cri_intimidation,
    'concentration_martiale': concentration_martiale, 'frappe_du_colosse': frappe_du_colosse,
    'tempete_acier': tempete_acier, 'maitre_armes': maitre_armes, 'frappe_mortelle': frappe_mortelle,
    'coup_de_folie': coup_de_folie, 'rage_sanglante': rage_sanglante, 'frappe_frenetique': frappe_frenetique,
    'hurlement_furieux': hurlement_furieux, 'soif_de_bataille': soif_de_bataille, 'ruee_sanguinaire': ruee_sanguinaire,
    'tourbillon': tourbillon, 'enrage': enrage, 'rafale': rafale, 'ambidextrie': ambidextrie, 'main_gauche': main_gauche,
    'furie_croissante': furie_croissante, 'fureur_suicidaire': fureur_suicidaire,
    'furie_inextinguible': furie_inextinguible, 'sanguinaire': sanguinaire,
    'levee_de_bouclier': levee_de_bouclier, 'inebranlable': inebranlable, 'coup_de_semonce': coup_de_semonce,
    'vengeance': vengeance, 'resolution': resolution, 'provocation': provocation, 'desarmement': desarmement,
    'charge_du_bouclier': charge_du_bouclier, 'tenacite': tenacite, 'peau_de_fer': peau_de_fer,
    'cri_de_ralliement': cri_de_ralliement, 'riposte_bouclier': riposte_bouclier, 'garde_de_fer': garde_de_fer,
    'bastion': bastion, 'heurt_de_bouclier': heurt_de_bouclier,
    'zone_de_feu': flamme, 'bombe_vivante': bombe_vivante, 'fardeau': fardeau, 'malediction': malediction,
}

if __name__ == '__main__':
    from illustrations_mage import ILLUSTRATIONS_MAGE
    ILLUSTRATIONS.update(ILLUSTRATIONS_MAGE)
    from illustrations_demoniste import ILLUSTRATIONS_DEMONISTE
    ILLUSTRATIONS.update(ILLUSTRATIONS_DEMONISTE)
    os.makedirs(DEST, exist_ok=True)
    for card_id, fn in ILLUSTRATIONS.items():
        fn().save(os.path.join(DEST, f'carte_{card_id}.png'))
    print(len(ILLUSTRATIONS), 'illustrations')
