import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Invoice {
  path: string;
  name: string;
  size: number;
  uploadDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {

  private apiUrl = `${environment.apiUrl}/api/auth/invoices`;

  constructor(private http: HttpClient) { }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getFile(filePath: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download`, { params: { path: filePath }, responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

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
}
