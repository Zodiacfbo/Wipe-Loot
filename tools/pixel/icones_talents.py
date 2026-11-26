"""Les icônes de talents qui n'ont pas de carte proche (32 x 32 pixels, même style que les illustrations).
Exporte public/assets/talent_<id>.png. Les autres talents reprennent l'illustration d'une carte
(voir src/engine/talent_icons.ts)."""
import os
from illustrations import ACIER, CUIR, DEST, OR, arc, nouveau, vitesse
from illustrations_voleur import CAPE, OMBRE, OMBRE_C, OMBRE_F, capuche, fumee

LUM = '#FFE27A'


def emplacement():
    """Le 4e emplacement de la barre de sorts : trois cases pleines et une nouvelle case dorée."""
    s = nouveau()
    for i in range(3):
        x = 1 + i * 7
        s.rect(x, 9, x + 5, 22, '#6A4F3A')
        s.rect(x + 1, 10, x + 4, 21, '#2B211A')
    s.rect(22, 7, 31, 24, OR, glow=True)
    s.rect(23, 8, 30, 23, '#3A2E17')
    s.rect(26, 12, 27, 19, LUM, glow=True)
    s.rect(23, 15, 30, 16, LUM, glow=True)
    return s.render()


def coup_de_pied():
    """Une botte qui frappe, avec des traits de vitesse et un éclat d'impact."""
    s = nouveau()
    s.poly([(6, 8), (13, 8), (14, 19), (24, 21), (26, 26), (8, 26)], CUIR)
    s.poly([(6, 8), (13, 8), (13, 11), (6, 11)], '#7A5236')
    s.rect(8, 25, 26, 27, '#2A1C18')
    s.dots([(28, 18), (30, 22), (29, 27), (27, 15)], LUM, glow=True)
    vitesse(s, [(1, 14, 4, 14), (1, 18, 4, 18), (1, 22, 5, 22)], ACIER)
    return s.render()


def silence():
    """Une bouche barrée : l'Interruption du Prêtre (ombre et lumière)."""
    s = nouveau()
    s.ellipse(4, 4, 28, 28, '#3A2A4A')
    s.ellipse(9, 13, 23, 20, '#C87A8A')
    s.rect(10, 16, 22, 17, '#5A2A3A')
    arc(s, 16, 16, 13, 0, 360, '#C8B8F0', width=2)
    s.line([(7, 25), (25, 7)], '#C8B8F0', width=2, glow=True)
    return s.render()


def adrenaline():
    """Un cœur qui bat, traversé d'un éclair : +2 énergie."""
    s = nouveau()
    s.ellipse(5, 7, 16, 18, '#C8303A')
    s.ellipse(14, 7, 25, 18, '#C8303A')
    s.poly([(5, 14), (25, 14), (15, 27)], '#C8303A')
    s.ellipse(8, 9, 12, 13, '#F07A7A')
    s.poly([(19, 2), (12, 15), (17, 15), (13, 29), (24, 12), (18, 12), (22, 2)], LUM, glow=True)
    return s.render()


def ombres_profondes():
    """Une silhouette encapuchonnée qui se fond dans une fumée d'ombre (le Camouflage qui dure)."""
    s = nouveau()
    s.ellipse(1, 1, 31, 31, OMBRE_F)
    fumee(s, 16, 24, 9, '#4A3A6A')
    capuche(s, 16, 12, OMBRE_C)
    arc(s, 16, 16, 14, 200, 340, OMBRE, width=2)
    s.dots([(5, 8), (27, 9), (4, 20), (28, 21)], OMBRE_C, glow=True)
    return s.render()


ICONES_TALENTS = {
    'emplacement': emplacement,
    'coup_de_pied': coup_de_pied,
    'silence': silence,
    'adrenaline': adrenaline,
    'ombres_profondes': ombres_profondes,
}

if __name__ == '__main__':
    os.makedirs(DEST, exist_ok=True)
    for icon_id, fn in ICONES_TALENTS.items():
        fn().save(os.path.join(DEST, f'talent_{icon_id}.png'))
    print(len(ICONES_TALENTS), 'icônes de talents')
