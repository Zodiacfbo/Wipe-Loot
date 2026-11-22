"""Le Chaman (il regarde vers la droite, comme le héros), 64 x 64.
f : il respire, sa cape de fourrure flotte, et la foudre crépite autour de son marteau."""
import os
from sprites import RESPIRE, Sprite

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))
BLEU, BLEU_F = '#3A6EA8', '#22426A'
FOURRURE, FOURRURE_C = '#7A6A5A', '#B8A890'
CUIR, CUIR_F = '#7A5434', '#4A321E'
FOUDRE, FOUDRE_C = '#8FD8FF', '#FFFFFF'


def chaman(f=0):
    s = Sprite(64, 64)
    b = RESPIRE[f]
    c = [0, -1, -2, -1][f]
    # cape de fourrure
    s.poly([(20, 20 + b), (42, 20 + b), (46 + c, 56), (16 + c, 58)], FOURRURE)
    # jambes et bottes
    s.rect(24, 46, 30, 57, CUIR)
    s.rect(34, 46, 40, 57, '#8A6444')
    s.rect(23, 55, 31, 60, CUIR_F)
    s.rect(33, 55, 41, 60, CUIR_F)
    with s.bouge(0, b):
        # tunique bleue, ceinture et totem miniature à la ceinture
        s.poly([(24, 24), (40, 24), (42, 46), (22, 46)], BLEU)
        s.line([(32, 25), (32, 45)], BLEU_F)
        s.rect(22, 40, 42, 42, CUIR_F)
        s.rect(24, 42, 27, 48, '#C8A070')
        s.dots([(25, 44)], '#E8402A', glow=True)
        # col de fourrure et tête
        s.ellipse(20, 18, 44, 28, FOURRURE_C)
        s.ellipse(26, 7, 38, 21, '#C8A078')
        s.rect(29, 13, 30, 14, '#1A2A3A', shade=False)
        s.rect(34, 13, 35, 14, '#1A2A3A', shade=False)
        s.line([(28, 17), (31, 18)], '#3A6EA8')  # peinture de guerre
        s.line([(33, 18), (36, 17)], '#3A6EA8')
        s.poly([(28, 19), (36, 19), (34, 24), (30, 24)], '#5A3A2A')  # barbe tressée
        # coiffe : tête de loup
        s.ellipse(25, 3, 39, 12, '#8A8E96')
        s.poly([(26, 6), (27, 0), (30, 5)], '#8A8E96')
        s.poly([(34, 5), (37, 0), (38, 6)], '#8A8E96')
        # bras et marteau de pierre
        s.rect(40, 27, 46, 34, BLEU)
        s.line([(44, 40), (52, 12)], CUIR, width=2)
        s.poly([(46, 6), (58, 9), (56, 17), (44, 14)], '#8A8A94')
        s.line([(47, 8), (56, 11)], '#B8B8C4')
        # la foudre qui crépite autour de la tête du marteau
        arcs = [[(58, 6), (61, 3), (60, 1)], [(44, 7), (41, 4), (43, 1)], [(59, 16), (62, 19), (60, 22)], [(45, 16), (42, 19), (44, 22)]]
        for k in range(2):
            s.line(arcs[(f + k * 2) % 4], FOUDRE, glow=True)
        s.dots([(51, 4 - f % 2)], FOUDRE_C, glow=True)
    return s.render()


if __name__ == '__main__':
    chaman().save(os.path.join(DEST, 'chaman.png'))
    print('ok')
