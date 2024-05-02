import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../../core/services/contract.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import { BenefitService } from 'src/app/core/services/benefit.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { User } from 'src/app/core/models/auth.models';
import { Router } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap } from 'rxjs';


@Component({
  selector: 'app-order-detail-cocontractor',
  templateUrl: './order-detail-cocontractor.component.html',
  styleUrls: ['./order-detail-cocontractor.component.scss']
})
export class OrderDetailCocontractorComponent implements OnInit {
  breadCrumbItems: Array<{ label: string; url?: string; active?: boolean }> = [
    { label: 'Accueil', url: '/', active: false },
    { label: 'Liste des commandes', url: '/orders', active: false },
    { label: 'Détail Commande', active: true }
  ];
  contract: any; // Contiendra les détails de la commande
  contractId: string = '';
  difference_hours: number = 0;
  status: string = '';
  showSecretDiv: boolean = false;
  private konamiCode: string[] = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  private currentInput: string[] = [];
  customer: any;
  coContractor: any;
  sogapeintContact: any;
  subcontractor: any;
  contact: any;
  currentUser: User;
  benefit_name: string = '';
  

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService,
    private userProfileService: UserProfileService,
    private benefitService: BenefitService,
    private companyService: CompanyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.userProfileService.getCurrentUser();
    console.log('currentUser', this.currentUser);
    // extrait l'identifiant de la commande de l'URL
    this.contractId = this.route.snapshot.params['orderId'];
    this.route.params.subscribe(params => {
      const contractId = params['orderId']; // Vérifier que 'id' correspond au nom de paramètre défini dans votre route
      if (contractId) {
        this.loadContractDetails(contractId);
      }
      
    }).add(() => {
      const totalPrevisionHours = (Number(this.contract.get("previsionDataDay").value) * 8) + Number(this.contract.get("previsionDataHour").value);
      const totalExecutionHours = (Number(this.contract.get("executionDataDay").value) * 8) + Number(this.contract.get("executionDataHour").value);
      this.difference_hours = totalExecutionHours - totalPrevisionHours;
      // this.benefit_name = this.getBenefitName(this.contract.get("benefit").value);
      // this.status = this.getStatus(this.contract.get("status").value);
      // console.log("status", this.contract.get("status").value);
    });
  }

  loadContractDetails(contractId: string) {
    this.contractService.getContractById(contractId).subscribe({
      next: (data) => {
        this.contract = data;
        // this.files = this.contract.file;
        console.log('Détails de la commande chargés', this.contract);
        
        // si on a réussi à charger le contrat, on va chercher les détails 
        // du client, du co-traitant, du contact sogapeint et du sous-traitant
        if (this.contract) {
          // this.patchExternalContributorInvoiceDate();
          this.loadUserDetails();
          this.benefit_name = this.getBenefitName(this.contract.benefit);
        }
      },
      error: (error) => console.error('Erreur lors du chargement des détails de la commande', error)
    })
  }

  loadUserDetails(){
    console.log('Chargement des détails des utilisateurs');
        this.userProfileService.getOne(this.contract.customer).subscribe({
          next: (data) => {
            this.customer = data;
            console.log('Détails du client chargés', data);
          },
          error: (error) => console.error('Erreur lors du chargement des détails du client', error)
        });
        if (this.contract.external_contributor){
          this.userProfileService.getOne(this.contract.external_contributor).subscribe({
            next: (data) => {
              this.coContractor = data;
              console.log('Détails du co-traitant chargés', data);
            },
            error: (error) => console.error('Erreur lors du chargement des détails du co-traitant', error)
          });
        }
          
        if (this.contract.internal_contributor) {
          this.userProfileService.getOne(this.contract.internal_contributor).subscribe({
            next: (data) => {
              this.sogapeintContact = data;
              console.log('Détails du contact Sogapeint chargés', data);
            },
            error: (error) => console.error('Erreur lors du chargement des détails du contact Sogapeint', error)
          });
        }
        
        if (this.contract.subcontractor) {
          this.userProfileService.getOne(this.contract.subcontractor).subscribe({
            next: (data) => {
              this.subcontractor = data;
              console.log('Détails du sous-traitant chargés', data);
            },
            error: (error) => console.error('Erreur lors du chargement des détails du sous-traitant', error)
          });
        }

        if (this.contract.contact) {
          this.userProfileService.getOne(this.contract.contact).subscribe({
            next: (data) => {
              this.contact = data;
              console.log('Détails du contact chargés', data);
            },
            error: (error) => console.error('Erreur lors du chargement des détails du contact', error)
          });
        }
        
  }

  // la méthode getBenefits du service BenefitService retourne la liste des prestations avec deux clés: _id et name
  getBenefitName(benefitId: string): string {
    // Récupérer la liste des prestations
    this.benefitService.getBenefits().subscribe({
      next: (benefits) => {
        // Trouver la prestation correspondant à l'identifiant
        const benefit = benefits.find(benefit => benefit._id === benefitId);
        // Retourner le nom de la prestation si trouvée, sinon une chaîne vide
        this.benefit_name = benefit ? benefit.name : '';
      },
      error: (error) => console.error('Erreur lors de la récupération des prestations', error)
    });
    return this.benefit_name;
  }

  getStatus(value: string | null): string {
    // Dictionnaire de statuts
    const statusDict: { [key: string]: string } = {
      'in_progress': 'En cours',
      'null': 'En cours', // Utiliser 'null' comme chaîne pour représenter la valeur null
      'achieve': 'Réalisé',
      'canceled': 'Annulé',
      'invoiced': 'Facturé',
      'anomaly': 'Anomalie'
    };
  
    // Convertir la valeur null en chaîne 'null' pour la recherche dans le dictionnaire
    const keyValue = value === null ? 'null' : value;
  
    // Retourner le nom du statut correspondant ou 'Statut inconnu' si non trouvé
    return statusDict[keyValue] || 'Statut inconnu';
  }
  

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.currentInput.push(event.key);
    if (this.currentInput.length > this.konamiCode.length) {
      this.currentInput.shift();
    }
    if (this.konamiCode.every((code, index) => code === this.currentInput[index])) {
      this.showSecret();
    }
  }

  showSecret() {
    // scrolle automatiquement vers le haut de la page
    window.scrollTo(0, 0);
    this.showSecretDiv = true;
    setTimeout(() => this.showSecretDiv = false, 5000);
  }

  isAdminOrSuperAdmin(): boolean {
    const result = this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'superAdmin');
    // console.log('isAdminOrSuperAdmin:', result);
    return result;
  }

  goToEditOrder() {
    // Rediriger vers la page de mise à jour de la commande
    // 'order-update/:orderId'
    this.router.navigate([`/order-update-cocontractor/${this.contract._id}`]);
  }

  getCompanyNameFromUserId(userId: string): Observable<string> {
    return this.userProfileService.getOne(userId).pipe(
        switchMap(user => {
            console.log('User data:', user);
            if (!user.company) return of(''); // Retourner une chaîne vide si aucun identifiant de l'entreprise n'est trouvé
            return this.companyService.searchCompanies(user.company).pipe(
                map(companies => {
                    if (companies.length > 0) {
                        console.log('Company data:', companies);
                        return companies[0]["normalized_name"];
                    } else {
                        return ''; // Retourner une chaîne vide si aucune entreprise n'est trouvée
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la récupération de l'entreprise", error);
                    return of(''); // Retourner une chaîne vide en cas d'erreur
                })
            );
        }),
        catchError(error => {
            console.error("Erreur lors de la récupération de l'utilisateur", error);
            return of(''); // Retourner une chaîne vide en cas d'erreur
        })
    );
  }

  replaceUsersByTheirCompanies(): void {
    // external contributor
    this.contract.get('external_contributor').valueChanges.subscribe((userId: string) => {
      this.getCompanyNameFromUserId(userId).subscribe(companyName => {
        console.log('external contributor company name:', companyName);
        this.contract.patchValue({ external_contributor: companyName }, { emitEvent: false });
      });
    });

    // subcontractor
    this.contract.get('subcontractor').valueChanges.subscribe((userId: string) => {
      this.getCompanyNameFromUserId(userId).subscribe(companyName => {
        console.log('subcontractor company name:', companyName);
        this.contract.patchValue({ subcontractor: companyName }, { emitEvent: false });
      });
    });
  }

}
