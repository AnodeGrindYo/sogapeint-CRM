import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../services/auth.service'; 

@Injectable({
  providedIn: 'root'
})
export class RoleRedirectGuard implements CanActivate {

  constructor(private AuthenticationService: AuthenticationService, private router: Router) { }

  canActivate(): boolean {
    const user = this.AuthenticationService.currentUserValue; // Récupère les informations de l'utilisateur actuel

    if (user && user.role) {
      // Rediriger selon le rôle de l'utilisateur
      if (user.role === 'Admin' || user.role === 'superAdmin') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/manageOrders']);
      }
      return false; // Empêche la navigation par défaut (on redirige explicitement)
    }

    // Si l'utilisateur n'est pas authentifié ou n'a pas de rôle, vous pouvez rediriger vers une page de connexion ou autre
    this.router.navigate(['/login']);
    return false;
  }
}
