import './style.css';
import { mount } from './ui';
import { siteOf } from './version';

// Sur /dev/ (et en local), le jeu s'installe sous le nom « W&L dev », pour ne pas le confondre avec « W&L ».
const site = siteOf(location.pathname, location.hostname);
if (site === 'dev' || site === 'local') {
  document.querySelector('link[rel="manifest"]')?.setAttribute('href', './manifest-dev.webmanifest');
  document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'W&L dev');
  document.title = 'Wipe & Loot (dev)';
}

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
