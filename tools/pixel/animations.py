"""Les sprites animés (prototype) : chaque animation est une planche de 4 images côte à côte,
jouée en boucle par le jeu comme le feu de camp.
Écrit dans public/assets/ : anim_<nom>.png (la planche) et <nom>.png (l'image fixe, la première),
et dans assets/essais/ : <nom>_anime.gif, un aperçu agrandi.
Lancer depuis tools/pixel/ : python3 animations.py"""
import os
from demoniste_sprites import demoniste, diablotin, molosse_infernal, paladin, pretre, rodeur, seigneur_infernal, succube, voleur
from ennemis import etincelle, molosse
from sprites import apercu_gif, guerrier, mage, planche, vulkhar

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))

# nom du fichier du jeu → (dessin, nombre d'images, miroir, agrandissement de l'aperçu)
# Vulkhar est dessiné tourné vers la droite ; en jeu il regarde vers la gauche (vers le héros).
ANIMES = {
    'guerrier': (guerrier, 4, False, 6),
    'mage': (mage, 4, False, 6),
    'paladin': (paladin, 4, False, 6),
    'voleur': (voleur, 4, False, 6),
    'demoniste': (demoniste, 4, False, 6),
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
}

if __name__ == '__main__':
    for nom, (fn, n, miroir, echelle) in ANIMES.items():
        planche(fn, n, miroir).save(os.path.join(DEST, f'anim_{nom}.png'))
        fixe = fn(0).transpose(0) if miroir else fn(0)
        fixe.save(os.path.join(DEST, f'{nom}.png'))
        apercu_gif(fn, n, nom.replace('ennemi_', ''), echelle, miroir=miroir)
    print('ok')
