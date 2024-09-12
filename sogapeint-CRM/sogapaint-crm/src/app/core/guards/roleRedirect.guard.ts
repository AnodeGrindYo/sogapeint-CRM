import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserProfileService } from '../services/user.service';  // Utilisation du service UserProfileService
import { AuthenticationService } from '../services/auth.service'; // Pour s'assurer de l'authentification
import { User } from '../models/auth.models';  // Assurez-vous d'importer le bon type de modèle utilisateur

@Injectable({
  providedIn: 'root'
})
export class RoleRedirectGuard implements CanActivate {

  constructor(
    private userService: UserProfileService,   // Injection du service UserProfileService
    private router: Router,
    private authService: AuthenticationService // AuthService pour vérifier si l'utilisateur est connecté
  ) { }

  canActivate(): boolean {
    const currentUser: User = this.userService.getCurrentUser();  // Typage explicite
    console.log('Utilisateur courant:', currentUser);

    if (currentUser && currentUser.role) {
      // Ajoutez des logs pour suivre le rôle de l'utilisateur
      console.log('Utilisateur connecté avec le rôle :', currentUser.role);

      // Rediriger en fonction du rôle
      if (currentUser.role === 'Admin' || currentUser.role === 'superAdmin') {
        console.log('Redirection vers /dashboard');
        this.router.navigate(['/dashboard']);
      } else {
        console.log('Redirection vers /manageOrders');
        this.router.navigate(['/manageOrders']);
      }
      return false; // Empêche la navigation par défaut, car on redirige explicitement
    }

    // Si l'utilisateur n'est pas authentifié ou n'a pas de rôle, redirection vers une page de login ou d'erreur
    console.log('Aucun rôle trouvé, redirection vers /login');
    this.router.navigate(['/login']);
    return false;
  }
}
