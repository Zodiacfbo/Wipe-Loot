import './style.css';
import { mount } from './ui';

const stage = document.getElementById('stage');
if (stage) mount(stage);

// Installation comme application (PWA) : uniquement sur le site publié.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Pas de service worker : le jeu fonctionne quand même, sans mode hors connexion.
    });
  });
}
