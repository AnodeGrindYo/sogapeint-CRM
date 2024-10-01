import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CompanyService } from "../../core/services/company.service";
import { User } from "src/app/core/models/auth.models";
import { Document } from "src/app/core/models/document.models";
import { Contract } from "src/app/core/models/contract.models";
import { ContractService } from "src/app/core/services/contract.service";
import { UserProfileService } from "src/app/core/services/user.service";
import { Company } from "src/app/core/models/company.models";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { forkJoin } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-company-detail",
  templateUrl: "./company-detail.component.html",
  styleUrls: ["./company-detail.component.scss"],
})
export class CompanyDetailComponent implements OnInit {
  company: Company;
  id: string;

  breadCrumbItems: Array<{ label: string; url?: string; active?: boolean }> =
    [];

  pageTitle: string = "Détail entreprise";
  companyForm: FormGroup;

  successMessage: string;
  errorMessage: string;
  isLoading: boolean = false;
  currentUser: User;

  employeeFilter: string = "";
  filteredEmployees: any[] = [];
  contractCustomerFilter: string = "";
  filteredContractsAsCustomer: any[] = [];
  contractContactFilter: string = "";
  filteredContractsAsContact: any[] = [];
  contractExternalContributorFilter: string = "";
  filteredContractsAsExternalContributor: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private contractService: ContractService,
    private userProfileService: UserProfileService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Sogapeint" },
      { label: this.pageTitle, active: true },
    ];
    this.currentUser = this.userProfileService.getCurrentUser();

    this.route.params.subscribe((params) => {
      this.id = params["companyId"];

      this.loadCompany(this.id);
    });
    this.companyForm = this.fb.group({
      names: ["", Validators.required],
      address: [""],
      industry: [""],
      websites: [""],
      phone: [""],
      email: [""],
      additionalFields: this.fb.array([]),
    });
  }

  loadCompany(id: string) {
    this.isLoading = true;
    this.companyService.getCompanyById(id).subscribe({
      next: (company) => {
        this.company = company;
        console.log("Company loaded: ", this.company);

        this.getEmployeeDetails();

        this.getContractsDetails();

        this.filteredEmployees = this.company.employees;
        this.filteredContractsAsCustomer = this.company.contractsAsCustomer;
        this.filteredContractsAsContact = this.company.contractsAsContact;
        this.filteredContractsAsExternalContributor =
          this.company.contractsAsExternalContributor;

        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading the company: ", error);
      },
    });
  }

  isAdminOrSuperAdmin(): boolean {
    return (
      this.currentUser &&
      (this.currentUser.role === "admin" ||
        this.currentUser.role === "superAdmin")
    );
  }

  getEmployeeDetails() {
    if (!this.company.employees || this.company.employees.length === 0) {
      return;
    }

    const employeesDetails = new Map();

    this.company.employees.forEach((employeeId) => {
      this.userProfileService.getOne(employeeId.toString()).subscribe({
        next: (userDetails) => {
          employeesDetails.set(employeeId, {
            id: employeeId,
            ...userDetails,
            firstName: userDetails["firstname"],
            lastName: userDetails["lastname"],
          });

          if (employeesDetails.size === this.company.employees.length) {
            this.company.employees = Array.from(employeesDetails.values());
            this.filteredEmployees = this.company.employees;
          }
        },
        error: (error) => {
          console.error(
            "Erreur lors de la récupération des détails de l'employé:",
            error
          );
        },
      });
    });
  }

  getContractsDetails() {
    const contractCategories: Array<
      | "contractsAsCustomer"
      | "contractsAsContact"
      | "contractsAsExternalContributor"
    > = [
      "contractsAsCustomer",
      "contractsAsContact",
      "contractsAsExternalContributor",
    ];

    contractCategories.forEach((contractCategory) => {
      if (this.company[contractCategory].length) {
        const contractDetailsRequests = this.company[contractCategory].map(
          (contractId) =>
            this.contractService.getContractById(String(contractId))
        );

        forkJoin(contractDetailsRequests).subscribe(
          (contractsDetails) => {
            console.log(
              `Détails des contrats pour ${contractCategory}:`,
              contractsDetails
            );

            this.company[contractCategory] = contractsDetails;

            if (contractCategory === "contractsAsCustomer") {
              this.filteredContractsAsCustomer = contractsDetails;
            } else if (contractCategory === "contractsAsContact") {
              this.filteredContractsAsContact = contractsDetails;
            } else if (contractCategory === "contractsAsExternalContributor") {
              this.filteredContractsAsExternalContributor = contractsDetails;
            }
          },
          (error) => {
            console.error(
              `Erreur pendant la récupération des détails des contrats pour ${contractCategory}:`,
              error
            );
          }
        );
      }
    });
  }

  filterEmployees() {
    const filter = this.employeeFilter.toLowerCase();
    this.filteredEmployees = this.company.employees.filter((employee) => {
      return Object.values(employee).some((val) =>
        String(val).toLowerCase().includes(filter)
      );
    });
  }

  filterContracts(contractType: string) {
    let filter = "";
    let filteredList: any[] = [];

    switch (contractType) {
      case "contractsAsCustomer":
        filter = this.contractCustomerFilter.toLowerCase();
        filteredList = this.company.contractsAsCustomer;
        this.filteredContractsAsCustomer = filteredList.filter((contract) =>
          Object.values(contract).some((val) =>
            String(val).toLowerCase().includes(filter)
          )
        );
        break;
      case "contractsAsContact":
        filter = this.contractContactFilter.toLowerCase();
        filteredList = this.company.contractsAsContact;
        this.filteredContractsAsContact = filteredList.filter((contract) =>
          Object.values(contract).some((val) =>
            String(val).toLowerCase().includes(filter)
          )
        );
        break;
      case "contractsAsExternalContributor":
        filter = this.contractExternalContributorFilter.toLowerCase();
        filteredList = this.company.contractsAsExternalContributor;
        this.filteredContractsAsExternalContributor = filteredList.filter(
          (contract) =>
            Object.values(contract).some((val) =>
              String(val).toLowerCase().includes(filter)
            )
        );
        break;
    }
  }

  editCompany() {
    this.router.navigate(["/company-update", this.id]);
  }

  getRoleClass(role: string): string {
    const roleClassMap = {
      superAdmin: "badge-superadmin",
      cocontractor: "badge-cocontractor",
      subcontractor: "badge-subcontractor",
      customer: "badge-customer",
      comanager: "badge-comanager",
      supermanager: "badge-supermanager",
    };
    return roleClassMap[role] || "badge-default";
  }

  selectUser(user: any) {
    console.log("Utilisateur sélectionné:", user);
    this.router.navigate(["/user-detail", user._id]);
  }

  translateRole(role: string): string {
    const roleTranslationMap = {
      superAdmin: "superAdmin",
      cocontractor: "co-traitant",
      subcontractor: "sous-traitant",
      customer: "client",
      comanager: "régisseur",
      supermanager: "chef régisseur",
    };
    return roleTranslationMap[role] || role;
  }
}
