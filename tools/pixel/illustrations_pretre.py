"""Les illustrations des cartes du Prêtre (32 x 32 pixels).
Palette : l'or et le blanc de la Lumière, le bleu pâle de l'Égide, le violet de l'Ombre."""
import math
from illustrations import OR, arc, bouclier, coeur, crane, eclat, etoile, flamme_de, goutte_de, nouveau, ondes, vitesse
from illustrations_mage import livre, main, orbe, projectile, rune

LUM, LUM_C, LUM_F = '#FFE27A', '#FFFFFF', '#D8B04A'
EGIDE, EGIDE_C = '#8FC8FF', '#E8F4FF'
OMBRE, OMBRE_C, OMBRE_F = '#8A4AD8', '#D8B8FF', '#3E2260'
SOIN = '#7ED87A'


def croix(s, cx, cy, r, couleur=LUM, glow=True):
    s.rect(cx - 1, cy - r, cx + 1, cy + r, couleur, glow=glow)
    s.rect(cx - r * 0.7, cy - r * 0.4, cx + r * 0.7, cy - r * 0.4 + 2, couleur, glow=glow)


def egide(s, cx, cy, r, n=1):
    for i in range(n):
        arc(s, cx, cy, r - i * 3, 0, 360, EGIDE if i == 0 else EGIDE_C, width=2)


def rayons(s, cx, cy, r, couleur=LUM, n=8):
    for i in range(n):
        a = i * math.pi * 2 / n
        s.line([(cx + math.cos(a) * r * 0.5, cy + math.sin(a) * r * 0.5), (cx + math.cos(a) * r, cy + math.sin(a) * r)], couleur, glow=True)


def oeil(s, cx, cy, couleur=OMBRE):
    s.ellipse(cx - 8, cy - 4, cx + 8, cy + 4, '#1E1424')
    s.ellipse(cx - 3, cy - 3, cx + 3, cy + 3, couleur, glow=True)
    s.ellipse(cx - 1, cy - 1, cx + 1, cy + 1, OMBRE_C, glow=True)


def soin(s, cx, cy, r=6):
    s.rect(cx - 1, cy - r, cx + 1, cy + r, SOIN, glow=True)
    s.rect(cx - r, cy - 1, cx + r, cy + 1, SOIN, glow=True)


# ---------- Départ et tronc commun ----------

def priere_garde():
    s = nouveau()
    bouclier(s, 7, 4, 25, 28, bord=LUM_F, fond='#E8E4DC', centre=False)
    croix(s, 16, 15, 6, LUM_F, glow=False)
    return s.render()


def chatiment():
    s = nouveau()
    projectile(s, 4, 27, 22, 9, LUM, LUM_C, r=5)
    rayons(s, 22, 9, 9)
    return s.render()


def soins_rapides():
    s = nouveau()
    soin(s, 16, 16, 9)
    s.dots([(6, 6), (26, 8), (8, 26)], LUM_C, glow=True)
    return s.render()


def grace():
    s = nouveau()
    for i, x in enumerate((6, 14, 22)):
        soin(s, x + 3, 22 - i * 6, 3)
    arc(s, 16, 28, 14, 200, 340, SOIN)
    return s.render()


def dissipation_magie():
    s = nouveau()
    rune(s, 16, 16, 12, OMBRE)
    s.line([(4, 4), (28, 28)], LUM, width=2, glow=True)
    return s.render()


def purification():
    s = nouveau()
    goutte_de(s, 16, 4, 20, '#8FD8FF')
    rayons(s, 16, 16, 15, LUM, 6)
    return s.render()


def nova_sacree():
    s = nouveau()
    eclat(s, 16, 16, 13, LUM, LUM_C)
    croix(s, 16, 16, 4, LUM_F, glow=False)
    return s.render()


def effacement():
    s = nouveau()
    s.ellipse(8, 6, 24, 22, '#E8E4DC', glow=True)
    s.poly([(8, 14), (24, 14), (26, 30), (6, 30)], '#E8E4DC', glow=True)
    s.dots([(4, 4), (28, 6), (26, 26)], LUM_C, glow=True)
    return s.render()


def feu_interieur():
    s = nouveau()
    flamme_de(s, 8, 4, 16, 24, LUM_F, LUM, LUM_C)
    return s.render()


def inspiration_divine():
    s = nouveau()
    livre(s, 6, 14, LUM_F, '#FFF8E8')
    rayons(s, 16, 8, 8)
    return s.render()


def benediction_vigueur():
    s = nouveau()
    coeur(s, 6, 8, 20, '#D8303A')
    croix(s, 16, 14, 4, LUM_C)
    return s.render()


# ---------- Discipline ----------

def egide_renforcee():
    s = nouveau()
    egide(s, 16, 16, 13, 2)
    croix(s, 16, 16, 5)
    return s.render()


def penitence():
    s = nouveau()
    projectile(s, 3, 22, 20, 8, LUM, LUM_C, r=3)
    projectile(s, 6, 30, 26, 18, LUM, LUM_C, r=3)
    arc(s, 16, 16, 14, 180, 270, EGIDE, width=2)
    return s.render()


def bastion_sacre():
    s = nouveau()
    egide(s, 16, 16, 14, 3)
    s.ellipse(12, 12, 20, 20, EGIDE_C, glow=True)
    return s.render()


def sacrifice_soi():
    s = nouveau()
    goutte_de(s, 9, 4, 12, '#B8202A')
    egide(s, 20, 20, 9)
    return s.render()


def priere_protection():
    s = nouveau()
    bouclier(s, 8, 6, 24, 28, bord=LUM_F, fond='#E8E4DC', centre=False)
    egide(s, 16, 16, 15)
    return s.render()


def discernement():
    s = nouveau()
    oeil(s, 16, 16, LUM_F)
    rayons(s, 16, 16, 15, LUM, 8)
    return s.render()


def eclat_foi():
    s = nouveau()
    egide(s, 12, 18, 9)
    projectile(s, 12, 18, 27, 5, LUM, LUM_C, r=3)
    return s.render()


def rayon_lumiere():
    s = nouveau()
    s.line([(16, 0), (16, 30)], LUM, width=7, glow=True)
    s.line([(16, 0), (16, 30)], LUM_C, width=2, glow=True)
    egide(s, 16, 26, 7)
    return s.render()


def meditation_sacree():
    s = nouveau()
    s.ellipse(10, 8, 22, 18, '#E8C6A4')
    s.poly([(6, 30), (26, 30), (22, 18), (10, 18)], '#E8E4DC')
    arc(s, 16, 10, 9, 190, 350, LUM, width=2)
    return s.render()


def lumiere_persistante():
    s = nouveau()
    for r in (5, 9, 13):
        arc(s, 16, 16, r, 0, 360, LUM if r != 9 else EGIDE)
    return s.render()


def clarte():
    s = nouveau()
    etoile(s, 16, 16, 12, LUM_C)
    egide(s, 16, 16, 14)
    return s.render()


def expiation():
    s = nouveau()
    projectile(s, 4, 26, 18, 12, LUM, LUM_C, r=3)
    soin(s, 24, 8, 5)
    return s.render()


def ame_inebranlable():
    s = nouveau()
    egide(s, 16, 16, 15, 3)
    croix(s, 16, 16, 7, LUM)
    return s.render()


def egide_anciens():
    s = nouveau()
    bouclier(s, 5, 3, 27, 30, bord=LUM, fond=EGIDE, centre=False)
    rune(s, 16, 14, 7, LUM_F)
    return s.render()


# ---------- Sacré ----------

def chatiment_ardent():
    s = nouveau()
    projectile(s, 4, 27, 20, 11, LUM, LUM_C, r=4)
    flamme_de(s, 16, 2, 12, 14, LUM_F, LUM, LUM_C)
    return s.render()


def feu_sacre():
    s = nouveau()
    flamme_de(s, 6, 4, 20, 26, '#E8A02A', LUM, LUM_C)
    croix(s, 16, 20, 3, LUM_F, glow=False)
    return s.render()


def soins_superieurs():
    s = nouveau()
    soin(s, 16, 16, 12)
    arc(s, 16, 16, 14, 0, 360, SOIN)
    return s.render()


def cercle_soins():
    s = nouveau()
    for a in range(0, 360, 90):
        soin(s, 16 + math.cos(math.radians(a)) * 9, 16 + math.sin(math.radians(a)) * 9, 3)
    arc(s, 16, 16, 13, 0, 360, SOIN)
    return s.render()


def grace_divine():
    s = nouveau()
    main(s, 12, 18, '#E8C6A4', '#E8E4DC')
    etoile(s, 16, 8, 6, LUM)
    return s.render()


def colere_divine():
    s = nouveau()
    s.line([(16, 0), (12, 12), (19, 12), (14, 30)], LUM, width=3, glow=True)
    s.line([(16, 0), (12, 12), (19, 12), (14, 30)], LUM_C, glow=True)
    return s.render()


def lumiere_eclatante():
    s = nouveau()
    eclat(s, 16, 16, 14, LUM_F, LUM_C)
    rayons(s, 16, 16, 15, LUM, 12)
    return s.render()


def sol_sacre():
    s = nouveau()
    s.ellipse(2, 20, 30, 30, LUM_F, glow=True)
    s.ellipse(6, 22, 26, 28, LUM, glow=True)
    croix(s, 16, 10, 7, LUM)
    return s.render()


def chant_lumiere():
    s = nouveau()
    for x, y in ((6, 20), (16, 10), (24, 18)):
        s.ellipse(x - 3, y, x + 1, y + 4, LUM, glow=True)
        s.line([(x + 1, y + 2), (x + 1, y - 7)], LUM, glow=True)
    ondes(s, 4, 16, LUM_C, n=2, a0=-60, a1=60)
    return s.render()


def cantique():
    s = nouveau()
    livre(s, 6, 12, '#7A2A2A', '#FFF8E8')
    rayons(s, 16, 7, 7)
    soin(s, 27, 6, 3)
    return s.render()


def courroux_celeste():
    s = nouveau()
    eclat(s, 16, 20, 12, LUM_F, LUM_C)
    for x in (6, 16, 26):
        s.line([(x, 0), (x - 2, 8), (x + 2, 8), (x, 16)], LUM, width=2, glow=True)
    return s.render()


def ange_gardien():
    s = nouveau()
    s.poly([(10, 12), (0, 4), (4, 20)], '#E8E4DC')
    s.poly([(22, 12), (32, 4), (28, 20)], '#E8E4DC')
    s.ellipse(12, 4, 20, 12, '#E8C6A4')
    s.poly([(10, 12), (22, 12), (24, 30), (8, 30)], '#FFF8E8', glow=True)
    arc(s, 16, 3, 5, 180, 360, LUM, width=2)
    return s.render()


def esprit_guerison():
    s = nouveau()
    soin(s, 11, 16, 6)
    s.line([(18, 16), (22, 16)], LUM, glow=True)
    egide(s, 25, 16, 6)
    return s.render()


def ascension_lumineuse():
    s = nouveau()
    s.line([(16, 30), (16, 2)], LUM, width=5, glow=True)
    s.poly([(10, 18), (2, 10), (8, 24)], '#FFF8E8', glow=True)
    s.poly([(22, 18), (30, 10), (24, 24)], '#FFF8E8', glow=True)
    etoile(s, 16, 6, 5, LUM_C)
    return s.render()


# ---------- Ombre ----------

def murmure_douleur():
    s = nouveau()
    crane(s, 9, 9, '#C8B0D8', OMBRE_F)
    ondes(s, 16, 15, OMBRE, n=2, a0=0, a1=360)
    return s.render()


def attaque_mentale():
    s = nouveau()
    s.ellipse(6, 6, 26, 24, '#C8A0B0')
    s.line([(10, 12), (14, 16), (12, 20)], '#8E5A6E')
    eclat(s, 22, 10, 7, OMBRE, OMBRE_C)
    return s.render()


def fouet_psychique():
    s = nouveau()
    pts = [(2 + i * 2, 16 + math.sin(i / 1.5) * 8) for i in range(15)]
    s.line(pts, OMBRE, width=2, glow=True)
    s.line([(x, y - 3) for x, y in pts], OMBRE_C, glow=True)
    return s.render()


def eclat_ombre():
    s = nouveau()
    eclat(s, 16, 16, 13, OMBRE, OMBRE_C)
    return s.render()


def voile_ombre():
    s = nouveau()
    bouclier(s, 7, 4, 25, 28, bord=OMBRE, fond=OMBRE_F, centre=False)
    oeil(s, 16, 14)
    return s.render()


def murmures_neant():
    s = nouveau()
    for i, r in enumerate((13, 9, 5)):
        arc(s, 16, 16, r, i * 60, 250 + i * 60, OMBRE if i != 1 else OMBRE_C, width=2)
    goutte_de(s, 26, 2, 7, '#B8202A')
    return s.render()


def toucher_vampirique():
    s = nouveau()
    main(s, 4, 14, '#C8B0D8', OMBRE_F)
    for i in range(4):
        s.dots([(14 + i * 3, 12 + i)], '#B8202A', glow=True)
    goutte_de(s, 26, 10, 9, '#B8202A')
    return s.render()


def murmure_mort():
    s = nouveau()
    crane(s, 9, 6, '#E6E0D0', OMBRE_F)
    s.line([(4, 28), (28, 28)], OMBRE, width=2, glow=True)
    vitesse(s, [(2, 10, 7, 12), (25, 12, 30, 10)], OMBRE_C)
    return s.render()


def etreinte_vampirique():
    s = nouveau()
    s.ellipse(8, 8, 24, 24, '#B8202A')
    for a in range(0, 360, 60):
        s.line([(16, 16), (16 + math.cos(math.radians(a)) * 14, 16 + math.sin(math.radians(a)) * 14)], OMBRE, width=2, glow=True)
    return s.render()


def esprit_tourmente():
    s = nouveau()
    s.ellipse(8, 4, 24, 20, '#B8A8C8', glow=True)
    s.poly([(8, 12), (24, 12), (26, 30), (21, 26), (16, 30), (11, 26), (6, 30)], '#B8A8C8', glow=True)
    s.rect(11, 9, 14, 12, OMBRE_F)
    s.rect(18, 9, 21, 12, OMBRE_F)
    s.poly([(13, 16), (19, 16), (16, 19)], OMBRE_F)
    return s.render()


def peste_mentale():
    s = nouveau()
    s.ellipse(4, 6, 28, 26, '#5A2E6E')
    for (x, y) in ((10, 12), (20, 10), (16, 20), (24, 18)):
        s.ellipse(x - 2, y - 2, x + 2, y + 2, OMBRE_C, glow=True)
    goutte_de(s, 26, 22, 8, '#B8202A')
    return s.render()


def controle_mental():
    s = nouveau()
    s.ellipse(9, 10, 23, 26, '#6E6A66')
    oeil(s, 16, 6)
    s.line([(16, 10), (16, 14)], OMBRE, glow=True)
    s.rect(12, 16, 14, 18, OMBRE_C, glow=True)
    s.rect(18, 16, 20, 18, OMBRE_C, glow=True)
    return s.render()


def tenebres_interieures():
    s = nouveau()
    orbe(s, 16, 16, 10, OMBRE_F, OMBRE)
    rayons(s, 16, 16, 15, OMBRE, 8)
    return s.render()


def forme_ombre():
    s = nouveau()
    s.ellipse(10, 2, 22, 14, '#2A1A3A')
    s.poly([(8, 12), (24, 12), (28, 30), (4, 30)], '#2A1A3A')
    s.rect(13, 7, 14, 8, OMBRE_C, glow=True)
    s.rect(18, 7, 19, 8, OMBRE_C, glow=True)
    for x in (4, 28):
        s.line([(x, 30), (x + (4 if x < 16 else -4), 18)], OMBRE, width=2, glow=True)
    return s.render()


ILLUSTRATIONS_PRETRE = {
    'priere_garde': priere_garde, 'chatiment': chatiment, 'soins_rapides': soins_rapides, 'grace': grace,
    'dissipation_magie': dissipation_magie, 'purification': purification, 'nova_sacree': nova_sacree, 'effacement': effacement,
    'feu_interieur': feu_interieur, 'inspiration_divine': inspiration_divine, 'benediction_vigueur': benediction_vigueur,
    'egide_renforcee': egide_renforcee, 'penitence': penitence, 'bastion_sacre': bastion_sacre, 'sacrifice_soi': sacrifice_soi,
    'priere_protection': priere_protection, 'discernement': discernement, 'eclat_foi': eclat_foi, 'rayon_lumiere': rayon_lumiere,
    'meditation_sacree': meditation_sacree, 'lumiere_persistante': lumiere_persistante, 'clarte': clarte, 'expiation': expiation,
    'ame_inebranlable': ame_inebranlable, 'egide_anciens': egide_anciens,
    'chatiment_ardent': chatiment_ardent, 'feu_sacre': feu_sacre, 'soins_superieurs': soins_superieurs, 'cercle_soins': cercle_soins,
    'grace_divine': grace_divine, 'colere_divine': colere_divine, 'lumiere_eclatante': lumiere_eclatante, 'sol_sacre': sol_sacre,
    'chant_lumiere': chant_lumiere, 'cantique': cantique, 'courroux_celeste': courroux_celeste, 'ange_gardien': ange_gardien,
    'esprit_guerison': esprit_guerison, 'ascension_lumineuse': ascension_lumineuse,
    'murmure_douleur': murmure_douleur, 'attaque_mentale': attaque_mentale, 'fouet_psychique': fouet_psychique,
    'eclat_ombre': eclat_ombre, 'voile_ombre': voile_ombre, 'murmures_neant': murmures_neant,
    'toucher_vampirique': toucher_vampirique, 'murmure_mort': murmure_mort, 'etreinte_vampirique': etreinte_vampirique,
    'esprit_tourmente': esprit_tourmente, 'peste_mentale': peste_mentale, 'controle_mental': controle_mental,
    'tenebres_interieures': tenebres_interieures, 'forme_ombre': forme_ombre,
}
