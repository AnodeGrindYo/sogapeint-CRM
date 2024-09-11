import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SensitiveDataInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.checkForSensitiveData(event.body);
        }
      })
    );
  }

  private checkForSensitiveData(data: any): void {
    if (typeof data === 'object' && data !== null) {
      if (this.containsSensitiveData(data)) {
        // console.warn('Sensitive data detected in response:', data);
      }
    }
  }

  private containsSensitiveData(data: any): boolean {
    if (Array.isArray(data)) {
      return data.some(item => this.containsSensitiveData(item));
    }
    
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (key.toLowerCase().includes('password') || key.toLowerCase().includes('salt')) {
          return true;
        }
        if (typeof data[key] === 'object' && this.containsSensitiveData(data[key])) {
          return true;
        }
      }
    }
    return false;
  }
}
