import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Importation du modèle User pour la gestion des données utilisateur
import { User } from '../models/auth.models';
import { environment } from '../../../environments/environment';

import { AuthenticationService } from './auth.service';

/**
 * Service pour la gestion des profils utilisateurs.
 *
 * Ce service fournit des fonctionnalités pour interagir avec les données utilisateur,
 * telles que l'obtention de la liste des utilisateurs et l'enregistrement de nouveaux utilisateurs.
 */
@Injectable({ providedIn: 'root' })
export class UserProfileService {
    /**
     * Constructeur du service UserProfileService.
     * @param http HttpClient pour les requêtes HTTP.
     */
    constructor(private http: HttpClient, private authService: AuthenticationService) { }

    getCurrentUser(): User {
        return this.authService.currentUserValue;
    }

    /**
     * Récupère tous les utilisateurs.
     *
     * Envoie une requête GET pour obtenir une liste de tous les utilisateurs.
     * @returns Un Observable contenant un tableau d'utilisateurs.
     */
    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/api/users/allUsers`);
    }

    /**
     * Enregistre un nouvel utilisateur.
     *
     * Envoie une requête POST pour créer un nouvel utilisateur avec les données fournies.
     * @param user Les données de l'utilisateur à créer.
     * @returns Un Observable pour la réponse de la requête.
     */
    create(user: User) {
        return this.http.post(`${environment.apiUrl}/api/users/addUser`, {
            email: user.email, 
            password: user.password, 
            firstname: user.firstName, 
            lastname: user.lastName, 
            role: user.role,
            company: user.company,
            phone: user.phone,
            active: user.active,
            authorized_connection: user.authorized_connection
        });
    }

    /**
    * Récupère un utilisateur par son identifiant.
    * @param userId L'identifiant de l'utilisateur à récupérer.
    * @returns Un Observable contenant l'utilisateur.
    */
    getOne(userId: string) {
        return this.http.get<User>(`${environment.apiUrl}/api/users/user/${userId}`);
    }

    /**
     * Met à jour un utilisateur.
     *
     * Envoie une requête PUT pour mettre à jour un utilisateur avec les données fournies.
     * @param userId L'identifiant de l'utilisateur à mettre à jour.
     * @param user Les données de l'utilisateur à mettre à jour.
     * @returns Un Observable pour la réponse de la requête.
     */
    update(userId: string, user: User) {
        return this.http.put(`${environment.apiUrl}/api/users/user/${userId}`, {
            email: user.email, 
            firstname: user.firstName, 
            lastname: user.lastName, 
            phone: user.phone,
            company: user.company,
            role: user.role,
            active: user.active,
            authorized_connection: user.authorized_connection
        });
    }

    /**
     * Supprime un utilisateur.
     *
     * Envoie une requête DELETE pour supprimer un utilisateur.
     * @param userId L'identifiant de l'utilisateur à supprimer.
     * @returns Un Observable pour la réponse de la requête.
     */
    delete(userId: string) {
        return this.http.delete(`${environment.apiUrl}/api/users/user/${userId}`);
    }

    /**
     * Recherche des utilisateurs par nom, prénom ou email.
     * 
     * Envoie une requête GET avec un paramètre de requête pour rechercher des utilisateurs.
     * @param query La chaîne de caractères pour filtrer les utilisateurs.
     * @returns Un Observable contenant un tableau d'utilisateurs filtrés.
     */
    searchUsers(query: string) {
        console.log('searchUsers', query);
        console.log('searchUsers', `${environment.apiUrl}/api/users/user/search`);
        return this.http.get<User[]>(`${environment.apiUrl}/api/users/user-search`, { params: { q: query } });
    }

    /**
     * Réinitialise le mot de passe d'un utilisateur par un administrateur.
     *
     * Envoie une requête POST au backend pour réinitialiser le mot de passe d'un utilisateur spécifique.
     * @param userId L'identifiant de l'utilisateur dont le mot de passe doit être réinitialisé.
     * @returns Un Observable pour la réponse de la requête.
     */
    resetPasswordByAdmin(userId: string) {
        return this.http.post(`${environment.apiUrl}/api/users/resetPasswordFromAdmin`, { userId });
    }

    
    /**
     * Méthode pour demander la réinitialisation du mot de passe
     * 
     * Envoie une requête POST au backend pour demander la réinitialisation du mot de passe
     * @param email L'email de l'utilisateur
     * @returns Un Observable pour la réponse de la requête.
     */
    requestPasswordReset(email: string) {
        return this.http.post(`${environment.apiUrl}/api/users/forgotPassword`, { email });
    }

    
    /**
     * Méthode pour vérifier le code de réinitialisation
     * 
     * Envoie une requête POST au backend pour vérifier le code de réinitialisation
     * @param email L'email de l'utilisateur
     * @param code Le code de réinitialisation reçu par email
     * @returns Un Observable pour la réponse de la requête.
     */
    verifyResetCode(email: string, code: string) {
        return this.http.post(`${environment.apiUrl}/api/users/verifyResetCode`, { email, code });
    }

    // Méthode pour réinitialiser le mot de passe avec le code de vérification
    resetPassword(email: string, code: string, newPassword: string) {
        return this.http.post(`${environment.apiUrl}/api/users/resetPassword`, { email, code, newPassword });
    }
}
