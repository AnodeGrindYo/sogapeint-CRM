import { Component, Input, OnInit } from '@angular/core';
import { ContractService } from '../../core/services/contract.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';


@Component({
  selector: 'app-order-files-management',
  templateUrl: './order-files-management.component.html',
  styleUrls: ['./order-files-management.component.scss']
})
export class OrderFilesManagementComponent implements OnInit {
  @Input() contractId: string;
  files: File[] = [];
  files_to_upload: File[] = [];

  constructor(
    private contractService: ContractService
  ) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles() {
    this.contractService.getContractById(this.contractId).subscribe({
      next: (data) => {
        this.files = data.file;
        console.log("Fichiers associés au contrat", this.files);
      },
      error: (error) => console.error("Erreur lors du chargement des fichiers", error)
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
    console.log(event);

    this.files_to_upload.push(...event.addedFiles);
    this.uploadFile(this.files_to_upload);
    this.files_to_upload = [];
  }

  uploadFile(files: File[]) {
    console.log("Fichiers à télécharger", files);

    this.contractService.uploadFiles(this.contractId, files).subscribe(
      (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round((100 * event.loaded) / event.total);
          console.log(`Progression de l'upload: ${percentDone}%`);
        } else if (event instanceof HttpResponse) {
          console.log("Fichiers complètement uploadés!", event.body);
          this.files = event.body.files;
        }
      },
      (error) => {
        console.error("Erreur lors de l'upload des fichiers", error);
      }
    );
  }
}
