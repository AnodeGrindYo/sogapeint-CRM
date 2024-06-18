import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailSchedulerService } from '../../core/services/email-scheduler.service';
import { ContractService } from '../../core/services/contract.service';
import { BenefitService } from 'src/app/core/services/benefit.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-contract-email-scheduler',
  templateUrl: './contract-email-scheduler.component.html',
  styleUrls: ['./contract-email-scheduler.component.scss', '../order-detail/order-detail.component.scss'],
  providers: [DatePipe]
})
export class ContractEmailSchedulerComponent implements OnInit {
  @Input() contractId: string;
  emailScheduleForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  infoMessage: string | null = null;
  emailSchedule: any;
  contracts: any[] = []; // Liste des contrats avec le même numéro interne
  internalNumber: string | null = null; // Numéro interne du contrat
  benefits: any[];

  constructor(
    private fb: FormBuilder,
    private emailSchedulerService: EmailSchedulerService,
    private contractService: ContractService,
    private benefitService: BenefitService,
    private datePipe: DatePipe
  ) {
    this.emailScheduleForm = this.fb.group({
      nextEmailDate: ['', Validators.required],
      interval: [3, [Validators.required, Validators.min(1)]],
      enabled: [false]
    });
  }

  ngOnInit(): void {
    console.log('Contract ID:', this.contractId);
    this.loadBenefits();
    this.getContractInternalNumber();
    this.getEmailSchedule();
  }

  getContractInternalNumber(): void {
    this.contractService.getContractById(this.contractId).subscribe(
      (contract) => {
        this.internalNumber = contract.internal_number;
        console.log('Internal Number:', this.internalNumber);
        this.getContractsByInternalNumber();
      },
      (error) => {
        console.error('Erreur lors de la récupération du contrat:', error);
        this.errorMessage = 'Erreur lors de la récupération du contrat.';
      }
    );
  }

  getContractsByInternalNumber(): void {
    if (this.internalNumber) {
      this.contractService.getContractsByInternalNumber(this.internalNumber).subscribe(
        (contracts) => {
          this.contracts = contracts;
          console.log(`Contrats avec le numéro interne ${this.internalNumber}:`, this.contracts);
        },
        (error) => {
          console.error('Erreur lors de la récupération des contrats par numéro interne:', error);
          this.errorMessage = 'Erreur lors de la récupération des contrats par numéro interne.';
        }
      );
    }
  }

  getEmailSchedule(): void {
    this.isLoading = true;
    this.emailSchedulerService.getEmailSchedule(this.contractId).subscribe(
      (data) => {
        if (data.nextEmailDate || data.interval !== null) {
          this.emailSchedule = data; // Stocker les données récupérées
          this.emailScheduleForm.patchValue({
            nextEmailDate: this.transformDate(data.nextEmailDate),
            interval: data.interval,
            enabled: data.enabled
          });

          if (!data.enabled) {
            this.infoMessage = "Les emails récurrents sont désactivés pour cette commande.";
          } else {
            this.infoMessage = null;
          }
        } else {
          this.emailSchedule = {
            nextEmailDate: null,
            interval: 3,
            enabled: false
          };
          this.infoMessage = "Aucun email n'a été planifié pour cette commande.";
        }
        this.isLoading = false;
        console.log('Planning des emails:', data);
      },
      (error) => {
        console.error('Erreur lors de la récupération du planning des emails:', error);
        this.errorMessage = 'Erreur lors de la récupération du planning des emails.';
        this.isLoading = false;
      }
    );
  }

  transformDate(date: string): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  // updateEmailSchedule(): void {
  //   if (this.emailScheduleForm.invalid || !this.canScheduleEmails()) {
  //     return;
  //   }
  //   this.isLoading = true;
  //   console.log('Mise à jour du planning des emails:', this.emailScheduleForm.value);
  //   this.emailSchedulerService.updateEmailSchedule(this.contractId, this.emailScheduleForm.value).subscribe(
  //     (response) => {
  //       console.log('Planning des emails mis à jour:', response);
  //       this.successMessage = '';
  //       this.errorMessage = '';
  //       this.successMessage = 'Planning des emails mis à jour avec succès.';
  //       this.infoMessage = !this.emailScheduleForm.value.enabled ? "Les emails récurrents sont désactivés pour cette commande." : null;
  //       this.isLoading = false;
  //     },
  //     (error) => {
  //       console.error('Erreur lors de la mise à jour du planning des emails:', error);
  //       this.successMessage = '';
  //       this.errorMessage = '';
  //       this.errorMessage = 'Erreur lors de la mise à jour du planning des emails.';
  //       this.isLoading = false;
  //     }
  //   );
  // }
  updateEmailSchedule(): void {
    if (this.emailScheduleForm.invalid) {
        return;
    }
    this.isLoading = true;

    const formData = this.emailScheduleForm.value;

    if (!formData.enabled) {
        // Désactiver les emails récurrents
        this.emailSchedulerService.deleteEmailSchedule(this.contractId).subscribe(
            (response) => {
                console.log('Planning des emails supprimé:', response);
                this.errorMessage = null;
                this.successMessage = 'Planning des emails désactivé avec succès.';
                this.isLoading = false;
            },
            (error) => {
                console.error('Erreur lors de la désactivation du planning des emails:', error);
                this.successMessage = null;
                this.errorMessage = 'Erreur lors de la désactivation du planning des emails.';
                this.isLoading = false;
            }
        );
    } else {
        // Activer ou mettre à jour les emails récurrents
        this.emailSchedulerService.updateEmailSchedule(this.contractId, formData).subscribe(
            (response) => {
                console.log('Planning des emails mis à jour:', response);
                this.successMessage = 'Planning des emails mis à jour avec succès.';
                this.isLoading = false;
            },
            (error) => {
                console.error('Erreur lors de la mise à jour du planning des emails:', error);
                this.errorMessage = 'Erreur lors de la mise à jour du planning des emails.';
                this.isLoading = false;
            }
        );
    }
}

  loadBenefits() {
    this.benefitService.getBenefits().subscribe({
      next: (benefits) => {
        this.benefits = benefits;
        console.log("Prestations chargées", benefits);
      },
      error: (error) => {
        console.error("Erreur lors du chargement des prestations", error);
      },
    });
  }

  // un benefit a un _id et un name. Cette fonction permet de récupérer le nom d'une prestation à partir de son _id
  getBenefitName(benefitId: string): string {
    const benefit = this.benefits.find((benefit) => benefit._id === benefitId);
    return benefit ? benefit.name : "";
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

  // Vérifie si toutes les commandes ont le statut "achieve" ou "canceled"
  canScheduleEmails(): boolean {
    return this.contracts.every(contract => 
      contract.status === 'achieve' || contract.status === 'canceled'
    );
  }
}
