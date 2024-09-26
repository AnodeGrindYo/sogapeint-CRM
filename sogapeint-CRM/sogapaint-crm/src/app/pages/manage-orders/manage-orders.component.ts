import { Component, OnInit, Renderer2, OnDestroy } from "@angular/core";
import { ContractService } from "../../core/services/contract.service";
import { Router } from "@angular/router";
import { Contract } from "../../core/models/contract.models";
import { UserProfileService } from "src/app/core/services/user.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { BenefitService } from '../../core/services/benefit.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-manage-orders",
  templateUrl: "./manage-orders.component.html",
  styleUrls: ["./manage-orders.component.scss"],
})
export class ManageOrdersComponent implements OnInit, OnDestroy {
  breadCrumbItems: Array<{ label: string; url?: string; active?: boolean }> = [];
  pageTitle: string = "Gestion des commandes";
  isLoading = true;
  sortColumn: string = "";
  sortDirection: "asc" | "desc" = "asc";
  filter: string = "";
  filteredOrders: any[] = [];
  ordersToDisplay: any[] = [];
  tags: string[] = [
    "En cours",
    "Réalisé",
    "Facturé",
    "Annulé",
    "Anomalie",
    "Incident",
  ];
  availableTags: string[] = [];
  activeTags: string[] = [];
  orders: Contract[] = [];
  private destroy$ = new Subject<void>();
  private ongoingContractsEventSource: EventSource;
  private notOngoingContractsEventSource: EventSource;

  itemsPerPage = 10;
  currentPage = 1;
  totalOrdersToShow = [];

  benefits = [];

  currentUser: any;

  showDeletedOrders: boolean = false;

  excludedFields = ['_id', 'file', 'trash', 'waiting_payment', 'dateUpd', 'dateAdd', '__v', 'end_work', 'createdBy', 'modifiedBy'];

  constructor(
    private contractService: ContractService,
    private userService: UserProfileService,
    private benefitService: BenefitService,
    private renderer: Renderer2,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Sogapeint" },
      { label: "Gestion des commandes", active: true },
    ];
    this.availableTags = this.tags;
    this.currentUser = this.userService.getCurrentUser();
    this.loadBenefits();

    // this.activeTags.push("En cours"); // désactivation à la demande de Sogapeint

    // this.availableTags = this.availableTags.filter((tag) => tag !== "En cours");

    // this.loadOnGoingContractsStream();
    // this.loadNotOnGoingContracts();
    this.loadContracts();
  }

  ngOnDestroy() {
    this.contractService.closeEventSource(this.ongoingContractsEventSource);
    this.contractService.closeEventSource(this.notOngoingContractsEventSource);
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBenefits() {
    this.benefitService.getBenefits().subscribe({
      next: (benefits) => {
        this.benefits = benefits;
        this.toastr.success("Prestations chargées avec succès !");
      },
      error: (error) => {
        this.toastr.error("Erreur lors du chargement des prestations");
      },
    });
  }

  getBenefitName(benefitId: string): string {
    const benefit = this.benefits.find((benefit) => benefit._id === benefitId);
    return benefit ? benefit.name : "";
  }

  loadContracts() {
    this.isLoading = true;
  
    this.contractService.getContracts(2)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contracts: any[]) => {
          const contractsArray = [];
  
          contracts.forEach(contract => {
            if (!contract || !contract._id) return;
            if (contract.trash) return; // Exclure les commandes avec trash=true
  
            // Filtrage basé sur le rôle de l'utilisateur
            if (this.currentUser.role === "superAdmin") {
              contractsArray.push(contract);
            } else if (["cocontractor", "subcontractor", "supermanager"].includes(this.currentUser.role)) {
              const user_company = this.normalizeString(this.currentUser.company);
              if (this.checkCompanyInContract(contract, user_company)) {
                contractsArray.push(contract);
              }
            } else if (this.currentUser.role === "customer") {
              if (this.currentUser.userId == contract.customer?._id){
                contractsArray.push(contract);
              }
            } else if (this.currentUser.role === "comanager") {
              if (
                this.currentUser.userId == contract.customer?._id ||
                this.currentUser.userId == contract.contact?._id ||
                this.currentUser.userId == contract.external_contributor?._id ||
                this.currentUser.userId == contract.internal_contributor?._id ||
                this.currentUser.userId == contract.subcontractor?._id
              ){
                contractsArray.push(contract);
              }
            }
          });
  
          // Affecter et trier les contrats
          this.orders = contractsArray;
          this.filteredOrders = [...contractsArray];
  
          // Trier les commandes par date la plus récente
          this.sortfilteredOrdersByMostRecent();
  
          // Mettre à jour l'affichage
          this.updateOrdersToShow();
  
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Erreur lors du chargement des contrats", error);
          this.isLoading = false;
        }
      });
  }
  

  loadNotOnGoingContracts() {
    console.log("loadNotOnGoingContracts");
    this.isLoading = true;
    this.contractService.getNotOnGoingContracts().subscribe({
      next: (notOnGoingContracts) => {
        const filteredContracts = notOnGoingContracts.filter(contract => {
          if (!contract || !contract._id) return false;  

          if (this.currentUser.role === "superAdmin") {
            return true;
          } else if (this.currentUser.role === "cocontractor" || this.currentUser.role === "subcontractor") {
            const user_company = this.normalizeString(this.currentUser.company);
            return this.checkCompanyInContract(contract, user_company);
          } else if (this.currentUser.role === "customer") {
            if (contract.customer) {
              return this.currentUser.userId === contract.customer._id
                && this.currentUser.userId === contract.customer._id;
            }
          } else if (this.currentUser.role === "comanager") {
            let returnedContract;
            if (contract.customer && 
                contract.customer._id && 
                this.currentUser.userId == contract.customer._id

            ) {
              returnedContract = contract;
            }
            if (contract.contact && 
                contract.contact._id && 
                this.currentUser.userId == contract.contact._id

            ) {
              returnedContract = contract;
            }
            if (contract.external_contributor && 
                contract.external_contributor._id && 
                this.currentUser.userId == contract.external_contributor._id
            ) {
              returnedContract = contract;
            }
            if (contract.internal_contributor && 
                contract.internal_contributor._id && 
                this.currentUser.userId == contract.internal_contributor._id
            ) {
              returnedContract = contract;
            }
            if (contract.subcontractor && 
                contract.subcontractor._id && 
                this.currentUser.userId == contract.subcontractor._id
            ) {
              returnedContract = contract;
            }

            return returnedContract;
          }
          return false;
        });

        this.sortfilteredOrdersByMostRecent();
        this.updateOrdersToShow();
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur lors du chargement des contrats non en cours", error);
        this.isLoading = false;
      }
    });
  }

  loadOnGoingContractsStream() {
    this.isLoading = true; 
    console.log("current user: ", this.currentUser);
    this.contractService
      .getOnGoingContractsStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contract: any) => {
          if (!contract || !contract._id) return;  

          if (this.currentUser.role === "superAdmin") {
            this.orders.push(contract); 
            this.filteredOrders.push(contract);
          } else if (this.currentUser.role === "cocontractor" || this.currentUser.role === "subcontractor" || this.currentUser.role === "supermanager") {

            const user_company = this.normalizeString(this.currentUser.company);
            if (this.checkCompanyInContract(contract, user_company)) {
              this.orders.push(contract); 
              this.filteredOrders.push(contract);
            }
          } else if (this.currentUser.role === "customer") {
            if (
              (this.currentUser.userId == contract.customer?._id)
            ){
              this.orders.push(contract); 
              this.filteredOrders.push(contract);
            }
          } else if (this.currentUser.role === "comanager") {
            if (
              this.currentUser.userId == contract.customer?._id ||
              this.currentUser.userId == contract.contact?._id ||
              this.currentUser.userId == contract.external_contributor?._id ||
              this.currentUser.userId == contract.internal_contributor?._id ||
              this.currentUser.userId == contract.subcontractor?._id
            ){
              this.orders.push(contract); 
              this.filteredOrders.push(contract);
            }
          }

          this.sortfilteredOrdersByMostRecent();

          if (this.totalOrdersToShow.length < this.itemsPerPage) {
            this.sortfilteredOrdersByMostRecent();
            this.updateOrdersToShow(); 

            if (this.totalOrdersToShow.length === 1) {
              this.sortfilteredOrdersByMostRecent();
              this.isLoading = false; 
            }
          }
          this.sortfilteredOrdersByMostRecent();

        },
        error: (error) => {
          console.error("Erreur lors du chargement des contrats en cours", error);
          this.isLoading = false; 
        },
        complete: () => {
          console.log("complete");
          this.sortfilteredOrdersByMostRecent();
          this.updateOrdersToShow();
        }
      });
  }

  sortOrdersByDateCde() {
    this.filteredOrders.sort((a, b) => {
      return new Date(b.date_cde).getTime() - new Date(a.date_cde).getTime();
    });
  }

  shouldAddToDisplay(): boolean {
    return this.totalOrdersToShow.length < this.itemsPerPage * this.currentPage;
  }

  updateOrdersToShow() {
    const start = this.itemsPerPage * (this.currentPage - 1);
    const end = this.itemsPerPage * this.currentPage;
    this.totalOrdersToShow = this.filteredOrders.slice(start, end);
    this.ordersToDisplay = this.filteredOrders.slice(0, this.itemsPerPage * this.currentPage); 
  }

  onScroll(): void {
    this.currentPage++;
    this.updateOrdersToShow();
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortDirection = "asc";
      console.log(`Sorting by ${this.sortColumn} ${this.sortDirection}`);
    }
    this.sortOrders();
  }


  onSearch(): void {
    const searchTerms = this.filter.toLowerCase().trim().split(" ");
    // let filteredOrders = this.orders.filter(order => !order.trash || this.showDeletedOrders);
    let filteredOrders = this.orders.filter(order => !order.trash || this.showDeletedOrders);


    const searchFields: Set<string> = new Set();

    filteredOrders = searchTerms.length === 0 ? filteredOrders : filteredOrders.filter(order =>
      this.searchInOrder(order, searchTerms, searchFields)
    );

    this.filteredOrders = filteredOrders.filter(order =>
      this.activeTags.length === 0 || this.activeTags.every(tag => this.orderHasTag(order, tag))
    );

    this.updateOrdersToShow();
    
    const searchTermStr = searchTerms.join(', ');
    const resultCount = this.filteredOrders.length;
    const searchFieldsStr = Array.from(searchFields).join(', ');
    
    // filteredOrders = searchTerms.length === 0 ? filteredOrders : filteredOrders.filter(order =>
    //   this.searchInOrder(order, searchTerms)
    // );
  
    // this.filteredOrders = filteredOrders.filter(order =>
    //   this.activeTags.length === 0 || this.activeTags.every(tag => this.orderHasTag(order, tag))
    // );
  
    // this.updateOrdersToShow();
    
    // const searchTermStr = searchTerms.join(', ');
    // const resultCount = this.filteredOrders.length;
    // const searchFieldsStr = Array.from(searchFields).join(', ');

    console.log("searchFieldStr : ", searchFieldsStr)

    // this.toastr.info(`${resultCount} commandes trouvées pour les termes de recherche: ${searchTermStr} dans les champs: ${searchFieldsStr}`);
    this.toastr.info(`${resultCount} commandes trouvées pour les termes de recherche: ${searchTermStr}`);
  }
  
  

  orderHasTag(order: any, tag: string): boolean {
    switch (tag) {
      case "En cours":
        return order.status === "in_progress";
      case "Réalisé":
        return order.status === "achieve";
      case "Facturé":
        return order.status === "invoiced";
      case "Anomalie":
        return order.status === "anomaly";
      case "Annulé":
        return order.status === "canceled";
      case "Incident":
        return Array.isArray(order.incident) && order.incident.length > 0;

      default:
        return false;
    }
  }


  // searchInOrder(order: any, searchTerms: string[]): boolean {
  //   const searchInObject = (obj: any, term: string): boolean => {
  //     return Object.entries(obj).some(([key, value]) => {
  //       if (this.excludedFields.includes(key) || key === '_id') return false; // Exclure les champs non pertinents et les champs _id dans les sous-objets
  //       if (typeof value === "object" && value !== null) {
  //         return Array.isArray(value)
  //           ? value.some((subValue) => searchInObject(subValue, term))
  //           : searchInObject(value, term);
  //       }
  //       const valueStr = typeof value === 'string' || typeof value === 'number'
  //         ? String(value).toLowerCase()
  //         : (value instanceof Date ? this.formatDate(value) : '').toLowerCase();
  //       return valueStr.includes(term) || valueStr === term;
  //     });
  //   };
  
  //   // Vérifier si chaque terme de recherche est présent dans l'ordre
  //   return searchTerms.every(term => searchInObject(order, term));
  // }


  // searchInOrder(order: any, searchTerms: string[], searchFields: Set<string>): boolean {
  //   const searchInObject = (obj: any, term: string): boolean => {
  //       return Object.entries(obj).some(([key, value]) => {
  //           if (this.excludedFields.includes(key) || key === '_id') return false;
  //           if (typeof value === "object" && value !== null) {
  //               return Array.isArray(value)
  //                   ? value.some((subValue) => searchInObject(subValue, term))
  //                   : searchInObject(value, term);
  //           }
  //           const valueStr = typeof value === 'string' || typeof value === 'number'
  //               ? String(value).toLowerCase()
  //               : (value instanceof Date ? this.formatDate(value) : '').toLowerCase();
            
  //           if (valueStr.includes(term) || valueStr === term) {
  //               searchFields.add(key); // Ajoutez le champ à la liste des champs recherchés
  //               return true;
  //           }
  //           return false;
  //       });
  //   };

  //   return searchTerms.every(term => searchInObject(order, term));
  // }


  // searchInOrder(order: any, searchTerms: string[], searchFields: Set<string>): boolean {
  //   const visibleFields = [
  //     'internal_number',
  //     'appartment_number',
  //     'address',
  //     'quote_number',
  //     'benefit',
  //     'external_contributor',
  //     'invoice_number',
  //     'end_date_customer',
  //     'external_contributor_amount',
  //     'benefit_ht',
  //     'amount_ht',
  //     'end_date_work',
  //     'status'
  //   ];
  
  //   // Ajouter des champs conditionnels en fonction du rôle de l'utilisateur
  //   if (this.currentUser.role !== 'comanager') {
  //     visibleFields.push('contact');
  //   }
  //   if (this.currentUser.role !== 'customer') {
  //     visibleFields.push('quote_number', 'external_contributor_amount');
  //   }
  
  //   const dateFields = [
  //     'date_cde',
  //     'dateUpd',
  //     'dateAdd',
  //     'external_contributor_invoice_date',
  //     'start_date_works',
  //     'end_date_works',
  //     'end_date_customer'
  //   ];
  
  //   const searchInObject = (obj: any, term: string): boolean => {
  //     return Object.entries(obj).some(([key, value]) => {
  //       if (!visibleFields.includes(key) || this.excludedFields.includes(key) || key === '_id') return false;
  
  //       // Log des dates pour vérifier leur format
  //       if (dateFields.includes(key)) {
  //         console.log(`Date field "${key}" received with value:`, value);
  //       }
  
  //       // Log des dates dans modifiedBy
  //       if (key === 'modifiedBy' && Array.isArray(value)) {
  //         value.forEach((modification) => {
  //           console.log(`Date field "modifiedBy.date" received with value:`, modification.date);
  //         });
  //       }
  
  //       if (key === 'contact' || key === 'external_contributor' || key === 'subcontractor' || key === 'customer') {
  //         // Rechercher dans les sous-champs spécifiques
  //         if (value && typeof value === 'object') {
  //           const subFields = ['firstname', 'lastname', 'email', 'company'];
  //           return subFields.some(subKey => {
  //             const subValue = value[subKey];
  //             if (subValue && String(subValue).toLowerCase().includes(term)) {
  //               searchFields.add(`${key}.${subKey}`);  // Ajouter le champ dans searchFields
  //               return true;
  //             }
  //             return false;
  //           });
  //         }
  //       }
  
  //       if (typeof value === "object" && value !== null) {
  //         return Array.isArray(value)
  //           ? value.some((subValue) => searchInObject(subValue, term))
  //           : searchInObject(value, term);
  //       }
  
  //       const valueStr = typeof value === 'string' || typeof value === 'number'
  //         ? String(value).toLowerCase()
  //         : (value instanceof Date ? this.formatDate(value) : '').toLowerCase();
  
  //       if (valueStr.includes(term) || valueStr === term) {
  //         searchFields.add(key);  // Ajouter le champ dans searchFields
  //         return true;
  //       }
  //       return false;
  //     });
  //   };
  
  //   return searchTerms.every(term => searchInObject(order, term));
  // }

  searchInOrder(order: any, searchTerms: string[], searchFields: Set<string>): boolean {
    const visibleFields = [
        'internal_number',
        'appartment_number',
        'address',
        'quote_number',
        'benefit',
        'external_contributor',
        'invoice_number',
        'end_date_customer',
        // 'external_contributor_amount',
        // 'benefit_ht',
        // 'amount_ht',
        'end_date_work',
        'status',
        'billing_number',            // Nouveau champ
        // 'billing_amount',            // Nouveau champ
        'observation.comment',       // Nouveau champ
        'incident.comment'           // Nouveau champ
    ];

    const companyFields = [
        'normalized_name',           // Nouveau champ
        'abbreviation',              // Nouveau champ
        'address',                   // Nouveau champ
        'websites',                  // Nouveau champ
        'phone',                     // Nouveau champ
        'email'                      // Nouveau champ
    ];

    const documentFields = [
        'name'                       // Nouveau champ
    ];

    // Combiner les champs visibles avec les nouveaux champs ajoutés
    const searchInObject = (obj: any, term: string): boolean => {
        return Object.entries(obj).some(([key, value]) => {
            if (visibleFields.includes(key) || companyFields.includes(key) || documentFields.includes(key)) {
                searchFields.add(key); // Ajouter le champ trouvé au Set des champs de recherche
            }

            if (typeof value === "object" && value !== null) {
                return Array.isArray(value)
                    ? value.some((subValue) => searchInObject(subValue, term))
                    : searchInObject(value, term);
            }

            const valueStr = typeof value === 'string' || typeof value === 'number'
                ? String(value).toLowerCase()
                : (value instanceof Date ? this.formatDate(value) : '').toLowerCase();

            if (valueStr.includes(term) || valueStr === term) {
                return true;
            }
            return false;
        });
    };

    return searchTerms.every(term => searchInObject(order, term));
  }

  
  
  
  
  
  
  
  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  
  
  
  

  sortOrders() {
    if (!this.sortColumn) return;

    this.filteredOrders.sort((a, b) => {
      let valueA = this.getColumnValue(a, this.sortColumn);
      let valueB = this.getColumnValue(b, this.sortColumn);

      if (valueA == null) valueA = "";
      if (valueB == null) valueB = "";

      if (typeof valueA === "string") valueA = valueA.toLowerCase();
      if (typeof valueB === "string") valueB = valueB.toLowerCase();

      let comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;

      return this.sortDirection === "asc" ? comparison : -comparison;
    });
    this.updateOrdersToShow();
  }

  sortfilteredOrdersByMostRecent() {
    this.filteredOrders.sort((a, b) => {
      return new Date(b.dateAdd).getTime() - new Date(a.dateAdd).getTime(); 
    });
    this.updateOrdersToShow();
  }

  sortOrdersByMostRecent() {
    this.orders.sort((a, b) => {
      return new Date(b.dateAdd).getTime() - new Date(a.dateAdd).getTime();
    });
    this.updateOrdersToShow();
  }

  getColumnValue(order: any, column: string) {
    switch (column) {
      case "client":
        return `${order?.customer?.firstname} ${order?.customer?.lastname}`;
      case "contact":
        return `${order?.contact?.firstname} ${order?.contact?.lastname}`;
      case "external_contributor":
        return `${order?.external_contributor?.firstname} ${order?.external_contributor?.lastname}`;
      default:
        return order[column];
    }
  }

  activateTag(tag: string) {
    if (!this.activeTags.includes(tag)) {
      this.activeTags.push(tag);
      this.availableTags = this.availableTags.filter((t) => t !== tag);
      this.onSearch();
    }
  }

  deactivateTag(tag: string, event: MouseEvent) {
    event.stopPropagation();
    const index = this.activeTags.indexOf(tag);
    this.availableTags.push(tag);

    this.availableTags.sort(
      (a, b) => this.tags.indexOf(a) - this.tags.indexOf(b)
    );
    if (index > -1) {
      this.activeTags.splice(index, 1);
      this.onSearch();
    }
  }

  selectOrder(order: any) {
    console.log("Commande sélectionnée:", order);
    switch (this.currentUser.role) {
      case "comanager":
      case "supermanager":
      case "superAdmin":
        console.log(" case superAdmin");
        this.router.navigate(["/order-detail", order._id]);
        break;
      case "cocontractor":
        console.log(" case cocontractor");
      case "subcontractor":
        console.log(" case subcontractor");
        this.router.navigate(["/order-detail-cocontractor", order._id]);
        break;
      case "customer":
        console.log(" case customer");
        this.router.navigate(["/order-detail-customer", order._id]);
        break;
      default:
        console.log(" case default");
        break;
    }
  }

  trackByFn(index, item) {
    return item._id;
  }

  convertDateFormat(dateStr: string): string {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split("/");
      return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
    }
    return dateStr;
  }

  loadOldOrders() {
    console.log("Chargement des anciens contrats");
    this.isLoading = true;
    this.filteredOrders = [];
    this.contractService.getContracts().subscribe({
      next: (oldContracts) => {
        console.log("Anciens contrats chargés", oldContracts);
        console.log("rôle de l'utilisateur : ", this.currentUser.role)
        let filteredOldContracts;
        if (this.currentUser.role === "superAdmin") {
          filteredOldContracts = oldContracts;
        } else if (this.currentUser.role === "cocontractor" || this.currentUser.role === "subcontractor") {
          const user_company = this.normalizeString(this.currentUser.company);
          filteredOldContracts = oldContracts.filter(contract => contract && contract._id && this.checkCompanyInContract(contract, user_company));
        } else if (this.currentUser.role === "customer") {
          filteredOldContracts = oldContracts.filter(contract => {
            return contract && contract._id && (this.currentUser.userId == contract.customer?._id
              && this.currentUser.userId == contract.customer?._id);
          });
        } else if (this.currentUser.role === "comanager") {
          filteredOldContracts = oldContracts.filter(contract => {
            return contract && contract._id && 
              (this.currentUser.userId == contract.customer?._id
                && this.currentUser.userId == contract.customer?._id) ||
              (this.currentUser.userId == contract.contact?._id &&
                this.currentUser.userId == contract.contact?._id) ||
              (this.currentUser.userId == contract.external_contributor?._id &&
                this.currentUser.userId == contract.external_contributor?._id) ||
              (this.currentUser.userId == contract.internal_contributor?._id &&
                this.currentUser.userId == contract.internal_contributor?._id) ||
              (this.currentUser.userId == contract.subcontractor?._id &&
                this.currentUser.userId == contract.subcontractor?._id);
          });
        }
        console.log("filteredOldContracts : ", filteredOldContracts);
        this.orders = [...this.orders, ...filteredOldContracts];

        this.filteredOrders = [...this.filteredOrders, ...filteredOldContracts];

        console.log("orders : ", this.orders);
        console.log("filtered orders : ", this.filteredOrders)

        this.sortfilteredOrdersByMostRecent();

        this.isLoading = false;
        this.updateOrdersToShow();
      },
      error: (error) => {
        console.error("Erreur lors du chargement des anciens contrats", error);
        this.isLoading = false;
      },
    });
  }

  normalizeString(str: string): string {
    return str.replace(/[^a-zA-Z]/g, '').toLowerCase();
  }

  checkCompanyInContract(contract: any, normalizedCompany: string): boolean {
    for (let key in contract) {
      if (contract[key] && typeof contract[key] === 'object') {
        if (this.checkCompanyInContract(contract[key], normalizedCompany)) {
          return true;
        }
      } else if (typeof contract[key] === 'string') {
        let normalizedValue = this.normalizeString(contract[key]);
        if (normalizedValue.includes(normalizedCompany)) {
          return true;
        }
      }
    }
    return false;
  }

  toggleShowDeletedOrders() {
    this.showDeletedOrders = !this.showDeletedOrders;
    this.onSearch(); 
  }

  confirmTrashChange(order): void {
    if (confirm("Êtes-vous sûr de vouloir changer l'état de cette commande ?")) {
      this.onTrashChange(order);
    }
  }

  onTrashChange(order): void {
    if (order._id) {
      this.contractService.updateContract(order._id, { trash: order.trash }).subscribe({
        next: () => {
          if (order.trash) {
            this.toastr.success(`Commande ID: ${order._id}\nNuméro interne: ${order.internal_number}\nLA COMMANDE A ÉTÉ JETÉE À LA CORBEILLE`);
          } else {
            this.toastr.success(`Commande ID: ${order._id}\nNuméro interne: ${order.internal_number}\n\nLA COMMANDE A ÉTÉ SORTIE DE LA CORBEILLE`);
          }
          this.onSearch(); 
        },
        error: (err) => this.toastr.error('Erreur lors de la mise à jour de l\'état de suppression')
      });
    } else {
      console.error('Contract ID is undefined:', order);
    }
  }

  getTrashTooltipText(order: any): string {
    return order.trash ? 'Cliquez pour sortir cette commande de la corbeille' : 'Cliquez pour jeter cette commande dans la corbeille';
  }
}
