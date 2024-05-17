import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanyService } from '../../core/services/company.service';
import { User } from 'src/app/core/models/auth.models';
import { Document } from 'src/app/core/models/document.models';
import { Contract } from 'src/app/core/models/contract.models';
import { ContractService } from 'src/app/core/services/contract.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import { Company } from 'src/app/core/models/company.models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit {
  company: Company;
  id: string;
  // Items pour le fil d'Ariane
  breadCrumbItems: Array<{ label: string; url?: string; active?: boolean }> = [];
  // Titre de la page
  pageTitle: string = 'Détail entreprise';
  companyForm: FormGroup;
  // editMode: boolean = false;
  successMessage: string;
  errorMessage: string;
  isLoading: boolean = false;
  currentUser: User;
  // isAdmin: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private contractService: ContractService,
    private userProfileService: UserProfileService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Sogapeint' }, { label: this.pageTitle, active: true }];
    this.currentUser = this.userProfileService.getCurrentUser();
    // this.isAdmin = this.isAdminOrSuperAdmin();
    this.route.params.subscribe(params => {
      this.id = params['companyId']; 
      // Charge les détails de l'entreprise
      // puis charge les détails de chaque employé de l'entreprise
      this.loadCompany(this.id)

    });
    this.companyForm = this.fb.group({
      names: ['', Validators.required],
      address: [''],
      industry: [''],
      websites: [''],
      phone: [''],
      email: [''],
      additionalFields: this.fb.array([])
    });

  }

  loadCompany(id: string) {
    this.isLoading = true;
    this.companyService.getCompanyById(id).subscribe({
      next: (company) => {
        this.company = company;
        console.log("Company loaded: ", this.company);
        // Charge les détails de chaque employé de l'entreprise
        this.getEmployeeDetails();
        // Charge les détails de chaque contrat de l'entreprise
        this.getContractsDetails();
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading the company: ", error);
      }
    });
  }

  isAdminOrSuperAdmin(): boolean {
    // console.log('Current user role:', this.currentUser.role);
    return this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'superAdmin');
  }


  // Méthode pour obtenir le détail des employé
  getEmployeeDetails() {
    // Vérifie s'il y a des employés à traiter.
    if (!this.company.employees || this.company.employees.length === 0) {
      return;
    }
  
    // Crée une map pour conserver les détails uniques des employés.
    const employeesDetails = new Map();
  
    // Récupère les détails pour chaque ID d'employé.
    this.company.employees.forEach(employeeId => {
      this.userProfileService.getOne(employeeId.toString()).subscribe({
        next: (userDetails) => {
          // Met à jour la map avec les détails de l'employé en utilisant la syntaxe de l'indexation.
          employeesDetails.set(employeeId, {
            id: employeeId,
            ...userDetails,
            firstName: userDetails["firstname"], // Utilisation de la syntaxe de l'indexation
            lastName: userDetails["lastname"]   // Utilisation de la syntaxe de l'indexation
          });
  
          // Si tous les détails des employés ont été récupérés, met à jour `this.company.employees`.
          if (employeesDetails.size === this.company.employees.length) {
            this.company.employees = Array.from(employeesDetails.values());
          }
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des détails de l\'employé:', error);
        }
      });
    });
  }
  
  // Méthode pour obtenir tous les contrats
  getContractsDetails() {
    const contractCategories = [
      "contractsAsCustomer",
      "contractsAsContact",
      "contractsAsExternalContributor"
    ];
  
    contractCategories.forEach(contractCategory => {
      // Vérifie si la catégorie de contrat a des éléments à traiter
      if (this.company[contractCategory].length) {
        const contractDetailsRequests = this.company[contractCategory].map(contractId =>
          this.contractService.getContractById(contractId)
        );
  
        // Utilise forkJoin pour exécuter toutes les requêtes de détails de contrats simultanément
        forkJoin(contractDetailsRequests).subscribe(contractsDetails => {
          // Met à jour la catégorie de contrats avec les détails récupérés
          this.company[contractCategory] = contractsDetails;
        }, error => {
          console.error(`Erreur pendant la récupération des détails des contrats pour ${contractCategory}:`, error);
        });
      }
    });
  }
    

  editCompany() {
    this.router.navigate(['/company-update', this.id]);
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

    /**
   * Gère la sélection d'un utilisateur.
   * @param user L'utilisateur sélectionné.
   */
  selectUser(user: any) {
    console.log('Utilisateur sélectionné:', user);
    this.router.navigate(['/user-detail', user._id]);
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


