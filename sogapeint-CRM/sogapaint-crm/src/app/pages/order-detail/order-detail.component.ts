import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../../core/services/contract.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/auth.models';
import { Router } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';


@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
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
  files: File[] = [];
  files_to_upload: File[] = [];
  benefit_name: string = '';
  

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService,
    private userProfileService: UserProfileService,
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
          this.loadUserDetails();
        }
      },
      error: (error) => console.error('Erreur lors du chargement des détails de la commande', error)
    }).add(() => {
      // Récupération de la liste des fichiers associés à la commande
      this.files = this.contract.file;
      console.log('Fichiers associés à la commande', this.files);
    });
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

  getBenefitName(benefitId: string): string {
    // Mapping des identifiants aux noms des bénéfices
    const benefitsMap: { [key: string]: string } = {
      '5e4ba27006d62fd4a4e49916': 'Peinture',
      '5e4ba27606d62fd4a4e49917': 'Sol',
      '5e52cb8148f8b27b3d077a84': 'Électricité',
      '5e52cb8148f8b27b3d077a85': 'Plomberie',
      '5e52cb8148f8b27b3d077a86': 'Maçonnerie',
      '5e52cb8148f8b27b3d077a87': 'Menuiserie',
      '5e52cb8148f8b27b3d077a88': 'Vitrification',
      '5e52cb8148f8b27b3d077a89': 'Nettoyage',
      '5f58fef3bfdad857fcfbba50': 'Faïence',
      '5f58fefdbfdad857fcfbba51': 'Placo',
      '5f58ff06bfdad857fcfbba52': 'Carrelage'
    };
  
    // Retourne le nom du bénéfice correspondant à l'identifiant, ou une chaîne vide si non trouvé
    return benefitsMap[benefitId] || 'Identifiant non reconnu';
  }

  getStatus(value: string | null): string {
    // Dictionnaire de statuts
    const statusDict: { [key: string]: string } = {
      'in_progress': 'En cours',
      'null': 'À réaliser', // Utiliser 'null' comme chaîne pour représenter la valeur null
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
    this.router.navigate([`/order-update/${this.contract._id}`]);
  }



  onFileDownload(file: any) { // TODO à tester
    console.log('Téléchargement du fichier', file);
    this.contractService.getFile(file._id, this.contract._id).subscribe({
      next: (data) => {
        console.log('Fichier téléchargé', data);
        const url = window.URL.createObjectURL(data);
        window.open(url);
      },
      error: (error) => console.error('Erreur lors du téléchargement du fichier', error)
    });
  }

  onSelect(event) {
    console.log(event);
    // this.files.push(...event.addedFiles);
    this.files_to_upload.push(...event.addedFiles)
    this.uploadFile(this.files_to_upload);
    this.files_to_upload = [];
  }

  uploadFile(files: File[]) {
    console.log('Fichier à télécharger', files);

    this.contractService.uploadFiles(this.contractId, files).subscribe(
      event => {
        // Traite les événements de la réponse
        if (event.type === HttpEventType.UploadProgress) {
          // suivi de la progression
          const percentDone = Math.round(100 * event.loaded / event.total);
          console.log(`Progression de l'upload: ${percentDone}%`);
        } else if (event instanceof HttpResponse) {
          console.log('Fichiers complètement uploadés!', event.body);
          this.files = event.body.files;
        }
      },
      error => {
        console.error("Erreur lors de l'upload des fichiers", error);
      }
    );
  }
}
