import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../core/services/user.service';
import { Router } from '@angular/router';


/**
 * Component pour la gestion des utilisateurs.
 * Utilise UserProfileService pour récupérer les données des utilisateurs et Router pour la navigation.
 */
@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {

  // Items pour le fil d'Ariane
  breadCrumbItems: Array<{ label: string; url?: string; active?: boolean }> = [];
  // Titre de la page
  pageTitle: string = 'Gestion des contacts';
  // Liste des utilisateurs
  users: any[] = [];
  // Colonne de tri
  sortColumn: string = '';
  // Direction du tri
  sortDirection: 'asc' | 'desc' = 'asc';
  // Filtre de recherche
  filter: string = ''; 
  // Utilisateurs filtrés pour l'affichage
  filteredUsers: any[] = [];
  // Colonnes pour l'affichage dans le tableau
  columns = [
    { name: 'firstname', displayName: 'Prénom' },
    { name: 'lastname', displayName: 'Nom' },
    { name: 'email', displayName: 'Email' },
    { name: 'role', displayName: 'Rôle' },
    { name: 'company', displayName: 'Entreprise' },
    { name: 'phone', displayName: 'Téléphone' },
    { name: 'active', displayName: 'Actif' },
    // Ajoutez d'autres colonnes au besoin
  ];

  /**
   * Constructeur du composant.
   * @param userProfileService Service pour gérer les profils utilisateurs.
   * @param router Service Router pour la navigation.
   */
  constructor(
    private userProfileService: UserProfileService,
    private router: Router
  ){}
  
  /**
   * Initialisation du composant.
   * Configure le fil d'Ariane et charge les données des utilisateurs.
   */
  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Sogapeint' }, { label: this.pageTitle, active: true }];
    this._fetchData();

  }

  /**
   * Récupère les données des utilisateurs depuis le service.
   * Gère la réception des données et les erreurs.
   */
  private _fetchData(): void {
    // Récupérer les données des utilisateurs depuis le service
    this.userProfileService.getAll().subscribe({
      next: (data: any) => {
        // console.log('Données reçues:', data);
        this.users = data; // Initialiser les utilisateurs
        this.filteredUsers = data; // Initialiser les utilisateurs filtrés
        console.log('Utilisateurs reçus:', this.users);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      },
      // 
    });
  }

  /**
   * Trie les utilisateurs en fonction de la colonne et de la direction de tri.
   * @param column La colonne à utiliser pour le tri.
   */
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
      console.log(`Sorting by ${this.sortColumn} ${this.sortDirection}`);
    }
    this.sortUsers();
  }

  /**
   * Trie les utilisateurs en fonction de la colonne et de la direction de tri.
   */
  private sortUsers(): void {
    this.users.sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }
      return this.sortDirection === 'asc' ? comparison : comparison * -1;
    });
  }

  /**
   * Filtre les utilisateurs en fonction du terme de recherche.
   */
  onSearch(): void {
    console.log("onSearch");
    if (!this.filter) {
      this.filteredUsers = this.users; // Pas de filtre, affiche tous les utilisateurs
    } else {
      this.filteredUsers = this.users.filter(user => {
        const searchTerm = this.filter.toLowerCase();
        return this.columns.some(column => {
          const userData = user[column.name];
          // Convertit toutes les valeurs en chaînes avant de les comparer
          return String(userData).toLowerCase().includes(searchTerm);
        });
      });
    }
  }

  /**
   * Gère la sélection d'un utilisateur.
   * @param user L'utilisateur sélectionné.
   */
  selectUser(user: any) {
    console.log('Utilisateur sélectionné:', user);
    this.router.navigate(['/user-detail', user._id]);
  }
  
  formatPhoneNumber(phoneNumber: string): string {
    // Supprime tout caractère non numérique, sauf le signe plus pour les indicatifs internationaux
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    // Format de base: suppose qu'il s'agit d'un numéro français sans l'indicatif international
    let formatted = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
    if (formatted) {
      // Retourne le numéro formaté (par exemple, "01 23 45 67 89")
      return `${formatted[1]} ${formatted[2]} ${formatted[3]} ${formatted[4]} ${formatted[5]}`;
    }
    // Si le format ne correspond pas, retourne le numéro original
    return phoneNumber;
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
  
}
