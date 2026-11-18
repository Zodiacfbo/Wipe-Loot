"""Exporte les images utilisées par le jeu dans public/assets/ (taille réelle,
l'agrandissement est fait par le jeu avec un rendu « pixelated »)."""
import os
from cartes import cadre, coup_de_bouclier, cri, flamme, frappe_heroique
from sprites import guerrier

DEST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'assets'))
os.makedirs(DEST, exist_ok=True)

RARETES = {
    'depart': '#8A8178',
    'commune': '#E9E1D3',
    'peu_commune': '#5FB86B',
    'rare': '#4C8FE0',
    'epique': '#A66BE0',
    'statut': '#C8413A',
}

for nom, couleur in RARETES.items():
    cadre(couleur).save(os.path.join(DEST, f'cadre_{nom}.png'))
    cadre(couleur, rage=True).save(os.path.join(DEST, f'cadre_{nom}_rage.png'))

frappe_heroique().save(os.path.join(DEST, 'icone_epee.png'))
coup_de_bouclier().save(os.path.join(DEST, 'icone_bouclier.png'))
cri().save(os.path.join(DEST, 'icone_pouvoir.png'))
flamme().save(os.path.join(DEST, 'icone_feu.png'))
guerrier().save(os.path.join(DEST, 'guerrier.png'))
print('ok', DEST)
