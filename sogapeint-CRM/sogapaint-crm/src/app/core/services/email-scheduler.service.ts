import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailSchedulerService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {
    console.log('EmailSchedulerService created');
    console.log('API URL:', this.apiUrl);
  }

  getEmailSchedule(contractId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/contracts/${contractId}/email-schedule`);
  }

  updateEmailSchedule(contractId: string, schedule: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/contracts/${contractId}/email-schedule`, schedule);
  }

  deleteEmailSchedule(contractId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/contracts/${contractId}/email-schedule`);
  }
}