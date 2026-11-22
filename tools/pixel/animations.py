"""Les sprites animés (prototype) : chaque animation est une planche de 4 images côte à côte,
jouée en boucle par le jeu comme le feu de camp.
Écrit dans public/assets/ : anim_<nom>.png (la planche) et <nom>.png (l'image fixe, la première),
et dans assets/essais/ : <nom>_anime.gif, un aperçu agrandi.
Lancer depuis tools/pixel/ : python3 animations.py"""
import os
from demoniste_sprites import demoniste, diablotin, molosse_infernal, paladin, pretre, rodeur, seigneur_infernal, succube, voleur
from ennemis import etincelle, molosse
from ennemis_acte2 import vhaeryx, vhaeryx_dragon
from acte3 import yzhar, yzhar_corps
from sprites import anime_auto, apercu_gif, guerrier, mage, planche, vulkhar
from chasseur_sprites import chasseur, loup, ours, raptor
from druide_sprites import druide, druide_astrale, druide_felin, druide_ours
from chaman_sprites import chaman

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))

# nom du fichier du jeu → (dessin, nombre d'images, miroir, agrandissement de l'aperçu)
# Vulkhar est dessiné tourné vers la droite ; en jeu il regarde vers la gauche (vers le héros).
ANIMES = {
    'guerrier': (guerrier, 4, False, 6),
    'mage': (mage, 4, False, 6),
    'paladin': (paladin, 4, False, 6),
    'voleur': (voleur, 4, False, 6),
    'demoniste': (demoniste, 4, False, 6),
    'chasseur': (chasseur, 4, False, 6),
    'chaman': (chaman, 4, False, 6),
    'druide': (druide, 4, False, 6),
    'druide_ours': (druide_ours, 4, False, 6),
    'druide_felin': (druide_felin, 4, False, 6),
    'druide_astrale': (druide_astrale, 4, False, 6),
    'familier_loup': (loup, 4, False, 8),
    'familier_ours': (ours, 4, False, 8),
    'familier_raptor': (raptor, 4, False, 8),
    'familier_diablotin': (diablotin, 4, False, 8),
    'familier_rodeur': (rodeur, 4, False, 8),
    'familier_succube': (succube, 4, False, 8),
    'familier_molosse': (molosse_infernal, 4, False, 8),
    'familier_seigneur': (seigneur_infernal, 4, False, 6),
    'pretre': (pretre, 4, False, 6),
    'pretre_ombre': (lambda f: pretre(f, 'ombre'), 4, False, 6),
    'ennemi_molosse': (molosse, 4, False, 6),
    'ennemi_etincelle': (etincelle, 4, False, 8),
    'ennemi_vulkhar': (vulkhar, 4, True, 4),
    'ennemi_vhaeryx': (vhaeryx, 4, False, 4),
    'ennemi_vhaeryx_dragon': (vhaeryx_dragon, 4, False, 4),
    'ennemi_yzhar': (yzhar, 4, False, 4),
    'ennemi_yzhar_corps': (yzhar_corps, 4, False, 4),
}

# Les autres ennemis sont animés automatiquement (anime_auto) : on leur donne juste un profil.
# 'sol' par défaut ; 'vol' pour ceux qui flottent ; 'fixe' pour ceux qui ne bougent pas ;
# 'ondule' pour les vers et les tentacules ; 'gelee' pour les limons.
PROFILS = {
    'eclat': 'vol', 'rejeton': 'vol', 'vorra': 'vol',
    'oeuf': 'fixe', 'oeuf_skarn': 'fixe', 'oeuf_vashka': 'fixe',
    'gharul': 'ondule', 'ver_mineur': 'ondule', 'tentacule': 'ondule',
    'limon': 'gelee', 'limon_mineur': 'gelee',
    'tentacule_geant': 'ondule', 'tentacule_interieur': 'ondule',
}
# Les copies : même dessin qu'un autre ennemi.
COPIES = {'mimique_2': 'mimique', 'mimique_3': 'mimique', 'mehkar_copie': 'mehkar'}


def ennemis_auto():
    """Tous les ennemis qui n'ont pas d'animation dessinée à la main : nom -> fonction de dessin."""
    import acte3
    import ennemis
    import ennemis_acte2
    tous = {name: getattr(ennemis, name) for name in ('eclaireur', 'seigneur', 'lieutenant', 'brannoc', 'cendrine', 'rejeton')}
    tous.update(ennemis.ELITES)
    tous.update(ennemis_acte2.SPRITES)
    tous.update(acte3.SPRITES)
    for copie, modele in COPIES.items():
        tous.setdefault(copie, tous[modele])
    return {n: fn for n, fn in tous.items() if f'ennemi_{n}' not in ANIMES}


if __name__ == '__main__':
    for nom, (fn, n, miroir, echelle) in ANIMES.items():
        planche(fn, n, miroir).save(os.path.join(DEST, f'anim_{nom}.png'))
        fixe = fn(0).transpose(0) if miroir else fn(0)
        fixe.save(os.path.join(DEST, f'{nom}.png'))
        apercu_gif(fn, n, nom.replace('ennemi_', ''), echelle, miroir=miroir)
    auto = ennemis_auto()
    for nom, fn in auto.items():
        anime = anime_auto(fn, PROFILS.get(nom, 'sol'))
        planche(anime, 4).save(os.path.join(DEST, f'anim_ennemi_{nom}.png'))
    print(len(ANIMES), 'animations dessinées,', len(auto), 'ennemis animés automatiquement')
    print('ok')
