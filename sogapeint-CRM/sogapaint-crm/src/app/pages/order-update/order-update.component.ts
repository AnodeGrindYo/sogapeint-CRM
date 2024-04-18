import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ContractService } from "../../core/services/contract.service";
import { UserProfileService } from "../../core/services/user.service";
import { CompanyService } from "../../core/services/company.service";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
  switchMap,
  takeUntil,
} from "rxjs";
import { HttpEventType, HttpResponse } from "@angular/common/http";
import { BenefitService } from "src/app/core/services/benefit.service";
import { catchError } from 'rxjs/operators';

@Component({
  selector: "app-order-update",
  templateUrl: "./order-update.component.html",
  styleUrls: [
    "./order-update.component.scss",
    "../order-detail/order-detail.component.scss",
  ],
})
export class OrderUpdateComponent implements OnInit {
  breadCrumbItems: Array<{}> = [];
  orderUpdateForm: FormGroup;
  users: any[] = [];
  userInput$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();
  currentUser: any;

  statuses = [
    { name: "En cours", value: "in_progress" },
    { name: "À réaliser", value: null },
    { name: "Réalisé", value: "achieve" },
    { name: "Annulé", value: "canceled" },
    { name: "Facturé", value: "invoiced" },
    { name: "Anomalie", value: "anomaly" },
  ];

  benefits = [];

  internalNumberList: any[] = [];
  abbreviationList: string[] = [];
  fullAbbreviationList: string[] = []; // Liste complète des abréviations chargée initialement
  filteredAbbreviationList: string[] = []; // Liste pour le filtrage et l'affichage
  abbreviationInput$ = new Subject<string>();

  contractId: string;
  invalidKeyStrokes = 0;
  isEmojiVisible = false;

  constructor(
    private contractService: ContractService,
    private userProfileService: UserProfileService,
    private companyService: CompanyService,
    private benefitService: BenefitService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // ngOnInit(): void {
  //   this.currentUser = this.userProfileService.getCurrentUser();
  //   console.log("Current user:", this.currentUser);
  //   this.contractId = this.route.snapshot.params["orderId"];
  //   this.initializeForm();
  //   this.loadContractData();
  //   this.setupUserSearch();
  //   this.breadCrumbItems = [
  //     { label: "Accueil", path: "/" },
  //     { label: "Mise à jour d’une commande", active: true },
  //   ];

  //   // Récupérer les abréviations depuis le service
  //   this.getAbbreviationList();

  //   // Setup for abbreviation search and typeahead functionality
  //   this.abbreviationInput$
  //     .pipe(
  //       debounceTime(300),
  //       distinctUntilChanged(),
  //       switchMap((term) => {
  //         if (term) {
  //           const lowerCaseTerm = term.toLowerCase();
  //           return of(
  //             this.fullAbbreviationList.filter((abbr) =>
  //               abbr.toLowerCase().includes(lowerCaseTerm)
  //             )
  //           );
  //         } else {
  //           // Si la saisie de l'utilisateur est vide, retournez la liste complète
  //           return of(this.fullAbbreviationList);
  //         }
  //       }),
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe((filteredAbbreviations) => {
  //       this.filteredAbbreviationList = filteredAbbreviations;
  //     });

  //   // Calculer la différence entre les heures de prévision et d'exécution en temps réel
  //   this.orderUpdateForm.valueChanges.subscribe((val) => {
  //     // Utiliser `.value` pour obtenir la valeur actuelle des FormControl
  //     const totalPrevisionHours =
  //       Number(this.orderUpdateForm.get("prevision_data_day").value) * 8 +
  //       Number(this.orderUpdateForm.get("prevision_data_hour").value);
  //     const totalExecutionHours =
  //       Number(this.orderUpdateForm.get("execution_data_day").value) * 8 +
  //       Number(this.orderUpdateForm.get("execution_data_hour").value);
  //     const difference = totalExecutionHours - totalPrevisionHours;

  //     // Mise à jour du formulaire sans déclencher un nouvel événement valueChanges
  //     this.orderUpdateForm.patchValue(
  //       { difference: difference },
  //       { emitEvent: false }
  //     );
  //   });

  //   // calculer le bénéfice en temps réel (montant HT - montant contributeur externe - montant sous-traitant)
  //   this.orderUpdateForm.valueChanges.subscribe((val) => {
  //     const amountHt = Number(this.orderUpdateForm.get("amount_ht").value);
  //     const benefitHt = Number(this.orderUpdateForm.get("benefit_ht").value);
  //     const external_contributor_amount = Number(
  //       this.orderUpdateForm.get("external_contributor_amount").value
  //     );
  //     const subcontractor_amount = Number(
  //       this.orderUpdateForm.get("subcontractor_amount").value
  //     );
  //     const benefitHT =
  //       amountHt - external_contributor_amount - subcontractor_amount;
  //     this.orderUpdateForm.patchValue(
  //       { benefit: benefitHT },
  //       { emitEvent: false }
  //     );
  //   });

  //   // Patch de date_cde avec la date actuelle si elle est vide
  //   this.orderUpdateForm.get("date_cde").valueChanges.subscribe((val) => {
  //     if (!val) {
  //       this.orderUpdateForm.patchValue(
  //         { date_cde: new Date().toISOString().split("T")[0] },
  //         { emitEvent: false }
  //       );
  //     }
  //   });

  //   // Récupérer la liste des prestations avec BenefitService
  //   this.benefitService.getBenefits().subscribe({
  //     next: (benefits) => {
  //       this.benefits = benefits;
  //     },
  //     error: (error) => {
  //       console.error("Erreur lors de la récupération des prestations", error);
  //     },
  //   });
  // }
  ngOnInit(): void {
    this.initializeCurrentUser();
    this.initializeContractId();
    this.initializeBenefits();
    this.initializeForm();
    this.loadAndSetup();
    this.initializeBreadCrumbItems();
    this.initializeAbbreviationSearch();
    this.initializeRealTimeCalculations();
    
  }
  
  initializeCurrentUser(): void {
    this.currentUser = this.userProfileService.getCurrentUser();
    console.log("Current user:", this.currentUser);
  }
  
  initializeContractId(): void {
    this.contractId = this.route.snapshot.params["orderId"];
  }
  
  loadAndSetup(): void {
    this.loadContractData();
    this.setupUserSearch();
  }
  
  initializeBreadCrumbItems(): void {
    this.breadCrumbItems = [
      { label: "Accueil", path: "/" },
      { label: "Mise à jour d’une commande", active: true },
    ];
  }
  
  initializeAbbreviationSearch(): void {
    this.getAbbreviationList();
    this.abbreviationInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.handleAbbreviationSearch(term)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(filteredAbbreviations => {
        this.filteredAbbreviationList = filteredAbbreviations;
      });
  }
  
  handleAbbreviationSearch(term: string): Observable<string[]> {
    if (term) {
      const lowerCaseTerm = term.toLowerCase();
      return of(this.fullAbbreviationList.filter(abbr => abbr.toLowerCase().includes(lowerCaseTerm)));
    } else {
      return of(this.fullAbbreviationList);
    }
  }
  
  initializeRealTimeCalculations(): void {
    this.handleRealTimeDifference();
    this.handleRealTimeAdjustments();
    // this.handleRealTimeBenefit();
    this.patchOrderDate();
    this.patchExternalContributorInvoiceDate();
  }
  
  handleRealTimeDifference(): void {
    this.orderUpdateForm.valueChanges.subscribe(val => {
      const totalPrevisionHours = this.calculateHours('prevision_data_day', 'prevision_data_hour');
      const totalExecutionHours = this.calculateHours('execution_data_day', 'execution_data_hour');
      const difference = totalExecutionHours - totalPrevisionHours;
      this.orderUpdateForm.patchValue({ difference: difference }, { emitEvent: false });
    });
  }

  private handleRealTimeAdjustments(): void {
    this.orderUpdateForm.valueChanges.subscribe(() => {
      const totalPrevisionHours =
        Number(this.orderUpdateForm.get('prevision_data_day').value) * 8 +
        Number(this.orderUpdateForm.get('prevision_data_hour').value);
      const totalExecutionHours =
        Number(this.orderUpdateForm.get('execution_data_day').value) * 8 +
        Number(this.orderUpdateForm.get('execution_data_hour').value);
      const difference = totalExecutionHours - totalPrevisionHours;
  
      const benefitId = this.orderUpdateForm.get('benefit').value;
      const benefitType = this.benefits.find(benefit => benefit.value === benefitId)?.name;
      const amount = Number(this.orderUpdateForm.get('external_contributor_amount').value);
  
      let divider = 0;
      let hours = 0;
      if (benefitType === 'Peinture') {
        divider = 450;
      } else if (benefitType === 'Sol') {
        divider = 650;
      } else {
        divider = 450;
      }
  
      hours = amount / divider;
      hours = Math.round(hours * 100) / 100;
  
      this.orderUpdateForm.patchValue({
        prevision_data_hour: hours,
        difference: difference,
      }, { emitEvent: false });
    });
  }
  
  
  calculateHours(dayFieldName: string, hourFieldName: string): number {
    return Number(this.orderUpdateForm.get(dayFieldName).value) * 8 + Number(this.orderUpdateForm.get(hourFieldName).value);
  }
  
  handleRealTimeBenefit(): void {
    this.orderUpdateForm.valueChanges.subscribe(val => {
      const amountHt = Number(this.orderUpdateForm.get("amount_ht").value);
      const external_contributor_amount = Number(this.orderUpdateForm.get("external_contributor_amount").value);
      const subcontractor_amount = Number(this.orderUpdateForm.get("subcontractor_amount").value);
      // const benefitHT = amountHt - external_contributor_amount - subcontractor_amount;
      // this.orderUpdateForm.patchValue({ benefit_ht: benefitHT }, { emitEvent: false });
    });
  }
  
  patchOrderDate(): void {
    this.orderUpdateForm.get("date_cde").valueChanges.subscribe(val => {
      if (!val) {
        this.orderUpdateForm.patchValue({ date_cde: new Date().toISOString().split("T")[0] }, { emitEvent: false });
      }
    });
  }

  patchExternalContributorInvoiceDate(): void {
    this.orderUpdateForm.get("external_contributor_invoice_date").valueChanges.subscribe(val => {
      if (!val) {
        this.orderUpdateForm.patchValue({ external_contributor_invoice_date: new Date().toISOString().split("T")[0] }, { emitEvent: false });
      }
    });
  }
  
  initializeBenefits(): void {
    this.benefitService.getBenefits().subscribe({
      next: benefits => {
        this.benefits = benefits;
        console.log("Prestations récupérées:", benefits);
      },
      error: error => {
        console.error("Erreur lors de la récupération des prestations", error);
      }
    });
  }
  

  //////////////////////////

  private initializeForm() {
    this.orderUpdateForm = new FormGroup({
      // internal_number: new FormControl('', Validators.required),
      internalNumberNumericPart: new FormControl("", [
        Validators.required,
        Validators.pattern(/^\d{3}$/),
      ]),
      internalNumberAbbrPart: new FormControl("", Validators.required),
      customer: new FormControl(undefined, Validators.required),
      contact: new FormControl(""),
      internal_contributor: new FormControl(""),
      external_contributor: new FormControl(""),
      subcontractor: new FormControl(""),
      address: new FormControl(""),
      appartment_number: new FormControl(""),
      quote_number: new FormControl(""),
      mail_sended: new FormControl(""),
      invoice_number: new FormControl(""),
      amount_ht: new FormControl("", [Validators.pattern(/^\d+\.?\d*$/)]),
      external_contributor_amount: new FormControl("", [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      external_contributor_invoice_date: new FormControl(""),
      subcontractor_amount: new FormControl("", [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      benefit_ht: new FormControl("", [Validators.pattern(/^\d+\.?\d*$/)]),
      billing_amount: new FormControl("", [Validators.pattern(/^\d+\.?\d*$/)]),
      prevision_data_hour: new FormControl("", [Validators.pattern(/^\d+\.?\d*$/)]),
      prevision_data_day: new FormControl("", [Validators.pattern(/^\d+\.?\d*$/)]),
      execution_data_day: new FormControl("", [Validators.pattern(/^\d+\.?\d*$/)]),
      execution_data_hour: new FormControl("", [Validators.pattern(/^\d+\.?\d*$/)]),
      difference: new FormControl(""),
      benefit: new FormControl(""),
      status: new FormControl(""),
      occupied: new FormControl(""),
      start_date_works: new FormControl(""),
      end_date_works: new FormControl(""),
      end_date_customer: new FormControl(""),
      trash: new FormControl(""),
      date_cde: new FormControl(""),
      // ged: new FormControl(''),
    });
  }

  compareWithFn = (o1, o2) => {
    return o1 && o2 ? o1._id === o2._id : o1 === o2;
  };

  private loadContractData() {
    console.log("Loading contract data");
    if (this.contractId) {
      console.log("Loading contract with id:", this.contractId);
      this.contractService
        .getContractById(this.contractId)
        .subscribe((contract) => {
          contract.start_date_works = contract.start_date_works
            ? contract.start_date_works.split("T")[0]
            : "";
          contract.end_date_works = contract.end_date_works
            ? contract.end_date_works.split("T")[0]
            : "";
          contract.end_date_customer = contract.end_date_customer
            ? contract.end_date_customer.split("T")[0]
            : "";

          // Divise le numéro interne en abréviation et partie numérique
          const internalNumberParts = contract.internal_number
            ? contract.internal_number.split("-")
            : ["", ""];
          const abbreviation = internalNumberParts[0];
          const numericPart = internalNumberParts[1];

          // si prevision_data_hour et prevision_data_day ne sont pas remplis, 
          // les remplit avec les valeurs de execution_data_hour et execution_data_day
          if (!contract.prevision_data_hour && !contract.prevision_data_day) {
            contract.prevision_data_hour = contract.execution_data_hour;
            contract.prevision_data_day = contract.execution_data_day;
          }

          // conversion de date_cde
          contract.date_cde = contract.date_cde
            ? contract.date_cde.split("T")[0]
            : "";
          // conversion de external_contributor_invoice_date
          contract.external_contributor_invoice_date = contract.external_contributor_invoice_date
            ? contract.external_contributor_invoice_date.split("T")[0]
            : "";

          const patchValues = {
            ...contract,
            start_date_works: contract.start_date_works,
            end_date_works: contract.end_date_works,
            end_date_customer: contract.end_date_customer,
            external_contributor_invoice_date: contract.external_contributor_invoice_date,
            date_cde: contract.date_cde,
            internalNumberAbbrPart: abbreviation, // Partie abréviation
            internalNumberNumericPart: numericPart, // Partie numérique
            benefit: contract.benefit,
          };

          // Charge les données utilisateur et patche le formulaire
          this.loadUserDataAndPatchForm(contract, patchValues);
          console.log("Contract data loaded:", JSON.stringify(contract));
        });
    } else {
      console.log("No contract id provided");
    }
  }

  private loadUserDataAndPatchForm(contract: any, patchValues: any) {
    const userRequests = [];

    if (contract.customer)
      userRequests.push(this.userProfileService.getOne(contract.customer));
    if (contract.contact)
      userRequests.push(this.userProfileService.getOne(contract.contact));
    if (contract.internal_contributor)
      userRequests.push(
        this.userProfileService.getOne(contract.internal_contributor)
      );
    if (contract.external_contributor)
      userRequests.push(
        this.userProfileService.getOne(contract.external_contributor)
      );
    if (contract.subcontractor)
      userRequests.push(this.userProfileService.getOne(contract.subcontractor));


    forkJoin(userRequests).pipe(
      catchError(error => {
        // Logique de gestion d'erreur
        console.error('Une erreur est survenue lors de la récupération des utilisateurs', error);
        // On pourra décider de renvoyer un Observable vide, ou de gérer l'erreur d'une manière 
        // qui convient à notre application
        return of([]);
      })
    ).subscribe((userResponses) => {

      if (contract.customer)
        patchValues.customer = userResponses.find(
          (u) => u._id === contract.customer
        );
      if (contract.contact)
        patchValues.contact = userResponses.find(
          (u) => u._id === contract.contact
        );
      if (contract.internal_contributor)
        patchValues.internal_contributor = userResponses.find(
          (u) => u._id === contract.internal_contributor
        );
      if (contract.external_contributor)
        patchValues.external_contributor = userResponses.find(
          (u) => u._id === contract.external_contributor
        );
      if (contract.subcontractor)
        patchValues.subcontractor = userResponses.find(
          (u) => u._id === contract.subcontractor
        );
        if (contract.benefit) {
          // Utilisez la valeur correspondante de l'objet benefit, pas l'objet entier
          console.log("Benefit id to patch:", contract.benefit);
          patchValues.benefit = this.benefits.find(b => b._id === contract.benefit);
          console.log("Benefit value to patch:", patchValues.benefit);
        }
      
      console.log("User data loaded:", userResponses);
      // Après que toutes les opérations asynchrones sont terminées, patche le formulaire
      
      if (this.orderUpdateForm && patchValues) {
        this.orderUpdateForm.patchValue(patchValues);
      //   if (contract.customer && patchValues.customer) {
      //     this.orderUpdateForm.get("customer").setValue(patchValues.customer);
      //   }
      //   if (contract.contact && patchValues.contact) {
      //     this.orderUpdateForm.get("contact").setValue(patchValues.contact);
      //   }
      //   if (contract.internal_contributor && patchValues.internal_contributor) {
      //     this.orderUpdateForm.get("internal_contributor").setValue(patchValues.internal_contributor);
      //   }
      //   if (contract.external_contributor && patchValues.external_contributor) {
      //     this.orderUpdateForm.get("external_contributor").setValue(patchValues.external_contributor);
      //   }
      //   if (contract.subcontractor && patchValues.subcontractor) {
      //     this.orderUpdateForm.get("subcontractor").setValue(patchValues.subcontractor);
      //   }

      }
    });
  }

  private setupUserSearch() {
    this.userInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>
          term
            ? this.userProfileService.searchUsers(term.toLowerCase())
            : of([])
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((users) => {
        this.users = users;
      });
  }

  onSubmitUpdate(): void {
    console.log("Attempting to submit form", this.orderUpdateForm.value);
    console.log("Form validity:", this.orderUpdateForm.valid);

    if (this.orderUpdateForm.valid) {
      const data = this.prepareDataForSubmit();
      console.log("Data to submit:", data);
      this.contractService
        // .updateContract(this.contractId, this.orderUpdateForm.value)
        .updateContract(this.contractId, data)
        .subscribe({
          next: () => {
            console.log("Contract updated successfully");
            this.router.navigate(["/order-detail", this.contractId]);
          },
          error: (error) => {
            console.error("Error updating contract:", error);
          },
        })
        .add(() => {
          this.router.navigate(["/order-detail", this.contractId]);
        });
    } else {
      console.error("Form is invalid");
      console.log("Form values:", this.orderUpdateForm.value);
      console.log("data values:", this.prepareDataForSubmit());
      console.log("invalid fields: ", this.findInvalidControls());
    }
  }

  prepareDataForSubmit(): any {
    // récupère le status
    const status = this.orderUpdateForm.get("status").value;
    const data = { ...this.orderUpdateForm.value };
    console.log("data befor modification", data);
    data.status = status;
    // // Remplace le benefit par son _id
    // data.benefit = data.benefit.value;
    // // remplace le contact par son _id
    // data.contact = data.contact._id;
    // // remplace le customer par son _id
    // data.customer = data.customer._id;
    // // remplace le contact par son _id
    // data.contact = data.contact._id;
    // // remplace le internal_contributor par son _id
    // data.internal_contributor = data.internal_contributor._id;
    // // remplace le external_contributor par son _id
    // data.external_contributor = data.external_contributor._id;
    // // remplace le subcontractor par son _id
    // data.subcontractor = data.subcontractor._id;
    // convertit date_cde en dd/mm/yyyy
    data.date_cde = new Date(data.date_cde).toLocaleDateString("fr-CA");
    // convertit end_date_customer en dd/mm/yyyy
    data.end_date_customer = new Date(data.end_date_customer).toLocaleDateString("fr-CA");
    // convertit external_contributor_invoice_date en dd/mm/yyyy
    data.external_contributor_invoice_date = new Date(data.external_contributor_invoice_date).toLocaleDateString("fr-CA");
    // convertit start_date_works en dd/mm/yyyy
    data.start_date_works = new Date(data.start_date_works).toLocaleDateString("fr-CA");
    // convertit end_date_works en dd/mm/yyyy
    data.end_date_works = new Date(data.end_date_works).toLocaleDateString("fr-CA");
    return data;
  }



  findInvalidControls() {
    const invalid = [];
    const controls = this.orderUpdateForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  // convertit les dates de n'importe quel format vers "yyyy-MM-dd"
  convertDate(date: any): string {
    if (date) {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const day = dateObj.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return "";
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onUserInputFocus(): void {
    this.userInput$.next("");
  }

  onUserInputBlur(event: any): void {
    // console.log("onUserInputBlur");
  }

  onAlphaInput(event: KeyboardEvent): void {
    if (
      !/[0-9]/.test(event.key) &&
      ![
        "Backspace",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Delete",
        "Enter",
      ].includes(event.key) &&
      !(
        event.key === "e" ||
        event.key === "." ||
        event.key === "-" ||
        event.key === "+"
      )
    ) {
      event.preventDefault();
      const inputElement = event.target as HTMLInputElement;

      this.invalidKeyStrokes++;
      inputElement.classList.add("input-error");

      setTimeout(() => {
        inputElement.classList.remove("input-error");
      }, 820);

      // If three invalid characters have been entered, show the emoji
      if (this.invalidKeyStrokes >= 3) {
        this.showEmoji();
      }
    }
  }

  showEmoji(): void {
    console.log("showEmoji");
    this.isEmojiVisible = true;
    this.invalidKeyStrokes = 0; // Reset the counter

    setTimeout(() => {
      this.isEmojiVisible = false; // Cache l'emoji après un certain temps
    }, 3000); // Durée d'affichage de l'emoji
  }

  // Vérifie si la partie numérique numéro interne existe déjà dans la liste
  isInternalNumberNumericPartValid(): boolean {
    return this.internalNumberList.some((item) => {
      const match = item.match(/^([A-Z]{3,4}-)(\d{3})$/i); // Modifier selon le format exact de vos numéros
      return (
        match &&
        match[2] === this.orderUpdateForm.get("internalNumberNumericPart").value
      );
    });
  }

  getAbbreviationList(): void {
    this.companyService.getCompaniesAbbreviations().subscribe({
      next: (abbreviations) => {
        this.fullAbbreviationList = abbreviations.filter(
          (abbr) => abbr !== null
        );
        this.fullAbbreviationList.sort();
        this.filteredAbbreviationList = this.fullAbbreviationList;
      },
      error: (error) => {
        console.error("Erreur lors de la récupération des abréviations", error);
      },
    });
  }

  assembleInternalNumber(): string {
    return `${this.orderUpdateForm
      .get("internalNumberAbbrPart")
      .value.toUpperCase()}-${
      this.orderUpdateForm.get("internalNumberNumericPart").value
    }`;
  }

  onDelete(): void {
    if (this.contractId) {
      this.contractService.deleteContract(this.contractId).subscribe({
        next: () => {
          console.log("Contract deleted successfully");
        },
        error: (error) => {
          console.error("Error deleting contract:", error);
        },
      });
    } else {
      console.error("No contract id provided");
    }
  }

  addNewBenefit(name: string): void {
    console.log('Ajout de la prestation:', name);
    const newBenefit = { name: name };
    this.benefitService.addBenefit(newBenefit).subscribe({
      next: benefit => {
        console.log('Prestation ajoutée avec succès:', benefit.benefit._id);
        this.initializeBenefits();
        const benefitToSet = {name: benefit.benefit.name, value: benefit.benefit._id};
        console.log('Prestation à définir:', benefitToSet);
        setTimeout(() => {
          this.orderUpdateForm.get('benefit').setValue(benefitToSet.value);
        }
        , 500);
      },
      error: error => console.error("Erreur lors de l'ajout de la prestation", error)
    });
  }
  
  deleteBenefit(benefitId: string, event: Event): void {
    event.stopPropagation(); // Pour empêcher la sélection de l'élément
    this.benefitService.deleteBenefit(benefitId).subscribe({
      next: () => {
        this.initializeBenefits();
      },
      error: error => console.error("Erreur lors de la suppression de la prestation", error)
    });
  }
}
