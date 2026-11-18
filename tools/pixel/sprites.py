"""Génère deux sprites en pixel art « moderne » pour Wipe & Loot :
le Guerrier (64x64) et Vulkhar (96x96).
Chaque sprite est une pile de formes colorées. Le script ajoute ensuite :
- un reflet sur les bords haut-gauche de chaque forme (lumière venant d'en haut à gauche),
- une ombre sur les bords bas-droite,
- un contour coloré (« sel-out ») autour de la silhouette,
- des éléments lumineux (feu, lave) sans contour ni ombre.
"""
import colorsys
import os
from PIL import Image, ImageDraw

# Les images sont écrites dans assets/essais/, à la racine du dépôt.
OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'essais'))
os.makedirs(OUT, exist_ok=True)


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def shift(rgb, dl, dh):
    r, g, b = [c / 255 for c in rgb]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = max(0, min(1, l + dl))
    h = (h + dh) % 1
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return (int(r * 255), int(g * 255), int(b * 255))


class Sprite:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.part = [[None] * w for _ in range(h)]
        self.parts = []  # (couleur, lumineux, ombré)

    def _add(self, color, glow, shade):
        self.parts.append((hexrgb(color), glow, shade))
        return len(self.parts) - 1

    def _stamp(self, draw_fn, color, glow=False, shade=True):
        pid = self._add(color, glow, shade)
        mask = Image.new('1', (self.w, self.h), 0)
        d = ImageDraw.Draw(mask)
        draw_fn(d)
        px = mask.load()
        for y in range(self.h):
            for x in range(self.w):
                if px[x, y]:
                    self.part[y][x] = pid

    def poly(self, pts, color, **kw):
        self._stamp(lambda d: d.polygon(pts, fill=1), color, **kw)

    def rect(self, x0, y0, x1, y1, color, **kw):
        self._stamp(lambda d: d.rectangle([x0, y0, x1, y1], fill=1), color, **kw)

    def ellipse(self, x0, y0, x1, y1, color, **kw):
        self._stamp(lambda d: d.ellipse([x0, y0, x1, y1], fill=1), color, **kw)

    def line(self, pts, color, width=1, **kw):
        self._stamp(lambda d: d.line(pts, fill=1, width=width), color, **kw)

    def dots(self, pts, color, **kw):
        self._stamp(lambda d: [d.point(p, fill=1) for p in pts], color, **kw)

    def render(self):
        img = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        px = img.load()
        P = self.part

        def get(x, y):
            if 0 <= x < self.w and 0 <= y < self.h:
                return P[y][x]
            return None

        for y in range(self.h):
            for x in range(self.w):
                pid = P[y][x]
                if pid is None:
                    continue
                base, glow, shade = self.parts[pid]
                col = base
                if not glow and shade:
                    up_left = get(x - 1, y) != pid or get(x, y - 1) != pid
                    down_right = get(x + 1, y) != pid or get(x, y + 1) != pid
                    far_dr = get(x + 2, y) != pid or get(x, y + 2) != pid
                    if up_left and not down_right:
                        col = shift(base, 0.12, -0.01)
                    elif down_right:
                        col = shift(base, -0.12, 0.02)
                    elif far_dr:
                        col = shift(base, -0.05, 0.01)
                px[x, y] = col + (255,)

        # contour coloré autour de la silhouette (pas autour des éléments lumineux)
        outline = {}
        for y in range(self.h):
            for x in range(self.w):
                if P[y][x] is not None:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    n = get(x + dx, y + dy)
                    if n is not None and not self.parts[n][1]:
                        base = self.parts[n][0]
                        dark = shift(base, -0.28, 0.03)
                        dark = tuple(int(c * 0.55 + t * 0.45) for c, t in zip(dark, (22, 12, 10)))
                        outline[(x, y)] = dark
                        break
        for (x, y), c in outline.items():
            px[x, y] = c + (255,)
        return img


def guerrier():
    s = Sprite(64, 64)
    # cape
    s.poly([(22, 20), (30, 18), (29, 56), (15, 58)], '#7A1F1A')
    # jambes et bottes
    s.rect(24, 47, 30, 57, '#5E6670')
    s.rect(23, 55, 31, 60, '#4A2E1E')
    s.rect(32, 47, 38, 57, '#7D8794')
    s.rect(32, 55, 40, 60, '#5A3822')
    # jupe du tabard
    s.poly([(24, 40), (40, 40), (42, 51), (22, 51)], '#A8322A')
    s.rect(22, 50, 42, 51, '#D9A441', shade=False)
    # torse en plaques
    s.poly([(24, 24), (40, 24), (42, 42), (22, 42)], '#8C96A3')
    s.rect(29, 26, 35, 41, '#B8382E')
    s.poly([(32, 29), (35, 32), (32, 35), (29, 32)], '#E6B84A', shade=False)
    # ceinture
    s.rect(22, 40, 42, 42, '#5A3822')
    s.rect(31, 40, 33, 42, '#E6B84A', shade=False)
    # épaulière arrière
    s.ellipse(19, 22, 28, 29, '#7D8794')
    # bouclier
    s.poly([(9, 25), (25, 25), (25, 41), (17, 49), (9, 41)], '#D9A441')
    s.poly([(11, 27), (23, 27), (23, 40), (17, 46), (11, 40)], '#9E2B24')
    s.ellipse(14, 32, 20, 38, '#C9D2DE')
    # plumet
    s.poly([(29, 11), (31, 5), (35, 3), (37, 6), (34, 11)], '#C23A2E')
    s.poly([(29, 9), (24, 7), (21, 10), (27, 13)], '#A8322A')
    # casque
    s.ellipse(26, 10, 38, 24, '#9AA4B1')
    s.rect(31, 16, 38, 17, '#1A1210', shade=False)
    s.rect(26, 20, 38, 24, '#7D8794')
    # épaulière avant
    s.ellipse(35, 21, 45, 30, '#A9B3C0')
    # bras avant et gantelet
    s.rect(38, 28, 43, 35, '#8C96A3')
    s.ellipse(40, 33, 46, 39, '#6E7884')
    # épée levée
    s.poly([(44, 34), (57, 8), (59, 9), (46, 36)], '#DCE3EC')
    s.poly([(57, 8), (60, 3), (59, 9)], '#F4F7FB')
    s.poly([(39, 34), (49, 38), (48, 40), (38, 36)], '#E6B84A')
    s.rect(42, 38, 44, 42, '#5A3822')
    s.ellipse(41, 42, 45, 45, '#E6B84A')
    return s.render()


def vulkhar():
    s = Sprite(96, 96)
    # bassin de lave
    s.ellipse(4, 78, 92, 96, '#E8742A', glow=True)
    s.ellipse(18, 82, 78, 94, '#FFC24B', glow=True)
    # marteau (manche puis tête)
    s.line([(84, 46), (84, 10)], '#2A1C18', width=3)
    s.poly([(68, 2), (95, 0), (95, 16), (68, 14)], '#5A4038')
    s.poly([(64, 4), (68, 3), (68, 13), (64, 12)], '#2A1C18')
    s.line([(68, 14), (95, 16)], '#FF8A2A', glow=True)
    s.line([(75, 4), (77, 12)], '#FF8A2A', glow=True)
    s.line([(87, 3), (85, 13)], '#FF8A2A', glow=True)
    # corps qui émerge de la lave
    s.poly([(26, 40), (70, 40), (76, 84), (20, 84)], '#3A2A26')
    s.poly([(30, 44), (47, 46), (46, 62), (28, 60)], '#4A3630')
    s.poly([(50, 46), (66, 44), (68, 60), (50, 62)], '#4A3630')
    # bras gauche (côté spectateur), poing dans la lave
    s.poly([(14, 46), (25, 46), (23, 72), (12, 72)], '#3A2A26')
    s.ellipse(7, 66, 25, 82, '#4E3A33')
    # bras droit qui lève le marteau
    s.poly([(70, 46), (81, 48), (87, 32), (80, 28)], '#3A2A26')
    s.ellipse(79, 24, 90, 34, '#4E3A33')
    # épaules de roche
    s.ellipse(13, 33, 37, 53, '#4E3A33')
    s.ellipse(59, 33, 83, 53, '#4E3A33')
    # flammes des épaules
    s.poly([(15, 38), (18, 24), (23, 31), (27, 17), (31, 30), (35, 36)], '#F59A2E', glow=True)
    s.poly([(19, 38), (22, 30), (26, 26), (29, 33), (32, 38)], '#FFD45E', glow=True)
    s.poly([(61, 36), (65, 30), (69, 17), (73, 31), (78, 24), (81, 38)], '#F59A2E', glow=True)
    s.poly([(64, 38), (67, 33), (70, 26), (74, 30), (77, 38)], '#FFD45E', glow=True)
    # fissures de lave et cœur
    s.line([(48, 63), (48, 82)], '#FF8A2A', glow=True)
    s.line([(34, 62), (46, 70)], '#FF8A2A', glow=True)
    s.line([(63, 62), (51, 72)], '#FF8A2A', glow=True)
    s.line([(28, 74), (40, 81)], '#FF8A2A', glow=True)
    s.line([(66, 74), (58, 81)], '#FF8A2A', glow=True)
    s.ellipse(42, 51, 54, 63, '#FF8A2A', glow=True)
    s.ellipse(45, 54, 51, 60, '#FFE27A', glow=True)
    # couronne de flammes (derrière la tête)
    s.poly([(35, 22), (38, 8), (43, 15), (48, 0), (53, 15), (58, 8), (61, 22)], '#F59A2E', glow=True)
    s.poly([(40, 22), (44, 12), (48, 6), (52, 12), (56, 22)], '#FFD45E', glow=True)
    # cornes recourbées
    s.poly([(40, 21), (31, 15), (25, 6), (24, 1), (29, 3), (34, 10), (44, 17)], '#2A1C18')
    s.poly([(56, 21), (65, 15), (71, 6), (72, 1), (67, 3), (62, 10), (52, 17)], '#2A1C18')
    # tête anguleuse, arcade et mâchoire
    s.poly([(36, 24), (40, 16), (56, 16), (60, 24), (59, 37), (53, 45), (43, 45), (37, 37)], '#4A3630')
    s.poly([(37, 24), (48, 28), (59, 24), (59, 27), (48, 31), (37, 27)], '#33241F')
    s.poly([(40, 36), (56, 36), (53, 45), (43, 45)], '#3A2A26')
    # yeux en biais et gueule incandescents
    s.poly([(40, 28), (46, 30), (46, 32), (40, 30)], '#FFE27A', glow=True)
    s.poly([(56, 28), (50, 30), (50, 32), (56, 30)], '#FFE27A', glow=True)
    s.poly([(43, 38), (53, 38), (51, 42), (45, 42)], '#FF8A2A', glow=True)
    s.dots([(45, 38), (47, 38), (49, 38), (51, 38)], '#FFE27A', glow=True)
    # braises
    s.dots([(10, 20), (16, 12), (30, 44), (66, 60), (88, 52), (6, 58), (60, 4), (34, 2), (92, 30)], '#FFC24B', glow=True)
    return s.render()


def save(img, name, scale):
    img.save(os.path.join(OUT, f'{name}.png'))
    big = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    big.save(os.path.join(OUT, f'{name}_x{scale}.png'))


if __name__ == '__main__':
    save(guerrier(), 'guerrier', 6)
    save(vulkhar(), 'vulkhar', 5)
    print('ok')
