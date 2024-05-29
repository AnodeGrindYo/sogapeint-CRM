import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ContractService } from './contract.service';

export interface Invoice {
  path: string;
  name: string;
  size: number;
  uploadDate: Date;
  processed: boolean;
  contractId: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {

  private apiUrl = `${environment.apiUrl}/api/auth/invoices`;

  constructor(private http: HttpClient, 
              private contractService: ContractService
  ) { }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // getFile(filePath: string): Observable<Blob> {
  //   return this.http.get(`${this.apiUrl}/download`, { params: { path: filePath }, responseType: 'blob' }).pipe(
  //     catchError(this.handleError)
  //   );
  // }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  // utilise getFile() de contract.service pour télécharger le fichier
  // implémentation de getFile:
  //   getFile(fileId: string, contractId: string): Observable<any> {
  //     return this.http.get<any>(`${environment.apiUrl}/api/auth/download`, { params: { fileId: fileId, contractId: contractId }, responseType: 'blob' as 'json' });
  // }
  getFile(fileId: string, contractId: string): Observable<any> {
    return this.contractService.getFile(fileId, contractId);
  }
}
