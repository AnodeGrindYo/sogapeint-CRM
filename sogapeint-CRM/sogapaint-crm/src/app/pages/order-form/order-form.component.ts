import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContractService } from '../../core/services/contract.service';
import { CompanyService } from '../../core/services/company.service';
import { UserProfileService } from '../../core/services/user.service';
import { BenefitService } from 'src/app/core/services/benefit.service';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
    quoteNumber: '',
    mailSended: false,
    invoiceNumber: '',
    amountHt: null,
    externalContributorAmount: 0,
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
  
  constructor(
    private contractService: ContractService, 
    private userProfileService: UserProfileService,
    private companyService: CompanyService,
    private benefitService: BenefitService,
    private modalService: NgbModal,
    private router: Router
    ) {}
    
    // ngOnInit(): void {
    //   // Initialize the form group with controls corresponding to contractData structure
    //   this.orderForm = new FormGroup({
    //     internalNumberAbbrPart: new FormControl(this.contractData.internalNumberAbbrPart, [Validators.pattern(/^[BCDFGHJKLMNPQRSTVWXYZ]{1,5}$/)]), // Only 3-4 uppercase letters, consonnants only
    //     internalNumberNumericPart: new FormControl(this.contractData.internalNumberNumericPart, [Validators.pattern(/^\d{3}$/)]), // Only 3 digits
    //     customer: new FormControl(this.contractData.customer, Validators.required), // Assuming it's required
    //     internalContributor: new FormControl(this.contractData.internalContributor),
    //     contact: new FormControl(this.contractData.contact),
    //     externalContributor: new FormControl(this.contractData.externalContributor),
    //     subcontractor: new FormControl(this.contractData.subcontractor),
    //     address: new FormControl(this.contractData.address),
    //     appartmentNumber: new FormControl(this.contractData.appartmentNumber),
    //     quoteNumber: new FormControl(this.contractData.quoteNumber),
    //     mailSended: new FormControl(this.contractData.mailSended),
    //     invoiceNumber: new FormControl(this.contractData.invoiceNumber),
    //     amountHt: new FormControl(this.contractData.amountHt, [Validators.pattern(/^\d+\.?\d*$/)]), // Only numbers with optional decimal
    //     externalContributorAmount: new FormControl(this.contractData.externalContributorAmount, [Validators.pattern(/^\d+\.?\d*$/)]), // Only numbers with optional decimal
    //     subcontractorAmount: new FormControl(this.contractData.subcontractorAmount, [Validators.pattern(/^\d+\.?\d*$/)]), // Only numbers with optional decimal
    //     previsionDataHour: new FormControl(this.contractData.previsionDataHour, [Validators.pattern(/^\d+$/)]), // Only whole numbers
    //     previsionDataDay: new FormControl(this.contractData.previsionDataDay, [Validators.pattern(/^\d+$/)]), // Only whole numbers
    //     executionDataDay: new FormControl(this.contractData.executionDataDay, [Validators.pattern(/^\d+$/)]), // Only whole numbers
    //     executionDataHour: new FormControl(this.contractData.executionDataHour, [Validators.pattern(/^\d+$/)]), // Only whole numbers
    //     difference: new FormControl(this.contractData.difference),
    //     benefit: new FormControl(this.contractData.benefit),
    //     status: new FormControl(this.contractData.status),
    //     occupied: new FormControl(this.contractData.occupied),
    //     startDateWorks: new FormControl(this.contractData.startDateWorks),
    //     endDateWorks: new FormControl(this.contractData.endDateWorks),
    //     endDateCustomer: new FormControl(this.contractData.endDateCustomer),
    //     trash: new FormControl(this.contractData.trash),
    //     dateCde: new FormControl(this.contractData.dateCde),
    //     billingAmount: new FormControl(this.contractData.billingAmount, [Validators.pattern(/^\d+\.?\d*$/)]) // Only numbers with optional decimal
    //     // ged: new FormControl(this.contractData.ged),
    //   });
    
    //   this.orderForm.valueChanges.subscribe(val => {
    //     console.log(val);
    //   });
    
    //   // Mettre à jour `contractData` en temps réel avec les changements de formulaire.
    //   this.orderForm.valueChanges.subscribe(val => {
    //     this.contractData = { ...this.contractData, ...val };
    //     console.log(this.contractData);
    //   });
    
    //   this.breadCrumbItems = [
    //     { label: 'Accueil', path: '/' },
    //     { label: 'Saisie d’une commande', active: true }
    //   ];
    
    //   // Setup for user search and typeahead functionality
    //   this.userInput$.pipe(
    //     debounceTime(300),
    //     distinctUntilChanged(),
    //     switchMap(term => term ? this.userProfileService.searchUsers(term.toLowerCase()) : of([])),
    //     takeUntil(this.unsubscribe$)
    //     ).subscribe(users => {
    //       this.users = users;
    //     });
    
    //     // Récupérer les numéros internes depuis le service
    //     this.getInternalNumbers();
    
    //     // Récupérer les prestations depuis le service
    //     this.loadBenefits();
    
    //     // Récupérer les abréviations depuis le service
    //     this.getAbbreviationList();
    
    //     // Filtrer les abréviations en temps réel
    //     this.abbreviationInput$.pipe(
    //       debounceTime(300),
    //       distinctUntilChanged(),
    //       switchMap(term => {
    //         if (term) {
    //           const lowerCaseTerm = term.toLowerCase();
    //           return of(this.fullAbbreviationList.filter(abbr => abbr.toLowerCase().includes(lowerCaseTerm)));
    //         } else {
    //           // Si la saisie de l'utilisateur est vide, retournez la liste complète
    //           return of(this.fullAbbreviationList);
    //         }
    //       }),
    //       takeUntil(this.unsubscribe$)
    //       ).subscribe(filteredAbbreviations => {
    //         this.filteredAbbreviationList = filteredAbbreviations;
    //       });
    
    
    //       // Calculer la différence entre les heures de prévision et d'exécution en temps réel
    //       this.orderForm.valueChanges.subscribe(val => {
    //         // Utiliser `.value` pour obtenir la valeur actuelle des FormControl
    //         const totalPrevisionHours = (Number(this.orderForm.get("previsionDataDay").value) * 8) + Number(this.orderForm.get("previsionDataHour").value);
    //         const totalExecutionHours = (Number(this.orderForm.get("executionDataDay").value) * 8) + Number(this.orderForm.get("executionDataHour").value);
    //         const difference = totalExecutionHours - totalPrevisionHours;
    
    //         // Mise à jour du formulaire sans déclencher un nouvel événement valueChanges
    //         this.orderForm.patchValue({difference: difference}, {emitEvent: false});
    
    //         // Ajuste previsionDataHour en fonction de la prestation
    //         const benefitType = this.orderForm.get("benefit").value; // Assurez-vous que cette ligne récupère correctement la valeur du type de prestation sélectionné
    //         const amountOfWork = Number(this.orderForm.get("amountOfWork").value); // Exemple, ajustez selon votre champ réel
    //         let hours = 0;
    //         if (benefitType === 'Peinture') {
    //           hours = amountOfWork / 450;
    //         } else if (benefitType === 'Sol') {
    //           hours = amountOfWork / 650;
    //         } else {
    //           hours = amountOfWork / 450; // Pour tout le reste
    //         }
    
    //         this.orderForm.patchValue({ 
    //           previsionDataHour: hours, // Mise à jour de previsionDataHour sans déclencher un nouvel événement de changement
    //           difference: difference 
    //         }, { emitEvent: false });
    //       });
    
    //       // Patch de date_cde avec la date actuelle
    //       // Obtention de la date actuelle
    //       const today = new Date();
    
    //       const formattedDate = [
    //         today.getFullYear(),
    //         (today.getMonth() + 1).toString().padStart(2, '0'), // Ajout d'un zéro pour les mois < 10
    //         today.getDate().toString().padStart(2, '0') // Ajout d'un zéro pour les jours < 10
    //       ].join('-');
    
    //       this.orderForm.patchValue({
    //         dateCde: formattedDate,
    //       });
    //     }
    ngOnInit(): void {
      this.initializeOrderForm();
      this.subscribeToFormChanges();
      this.setupBreadCrumbItems();
      this.setupUserSearchAndTypeahead();
      this.retrieveDataFromServices();
      this.subscribeToAbbreviationInput();
      this.initializeDateCdeWithCurrentDate();
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
        quoteNumber: new FormControl(this.contractData.quoteNumber),
        mailSended: new FormControl(this.contractData.mailSended),
        invoiceNumber: new FormControl(this.contractData.invoiceNumber),
        amountHt: new FormControl(this.contractData.amountHt, [Validators.pattern(/^\d+\.?\d*$/)]),
        externalContributorAmount: new FormControl(this.contractData.externalContributorAmount, [Validators.pattern(/^\d+\.?\d*$/)]),
        subcontractorAmount: new FormControl(this.contractData.subcontractorAmount, [Validators.pattern(/^\d+\.?\d*$/)]),
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
          const amount= Number(this.orderForm.get("externalContributorAmount").value);
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
  
          this.orderForm.patchValue({ 
            previsionDataHour: hours, // Mise à jour de previsionDataHour sans déclencher un nouvel événement de changement
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
        }
        
        
        loadBenefits() {
          this.benefitService.getBenefits().subscribe(
            (benefitsData) => {
              this.benefits = benefitsData
              .map((benefit) => {
                return { name: benefit.name, value: benefit._id };
              })
              .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
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
              const match = item.match(/^([A-Z]{3,4}-)(\d{3})$/i); // Modifier selon le format exact de vos numéros
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
              
              // If three invalid characters have been entered, show the emoji
              if (this.invalidKeyStrokes >= 3) {
                this.showEmoji();
              }
            }
          }
          
          showEmoji(): void {
            console.log('showEmoji');
            this.isEmojiVisible = true;
            this.invalidKeyStrokes = 0; // Reset the counter
            
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
            // Convert each key in the contractData object to snake_case.
            const dataForSubmission = {};
            Object.keys(this.contractData).forEach((key) => {
              const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
              dataForSubmission[snakeCaseKey] = this.contractData[key];
            });
            
            // Convert boolean and number values if necessary.
            dataForSubmission['mail_sended'] = this.convertToBoolean(dataForSubmission['mail_sended']);
            dataForSubmission['occupied'] = this.convertToBoolean(dataForSubmission['occupied']);
            dataForSubmission['trash'] = this.convertToBoolean(dataForSubmission['trash']);
            dataForSubmission['amount_ht'] = this.convertToNumber(dataForSubmission['amount_ht']);
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
                  if (result === 'Confirm') {
                    this.confirmCreation();
                  }
                }, (reason) => {
                  console.log('Dismissed', reason);
                });
            }

            confirmCreation() {
              // Soumission de la commande
              this.submitContractData();

              // fermer le modal
              this.modalService.dismissAll();
            
              // Réinitialisez les champs spécifiques pour une nouvelle commande
              this.orderForm.patchValue({
                // Pré-remplir les champs conservés pour une nouvelle commande
                customer: this.orderForm.value.customer._id,
                contact: this.orderForm.value.contact._id,
                address: this.orderForm.value.address,
                appartmentNumber: this.orderForm.value.appartmentNumber,
                quoteNumber: this.orderForm.value.quoteNumber,
                mailSended: this.orderForm.value.mailSended,
                invoiceNumber: this.orderForm.value.invoiceNumber,
                amountHt: this.orderForm.value.amountHt,
                externalContributorAmount: this.orderForm.value.externalContributorAmount,
                subcontractorAmount: this.orderForm.value.subcontractorAmount,
                status: this.orderForm.value.status,
                startDateWorks: this.orderForm.value.startDateWorks,
                endDateWorks: this.orderForm.value.endDateWorks,
                endDateCustomer: this.orderForm.value.endDateCustomer,
                dateCde: this.orderForm.value.dateCde,
                billingAmount: this.orderForm.value.billingAmount,
              });
              
              // Réinitialiser les champs spécifiques que vous voulez vider
              this.orderForm.patchValue({
                internalContributor: null,
                externalContributor: null,
                subcontractor: null,
                previsionDataHour: null,
                previsionDataDay: null,
                executionDataDay: null,
                executionDataHour: null,
                difference: null,
                benefit: null, // réinitialiser la prestation
                occupied: false,
                trash: false, 
              });
              
            
              // Réinitialiser/réinitialiser les champs que vous ne voulez pas conserver
              this.orderForm.patchValue({
                internalContributor: '',
                externalContributor: '',
                subcontractor: '',
                previsionDataHour: 0,
                previsionDataDay: 0,
                executionDataDay: 0,
                executionDataHour: 0,
                // Tout autre champ que vous souhaitez réinitialiser
              });

              // init dateCde
              this.initializeDateCdeWithCurrentDate();
            }
            
            // Une fonction d'aide pour trouver l'utilisateur par ID dans la liste chargée
            findUserById(userId: string) {
              return this.users.find(user => user._id === userId);
            }

            private updateContractDataFromForm(): void {
              // Copie des valeurs du formulaire dans contractData
              // Assurez-vous que chaque clé correspond bien à celles attendues par votre backend
              this.contractData = {
                ...this.contractData,
                ...this.orderForm.value,
                // Conversion manuelle de noms de propriétés si nécessaire
              };
            
              // Log pour vérification
              console.log("Updated contractData:", this.contractData);
            }

          }
