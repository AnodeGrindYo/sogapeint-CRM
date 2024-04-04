import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

/**
* Service pour gérer les prestations.
* 
* Dialogue avec l'api pour les routes suivantes :
* 
* //  Route pour obtenir la liste de tous les services
router.get('/benefits', isConnected, authController.getBenefits);
* GET /benefits: Récupère la liste de tous les services.

// Route pour ajouter un service
router.post('/benefit', isAdminOrSuperAdmin, authController.addBenefit);
* POST /benefit: Ajoute un service.

// Route pour supprimer un service par son id
router.delete('/benefit/:benefitId', isAdminOrSuperAdmin, authController.deleteBenefit);
* DELETE /benefit/:benefitId: Supprime un service par son id.
*/
@Injectable({
    providedIn: 'root'
})
export class BenefitService {
    
    /**
    * Constructeur du service BenefitService.
    * @param http HttpClient pour les requêtes HTTP.
    */
    constructor(private http: HttpClient) {}
    
    /**
    * Récupère la liste de tous les services.
    * 
    * Envoie une requête GET pour obtenir la liste de tous les services.
    * @returns Un Observable contenant un tableau de services.
    */
    getBenefits(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/api/auth/benefits`);
    }
    
    /**
    * Ajoute un service.
    * 
    * Envoie une requête POST pour ajouter un service.
    * @param benefit Le service à ajouter.
    * @returns Un Observable contenant le service ajouté.
    */
    addBenefit(benefit: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/api/auth/benefit`, benefit);
    }
    
    /**
    * Supprime un service par son identifiant.
    * 
    * Envoie une requête DELETE pour supprimer un service par son identifiant.
    * @param benefitId L'identifiant du service à supprimer.
    * @returns Un Observable contenant le service supprimé.
    */
    deleteBenefit(benefitId: string): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/api/auth/benefit/${benefitId}`);
    }
    
}