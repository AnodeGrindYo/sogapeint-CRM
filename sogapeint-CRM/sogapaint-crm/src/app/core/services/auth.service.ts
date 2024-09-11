import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { User } from '../models/auth.models';

// localStorage.removeItem('currentUser'); // Temporary

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    
    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }
    
    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }
    
    login(email: string, password: string, rememberMe: boolean) {
        return this.http.post<any>(`${environment.apiUrl}/api/auth/login`, { email, password, rememberMe })
        .pipe(map(user => {
            // stocker les détails de l'utilisateur et le jeton jwt dans le stockage local pour garder l'utilisateur connecté entre les rafraîchissements de page
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return user;
        }));
    }
    
    logout() {
        // supprimer l'utilisateur du stockage local pour déconnecter l'utilisateur
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
    
    // Méthode pour récupérer le jeton JWT
    public getToken(): string {
        const currentUser = this.currentUserValue;
        return currentUser ? currentUser.token : null; // Assurez-vous que le jeton est stocké dans la propriété 'token'
    }

    isAdminOrSuperAdmin(): boolean {
        const currentUser = this.currentUserValue;
        return currentUser && (currentUser.role === 'admin' || currentUser.role === 'superAdmin');
    }
    
}
