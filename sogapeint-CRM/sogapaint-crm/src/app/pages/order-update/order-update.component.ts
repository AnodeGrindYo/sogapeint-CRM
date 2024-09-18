import { Component, OnInit, ViewChild } from "@angular/core";
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
import { catchError } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

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

  loadingMessages: string[] = [
    "Chargement des données de la commande... Temps estimé: cela dépend de votre position dans le champ gravitationnel. Si vous êtes proches d'un trou noir, cela pourrait prendre un certain temps. Sinon, cela devrait être rapide. Merci de votre patience.",
    "Chargement des données de la commande... Temps estimé: en fonction de la courbure de l'espace-temps à votre emplacement actuel. Merci de votre patience.",
    "Chargement des données de la commande... Temps estimé: influencé par la relativité générale. Plus la gravité est forte, plus cela prendra du temps. Tenez bon!",
    "Chargement des données de la commande... Temps estimé: nous calculons avec précision selon la dilatation temporelle. Cela ne devrait pas prendre une éternité. Merci de votre patience.",
    "Chargement des données de la commande... Temps estimé: relatif à la vitesse de votre connexion internet et la gravité terrestre. Un peu de patience, s'il vous plaît.",
    "Chargement des données de la commande... Temps estimé: dépend de l'alignement des planètes et de la force gravitationnelle locale. Merci pour votre patience.",
    "Chargement des données de la commande... Temps estimé: affecté par les fluctuations quantiques et la courbure de l'espace-temps. Merci de votre patience.",
  ];

  @ViewChild("calculationDetailsModal") calculationDetailsModal;
  totalEstimatedHours: number;
  excessHours: number;
  divider: number;
  amount: number;

  isOldCommand: boolean = false;

  constructor(
    private contractService: ContractService,
    private userProfileService: UserProfileService,
    private companyService: CompanyService,
    private benefitService: BenefitService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    const randomLoadingMessage =
      this.loadingMessages[
        Math.floor(Math.random() * this.loadingMessages.length)
      ];
    this.toastr.info(randomLoadingMessage);
    this.initializeCurrentUser();
    this.initializeContractId();
    this.initializeBenefits();
    this.initializeForm();
    this.detectIfOldCommand();
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

  detectIfOldCommand(): void {
    // On vérifie si la commande n'a pas de champ createdBy
    this.contractService
      .getContractById(this.contractId)
      .subscribe((contract) => {
        this.isOldCommand = !contract.createdBy;
      });
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
        switchMap((term) => this.handleAbbreviationSearch(term)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((filteredAbbreviations) => {
        this.filteredAbbreviationList = filteredAbbreviations;
      });
  }

  handleAbbreviationSearch(term: string): Observable<string[]> {
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
  }

  // initializeRealTimeCalculations(): void {
  //   this.handleRealTimeDifference();
  //   this.handleRealTimeAdjustments();
  //   // this.handleRealTimeBenefit();
  //   this.patchOrderDate();
  //   this.patchExternalContributorInvoiceDate();
  // }
  initializeRealTimeCalculations(): void {
    this.handleRealTimeDifference();
    this.handleRealTimeAdjustments();

    this.patchOrderDate();
    this.patchExternalContributorInvoiceDate();

    this.orderUpdateForm
      .get("external_contributor_amount")
      .valueChanges.subscribe(() => {
        this.calculateAndSetPrevisionHours();
      });

    this.orderUpdateForm.get("benefit").valueChanges.subscribe(() => {
      this.calculateAndSetPrevisionHours();
    });
  }

  handleRealTimeDifference(): void {
    this.orderUpdateForm.valueChanges.subscribe((val) => {
      const totalPrevisionHours = this.calculateHours(
        "prevision_data_day",
        "prevision_data_hour"
      );
      const totalExecutionHours = this.calculateHours(
        "execution_data_day",
        "execution_data_hour"
      );
      const difference = totalExecutionHours - totalPrevisionHours;
      this.orderUpdateForm.patchValue(
        { difference: difference },
        { emitEvent: false }
      );
    });
  }

  // private handleRealTimeAdjustments(): void {
  //   this.orderUpdateForm.valueChanges.subscribe(() => {
  //     const totalPrevisionHours =
  //       Number(this.orderUpdateForm.get('prevision_data_day').value) * 8 +
  //       Number(this.orderUpdateForm.get('prevision_data_hour').value);
  //     const totalExecutionHours =
  //       Number(this.orderUpdateForm.get('execution_data_day').value) * 8 +
  //       Number(this.orderUpdateForm.get('execution_data_hour').value);
  //     const difference = totalExecutionHours - totalPrevisionHours;

  //     const benefitId = this.orderUpdateForm.get('benefit').value;
  //     const benefitType = this.benefits.find(benefit => benefit.value === benefitId)?.name;
  //     const amount = Number(this.orderUpdateForm.get('external_contributor_amount').value);

  //     let divider = 0;
  //     let hours = 0;
  //     if (benefitType === 'Peinture') {
  //       divider = 450;
  //     } else if (benefitType === 'Sol') {
  //       divider = 650;
  //     } else {
  //       divider = 450;
  //     }

  //     hours = amount / divider;
  //     hours = Math.round(hours * 100) / 100;

  //     this.orderUpdateForm.patchValue({
  //       prevision_data_hour: hours,
  //       difference: difference,
  //     }, { emitEvent: false });
  //   });
  // }
  private handleRealTimeAdjustments(): void {
    this.orderUpdateForm.valueChanges.subscribe(() => {
      const totalPrevisionHours =
        Number(this.orderUpdateForm.get("prevision_data_day").value) * 8 +
        Number(this.orderUpdateForm.get("prevision_data_hour").value);
      const totalExecutionHours =
        Number(this.orderUpdateForm.get("execution_data_day").value) * 8 +
        Number(this.orderUpdateForm.get("execution_data_hour").value);
      const difference = totalExecutionHours - totalPrevisionHours;

      this.orderUpdateForm.patchValue(
        {
          difference: difference,
        },
        { emitEvent: false }
      );
    });
  }

  showCalculationDetails(modal): void {
    const amount = Number(
      this.orderUpdateForm.get("external_contributor_amount").value
    );
    const benefitId = this.orderUpdateForm.get("benefit").value;
    const benefitType = this.benefits.find(
      (benefit) => benefit.value === benefitId
    )?.name;

    let divider = 450;
    if (benefitType === "Peinture") {
      divider = 450;
    } else if (benefitType === "Sol") {
      divider = 650;
    }

    const totalEstimatedHours = (amount / divider) * 8;
    const totalPrevisionDays = Math.floor(totalEstimatedHours / 8);
    const totalPrevisionHours = totalEstimatedHours % 8;
    const excessHours =
      totalEstimatedHours - (totalPrevisionDays * 8 + totalPrevisionHours);

    this.amount = amount;
    this.divider = divider;
    this.totalEstimatedHours = totalEstimatedHours;
    this.excessHours = excessHours;

    this.modalService.open(modal);
  }

  calculateHours(dayFieldName: string, hourFieldName: string): number {
    return (
      Number(this.orderUpdateForm.get(dayFieldName).value) * 8 +
      Number(this.orderUpdateForm.get(hourFieldName).value)
    );
  }

  private calculateAndSetPrevisionHours() {
    const amount = Number(
      this.orderUpdateForm.get("external_contributor_amount").value
    );
    const benefitId = this.orderUpdateForm.get("benefit").value;
    const benefitType = this.benefits.find(
      (benefit) => benefit.value === benefitId
    )?.name;

    let divider = 450;
    if (benefitType === "Peinture") {
      divider = 450;
    } else if (benefitType === "Sol") {
      divider = 650;
    }

    const totalEstimatedHours = (amount / divider) * 8;
    const totalPrevisionDays = Math.floor(totalEstimatedHours / 8);
    const totalPrevisionHours = totalEstimatedHours % 8;

    this.orderUpdateForm.patchValue(
      {
        prevision_data_day: totalPrevisionDays,
        prevision_data_hour: totalPrevisionHours,
      },
      { emitEvent: false }
    );
  }

  handleRealTimeBenefit(): void {
    this.orderUpdateForm.valueChanges.subscribe((val) => {
      const amountHt = Number(this.orderUpdateForm.get("amount_ht").value);
      const external_contributor_amount = Number(
        this.orderUpdateForm.get("external_contributor_amount").value
      );
      const subcontractor_amount = Number(
        this.orderUpdateForm.get("subcontractor_amount").value
      );
      // const benefitHT = amountHt - external_contributor_amount - subcontractor_amount;
      // this.orderUpdateForm.patchValue({ benefit_ht: benefitHT }, { emitEvent: false });
    });
  }

  patchOrderDate(): void {
    this.orderUpdateForm.get("date_cde").valueChanges.subscribe((val) => {
      if (!val) {
        this.orderUpdateForm.patchValue(
          { date_cde: new Date().toISOString().split("T")[0] },
          { emitEvent: false }
        );
      }
    });
  }

  patchExternalContributorInvoiceDate(): void {
    this.orderUpdateForm
      .get("external_contributor_invoice_date")
      .valueChanges.subscribe((val) => {
        if (!val) {
          this.orderUpdateForm.patchValue(
            {
              external_contributor_invoice_date: new Date()
                .toISOString()
                .split("T")[0],
            },
            { emitEvent: false }
          );
        }
      });
  }

  initializeBenefits(): void {
    this.benefitService.getBenefits().subscribe({
      next: (benefits) => {
        this.benefits = benefits;
        this.toastr.success("Prestations récupérées avec succès.");
        console.log("Prestations récupérées:", benefits);
      },
      error: (error) => {
        this.toastr.error(
          "Erreur lors de la récupération des prestations.",
          error
        );
        console.error("Erreur lors de la récupération des prestations", error);
      },
    });
  }

  //////////////////////////

  private initializeForm() {
    this.orderUpdateForm = new FormGroup({
      // internal_number: new FormControl('', Validators.required),
      // internalNumberNumericPart: new FormControl("", [
      //   Validators.required,
      //   Validators.pattern(/^\d{3}$/),
      // ]),
      // internalNumberAbbrPart: new FormControl("", Validators.required),
      internalNumberAbbrPart: new FormControl("", Validators.required),
      internalNumberYearPart: new FormControl(new Date().getFullYear(), [
        Validators.required,
        Validators.min(2020),
        Validators.max(9999),
      ]),
      internalNumberNumericPart: new FormControl("", [
        Validators.required,
        Validators.pattern(/^\d+$/),
      ]),
      internalNumberSuffixPart: new FormControl(""),
      customer: new FormControl(undefined, Validators.required),
      contact: new FormControl(""),
      internal_contributor: new FormControl(""),
      external_contributor: new FormControl(""),
      subcontractor: new FormControl(""),
      address: new FormControl(""),
      appartment_number: new FormControl(""),
      ss4: new FormControl(""),
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
      prevision_data_hour: new FormControl("", [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      prevision_data_day: new FormControl("", [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      execution_data_day: new FormControl("", [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      execution_data_hour: new FormControl("", [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
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
          // contract.end_date_customer = contract.end_date_customer
          //   ? contract.end_date_customer.split("T")[0]
          //   : "";
          if (this.isOldCommand) {
            contract.end_date_customer = this.correctOldDateFormat(
              contract.end_date_customer
            );
          } else {
            contract.end_date_customer = contract.end_date_customer
              ? contract.end_date_customer.split("T")[0]
              : "";
          }

          // Divise le numéro interne en abréviation et partie numérique
          // const internalNumberParts = contract.internal_number
          //   ? contract.internal_number.split("-")
          //   : ["", ""];
          // const abbreviation = internalNumberParts[0];
          // const numericPart = internalNumberParts[1];
          const internalNumberParts = contract.internal_number
            ? contract.internal_number.split("-")
            : ["", "", ""];
          const abbreviation = internalNumberParts[0];
          const year = internalNumberParts[1];
          const numericPart = internalNumberParts[2];
          const suffix =
            internalNumberParts.length > 3 ? internalNumberParts[3] : "";

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
          contract.external_contributor_invoice_date =
            contract.external_contributor_invoice_date
              ? contract.external_contributor_invoice_date.split("T")[0]
              : "";

          const patchValues = {
            ...contract,
            start_date_works: contract.start_date_works,
            end_date_works: contract.end_date_works,
            end_date_customer: contract.end_date_customer,
            external_contributor_invoice_date:
              contract.external_contributor_invoice_date,
            date_cde: contract.date_cde,
            // internalNumberAbbrPart: abbreviation, // Partie abréviation
            // internalNumberNumericPart: numericPart, // Partie numérique
            internalNumberAbbrPart: abbreviation,
            internalNumberYearPart: year,
            internalNumberNumericPart: numericPart,
            internalNumberSuffixPart: suffix,
            benefit: contract.benefit,
          };

          // Charge les données utilisateur et patche le formulaire
          this.loadUserDataAndPatchForm(contract, patchValues);
          this.toastr.success("Données du contrat chargées avec succès.");
          console.log("Contract data loaded:", JSON.stringify(contract));
        });
    } else {
      console.log("No contract id provided");
      this.toastr.error("Erreur : Aucun identifiant de contrat fourni.");
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

    forkJoin(userRequests)
      .pipe(
        catchError((error) => {
          // Logique de gestion d'erreur
          console.error(
            "Une erreur est survenue lors de la récupération des utilisateurs",
            error
          );
          // On pourra décider de renvoyer un Observable vide, ou de gérer l'erreur d'une manière
          // qui convient à notre application
          return of([]);
        })
      )
      .subscribe((userResponses) => {
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
          patchValues.benefit = this.benefits.find(
            (b) => b._id === contract.benefit
          );
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
      // Assembler le numéro interne avant de soumettre les données
      const assembledInternalNumber = this.assembleInternalNumber();

      // Vérification que le numéro interne est valide avant de continuer
      if (!assembledInternalNumber) {
        this.toastr.error(
          "Le numéro interne est invalide ou incomplet. Veuillez vérifier les champs."
        );
        return; // Interrompt la soumission si le numéro interne n'est pas valide
      }

      const data = this.prepareDataForSubmit();

      // Injecter le numéro interne assemblé dans les données à soumettre
      data.internal_number = assembledInternalNumber;

      this.toastr.info("Soumission des mises à jour...");
      console.log("Data to submit:", data);

      // Appel à l'API pour la mise à jour du contrat avec les données modifiées
      this.contractService.updateContract(this.contractId, data).subscribe({
        next: () => {
          this.toastr.success("Contrat mis à jour avec succès.");
          console.log("Contract updated successfully");
          this.router.navigate(["/order-detail", this.contractId]);
        },
        error: (error) => {
          this.toastr.error("Erreur lors de la mise à jour du contrat.", error);
          console.error("Error updating contract:", error);
        },
      });
    } else {
      this.toastr.error("Formulaire invalide. Veuillez corriger les erreurs.");
      console.error("Form is invalid");
      console.log("Form values:", this.orderUpdateForm.value);
      console.log("data values:", this.prepareDataForSubmit());
      console.log("invalid fields:", this.findInvalidControls());
    }
  }

  prepareDataForSubmit(): any {
    // récupère le status
    const status = this.orderUpdateForm.get("status").value;
    const data = { ...this.orderUpdateForm.value };
    console.log("data befor modification", data);
    data.status = status;
    // assemble le numéro interne
    data.date_cde = new Date(data.date_cde).toLocaleDateString("fr-CA");
    // convertit end_date_customer en dd/mm/yyyy
    data.end_date_customer = new Date(
      data.end_date_customer
    ).toLocaleDateString("fr-CA");
    // convertit external_contributor_invoice_date en dd/mm/yyyy
    data.external_contributor_invoice_date = new Date(
      data.external_contributor_invoice_date
    ).toLocaleDateString("fr-CA");
    // convertit start_date_works en dd/mm/yyyy
    data.start_date_works = new Date(data.start_date_works).toLocaleDateString(
      "fr-CA"
    );
    // convertit end_date_works en dd/mm/yyyy
    data.end_date_works = new Date(data.end_date_works).toLocaleDateString(
      "fr-CA"
    );
    // assure que modifiedBy est un tableau
    if (!data.modifiedBy) {
      data.modifiedBy = [];
    }
    // rajoute une entrée {user: _id, date: date} dans modifiedBy
    data.modifiedBy.push({ user: this.currentUser.userId, date: new Date() });
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

  // assembleInternalNumber(): string {
  //   return `${this.orderUpdateForm
  //     .get("internalNumberAbbrPart")
  //     .value.toUpperCase()}-${
  //     this.orderUpdateForm.get("internalNumberNumericPart").value
  //   }`;
  // }
  assembleInternalNumber(): string {
    const abbr = (
      this.orderUpdateForm.get("internalNumberAbbrPart").value || ""
    ).toUpperCase();
    const numericPart =
      this.orderUpdateForm.get("internalNumberNumericPart").value || "";
    const year = this.orderUpdateForm.get("internalNumberYearPart").value || "";
    const suffix =
      this.orderUpdateForm.get("internalNumberSuffixPart").value || "";

    if (!abbr || !numericPart || !year) {
      this.toastr.error(
        "Impossible d'assembler le numéro interne. Veuillez vérifier les champs obligatoires."
      );
      return "";
    }

    const internalNumber = `${abbr}-${year}-${numericPart}`;

    return suffix ? `${internalNumber}-${suffix}` : internalNumber;
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
    console.log("Ajout de la prestation:", name);
    this.toastr.info("Ajout de la prestation ", name);
    const newBenefit = { name: name };
    this.benefitService.addBenefit(newBenefit).subscribe({
      next: (benefit) => {
        this.toastr.success(
          "Prestation ajoutée avec succès:",
          benefit.benefit._id
        );
        console.log("Prestation ajoutée avec succès:", benefit.benefit._id);
        this.initializeBenefits();
        const benefitToSet = {
          name: benefit.benefit.name,
          value: benefit.benefit._id,
        };
        console.log("Prestation à définir:", benefitToSet);
        setTimeout(() => {
          this.orderUpdateForm.get("benefit").setValue(benefitToSet.value);
        }, 500);
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout de la prestation", error);
        this.toastr.error("Erreur lors de l'ajout de la prestation", error);
      },
    });
  }

  deleteBenefit(benefitId: string, event: Event): void {
    this.toastr.info("Suppression de la prestation...");
    event.stopPropagation(); // Pour empêcher la sélection de l'élément
    this.benefitService.deleteBenefit(benefitId).subscribe({
      next: () => {
        this.initializeBenefits();
        this.toastr.success("Prestation supprimée avec succès.");
      },
      error: (error) => {
        console.error("Erreur lors de la suppression de la prestation", error);
        this.toastr.error(
          "Erreur lors de la suppression de la prestation",
          error
        );
      },
    });
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

  // Méthode pour corriger l'inversion des anciennes dates (YYYY-DD-MM → YYYY-MM-DD)
  correctOldDateFormat(date: string): string {
    if (!date) return "";
    const [year, day, month] = date.split("-"); // Supposons que l'ancienne date soit mal formatée
    return `${year}-${month}-${day}`; // On réinvente pour que ce soit YYYY-MM-DD
  }

  // Méthode pour formater une date ISO
  formatISODate(date: string): string {
    if (!date) return "";
    const parsedDate = new Date(date);
    const day = ("0" + parsedDate.getDate()).slice(-2);
    const month = ("0" + (parsedDate.getMonth() + 1)).slice(-2); // Les mois commencent à 0
    const year = parsedDate.getFullYear();
    return `${year}-${month}-${day}`; // Format final
  }

  correctOldDateFormatForSubmit(date: string): string {
    if (!date) return '';
    const [day, month, year] = date.split('/'); // On part du format dd/MM/yyyy
    return `${year}-${day}-${month}`; // Retourne YYYY-DD-MM
  }
  
  formatISODateForSubmit(date: string): string {
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }
}
