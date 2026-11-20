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
from contextlib import contextmanager
from PIL import Image, ImageDraw

# Les images sont écrites dans assets/essais/, à la racine du dépôt.
OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'essais'))
os.makedirs(OUT, exist_ok=True)


def hexrgb(h):
    if isinstance(h, tuple):
        return h
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
        self.dx = self.dy = 0  # décalage des formes suivantes (pour animer)
        self.journal = []  # les formes dessinées, pour que l'animateur automatique les rejoue

    @contextmanager
    def bouge(self, dx=0, dy=0):
        """Décale toutes les formes dessinées dans le bloc (respiration, flottement…)."""
        self.dx += dx
        self.dy += dy
        try:
            yield
        finally:
            self.dx -= dx
            self.dy -= dy

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
                    X, Y = x + self.dx, y + self.dy
                    if 0 <= X < self.w and 0 <= Y < self.h:
                        self.part[Y][X] = pid

    def poly(self, pts, color, **kw):
        self.journal.append(('poly', pts, color, kw, {}, self.dx, self.dy))
        self._stamp(lambda d: d.polygon(pts, fill=1), color, **kw)

    def rect(self, x0, y0, x1, y1, color, **kw):
        self.journal.append(('rect', (x0, y0, x1, y1), color, kw, {}, self.dx, self.dy))
        self._stamp(lambda d: d.rectangle([x0, y0, x1, y1], fill=1), color, **kw)

    def ellipse(self, x0, y0, x1, y1, color, **kw):
        self.journal.append(('ellipse', (x0, y0, x1, y1), color, kw, {}, self.dx, self.dy))
        self._stamp(lambda d: d.ellipse([x0, y0, x1, y1], fill=1), color, **kw)

    def line(self, pts, color, width=1, **kw):
        self.journal.append(('line', pts, color, kw, {'width': width}, self.dx, self.dy))
        self._stamp(lambda d: d.line(pts, fill=1, width=width), color, **kw)

    def dots(self, pts, color, **kw):
        self.journal.append(('dots', pts, color, kw, {}, self.dx, self.dy))
        self._stamp(lambda d: [d.point(p, fill=1) for p in pts], color, **kw)

    def render(self):
        Sprite.dernier = self  # pour l'animateur automatique
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


def guerrier(f=0):
    """Le Guerrier. f = image de l'animation de repos (0 à 3) : il respire, sa cape flotte,
    un éclat remonte le long de l'épée."""
    s = Sprite(64, 64)
    b = RESPIRE[f]
    c = [0, -1, -2, -1][f]  # la cape flotte
    # cape : le haut suit le corps, le bas flotte
    s.poly([(22, 20 + b), (30, 18 + b), (29 + c, 56), (15 + c, 58)], '#7A1F1A')
    # jambes et bottes (elles ne bougent pas)
    s.rect(24, 47, 30, 57, '#5E6670')
    s.rect(23, 55, 31, 60, '#4A2E1E')
    s.rect(32, 47, 38, 57, '#7D8794')
    s.rect(32, 55, 40, 60, '#5A3822')
    with s.bouge(0, b):
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
        # plumet (il traîne un peu derrière le casque)
        with s.bouge([0, -1, -1, 0][f], [0, -1, -1, 0][f]):
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
        # éclat qui remonte le long de la lame
        if f > 0:
            x, y = [(48, 30), (51, 23), (54, 16)][f - 1]
            s.dots([(x - 2, y), (x + 2, y), (x, y - 2), (x, y + 2)], '#FFD45E', glow=True)
            s.dots([(x, y), (x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)], '#FFFFFF', glow=True)
    return s.render()


def mage(f=0):
    """Le Mage. f = image de l'animation (0 à 3) : il respire, sa cape flotte, la flamme de sa main danse,
    l'orbe du bâton pulse et des étincelles d'arcane tournent autour."""
    s = Sprite(64, 64)
    b = RESPIRE[f]
    c = [0, -1, -2, -1][f]  # la cape flotte
    g = [0, 1, 2, 1][f]  # l'orbe pulse
    # cape arrière
    s.poly([(20, 20 + b), (30, 18 + b), (28 + c, 58), (13 + c, 59)], '#2A2F6E')
    # robe (bas évasé : le haut suit le corps, l'ourlet ne bouge pas)
    s.poly([(24, 26 + b), (40, 26 + b), (46, 59), (18, 59)], '#3D56B0')
    s.poly([(30, 30 + b), (34, 30 + b), (37, 59), (27, 59)], '#2E4290')
    s.rect(18, 57, 46, 59, '#C9A8F0', shade=False)
    # bottes
    s.rect(22, 59, 29, 61, '#3A2A3E')
    s.rect(35, 59, 42, 61, '#4A3450')
    with s.bouge(0, b):
        # ceinture et gemme
        s.rect(23, 37, 41, 39, '#7A4E2A')
        s.ellipse(30, 36, 34, 40, ['#8FE0FF', '#B8ECFF', '#E6F8FF', '#B8ECFF'][f], glow=True)
        # buste et col
        s.poly([(24, 22), (40, 22), (41, 37), (23, 37)], '#4766C8')
        s.poly([(27, 22), (37, 22), (32, 29)], '#C9A8F0')
        # bras arrière (main qui lance)
        s.rect(18, 26, 23, 34, '#3D56B0')
        s.ellipse(15, 32, 22, 38, '#E8C6A4')
        # flamme dans la main arrière
        s.poly(danse([(13, 33), (15, 25), (18, 29), (20, 23), (22, 32)], f, 1.5), '#F59A2E', glow=True)
        s.poly(danse([(15, 33), (17, 28), (19, 31), (20, 33)], f + 1), '#FFD45E', glow=True)
        # visage et barbe
        s.ellipse(27, 12, 37, 23, '#E8C6A4')
        s.rect(30, 16, 32, 17, '#1A1210', shade=False)
        s.rect(34, 16, 36, 17, '#1A1210', shade=False)
        s.poly([(27, 19), (37, 19), (35, 27), (32, 30), (29, 27)], '#E6E6EE')
        # chapeau pointu (la pointe traîne un peu)
        s.poly([(22, 13), (42, 13), (40, 10), (24, 10)], '#2E4290')
        p = [0, -1, -1, 0][f]
        s.poly([(25, 11), (39, 11), (35 + p, 4), (30 + p, 0), (28, 6)], '#3D56B0')
        s.rect(24, 9, 40, 10, '#C9A8F0', shade=False)
        s.ellipse(31 + p, 4, 34 + p, 7, '#FFE27A', glow=True)
        # bras avant et main
        s.rect(39, 26, 44, 33, '#4766C8')
        s.ellipse(41, 31, 47, 37, '#E8C6A4')
        # bâton et son orbe qui pulse
        s.line([(44, 60), (47, 14)], '#6A4426', width=3)
        s.ellipse(43 - g // 2, 6 - g // 2, 53 + g // 2, 16 + g // 2, '#8FB8FF', glow=True)
        s.ellipse(45, 8, 51, 14, '#E6F2FF', glow=True)
        s.poly([(43, 16), (47, 12), (52, 16), (47, 19)], '#5A3A22')
        # étincelles d'arcane qui tournent autour de l'orbe
        tour = [(48, 1), (56, 6), (55, 16), (40, 12)]
        s.dots([tour[(k + f) % 4] for k in (0, 2)], '#C9E8FF', glow=True)
    return s.render()


def vulkhar(f=0):
    """Vulkhar. f = image de l'animation (0 à 3) : il monte et descend dans la lave,
    les flammes dansent, le cœur bat, les braises s'envolent."""
    s = Sprite(96, 96)
    b = RESPIRE[f]
    # bassin de lave
    s.ellipse(4, 78, 92, 96, '#E8742A', glow=True)
    s.ellipse(18, 82, 78, 94, '#FFC24B', glow=True)
    # bulles à la surface de la lave
    s.dots([[(14, 84), (60, 90)], [(30, 88), (74, 84)], [(46, 86), (20, 90)], [(64, 88), (36, 84)]][f], '#FFE27A', glow=True)
    with s.bouge(0, b):
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
        s.poly(danse([(15, 38), (18, 24), (23, 31), (27, 17), (31, 30), (35, 36)], f, 1.5), '#F59A2E', glow=True)
        s.poly(danse([(19, 38), (22, 30), (26, 26), (29, 33), (32, 38)], f + 1), '#FFD45E', glow=True)
        s.poly(danse([(61, 36), (65, 30), (69, 17), (73, 31), (78, 24), (81, 38)], f, 1.5), '#F59A2E', glow=True)
        s.poly(danse([(64, 38), (67, 33), (70, 26), (74, 30), (77, 38)], f + 1), '#FFD45E', glow=True)
        # fissures de lave et cœur
        s.line([(48, 63), (48, 82)], '#FF8A2A', glow=True)
        s.line([(34, 62), (46, 70)], '#FF8A2A', glow=True)
        s.line([(63, 62), (51, 72)], '#FF8A2A', glow=True)
        s.line([(28, 74), (40, 81)], '#FF8A2A', glow=True)
        s.line([(66, 74), (58, 81)], '#FF8A2A', glow=True)
        s.ellipse(42, 51, 54, 63, '#FF8A2A', glow=True)
        g = [0, 1, 2, 1][f]
        s.ellipse(45 - g, 54 - g, 51 + g, 60 + g, '#FFE27A', glow=True)
        # couronne de flammes (derrière la tête)
        s.poly(danse([(35, 22), (38, 8), (43, 15), (48, 0), (53, 15), (58, 8), (61, 22)], f, 1.5), '#F59A2E', glow=True)
        s.poly(danse([(40, 22), (44, 12), (48, 6), (52, 12), (56, 22)], f + 1), '#FFD45E', glow=True)
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
    # braises qui s'envolent
    braises = [(10, 20), (16, 12), (30, 44), (66, 60), (88, 52), (6, 58), (60, 4), (34, 2), (92, 30)]
    s.dots([(x + (k + f) % 2, y - 3 * ((k + f) % 4)) for k, (x, y) in enumerate(braises)], '#FFC24B', glow=True)
    return s.render()


# Animations « marquées », comme le feu de camp : 4 images en boucle.
RESPIRE = [0, 1, 2, 1]  # le haut du corps descend puis remonte (en pixels)
FLAMME = [0, -2, 1, -1]  # les pointes de flammes montent et descendent


def danse(pts, f, amp=1):
    """Fait danser les pointes d'une flamme : chaque pointe (point plus haut que ses voisins)
    monte ou descend selon l'image f, chacune avec son propre temps."""
    n = len(pts)
    out = []
    for i, (x, y) in enumerate(pts):
        prev, nxt = pts[i - 1][1], pts[(i + 1) % n][1]
        if y < prev and y < nxt:
            y += round(FLAMME[(f + i) % 4] * amp)
        out.append((x, y))
    return out


def _boite(kind, geom):
    """Le rectangle (x0, y0, x1, y1) qui contient une forme du journal."""
    if kind in ('rect', 'ellipse'):
        x0, y0, x1, y1 = geom
        return min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)
    xs = [p[0] for p in geom]
    ys = [p[1] for p in geom]
    return min(xs), min(ys), max(xs), max(ys)


def anime_auto(fn, profil='sol'):
    """Anime un sprite déjà dessiné, sans le redessiner : rejoue ses formes image par image.
    - profil 'sol' : le haut du corps respire (descend de 2 pixels), le bas (pattes, socle) reste au sol ;
      'vol' : tout le sprite flotte ; 'fixe' : rien ne bouge (un œuf, un objet).
    - Dans tous les cas, les formes lumineuses vivent : les pointes des flammes dansent,
      les grandes lueurs pulsent, les fissures et les petits éclats brillent tour à tour.
    Renvoie une fonction f -> image, à donner à planche() ou apercu_gif()."""
    fn()
    src = Sprite.dernier
    journal = list(src.journal)
    boites = [_boite(k, g) for k, g, *_ in journal]
    haut = min(b[1] for b in boites)
    sol = max(b[3] for b in boites)
    seuil = sol - 0.28 * (sol - haut)  # en dessous : les pattes, qui ne bougent pas

    def image(f):
        s = Sprite(src.w, src.h)
        for i, ((kind, geom, color, kw, extra, ox, oy), (x0, y0, x1, y1)) in enumerate(zip(journal, boites)):
            if profil == 'vol':
                dy = [1, 0, -1, 0][f]
            elif profil == 'sol':
                dy = 0 if y0 >= seuil else RESPIRE[f]
            else:
                dy = 0
            phase = (f + i) % 4
            if kw.get('glow'):
                if kind == 'poly' and y1 - y0 >= 4:
                    geom = danse(geom, f + i, 1.5 if y1 - y0 >= 10 else 1)
                elif kind == 'ellipse' and min(x1 - x0, y1 - y0) >= 6:
                    g = [0, 1, 1, 0][phase]
                    geom = (x0 - g, y0 - g, x1 + g, y1 + g)
                elif kind in ('line', 'dots', 'rect', 'ellipse') and phase == 2:
                    color = shift(hexrgb(color), 0.14, 0)
            with s.bouge(ox, oy + dy):
                if kind == 'rect':
                    s.rect(*geom, color, **kw)
                elif kind == 'ellipse':
                    s.ellipse(*geom, color, **kw)
                elif kind == 'line':
                    s.line(geom, color, **extra, **kw)
                else:
                    getattr(s, kind)(geom, color, **kw)
        return s.render()
    return image


def planche(fn, n, miroir=False):
    """Les n images d'une animation côte à côte (fn(f) dessine l'image f), jouées en boucle par le jeu."""
    imgs = [fn(f) for f in range(n)]
    if miroir:
        imgs = [i.transpose(Image.FLIP_LEFT_RIGHT) for i in imgs]
    w, h = imgs[0].size
    sheet = Image.new('RGBA', (w * n, h), (0, 0, 0, 0))
    for k, img in enumerate(imgs):
        sheet.paste(img, (w * k, 0))
    return sheet


def apercu_gif(fn, n, nom, echelle, duree=200, miroir=False):
    """Un GIF agrandi de l'animation, dans assets/essais/, pour la valider sans lancer le jeu."""
    imgs = []
    for f in range(n):
        img = fn(f)
        if miroir:
            img = img.transpose(Image.FLIP_LEFT_RIGHT)
        fond = Image.new('RGBA', img.size, (23, 17, 13, 255))
        fond.alpha_composite(img)
        imgs.append(fond.convert('RGB').resize((img.width * echelle, img.height * echelle), Image.NEAREST))
    imgs[0].save(os.path.join(OUT, f'{nom}_anime.gif'), save_all=True, append_images=imgs[1:], duration=duree, loop=0)


def save(img, name, scale):
    img.save(os.path.join(OUT, f'{name}.png'))
    big = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    big.save(os.path.join(OUT, f'{name}_x{scale}.png'))


if __name__ == '__main__':
    save(guerrier(), 'guerrier', 6)
    save(vulkhar(), 'vulkhar', 5)
    print('ok')
