import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesService, Invoice } from '../../../core/services/invoices.service';
import { UserProfileService } from '../../../core/services/user.service';
import { ContractService } from '../../../core/services/contract.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-invoices-management',
  standalone: false,
  templateUrl: './invoices-management.component.html',
  styleUrls: ['./invoices-management.component.scss']
})
export class InvoicesManagementComponent implements OnInit {
  files: any[] = [];
  currentUser: any;
  contract:any;
  sogapeintContact: any;
  cocontractor: any;
  subcontractor: any;
  contact: any;
  customer: any;
  benefit_name: string = '';
  benefits: any[] = [];
  selectedFiles: any[] = [];
  selected_invoice: any;
  errorMessages: string[] = [];
  filteredFiles: any[] = [];
  filter: 'unprocessed' | 'processed' | 'all';
  filterText: string = 'Factures non traitées';

  constructor(
    private invoicesService: InvoicesService, 

    private userProfileService: UserProfileService,
    private contractService: ContractService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    console.log("Initialisation du composant InvoicesManagement");
    this.currentUser = this.userProfileService.getCurrentUser();
    this.loadFiles();
    this.setFilter('unprocessed');
  }

  loadFiles() {
    console.log("Chargement des factures");
    this.invoicesService.getInvoices().subscribe({
      next: (data) => {
        console.log("Données reçues pour les factures:", data);
        this.files = data.filter(file => file.name.startsWith('invoice_'));
        this.applyFilter();
        console.log("Factures filtrées:", this.files);
      },
      error: (error) => {
        console.error("Erreur lors du chargement des factures", error);
        this.files = [];
      }
    });
  }

  applyFilter() {
    console.log("Application du filtre : ", this.filter);
    if (this.filter === 'unprocessed') {
      this.filteredFiles = this.files.filter(file => file.processed === undefined || file.processed === false);
      console.log("Factures non traitées:", this.filteredFiles);
      this.filterText = 'Factures non traitées';
    } else if (this.filter === 'processed') {
      this.filteredFiles = this.files.filter(file => file.processed === true);
      console.log("Factures traitées:", this.filteredFiles);
      this.filterText = 'Factures traitées';
    } else {
      this.filteredFiles = this.files;
      console.log("Toutes les factures:", this.filteredFiles);
      this.filterText = 'Toutes les factures';
    }
  }
  

  setFilter(filter: 'unprocessed' | 'processed' | 'all') {
    this.filter = filter;
    this.applyFilter();
    this.updateCubeRotation();
  }

  updateCubeRotation() {
    const cube = document.querySelector('.cube') as HTMLElement;
    if (cube) {
      if (this.filter === 'unprocessed') {
        cube.style.setProperty('--rotate', '0deg');
      } else if (this.filter === 'processed') {
        cube.style.setProperty('--rotate', '120deg');
      } else {
        cube.style.setProperty('--rotate', '240deg');
      }
    }
  }

  onFileDownload(file: any) {
    console.log("Téléchargement du fichier", file);
    this.invoicesService.getFile(file._id, file.contractId).subscribe({
      next: (data) => {
        console.log("Fichier téléchargé", data);
        const url = window.URL.createObjectURL(data);
        window.open(url);
      },
      error: (error) => console.error("Erreur lors du téléchargement du fichier", error)
    });
  }

  removeFile(file: any) {
    console.log("Suppression du fichier", file);

  }

  onFilePrint(file: any) {
    console.log("Impression du fichier", file);
    this.invoicesService.getFile(file._id, file.contractId).subscribe({
      next: (data) => {
        console.log("Fichier téléchargé pour impression", data);
        const url = window.URL.createObjectURL(data);
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none'; // Optionnel pour garantir qu'il est invisible
        iframe.src = url;
  
        document.body.appendChild(iframe); // Ajout de l'iframe au document
  
        iframe.onload = () => {
          console.log('iframe loaded');
          setTimeout(() => {
            if (iframe.contentWindow) {
              iframe.contentWindow.print();
            } else {
              console.error('Impossible de trouver la fenêtre de contenu de l\'iframe.');
            }
            document.body.removeChild(iframe); // Suppression de l'iframe après l'impression
          }, 500);  // Delay for ensuring the content is ready
        };
      },
      error: (error) => console.error("Erreur lors de l'impression du fichier", error)
    });
  }
  

  onFileCheckbox(event: any, file: any) {
    file.selected = event.target.checked;
    this.updateSelectedFiles();
  }

  onSelectAll(event: any) {
    const checked = event.target.checked;
    this.files.forEach(file => {
      file.selected = checked;
    });
    this.updateSelectedFiles();
  }

  updateSelectedFiles() {
    this.selectedFiles = this.files.filter(file => file.selected);
    console.log("Selected files:", this.selectedFiles);
  }

  openInvoiceDetailsModal(content: any, contractId: string, file:any) {
    this.selected_invoice = file;
    console.log(file);
    this.contractService.getContractById(contractId).subscribe({
      next: (contract) => {
        console.log("Contrat reçu pour affichage des détails de la facture", contract);
        this.contract = contract;
        this.loadUserDetails();
        this.sogapeintContact = this.userProfileService.getOne(contract.sogapeintContact);
        const modalRef = this.modalService.open(content, { size: 'lg' });

      },
      error: (error) => console.error("Erreur lors du chargement de la commande", error)
    });
  }

  getStatus(value: string | null): string {

    const statusDict: { [key: string]: string } = {
      'in_progress': 'En cours',
      'null': 'En cours', 
      'achieve': 'Réalisé',
      'canceled': 'Annulé',
      'invoiced': 'Facturé',
      'anomaly': 'Anomalie'
    };

    const keyValue = value === null ? 'null' : value;

    return statusDict[keyValue] || 'Statut inconnu';
  }

  copyToClipboard(value: any): void {
    const el = document.createElement('textarea');
    el.value = value;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    console.log('Valeur copiée dans le presse-papiers:', value);
  }

  openInvoiceInNewTab(): void {
    const invoiceUrl = 'URL_TO_YOUR_INVOICE';  
    window.open(invoiceUrl, '_blank');
  }

  // printInvoice(): void {
  //   if (this.contract && this.contract._id) {
  //     alert(this.selected_invoice._id + ' ' + this.contract._id)
  //     console.log('printing selected invoice:', this.selected_invoice._id, this.contract._id)
  //     this.contractService.getFile(this.selected_invoice._id, this.contract._id).subscribe({
  //       next: (data) => {
  //         const url = window.URL.createObjectURL(data);
  //         const iframe = document.createElement('iframe');
  //         iframe.style.position = 'absolute';
  //         iframe.style.width = '0';
  //         iframe.style.height = '0';
  //         iframe.src = url;
  //         document.body.appendChild(iframe);
  //         iframe.contentWindow?.print();
  //         document.body.removeChild(iframe);
  //       },
  //       error: (error) => console.error("Erreur lors de l'impression de la facture", error)
  //     });
  //   } else {
  //     console.error('Aucune facture à imprimer.');
  //   }
  // }
  printInvoice(): void {
    console.log('printing selected invoice:', this.selected_invoice._id, this.contract._id);
    console.log('contract:', this.contract);
  
    if (this.contract) {
      this.contractService.getFile(this.selected_invoice._id, this.contract._id).subscribe({
        next: (data) => {
          console.log('data:', data);
          const url = window.URL.createObjectURL(data);
          const iframe = document.createElement('iframe');
          iframe.style.position = 'absolute';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = 'none'; // Optionnel pour garantir qu'il est invisible
          iframe.src = url;
  
          document.body.appendChild(iframe); // Ajout de l'iframe au document
  
          iframe.onload = () => {
            console.log('iframe loaded');
            setTimeout(() => {
              if (iframe.contentWindow) {
                iframe.contentWindow.print();
              } else {
                console.error('Impossible de trouver la fenêtre de contenu de l\'iframe.');
              }
              document.body.removeChild(iframe); // Suppression de l'iframe après l'impression
            }, 500);  // Delay for ensuring the content is ready
          };
        },
        error: (error) => console.error("Erreur lors de l'impression de la facture", error)
      });
    } else {
      console.error('Aucune facture à imprimer.');
    }
  }
  
  
  
  
  
  

  validateInvoice(): void {

    console.log('Validation de la facture...');
    if (this.contract && this.contract._id) {
      this.contractService.updateContract(this.contract._id, { status: 'processed' }).subscribe({
        next: (data) => {
          console.log('Contrat mis à jour avec succès', data);
          this.contract = data;
          // fermer le modal
          this.modalService.dismissAll();
          // recharger les factures
          this.loadFiles();
          this.setFilter('unprocessed');
          this.contractService.updateFile(this.selected_invoice._id, {"processed": true}).subscribe({
            next: (data) => {
              console.log('Facture marquée comme traitée', data);
              this.loadFiles();
              this.setFilter('unprocessed');
            },
            error: (error) => console.error('Erreur lors de la mise à jour de la facture', error)
          });
        },
        error: (error) => console.error('Erreur lors de la mise à jour du contrat', error)
      });
    } else {
      console.error('Aucune facture à valider.');
    }
  }

  // validateSelectedInvoices(): void {
  //   console.log('Factures sélectionnées pour validation:', this.selectedFiles);
  //   // Implement validation logic here

  //   // pluie de pièces
  //   const button = document.querySelector('.btn-primary');
  //   if (button) {
  //     for (let i = 0; i < 30; i++) {
  //       const coin = document.createElement('div');
  //       coin.className = 'coin';
  //       coin.style.left = `${Math.random() * 100}%`;
  //       coin.style.animationDelay = `${Math.random()}s`;
  //       button.appendChild(coin);
  //       setTimeout(() => coin.remove(), 1500); // Adjust the timeout to match the animation duration
  //     }
  //   }
  // }
  validateSelectedInvoices(): void {
    console.log('Factures sélectionnées pour validation:', this.selectedFiles);
    if (this.selectedFiles.length === 0) {
        console.warn('Aucune facture sélectionnée pour la validation.');
        return;
    }

    const updateInvoice = (invoice: any) => {
        return new Promise((resolve, reject) => {
            this.contractService.updateFile(invoice._id, { processed: true }).subscribe({
                next: (data) => {
                    console.log('Facture marquée comme traitée', data);
                    resolve(data);
                },
                error: (error) => {
                    console.error('Erreur lors de la mise à jour de la facture', error);
                    reject(error);
                }
            });
        });
    };

    const updatePromises = this.selectedFiles.map(file => updateInvoice(file));

    Promise.all(updatePromises)
        .then(results => {
            console.log('Toutes les factures sélectionnées ont été validées avec succès');
            this.loadFiles();
            this.setFilter('unprocessed');
            // pluie de pièces
            const button = document.querySelector('.btn-primary');
            if (button) {
                for (let i = 0; i < 30; i++) {
                    const coin = document.createElement('div');
                    coin.className = 'coin';
                    coin.style.left = `${Math.random() * 100}%`;
                    coin.style.animationDelay = `${Math.random()}s`;
                    button.appendChild(coin);
                    setTimeout(() => coin.remove(), 1500); // Adjust the timeout to match the animation duration
                }
            }
        })
        .catch(error => {
            console.error('Erreur lors de la validation des factures sélectionnées', error);
        });
}


  getBenefitName(benefitId: string): string {
    const benefit = this.benefits.find((benefit) => benefit._id === benefitId);
    return benefit ? benefit.name : "";
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
          this.cocontractor = data;
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

  printAllSelectedFiles() {
    this.clearErrorMessages();
    this.selectedFiles.forEach(file => {
      this.invoicesService.getFile(file._id, file.contractId).subscribe({
        next: (data) => {
          const url = window.URL.createObjectURL(data);
          const iframe = document.createElement('iframe');
          iframe.style.position = 'absolute';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = 'none'; // Optionnel pour garantir qu'il est invisible
          iframe.src = url;

          document.body.appendChild(iframe); // Ajout de l'iframe au document

          iframe.onload = () => {
            console.log('iframe loaded');
            setTimeout(() => {
              if (iframe.contentWindow) {
                iframe.contentWindow.print();
              } else {
                this.errorMessages.push(`Impossible de trouver la fenêtre de contenu de l'iframe pour le fichier ${file.name}.`);
              }
              document.body.removeChild(iframe); // Suppression de l'iframe après l'impression
            }, 500);  // Delay for ensuring the content is ready
          };
        },
        error: (error) => {
          console.error("Erreur lors de l'impression du fichier", error);
          this.errorMessages.push(`Erreur lors de l'impression du fichier ${file.name}: ${error.message || error}`);
        }
      });
    });
  }

  clearErrorMessages() {
    this.errorMessages = [];
  }

}