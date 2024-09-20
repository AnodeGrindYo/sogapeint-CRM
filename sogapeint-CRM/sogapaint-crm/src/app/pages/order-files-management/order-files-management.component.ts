// import { Component, Input, OnInit } from '@angular/core';
// import { ContractService } from '../../core/services/contract.service';
// import { HttpEventType, HttpResponse } from '@angular/common/http';
// import { UserProfileService } from 'src/app/core/services/user.service';


// @Component({
//   selector: 'app-order-files-management',
//   templateUrl: './order-files-management.component.html',
//   styleUrls: ['./order-files-management.component.scss', '../order-detail/order-detail.component.scss']
// })
// export class OrderFilesManagementComponent implements OnInit {
//   @Input() contractId: string;
//   @Input() role: string;
//   @Input() isInvoiceMode: boolean = false;
//   @Input() isReadOnly: boolean = false;
//   currentUser: any;
//   files: File[] = [];
//   files_to_upload: File[] = [];
  
//   constructor(
//     private contractService: ContractService,
//     private userProfileService: UserProfileService
//   ) {}
  
//   ngOnInit(): void {
//     this.currentUser = this.userProfileService.getCurrentUser();
//     this.loadFiles();
//   }
  
//   // loadFiles() {
//   //   this.contractService.getContractById(this.contractId).subscribe({
//   //     next: (data) => {
//   //       console.log("Données reçues pour les fichiers:", data);
//   //       if (data && data.file) {
//   //         // Appliquer le filtrage en fonction du rôle de l'utilisateur
//   //         if (['cocontractor', 'subcontractor'].includes(this.currentUser.role)) {
//   //           // Filtrer pour ne montrer que les fichiers commençant par 'invoice_'
//   //           this.files = data.file.filter(file => file.name.startsWith('invoice_'));
//   //         } else if (this.currentUser.role === 'superAdmin'){
//   //           // Les superAdmins voient tous les fichiers
//   //           this.files = data.file;
//   //         } else {
//   //           // Les autres rôles ne voient que les fichiers qui ne commencent pas par 'invoice_'
//   //           this.files = data.file.filter(file => !file.name.startsWith('invoice_'));
//   //         }
//   //       } else {
//   //         console.error("Aucun fichier ou mauvais format de données:", data);
//   //         this.files = [];  // Assurer que files est toujours un tableau
//   //       }
//   //       console.log("Fichiers filtrés selon le rôle:", this.files);
//   //     },
//   //     error: (error) => {
//   //       console.error("Erreur lors du chargement des fichiers", error);
//   //       this.files = [];  // En cas d'erreur, réinitialiser la liste des fichiers
//   //     }
//   //   });
//   // }

//   // loadFiles() {
//   //   this.contractService.getContractById(this.contractId).subscribe({
//   //       next: (data) => {
//   //           console.log("Données reçues pour les fichiers:", data);
//   //           if (data && data.file) {
//   //               if (['cocontractor', 'subcontractor'].includes(this.currentUser.role)) {
//   //                   this.files = data.file.filter(file => file.name.startsWith('invoice_'));
//   //               } else if (this.currentUser.role === 'superAdmin') {
//   //                   this.files = data.file;
//   //               } else if (this.currentUser.role === 'comanager' || this.currentUser.role === 'supermanager') {
//   //                   this.files = data.file.filter(file => !file.name.startsWith('invoice_'));
//   //               } else {
//   //                   this.files = data.file.filter(file => !file.name.startsWith('invoice_'));
//   //               }
//   //           } else {
//   //               console.error("Aucun fichier ou mauvais format de données:", data);
//   //               this.files = [];
//   //           }
//   //           console.log("Fichiers filtrés selon le rôle:", this.files);
//   //       },
//   //       error: (error) => {
//   //           console.error("Erreur lors du chargement des fichiers", error);
//   //           this.files = [];
//   //       }
//   //   });
//   // }

//   loadFiles() {
//     this.contractService.getContractById(this.contractId).subscribe({
//       next: (data) => {
//         console.log("Données reçues pour les fichiers:", data);
//         if (data && data.file) {
//           if (['cocontractor', 'subcontractor'].includes(this.currentUser.role)) {
//             this.files = data.file.filter(file => file.name.startsWith('invoice_'));
//           } else if (this.currentUser.role === 'superAdmin' || this.currentUser.role === 'comanager' || this.currentUser.role === 'supermanager') {
//             this.files = data.file;
//           } else {
//             this.files = data.file.filter(file => !file.name.startsWith('invoice_'));
//           }
//         } else {
//           console.error("Aucun fichier ou mauvais format de données:", data);
//           this.files = [];
//         }
//         console.log("Fichiers filtrés selon le rôle:", this.files);
//       },
//       error: (error) => {
//         console.error("Erreur lors du chargement des fichiers", error);
//         this.files = [];
//       }
//     });
//   }
  
  
//   onFileDownload(file: any) {
//     console.log("Téléchargement du fichier", file);
//     if (!this.isReadOnly){
//       this.contractService.getFile(file._id, this.contractId).subscribe({
//         next: (data) => {
//           console.log("Fichier téléchargé", data);
//           const url = window.URL.createObjectURL(data);
//           window.open(url);
//         },
//         error: (error) => console.error("Erreur lors du téléchargement du fichier", error)
//       });
//     }
//   }
  
//   removeFile(index: number) {
//     if (!this.isReadOnly) {
//       const file = this.files[index];
//       this.contractService.deleteFile(file["_id"], this.contractId).subscribe({
//         next: (data) => {
//           console.log("Fichier supprimé", data);
//           this.files.splice(index, 1);
//         },
//         error: (error) => console.error("Erreur lors de la suppression du fichier", error)
//       });
//     }
//   }
  
//   // onSelect(event) {
//   //   if (this.currentUser.role === 'superAdmin' || (this.isInvoiceMode && (this.currentUser.role === 'cocontractor' || this.currentUser.role === 'subcontractor'))) {
//   //     console.log(event);
//   //     this.files_to_upload.push(...event.addedFiles);
//   //     this.uploadFile(this.files_to_upload);
//   //     this.files_to_upload = [];
//   //   } else {
//   //     // Afficher un message d'erreur ou ne rien faire
//   //     console.error("Vous n'êtes pas autorisé à uploader des fichiers ici.");
//   //   }
//   // }

//   onSelect(event) {
//     if (this.currentUser.role === 'superAdmin' || this.currentUser.role === 'comanager' || this.currentUser.role === 'supermanager' || (this.isInvoiceMode && (this.currentUser.role === 'cocontractor' || this.currentUser.role === 'subcontractor'))) {
//       console.log(event);
//       this.files_to_upload.push(...event.addedFiles);
//       this.uploadFile(this.files_to_upload);
//       this.files_to_upload = [];
//     } else {
//       console.error("Vous n'êtes pas autorisé à uploader des fichiers ici.");
//     }
//   }
  
  
//   uploadFile(files: File[]) {
//     console.log("Fichiers à télécharger", files);
//     if (!this.isReadOnly) {
//       const folderName = this.isInvoiceMode ? 'invoices' : 'files';  // Simplification de la logique
    
//       this.contractService.uploadFiles(this.contractId, files, folderName).subscribe(
//         (event) => {
//           if (event instanceof HttpResponse) {
//             console.log("Fichiers complètement uploadés!", event.body);
//             this.loadFiles();  // Recharger les fichiers pour mettre à jour l'affichage
//           } else if (event.type === HttpEventType.UploadProgress) {
//             const percentDone = Math.round(100 * event.loaded / event.total);
//             console.log(`Progression de l'upload: ${percentDone}%`);
//           }
//         },
//         (error) => {
//           console.error("Erreur lors de l'upload des fichiers", error);
//         }
//       );
//     }
//   }
  
  
// }

import { Component, Input, OnInit } from '@angular/core';
import { ContractService } from '../../core/services/contract.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { UserProfileService } from 'src/app/core/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-files-management',
  templateUrl: './order-files-management.component.html',
  styleUrls: ['./order-files-management.component.scss', '../order-detail/order-detail.component.scss']
})
export class OrderFilesManagementComponent implements OnInit {
  @Input() contractId: string;
  @Input() role: string;
  @Input() isInvoiceMode: boolean = false;
  @Input() isReadOnly: boolean = false;
  
  currentUser: any;
  files: any[] = [];
  files_to_upload: File[] = [];

  constructor(
    private contractService: ContractService,
    private userProfileService: UserProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userProfileService.getCurrentUser();
    if (this.currentUser) {
      this.loadFiles();
    } else {
      this.toastr.error('Erreur : impossible de charger les informations utilisateur. L’objet utilisateur est manquant ou invalide.');
      console.error('Impossible de charger les informations utilisateur. L’objet utilisateur est manquant ou invalide.', this.currentUser);
    }
  }

  loadFiles() {
    if (!this.contractId) {
      this.toastr.error("L'ID de contrat est manquant. Veuillez vérifier les informations.");
      console.error("L'ID de contrat est manquant :", this.contractId);
      return;
    }

    this.contractService.getContractById(this.contractId).subscribe({
      next: (data) => {
        if (data && Array.isArray(data.file)) {
          this.files = this.filterFilesByRole(data.file);
          this.toastr.success('Fichiers chargés avec succès.');
          console.log("Fichiers filtrés selon le rôle :", this.files);
        } else if (data) {
          // Affiche les champs présents dans l'objet si la propriété file est manquante ou incorrecte
          this.toastr.error("Données reçues mais sans fichiers valides. Champs présents : " + Object.keys(data).join(', '));
          console.error("Données reçues sans fichier :", data);
          this.files = [];
        } else {
          this.toastr.error("Erreur : données reçues nulles ou indéfinies.");
          console.error("Données reçues nulles ou indéfinies :", data);
          this.files = [];
        }
      },
      error: (error) => {
        this.toastr.error("Erreur lors du chargement des fichiers. Vérifiez votre connexion réseau.");
        console.error("Erreur lors du chargement des fichiers", error);
        this.files = [];
      }
    });
  }

  filterFilesByRole(files: any[]): any[] {
    if (!this.currentUser || !this.currentUser.role) {
      this.toastr.error('Erreur : rôle utilisateur manquant ou invalide.');
      console.error('Rôle utilisateur manquant ou invalide :', this.currentUser);
      return [];
    }

    // Appliquer un filtre en fonction du rôle de l'utilisateur
    if (['cocontractor', 'subcontractor'].includes(this.currentUser.role)) {
      return files.filter(file => file && file.name && file.name.startsWith('invoice_'));
    } else if (['superAdmin', 'comanager', 'supermanager'].includes(this.currentUser.role)) {
      return files.filter(file => file && file.name);
    } else {
      return files.filter(file => file && file.name && !file.name.startsWith('invoice_'));
    }
  }

  onFileDownload(file: any) {
    if (!file) {
      this.toastr.error("Erreur : fichier manquant. Aucun fichier n'a été fourni pour le téléchargement.");
      console.error("Objet fichier manquant :", file);
      return;
    }

    if (!file._id) {
      this.toastr.error("Erreur : l'ID du fichier est manquant. Champs disponibles : " + Object.keys(file).join(', '));
      console.error("Le fichier ne contient pas d'ID :", file);
      return;
    }

    if (!this.isReadOnly) {
      this.toastr.info('Téléchargement en cours...', '', { timeOut: 2000 });
      this.contractService.getFile(file._id, this.contractId).subscribe({
        next: (data) => {
          if (data) {
            const url = window.URL.createObjectURL(data);
            window.open(url);
            this.toastr.success("Téléchargement réussi.");
          } else {
            this.toastr.error('Erreur : données du fichier manquantes.');
          }
        },
        error: (error) => {
          this.toastr.error('Impossible de télécharger le fichier. Erreur réseau probable.');
          console.error("Erreur lors du téléchargement du fichier", error);
        }
      });
    } else {
      this.toastr.warning("Le mode lecture seule est activé. Téléchargement impossible.");
      console.warn("Tentative de téléchargement en mode lecture seule :", file);
    }
  }

  removeFile(index: number) {
    const file = this.files[index];

    if (!file) {
      this.toastr.error("Erreur : le fichier à supprimer est manquant. Vérifiez les fichiers disponibles.");
      console.error("Le fichier à supprimer est manquant :", file);
      return;
    }

    if (!file._id) {
      this.toastr.error("Erreur : l'ID du fichier à supprimer est manquant. Champs disponibles : " + Object.keys(file).join(', '));
      console.error("Le fichier à supprimer ne contient pas d'ID :", file);
      return;
    }

    if (!this.isReadOnly) {
      this.toastr.info("Suppression du fichier en cours...", '', { timeOut: 2000 });
      this.contractService.deleteFile(file["_id"], this.contractId).subscribe({
        next: () => {
          this.files.splice(index, 1);
          this.toastr.success("Fichier supprimé avec succès.");
        },
        error: (error) => {
          this.toastr.error("Erreur lors de la suppression du fichier. Erreur réseau probable.");
          console.error("Erreur lors de la suppression du fichier", error);
        }
      });
    } else {
      this.toastr.warning("Le mode lecture seule est activé. Vous ne pouvez pas supprimer de fichiers.");
    }
  }

  onSelect(event: any) {
    if (!event || !event.addedFiles || event.addedFiles.length === 0) {
      this.toastr.error("Aucun fichier sélectionné pour l'upload.");
      console.error("Aucun fichier ajouté :", event);
      return;
    }

    if (this.currentUser.role === 'superAdmin' || this.currentUser.role === 'comanager' || this.currentUser.role === 'supermanager' || 
        (this.isInvoiceMode && (this.currentUser.role === 'cocontractor' || this.currentUser.role === 'subcontractor'))) {
      this.files_to_upload.push(...event.addedFiles);
      this.toastr.info(`Préparation de l'upload. ${event.addedFiles.length} fichier(s) sélectionné(s).`);
      console.log("Fichiers sélectionnés pour l'upload :", this.files_to_upload);
      this.uploadFile(this.files_to_upload);
      this.files_to_upload = [];
    } else {
      this.toastr.error("Vous n'êtes pas autorisé à uploader des fichiers. Contactez un administrateur si nécessaire.");
      console.error("Upload de fichiers non autorisé pour le rôle :", this.currentUser.role);
    }
  }

  uploadFile(files: File[]) {
    if (!files || files.length === 0) {
      this.toastr.error("Erreur : aucun fichier à uploader. Sélectionnez un fichier d'abord.");
      console.error("Aucun fichier sélectionné pour l'upload :", files);
      return;
    }

    if (!this.isReadOnly) {
      const folderName = this.isInvoiceMode ? 'invoices' : 'files';
      this.toastr.info('Upload en cours...');
      console.log("upload en cours des fichiers");

      this.contractService.uploadFiles(this.contractId, files, folderName).subscribe(
        (event) => {
          if (event instanceof HttpResponse) {
            this.toastr.success("Upload réussi !");
            console.log("Fichiers complètement uploadés!", event.body);
            this.loadFiles();
          } else if (event.type === HttpEventType.UploadProgress && event.total) {
            const percentDone = Math.round(100 * event.loaded / event.total);
            this.toastr.info(`Progression de l'upload : ${percentDone}%`);
            console.log(`Progression de l'upload : ${percentDone}%`);
          }
        },
        (error) => {
          this.toastr.error("Erreur lors de l'upload. Vérifiez votre connexion réseau.");
          console.error("Erreur lors de l'upload des fichiers", error);
        }
      );
    } else {
      this.toastr.warning("Le mode lecture seule est activé. Upload impossible.");
      console.warn("Tentative d'upload en mode lecture seule :", files);
    }
  }
}

