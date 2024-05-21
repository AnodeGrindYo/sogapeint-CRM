import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContractService } from '../../core/services/contract.service';
import { CompanyService } from '../../core/services/company.service';
import { UserProfileService } from '../../core/services/user.service';
import { BenefitService } from 'src/app/core/services/benefit.service';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  breadCrumbItems: Array<{}> = [];
  orderForm: FormGroup;
  contractData: any = {
    internalNumberAbbrPart: '', // Nouveau champ ajouté
    internalNumberNumericPart: '',
    customer: '',
    contact: '',
    internalContributor: '',
    externalContributor: '',
    subcontractor: '', // Nouveau champ ajouté
    address: '',
    appartmentNumber: '',
    ss4: false,
    quoteNumber: '',
    mailSended: false,
    invoiceNumber: '',
    amountHt: null,
    externalContributorAmount: 0,
    external_contributor_invoice_date: null,
    subcontractorAmount: 0,
    // benefitHt: null,
    previsionDataHour: 0, // Nouveau champ ajouté
    previsionDataDay: 0,  // Nouveau champ ajouté
    executionDataDay: 0,
    executionDataHour: 0,
    difference: 0,
    benefit: null,
    status: null,
    occupied: false,
    startDateWorks: null,
    endDateWorks: null,
    endDateCustomer: null,
    trash: false,
    dateCde: null,
    billingAmount: 0,
    // ged: '', // Nouveau champ ajouté
  };
  
  users: any[] = [];
  userInput$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();
  currentUser: any;
  
  statuses = [
    { name: 'En cours', value: 'in_progress' || null }, // ou une chaîne vide si nécessaire
    { name: 'Réalisé', value: 'achieve' },
    { name: 'Annulé', value: 'canceled' },
    { name: 'Facturé', value: 'invoiced' },
    { name: 'Anomalie', value: 'anomaly' }
  ];
  
  benefits = [];
  
  internalNumberList: any[] = [];
  abbreviationList: string[] = [];
  fullAbbreviationList: string[] = []; // Liste complète des abréviations chargée initialement
  filteredAbbreviationList: string[] = []; // Liste pour le filtrage et l'affichage
  
  
  invalidKeyStrokes = 0;
  isEmojiVisible = false;
  abbreviationInput$ = new Subject<string>();
  
  files: File[] = [];

  @ViewChild('confirmationModal') confirmationModal;

  // suppression de prestation
  @ViewChild('deleteBenefitModal') deleteBenefitModal;
  replacementBenefit: string;
  benefitToDelete: string;
  filteredBenefits: any[] = [];

  warningMessage: string;
  warningScore: number;
  @ViewChild('warningModal') warningModal;
  isExploding: boolean = false;
  isFalling: boolean = false; // Propriété pour gérer l'état de décrochement du modal
  
  constructor(
    private contractService: ContractService, 
    private userProfileService: UserProfileService,
    private companyService: CompanyService,
    private benefitService: BenefitService,
    private modalService: NgbModal,
    private router: Router,
    private renderer: Renderer2
    ) {}
    
    ngOnInit(): void {
      this.setupBreadCrumbItems();
      this.currentUser = this.userProfileService.getCurrentUser();
      console.log('Utilisateur connecté:', this.currentUser);
      this.initializeOrderForm();
      this.subscribeToFormChanges();
      this.setupUserSearchAndTypeahead();
      this.retrieveDataFromServices();
      this.subscribeToAbbreviationInput();
      this.initializeDateCdeWithCurrentDate();

      // Abonnement aux changements du formulaire pour logguer les modifications
      this.orderForm.valueChanges.subscribe(values => {
        console.log('Modification du formulaire:', values);
        console.log(this.orderForm.status);  // Affiche 'VALID' ou 'INVALID'
        console.log(this.orderForm.errors);  // Affiche les erreurs de formulaire
      });
      this.orderForm.get('invoiceNumber').valueChanges.subscribe(value => {
        console.log('invoiceNumber change:', value);
      });
      Object.keys(this.orderForm.controls).forEach(key => {
        const control = this.orderForm.get(key);
        console.log(key, control.errors);
      });

      this.orderForm.patchValue({
        previsionDataHour: this.contractData.previsionDataHour,
        previsionDataDay: this.contractData.previsionDataDay
      });
    }
    
    private initializeOrderForm(): void {
      this.orderForm = new FormGroup({
        internalNumberAbbrPart: new FormControl(this.contractData.internalNumberAbbrPart, [Validators.pattern(/^[BCDFGHJKLMNPQRSTVWXYZ]{1,5}$/)]),
        internalNumberNumericPart: new FormControl(this.contractData.internalNumberNumericPart, [Validators.pattern(/^\d{3}$/)]),
        customer: new FormControl(this.contractData.customer, Validators.required),
        internalContributor: new FormControl(this.contractData.internalContributor),
        contact: new FormControl(this.contractData.contact),
        externalContributor: new FormControl(this.contractData.externalContributor),
        subcontractor: new FormControl(this.contractData.subcontractor),
        address: new FormControl(this.contractData.address),
        appartmentNumber: new FormControl(this.contractData.appartmentNumber),
        ss4: new FormControl(this.contractData.ss4),
        quoteNumber: new FormControl(this.contractData.quoteNumber),
        mailSended: new FormControl(this.contractData.mailSended),
        invoiceNumber: new FormControl(this.contractData.invoiceNumber),
        amountHt: new FormControl(this.contractData.amountHt, [Validators.pattern(/^\d+\.?\d*$/)]),
        benefitHt: new FormControl(this.contractData.benefitHt, [Validators.pattern(/^\d+\.?\d*$/)]),
        externalContributorAmount: new FormControl(this.contractData.externalContributorAmount, [Validators.pattern(/^\d+\.?\d*$/)]),
        subcontractorAmount: new FormControl(this.contractData.subcontractorAmount, [Validators.pattern(/^\d+\.?\d*$/)]),
        external_contributor_invoice_date: new FormControl(this.contractData.external_contributor_invoice_date),
        previsionDataHour: new FormControl(this.contractData.previsionDataHour, [Validators.pattern(/^\d+\.?\d*$/)]),
        previsionDataDay: new FormControl(this.contractData.previsionDataDay, [Validators.pattern(/^\d+\.?\d*$/)]),
        executionDataDay: new FormControl(this.contractData.executionDataDay, [Validators.pattern(/^\d+\.?\d*$/)]),
        executionDataHour: new FormControl(this.contractData.executionDataHour, [Validators.pattern(/^\d+\.?\d*$/)]),
        difference: new FormControl(this.contractData.difference),
        benefit: new FormControl(this.contractData.benefit),
        status: new FormControl(this.contractData.status),
        occupied: new FormControl(this.contractData.occupied),
        startDateWorks: new FormControl(this.contractData.startDateWorks),
        endDateWorks: new FormControl(this.contractData.endDateWorks),
        endDateCustomer: new FormControl(this.contractData.endDateCustomer),
        trash: new FormControl(this.contractData.trash),
        dateCde: new FormControl(this.contractData.dateCde),
        billingAmount: new FormControl(this.contractData.billingAmount, [Validators.pattern(/^\d+\.?\d*$/)])
      });
    }
    
    private subscribeToFormChanges(): void {
      this.orderForm.valueChanges.subscribe(val => {
        // Logique pour réagir aux changements de valeurs
        this.contractData = { ...this.contractData, ...val };
        this.calculateDifferencesAndAdjustments();
      });
      this.orderForm.get('internalNumberAbbrPart').valueChanges.subscribe(abbr => {
        if (abbr) {
          const nextNumber = this.getNextInternalNumber(abbr);
          this.orderForm.patchValue({
            internalNumberNumericPart: nextNumber
          }, { emitEvent: false }); // Pour éviter une boucle infinie de changements
        }
      });
      // lance calculateDifferencesAndAdjustments lors de la selection d'une prestation ou la modification du montant
      this.orderForm.get('benefit').valueChanges.subscribe(() => {
        this.calculateDifferencesAndAdjustments();
      });
      this.orderForm.get('externalContributorAmount').valueChanges.subscribe(() => {
        this.calculateDifferencesAndAdjustments();
      });
      // 8 previsionDataHour = 1 previsionDataDay, 8 executionDataHour = 1 executionDataDay
      this.orderForm.get('previsionDataHour').valueChanges.subscribe(() => {
        this.calculateDifferencesAndAdjustments();
      });
      this.orderForm.get('previsionDataDay').valueChanges.subscribe(() => {
        this.calculateDifferencesAndAdjustments();
      });
    }
    
    private setupBreadCrumbItems(): void {
      this.breadCrumbItems = [
        { label: 'Accueil', path: '/' },
        { label: 'Saisie d’une commande', active: true }
      ];
    }
    
    private setupUserSearchAndTypeahead(): void {
      this.userInput$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => term ? this.userProfileService.searchUsers(term.toLowerCase()) : of([])),
        takeUntil(this.unsubscribe$)
        ).subscribe(users => {
          this.users = users;
        });
      }
      
      private retrieveDataFromServices(): void {
        this.getInternalNumbers();
        this.loadBenefits();
        this.getAbbreviationList();
      }
      
      private subscribeToAbbreviationInput(): void {
        this.abbreviationInput$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(term => {
            if (term) {
              const lowerCaseTerm = term.toLowerCase();
              return of(this.fullAbbreviationList.filter(abbr => abbr.toLowerCase().includes(lowerCaseTerm)));
            } else {
              return of(this.fullAbbreviationList);
            }
          }),
          takeUntil(this.unsubscribe$)
          ).subscribe(filteredAbbreviations => {
            this.filteredAbbreviationList = filteredAbbreviations;
          });
        }
        
        private calculateDifferencesAndAdjustments(): void {
          // console.log('Calcul des différences et ajustements');
          const totalPrevisionHours = (Number(this.orderForm.get("previsionDataDay").value) * 8) + Number(this.orderForm.get("previsionDataHour").value);
          const totalExecutionHours = (Number(this.orderForm.get("executionDataDay").value) * 8) + Number(this.orderForm.get("executionDataHour").value);
          const difference = totalExecutionHours - totalPrevisionHours;
          
          // Ajuste previsionDataHour en fonction de la prestation
          const benefitId = this.orderForm.get("benefit").value;
          const benefitType = this.benefits.find(benefit => benefit.value === benefitId)?.name;
          const amount= Number(this.orderForm.get("benefitHt").value);
          // console.log('Montant:', amount);
          // console.log('Type de prestation:', benefitType);
          let divider = 0;
          let hours = 0;
          if (benefitType === 'Peinture') {
            divider = 450;
          } else if (benefitType === 'Sol') {
            divider = 650;
          } else {
            divider = 450; // Pour tout le reste
          }

          hours = amount / divider;
          // console.log('Heures:', hours);

          // arrondir à 2 décimales
          hours = Math.round(hours * 100) / 100;

          // 8 previsionDataHour = 1 previsionDataDay, 8 executionDataHour = 1 executionDataDay
          const daysPrevision = Math.floor(hours / 8);
          const hoursPrevision = hours % 8;
          // console.log('Jours prévus:', daysPrevision);
          // console.log('Heures prévues:', hoursPrevision);


  
          this.orderForm.patchValue({ 
            previsionDataHour: hours, // Mise à jour de previsionDataHour sans déclencher un nouvel événement de changement
            previsionDataDay: daysPrevision,
            executionDataDay: Math.floor(totalExecutionHours / 8),  // Mise à jour de executionDataDay sans déclencher un nouvel événement de changement
            difference: difference 
          }, { emitEvent: false });
          
          this.orderForm.patchValue({
            previsionDataHour: hours,
            difference: difference
          }, { emitEvent: false });
        }
        
        private initializeDateCdeWithCurrentDate(): void {
          const today = new Date();
          const formattedDate = [
            today.getFullYear(),
            (today.getMonth() + 1).toString().padStart(2, '0'),
            today.getDate().toString().padStart(2, '0')
          ].join('-');
          
          this.orderForm.patchValue({
            dateCde: formattedDate,
          });

          // initialise la date de facturation du contributeur externe (deux jours après dateCde)
          this.initializeExternalContributorInvoiceDate();
        }

        // initialise la date de facturation du contributeur externe (deux jours après dateCde)
        initializeExternalContributorInvoiceDate(): void {
          const dateCde = new Date(this.orderForm.get('dateCde').value);
          const externalContributorInvoiceDate = new Date(dateCde.setDate(dateCde.getDate() + 2));
          const formattedDate = [
            externalContributorInvoiceDate.getFullYear(),
            (externalContributorInvoiceDate.getMonth() + 1).toString().padStart(2, '0'),
            externalContributorInvoiceDate.getDate().toString().padStart(2, '0')
          ].join('-');
          
          this.orderForm.patchValue({
            external_contributor_invoice_date: formattedDate,
          });
        }

        compareWithFn = (o1, o2) => {
          return o1 && o2 ? o1._id === o2._id : o1 === o2;
        };
        
        
        loadBenefits() {
          this.benefitService.getBenefits().subscribe(
            (benefitsData) => {
              this.benefits = benefitsData
              .map((benefit) => {
                return { name: benefit.name, value: benefit._id };
              })
              .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
              console.log('Prestations récupérées:', this.benefits);
            },
            (error) => {
              console.error("Erreur lors de la récupération des benefits", error);
            }
            );
          }
          
          
          // récupère et process la liste des numéros internes
          getInternalNumbers() {
            this.contractService.getInternalNumbers().subscribe({
              next: (internalNumbers) => {
                this.internalNumberList = internalNumbers;
                this.initializeInternalNumber();
              },
              // quand tous les numéros internes sont récupérés, affichez-les dans la console
              complete: () => {
                // console.log('Numéros internes récupérés:', this.internalNumberList);
                this.initializeInternalNumber();
              },
              error: (error) => {
                console.error('Erreur lors de la récupération des numéros internes', error);
              }
            });
          }
          
          // Détermine le prochain numéro interne
          getNextInternalNumber(abbr: string): string {
            const filteredNumbers = this.internalNumberList
              .filter(item => item.startsWith(abbr.toUpperCase()))
              .map(item => {
                const match = item.match(/([A-Z]+)-(\d+)/);
                return match ? parseInt(match[2], 10) : null;
              })
              .filter(number => number !== null);
          
            if (filteredNumbers.length === 0) {
              return '001';
            }
          
            const maxNumber = Math.max(...filteredNumbers);
            const nextNumber = maxNumber + 1;
            const nextNumberString = nextNumber.toString().padStart(3, '0');
            return nextNumberString;
          }
          
          initializeInternalNumber(): void {
            console.log('Initialisation du numéro interne');
            const abbr = this.orderForm.get('internalNumberAbbrPart').value;
            if (abbr) {
              const nextNumber = this.getNextInternalNumber(abbr);
              this.orderForm.patchValue({
                internalNumberNumericPart: nextNumber
              });
            }
          }
          
          // Vérifie si la partie numérique numéro interne existe déjà dans la liste
          isInternalNumberNumericPartValid(): boolean {
            return this.internalNumberList.some(item => {
              const match = item.match(/^([A-Z]{3,4}-)(\d{3})$/i); // Modifier selon le format exact des numéros internes
              return match && match[2] === this.contractData.internalNumberNumericPart;
            });
          }
          
          getAbbreviationList(): void {
            this.companyService.getCompaniesAbbreviations().subscribe({
              next: (abbreviations) => {
                this.fullAbbreviationList = abbreviations.filter(abbr => abbr !== null);
                // classe les abréviations par ordre alphabétique
                this.fullAbbreviationList.sort();
                this.filteredAbbreviationList = this.fullAbbreviationList;
                console.log('Abbreviations récupérées:', this.fullAbbreviationList);
              },
              error: (error) => {
                console.error('Erreur lors de la récupération des abréviations', error);
              }
            });
          }
          
          assembleInternalNumber(): string {
            return `${this.contractData.internalNumberAbbrPart.toUpperCase()}-${this.contractData.internalNumberNumericPart}`;
          }
          
          onAlphaInput(event: KeyboardEvent): void {
            
            if (!/[0-9]/.test(event.key) &&
            !['Backspace','ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Enter'].includes(event.key) &&
            !(event.key === 'e' || event.key === '.' || event.key === '-' || event.key === '+')) {
              event.preventDefault(); 
              const inputElement = event.target as HTMLInputElement;
              
              this.invalidKeyStrokes++;
              inputElement.classList.add('input-error');
              
              
              setTimeout(() => {
                inputElement.classList.remove('input-error');
              }, 820); 
              
              // Si trois caractères invalides ont été saisis, affiche l'emoji
              if (this.invalidKeyStrokes >= 3) {
                this.showEmoji();
              }
            }
          }
          
          showEmoji(): void {
            console.log('showEmoji');
            this.isEmojiVisible = true;
            this.invalidKeyStrokes = 0; // Reset le compteur
            
            setTimeout(() => {
              this.isEmojiVisible = false; // Cache l'emoji après un certain temps
            }, 3000); // Durée d'affichage de l'emoji
          }
          
          
          
          
          /**
          * Nettoie les souscriptions lors de la destruction du composant.
          */
          ngOnDestroy() {
            // Signale que toutes les souscriptions doivent être arrêtées
            this.unsubscribe$.next();
            this.unsubscribe$.complete();
          }
          
          onUserInputFocus(): void {
            this.userInput$.next('');
          }
          
          onSubmit(): void {
            if (this.orderForm.valid) {
              console.log("Subcontractor ID from form:", this.orderForm.value.subcontractor);
              // Mise à jour de contractData avec les valeurs de orderForm avant la soumission
              this.contractData = {...this.contractData, ...this.orderForm.value};
              console.log("Updated contractData with form values:", this.contractData);
              this.prepareDataForSubmission(); // Prépare les données juste avant la soumission.
              // this.submitContractData();
              this.openConfirmationModal();
            } else {
              // Afficher des erreurs pour chaque contrôle de formulaire.
              this.displayFormErrors();
            }
          }
          
          private displayFormErrors(): void {
            Object.keys(this.orderForm.controls).forEach(key => {
              const controlErrors = this.orderForm.get(key).errors;
              if (controlErrors) {
                console.error(`${key} errors:`, controlErrors);
              }
            });
          }
          
          private submitContractData(): void {
            console.log('Soumission des données du contrat:', this.contractData);
            this.contractService.addContract(this.contractData).subscribe({
              next: (response) => {
                console.log('Contrat créé avec succès', response);
                // upload des fichiers
                if (this.files.length > 0) {
                  console.log("il y a des fichiers à uploader");
                  this.onFileUpload(this.files, response.contractId);
                }
                // this.router.navigate(['/oder-detail', response.contractId]);
              },
              error: (error) => {
                console.error('Erreur lors de la création du contrat', error);
              }
            });
          }
          
          private prepareDataForSubmission(): void {
            console.log('Préparation des données pour la soumission');
            console.log('Données du contrat avant la préparation:', this.contractData);
            // Convertit chaque clé de l'objet contractData en snake_case.
            const dataForSubmission = {};
            Object.keys(this.contractData).forEach((key) => {
              const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
              dataForSubmission[snakeCaseKey] = this.contractData[key];
            });
            console.log('Données du contrat après la conversion en snake_case:', dataForSubmission);
            
            // Convertit les valeurs booléennes et numériques si nécessaire.
            dataForSubmission['mail_sended'] = this.convertToBoolean(dataForSubmission['mail_sended']);
            dataForSubmission['occupied'] = this.convertToBoolean(dataForSubmission['occupied']);
            dataForSubmission['ss4'] = this.convertToBoolean(dataForSubmission['ss4']);
            dataForSubmission['trash'] = this.convertToBoolean(dataForSubmission['trash']);
            dataForSubmission['amount_ht'] = this.convertToNumber(dataForSubmission['amount_ht']);
            dataForSubmission['benefit_ht'] = this.convertToNumber(dataForSubmission['benefit_ht']);
            dataForSubmission['external_contributor_amount'] = this.convertToNumber(dataForSubmission['external_contributor_amount']);
            dataForSubmission['subcontractor_amount'] = this.convertToNumber(dataForSubmission['subcontractor_amount']);
            // dataForSubmission['benefit_ht'] = this.convertToNumber(dataForSubmission['benefit_ht']);
            dataForSubmission['execution_data_day'] = this.convertToNumber(dataForSubmission['execution_data_day']);
            dataForSubmission['execution_data_hour'] = this.convertToNumber(dataForSubmission['execution_data_hour']);
            dataForSubmission['prevision_data_hour'] = this.convertToNumber(dataForSubmission['prevision_data_hour']);
            dataForSubmission['prevision_data_day'] = this.convertToNumber(dataForSubmission['prevision_data_day']);
            
            // assemble internal number
            dataForSubmission['internal_number'] = this.assembleInternalNumber();
            
            // adds dateUppd and dateAdd (ISO 8601)
            dataForSubmission['dateAdd'] = new Date().toISOString();
            dataForSubmission['dateUppd'] = new Date().toISOString();

            // rajoute un champ createdBy avec l'ID de l'utilisateur connecté
            dataForSubmission['createdBy'] = this.currentUser.userId;
            console.log('createdBy:', this.currentUser.userId);
            
            // Log the data to check if it's correctly formatted for submission.
            console.log('Data prepared for submission', dataForSubmission);
            
            // Store the converted data back to `contractData` for submission.
            this.contractData = dataForSubmission;
          }
          
          
          private convertToBoolean(value: any): boolean {
            return value === true || value === 'true'; // Gère les chaînes de caractères "true" comme booléen vrai
          }
          
          private convertToNumber(value: any): number | null {
            const number = parseFloat(value);
            return isNaN(number) ? null : number; // Convertit en nombre si possible, sinon retourne null
          }
          
          onUserInputBlur(event: any): void {
            // console.log("onUserInputBlur");
            
          }
          
          // GED
          onFileUpload(files: File[], contractId: string) {
            // const fileArray: File[] = Array.from(files);
            console.log("Fichiers à uploader:", files);
            
            this.contractService.uploadFiles(contractId, files).subscribe(
              event => {
                // Traite les événements de la réponse
                if (event.type === HttpEventType.UploadProgress) {
                  // suivi de la progression
                  const percentDone = Math.round(100 * event.loaded / event.total);
                  console.log(`Progression de l'upload: ${percentDone}%`);
                } else if (event instanceof HttpResponse) {
                  console.log('Fichiers complètement uploadés!', event.body);
                }
              },
              error => {
                console.error("Erreur lors de l'upload des fichiers", error);
              }
              );
            }
            
            onSelect(event) {
              console.log(event);
              this.files.push(...event.addedFiles);
            }
            
            removeFile(index: number) {
              this.files.splice(index, 1);
            }

            openConfirmationModal() {
              const modalRef = this.modalService.open(this.confirmationModal); // Utilisez la méthode d'ouverture de votre service de modal
              modalRef.result.then(
                  (result) => {
                      // Ce bloc peut être utilisé si vous avez besoin de gérer une action spécifique à la fermeture du modal
                      // indépendamment des boutons "Oui" et "Non".
                  }, (reason) => {
                      console.log('Modal dismissed', reason); // Log la raison pour laquelle le modal a été fermé sans action
                  });
          }

            // confirmCreation() {
            //   // Soumission de la commande
            //   this.submitContractData();

            //   // fermer le modal
            //   this.modalService.dismissAll();
            
            //   // Réinitialisez les champs spécifiques pour une nouvelle commande
            //   this.orderForm.patchValue({
            //     // Pré-remplir les champs conservés pour une nouvelle commande
            //     customer: this.orderForm.value.customer._id,
            //     contact: this.orderForm.value.contact._id,
            //     address: this.orderForm.value.address,
            //     appartmentNumber: this.orderForm.value.appartmentNumber,
            //     quoteNumber: this.orderForm.value.quoteNumber,
            //     mailSended: this.orderForm.value.mailSended,
            //     invoiceNumber: this.orderForm.value.invoiceNumber,
            //     amountHt: this.orderForm.value.amountHt,
            //     benefitHt: this.orderForm.value.benefitHt,
            //     externalContributorAmount: this.orderForm.value.externalContributorAmount,
            //     subcontractorAmount: this.orderForm.value.subcontractorAmount,
            //     status: this.orderForm.value.status,
            //     startDateWorks: this.orderForm.value.startDateWorks,
            //     endDateWorks: this.orderForm.value.endDateWorks,
            //     endDateCustomer: this.orderForm.value.endDateCustomer,
            //     dateCde: this.orderForm.value.dateCde,
            //     billingAmount: this.orderForm.value.billingAmount,
            //   });
              
            //   // Réinitialiser les champs spécifiques que l'on veut vider
            //   this.orderForm.patchValue({
            //     internalContributor: null,
            //     externalContributor: null,
            //     subcontractor: null,
            //     previsionDataHour: null,
            //     previsionDataDay: null,
            //     executionDataDay: null,
            //     executionDataHour: null,
            //     difference: null,
            //     benefit: null, // réinitialiser la prestation
            //     occupied: false,
            //     trash: false, 
            //   });
              
            
            //   // Réinitialiser/réinitialiser les champs que l'on ne veut pas conserver
            //   this.orderForm.patchValue({
            //     internalContributor: '',
            //     externalContributor: '',
            //     subcontractor: '',
            //     previsionDataHour: 0,
            //     previsionDataDay: 0,
            //     executionDataDay: 0,
            //     executionDataHour: 0,
            //     // Tout autre champ à réinitialiser
            //   });

            //   // init dateCde
            //   this.initializeDateCdeWithCurrentDate();
            // }
            confirmCreation(reuseSameNumber: boolean) {
              this.submitContractData();  // Cette méthode crée la commande
            
              this.modalService.dismissAll();  // Fermer le modal dans tous les cas
            
              if (reuseSameNumber) {
                // Logique pour pré-remplir une nouvelle commande
                this.prepareNewOrder();
              } else {
                // Rediriger vers manageOrders une fois la commande créée
                this.router.navigate(['/manageOrders']);
              }
            }

            private prepareNewOrder() {
              // Réinitialisation spécifique des champs du formulaire pour préparer une nouvelle commande
              this.orderForm.patchValue({
                internalContributor: null,  // Réinitialiser l'intervenant interne
                externalContributor: null,  // Réinitialiser le co-traitant
                subcontractor: null,        // Réinitialiser le sous-traitant
                previsionDataHour: 0,       // Réinitialiser les heures prévues
                previsionDataDay: 0,        // Réinitialiser les jours prévus
                executionDataDay: 0,        // Réinitialiser les jours réalisés
                executionDataHour: 0,       // Réinitialiser les heures réalisées
                difference: 0,              // Réinitialiser la différence d'heures
                benefit: null               // Réinitialiser la prestation
              });
            
              // Conserver les autres champs tels que le client, contact, etc.(pas de code ici pour ces champs n'est nécessaire)
            
              // Affichage d'un message pour confirmer que la nouvelle commande est prête à être saisie
              console.log("Le formulaire a été préparé pour une nouvelle saisie avec certains champs réinitialisés.");
            }
            
            
            // Une fonction d'aide pour trouver l'utilisateur par ID dans la liste chargée
            findUserById(userId: string) {
              return this.users.find(user => user._id === userId);
            }

            private updateContractDataFromForm(): void {
              this.contractData = {
                ...this.contractData,
                ...this.orderForm.value,
                // Conversion manuelle de noms de propriétés si nécessaire
              };
            
              // Log pour vérification
              console.log("Updated contractData:", this.contractData);
            }

            // addNewBenefit(name: string): void {
            //   console.log('Ajout de la prestation:', name);
            //   const newBenefit = { name: name };
            //   this.benefitService.addBenefit(newBenefit).subscribe({
            //     next: benefit => {
            //       console.log('Prestation ajoutée avec succès:', benefit.benefit._id);
            //       this.loadBenefits();
            //       const benefitToSet = {name: benefit.benefit.name, value: benefit.benefit._id};
            //       console.log('Prestation à définir:', benefitToSet);
            //       setTimeout(() => {
            //         this.orderForm.get('benefit').setValue(benefitToSet.value);
            //       }
            //       , 500);
            //     },
            //     error: error => console.error("Erreur lors de l'ajout de la prestation", error)
            //   });
            // }
            addNewBenefit(name: string): void {
              const existingBenefit = this.benefits.map(benefit => benefit.name);
              const existingBenefitName = this.isProbableTypo(name, existingBenefit);
              const levenshteinScore = this.levenshteinDistance(name, existingBenefitName);
            
              if (existingBenefitName) {
                this.warningMessage = `Il semble qu'une prestation similaire existe déjà: ${existingBenefitName}`;
                this.warningScore = levenshteinScore;
                this.modalService.open(this.warningModal);
            
                // Ajouter la classe pour l'effet de lumière diffuse rouge pulsante
                this.renderer.addClass(document.getElementById('benefit'), 'pulsing-red');
            
                setTimeout(() => {
                  this.renderer.removeClass(document.getElementById('benefit'), 'pulsing-red');
                }, 7000); // Durée de l'effet
              }
            
              console.log('Ajout de la prestation:', name);
              const newBenefit = { name: name };
              this.benefitService.addBenefit(newBenefit).subscribe({
                next: benefit => {
                  console.log('Prestation ajoutée avec succès:', benefit.benefit._id);
                  this.loadBenefits();
                  const benefitToSet = { name: benefit.benefit.name, value: benefit.benefit._id };
                  console.log('Prestation à définir:', benefitToSet);
                  setTimeout(() => {
                    this.orderForm.get('benefit').setValue(benefitToSet.value);
                  }, 500);
                },
                error: error => console.error("Erreur lors de l'ajout de la prestation", error)
              });
            }
            
            
            
            
            
            // deleteBenefit(benefitId: string, event: Event): void {
            //   event.stopPropagation(); // Pour empêcher la sélection de l'élément
            //   this.benefitService.deleteBenefit(benefitId).subscribe({
            //     next: () => {
            //       this.loadBenefits();
            //     },
            //     error: error => console.error("Erreur lors de la suppression de la prestation", error)
            //   });
            // }
            
            // deleteBenefit(benefitId: string, event: Event): void {
            //   event.stopPropagation(); 
            //   this.benefitToDelete = benefitId;
          
            //   this.benefitService.checkBenefitInUse(benefitId).subscribe({
            //     next: (isInUse) => {
            //       if (isInUse) {
            //         this.modalService.open(this.deleteBenefitModal);
            //       } else {
            //         this.benefitService.deleteBenefit(benefitId).subscribe({
            //           next: () => {
            //             this.loadBenefits();
            //           },
            //           error: error => console.error("Erreur lors de la suppression de la prestation", error)
            //         });
            //       }
            //     },
            //     error: error => console.error("Erreur lors de la vérification de la prestation", error)
            //   });
            // }
          
            // confirmDeleteBenefit(): void {
            //   this.benefitService.replaceBenefit(this.benefitToDelete, this.replacementBenefit).subscribe({
            //     next: () => {
            //       this.loadBenefits();
            //       this.modalService.dismissAll();
            //     },
            //     error: error => console.error("Erreur lors du remplacement de la prestation", error)
            //   });
            // }
          
            // addNewReplacementBenefit(): void {
            //   const newBenefitName = prompt("Entrez le nom de la nouvelle prestation:");
            //   if (newBenefitName) {
            //     this.benefitService.addBenefit({ name: newBenefitName }).subscribe({
            //       next: benefit => {
            //         this.replacementBenefit = benefit.benefit._id;
            //         this.benefits.push({ name: benefit.benefit.name, value: benefit.benefit._id });
            //       },
            //       error: error => console.error("Erreur lors de l'ajout de la prestation", error)
            //     });
            //   }
            // }

  deleteBenefit(benefitId: string, event: Event): void {
    event.stopPropagation(); 
    this.benefitToDelete = benefitId;

    this.benefitService.checkBenefitInUse(benefitId).subscribe({
      next: (isInUse) => {
        if (isInUse) {
          this.replacementBenefit = null; // Réinitialiser la sélection de remplacement
          this.filteredBenefits = this.benefits.filter(benefit => benefit.value !== benefitId); // Exclure la prestation à supprimer
          this.modalService.open(this.deleteBenefitModal);
        } else {
          this.benefitService.deleteBenefit(benefitId).subscribe({
            next: () => {
              this.loadBenefits();
            },
            error: error => console.error("Erreur lors de la suppression de la prestation", error)
          });
        }
      },
      error: error => console.error("Erreur lors de la vérification de la prestation", error)
    });
  }

  confirmDeleteBenefit(): void {
    this.benefitService.replaceBenefit(this.benefitToDelete, this.replacementBenefit).subscribe({
      next: () => {
        this.modalService.dismissAll(); // Ferme tous les modals ouverts
        this.loadBenefits();
      },
      error: error => console.error("Erreur lors du remplacement de la prestation", error)
    });
  }
  
  addNewReplacementBenefit(): void {
    const newBenefitName = prompt("Entrez le nom de la nouvelle prestation:");
    if (newBenefitName) {
      this.benefitService.addBenefit({ name: newBenefitName }).subscribe({
        next: benefit => {
          this.replacementBenefit = benefit.benefit._id;
          this.loadBenefits();
        },
        error: error => console.error("Erreur lors de l'ajout de la prestation", error)
      });
    }
  }

  levenshteinDistance(word1: string, word2: string): number {
    const n = word1.length;
    const m = word2.length;
    
    // Si l'un des mots est vide, la distance est la longueur de l'autre mot
    if (n === 0) return m;
    if (m === 0) return n;
    
    // Initialiser une matrice (tableau 2D) de dimensions (n+1) x (m+1)
    const matrix: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    
    // Remplir la première colonne et la première ligne de la matrice
    // Cela correspond aux cas où l'on transforme un mot vide en l'autre en insérant tous ses caractères
    for (let i = 0; i <= n; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= m; j++) {
        matrix[0][j] = j;
    }
    
    // Remplir le reste de la matrice
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            // Si les caractères des deux mots sont les mêmes, il n'y a pas de coût (0)
            // Sinon, le coût est de 1 (substitution)
            const cost = word1[i - 1] === word2[j - 1] ? 0 : 1;
            
            // La valeur de la cellule actuelle est le minimum des trois valeurs suivantes :
            // 1. La valeur de la cellule au-dessus (suppression) + 1
            // 2. La valeur de la cellule à gauche (insertion) + 1
            // 3. La valeur de la cellule en diagonale (substitution) + coût
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,   // Suppression
                matrix[i][j - 1] + 1,   // Insertion
                matrix[i - 1][j - 1] + cost // Substitution
            );
        }
    }
    
    // La distance de Levenshtein est la valeur dans la cellule en bas à droite de la matrice
    return matrix[n][m];
}

  isProbableTypo(word: string, dictionary: string[], threshold: number = 2): string | null {
    let minDistance = Infinity;
    let correction: string | null = null;
    
    // Parcourt chaque mot du dictionnaire
    for (const dictWord of dictionary) {
        // Calcule la distance de Levenshtein entre le mot à vérifier et le mot du dictionnaire
        const distance = this.levenshteinDistance(word, dictWord);
        
        // Si la distance est inférieure à la distance minimale actuelle, met à jour la distance minimale et la correction
        if (distance < minDistance) {
            minDistance = distance;
            correction = dictWord;
        }
    }
    
    // Retourne la correction si la distance minimale est inférieure ou égale au seuil, sinon retourne null
    return minDistance <= threshold ? correction : null;
}

triggerExplosion(): void {
  // this.isExploding = true;

  // this.renderer.addClass(document.body, 'shake-page');

  // setTimeout(() => {
    // this.isExploding = false;
  //   this.renderer.removeClass(document.body, 'shake-page');
  //   this.isFalling = true;

  //   // Réinitialiser l'état après la chute
  //   setTimeout(() => {
  //     this.isFalling = false;
  //   }, 1500); // Durée de l'animation de chute
  // }, 1000); // Durée de l'animation d'explosion
}

}
