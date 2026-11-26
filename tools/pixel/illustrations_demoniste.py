"""Les illustrations des cartes du Démoniste (32 x 32 pixels).
Palette : l'ombre violette, la gangrène verte (fel), le feu de l'abîme, et le rouge du sang des pactes."""
import math
from illustrations import FEU, JAUNE, OR, arc, bouclier, crane, eclat, etoile, flamme_de, goutte_de, nouveau, ondes, vitesse
from illustrations_mage import livre, main, meteore, orbe, projectile, rune

OMBRE, OMBRE_C, OMBRE_F = '#8A4AD8', '#D8B8FF', '#3E2260'
FEL, FEL_C, FEL_F = '#7ED84A', '#C8FF8A', '#2E6A1E'
SANG, SANG_C = '#B8202A', '#FF7A7A'


def ombre_orbe(s, cx, cy, r):
    orbe(s, cx, cy, r, OMBRE, OMBRE_C)


def flamme_fel(s, x, y, w, h):
    flamme_de(s, x, y, w, h, FEL_F, FEL, FEL_C)


def tentacules(s, x, y, couleur=OMBRE):
    for i in range(3):
        pts = [(x + i * 6 + math.sin(t / 2) * 2, y - t * 2) for t in range(0, 8)]
        s.line(pts, couleur, width=2, glow=True)


def demon(s, x, y, couleur='#C8402A'):
    s.ellipse(x, y + 6, x + 12, y + 18, couleur)
    s.ellipse(x + 1, y, x + 11, y + 9, couleur)
    s.poly([(x + 2, y + 1), (x, y - 4), (x + 4, y + 1)], '#2A1C18')
    s.poly([(x + 10, y + 1), (x + 12, y - 4), (x + 8, y + 1)], '#2A1C18')
    s.rect(x + 7, y + 3, x + 8, y + 4, JAUNE, glow=True)


def cercle_invocation(s, cx, cy, r, couleur=FEL):
    arc(s, cx, cy, r, 0, 360, couleur)
    for a in range(0, 360, 72):
        a2 = a + 144
        s.line([(cx + math.cos(math.radians(a)) * r, cy + math.sin(math.radians(a)) * r),
                (cx + math.cos(math.radians(a2)) * r, cy + math.sin(math.radians(a2)) * r)], couleur, glow=True)


def eclat_ame(s, cx, cy, r=5):
    s.poly([(cx, cy - r), (cx + r * 0.6, cy), (cx, cy + r), (cx - r * 0.6, cy)], OMBRE, glow=True)
    s.poly([(cx, cy - r + 2), (cx + r * 0.3, cy), (cx, cy + r - 2), (cx - r * 0.3, cy)], OMBRE_C, glow=True)


# ---------- Départ et tronc commun ----------

def garde_sombre():
    s = nouveau()
    bouclier(s, 7, 4, 25, 28, bord=OMBRE, fond=OMBRE_F, centre=False)
    crane(s, 9, 9, '#C8B0D8', OMBRE_F)
    return s.render()


def siphon_ame():
    s = nouveau()
    crane(s, 3, 4)
    for i in range(4):
        s.dots([(16 + i * 3, 12 + i * 3)], OMBRE_C, glow=True)
    eclat_ame(s, 26, 25)
    return s.render()


def siphon_vie():
    s = nouveau()
    goutte_de(s, 7, 4, 12, SANG)
    for i in range(4):
        s.dots([(12 + i * 3, 16 + i * 2)], SANG_C, glow=True)
    main(s, 21, 18, '#C8B0A0', OMBRE_F)
    return s.render()


def peur():
    s = nouveau()
    crane(s, 9, 7, '#E6E0D0', OMBRE_F)
    ondes(s, 16, 14, OMBRE, n=2, a0=-160, a1=-20)
    return s.render()


def pacte_noir():
    s = nouveau()
    livre(s, 6, 10, OMBRE_F)
    goutte_de(s, 16, 2, 9, SANG)
    return s.render()


def malediction_langages():
    s = nouveau()
    s.ellipse(6, 8, 26, 26, '#C8B0A0')
    s.poly([(10, 18), (22, 18), (20, 22), (12, 22)], '#2A1C18')
    s.line([(4, 4), (28, 28)], OMBRE, width=2, glow=True)
    s.dots([(26, 6), (28, 10), (24, 3)], OMBRE_C, glow=True)
    return s.render()


def pluie_de_feu():
    s = nouveau()
    for x, y in ((4, 2), (13, 6), (22, 1), (8, 15), (19, 13)):
        s.poly([(x, y), (x + 3, y + 7), (x + 6, y + 3)], FEU, glow=True)
        s.ellipse(x + 3, y + 6, x + 8, y + 11, JAUNE, glow=True)
    s.line([(2, 30), (30, 30)], FEU, glow=True)
    return s.render()


def armure_demoniaque():
    s = nouveau()
    s.poly([(7, 6), (25, 6), (27, 26), (16, 30), (5, 26)], OMBRE_F)
    s.poly([(10, 9), (22, 9), (23, 24), (16, 27), (9, 24)], OMBRE)
    s.poly([(7, 6), (3, 0), (10, 5)], '#1E1424')
    s.poly([(25, 6), (29, 0), (22, 5)], '#1E1424')
    s.ellipse(13, 13, 19, 19, FEL, glow=True)
    return s.render()


def hurlement_terreur():
    s = nouveau()
    crane(s, 3, 10, '#E6E0D0', OMBRE_F)
    ondes(s, 18, 16, OMBRE, n=3, a0=-60, a1=60)
    return s.render()


def pierre_de_vie_carte():
    s = nouveau()
    s.poly([(16, 3), (26, 12), (22, 28), (10, 28), (6, 12)], FEL_F)
    s.poly([(16, 6), (23, 13), (20, 25), (12, 25), (9, 13)], FEL, glow=True)
    s.line([(14, 9), (12, 20)], FEL_C, glow=True)
    return s.render()


# ---------- Affliction ----------

def corruption():
    s = nouveau()
    s.ellipse(6, 6, 26, 26, OMBRE_F)
    tentacules(s, 8, 28)
    s.dots([(12, 12), (18, 9), (20, 16)], FEL, glow=True)
    return s.render()


def malediction_souffrance():
    s = nouveau()
    crane(s, 9, 4, '#C8B0A0', SANG)
    for i in range(5):
        s.rect(6 + i * 4, 30 - i * 2, 8 + i * 4, 30, SANG_C, glow=True)
    return s.render()


def malediction_faiblesse():
    s = nouveau()
    main(s, 12, 12, '#C8B0A0', OMBRE_F)
    s.line([(4, 6), (10, 12)], OMBRE, width=2, glow=True)
    s.line([(28, 6), (22, 12)], OMBRE, width=2, glow=True)
    s.dots([(15, 4), (20, 6)], OMBRE_C, glow=True)
    return s.render()


def malediction_fatigue():
    s = nouveau()
    s.poly([(9, 4), (23, 4), (17, 16), (23, 28), (9, 28), (15, 16)], OMBRE_F)
    s.poly([(12, 25), (20, 25), (16, 20)], OMBRE_C, glow=True)
    s.rect(8, 3, 24, 4, OR)
    s.rect(8, 28, 24, 29, OR)
    return s.render()


def pacte_souffrance():
    s = nouveau()
    goutte_de(s, 10, 3, 12, SANG)
    goutte_de(s, 20, 9, 10, SANG)
    tentacules(s, 6, 30, OMBRE)
    return s.render()


def ombre_persistante():
    s = nouveau()
    for i, r in enumerate((12, 9, 6)):
        arc(s, 16, 16, r, i * 50, 260 + i * 50, OMBRE if i != 1 else OMBRE_C, width=2)
    return s.render()


def malediction_elements():
    s = nouveau()
    rune(s, 16, 16, 12, OMBRE)
    flamme_de(s, 11, 8, 10, 12)
    return s.render()


def fleau_rampant():
    s = nouveau()
    for x in (4, 13, 22):
        tentacules(s, x, 30, FEL)
    s.ellipse(4, 2, 28, 12, FEL_F)
    return s.render()


def hantise():
    s = nouveau()
    s.ellipse(8, 4, 24, 20, '#B8C8D8', glow=True)
    s.poly([(8, 12), (24, 12), (26, 28), (22, 24), (16, 28), (10, 24), (6, 28)], '#B8C8D8', glow=True)
    s.rect(12, 9, 14, 11, OMBRE_F)
    s.rect(18, 9, 20, 11, OMBRE_F)
    return s.render()


def etreinte_ombre():
    s = nouveau()
    s.ellipse(10, 10, 22, 22, OMBRE_C, glow=True)
    for a in range(0, 360, 60):
        x, y = 16 + math.cos(math.radians(a)) * 13, 16 + math.sin(math.radians(a)) * 13
        s.line([(16, 16), (x, y)], OMBRE, width=2, glow=True)
    return s.render()


def contagion():
    s = nouveau()
    for (x, y) in ((8, 8), (24, 10), (14, 24)):
        s.ellipse(x - 5, y - 5, x + 5, y + 5, FEL_F)
        s.dots([(x - 1, y - 1), (x + 2, y + 1)], FEL, glow=True)
    s.line([(8, 8), (24, 10), (14, 24), (8, 8)], FEL, glow=True)
    return s.render()


def moisson_sombre():
    s = nouveau()
    s.line([(6, 28), (20, 6)], '#5A3822', width=2)
    s.poly([(20, 6), (30, 10), (26, 18), (22, 10)], '#C9D2DE')
    s.line([(21, 8), (28, 12)], OMBRE_C, glow=True)
    eclat_ame(s, 8, 10, 4)
    return s.render()


def tourment():
    s = nouveau()
    s.ellipse(6, 6, 26, 26, SANG)
    tentacules(s, 9, 26, OMBRE_F)
    s.ellipse(12, 12, 20, 20, SANG_C, glow=True)
    return s.render()


def tempete_afflictions():
    s = nouveau()
    for i, r in enumerate((13, 9, 5)):
        arc(s, 16, 16, r, i * 40, 290 + i * 40, FEL if i != 1 else OMBRE, width=2)
    s.dots([(4, 4), (28, 6), (4, 28), (28, 28)], FEL_C, glow=True)
    return s.render()


# ---------- Démonologie ----------

def ordre_assaut():
    s = nouveau()
    demon(s, 4, 10)
    vitesse(s, [(18, 12, 28, 12), (18, 16, 30, 16), (18, 20, 28, 20)], FEU)
    return s.render()


def pacte_ombres():
    s = nouveau()
    bouclier(s, 4, 6, 18, 28, bord=OMBRE, fond=OMBRE_F, centre=False)
    demon(s, 18, 10)
    return s.render()


def rituel_invocateur():
    s = nouveau()
    cercle_invocation(s, 16, 18, 12)
    s.dots([(16, 4), (4, 12), (28, 12)], FEL_C, glow=True)
    return s.render()


def festin_demoniaque():
    s = nouveau()
    demon(s, 10, 6)
    goutte_de(s, 6, 20, 8, SANG)
    goutte_de(s, 26, 18, 8, SANG)
    return s.render()


def lien_vital():
    s = nouveau()
    demon(s, 2, 10)
    s.line([(14, 16), (20, 16)], FEL, width=2, glow=True)
    h = 10 * 0.9
    s.ellipse(20, 10, 26, 10 + h / 2, SANG)
    s.ellipse(25, 10, 31, 10 + h / 2, SANG)
    s.poly([(20, 13), (31, 13), (25, 20)], SANG)
    return s.render()


def invocation_succube():
    s = nouveau()
    cercle_invocation(s, 16, 22, 9, OMBRE)
    s.ellipse(12, 2, 20, 10, '#C88AA0')
    s.poly([(11, 10), (21, 10), (22, 20), (10, 20)], '#8E3A6E')
    s.poly([(10, 8), (3, 2), (8, 12)], '#5A2A6E')
    s.poly([(22, 8), (29, 2), (24, 12)], '#5A2A6E')
    return s.render()


def invocation_molosse():
    s = nouveau()
    cercle_invocation(s, 16, 24, 8)
    s.ellipse(6, 8, 22, 18, '#5A7A3A')
    s.ellipse(18, 4, 28, 13, '#5A7A3A')
    s.rect(24, 7, 25, 8, '#E8402A', glow=True)
    s.line([(20, 5), (18, 0)], FEL, glow=True)
    return s.render()


def liens_demoniaques():
    s = nouveau()
    for x in (6, 14, 22):
        s.ellipse(x, 12, x + 8, 20, '#8A8A94')
        s.ellipse(x + 2, 14, x + 6, 18, '#1E1424')
    s.dots([(4, 6), (28, 26)], FEL, glow=True)
    return s.render()


def eclat_partage():
    s = nouveau()
    demon(s, 3, 12)
    eclat_ame(s, 23, 10, 7)
    return s.render()


def lien_ame():
    s = nouveau()
    eclat_ame(s, 9, 16, 7)
    bouclier(s, 18, 6, 30, 26, bord=OMBRE, fond=OMBRE_F, centre=False)
    s.line([(14, 16), (19, 16)], OMBRE_C, glow=True)
    return s.render()


def sacrifice_demoniaque():
    s = nouveau()
    demon(s, 10, 10, '#6A3A2A')
    s.line([(4, 4), (28, 28)], SANG, width=2, glow=True)
    goutte_de(s, 24, 4, 7, SANG)
    return s.render()


def asservissement():
    s = nouveau()
    s.ellipse(9, 6, 23, 26, '#6E6A66')
    s.rect(12, 12, 14, 14, FEL, glow=True)
    s.rect(18, 12, 20, 14, FEL, glow=True)
    s.line([(4, 4), (12, 8)], FEL, glow=True)
    s.line([(28, 4), (20, 8)], FEL, glow=True)
    s.line([(16, 0), (16, 6)], FEL, glow=True)
    return s.render()


def maitre_pactes():
    s = nouveau()
    livre(s, 6, 12, SANG)
    eclat_ame(s, 16, 6, 5)
    return s.render()


def seigneur_infernal():
    s = nouveau()
    s.ellipse(2, 24, 30, 32, FEL, glow=True)
    s.poly([(8, 8), (24, 8), (26, 24), (6, 24)], '#4A4A3E')
    s.ellipse(11, 1, 21, 10, '#5A5A4A')
    s.rect(13, 4, 14, 5, FEL_C, glow=True)
    s.rect(18, 4, 19, 5, FEL_C, glow=True)
    s.ellipse(0, 6, 6, 12, FEL, glow=True)
    s.ellipse(26, 6, 32, 12, FEL, glow=True)
    return s.render()


# ---------- Destruction ----------

def trait_ombre():
    s = nouveau()
    projectile(s, 3, 27, 22, 9, OMBRE, OMBRE_C, r=5)
    vitesse(s, [(3, 20, 11, 13), (8, 29, 15, 22)], OMBRE)
    return s.render()


def incinerer():
    s = nouveau()
    flamme_de(s, 6, 4, 20, 24)
    s.dots([(4, 26), (28, 24)], FEU, glow=True)
    return s.render()


def immolation():
    s = nouveau()
    flamme_de(s, 3, 10, 9, 18)
    flamme_de(s, 11, 2, 11, 26)
    flamme_de(s, 21, 10, 9, 18)
    s.line([(2, 30), (30, 30)], '#3A2A26', width=2)
    return s.render()


def deflagration_ombre():
    s = nouveau()
    eclat(s, 16, 16, 13, OMBRE, OMBRE_C)
    return s.render()


def chaos_instable():
    s = nouveau()
    orbe(s, 16, 16, 9, FEL, FEL_C)
    for a in range(0, 360, 45):
        x, y = 16 + math.cos(math.radians(a)) * 14, 16 + math.sin(math.radians(a)) * 14
        s.dots([(x, y)], FEL if a % 90 else FEU, glow=True)
    return s.render()


def conflagration():
    s = nouveau()
    eclat(s, 16, 18, 13, '#E8562A', JAUNE)
    flamme_de(s, 10, 2, 12, 12)
    return s.render()


def embrasement_ame():
    s = nouveau()
    eclat_ame(s, 16, 18, 10)
    flamme_fel(s, 9, 1, 14, 12)
    return s.render()


def ombre_et_flammes():
    s = nouveau()
    ombre_orbe(s, 10, 16, 7)
    flamme_de(s, 16, 6, 12, 20)
    return s.render()


def contrecoup():
    s = nouveau()
    goutte_de(s, 7, 4, 12, SANG)
    projectile(s, 14, 26, 28, 10, OMBRE, OMBRE_C, r=3)
    return s.render()


def feu_ame():
    s = nouveau()
    flamme_fel(s, 4, 2, 24, 28)
    eclat_ame(s, 16, 20, 5)
    return s.render()


def trait_chaos():
    s = nouveau()
    s.line([(3, 28), (29, 4)], FEL, width=5, glow=True)
    s.line([(3, 28), (29, 4)], FEL_C, width=1, glow=True)
    bouclier(s, 18, 14, 30, 30, bord='#8A8A94', fond='#3A3A40', centre=False)
    return s.render()


def pacte_destruction():
    s = nouveau()
    goutte_de(s, 8, 3, 12, SANG)
    eclat(s, 22, 20, 9, OMBRE, OMBRE_C)
    return s.render()


def ruine():
    s = nouveau()
    meteore(s, 18, 18, 7, trainee=10)
    s.line([(4, 30), (30, 30)], FEL, glow=True)
    return s.render()


def cataclysme():
    s = nouveau()
    eclat(s, 16, 18, 14, FEL, FEL_C)
    for (x, y) in ((4, 4), (16, 2), (28, 4)):
        eclat_ame(s, x, y + 2, 3)
    return s.render()


ILLUSTRATIONS_DEMONISTE = {
    'garde_sombre': garde_sombre, 'siphon_ame': siphon_ame, 'siphon_vie': siphon_vie, 'peur': peur, 'pacte_noir': pacte_noir,
    'malediction_langages': malediction_langages, 'pluie_de_feu': pluie_de_feu, 'armure_demoniaque': armure_demoniaque,
    'hurlement_terreur': hurlement_terreur, 'pierre_de_vie_carte': pierre_de_vie_carte,
    'corruption': corruption, 'malediction_souffrance': malediction_souffrance, 'malediction_faiblesse': malediction_faiblesse,
    'malediction_fatigue': malediction_fatigue, 'pacte_souffrance': pacte_souffrance, 'ombre_persistante': ombre_persistante,
    'malediction_elements': malediction_elements, 'fleau_rampant': fleau_rampant, 'hantise': hantise, 'etreinte_ombre': etreinte_ombre,
    'contagion': contagion, 'moisson_sombre': moisson_sombre, 'tourment': tourment, 'tempete_afflictions': tempete_afflictions,
    'ordre_assaut': ordre_assaut, 'pacte_ombres': pacte_ombres, 'rituel_invocateur': rituel_invocateur,
    'festin_demoniaque': festin_demoniaque, 'lien_vital': lien_vital, 'invocation_succube': invocation_succube,
    'invocation_molosse': invocation_molosse, 'liens_demoniaques': liens_demoniaques, 'eclat_partage': eclat_partage,
    'lien_ame': lien_ame, 'sacrifice_demoniaque': sacrifice_demoniaque, 'asservissement': asservissement,
    'maitre_pactes': maitre_pactes, 'seigneur_infernal': seigneur_infernal,
    'trait_ombre': trait_ombre, 'incinerer': incinerer, 'immolation': immolation, 'deflagration_ombre': deflagration_ombre,
    'chaos_instable': chaos_instable, 'conflagration': conflagration, 'embrasement_ame': embrasement_ame,
    'ombre_et_flammes': ombre_et_flammes, 'contrecoup': contrecoup, 'feu_ame': feu_ame, 'trait_chaos': trait_chaos,
    'pacte_destruction': pacte_destruction, 'ruine': ruine, 'cataclysme': cataclysme,
}
