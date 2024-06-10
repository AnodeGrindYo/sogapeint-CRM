import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';// Assurez-vous d'importer le composant de la documentation
import { DocGuard } from './core/guards/doc.guard'
import { ProtectedDocumentationComponent } from "./protected-documentation/protected-documentation.component";
import { ProtectedApiDocumentationComponent } from "./protected-api-documentation/protected-api-documentation.component";
// Importation du composant LayoutComponent pour la structure de base de l'application
import { LayoutComponent } from './layouts/layout/layout.component';

/**
* Configuration des routes de l'application.
*
* Définit les routes et leurs chargements paresseux (lazy loading), ainsi que la protection
* des routes par des gardes d'authentification.
*/
const routes: Routes = [
  // Route pour les fonctionnalités liées au compte utilisateur
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  
  // Route principale, utilisant LayoutComponent et chargement paresseux du module des pages
  // Protégée par AuthGuard pour assurer que l'utilisateur est authentifié
  { path: '', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  
  // Route pour les pages supplémentaires, également protégées par AuthGuard
  //   { path: 'pages', loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule), canActivate: [AuthGuard] },
  
  {
    path: 'documentation',
    component: ProtectedDocumentationComponent, // Le composant que vous voulez protéger avec le garde
    canActivate: [DocGuard] // Appliquez le garde à cette route
  },
  {
    path: 'api-documentation',
    component: ProtectedApiDocumentationComponent, // Le composant que vous voulez protéger avec le garde
    canActivate: [DocGuard] // Appliquez le garde à cette route
  }
];

/**
* Module de routage de l'application.
*
* Importe et exporte RouterModule configuré avec les routes définies.
* 'scrollPositionRestoration' est réglé sur 'top' pour réinitialiser la position de défilement
* lors de la navigation entre les pages.
*/
@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
