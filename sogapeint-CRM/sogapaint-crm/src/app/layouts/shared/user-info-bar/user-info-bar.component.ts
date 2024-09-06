import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../../core/services/user.service';
import { User } from '../../../core/models/auth.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info-bar',
  templateUrl: './user-info-bar.component.html',
  styleUrls: ['./user-info-bar.component.scss']
})
export class UserInfoBarComponent implements OnInit {
  currentUser: User;
  randomTooltip: string;
  clickCount = 0;
  clickThreshold = 10; // Number of clicks needed to navigate

  tooltips = [
    "Un grand pouvoir implique de grandes responsabilités",
    "Tu es un sorcier, Harry... Euh, je veux dire, tu es un superadmin, Harry !",
    "C'est un oiseau ! C'est un avion ! Non, c'est SuperAdmin !",
    "Le superAdmin. Celui qu'on appelle quand il faut franchir l'impossible.",
    "Quand le superAdmin clique, même les machines écoutent.",
    "Ce n'est pas juste un superAdmin. C'est une légende.",
    "Un superAdmin ne meurt jamais, il se déconnecte simplement.",
    "Un clavier, un écran, un superAdmin : un trio invincible.",
    "La force est puissante chez ce superAdmin.",
  ];

  constructor(
    private userProfileService: UserProfileService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.userProfileService.getCurrentUser();
    this.changeDetectorRef.detectChanges(); // Forcer la détection de changement
    console.log(JSON.stringify(this.currentUser)) // TODO: important!!! remove
    this.randomTooltip = this.getRandomTooltip();
  }

  getRoleClass(role: string): string {
    const roleClassMap = {
      'superAdmin': 'badge-superadmin',
      'cocontractor': 'badge-cocontractor',
      'subcontractor': 'badge-subcontractor',
      'customer': 'badge-customer',
      'comanager': 'badge-comanager',
      'supermanager': 'badge-supermanager'
    };
    return roleClassMap[role] || 'badge-default';
  }

  logout() {
    // Effacer le token du stockage local ou de la session
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    sessionStorage.clear();
    this.router.navigate(['/account/login']);
    // Peut-être faire un appel API pour informer le backend de la déconnexion ?
  }

  getRandomTooltip(): string {
    const randomIndex = Math.floor(Math.random() * this.tooltips.length);
    return this.tooltips[randomIndex];
  }

  translateRole(role: string): string {
    const roleTranslationMap = {
      'superAdmin': 'superAdmin',
      'cocontractor': 'co-traitant',
      'subcontractor': 'sous-traitant',
      'customer': 'client',
      'comanager': 'régisseur',
      'supermanager': 'chef régisseur'
    };
    return roleTranslationMap[role] || role;
  }

  onLogoClick() {
    this.clickCount++;
    if (this.clickCount >= this.clickThreshold) {
      // empeche le navigateur d'aller ailleurs
      event.preventDefault();
      this.router.navigate(['/endless-ascension']);
      this.clickCount = 0; // Reset the counter after navigation
    }
  }
}
