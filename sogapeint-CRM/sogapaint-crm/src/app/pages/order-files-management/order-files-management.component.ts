import { Component, Input, OnInit } from '@angular/core';
import { ContractService } from '../../core/services/contract.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { UserProfileService } from 'src/app/core/services/user.service';


@Component({
  selector: 'app-order-files-management',
  templateUrl: './order-files-management.component.html',
  styleUrls: ['./order-files-management.component.scss', '../order-detail/order-detail.component.scss']
})
export class OrderFilesManagementComponent implements OnInit {
  @Input() contractId: string;
  @Input() role: string;
  @Input() isInvoiceMode: boolean = false;
  currentUser: any;
  files: File[] = [];
  files_to_upload: File[] = [];
  
  constructor(
    private contractService: ContractService,
    private userProfileService: UserProfileService
  ) {}
  
  ngOnInit(): void {
    this.currentUser = this.userProfileService.getCurrentUser();
    this.loadFiles();
  }
  
  loadFiles() {
    this.contractService.getContractById(this.contractId).subscribe({
      next: (data) => {
        console.log("Données reçues pour les fichiers:", data);
        if (data && data.file) {
          // Appliquer le filtrage en fonction du rôle de l'utilisateur
          if (['cocontractor', 'subcontractor'].includes(this.currentUser.role)) {
            // Filtrer pour ne montrer que les fichiers commençant par 'invoice_'
            this.files = data.file.filter(file => file.name.startsWith('invoice_'));
          } else {
            // Les superAdmins voient tous les fichiers
            this.files = data.file;
          }
        } else {
          console.error("Aucun fichier ou mauvais format de données:", data);
          this.files = [];  // Assurer que files est toujours un tableau
        }
        console.log("Fichiers filtrés selon le rôle:", this.files);
      },
      error: (error) => {
        console.error("Erreur lors du chargement des fichiers", error);
        this.files = [];  // En cas d'erreur, réinitialiser la liste des fichiers
      }
    });
  }
  
  
  
  
  onFileDownload(file: any) {
    console.log("Téléchargement du fichier", file);
    this.contractService.getFile(file._id, this.contractId).subscribe({
      next: (data) => {
        console.log("Fichier téléchargé", data);
        const url = window.URL.createObjectURL(data);
        window.open(url);
      },
      error: (error) => console.error("Erreur lors du téléchargement du fichier", error)
    });
  }
  
  removeFile(index: number) {
    const file = this.files[index];
    this.contractService.deleteFile(file["_id"], this.contractId).subscribe({
      next: (data) => {
        console.log("Fichier supprimé", data);
        this.files.splice(index, 1);
      },
      error: (error) => console.error("Erreur lors de la suppression du fichier", error)
    });
  }
  
  onSelect(event) {
    if (this.currentUser.role === 'superAdmin' || (this.isInvoiceMode && (this.currentUser.role === 'cocontractor' || this.currentUser.role === 'subcontractor'))) {
      console.log(event);
      this.files_to_upload.push(...event.addedFiles);
      this.uploadFile(this.files_to_upload);
      this.files_to_upload = [];
    } else {
      // Afficher un message d'erreur ou ne rien faire
      console.error("Vous n'êtes pas autorisé à uploader des fichiers ici.");
    }
  }
  
  uploadFile(files: File[]) {
    console.log("Fichiers à télécharger", files);
    const folderName = this.isInvoiceMode ? 'invoices' : 'files';  // Simplification de la logique
  
    this.contractService.uploadFiles(this.contractId, files, folderName).subscribe(
      (event) => {
        if (event instanceof HttpResponse) {
          console.log("Fichiers complètement uploadés!", event.body);
          this.loadFiles();  // Recharger les fichiers pour mettre à jour l'affichage
        } else if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          console.log(`Progression de l'upload: ${percentDone}%`);
        }
      },
      (error) => {
        console.error("Erreur lors de l'upload des fichiers", error);
      }
    );
  }
  
  
}
