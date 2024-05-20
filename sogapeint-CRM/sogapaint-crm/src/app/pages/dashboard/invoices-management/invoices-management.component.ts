import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesService, Invoice } from '../../../core/services/invoices.service';
// importe le pipe filesize de ../../core/pipes/file-size.pipe'
// import { FileSizePipe } from '../../../core/pipes/file-size.pipe';
// import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileService } from '../../../core/services/user.service';

@Component({
  selector: 'app-invoices-management',
  standalone: false,
  templateUrl: './invoices-management.component.html',
  styleUrls: ['./invoices-management.component.scss']
})
export class InvoicesManagementComponent implements OnInit {
  files: Invoice[] = [];
  currentUser: any;

  constructor(
    private invoicesService: InvoicesService, 
    // private fileSizePipe: FileSizePipe,
    // private tooltip: NgbTooltip,
    private userProfileService: UserProfileService,
  ) {}

  ngOnInit(): void {
    console.log("Initialisation du composant InvoicesManagement");
    this.currentUser = this.userProfileService.getCurrentUser();
    this.loadFiles();
  }

  loadFiles() {
    console.log("Chargement des factures");
    this.invoicesService.getInvoices().subscribe({
      next: (data) => {
        console.log("Données reçues pour les factures:", data);
        this.files = data.filter(file => file.name.startsWith('invoice_'));
        console.log("Factures filtrées:", this.files);
      },
      error: (error) => {
        console.error("Erreur lors du chargement des factures", error);
        this.files = [];
      }
    });
  }

  onFileDownload(file: Invoice) {
    console.log("Téléchargement du fichier", file);
    this.invoicesService.getFile(file.path).subscribe({
      next: (data) => {
        console.log("Fichier téléchargé", data);
        const url = window.URL.createObjectURL(data);
        window.open(url);
      },
      error: (error) => console.error("Erreur lors du téléchargement du fichier", error)
    });
  }

  removeFile(file: any) {
    console.log("Suppression du fichier", file);
    // Appeler le service pour supprimer le fichier
  }
}
