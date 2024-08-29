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
    dateCde: null,
    billingAmount: 0,
    isLastContract: false
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
  @ViewChild('simpleDeleteModal') simpleDeleteModal: any;
  @ViewChild('simpleDeleteConfirmationModal') simpleDeleteConfirmationModal: any;
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
  @ViewChild('calculationDetailsModal') calculationDetailsModal;

  private formStorageKey = 'orderFormData';
  private formHistoryKey = 'orderFormHistory';
  private maxHistorySize = 5;

  formHistory: any[] = [];

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

  // ngOnInit(): void {
  //   this.setupBreadCrumbItems();
  //   this.currentUser = this.userProfileService.getCurrentUser();
  //   console.log("Utilisateur connecté:", this.currentUser);
  //   this.initializeOrderForm();

  //   // this.loadFormDataFromStorage();

  //   this.subscribeToUserSelections();

  //   this.subscribeToFormChanges();
  //   this.setupUserSearchAndTypeahead();
  //   this.setupCustomerSearchAndTypeahead();
  //   this.retrieveDataFromServices();
  //   this.subscribeToAbbreviationInput();
  //   this.initializeDateCdeWithCurrentDate();

  //   this.subscribeToHourAndDayChanges();

  //   // this.orderForm.get("previsionDataHour").valueChanges.subscribe(() => {
  //   //   if (this.manualHoursOrDaysChange) {
  //   //       this.calculateDaysFromHours();
  //   //   }
  //   // });

  //   // this.orderForm.get("previsionDataDay").valueChanges.subscribe(() => {
  //   //     if (this.manualHoursOrDaysChange) {
  //   //         this.calculateHoursFromDays();
  //   //     }
  //   // });

  //   this.orderForm.valueChanges.subscribe((values) => {
  //       console.log("Modification du formulaire:", values);
  //       console.log(this.orderForm.status);
  //       console.log(this.orderForm.errors);
  //   });

  //   this.orderForm.get("invoiceNumber").valueChanges.subscribe((value) => {
  //       console.log("invoiceNumber change:", value);

  //   });

  //   Object.keys(this.orderForm.controls).forEach((key) => {
  //       const control = this.orderForm.get(key);
  //       control.statusChanges.subscribe(() => {
  //           this.updateFieldClasses(key);
  //           if (control.invalid && control.touched) {
  //               this.toastr.error(`Entrée invalide dans le champ: ${key}`);
  //           } else if (control.valid && control.touched) {
  //               this.toastr.success(`Entrée valide dans le champ: ${key}`);
  //           }
  //       });
  //       control.valueChanges.subscribe(() => {
  //           this.updateFieldClasses(key);
  //       });
  //   });

  //   this.loadFormHistoryFromStorage();
  // }

  // private initializeOrderForm(): void {
  //   this.orderForm = new FormGroup({
  //     internalNumberAbbrPart: new FormControl(
  //       this.contractData.internalNumberAbbrPart,
  //       [Validators.pattern(/^[BCDFGHJKLMNPQRSTVWXYZ]{1,5}$/)]
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
  //     isLastContract: new FormControl(this.contractData.isLastContract)
  //   });
  // }
  // private initializeOrderForm(): void {
  //   // Charger les données sauvegardées dans localStorage si disponibles
  //   const savedFormData = localStorage.getItem(this.formStorageKey);
  //   const initialFormData = savedFormData ? JSON.parse(savedFormData) : this.contractData;

  //   // Initialiser le formulaire avec les données récupérées
  //   this.orderForm = new FormGroup({
  //       internalNumberAbbrPart: new FormControl(
  //           initialFormData.internalNumberAbbrPart || this.contractData.internalNumberAbbrPart,
  //           [Validators.pattern(/^[BCDFGHJKLMNPQRSTVWXYZ]{1,5}$/)]
  //       ),
  //       internalNumberNumericPart: new FormControl(
  //           initialFormData.internalNumberNumericPart || this.contractData.internalNumberNumericPart,
  //           [Validators.pattern(/^\d{3}$/)]
  //       ),
  //       customer: new FormControl(
  //           initialFormData.customer || this.contractData.customer,
  //           Validators.required
  //       ),
  //       internalContributor: new FormControl(
  //           initialFormData.internalContributor || this.contractData.internalContributor
  //       ),
  //       contact: new FormControl(initialFormData.contact || this.contractData.contact),
  //       externalContributor: new FormControl(
  //           initialFormData.externalContributor || this.contractData.externalContributor
  //       ),
  //       subcontractor: new FormControl(initialFormData.subcontractor || this.contractData.subcontractor),
  //       address: new FormControl(initialFormData.address || this.contractData.address),
  //       appartmentNumber: new FormControl(initialFormData.appartmentNumber || this.contractData.appartmentNumber),
  //       ss4: new FormControl(initialFormData.ss4 !== undefined ? initialFormData.ss4 : this.contractData.ss4),
  //       quoteNumber: new FormControl(initialFormData.quoteNumber || this.contractData.quoteNumber),
  //       mailSended: new FormControl(initialFormData.mailSended !== undefined ? initialFormData.mailSended : this.contractData.mailSended),
  //       invoiceNumber: new FormControl(initialFormData.invoiceNumber || this.contractData.invoiceNumber),
  //       amountHt: new FormControl(initialFormData.amountHt !== null ? initialFormData.amountHt : this.contractData.amountHt, [
  //           Validators.pattern(/^\d+\.?\d*$/),
  //       ]),
  //       benefitHt: new FormControl(initialFormData.benefitHt !== null ? initialFormData.benefitHt : this.contractData.benefitHt, [
  //           Validators.pattern(/^\d+\.?\d*$/),
  //       ]),
  //       externalContributorAmount: new FormControl(
  //           initialFormData.externalContributorAmount !== null ? initialFormData.externalContributorAmount : this.contractData.externalContributorAmount,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       subcontractorAmount: new FormControl(
  //           initialFormData.subcontractorAmount !== null ? initialFormData.subcontractorAmount : this.contractData.subcontractorAmount,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       external_contributor_invoice_date: new FormControl(
  //           initialFormData.external_contributor_invoice_date || this.contractData.external_contributor_invoice_date
  //       ),
  //       previsionDataHour: new FormControl(
  //           initialFormData.previsionDataHour !== null ? initialFormData.previsionDataHour : this.contractData.previsionDataHour,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       previsionDataDay: new FormControl(
  //           initialFormData.previsionDataDay !== null ? initialFormData.previsionDataDay : this.contractData.previsionDataDay,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       executionDataDay: new FormControl(
  //           initialFormData.executionDataDay !== null ? initialFormData.executionDataDay : this.contractData.executionDataDay,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       executionDataHour: new FormControl(
  //           initialFormData.executionDataHour !== null ? initialFormData.executionDataHour : this.contractData.executionDataHour,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       difference: new FormControl(initialFormData.difference !== null ? initialFormData.difference : this.contractData.difference),
  //       benefit: new FormControl(initialFormData.benefit || this.contractData.benefit),
  //       status: new FormControl(initialFormData.status || this.contractData.status),
  //       occupied: new FormControl(initialFormData.occupied !== undefined ? initialFormData.occupied : this.contractData.occupied),
  //       startDateWorks: new FormControl(initialFormData.startDateWorks || this.contractData.startDateWorks),
  //       endDateWorks: new FormControl(initialFormData.endDateWorks || this.contractData.endDateWorks),
  //       endDateCustomer: new FormControl(initialFormData.endDateCustomer || this.contractData.endDateCustomer),
  //       dateCde: new FormControl(initialFormData.dateCde || this.contractData.dateCde),
  //       billingAmount: new FormControl(initialFormData.billingAmount !== null ? initialFormData.billingAmount : this.contractData.billingAmount, [
  //           Validators.pattern(/^\d+\.?\d*$/),
  //       ]),
  //       isLastContract: new FormControl(initialFormData.isLastContract !== undefined ? initialFormData.isLastContract : this.contractData.isLastContract)
  //   });
  // }

  // private initializeOrderForm(): void {
  //   // Charger les données sauvegardées dans localStorage si disponibles
  //   const savedFormData = localStorage.getItem(this.formStorageKey);
  //   const initialFormData = savedFormData ? JSON.parse(savedFormData) : this.contractData;

  //   // Initialiser le formulaire avec les données récupérées
  //   this.orderForm = new FormGroup({
  //       internalNumberAbbrPart: new FormControl(
  //           initialFormData.internalNumberAbbrPart || this.contractData.internalNumberAbbrPart,
  //           [Validators.pattern(/^[BCDFGHJKLMNPQRSTVWXYZ]{1,5}$/)]
  //       ),
  //       internalNumberNumericPart: new FormControl(
  //           initialFormData.internalNumberNumericPart || this.contractData.internalNumberNumericPart,
  //           [Validators.pattern(/^\d{3}$/)]
  //       ),
  //       customer: new FormControl(
  //           initialFormData.customer || this.contractData.customer,
  //           Validators.required
  //       ),
  //       internalContributor: new FormControl(
  //           initialFormData.internalContributor || this.contractData.internalContributor
  //       ),
  //       contact: new FormControl(initialFormData.contact || this.contractData.contact),
  //       externalContributor: new FormControl(
  //           initialFormData.externalContributor || this.contractData.externalContributor
  //       ),
  //       subcontractor: new FormControl(initialFormData.subcontractor || this.contractData.subcontractor),
  //       address: new FormControl(initialFormData.address || this.contractData.address),
  //       appartmentNumber: new FormControl(initialFormData.appartmentNumber || this.contractData.appartmentNumber),
  //       ss4: new FormControl(initialFormData.ss4 !== undefined ? initialFormData.ss4 : this.contractData.ss4),
  //       quoteNumber: new FormControl(initialFormData.quoteNumber || this.contractData.quoteNumber),
  //       mailSended: new FormControl(initialFormData.mailSended !== undefined ? initialFormData.mailSended : this.contractData.mailSended),
  //       invoiceNumber: new FormControl(initialFormData.invoiceNumber || this.contractData.invoiceNumber),
  //       amountHt: new FormControl(initialFormData.amountHt !== null ? initialFormData.amountHt : this.contractData.amountHt, [
  //           Validators.pattern(/^\d+\.?\d*$/),
  //       ]),
  //       benefitHt: new FormControl(initialFormData.benefitHt !== null ? initialFormData.benefitHt : this.contractData.benefitHt, [
  //           Validators.pattern(/^\d+\.?\d*$/),
  //       ]),
  //       externalContributorAmount: new FormControl(
  //           initialFormData.externalContributorAmount !== null ? initialFormData.externalContributorAmount : this.contractData.externalContributorAmount,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       subcontractorAmount: new FormControl(
  //           initialFormData.subcontractorAmount !== null ? initialFormData.subcontractorAmount : this.contractData.subcontractorAmount,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       external_contributor_invoice_date: new FormControl(
  //           initialFormData.external_contributor_invoice_date || this.contractData.external_contributor_invoice_date
  //       ),
  //       previsionDataHour: new FormControl(
  //           initialFormData.previsionDataHour !== null ? initialFormData.previsionDataHour : this.contractData.previsionDataHour,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       previsionDataDay: new FormControl(
  //           initialFormData.previsionDataDay !== null ? initialFormData.previsionDataDay : this.contractData.previsionDataDay,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       executionDataDay: new FormControl(
  //           initialFormData.executionDataDay !== null ? initialFormData.executionDataDay : this.contractData.executionDataDay,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       executionDataHour: new FormControl(
  //           initialFormData.executionDataHour !== null ? initialFormData.executionDataHour : this.contractData.executionDataHour,
  //           [Validators.pattern(/^\d+\.?\d*$/)]
  //       ),
  //       difference: new FormControl(initialFormData.difference !== null ? initialFormData.difference : this.contractData.difference),
  //       benefit: new FormControl(initialFormData.benefit || this.contractData.benefit),
  //       status: new FormControl(initialFormData.status || this.contractData.status),
  //       occupied: new FormControl(initialFormData.occupied !== undefined ? initialFormData.occupied : this.contractData.occupied),
  //       startDateWorks: new FormControl(initialFormData.startDateWorks || this.contractData.startDateWorks),
  //       endDateWorks: new FormControl(initialFormData.endDateWorks || this.contractData.endDateWorks),
  //       endDateCustomer: new FormControl(initialFormData.endDateCustomer || this.contractData.endDateCustomer),
  //       dateCde: new FormControl(initialFormData.dateCde || this.contractData.dateCde),
  //       billingAmount: new FormControl(initialFormData.billingAmount !== null ? initialFormData.billingAmount : this.contractData.billingAmount, [
  //           Validators.pattern(/^\d+\.?\d*$/),
  //       ]),
  //       isLastContract: new FormControl(initialFormData.isLastContract !== undefined ? initialFormData.isLastContract : this.contractData.isLastContract)
  //   });

  //   // Initialisation des variables pour le suivi des modifications manuelles
  //   this.manualHoursOrDaysChange = false;

  //   // Surveiller les changements du montant de la prestation
  //   this.orderForm.get("benefitHt").valueChanges.subscribe(() => {
  //       if (!this.manualHoursOrDaysChange) {
  //           this.calculateHoursAndDaysFromBenefit();
  //       }
  //   });

  //   // Surveiller les changements manuels des heures et jours
  //   this.orderForm.get("previsionDataHour").valueChanges.subscribe(() => {
  //       this.manualHoursOrDaysChange = true;
  //       this.calculateDifferencesAndAdjustments();
  //   });

  //   this.orderForm.get("previsionDataDay").valueChanges.subscribe(() => {
  //       this.manualHoursOrDaysChange = true;
  //       this.calculateDifferencesAndAdjustments();
  //   });

  //   // Effectuer un calcul initial si les valeurs existent déjà
  //   if (initialFormData.benefitHt) {
  //       this.calculateHoursAndDaysFromBenefit();
  //   }
  // }

//   private initializeOrderForm(): void {
//     // Charger les données sauvegardées dans localStorage si disponibles
//     const savedFormData = localStorage.getItem(this.formStorageKey);
//     const initialFormData = savedFormData ? JSON.parse(savedFormData) : this.contractData;

//     // Initialiser le formulaire avec les données récupérées
//     this.orderForm = new FormGroup({
//         internalNumberAbbrPart: new FormControl(
//             initialFormData.internalNumberAbbrPart || this.contractData.internalNumberAbbrPart,
//             [Validators.pattern(/^[BCDFGHJKLMNPQRSTVWXYZ]{1,5}$/)]
//         ),
//         internalNumberNumericPart: new FormControl(
//             initialFormData.internalNumberNumericPart || this.contractData.internalNumberNumericPart,
//             [Validators.pattern(/^\d{3}$/)]
//         ),
//         customer: new FormControl(
//             initialFormData.customer || this.contractData.customer,
//             Validators.required
//         ),
//         internalContributor: new FormControl(
//             initialFormData.internalContributor || this.contractData.internalContributor
//         ),
//         contact: new FormControl(initialFormData.contact || this.contractData.contact),
//         externalContributor: new FormControl(
//             initialFormData.externalContributor || this.contractData.externalContributor
//         ),
//         subcontractor: new FormControl(initialFormData.subcontractor || this.contractData.subcontractor),
//         address: new FormControl(initialFormData.address || this.contractData.address),
//         appartmentNumber: new FormControl(initialFormData.appartmentNumber || this.contractData.appartmentNumber),
//         ss4: new FormControl(initialFormData.ss4 !== undefined ? initialFormData.ss4 : this.contractData.ss4),
//         quoteNumber: new FormControl(initialFormData.quoteNumber || this.contractData.quoteNumber),
//         mailSended: new FormControl(initialFormData.mailSended !== undefined ? initialFormData.mailSended : this.contractData.mailSended),
//         invoiceNumber: new FormControl(initialFormData.invoiceNumber || this.contractData.invoiceNumber),
//         amountHt: new FormControl(initialFormData.amountHt !== null ? initialFormData.amountHt : this.contractData.amountHt, [
//             Validators.pattern(/^\d+\.?\d*$/),
//         ]),
//         benefitHt: new FormControl(initialFormData.benefitHt !== null ? initialFormData.benefitHt : this.contractData.benefitHt, [
//             Validators.pattern(/^\d+\.?\d*$/),
//         ]),
//         externalContributorAmount: new FormControl(
//             initialFormData.externalContributorAmount !== null ? initialFormData.externalContributorAmount : this.contractData.externalContributorAmount,
//             [Validators.pattern(/^\d+\.?\d*$/)]
//         ),
//         subcontractorAmount: new FormControl(
//             initialFormData.subcontractorAmount !== null ? initialFormData.subcontractorAmount : this.contractData.subcontractorAmount,
//             [Validators.pattern(/^\d+\.?\d*$/)]
//         ),
//         external_contributor_invoice_date: new FormControl(
//             initialFormData.external_contributor_invoice_date || this.contractData.external_contributor_invoice_date
//         ),
//         previsionDataHour: new FormControl(
//             initialFormData.previsionDataHour !== null ? initialFormData.previsionDataHour : this.contractData.previsionDataHour,
//             [Validators.pattern(/^\d+\.?\d*$/)]
//         ),
//         previsionDataDay: new FormControl(
//             initialFormData.previsionDataDay !== null ? initialFormData.previsionDataDay : this.contractData.previsionDataDay,
//             [Validators.pattern(/^\d+\.?\d*$/)]
//         ),
//         executionDataDay: new FormControl(
//             initialFormData.executionDataDay !== null ? initialFormData.executionDataDay : this.contractData.executionDataDay,
//             [Validators.pattern(/^\d+\.?\d*$/)]
//         ),
//         executionDataHour: new FormControl(
//             initialFormData.executionDataHour !== null ? initialFormData.executionDataHour : this.contractData.executionDataHour,
//             [Validators.pattern(/^\d+\.?\d*$/)]
//         ),
//         difference: new FormControl(initialFormData.difference !== null ? initialFormData.difference : this.contractData.difference),
//         benefit: new FormControl(initialFormData.benefit || this.contractData.benefit),
//         status: new FormControl(initialFormData.status || this.contractData.status),
//         occupied: new FormControl(initialFormData.occupied !== undefined ? initialFormData.occupied : this.contractData.occupied),
//         startDateWorks: new FormControl(initialFormData.startDateWorks || this.contractData.startDateWorks),
//         endDateWorks: new FormControl(initialFormData.endDateWorks || this.contractData.endDateWorks),
//         endDateCustomer: new FormControl(initialFormData.endDateCustomer || this.contractData.endDateCustomer),
//         dateCde: new FormControl(initialFormData.dateCde || this.contractData.dateCde),
//         billingAmount: new FormControl(initialFormData.billingAmount !== null ? initialFormData.billingAmount : this.contractData.billingAmount, [
//             Validators.pattern(/^\d+\.?\d*$/),
//         ]),
//         isLastContract: new FormControl(initialFormData.isLastContract !== undefined ? initialFormData.isLastContract : this.contractData.isLastContract)
//     });

//     // Surveiller les changements du montant de la prestation
//     this.orderForm.get("benefitHt").valueChanges.subscribe(() => {
//         if (!this.manualHoursOrDaysChange) {
//             this.calculateHoursAndDaysFromBenefit();
//         }
//     });

//     // Surveiller les changements manuels des heures et jours
//     this.orderForm.get("previsionDataHour").valueChanges.subscribe(() => {
//         this.manualHoursOrDaysChange = true;
//         this.calculateDifferencesAndAdjustments();
//     });

//     this.orderForm.get("previsionDataDay").valueChanges.subscribe(() => {
//         this.manualHoursOrDaysChange = true;
//         this.calculateDifferencesAndAdjustments();
//     });

//     // Effectuer un calcul initial si les valeurs existent déjà
//     if (initialFormData.benefitHt) {
//         this.calculateHoursAndDaysFromBenefit();
//     }
// }

// private initializeOrderForm(): void {
//   // Charger les données sauvegardées dans localStorage si disponibles
//   const savedFormData = localStorage.getItem(this.formStorageKey);
//   const initialFormData = savedFormData ? JSON.parse(savedFormData) : this.contractData;

//   // Initialiser le formulaire avec les données récupérées
//   this.orderForm = new FormGroup({
//       internalNumberAbbrPart: new FormControl(
//           initialFormData.internalNumberAbbrPart || this.contractData.internalNumberAbbrPart,
//           [Validators.pattern(/^[BCDFGHJKLMNPQRSTVWXYZ]{1,5}$/)]
//       ),
//       internalNumberNumericPart: new FormControl(
//           initialFormData.internalNumberNumericPart || this.contractData.internalNumberNumericPart,
//           [Validators.pattern(/^\d{3}$/)]
//       ),
//       customer: new FormControl(
//           initialFormData.customer || this.contractData.customer,
//           Validators.required
//       ),
//       internalContributor: new FormControl(
//           initialFormData.internalContributor || this.contractData.internalContributor
//       ),
//       contact: new FormControl(initialFormData.contact || this.contractData.contact),
//       externalContributor: new FormControl(
//           initialFormData.externalContributor || this.contractData.externalContributor
//       ),
//       subcontractor: new FormControl(initialFormData.subcontractor || this.contractData.subcontractor),
//       address: new FormControl(initialFormData.address || this.contractData.address),
//       appartmentNumber: new FormControl(initialFormData.appartmentNumber || this.contractData.appartmentNumber),
//       ss4: new FormControl(initialFormData.ss4 !== undefined ? initialFormData.ss4 : this.contractData.ss4),
//       quoteNumber: new FormControl(initialFormData.quoteNumber || this.contractData.quoteNumber),
//       mailSended: new FormControl(initialFormData.mailSended !== undefined ? initialFormData.mailSended : this.contractData.mailSended),
//       invoiceNumber: new FormControl(initialFormData.invoiceNumber || this.contractData.invoiceNumber),
//       amountHt: new FormControl(initialFormData.amountHt !== null ? initialFormData.amountHt : this.contractData.amountHt, [
//           Validators.pattern(/^\d+\.?\d*$/),
//       ]),
//       benefitHt: new FormControl(initialFormData.benefitHt !== null ? initialFormData.benefitHt : this.contractData.benefitHt, [
//           Validators.pattern(/^\d+\.?\d*$/),
//       ]),
//       externalContributorAmount: new FormControl(
//           initialFormData.externalContributorAmount !== null ? initialFormData.externalContributorAmount : this.contractData.externalContributorAmount,
//           [Validators.pattern(/^\d+\.?\d*$/)]
//       ),
//       subcontractorAmount: new FormControl(
//           initialFormData.subcontractorAmount !== null ? initialFormData.subcontractorAmount : this.contractData.subcontractorAmount,
//           [Validators.pattern(/^\d+\.?\d*$/)]
//       ),
//       external_contributor_invoice_date: new FormControl(
//           initialFormData.external_contributor_invoice_date || this.contractData.external_contributor_invoice_date
//       ),
//       previsionDataHour: new FormControl(
//           initialFormData.previsionDataHour !== null ? initialFormData.previsionDataHour : this.contractData.previsionDataHour,
//           [Validators.pattern(/^\d+\.?\d*$/)]
//       ),
//       previsionDataDay: new FormControl(
//           initialFormData.previsionDataDay !== null ? initialFormData.previsionDataDay : this.contractData.previsionDataDay,
//           [Validators.pattern(/^\d+\.?\d*$/)]
//       ),
//       executionDataDay: new FormControl(
//           initialFormData.executionDataDay !== null ? initialFormData.executionDataDay : this.contractData.executionDataDay,
//           [Validators.pattern(/^\d+\.?\d*$/)]
//       ),
//       executionDataHour: new FormControl(
//           initialFormData.executionDataHour !== null ? initialFormData.executionDataHour : this.contractData.executionDataHour,
//           [Validators.pattern(/^\d+\.?\d*$/)]
//       ),
//       difference: new FormControl(initialFormData.difference !== null ? initialFormData.difference : this.contractData.difference),
//       benefit: new FormControl(initialFormData.benefit || this.contractData.benefit),
//       status: new FormControl(initialFormData.status || this.contractData.status),
//       occupied: new FormControl(initialFormData.occupied !== undefined ? initialFormData.occupied : this.contractData.occupied),
//       startDateWorks: new FormControl(initialFormData.startDateWorks || this.contractData.startDateWorks),
//       endDateWorks: new FormControl(initialFormData.endDateWorks || this.contractData.endDateWorks),
//       endDateCustomer: new FormControl(initialFormData.endDateCustomer || this.contractData.endDateCustomer),
//       dateCde: new FormControl(initialFormData.dateCde || this.contractData.dateCde),
//       billingAmount: new FormControl(initialFormData.billingAmount !== null ? initialFormData.billingAmount : this.contractData.billingAmount, [
//           Validators.pattern(/^\d+\.?\d*$/),
//       ]),
//       isLastContract: new FormControl(initialFormData.isLastContract !== undefined ? initialFormData.isLastContract : this.contractData.isLastContract)
//   });

//   // Abonnement au changement de montant HT pour calculer automatiquement jours et heures
//   this.orderForm.get("benefitHt").valueChanges.subscribe(() => {
//       if (!this.manualHoursOrDaysChange) {
//           this.calculateHoursAndDaysFromBenefit();
//       }
//   });

//   // Abonnement aux changements manuels de jours et heures
//   this.orderForm.get("previsionDataHour").valueChanges.subscribe(() => {
//       if (this.manualHoursOrDaysChange) {
//           this.calculateDaysFromHours();
//       }
//   });

//   this.orderForm.get("previsionDataDay").valueChanges.subscribe(() => {
//       if (this.manualHoursOrDaysChange) {
//           this.calculateHoursFromDays();
//       }
//   });

//   // Calcul initial si un montant de prestation HT est déjà saisi
//   if (this.orderForm.get("benefitHt").value) {
//       this.calculateHoursAndDaysFromBenefit();
//   }
// }

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
      console.log("Modification du formulaire:", values);
      console.log(this.orderForm.status);
      console.log(this.orderForm.errors);
  });
}

ngOnDestroy(): void {
  this.unsubscribe$.next();
  this.unsubscribe$.complete();

  this.unsubscribeFromBenefitAmountChanges(); // Ajout de cette ligne

  this.saveFormDataToStorage();  
  this.saveFormHistoryToStorage();  

  const formData = this.orderForm.getRawValue();
  this.saveFormDataToHistory(formData); 
}


private initializeOrderForm(): void {
  const savedFormData = localStorage.getItem(this.formStorageKey);
  const initialFormData = savedFormData ? JSON.parse(savedFormData) : this.contractData;

  this.orderForm = new FormGroup({
      internalNumberAbbrPart: new FormControl(
          initialFormData.internalNumberAbbrPart || this.contractData.internalNumberAbbrPart,
          [Validators.pattern(/^[BCDFGHJKLMNPQRSTVWXYZ]{1,5}$/)]
      ),
      internalNumberNumericPart: new FormControl(
          initialFormData.internalNumberNumericPart || this.contractData.internalNumberNumericPart,
          [Validators.pattern(/^\d{3}$/)]
      ),
      customer: new FormControl(
          initialFormData.customer || this.contractData.customer,
          Validators.required
      ),
      internalContributor: new FormControl(
          initialFormData.internalContributor || this.contractData.internalContributor
      ),
      contact: new FormControl(initialFormData.contact || this.contractData.contact),
      externalContributor: new FormControl(
          initialFormData.externalContributor || this.contractData.externalContributor
      ),
      subcontractor: new FormControl(initialFormData.subcontractor || this.contractData.subcontractor),
      address: new FormControl(initialFormData.address || this.contractData.address),
      appartmentNumber: new FormControl(initialFormData.appartmentNumber || this.contractData.appartmentNumber),
      ss4: new FormControl(initialFormData.ss4 !== undefined ? initialFormData.ss4 : this.contractData.ss4),
      quoteNumber: new FormControl(initialFormData.quoteNumber || this.contractData.quoteNumber),
      mailSended: new FormControl(initialFormData.mailSended !== undefined ? initialFormData.mailSended : this.contractData.mailSended),
      invoiceNumber: new FormControl(initialFormData.invoiceNumber || this.contractData.invoiceNumber),
      amountHt: new FormControl(initialFormData.amountHt !== null ? initialFormData.amountHt : this.contractData.amountHt, [
          Validators.pattern(/^\d+\.?\d*$/),
      ]),
      benefitHt: new FormControl(initialFormData.benefitHt !== null ? initialFormData.benefitHt : this.contractData.benefitHt, [
          Validators.pattern(/^\d+\.?\d*$/),
      ]),
      externalContributorAmount: new FormControl(
          initialFormData.externalContributorAmount !== null ? initialFormData.externalContributorAmount : this.contractData.externalContributorAmount,
          [Validators.pattern(/^\d+\.?\d*$/)]
      ),
      subcontractorAmount: new FormControl(
          initialFormData.subcontractorAmount !== null ? initialFormData.subcontractorAmount : this.contractData.subcontractorAmount,
          [Validators.pattern(/^\d+\.?\d*$/)]
      ),
      external_contributor_invoice_date: new FormControl(
          initialFormData.external_contributor_invoice_date || this.contractData.external_contributor_invoice_date
      ),
      previsionDataHour: new FormControl(
          initialFormData.previsionDataHour !== null ? initialFormData.previsionDataHour : this.contractData.previsionDataHour,
          [Validators.pattern(/^\d+\.?\d*$/)]
      ),
      previsionDataDay: new FormControl(
          initialFormData.previsionDataDay !== null ? initialFormData.previsionDataDay : this.contractData.previsionDataDay,
          [Validators.pattern(/^\d+\.?\d*$/)]
      ),
      executionDataDay: new FormControl(
          initialFormData.executionDataDay !== null ? initialFormData.executionDataDay : this.contractData.executionDataDay,
          [Validators.pattern(/^\d+\.?\d*$/)]
      ),
      executionDataHour: new FormControl(
          initialFormData.executionDataHour !== null ? initialFormData.executionDataHour : this.contractData.executionDataHour,
          [Validators.pattern(/^\d+\.?\d*$/)]
      ),
      difference: new FormControl(initialFormData.difference !== null ? initialFormData.difference : this.contractData.difference),
      benefit: new FormControl(initialFormData.benefit || this.contractData.benefit),
      status: new FormControl(initialFormData.status || this.contractData.status),
      occupied: new FormControl(initialFormData.occupied !== undefined ? initialFormData.occupied : this.contractData.occupied),
      startDateWorks: new FormControl(initialFormData.startDateWorks || this.contractData.startDateWorks),
      endDateWorks: new FormControl(initialFormData.endDateWorks || this.contractData.endDateWorks),
      endDateCustomer: new FormControl(initialFormData.endDateCustomer || this.contractData.endDateCustomer),
      dateCde: new FormControl(initialFormData.dateCde || this.contractData.dateCde),
      billingAmount: new FormControl(initialFormData.billingAmount !== null ? initialFormData.billingAmount : this.contractData.billingAmount, [
          Validators.pattern(/^\d+\.?\d*$/),
      ]),
      isLastContract: new FormControl(initialFormData.isLastContract !== undefined ? initialFormData.isLastContract : this.contractData.isLastContract)
  });

  // this.orderForm.get("benefitHt").valueChanges.subscribe(() => { // Surveiller les changements du montant de la prestation
  //     if (!this.manualHoursOrDaysChange) {
  //         this.calculateHoursAndDaysFromBenefit();
  //     }
  // });

  // this.orderForm.get("previsionDataHour").valueChanges.subscribe(() => {
  //     if (this.manualHoursOrDaysChange) {
  //         this.calculateDaysFromHours();
  //     }
  // });

  // this.orderForm.get("previsionDataDay").valueChanges.subscribe(() => {
  //     if (this.manualHoursOrDaysChange) {
  //         this.calculateHoursFromDays();
  //     }
  // });

  if (this.orderForm.get("benefitHt").value) {
      this.calculateHoursAndDaysFromBenefit();
  }

  // this.manualHoursOrDaysChange = true;
}



  private subscribeToFormChanges(): void {
    this.orderForm.valueChanges.subscribe((val) => {
      this.contractData = { ...this.contractData, ...val };
      // this.calculateDifferencesAndAdjustments();
      this.saveFormDataToStorage();
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
      // this.calculateDifferencesAndAdjustments();
    });
    this.orderForm.get("previsionDataDay").valueChanges.subscribe(() => {
      // this.calculateDifferencesAndAdjustments();
    });

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
    console.log('subscribeToUserSelections');
    const userFields = [
        'customer',           // Client
        'contact',            // Contact
        'internalContributor',// Intervenant Sogapeint
        'externalContributor',// Co-traitant
        'subcontractor'       // Sous-traitant
    ];

    userFields.forEach(field => {
        this.orderForm.get(field).valueChanges.subscribe(selectedUserId => {
            this.onUserSelected(field, selectedUserId);
        });
    });
  }

  // onUserSelected(field: string, selectedUserId: string): void {
  //   console.log(`Utilisateur sélectionné pour ${field}:`, selectedUserId);
  //   // Appeler le service pour obtenir les détails de l'utilisateur sélectionné
  //   this.userProfileService.getOne(selectedUserId).subscribe(
  //       (selectedUser) => {
  //           if (selectedUser) {
  //             console.log(`Utilisateur avec ID ${selectedUserId} trouvé:`, selectedUser);
  //               // Stocker les informations complètes de l'utilisateur pour une utilisation future
  //               this.contractData[`${field}Details`] = {
  //                   firstName: selectedUser.firstName,
  //                   lastName: selectedUser.lastName,
  //                   email: selectedUser.email,
  //                   phone: selectedUser.phone,
  //                   company: selectedUser.company,
  //                   role: selectedUser.role
  //               };

  //               console.log(`Informations complètes pour ${field}:`, this.contractData[`${field}Details`]);
  //           } else {
  //               console.error(`Utilisateur avec ID ${selectedUserId} non trouvé.`);
  //           }
  //       },
  //       (error) => {
  //           console.error(`Erreur lors de la récupération de l'utilisateur avec ID ${selectedUserId}:`, error);
  //       }
  //   );
  // }

  onUserSelected(field: string, selectedUserId: string): void {
    console.log(`Utilisateur sélectionné pour ${field}:`, selectedUserId);
    
    this.userProfileService.getOne(selectedUserId).subscribe(
        (selectedUser) => {
            if (selectedUser) {
                console.log(`Utilisateur avec ID ${selectedUserId} trouvé:`, selectedUser);

                // Vérifiez si les champs firstName et lastName sont présents, sinon utilisez les versions en minuscule
                const firstName = selectedUser.firstName || selectedUser['firstname'] || '';
                const lastName = selectedUser.lastName || selectedUser['lastname'] || '';

                this.contractData[`${field}Details`] = {
                    firstName: firstName,
                    lastName: lastName,
                    email: selectedUser.email,
                    phone: selectedUser.phone,
                    company: selectedUser.company,
                    role: selectedUser.role
                };

                console.log(`Informations complètes pour ${field}:`, this.contractData[`${field}Details`]);
            } else {
                console.error(`Utilisateur avec ID ${selectedUserId} non trouvé.`);
            }
        },
        (error) => {
            console.error(`Erreur lors de la récupération de l'utilisateur avec ID ${selectedUserId}:`, error);
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
    this.userInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) =>
        term
          ? this.userProfileService.searchUsers(term.toLowerCase())
          : of([])
      ),
      takeUntil(this.unsubscribe$)
    ).subscribe((users) => {

      this.customers = users.filter((user) => user.role === 'customer');
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

//   ngOnDestroy() {
//     this.unsubscribe$.next();
//     this.unsubscribe$.complete();

//     this.saveFormDataToStorage();  // Sauvegarder le formulaire actuel
//     this.saveFormHistoryToStorage();  // Sauvegarder l'historique du formulaire

//     const formData = this.orderForm.getRawValue();
//     this.saveFormDataToHistory(formData); // Sauvegarder l'état du formulaire dans l'historique uniquement ici
// }

  onUserInputFocus(): void {
    this.userInput$.next("");
  }



// onSubmit(): void {
//   if (this.isSubmitting) {
//       return;
//   }

//   this.isSubmitting = true;

//   if (this.orderForm.valid) {
//       console.log("Subcontractor ID from form:", this.orderForm.value.subcontractor);

//       this.contractData = { ...this.contractData, ...this.orderForm.value };
//       console.log("Updated contractData with form values:", this.contractData);
//       this.prepareDataForSubmission();

//       this.submitContractData();
//   } else {
//       this.orderForm.markAllAsTouched();
//       this.displayFormErrors();
//       this.toastr.error('Veuillez corriger les erreurs dans le formulaire.');
//       this.isSubmitting = false;
//   }
// }

// onSubmit(): void {
//   console.log("Soumission du formulaire");
//   if (this.isSubmitting) {
//       return;
//   }

//   // Vérification pour empêcher la soumission si le calcul automatique est désactivé
//   if (!this.autoCalculateEnabled) {
//       this.toastr.warning('Le calcul automatique est désactivé. Veuillez vérifier et réactiver si nécessaire.');
//       return;
//   }

//   this.isSubmitting = true;

//   if (this.orderForm.valid) {
//       console.log("Subcontractor ID from form:", this.orderForm.value.subcontractor);

//       this.contractData = { ...this.contractData, ...this.orderForm.value };
//       console.log("Updated contractData with form values:", this.contractData);
//       this.prepareDataForSubmission();

//       this.submitContractData();
//   } else {
//       this.orderForm.markAllAsTouched();
//       this.displayFormErrors();
//       this.toastr.error('Veuillez corriger les erreurs dans le formulaire.');
//       this.isSubmitting = false;
//   }
// }

// onSubmit(): void {
//   console.log("Tentative de soumission du formulaire");
//   if (this.isSubmitting) {
//       return;
//   }

//   if (!this.autoCalculateEnabled) {
//       this.toastr.warning('Le calcul automatique est désactivé. Veuillez vérifier et réactiver si nécessaire.');
//       return;
//   }

//   // Ouvrir le modal pour demander la confirmation avant de soumettre
//   this.modalService.open(this.confirmationModal).result.then(
//       (result) => {
//           if (result === true || result === false) {
//               this.confirmCreation(result);
//           }
//       },
//       (dismissReason) => {
//           console.log("Modal fermé sans action");
//       }
//   );
// }

onSubmit(): void {
  console.log("Tentative de soumission du formulaire");
  if (this.isSubmitting) {
      return;
  }

  if (!this.autoCalculateEnabled) {
      this.toastr.warning('Le calcul automatique est désactivé. Veuillez vérifier et réactiver si nécessaire.');
      return;
  }

  // Ouvrir le modal pour demander la confirmation avant de soumettre
  this.modalService.open(this.confirmationModal).result.then(
      (result) => {
          if (result === true) {
              this.prepareNewOrder();  // Pré-remplir un nouveau contrat
          } else if (result === false) {
              this.contractData.isLastContract = true;
              this.submitContractData(); // Soumettre le contrat actuel
              this.router.navigate(['/manageOrders']); // Redirection
          }
      },
      (dismissReason) => {
          console.log("Modal fermé sans action");
      }
  );
}

  private displayFormErrors(): void {
    Object.keys(this.orderForm.controls).forEach((key) => {
        const control = this.orderForm.get(key);
        const element = document.getElementById(key);

        if (element) { 
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

  // private submitContractData(): void {
  //   console.log("Soumission des données du contrat:", this.contractData);
  //   this.contractService.addContract(this.contractData).subscribe({
  //     next: (response) => {
  //       console.log("Contrat créé avec succès", response);
  //       this.toastr.success('Le contrat a été créé avec succès.');

  //       if (this.files.length > 0) {
  //         console.log("il y a des fichiers à uploader");
  //         this.onFileUpload(this.files, response.contractId);
  //       }

  //       this.openConfirmationModal();
  //       this.isSubmitting = false;
  //     },
  //     error: (error) => {
  //       console.error("Erreur lors de la création du contrat", error);
  //       this.toastr.error('Une erreur est survenue lors de la création du contrat.');
  //     },
  //   });
  // }

  submitContractData(): void {
    console.log("Soumission des données du contrat:", this.contractData);
  
    // Envoi de la commande au backend
    this.contractService.addContract(this.contractData).subscribe({
        next: (response) => {
            console.log("Contrat créé avec succès", response);
            this.toastr.success('Le contrat a été créé avec succès.');
  
            // Si des fichiers doivent être uploadés
            if (this.files.length > 0) {
                this.onFileUpload(this.files, response.contractId);
            }
        },
        error: (error) => {
            console.error("Erreur lors de la création du contrat", error);
            this.toastr.error('Une erreur est survenue lors de la création du contrat.');
        },
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

//   confirmCreation(reuseSameNumber: boolean) {
//     this.modalService.dismissAll();

//     if (reuseSameNumber) {
//         this.prepareNewOrder();
//     } else {
//         this.contractData.isLastContract = true; 
//         this.clearFormData();
//         this.prepareDataForSubmission();
//         this.submitContractData(); 
//         this.router.navigate(["/manageOrders"]);
//     }
// }

  // confirmCreation(reuseSameNumber: boolean) {
  //   console.log("Confirmation reçue, soumission de la commande");
  //   this.isSubmitting = true;

  //   this.contractData = { ...this.contractData, ...this.orderForm.value };
    
  //   if (reuseSameNumber) {
  //       this.prepareNewOrder();
  //   } else {
  //       this.contractData.isLastContract = true; 
  //       this.clearFormData();
  //   }
    
  //   this.prepareDataForSubmission();
  //   this.submitContractData();
  //   this.router.navigate(["/manageOrders"]); // Redirection vers une autre page après soumission
  // }

  confirmCreation(reuseSameNumber: boolean) {
    this.modalService.dismissAll();
  
    if (reuseSameNumber) {
        this.prepareNewOrder(); // Préparer un nouveau contrat sans soumettre
    } else {
        this.contractData.isLastContract = true;
        this.submitContractData(); // Soumettre et rediriger
        this.router.navigate(['/manageOrders']);
    }
  }

  // private prepareNewOrder() {
  //   this.orderForm.patchValue({
  //     internalContributor: null,
  //     externalContributor: null,
  //     subcontractor: null,
  //     previsionDataHour: 0,
  //     previsionDataDay: 0,
  //     executionDataDay: 0,
  //     executionDataHour: 0,
  //     difference: 0,
  //     benefit: null,
  //   });

  //   console.log(
  //     "Le formulaire a été préparé pour une nouvelle saisie avec certains champs réinitialisés."
  //   );
  //   this.toastr.success('Le formulaire est prêt pour une nouvelle saisie.');
  // }

  prepareNewOrder() {
    console.log("Préparation d'une nouvelle commande avec les mêmes informations de base");
  
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
  
    // Le contrat est prêt pour une nouvelle saisie
    this.toastr.success('Le formulaire est prêt pour une nouvelle saisie avec les informations de base conservées.');
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
  if (!name) {
      console.error("Benefit name is required.");
      return;
  }

  const existingBenefit = this.benefits.map((benefit) => benefit.name);
  const existingBenefitName = this.isProbableTypo(name, existingBenefit);
  const levenshteinScore = existingBenefitName ? this.levenshteinDistance(name, existingBenefitName) : null;

  if (existingBenefitName) {
      this.warningMessage = `Il semble qu'une prestation similaire existe déjà: ${existingBenefitName}`;
      this.warningScore = levenshteinScore;
      this.modalService.open(this.warningModal);

      this.renderer.addClass(document.getElementById("benefit"), "pulsing-red");

      setTimeout(() => {
          this.renderer.removeClass(document.getElementById("benefit"), "pulsing-red");
      }, 7000);
  } else {
      console.log("Ajout de la prestation:", name);
      const newBenefit = { name: name };
      this.benefitService.addBenefit(newBenefit).subscribe({
          next: (response) => {
              console.log("Prestation ajoutée avec succès:", response.benefit._id);
              this.loadBenefits();
              const benefitToSet = { name: response.benefit.name, value: response.benefit._id };
              console.log("Prestation à définir:", benefitToSet);
              setTimeout(() => {
                  this.orderForm.get("benefit").setValue(benefitToSet.value);
              }, 500);
              this.toastService.success('Prestation ajoutée avec succès.');
          },
          error: (error) => {
              console.error("Erreur lors de l'ajout de la prestation", error);
              this.toastService.error('Erreur lors de l\'ajout de la prestation.');
          }
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
        this.benefitService.replaceBenefit(this.benefitToDelete, this.replacementBenefit).subscribe({
            next: () => {
                this.modalService.dismissAll();
                this.loadBenefits();
                this.toastr.success("Prestation remplacée et supprimée avec succès.");
            },
            error: (error) => {
                console.error("Erreur lors du remplacement de la prestation", error);
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
                console.error("Erreur lors de la suppression de la prestation", error);
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

    const matrix: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = 0; i <= n; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= m; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const cost = word1[i - 1] === word2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
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

  private getCustomerNameById(customerId: string): string {
    // console.log('CustomerId:', customerId);
    const customer = this.userProfileService.getOne(customerId);
    // console.log('Customer:', customer);
    return customer ? `${customer["firstname"]} ${customer["lastname"]}` : 'Client inconnu';
  }

  private getBenefitNameById(benefitId: string): string {
    const benefit = this.benefits.find(b => b.value === benefitId);
    return benefit ? benefit.name : 'Prestation inconnue';
  }



  private saveFormDataToStorage(): void {
    const formData = this.orderForm.getRawValue();
    console.log('Formulaire actuel à sauvegarder:', formData);
    localStorage.setItem(this.formStorageKey, JSON.stringify(formData));
    console.log('Données sauvegardées dans localStorage:', localStorage.getItem(this.formStorageKey));
  }


  // private loadFormDataFromStorage(): void {
  //   const savedFormData = localStorage.getItem(this.formStorageKey);
  //   if (savedFormData) {
  //       console.log('Données sauvegardées trouvées:', savedFormData);
  //       try {
  //           const parsedFormData = JSON.parse(savedFormData);
  //           console.log('Données sauvegardées après parsing:', parsedFormData);
  //           if (this.isFormDataValid(parsedFormData)) {
  //               console.log('Données valides, formulaire sera pré-rempli');
  //               this.orderForm.patchValue(parsedFormData);
  //               this.toastr.info('Les données du formulaire ont été restaurées.');
  //           } else {
  //               console.log('Données invalides ou obsolètes');
  //               this.toastr.warning('Les données sauvegardées sont invalides ou obsolètes.');
  //           }
  //       } catch (e) {
  //           console.error('Erreur lors de la restauration des données du formulaire:', e);
  //           this.toastr.error('Erreur lors de la restauration des données du formulaire.');
  //       }
  //   } else {
  //       console.log('Aucune donnée sauvegardée trouvée, chargement depuis l\'historique');
  //       const lastSavedVersion = this.getLastSavedFormVersion();
  //       if (lastSavedVersion && this.isFormDataValid(lastSavedVersion.data)) {
  //           console.log('Dernière version sauvegardée trouvée, formulaire sera pré-rempli');
  //           this.orderForm.patchValue(lastSavedVersion.data);
  //           this.toastr.info('Le formulaire a été pré-rempli avec la dernière sauvegarde.');
  //       } else {
  //           console.log('Aucune version valide trouvée dans l\'historique');
  //           this.toastr.warning('Aucune donnée de sauvegarde valide trouvée.');
  //       }
  //   }
  // }

  private loadFormDataFromStorage(): void {
    const savedFormData = localStorage.getItem(this.formStorageKey);
    if (savedFormData) {
        try {
            const parsedFormData = JSON.parse(savedFormData);
            if (this.isFormDataValid(parsedFormData)) {
                this.orderForm.patchValue(parsedFormData);
                this.toastr.info('Les données du formulaire ont été restaurées.');
            } else {
                this.toastr.warning('Les données sauvegardées sont invalides ou obsolètes.');
                const lastSavedVersion = this.getLastSavedFormVersion();
                if (lastSavedVersion && this.isFormDataValid(lastSavedVersion.data)) {
                    this.orderForm.patchValue(lastSavedVersion.data);
                    this.toastr.info('Le formulaire a été pré-rempli avec la dernière sauvegarde.');
                }
            }
        } catch (e) {
            console.error('Erreur lors de la restauration des données du formulaire:', e);
            this.toastr.error('Erreur lors de la restauration des données du formulaire.');
        }
    } else {
        const lastSavedVersion = this.getLastSavedFormVersion();
        if (lastSavedVersion && this.isFormDataValid(lastSavedVersion.data)) {
            this.orderForm.patchValue(lastSavedVersion.data);
            this.toastr.info('Le formulaire a été pré-rempli avec la dernière sauvegarde.');
        }
    }
}


  private getLastSavedFormVersion(): any {
    const history = this.getFormHistory();
    return history.length > 0 ? history[history.length - 1] : null;
  }

  private isFormDataValid(formData: any): boolean {
    if (!formData || typeof formData !== 'object') {
        return false;
    }
    const formControls = Object.keys(this.orderForm.controls);
    return formControls.every(control => formData.hasOwnProperty(control));
  }


  private saveFormDataToHistory(formData: any): void {
    let history = this.getFormHistory();
    history.push({
      timestamp: new Date().toISOString(),
      data: formData
    });
    if (history.length > this.maxHistorySize) {
      history = history.slice(-this.maxHistorySize);
    }
    localStorage.setItem(this.formHistoryKey, JSON.stringify(history));
    this.formHistory = history; 
  }

  private getFormHistory(): any[] {
    const history = localStorage.getItem(this.formHistoryKey);
    return history ? JSON.parse(history) : [];
  }

  private loadFormHistoryFromStorage(): void {
    this.formHistory = this.getFormHistory();
    if (this.formHistory.length > 0) {
      this.toastr.info('Historique du formulaire chargé.');
    }
  }

  private saveFormHistoryToStorage(): void {
    localStorage.setItem(this.formHistoryKey, JSON.stringify(this.formHistory));
  }

  restorePreviousVersion(): void {
    let history = this.getFormHistory();
    if (history.length > 1) {
      history.pop();
      const previousFormData = history[history.length - 1].data;
      this.orderForm.setValue(previousFormData);
      localStorage.setItem(this.formHistoryKey, JSON.stringify(history));
      this.toastr.success('Version précédente du formulaire restaurée.');
    } else {
      this.toastr.warning('Aucune version précédente disponible.');
    }
  }

  restoreSpecificVersion(event: Event, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    const history = this.getFormHistory();
    if (index >= 0 && index < history.length) {
      const formData = history[index].data;
      this.orderForm.setValue(formData);
      this.toastr.success('Version spécifique du formulaire restaurée.');
    } else {
      this.toastr.warning('Index de version invalide.');
    }
  }

  getVersionDescription(version: any): string {
    const timestamp = new Date(version.timestamp).toLocaleString();
    const customerName = this.getCustomerNameById(version.data.customer);
    const benefitName = this.getBenefitNameById(version.data.benefit);
    return `${timestamp} - ${customerName} - ${benefitName}`;
  }


  clearFormData(): void {
    localStorage.removeItem(this.formStorageKey);
    localStorage.removeItem(this.formHistoryKey);
    this.orderForm.reset();
    this.formHistory = [];
    this.toastr.info('Les données du formulaire ont été réinitialisées.');
  }

  deleteVersion(event: Event, index: number): void {
    event.stopPropagation();
    const history = this.getFormHistory();
    if (index >= 0 && index < history.length) {
      history.splice(index, 1);
      localStorage.setItem(this.formHistoryKey, JSON.stringify(history));
      this.formHistory = history;
      this.toastr.success('Version supprimée avec succès.');
    } else {
      this.toastr.warning('Index de version invalide.');
    }
  }

  resetForm(): void {
    this.orderForm.reset();
    this.toastr.success('Formulaire réinitialisé.');
  }

//   onAddContact(tag: string) {
//     console.log('onAddContact called with tag:', tag); // Log initial pour vérifier que la méthode est appelée

//     if (tag) {
//         const [firstName, lastName] = tag.split(' ');
//         console.log('Split tag into firstName:', firstName, 'and lastName:', lastName); // Vérifier la séparation du nom et du prénom

//         this.userProfileService.createMinimalUser(firstName, lastName).subscribe(
//             (response: any) => {
//                 console.log('Response from createMinimalUser:', response); // Log de la réponse du backend

//                 if (response && response.userId) {
//                     console.log('User ID received:', response.userId); // Vérifier que l'ID utilisateur est bien reçu
//                     this.orderForm.get('contact').setValue(response.userId);
//                     this.toastr.success('Nouveau contact créé avec succès.');

//                     // Appel manuel à onUserSelected après avoir mis à jour le champ avec l'ID
//                     this.onUserSelected('contact', response.userId);
//                 } else {
//                     console.error('Erreur : ID utilisateur manquant dans la réponse.'); // Log d'erreur si l'ID utilisateur est manquant
//                     this.toastr.error('Erreur lors de la création du contact : ID utilisateur manquant.');
//                 }
//             },
//             (error) => {
//                 console.error('Erreur lors de la création du contact:', error); // Log de l'erreur en cas d'échec de l'appel API
//                 this.toastr.error('Erreur lors de la création du contact.');
//             }
//         );
//     } else {
//         console.warn('Tag is empty, skipping user creation.'); // Log d'avertissement si le tag est vide
//     }

//     console.log('Returning tag as object:', { name: tag }); // Vérification de l'objet retourné à `ng-select`
//     return { name: tag }; // Assurez-vous que la valeur retournée correspond au modèle attendu par `ng-select`
// }

onAddContact(tag: string): void {
  console.log(`onAddContact called with tag: ${tag}`);

  // Séparation du tag en firstName et lastName
  const [firstName, lastName] = tag.split(' ');
  console.log(`Split tag into firstName: ${firstName} and lastName: ${lastName}`);

  // Création de l'utilisateur minimal
  this.userProfileService.createMinimalUser(firstName, lastName).subscribe(
      (response: any) => {
          console.log('Response from createMinimalUser:', response);

          if (response && response.userId) {
              console.log('User ID received:', response.userId);

              // Mettre à jour le champ "contact" avec le nouvel ID utilisateur
              this.orderForm.get('contact').setValue(response.userId, { emitEvent: false });

              // Appeler onUserSelected avec le nouvel ID utilisateur
              this.onUserSelected('contact', response.userId);
          } else {
              console.error('Erreur: aucun userId retourné.');
          }
      },
      (error) => {
          console.error('Erreur lors de la création du contact:', error);
      }
  );
}



// private calculateHoursAndDaysFromBenefit(): void {
//   const amount = Number(this.orderForm.get("benefitHt").value);
//   let divider = 450; // Diviseur par défaut

//   const benefitId = this.orderForm.get("benefit").value;
//   const benefitType = this.benefits.find(
//       (benefit) => benefit.value === benefitId
//   )?.name;

//   if (benefitType === "Sol") {
//       divider = 650;
//   }

//   const days = amount / divider;
//   const roundedDays = Math.floor(days);
//   const hours = Math.round((days - roundedDays) * 8);

//   this.orderForm.patchValue(
//       {
//           previsionDataDay: roundedDays,
//           previsionDataHour: hours,
//       },
//       { emitEvent: false }
//   );

//   this.manualHoursOrDaysChange = false; // Remettre à faux après le calcul automatique
//   this.calculateDifferencesAndAdjustments();
// }

// private calculateHoursAndDaysFromBenefit(): void {
//   const benefitId = this.orderForm.get("benefit").value;
//   const benefitType = this.benefits.find(
//       (benefit) => benefit.value === benefitId
//   )?.name;
//   const amount = Number(this.orderForm.get("benefitHt").value);

//   let divider = 450;

//   if (benefitType === "Sol") {
//       divider = 650;
//   }

//   const days = amount / divider;
//   const roundedDays = Math.floor(days);
//   const hours = Math.round((days - roundedDays) * 8);

//   this.orderForm.patchValue(
//       {
//           previsionDataDay: roundedDays,
//           previsionDataHour: hours,
//       },
//       { emitEvent: false }
//   );

//   this.manualHoursOrDaysChange = false;
//   this.calculateDifferencesAndAdjustments();
// }

// private calculateHoursAndDaysFromBenefit(): void {
//   const benefitId = this.orderForm.get("benefit").value;
//   const benefitType = this.benefits.find(
//       (benefit) => benefit.value === benefitId
//   )?.name;
//   const amount = Number(this.orderForm.get("benefitHt").value);

//   let divider = 450;
//   if (benefitType === "Sol") {
//       divider = 650;
//   }

//   const days = amount / divider;
//   const roundedDays = Math.floor(days);
//   const hours = Math.round((days - roundedDays) * 8);

//   this.manualHoursOrDaysChange = false;
//   this.orderForm.patchValue(
//       {
//           previsionDataDay: roundedDays,
//           previsionDataHour: hours,
//       },
//       { emitEvent: false }
//   );
//   this.manualHoursOrDaysChange = true;
// }

// private calculateHoursAndDaysFromBenefit(): void {
//   const benefitId = this.orderForm.get("benefit").value;
//   const benefitType = this.benefits.find(
//       (benefit) => benefit.value === benefitId
//   )?.name;
//   const amount = Number(this.orderForm.get("benefitHt").value);

//   let divider = 450;
//   if (benefitType === "Sol") {
//       divider = 650;
//   }

//   const days = amount / divider;
//   const roundedDays = Math.floor(days);
//   const hours = Math.round((days - roundedDays) * 8);

//   this.manualHoursOrDaysChange = false;
//   this.orderForm.patchValue(
//       {
//           previsionDataDay: roundedDays,
//           previsionDataHour: hours,
//       },
//       { emitEvent: false }
//   );
//   this.manualHoursOrDaysChange = true;
// }


// private calculateDaysFromHours(): void {
//   const totalHours = Number(this.orderForm.get("previsionDataHour").value);
//   const roundedDays = Math.floor(totalHours / 8);
//   const remainingHours = totalHours % 8;

//   this.manualHoursOrDaysChange = false;
//   this.orderForm.patchValue(
//       {
//           previsionDataDay: roundedDays,
//           previsionDataHour: remainingHours,
//       },
//       { emitEvent: false }
//   );
//   this.manualHoursOrDaysChange = true;
// }

// Modification de la méthode pour permettre la modification manuelle
private calculateHoursAndDaysFromBenefit(): void {
  // if (!this.manualHoursOrDaysChange) { // Seulement calculer si ce n'est pas un changement manuel
      const benefitId = this.orderForm.get("benefit").value;
      const benefitType = this.benefits.find(
          (benefit) => benefit.value === benefitId
      )?.name;
      const amount = Number(this.orderForm.get("benefitHt").value);

      let divider = 450; // Valeur par défaut pour le diviseur

      if (benefitType === "Sol") {
          divider = 650;
      }

      const days = amount / divider;
      const roundedDays = Math.floor(days);
      const hours = Math.round((days - roundedDays) * 8);

      // this.manualHoursOrDaysChange = false; // Désactiver le drapeau manuel
      this.orderForm.patchValue(
          {
              previsionDataDay: roundedDays,
              previsionDataHour: hours,
          },
          { emitEvent: false }
      );
      // this.manualHoursOrDaysChange = true; // Réactiver le drapeau manuel
  // }
}



// private calculateDaysFromHours(): void {
//   const totalHours = Number(this.orderForm.get("previsionDataHour").value);
//   const totalDays = Math.floor(totalHours / 8);
//   const remainingHours = totalHours % 8;

//   // Seulement mettre à jour si les valeurs ont changé
//   if (
//       totalDays !== this.orderForm.get("previsionDataDay").value ||
//       remainingHours !== this.orderForm.get("previsionDataHour").value
//   ) {
//       this.orderForm.patchValue(
//           {
//               previsionDataDay: totalDays,
//               previsionDataHour: remainingHours,
//           },
//           { emitEvent: false }
//       );
//   }
// }

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
  const totalHours = totalDays * 8 + Number(this.orderForm.get("previsionDataHour").value);

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





// private calculateHoursFromDays(): void {
//   const totalDays = Number(this.orderForm.get("previsionDataDay").value);
//   const totalHours = totalDays * 8 + Number(this.orderForm.get("previsionDataHour").value);

//   const remainingDays = Math.floor(totalHours / 8);
//   const remainingHours = totalHours % 8;

//   // Seulement mettre à jour si les valeurs ont changé
//   if (
//       remainingDays !== this.orderForm.get("previsionDataDay").value ||
//       remainingHours !== this.orderForm.get("previsionDataHour").value
//   ) {
//       this.orderForm.patchValue(
//           {
//               previsionDataHour: remainingHours,
//               previsionDataDay: remainingDays,
//           },
//           { emitEvent: false }
//       );
//   }
// }







// private subscribeToHourAndDayChanges(): void {
//   // this.orderForm.get('previsionDataHour').valueChanges.subscribe(() => {
//   //     if (this.autoCalculateEnabled || this.isManuallyChanging) {
//   //         return;
//   //     }
//   //     this.isManuallyChanging = true; // Marquer comme modification manuelle
//   //     this.calculateDaysFromHours();
//   //     this.isManuallyChanging = false; // Réinitialiser après modification
//   // });

//   // this.orderForm.get('previsionDataDay').valueChanges.subscribe(() => {
//   //     if (this.autoCalculateEnabled || this.isManuallyChanging) {
//   //         return;
//   //     }
//   //     this.isManuallyChanging = true; // Marquer comme modification manuelle
//   //     this.calculateHoursFromDays();
//   //     this.isManuallyChanging = false; // Réinitialiser après modification
//   // });
// }

private subscribeToHourAndDayChanges(): void {
  this.orderForm.get('previsionDataHour').valueChanges
    .pipe(debounceTime(300)) // Ajoute un délai de 300ms avant d'appliquer les calculs
    .subscribe(() => {
      this.calculateDaysFromHours();
    });

  this.orderForm.get('previsionDataDay').valueChanges
    .pipe(debounceTime(300)) // Ajoute un délai de 300ms avant d'appliquer les calculs
    .subscribe(() => {
      this.calculateHoursFromDays();
    });
}






toggleAutoCalculate(): void {
  this.autoCalculateEnabled = !this.autoCalculateEnabled;

  if (this.autoCalculateEnabled) {
      this.orderForm.get('previsionDataHour').disable({ emitEvent: false });
      this.orderForm.get('previsionDataDay').disable({ emitEvent: false });
      this.subscribeToBenefitAmountChanges();
  } else {
      this.orderForm.get('previsionDataHour').enable({ emitEvent: false });
      this.orderForm.get('previsionDataDay').enable({ emitEvent: false });
  }

  // Forcer la mise à jour de la validité pour s'assurer que les champs sont bien réactivés
  this.orderForm.get('previsionDataHour').updateValueAndValidity();
  this.orderForm.get('previsionDataDay').updateValueAndValidity();

  console.log('activated:', this.autoCalculateEnabled);
  console.log('previsionDataHour:', this.orderForm.get('previsionDataHour').enabled);
  console.log('previsionDataDay:', this.orderForm.get('previsionDataDay').enabled);

  this.toastr.info(this.autoCalculateEnabled ? 'Calcul automatique activé' : 'Calcul automatique désactivé');
}




private subscribeToBenefitAmountChanges(): void {
  this.benefitAmountSubscription = this.orderForm.get("benefitHt").valueChanges.subscribe(() => {
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