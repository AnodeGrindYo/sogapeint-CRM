import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// Importation du module principal de l'application
import { AppModule } from './app/app.module';
// Importation des paramètres d'environnement
import { environment } from './environments/environment';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';


// hammerjs
import 'hammerjs';

registerLocaleData(localeFr);



/**
 * Active le mode de production si l'environnement de l'application est configuré pour la production.
 *
 * Le mode de production désactive les assertions et autres vérifications d'Angular en temps d'exécution.
 */
if (environment.production) {
  enableProdMode();
}

/**
 * Amorce (démarre) l'application Angular.
 *
 * Charge et compile le module principal de l'application (AppModule) et lance l'exécution de l'application.
 * Gère également les erreurs de démarrage.
 */
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));  // Affiche les erreurs de démarrage dans la console
