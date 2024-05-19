import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket = io(environment.apiUrl);

  constructor(private http: HttpClient) {}

  getMessages(days: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/chat?days=${days}`);
  }

  sendMessage(message: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/chat`, message);
  }

  onNewMessage() {
    return new Observable(observer => {
      this.socket.on('chatMessage', (message) => {
        observer.next(message);
      });
    });
  }
}
