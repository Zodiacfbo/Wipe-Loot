"""Le décor des écrans hors combat : le feu de camp et les icônes de ses choix.
Écrit dans public/assets/ : feu_camp.png (4 images de 64 x 64 côte à côte), icone_repos.png et icone_enclume.png (32 x 32)."""
import os
from PIL import Image
from sprites import Sprite

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))


# Les 4 images du feu animé : hauteur des pointes de flammes (plus petit = plus haut) et étincelles.
FLAMMES = [
    dict(o=(30, 16, 10, 22), m=(32, 20, 28), i=(36, 28), sp=[(22, 22), (44, 14), (30, 8)]),
    dict(o=(28, 19, 13, 20), m=(30, 23, 26), i=(38, 30), sp=[(24, 16), (42, 8), (32, 4)]),
    dict(o=(32, 14, 8, 25), m=(34, 18, 30), i=(35, 27), sp=[(26, 10), (40, 4), (46, 20)]),
    dict(o=(29, 18, 12, 21), m=(31, 21, 27), i=(37, 29), sp=[(20, 26), (46, 12), (34, 2)]),
]


def feu(f):
    """Une image du feu de camp : pierres, bûches croisées et flammes."""
    s = Sprite(64, 64)
    for x0 in (6, 16, 28, 40, 50):  # pierres en cercle
        s.ellipse(x0, 48, x0 + 9, 56, '#6E6258')
    s.poly([(12, 52), (16, 46), (50, 40), (48, 46)], '#6A4426')  # bûches croisées
    s.poly([(14, 40), (18, 36), (52, 50), (48, 54)], '#5A3820')
    s.ellipse(48, 40, 54, 47, '#C9955A')  # bout de bûche
    a, b, c, d = f['o']
    s.poly([(18, 44), (20, a), (26, 34), (28, b), (34, 28), (38, c), (42, 26), (46, d), (48, 44)], '#E8461E', glow=True)
    m1, m2, m3 = f['m']
    s.poly([(22, 44), (25, m1), (30, 36), (34, m2), (38, 32), (42, m3), (44, 44)], '#F59A2E', glow=True)
    i1, i2 = f['i']
    s.poly([(27, 44), (30, i1), (33, 38), (36, i2), (39, 38), (41, 44)], '#FFD45E', glow=True)
    s.dots(f['sp'], '#FFB04A', glow=True)  # étincelles
    return s.render()


def feu_anime():
    """Les 4 images du feu côte à côte (256 x 64), jouées en boucle par le jeu."""
    sheet = Image.new('RGBA', (64 * len(FLAMMES), 64), (0, 0, 0, 0))
    for k, f in enumerate(FLAMMES):
        sheet.paste(feu(f), (64 * k, 0))
    return sheet


def enclume():
    """L'enclume du maître de classe (Améliorer une carte)."""
    s = Sprite(32, 32)
    s.poly([(4, 10), (26, 10), (30, 13), (22, 15), (8, 15)], '#8A93A0')
    s.rect(11, 15, 20, 21, '#6A7280')
    s.rect(7, 21, 24, 25, '#5A616C')
    s.line([(18, 4), (24, 9)], '#C9955A', width=2)
    s.rect(14, 2, 20, 6, '#9AA3B0')
    s.dots([(6, 7), (27, 6), (9, 4)], '#FFD45E', glow=True)
    return s.render()

def couchage():
    """Le sac de couchage (Se reposer)."""
    s = Sprite(32, 32)
    s.ellipse(2, 16, 30, 28, '#7A4A2A')
    s.rect(4, 17, 28, 26, '#8A3A2E')
    s.ellipse(2, 15, 12, 24, '#C9B28A')  # oreiller
    s.dots([(22, 8), (25, 5), (28, 3)], '#9CC8F0', glow=True)  # zzz
    return s.render()


if __name__ == '__main__':
    os.makedirs(DEST, exist_ok=True)
    feu_anime().save(os.path.join(DEST, 'feu_camp.png'))
    couchage().save(os.path.join(DEST, 'icone_repos.png'))
    enclume().save(os.path.join(DEST, 'icone_enclume.png'))
    print('ok')
