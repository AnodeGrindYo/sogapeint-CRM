import { Component, OnInit, Renderer2, OnDestroy } from "@angular/core";
import { ContractService } from "../../core/services/contract.service";
import { Router } from "@angular/router";
import { Contract } from "../../core/models/contract.models";
import { UserProfileService } from "src/app/core/services/user.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { BenefitService } from '../../core/services/benefit.service';


@Component({
  selector: "app-manage-orders",
  templateUrl: "./manage-orders.component.html",
  styleUrls: ["./manage-orders.component.scss"],
})
export class ManageOrdersComponent implements OnInit, OnDestroy {
  breadCrumbItems: Array<{ label: string; url?: string; active?: boolean }> =
    [];
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

  constructor(
    private contractService: ContractService,
    private userService: UserProfileService,
    private benefitService: BenefitService,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Sogapeint" },
      { label: "Gestion des commandes", active: true },
    ];
    this.availableTags = this.tags;
    this.loadBenefits();

    this.activeTags.push("En cours");

    this.availableTags = this.availableTags.filter((tag) => tag !== "En cours");
    // charge les contrats en cours, puis les contrats non en cours seulement après
    this.loadOnGoingContractsStream();
    this.loadNotOnGoingContracts();
    // this.loadOnGoingContractsStream();
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

  loadNotOnGoingContracts() {
    console.log("loadNotOnGoingContracts");
    this.contractService.getNotOnGoingContracts().subscribe({
      next: (notOnGoingContracts) => {
        this.orders = [...this.orders, ...notOnGoingContracts];
      },
      error: (error) => {
        console.error(
          "Erreur lors du chargement des contrats non en cours",
          error
        );
      },
    });
  }

  // loadOnGoingContractsStream() {
  //   this.isLoading = true; // Indique le début du chargement
  
  //   this.contractService
  //     .getOnGoingContractsStream()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (contract: any) => {
  //         this.orders.push(contract); // Ajoute chaque contrat reçu à la liste totale des commandes
  //         this.filteredOrders.push(contract);
  //         // Vérifie si le nombre de contrats affichés est inférieur à itemsPerPage
  //         if (this.totalOrdersToShow.length < this.itemsPerPage) {
  //           this.ordersToDisplay.push(contract); // Ajoute le contrat à la liste filtrée pour affichage
  //           this.updateOrdersToShow(); // Met à jour les contrats à afficher
  
  //           if (this.totalOrdersToShow.length === 1) {
  //             this.isLoading = false; // Arrête le chargement une fois itemsPerPage atteint
  //           }
  //         }
  //         // Si itemsPerPage contrats sont affichés, les contrats suivants seront chargés en mémoire mais pas immédiatement affichés
  //       },
  //       error: (error) => {
  //         console.error("Erreur lors du chargement des contrats en cours", error);
  //         this.isLoading = false; // Arrête le chargement en cas d'erreur
  //       },
  //     });
  // }
  loadOnGoingContractsStream() {
    this.isLoading = true; // Indique le début du chargement
  
    this.contractService
      .getOnGoingContractsStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contract: any) => {
          this.orders.push(contract); // Ajoute chaque contrat reçu à la liste totale des commandes
          this.filteredOrders.push(contract);
  
          // Trier les commandes par date_cde en ordre décroissant
          this.sortOrdersByDateCde();
  
          // Vérifie si le nombre de contrats affichés est inférieur à itemsPerPage
          if (this.totalOrdersToShow.length < this.itemsPerPage) {
            this.updateOrdersToShow(); // Met à jour les contrats à afficher
  
            if (this.totalOrdersToShow.length === 1) {
              this.isLoading = false; // Arrête le chargement une fois itemsPerPage atteint
            }
          }
          // Si itemsPerPage contrats sont affichés, les contrats suivants seront chargés en mémoire mais pas immédiatement affichés
        },
        error: (error) => {
          console.error("Erreur lors du chargement des contrats en cours", error);
          this.isLoading = false; // Arrête le chargement en cas d'erreur
        },
      });
  }
  
  // Fonction pour trier les contrats par date_cde
  sortOrdersByDateCde() {
    this.filteredOrders.sort((a, b) => {
      return new Date(b.date_cde).getTime() - new Date(a.date_cde).getTime();
    });
  }
  



  shouldAddToDisplay(): boolean {
    return this.totalOrdersToShow.length < this.itemsPerPage * this.currentPage;
  }

  updateOrdersToShow() {
    // if (!this.shouldAddToDisplay()) return; // Empêche la mise à jour si la limite est atteinte.
    const start = this.itemsPerPage * (this.currentPage - 1);
    const end = this.itemsPerPage * this.currentPage;
    this.totalOrdersToShow = this.filteredOrders.slice(start, end);
    this.ordersToDisplay = this.filteredOrders.slice(0, this.itemsPerPage * this.currentPage); // Met à jour les contrats à afficher
  }

  onScroll(): void {
    // console.log("Scrolling");
    this.currentPage++;
    // console.log("Current page:", this.currentPage);
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
    const searchTerms = this.filter.toLowerCase().split(" ");

    let filteredBySearchText = !this.filter
      ? [...this.orders]
      : this.orders.filter((order) =>
          searchTerms.every((term) => this.searchInOrder(order, term))
        );

    this.filteredOrders = filteredBySearchText.filter(
      (order) =>
        this.activeTags.length === 0 ||
        this.activeTags.every((tag) => this.orderHasTag(order, tag))
    );
    this.updateOrdersToShow();
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
      case "En cours":
        return order.status === null;
      default:
        return false;
    }
  }

  searchInOrder(order: any, searchTerm: string): boolean {
    const searchInObject = (obj: any): boolean => {
      return Object.values(obj).some((value) => {
        if (typeof value === "object" && value !== null) {
          return Array.isArray(value)
            ? value.some((subValue) => searchInObject(subValue))
            : searchInObject(value);
        }
        return String(value).toLowerCase().includes(searchTerm);
      });
    };

    return searchInObject(order);
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
    this.router.navigate(["/order-detail", order._id]);
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
        this.orders = [...this.orders, ...oldContracts];
        this.filteredOrders = [...this.filteredOrders, ...oldContracts];
        this.sortOrders();
        this.isLoading = false;
        this.updateOrdersToShow();
      },
      error: (error) => {
        console.error("Erreur lors du chargement des anciens contrats", error);
      },
    });
  }
}
