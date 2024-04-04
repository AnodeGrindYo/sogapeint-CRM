import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ContractService } from "../../core/services/contract.service";
import { UserProfileService } from "../../core/services/user.service";
import { CompanyService } from "../../core/services/company.service";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
  switchMap,
  takeUntil,
} from "rxjs";
import { HttpEventType, HttpResponse } from "@angular/common/http";

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

  benefits = [
    { name: "Peinture", value: "5e4ba27006d62fd4a4e49916" },
    { name: "Sol", value: "5e4ba27606d62fd4a4e49917" },
    { name: "Électricité", value: "5e52cb8148f8b27b3d077a84" },
    { name: "Plomberie", value: "5e52cb8148f8b27b3d077a85" },
    { name: "Maçonnerie", value: "5e52cb8148f8b27b3d077a86" },
    { name: "Menuiserie", value: "5e52cb8148f8b27b3d077a87" },
    { name: "Vitrification", value: "5e52cb8148f8b27b3d077a88" },
    { name: "Nettoyage", value: "5e52cb8148f8b27b3d077a89" },
    { name: "Faïence", value: "5f58fef3bfdad857fcfbba50" },
    { name: "Placo", value: "5f58fefdbfdad857fcfbba51" },
    { name: "Carrelage", value: "5f58ff06bfdad857fcfbba52" },
  ];

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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userProfileService.getCurrentUser();
    console.log("Current user:", this.currentUser);
    this.contractId = this.route.snapshot.params["orderId"];
    this.initializeForm();
    this.loadContractData();
    this.setupUserSearch();
    this.breadCrumbItems = [
      { label: "Accueil", path: "/" },
      { label: "Mise à jour d’une commande", active: true },
    ];

    // Récupérer les numéros internes depuis le service
    // this.getInternalNumbers();

    // Récupérer les abréviations depuis le service
    this.getAbbreviationList();

    // Setup for abbreviation search and typeahead functionality
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
            // Si la saisie de l'utilisateur est vide, retournez la liste complète
            return of(this.fullAbbreviationList);
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((filteredAbbreviations) => {
        this.filteredAbbreviationList = filteredAbbreviations;
      });

    // Calculer la différence entre les heures de prévision et d'exécution en temps réel
    this.orderUpdateForm.valueChanges.subscribe((val) => {
      // Utiliser `.value` pour obtenir la valeur actuelle des FormControl
      const totalPrevisionHours =
        Number(this.orderUpdateForm.get("prevision_data_day").value) * 8 +
        Number(this.orderUpdateForm.get("prevision_data_hour").value);
      const totalExecutionHours =
        Number(this.orderUpdateForm.get("execution_data_day").value) * 8 +
        Number(this.orderUpdateForm.get("execution_data_hour").value);
      const difference = totalExecutionHours - totalPrevisionHours;

      // Mise à jour du formulaire sans déclencher un nouvel événement valueChanges
      this.orderUpdateForm.patchValue(
        { difference: difference },
        { emitEvent: false }
      );
    });

    // calculer le bénéfice en temps réel (montant HT - montant contributeur externe - montant sous-traitant)
    this.orderUpdateForm.valueChanges.subscribe((val) => {
      const amountHt = Number(this.orderUpdateForm.get("amount_ht").value);
      const benefitHt = Number(this.orderUpdateForm.get("benefit_ht").value);
      const external_contributor_amount = Number(
        this.orderUpdateForm.get("external_contributor_amount").value
      );
      const subcontractor_amount = Number(
        this.orderUpdateForm.get("subcontractor_amount").value
      );
      const benefitHT =
        amountHt - external_contributor_amount - subcontractor_amount;
      this.orderUpdateForm.patchValue(
        { benefit: benefitHT },
        { emitEvent: false }
      );
    });

    // Patch de date_cde avec la date actuelle si elle est vide
    this.orderUpdateForm.get("date_cde").valueChanges.subscribe((val) => {
      if (!val) {
        this.orderUpdateForm.patchValue(
          { date_cde: new Date().toISOString().split("T")[0] },
          { emitEvent: false }
        );
      }
    });
  }

  private initializeForm() {
    this.orderUpdateForm = new FormGroup({
      // internal_number: new FormControl('', Validators.required),
      internalNumberNumericPart: new FormControl("", [
        Validators.required,
        Validators.pattern(/^\d{3}$/),
      ]),
      internalNumberAbbrPart: new FormControl("", Validators.required),
      customer: new FormControl("", Validators.required),
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
      subcontractor_amount: new FormControl("", [
        Validators.pattern(/^\d+\.?\d*$/),
      ]),
      benefit_ht: new FormControl("", [Validators.pattern(/^\d+\.?\d*$/)]),
      prevision_data_hour: new FormControl("", [Validators.pattern(/^\d+$/)]),
      prevision_data_day: new FormControl("", [Validators.pattern(/^\d+$/)]),
      execution_data_day: new FormControl("", [Validators.pattern(/^\d+$/)]),
      execution_data_hour: new FormControl("", [Validators.pattern(/^\d+$/)]),
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

          const patchValues = {
            ...contract,
            start_date_works: contract.start_date_works,
            end_date_works: contract.end_date_works,
            end_date_customer: contract.end_date_customer,
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

    forkJoin(userRequests).subscribe((userResponses) => {
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

      // Après que toutes les opérations asynchrones sont terminées, patche le formulaire
      // this.orderUpdateForm.patchValue(patchValues);
      if (this.orderUpdateForm && patchValues) {
        this.orderUpdateForm.patchValue(patchValues);
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
    if (this.orderUpdateForm.valid) {
      this.contractService
        .updateContract(this.contractId, this.orderUpdateForm.value)
        .subscribe({
          next: () => {
            console.log("Contract updated successfully");
          },
          error: (error) => {
            console.error("Error updating contract:", error);
          },
        })
        .add(() => {
          this.router.navigate(["/order-detail", this.contractId]);
        });
    }
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
}
