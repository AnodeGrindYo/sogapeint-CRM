import { Component, OnInit, Renderer2, ViewChild } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ContractService } from "../../core/services/contract.service";
import { CompanyService } from "../../core/services/company.service";
import { UserProfileService } from "../../core/services/user.service";
import { BenefitService } from "src/app/core/services/benefit.service";
import { Router } from "@angular/router";
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  takeUntil,
} from "rxjs";
import { HttpEventType, HttpResponse } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastService } from "angular-toastify";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-order-form",
  templateUrl: "./order-form.component.html",
  styleUrls: ["./order-form.component.scss"],
})
export class OrderFormComponent implements OnInit {
  breadCrumbItems: Array<{}> = [];
  orderForm: FormGroup;
  contractData: any = {
    internalNumberAbbrPart: "",
    internalNumberNumericPart: "",
    customer: "",
    contact: "",
    internalContributor: "",
    externalContributor: "",
    subcontractor: "",
    address: "",
    appartmentNumber: "",
    ss4: false,
    quoteNumber: "",
    mailSended: false,
    invoiceNumber: "",
    amountHt: null,
    externalContributorAmount: 0,
    external_contributor_invoice_date: null,
    subcontractorAmount: 0,
    previsionDataHour: 0,
    previsionDataDay: 0,
    executionDataDay: 0,
    executionDataHour: 0,
    difference: 0,
    benefit: null,
    status: null,
    occupied: false,
    startDateWorks: null,
    endDateWorks: null,
    endDateCustomer: null,
    dateCde: null,
    billingAmount: 0,
    isLastContract: false,
  };
  
  users: any[] = [];
  customers: any[] = [];
  userInput$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();
  currentUser: any;
  
  statuses = [
    { name: "En cours", value: "in_progress" },
    { name: "Réalisé", value: "achieve" },
    { name: "Annulé", value: "canceled" },
    { name: "Facturé", value: "invoiced" },
    { name: "Anomalie", value: "anomaly" },
  ];
  
  benefits = [];
  
  internalNumberList: any[] = [];
  abbreviationList: string[] = [];
  fullAbbreviationList: string[] = [];
  filteredAbbreviationList: string[] = [];
  
  invalidKeyStrokes = 0;
  isEmojiVisible = false;
  abbreviationInput$ = new Subject<string>();
  
  files: File[] = [];
  
  @ViewChild("confirmationModal") confirmationModal;
  @ViewChild("deleteBenefitModal") deleteBenefitModal;
  @ViewChild("simpleDeleteModal") simpleDeleteModal: any;
  @ViewChild("simpleDeleteConfirmationModal")
  simpleDeleteConfirmationModal: any;
  replacementBenefit: string;
  benefitToDelete: string;
  filteredBenefits: any[] = [];
  @ViewChild("warningModal") warningModal;
  warningMessage: string;
  warningScore: number;
  isExploding: boolean = false;
  isFalling: boolean = false;
  
  private isSubmitting = false;
  
  totalEstimatedHours: number;
  excessHours: number;
  divider: number;
  amount: number;
  @ViewChild("calculationDetailsModal") calculationDetailsModal;
  
  private isManuallyChanging: boolean = false;
  autoCalculateEnabled: boolean = true;
  
  private benefitAmountSubscription: any;
  
  constructor(
    private contractService: ContractService,
    private userProfileService: UserProfileService,
    private companyService: CompanyService,
    private benefitService: BenefitService,
    private modalService: NgbModal,
    private router: Router,
    private renderer: Renderer2,
    private toastService: ToastService,
    private toastr: ToastrService
  ) {}
  
  ngOnInit(): void {
    this.setupBreadCrumbItems();
    this.currentUser = this.userProfileService.getCurrentUser();
    console.log("Utilisateur connecté:", this.currentUser);
    this.initializeOrderForm();
    
    this.subscribeToUserSelections();
    
    this.subscribeToFormChanges();
    this.setupUserSearchAndTypeahead();
    this.setupCustomerSearchAndTypeahead();
    this.retrieveDataFromServices();
    this.subscribeToAbbreviationInput();
    this.initializeDateCdeWithCurrentDate();
    
    this.subscribeToHourAndDayChanges();
    
    if (this.autoCalculateEnabled) {
      this.subscribeToBenefitAmountChanges();
    }
    
    this.orderForm.valueChanges.subscribe((values) => {
      // console.log("Modification du formulaire:", values);
      // console.log(this.orderForm.status);
      // console.log(this.orderForm.errors);
    });
  }
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    
    this.unsubscribeFromBenefitAmountChanges();
  }
  
  // private initializeOrderForm(): void {
  //   this.orderForm = new FormGroup({
  //     internalNumberAbbrPart: new FormControl(
  //       this.contractData.internalNumberAbbrPart
  //     ),
  //     internalNumberNumericPart: new FormControl(
  //       this.contractData.internalNumberNumericPart,
  //       [Validators.pattern(/^\d{3}$/)]
  //     ),
  //     customer: new FormControl(
  //       this.contractData.customer,
  //       Validators.required
  //     ),
  //     internalContributor: new FormControl(
  //       this.contractData.internalContributor
  //     ),
  //     contact: new FormControl(this.contractData.contact),
  //     externalContributor: new FormControl(
  //       this.contractData.externalContributor
  //     ),
  //     subcontractor: new FormControl(this.contractData.subcontractor),
  //     address: new FormControl(this.contractData.address),
  //     appartmentNumber: new FormControl(this.contractData.appartmentNumber),
  //     ss4: new FormControl(this.contractData.ss4),
  //     quoteNumber: new FormControl(this.contractData.quoteNumber),
  //     mailSended: new FormControl(this.contractData.mailSended),
  //     invoiceNumber: new FormControl(this.contractData.invoiceNumber),
  //     amountHt: new FormControl(this.contractData.amountHt, [
  //       Validators.pattern(/^\d+\.?\d*$/),
  //     ]),
  //     benefitHt: new FormControl(this.contractData.benefitHt, [
  //       Validators.pattern(/^\d+\.?\d*$/),
  //     ]),
  //     externalContributorAmount: new FormControl(
  //       this.contractData.externalContributorAmount,
  //       [Validators.pattern(/^\d+\.?\d*$/)]
  //     ),
  //     subcontractorAmount: new FormControl(
  //       this.contractData.subcontractorAmount,
  //       [Validators.pattern(/^\d+\.?\d*$/)]
  //     ),
  //     external_contributor_invoice_date: new FormControl(
  //       this.contractData.external_contributor_invoice_date
  //     ),
  //     previsionDataHour: new FormControl(this.contractData.previsionDataHour, [
  //       Validators.pattern(/^\d+\.?\d*$/),
  //     ]),
  //     previsionDataDay: new FormControl(this.contractData.previsionDataDay, [
  //       Validators.pattern(/^\d+\.?\d*$/),
  //     ]),
  //     executionDataDay: new FormControl(this.contractData.executionDataDay, [
  //       Validators.pattern(/^\d+\.?\d*$/),
  //     ]),
  //     executionDataHour: new FormControl(this.contractData.executionDataHour, [
  //       Validators.pattern(/^\d+\.?\d*$/),
  //     ]),
  //     difference: new FormControl(this.contractData.difference),
  //     benefit: new FormControl(this.contractData.benefit),
  //     status: new FormControl(this.contractData.status),
  //     occupied: new FormControl(this.contractData.occupied),
  //     startDateWorks: new FormControl(this.contractData.startDateWorks),
  //     endDateWorks: new FormControl(this.contractData.endDateWorks),
  //     endDateCustomer: new FormControl(this.contractData.endDateCustomer),
  //     dateCde: new FormControl(this.contractData.dateCde),
  //     billingAmount: new FormControl(this.contractData.billingAmount, [
  //       Validators.pattern(/^\d+\.?\d*$/),
  //     ]),
  //     isLastContract: new FormControl(this.contractData.isLastContract),
  //   });
  
  //   if (this.orderForm.get("benefitHt").value) {
  //     this.calculateHoursAndDaysFromBenefit();
  //   }
  // }
  // Modification du format de internal_number
  private initializeOrderForm(): void {
    this.orderForm = new FormGroup({
      internalNumberAbbrPart: new FormControl(this.contractData.internalNumberAbbrPart, Validators.required),
      internalNumberYearPart: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(9999)]), // Champ d'année initialisé avec l'année en cours
      internalNumberNumericPart: new FormControl(this.contractData.internalNumberNumericPart, [Validators.required, Validators.pattern(/^\d+$/)]),
      internalNumberSuffixPart: new FormControl(''),
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
      dateCde: new FormControl(this.contractData.dateCde),
      billingAmount: new FormControl(this.contractData.billingAmount, [Validators.pattern(/^\d+\.?\d*$/)]),
      isLastContract: new FormControl(this.contractData.isLastContract)
    });
    
    this.orderForm.valueChanges.subscribe((values) => {
      this.contractData = { ...this.contractData, ...values };
    });
    
    // Abbréviation et génération du numéro interne
    this.orderForm.get("internalNumberAbbrPart").valueChanges.subscribe((abbr) => {
      if (abbr) {
        const nextNumber = this.getNextInternalNumber(abbr);
        this.orderForm.patchValue({
          internalNumberNumericPart: nextNumber,
        }, { emitEvent: false });
      }
    });
    
    // Initialisation de la date de commande avec la date actuelle
    this.initializeDateCdeWithCurrentDate();
    
    // Gestion des heures et jours prévisionnels et d'exécution
    this.subscribeToHourAndDayChanges();
  }
  
  
  private subscribeToFormChanges(): void {
    this.orderForm.valueChanges.subscribe((val) => {
      this.contractData = { ...this.contractData, ...val };
    });
    this.orderForm
    .get("internalNumberAbbrPart")
    .valueChanges.subscribe((abbr) => {
      if (abbr) {
        const nextNumber = this.getNextInternalNumber(abbr);
        this.orderForm.patchValue(
          {
            internalNumberNumericPart: nextNumber,
          },
          { emitEvent: false }
        );
      }
    });
    
    this.orderForm.get("benefit").valueChanges.subscribe(() => {
      this.calculateDifferencesAndAdjustments();
    });
    this.orderForm
    .get("externalContributorAmount")
    .valueChanges.subscribe(() => {
      this.calculateDifferencesAndAdjustments();
    });
    
    this.orderForm.get("previsionDataHour").valueChanges.subscribe(() => {});
    this.orderForm.get("previsionDataDay").valueChanges.subscribe(() => {});
    
    Object.keys(this.orderForm.controls).forEach((key) => {
      const control = this.orderForm.get(key);
      control.statusChanges.subscribe(() => {
        this.updateFieldClasses(key);
      });
      control.valueChanges.subscribe(() => {
        this.updateFieldClasses(key);
      });
    });
  }
  
  private subscribeToUserSelections(): void {
    console.log("subscribeToUserSelections");
    const userFields = [
      "customer",
      "contact",
      "internalContributor",
      "externalContributor",
      "subcontractor",
    ];
    
    userFields.forEach((field) => {
      this.orderForm.get(field).valueChanges.subscribe((selectedUserId) => {
        this.onUserSelected(field, selectedUserId);
      });
    });
  }
  
  onUserSelected(field: string, selectedUserId: string): void {
    console.log(`Utilisateur sélectionné pour ${field}:`, selectedUserId);
    
    this.userProfileService.getOne(selectedUserId).subscribe(
      (selectedUser) => {
        if (selectedUser) {
          console.log(
            `Utilisateur avec ID ${selectedUserId} trouvé:`,
            selectedUser
          );
          
          const firstName =
          selectedUser.firstName || selectedUser["firstname"] || "";
          const lastName =
          selectedUser.lastName || selectedUser["lastname"] || "";
          
          this.contractData[`${field}Details`] = {
            firstName: firstName,
            lastName: lastName,
            email: selectedUser.email,
            phone: selectedUser.phone,
            company: selectedUser.company,
            role: selectedUser.role,
          };
          
          console.log(
            `Informations complètes pour ${field}:`,
            this.contractData[`${field}Details`]
          );
        } else {
          console.error(`Utilisateur avec ID ${selectedUserId} non trouvé.`);
        }
      },
      (error) => {
        console.error(
          `Erreur lors de la récupération de l'utilisateur avec ID ${selectedUserId}:`,
          error
        );
      }
    );
  }
  
  private setupBreadCrumbItems(): void {
    this.breadCrumbItems = [
      { label: "Accueil", path: "/" },
      { label: "Saisie d’une commande", active: true },
    ];
  }
  
  private setupUserSearchAndTypeahead(): void {
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

private setupCustomerSearchAndTypeahead(): void {
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
  this.customers = users.filter((user) => user.role === "customer");
});
}

private retrieveDataFromServices(): void {
  this.getInternalNumbers();
  this.loadBenefits();
  this.getAbbreviationList();
}

private subscribeToAbbreviationInput(): void {
  this.abbreviationInput$
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => {
      if (term) {
        const lowerCaseTerm = term.toLowerCase();
        return of(
          this.fullAbbreviationList.filter((abbr) =>
            abbr.toLowerCase().includes(lowerCaseTerm)
        )
      );
    } else {
      return of(this.fullAbbreviationList);
    }
  }),
  takeUntil(this.unsubscribe$)
)
.subscribe((filteredAbbreviations) => {
  this.filteredAbbreviationList = filteredAbbreviations;
});
}

private calculateDifferencesAndAdjustments(): void {
  const totalPrevisionHours =
  Number(this.orderForm.get("previsionDataDay").value) * 8 +
  Number(this.orderForm.get("previsionDataHour").value);
  const totalExecutionHours =
  Number(this.orderForm.get("executionDataDay").value) * 8 +
  Number(this.orderForm.get("executionDataHour").value);
  const difference = totalExecutionHours - totalPrevisionHours;
  
  const benefitId = this.orderForm.get("benefit").value;
  const benefitType = this.benefits.find(
    (benefit) => benefit.value === benefitId
  )?.name;
  const amount = Number(this.orderForm.get("benefitHt").value);
  
  let divider = 450;
  this.divider = divider;
  
  if (benefitType === "Sol") {
    divider = 650;
  }
  
  const days = amount / divider;
  const roundedDays = Math.floor(days);
  const hours = Math.round((days - roundedDays) * 8);
  
  const totalEstimatedHours = roundedDays * 8 + hours;
  const excessHours = totalEstimatedHours % 8;
  
  this.orderForm.patchValue(
    {
      previsionDataDay: roundedDays,
      previsionDataHour: hours,
      executionDataDay: Math.floor(totalExecutionHours / 8),
      executionDataHour: totalExecutionHours % 8,
      difference: difference,
    },
    { emitEvent: false }
  );
  
  this.totalEstimatedHours = totalEstimatedHours;
  this.excessHours = excessHours;
  this.divider = divider;
  this.amount = amount;
}

showCalculationDetails(): void {
  const modalRef = this.modalService.open(this.calculationDetailsModal);
}

private initializeDateCdeWithCurrentDate(): void {
  const today = new Date();
  const formattedDate = [
    today.getFullYear(),
    (today.getMonth() + 1).toString().padStart(2, "0"),
    today.getDate().toString().padStart(2, "0"),
  ].join("-");
  
  this.orderForm.patchValue({
    dateCde: formattedDate,
  });
}

initializeExternalContributorInvoiceDate(): void {
  const dateCde = new Date(this.orderForm.get("dateCde").value);
  const externalContributorInvoiceDate = new Date(
    dateCde.setDate(dateCde.getDate() + 2)
  );
  const formattedDate = [
    externalContributorInvoiceDate.getFullYear(),
    (externalContributorInvoiceDate.getMonth() + 1)
    .toString()
    .padStart(2, "0"),
    externalContributorInvoiceDate.getDate().toString().padStart(2, "0"),
  ].join("-");
  
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
      .sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
    );
    console.log("Prestations récupérées:", this.benefits);
  },
  (error) => {
    console.error("Erreur lors de la récupération des benefits", error);
    this.toastr.error("Erreur lors de la récupération des prestations.");
  }
);
}

getInternalNumbers() {
  this.contractService.getInternalNumbers().subscribe({
    next: (internalNumbers) => {
      this.internalNumberList = internalNumbers;
      this.initializeInternalNumber();
    },
    
    complete: () => {
      console.log("Numéros internes récupérés:", this.internalNumberList);
      this.initializeInternalNumber();
    },
    error: (error) => {
      console.error(
        "Erreur lors de la récupération des numéros internes",
        error
      );
      this.toastr.error(
        "Erreur lors de la récupération des numéros internes."
      );
    },
  });
}

// getNextInternalNumber(abbr: string): string {
//   const filteredNumbers = this.internalNumberList
//   .filter((item) => item.startsWith(abbr.toUpperCase()))
//   .map((item) => {
//     const match = item.match(/([A-Z]+)-(\d+)/);
//     return match ? parseInt(match[2], 10) : null;
//   })
//   .filter((number) => number !== null);
  
//   if (filteredNumbers.length === 0) {
//     return "001";
//   }
  
//   const maxNumber = Math.max(...filteredNumbers);
//   const nextNumber = maxNumber + 1;
//   const nextNumberString = nextNumber.toString().padStart(3, "0");
//   return nextNumberString;
// }

// initializeInternalNumber(): void {
//   console.log("Initialisation du numéro interne");
//   const abbr = this.orderForm.get("internalNumberAbbrPart").value;
//   if (abbr) {
//     const nextNumber = this.getNextInternalNumber(abbr);
//     this.orderForm.patchValue({
//       internalNumberNumericPart: nextNumber,
//     });
//   }
// }

// isInternalNumberNumericPartValid(): boolean {
//   return this.internalNumberList.some((item) => {
//     const match = item.match(/^([A-Z]{3,4}-)(\d{3})$/i);
//     return match && match[2] === this.contractData.internalNumberNumericPart;
//   });
// }
// Modification du format de internal_number
getNextInternalNumber(abbr: string): string {
  const currentYear = new Date().getFullYear().toString();
  const validFormatRegex = /^[A-Z]+-\d{4}-\d+(?:-\w+)?$/; // Regex pour vérifier le format attendu

  // Filtrer les numéros internes avec un format valide et correspondant à l'abréviation et à l'année en cours
  const filteredNumbers = this.internalNumberList
    .filter((item) => validFormatRegex.test(item)) // Exclure les numéros avec un format incorrect
    .filter((item) => {
      const parts = item.split("-");
      const itemAbbr = parts[0];
      const itemYear = parts[1];
      return itemAbbr === abbr.toUpperCase() && itemYear === currentYear;
    })
    .map((item) => {
      // Extraction de la partie numérique sans tenir compte du suffixe éventuel
      const match = item.match(/([A-Z]+)-(\d{4})-(\d+)(?:-(\w+))?/);
      return match ? parseInt(match[3], 10) : null; // Convertir en nombre entier pour comparaison
    })
    .filter((number) => number !== null);

  if (filteredNumbers.length === 0) {
    return "001"; // Si aucun numéro n'existe pour l'année, on commence avec "001"
  }

  // Trouver le numéro maximum parmi les numéros existants
  const maxNumber = Math.max(...filteredNumbers); // Comparer en tant qu'entiers
  const nextNumber = maxNumber + 1; // Calculer le prochain numéro

  // Formater le prochain numéro avec padding (3 chiffres minimum)
  return nextNumber.toString().padStart(3, "0");
}



// Modification du format de internal_number
isInternalNumberNumericPartValid(): boolean {
  return this.internalNumberList.some((item) => {
    const match = item.match(/^([A-Z]{3,4})-(\d{4})-(\d{3})$/i); // Modification pour inclure l'année et la partie numérique
    return match && match[3] === this.contractData.internalNumberNumericPart;
  });
}


// Modification du format de internal_number
initializeInternalNumber(): void {
  console.log("Initialisation du numéro interne");
  const abbr = this.orderForm.get("internalNumberAbbrPart").value;
  const year = new Date().getFullYear(); // Ajout de la gestion de l'année actuelle
  if (abbr) {
    const nextNumber = this.getNextInternalNumber(abbr);
    this.orderForm.patchValue({
      internalNumberNumericPart: nextNumber,
      yearPart: year // Mise à jour de l'année dans le formulaire si nécessaire
    });
  }
}



getAbbreviationList(): void {
  this.companyService.getCompaniesAbbreviations().subscribe({
    next: (abbreviations) => {
      this.fullAbbreviationList = abbreviations.filter(
        (abbr) => abbr !== null
      );
      
      this.fullAbbreviationList.sort();
      this.filteredAbbreviationList = this.fullAbbreviationList;
      console.log("Abbreviations récupérées:", this.fullAbbreviationList);
    },
    error: (error) => {
      console.error("Erreur lors de la récupération des abréviations", error);
      this.toastr.error("Erreur lors de la récupération des abréviations.");
    },
  });
}

assembleInternalNumber(): string {
  console.log("Assemblage du numéro interne");

  const abbr = (this.orderForm.get("internalNumberAbbrPart").value || '').toUpperCase();
  const numericPart = this.orderForm.get("internalNumberNumericPart").value || '';
  const year = this.orderForm.get("internalNumberYearPart").value || '';
  const suffix = this.orderForm.get('internalNumberSuffixPart').value || ''; // Suffixe optionnel

  // Vérification des champs obligatoires
  if (!abbr || !numericPart || !year) {
    this.toastr.error("Impossible d'assembler le numéro interne. Veuillez vérifier les champs obligatoires.");
    console.error("Numéro interne incomplet : abbr, numericPart ou year manquant.");
    return '';
  }

  // Assemblage de la partie principale du numéro
  const internalNumber = `${abbr}-${year}-${numericPart}`;

  // Si un suffixe est présent, l'ajouter à la fin
  const finalInternalNumber = suffix ? `${internalNumber}-${suffix}` : internalNumber;

  console.log("Numéro interne final assemblé :", finalInternalNumber);

  return finalInternalNumber;
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
      "Shift",
      "CapsLock"
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
    
    if (this.invalidKeyStrokes >= 3) {
      this.showEmoji();
    }
  }
}

showEmoji(): void {
  console.log("showEmoji");
  this.isEmojiVisible = true;
  this.invalidKeyStrokes = 0;
  
  this.toastr.error(
    "Saisie invalide détectée. Veuillez entrer uniquement des chiffres."
  );
  
  setTimeout(() => {
    this.isEmojiVisible = false;
  }, 3000);
}

onUserInputFocus(): void {
  this.userInput$.next("");
}

onSubmit(): void {
  console.log("Tentative de soumission du formulaire");
  if (this.isSubmitting) {
    return;
  }
  if (this.orderForm.valid) {
    this.prepareDataForSubmission(); // Préparation des données pour la soumission
    
    // alert(
    //   "Données du formulaire avant préparation:\n" +
    //     JSON.stringify(this.contractData, null, 2)
    // );
    
    if (!this.autoCalculateEnabled) {
      this.toastr.warning(
        "Le calcul automatique est désactivé. Veuillez vérifier et réactiver si nécessaire."
      );
      return;
    }
    
    this.modalService.open(this.confirmationModal).result.then(
      (result) => {
        if (result === true) {
          console.log("Résultat du modal de confirmation :", result);
          // this.prepareDataForSubmission();
          this.submitContractData();
        } else {
          console.log("Soumission annulée par l'utilisateur");
        }
      },
      (dismissReason) => {
        console.log("Modal fermée sans confirmation");
      }
    );
  } else {
    this.displayFormErrors();
    this.toastr.error("Certains champs du formulaire sont invalides. Veuillez les corriger.");
  }
}

private displayFormErrors(): void {
  Object.keys(this.orderForm.controls).forEach((key) => {
    const control = this.orderForm.get(key);
    const element = document.getElementById(key);
    
    if (element) {
      if (control.errors) {
        this.renderer.addClass(element, "is-invalid");
      } else {
        this.renderer.removeClass(element, "is-invalid");
      }
      if (control.touched && control.valid) {
        this.renderer.addClass(element, "is-valid");
      } else {
        this.renderer.removeClass(element, "is-valid");
      }
      if (control.touched && control.invalid) {
        this.renderer.addClass(element, "is-invalid");
      } else {
        this.renderer.removeClass(element, "is-invalid");
      }
      if (control.touched) {
        this.renderer.addClass(element, "is-touched");
      } else {
        this.renderer.removeClass(element, "is-touched");
      }
    }
  });
}

submitContractData(): void {
  console.log("Soumission des données du contrat:", this.contractData);
  
  this.isSubmitting = true; // Activation du flag
  
  this.contractService.addContract(this.contractData).subscribe({
    next: (response) => {
      console.log("Contrat créé avec succès", response);
      this.toastr.success("Le contrat a été créé avec succès.");
      
      this.isSubmitting = false; // Réinitialisation du flag ici pour éviter les problèmes
      
      if (this.files.length > 0) {
        this.onFileUpload(this.files, response.contractId);
      }
    },
    error: (error) => {
      console.error("Erreur lors de la création du contrat", error);
      this.toastr.error(
        "Une erreur est survenue lors de la création du contrat."
      );
      this.isSubmitting = false; // Réinitialisation du flag ici pour éviter les problèmes en cas d'erreur
    },
    complete: () => {
      this.router.navigate(["/manageOrders"]);
    }
  });
  
  this.isSubmitting = false;
}

private prepareDataForSubmission(): void {
  console.log("Préparation des données pour la soumission");
  console.log("Données du contrat avant la préparation:", this.contractData);
  
  const dataForSubmission = {};
  Object.keys(this.contractData).forEach((key) => {
    const snakeCaseKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    dataForSubmission[snakeCaseKey] = this.contractData[key];
  });
  console.log(
    "Données du contrat après la conversion en snake_case:",
    dataForSubmission
  );
  
  dataForSubmission["mail_sended"] = this.convertToBoolean(
    dataForSubmission["mail_sended"]
  );
  dataForSubmission["occupied"] = this.convertToBoolean(
    dataForSubmission["occupied"]
  );
  dataForSubmission["ss4"] = this.convertToBoolean(dataForSubmission["ss4"]);
  
  dataForSubmission["amount_ht"] = this.convertToNumber(
    dataForSubmission["amount_ht"]
  );
  dataForSubmission["benefit_ht"] = this.convertToNumber(
    dataForSubmission["benefit_ht"]
  );
  dataForSubmission["external_contributor_amount"] = this.convertToNumber(
    dataForSubmission["external_contributor_amount"]
  );
  dataForSubmission["subcontractor_amount"] = this.convertToNumber(
    dataForSubmission["subcontractor_amount"]
  );
  
  dataForSubmission["execution_data_day"] = this.convertToNumber(
    dataForSubmission["execution_data_day"]
  );
  dataForSubmission["execution_data_hour"] = this.convertToNumber(
    dataForSubmission["execution_data_hour"]
  );
  dataForSubmission["prevision_data_hour"] = this.convertToNumber(
    dataForSubmission["prevision_data_hour"]
  );
  dataForSubmission["prevision_data_day"] = this.convertToNumber(
    dataForSubmission["prevision_data_day"]
  );
  
  dataForSubmission["internal_number"] = this.assembleInternalNumber();
  
  dataForSubmission["dateAdd"] = new Date().toISOString();
  dataForSubmission["dateUppd"] = new Date().toISOString();
  
  dataForSubmission["createdBy"] = this.currentUser.userId;
  console.log("createdBy:", this.currentUser.userId);
  
  dataForSubmission["is_last_contract"] = this.contractData.isLastContract;
  
  console.log("Data prepared for submission", dataForSubmission);
  
  this.contractData = dataForSubmission;
  
  // enlève les champs inutiles : contact_details, customer_details, internal_contributor_details, external_contributor_details, subcontractor_details, difference, created_by, date_add, date_uppd
  delete this.contractData["contact_details"];
  delete this.contractData["customer_details"];
  delete this.contractData["internal_contributor_details"];
  delete this.contractData["external_contributor_details"];
  delete this.contractData["subcontractor_details"];
  delete this.contractData["difference"];
  delete this.contractData["created_by"];
  delete this.contractData["date_add"];
  delete this.contractData["date_uppd"];
  
  // alert(
  //   "Données du contrat préparées pour le backend:\n" +
  //     JSON.stringify(dataForSubmission["end_date_works"], null, 2)
  // );
}

private convertToBoolean(value: any): boolean {
  return value === true || value === "true";
}

private convertToNumber(value: any): number | null {
  const number = parseFloat(value);
  return isNaN(number) ? null : number;
}

onUserInputBlur(event: any): void {}

onFileUpload(files: File[], contractId: string) {
  console.log("Fichiers à uploader:", files);
  
  this.contractService.uploadFiles(contractId, files).subscribe(
    (event) => {
      if (event.type === HttpEventType.UploadProgress) {
        const percentDone = Math.round((100 * event.loaded) / event.total);
        console.log(`Progression de l'upload: ${percentDone}%`);
      } else if (event instanceof HttpResponse) {
        console.log("Fichiers complètement uploadés!", event.body);
        this.toastr.success("Fichiers uploadés avec succès.");
      }
    },
    (error) => {
      console.error("Erreur lors de l'upload des fichiers", error);
      this.toastr.error(
        "Une erreur est survenue lors de l'upload des fichiers."
      );
    }
  );
}

onSelect(event) {
  console.log(event);
  this.files.push(...event.addedFiles);
  this.toastr.success("Fichier ajouté à la liste.");
}

removeFile(index: number) {
  this.files.splice(index, 1);
  this.toastr.success("Fichier supprimé avec succès.");
}

openConfirmationModal() {
  const modalRef = this.modalService.open(this.confirmationModal);
  modalRef.result.then(
    (result) => {},
    (reason) => {
      console.log("Modal dismissed", reason);
    }
  );
}

confirmCreation(reuseSameNumber: boolean) {
  this.modalService.dismissAll();
  
  if (reuseSameNumber) {
    this.prepareNewOrder();
  } else {
    this.contractData.isLastContract = true;
    this.prepareDataForSubmission();
    this.submitContractData();
    // this.router.navigate(["/manageOrders"]);
  }
}

prepareNewOrder() {
  console.log(
    "Préparation d'une nouvelle commande avec les mêmes informations de base"
  );
  
  this.orderForm.patchValue({
    internalContributor: null,
    externalContributor: null,
    subcontractor: null,
    previsionDataHour: 0,
    previsionDataDay: 0,
    executionDataDay: 0,
    executionDataHour: 0,
    difference: 0,
    benefit: null,
  });
  
  this.toastr.success(
    "Le formulaire est prêt pour une nouvelle saisie avec les informations de base conservées."
  );
}

findUserById(userId: string) {
  return this.users.find((user) => user._id === userId);
}

private updateContractDataFromForm(): void {
  this.contractData = {
    ...this.contractData,
    ...this.orderForm.value,
    internalNumber: this.assembleInternalNumber(),
  };
  
  console.log("Updated contractData:", this.contractData);
}

addNewBenefit(name: string): void {
  if (!name) {
    console.error("Benefit name is required.");
    return;
  }
  
  const existingBenefit = this.benefits.map((benefit) => benefit.name);
  const existingBenefitName = this.isProbableTypo(name, existingBenefit);
  const levenshteinScore = existingBenefitName
  ? this.levenshteinDistance(name, existingBenefitName)
  : null;
  
  if (existingBenefitName) {
    this.warningMessage = `Il semble qu'une prestation similaire existe déjà: ${existingBenefitName}`;
    this.warningScore = levenshteinScore;
    this.modalService.open(this.warningModal);
    
    this.renderer.addClass(document.getElementById("benefit"), "pulsing-red");
    
    setTimeout(() => {
      this.renderer.removeClass(
        document.getElementById("benefit"),
        "pulsing-red"
      );
    }, 7000);
  } else {
    console.log("Ajout de la prestation:", name);
    const newBenefit = { name: name };
    this.benefitService.addBenefit(newBenefit).subscribe({
      next: (response) => {
        console.log("Prestation ajoutée avec succès:", response.benefit._id);
        this.loadBenefits();
        const benefitToSet = {
          name: response.benefit.name,
          value: response.benefit._id,
        };
        console.log("Prestation à définir:", benefitToSet);
        setTimeout(() => {
          this.orderForm.get("benefit").setValue(benefitToSet.value);
        }, 500);
        this.toastService.success("Prestation ajoutée avec succès.");
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout de la prestation", error);
        this.toastService.error("Erreur lors de l'ajout de la prestation.");
      },
    });
  }
}

deleteBenefit(benefitId: string, event: Event): void {
  event.stopPropagation();
  this.benefitToDelete = benefitId;
  
  this.benefitService.checkBenefitInUse(benefitId).subscribe({
    next: (isInUse) => {
      if (isInUse) {
        this.replacementBenefit = null;
        this.filteredBenefits = this.benefits.filter(
          (benefit) => benefit.value !== benefitId
        );
        this.modalService.open(this.deleteBenefitModal);
      } else {
        this.modalService.open(this.simpleDeleteConfirmationModal);
      }
    },
    error: (error) => {
      console.error("Erreur lors de la vérification de la prestation", error);
      this.toastr.error("Erreur lors de la vérification de la prestation.");
    },
  });
}

confirmDeleteBenefit(): void {
  if (this.replacementBenefit) {
    this.benefitService
    .replaceBenefit(this.benefitToDelete, this.replacementBenefit)
    .subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.loadBenefits();
        this.toastr.success(
          "Prestation remplacée et supprimée avec succès."
        );
      },
      error: (error) => {
        console.error(
          "Erreur lors du remplacement de la prestation",
          error
        );
        this.toastr.error("Erreur lors du remplacement de la prestation.");
      },
    });
  } else {
    this.benefitService.deleteBenefit(this.benefitToDelete).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.loadBenefits();
        this.toastr.success("Prestation supprimée avec succès.");
      },
      error: (error) => {
        console.error(
          "Erreur lors de la suppression de la prestation",
          error
        );
        this.toastr.error("Erreur lors de la suppression de la prestation.");
      },
    });
  }
}

confirmSimpleDeleteBenefit(): void {
  this.benefitService.deleteBenefit(this.benefitToDelete).subscribe({
    next: () => {
      this.modalService.dismissAll();
      this.loadBenefits();
      this.toastr.success("Prestation supprimée avec succès.");
    },
    error: (error) => {
      console.error("Erreur lors de la suppression de la prestation", error);
      this.toastr.error("Erreur lors de la suppression de la prestation.");
    },
  });
}

addNewReplacementBenefit(): void {
  const newBenefitName = prompt("Entrez le nom de la nouvelle prestation:");
  if (newBenefitName) {
    this.benefitService.addBenefit({ name: newBenefitName }).subscribe({
      next: (benefit) => {
        this.replacementBenefit = benefit.benefit._id;
        this.loadBenefits();
        this.toastr.success("Nouvelle prestation ajoutée avec succès.");
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout de la prestation", error);
        this.toastr.error("Erreur lors de l'ajout de la prestation.");
      },
    });
  }
}

levenshteinDistance(word1: string, word2: string): number {
  if (!word1 || !word2) {
    return Math.max(word1?.length || 0, word2?.length || 0);
  }
  
  const n = word1.length;
  const m = word2.length;
  
  if (n === 0) return m;
  if (m === 0) return n;
  
  const matrix: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0)
);

for (let i = 0; i <= n; i++) {
  matrix[i][0] = i;
}
for (let j = 0; j <= m; j++) {
  matrix[0][j] = j;
}

for (let i = 1; i <= n; i++) {
  for (let j = 1; j <= m; j++) {
    const cost = word1[i - 1] === word2[j - 1] ? 0 : 1;
    matrix[i][j] = Math.min(
      matrix[i - 1][j] + 1,
      matrix[i][j - 1] + 1,
      matrix[i - 1][j - 1] + cost
    );
  }
}

return matrix[n][m];
}

isProbableTypo(
  word: string,
  dictionary: string[],
  threshold: number = 2
): string | null {
  let minDistance = Infinity;
  let correction: string | null = null;
  
  for (const dictWord of dictionary) {
    const distance = this.levenshteinDistance(word, dictWord);
    
    if (distance < minDistance) {
      minDistance = distance;
      correction = dictWord;
    }
  }
  
  return minDistance <= threshold ? correction : null;
}

triggerExplosion(): void {}

private updateFieldClasses(key: string): void {
  const control = this.orderForm.get(key);
  const element = document.getElementById(key);
  if (control.touched && control.invalid) {
    this.renderer.addClass(element, "is-invalid");
    this.renderer.removeClass(element, "is-valid");
  } else if (control.touched && control.valid) {
    this.renderer.addClass(element, "is-valid");
    this.renderer.removeClass(element, "is-invalid");
  }
  if (control.touched) {
    this.renderer.addClass(element, "is-touched");
  }
}

getErrorMessage(errors: any): string {
  if (errors.required) {
    return "Ce champ est requis.";
  } else if (errors.pattern) {
    return "Le format est invalide.";
  } else if (errors.minlength) {
    return `La longueur minimale est de ${errors.minlength.requiredLength} caractères.`;
  } else if (errors.maxlength) {
    return `La longueur maximale est de ${errors.maxlength.requiredLength} caractères.`;
  }
  return "Champ invalide.";
}

private getCustomerNameById(customerId: string): string {
  const customer = this.userProfileService.getOne(customerId);
  
  return customer
  ? `${customer["firstname"]} ${customer["lastname"]}`
  : "Client inconnu";
}

private getBenefitNameById(benefitId: string): string {
  const benefit = this.benefits.find((b) => b.value === benefitId);
  return benefit ? benefit.name : "Prestation inconnue";
}

resetForm(): void {
  this.orderForm.reset();
  this.toastr.success("Formulaire réinitialisé.");
}

private calculateHoursAndDaysFromBenefit(): void {
  const benefitId = this.orderForm.get("benefit").value;
  const benefitType = this.benefits.find(
    (benefit) => benefit.value === benefitId
  )?.name;
  const amount = Number(this.orderForm.get("benefitHt").value);
  
  let divider = 450;
  
  if (benefitType === "Sol") {
    divider = 650;
  }
  
  const days = amount / divider;
  const roundedDays = Math.floor(days);
  const hours = Math.round((days - roundedDays) * 8);
  
  this.orderForm.patchValue(
    {
      previsionDataDay: roundedDays,
      previsionDataHour: hours,
    },
    { emitEvent: false }
  );
}

private calculateDaysFromHours(): void {
  if (this.isManuallyChanging) return;
  
  const totalHours = Number(this.orderForm.get("previsionDataHour").value);
  const totalDays = Math.floor(totalHours / 8);
  const remainingHours = totalHours % 8;
  
  if (
    totalDays !== this.orderForm.get("previsionDataDay").value ||
    remainingHours !== this.orderForm.get("previsionDataHour").value
  ) {
    this.isManuallyChanging = true;
    this.orderForm.patchValue(
      {
        previsionDataDay: totalDays,
        previsionDataHour: remainingHours,
      },
      { emitEvent: false }
    );
    this.isManuallyChanging = false;
  }
}

private calculateHoursFromDays(): void {
  if (this.isManuallyChanging) return;
  
  const totalDays = Number(this.orderForm.get("previsionDataDay").value);
  const totalHours =
  totalDays * 8 + Number(this.orderForm.get("previsionDataHour").value);
  
  const remainingDays = Math.floor(totalHours / 8);
  const remainingHours = totalHours % 8;
  
  if (
    remainingDays !== this.orderForm.get("previsionDataDay").value ||
    remainingHours !== this.orderForm.get("previsionDataHour").value
  ) {
    this.isManuallyChanging = true;
    this.orderForm.patchValue(
      {
        previsionDataHour: remainingHours,
        previsionDataDay: remainingDays,
      },
      { emitEvent: false }
    );
    this.isManuallyChanging = false;
  }
}

private subscribeToHourAndDayChanges(): void {
  this.orderForm
  .get("previsionDataHour")
  .valueChanges.pipe(debounceTime(300))
  .subscribe(() => {
    this.calculateDaysFromHours();
  });
  
  this.orderForm
  .get("previsionDataDay")
  .valueChanges.pipe(debounceTime(300))
  .subscribe(() => {
    this.calculateHoursFromDays();
  });
}

toggleAutoCalculate(): void {
  this.autoCalculateEnabled = !this.autoCalculateEnabled;
  
  if (this.autoCalculateEnabled) {
    this.orderForm.get("previsionDataHour").disable({ emitEvent: false });
    this.orderForm.get("previsionDataDay").disable({ emitEvent: false });
    this.subscribeToBenefitAmountChanges();
  } else {
    this.orderForm.get("previsionDataHour").enable({ emitEvent: false });
    this.orderForm.get("previsionDataDay").enable({ emitEvent: false });
  }
  
  this.orderForm.get("previsionDataHour").updateValueAndValidity();
  this.orderForm.get("previsionDataDay").updateValueAndValidity();
  
  console.log("activated:", this.autoCalculateEnabled);
  console.log(
    "previsionDataHour:",
    this.orderForm.get("previsionDataHour").enabled
  );
  console.log(
    "previsionDataDay:",
    this.orderForm.get("previsionDataDay").enabled
  );
  
  this.toastr.info(
    this.autoCalculateEnabled
    ? "Calcul automatique activé"
    : "Calcul automatique désactivé"
  );
}

private subscribeToBenefitAmountChanges(): void {
  this.benefitAmountSubscription = this.orderForm
  .get("benefitHt")
  .valueChanges.subscribe(() => {
    if (this.autoCalculateEnabled) {
      this.calculateHoursAndDaysFromBenefit();
    }
  });
}

private unsubscribeFromBenefitAmountChanges(): void {
  if (this.benefitAmountSubscription) {
    this.benefitAmountSubscription.unsubscribe();
    this.benefitAmountSubscription = null;
  }
}
}
