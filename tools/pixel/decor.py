"""Le décor des écrans hors combat : le feu de camp et les icônes de ses choix.
Écrit dans public/assets/ : feu_camp.png (64 x 64), icone_repos.png et icone_enclume.png (32 x 32)."""
import os
from sprites import Sprite

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))


def feu():
    """Le feu de camp : pierres, bûches croisées et flammes."""
    s = Sprite(64, 64)
    # pierres en cercle
    for x0 in (6, 16, 28, 40, 50):
        s.ellipse(x0, 48, x0 + 9, 56, '#6E6258')
    # bûches croisées
    s.poly([(12, 52), (16, 46), (50, 40), (48, 46)], '#6A4426')
    s.poly([(14, 40), (18, 36), (52, 50), (48, 54)], '#5A3820')
    s.ellipse(48, 40, 54, 47, '#C9955A')  # bout de bûche
    # flammes
    s.poly([(18, 44), (20, 30), (26, 34), (28, 16), (34, 28), (38, 10), (42, 26), (46, 22), (48, 44)], '#E8461E', glow=True)
    s.poly([(22, 44), (25, 32), (30, 36), (34, 20), (38, 32), (42, 28), (44, 44)], '#F59A2E', glow=True)
    s.poly([(27, 44), (30, 36), (33, 38), (36, 28), (39, 38), (41, 44)], '#FFD45E', glow=True)
    s.dots([(22, 22), (44, 14), (30, 8), (48, 18), (16, 30)], '#FFB04A', glow=True)  # étincelles
    return s.render()

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
    feu().save(os.path.join(DEST, 'feu_camp.png'))
    couchage().save(os.path.join(DEST, 'icone_repos.png'))
    enclume().save(os.path.join(DEST, 'icone_enclume.png'))
    print('ok')
