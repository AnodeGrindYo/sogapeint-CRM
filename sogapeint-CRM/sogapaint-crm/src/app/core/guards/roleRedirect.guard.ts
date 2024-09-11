import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleRedirectGuard implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAdminOrSuperAdmin()) {
      this.router.navigate(['/dashboard']);  // Rediriger vers dashboard si admin ou superAdmin
      return false;  // Empêche l'accès à la route actuelle
    } else {
      this.router.navigate(['/manageOrders']);  // Rediriger vers manageOrders pour les autres utilisateurs
      return false;  // Empêche l'accès à la route actuelle
    }
  }
}
