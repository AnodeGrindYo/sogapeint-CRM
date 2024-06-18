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
        return this.http.get<any[]>(`${environment.apiUrl}/api/benefits/benefits`);
    }
    
    /**
    * Ajoute un service.
    * 
    * Envoie une requête POST pour ajouter un service.
    * @param benefit Le service à ajouter.
    * @returns Un Observable contenant le service ajouté.
    */
    addBenefit(benefit: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/api/benefits/benefit`, benefit);
    }
    
    /**
    * Supprime un service par son identifiant.
    * 
    * Envoie une requête DELETE pour supprimer un service par son identifiant.
    * @param benefitId L'identifiant du service à supprimer.
    * @returns Un Observable contenant le service supprimé.
    */
    deleteBenefit(benefitId: string): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/api/benefits/benefit/${benefitId}`);
    }

    // Nouvelle méthode pour vérifier si une prestation est utilisée
    /**
     * Vérifie si une prestation est utilisée dans des commandes.
     * 
     * @param benefitId L'identifiant de la prestation à vérifier.
     * @returns Un Observable contenant un booléen indiquant si la prestation est utilisée.
     */
    checkBenefitInUse(benefitId: string): Observable<boolean> {
        return this.http.get<boolean>(`${environment.apiUrl}/api/benefits/checkBenefitInUse`, {
            params: { benefitId }
        });
    }

    // Nouvelle méthode pour remplacer une prestation
    /**
     * Remplace une prestation par une autre dans les commandes.
     * 
     * @param oldBenefitId L'identifiant de la prestation à remplacer.
     * @param newBenefitId L'identifiant de la nouvelle prestation.
     * @returns Un Observable contenant la réponse de l'API.
     */
    replaceBenefit(oldBenefitId: string, newBenefitId: string): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/api/benefits/replaceBenefit`, { oldBenefitId, newBenefitId });
    }
    
    // méthode pour /benefit/:benefitId
    // getBenefitName(benefitId: string): Observable<any> {
    //     return this.http.get<any>(`${environment.apiUrl}/api/benefits/benefit/${benefitId}`);
    // }
}