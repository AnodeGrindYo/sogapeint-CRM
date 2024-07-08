import { Component, OnInit, Renderer2, ViewChild } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ContractService } from "../../core/services/contract.service";
import { CompanyService } from "../../core/services/company.service";
import { UserProfileService } from "../../core/services/user.service";
import { BenefitService } from "src/app/core/services/benefit.service";
import { Router } from "@angular/router";
import { Subject, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from "rxjs";
import { HttpEventType, HttpResponse } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastService } from 'angular-toastify';
import { ToastrService } from 'ngx-toastr';

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
    trash: false,
    dateCde: null,
    billingAmount: 0,
  };

  users: any[] = [];
  userInput$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();
  currentUser: any;

  statuses = [
    { name: "En cours", value: "in_progress" || null },
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
  replacementBenefit: string;
  benefitToDelete: string;
  filteredBenefits: any[] = [];
  @ViewChild("warningModal") warningModal;
  warningMessage: string;
  warningScore: number;
  isExploding: boolean = false;
  isFalling: boolean = false;

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

  // ngOnInit(): void {
  //   this.setupBreadCrumbItems();
  //   this.currentUser = this.userProfileService.getCurrentUser();
  //   console.log("Utilisateur connecté:", this.currentUser);
  //   this.initializeOrderForm();
  //   this.subscribeToFormChanges();
  //   this.setupUserSearchAndTypeahead();
  //   this.retrieveDataFromServices();
  //   this.subscribeToAbbreviationInput();
  //   this.initializeDateCdeWithCurrentDate();

  //   this.orderForm.valueChanges.subscribe((values) => {
  //     console.log("Modification du formulaire:", values);
  //     console.log(this.orderForm.status);
  //     console.log(this.orderForm.errors);
  //   });
  //   this.orderForm.get("invoiceNumber").valueChanges.subscribe((value) => {
  //     console.log("invoiceNumber change:", value);
  //   });
  //   Object.keys(this.orderForm.controls).forEach((key) => {
  //     const control = this.orderForm.get(key);
  //     console.log(key, control.errors);
  //   });

  //   this.orderForm.patchValue({
  //     previsionDataHour: this.contractData.previsionDataHour,
  //     previsionDataDay: this.contractData.previsionDataDay,
  //   });
  // }
  ngOnInit(): void {
    this.setupBreadCrumbItems();
    this.currentUser = this.userProfileService.getCurrentUser();
    console.log("Utilisateur connecté:", this.currentUser);
    this.initializeOrderForm();
    this.subscribeToFormChanges();
    this.setupUserSearchAndTypeahead();
    this.retrieveDataFromServices();
    this.subscribeToAbbreviationInput();
    this.initializeDateCdeWithCurrentDate();

    this.orderForm.valueChanges.subscribe((values) => {
        console.log("Modification du formulaire:", values);
        console.log(this.orderForm.status);
        console.log(this.orderForm.errors);
    });

    this.orderForm.get("invoiceNumber").valueChanges.subscribe((value) => {
        console.log("invoiceNumber change:", value);
        this.toastr.info(`Invoice number changed to: ${value}`);
    });

    Object.keys(this.orderForm.controls).forEach((key) => {
        const control = this.orderForm.get(key);
        control.statusChanges.subscribe(() => {
            this.updateFieldClasses(key);
            if (control.invalid && control.touched) {
                this.toastr.error(`Invalid input in field: ${key}`);
            } else if (control.valid && control.touched) {
                this.toastr.success(`Valid input in field: ${key}`);
            }
        });
        control.valueChanges.subscribe(() => {
            this.updateFieldClasses(key);
        });
    });

    // Triggering toast messages for testing
    this.toastr.success("Form Initialized Successfully");
    this.toastr.info("Ready to enter data into the form");
}



  private initializeOrderForm(): void {
    this.orderForm = new FormGroup({
      internalNumberAbbrPart: new FormControl(
        this.contractData.internalNumberAbbrPart,
        [Validators.pattern(/^[BCDFGHJKLMNPQRSTVWXYZ]{1,5}$/)]
      ),
      internalNumberNumericPart: new FormControl(
        this.contractData.internalNumberNumericPart,
        [Validators.pattern(/^\d{3}$/)]
      ),
      customer: new FormControl(
        this.contractData.customer,
        Validators.required
      ),
      internalContributor: new FormControl(
        this.contractData.internalContributor
      ),
      contact: new FormControl(this.contractData.contact),
      externalContributor: new FormControl(
        this.contractData.externalContributor
      ),
      subcontractor: new FormControl(this.contractData.subcontractor),
      address: new FormControl(this.contractData.address),
      appartmentNumber: new FormControl(this.contractData.appartmentNumber),
      ss4: new FormControl(this.contractData.ss4),
      quoteNumber: new FormControl(this.contractData.quoteNumber),
      mailSended: new FormControl(this.contractData.mailSended),
      invoiceNumber: new FormControl(this.contractData.invoiceNumber),
      amountHt: new FormControl(this.contractData.amountHt, [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      benefitHt: new FormControl(this.contractData.benefitHt, [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      externalContributorAmount: new FormControl(
        this.contractData.externalContributorAmount,
        [Validators.pattern(/^\d+\.?\d*$/)]
      ),
      subcontractorAmount: new FormControl(
        this.contractData.subcontractorAmount,
        [Validators.pattern(/^\d+\.?\d*$/)]
      ),
      external_contributor_invoice_date: new FormControl(
        this.contractData.external_contributor_invoice_date
      ),
      previsionDataHour: new FormControl(this.contractData.previsionDataHour, [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      previsionDataDay: new FormControl(this.contractData.previsionDataDay, [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      executionDataDay: new FormControl(this.contractData.executionDataDay, [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      executionDataHour: new FormControl(this.contractData.executionDataHour, [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      difference: new FormControl(this.contractData.difference),
      benefit: new FormControl(this.contractData.benefit),
      status: new FormControl(this.contractData.status),
      occupied: new FormControl(this.contractData.occupied),
      startDateWorks: new FormControl(this.contractData.startDateWorks),
      endDateWorks: new FormControl(this.contractData.endDateWorks),
      endDateCustomer: new FormControl(this.contractData.endDateCustomer),
      trash: new FormControl(this.contractData.trash),
      dateCde: new FormControl(this.contractData.dateCde),
      billingAmount: new FormControl(this.contractData.billingAmount, [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
    });
  }

  private subscribeToFormChanges(): void {
    this.orderForm.valueChanges.subscribe((val) => {
      this.contractData = { ...this.contractData, ...val };
      this.calculateDifferencesAndAdjustments();
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

    this.orderForm.get("previsionDataHour").valueChanges.subscribe(() => {
      this.calculateDifferencesAndAdjustments();
    });
    this.orderForm.get("previsionDataDay").valueChanges.subscribe(() => {
      this.calculateDifferencesAndAdjustments();
    });

    // Ajouter des listeners pour l'état des champs
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

    let divider = 0;
    let hours = 0;
    if (benefitType === "Peinture") {
      divider = 450;
    } else if (benefitType === "Sol") {
      divider = 650;
    } else {
      divider = 450;
    }

    hours = amount / divider;

    hours = Math.round(hours * 100) / 100;

    const daysPrevision = Math.floor(hours / 8);
    const hoursPrevision = hours % 8;

    this.orderForm.patchValue(
      {
        previsionDataHour: hours,
        previsionDataDay: daysPrevision,
        executionDataDay: Math.floor(totalExecutionHours / 8),
        difference: difference,
      },
      { emitEvent: false }
    );

    this.orderForm.patchValue(
      {
        previsionDataHour: hours,
        difference: difference,
      },
      { emitEvent: false }
    );
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
        this.toastr.error('Erreur lors de la récupération des prestations.');
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
        this.initializeInternalNumber();
      },
      error: (error) => {
        console.error(
          "Erreur lors de la récupération des numéros internes",
          error
        );
        this.toastr.error('Erreur lors de la récupération des numéros internes.');
      },
    });
  }

  getNextInternalNumber(abbr: string): string {
    const filteredNumbers = this.internalNumberList
      .filter((item) => item.startsWith(abbr.toUpperCase()))
      .map((item) => {
        const match = item.match(/([A-Z]+)-(\d+)/);
        return match ? parseInt(match[2], 10) : null;
      })
      .filter((number) => number !== null);

    if (filteredNumbers.length === 0) {
      return "001";
    }

    const maxNumber = Math.max(...filteredNumbers);
    const nextNumber = maxNumber + 1;
    const nextNumberString = nextNumber.toString().padStart(3, "0");
    return nextNumberString;
  }

  initializeInternalNumber(): void {
    console.log("Initialisation du numéro interne");
    const abbr = this.orderForm.get("internalNumberAbbrPart").value;
    if (abbr) {
      const nextNumber = this.getNextInternalNumber(abbr);
      this.orderForm.patchValue({
        internalNumberNumericPart: nextNumber,
      });
    }
  }

  isInternalNumberNumericPartValid(): boolean {
    return this.internalNumberList.some((item) => {
      const match = item.match(/^([A-Z]{3,4}-)(\d{3})$/i);
      return match && match[2] === this.contractData.internalNumberNumericPart;
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
        console.log("Abbreviations récupérées:", this.fullAbbreviationList);
      },
      error: (error) => {
        console.error("Erreur lors de la récupération des abréviations", error);
        this.toastr.error('Erreur lors de la récupération des abréviations.');
      },
    });
  }

  assembleInternalNumber(): string {
    return `${this.contractData.internalNumberAbbrPart.toUpperCase()}-${
      this.contractData.internalNumberNumericPart
    }`;
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

      if (this.invalidKeyStrokes >= 3) {
        this.showEmoji();
      }
    }
  }

  showEmoji(): void {
    console.log("showEmoji");
    this.isEmojiVisible = true;
    this.invalidKeyStrokes = 0;

    this.toastr.error('Saisie invalide détectée. Veuillez entrer uniquement des chiffres.');

    setTimeout(() => {
      this.isEmojiVisible = false;
    }, 3000);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onUserInputFocus(): void {
    this.userInput$.next("");
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
        console.log("Subcontractor ID from form:", this.orderForm.value.subcontractor);

        this.contractData = { ...this.contractData, ...this.orderForm.value };
        console.log("Updated contractData with form values:", this.contractData);
        this.prepareDataForSubmission();

        this.submitContractData();
    } else {
      // marque tous les champs comme touchés pour afficher les erreurs
        this.orderForm.markAllAsTouched();
        this.displayFormErrors();
        this.toastr.error('Veuillez corriger les erreurs dans le formulaire.');
    }
}



  private displayFormErrors(): void {
    Object.keys(this.orderForm.controls).forEach((key) => {
        const control = this.orderForm.get(key);
        const element = document.getElementById(key);

        if (element) { // Il faut s'assurer que l'élément existe
            if (control.errors) {
                this.renderer.addClass(element, 'is-invalid');
            } else {
                this.renderer.removeClass(element, 'is-invalid');
            }
            if (control.touched && control.valid) {
                this.renderer.addClass(element, 'is-valid');
            } else {
                this.renderer.removeClass(element, 'is-valid');
            }
            if (control.touched && control.invalid) {
                this.renderer.addClass(element, 'is-invalid');
            } else {
                this.renderer.removeClass(element, 'is-invalid');
            }
            if (control.touched) {
                this.renderer.addClass(element, 'is-touched');
            } else {
                this.renderer.removeClass(element, 'is-touched');
            }
        }
    });
}


  private submitContractData(): void {
    console.log("Soumission des données du contrat:", this.contractData);
    this.contractService.addContract(this.contractData).subscribe({
      next: (response) => {
        console.log("Contrat créé avec succès", response);
        this.toastr.success('Le contrat a été créé avec succès.');

        if (this.files.length > 0) {
          console.log("il y a des fichiers à uploader");
          this.onFileUpload(this.files, response.contractId);
        }

        this.openConfirmationModal();
      },
      error: (error) => {
        console.error("Erreur lors de la création du contrat", error);
        this.toastr.error('Une erreur est survenue lors de la création du contrat.');
      },
    });
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
    dataForSubmission["trash"] = this.convertToBoolean(
      dataForSubmission["trash"]
    );
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

    console.log("Data prepared for submission", dataForSubmission);

    this.contractData = dataForSubmission;
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
          this.toastr.success('Fichiers uploadés avec succès.');
        }
      },
      (error) => {
        console.error("Erreur lors de l'upload des fichiers", error);
        this.toastr.error('Une erreur est survenue lors de l\'upload des fichiers.');
      }
    );
  }

  onSelect(event) {
    console.log(event);
    this.files.push(...event.addedFiles);
    this.toastr.success('Fichier ajouté à la liste.');
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
    this.toastr.success('Fichier supprimé avec succès.');
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
    this.submitContractData();

    this.modalService.dismissAll();

    if (reuseSameNumber) {
      this.prepareNewOrder();
    } else {
      this.router.navigate(["/manageOrders"]);
    }
  }

  private prepareNewOrder() {
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

    console.log(
      "Le formulaire a été préparé pour une nouvelle saisie avec certains champs réinitialisés."
    );
    this.toastr.success('Le formulaire est prêt pour une nouvelle saisie.');
  }

  findUserById(userId: string) {
    return this.users.find((user) => user._id === userId);
  }

  private updateContractDataFromForm(): void {
    this.contractData = {
      ...this.contractData,
      ...this.orderForm.value,
    };

    console.log("Updated contractData:", this.contractData);
  }

  addNewBenefit(name: string): void {
    const existingBenefit = this.benefits.map((benefit) => benefit.name);
    const existingBenefitName = this.isProbableTypo(name, existingBenefit);
    const levenshteinScore = this.levenshteinDistance(
      name,
      existingBenefitName
    );

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
    }

    console.log("Ajout de la prestation:", name);
    const newBenefit = { name: name };
    this.benefitService.addBenefit(newBenefit).subscribe({
      next: (benefit) => {
        console.log("Prestation ajoutée avec succès:", benefit.benefit._id);
        this.loadBenefits();
        const benefitToSet = {
          name: benefit.benefit.name,
          value: benefit.benefit._id,
        };
        console.log("Prestation à définir:", benefitToSet);
        setTimeout(() => {
          this.orderForm.get("benefit").setValue(benefitToSet.value);
        }, 500);
        this.toastr.success('Prestation ajoutée avec succès.');
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout de la prestation", error);
        this.toastr.error('Erreur lors de l\'ajout de la prestation.');
      }
    });
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
          this.confirmDeleteBenefit();
        }
      },
      error: (error) => {
        console.error("Erreur lors de la vérification de la prestation", error);
        this.toastr.error('Erreur lors de la vérification de la prestation.');
      }
    });
  }

  confirmDeleteBenefit(): void {
    this.benefitService.deleteBenefit(this.benefitToDelete).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.loadBenefits();
        this.toastr.success('Prestation supprimée avec succès.');
      },
      error: (error) => {
        console.error("Erreur lors de la suppression de la prestation", error);
        this.toastr.error('Erreur lors de la suppression de la prestation.');
      }
    });
  }

  addNewReplacementBenefit(): void {
    const newBenefitName = prompt("Entrez le nom de la nouvelle prestation:");
    if (newBenefitName) {
      this.benefitService.addBenefit({ name: newBenefitName }).subscribe({
        next: (benefit) => {
          this.replacementBenefit = benefit.benefit._id;
          this.loadBenefits();
          this.toastr.success('Nouvelle prestation ajoutée avec succès.');
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout de la prestation", error);
          this.toastr.error('Erreur lors de l\'ajout de la prestation.');
        }
      });
    }
  }

  levenshteinDistance(word1: string, word2: string): number {
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
          matrix[i - 1][j] + 1, // suppression
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
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
      this.renderer.addClass(element, 'is-invalid');
      this.renderer.removeClass(element, 'is-valid');
    } else if (control.touched && control.valid) {
      this.renderer.addClass(element, 'is-valid');
      this.renderer.removeClass(element, 'is-invalid');
    }
    if (control.touched) {
      this.renderer.addClass(element, 'is-touched');
    }
  }

  getErrorMessage(errors: any): string {
    if (errors.required) {
      return 'Ce champ est requis.';
    } else if (errors.pattern) {
      return 'Le format est invalide.';
    } else if (errors.minlength) {
      return `La longueur minimale est de ${errors.minlength.requiredLength} caractères.`;
    } else if (errors.maxlength) {
      return `La longueur maximale est de ${errors.maxlength.requiredLength} caractères.`;
    }
    return 'Champ invalide.';
  }
}
