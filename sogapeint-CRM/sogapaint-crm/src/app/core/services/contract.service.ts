import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, Subject, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from './auth.service';
import { Inject } from '@angular/core';

/**
* Service pour la gestion des contrats.
*
* Ce service fournit des fonctionnalités pour interagir avec les données des contrats,
* telles que l'obtention de la liste des contrats et la recherche de contrats.
*/
@Injectable({
    providedIn: 'root'
})
export class ContractService {
    private authToken: string = this.authService.getToken();
    
    /**
    * Constructeur du service ContractService.
    * @param http HttpClient pour les requêtes HTTP.
    */
    constructor(
        private http: HttpClient,
        @Inject(AuthenticationService) private authService: AuthenticationService 
        ) {}

        /**
         * obtient tous les contrats (endpoint /api/contracts/contracts)
         * 
         * Envoie une requête GET pour obtenir une liste de tous les contrats.
         * @returns Un Observable contenant un tableau de contrats.
         */
        getContracts(): Observable<any[]> {
            return this.http.get<any[]>(`${environment.apiUrl}/api/contracts/contracts`).pipe(
                map(contracts => contracts.map(contract => {
                    // Initialiser invoiceStatus s'il est absent
                    if (!contract.invoiceStatus) {
                      contract.invoiceStatus = 'pending';
                    }
                    return contract;
                  }))
                );
        }

        /**
         * obtient les contrats par mois (endpoint /api/contracts/contractsByMonth)
         * 
         * Envoie une requête GET pour obtenir une liste de tous les contrats par mois.
         * @param month, le mois
         * @returns Un Observable contenant un tableau de contrats.
         * */
        getContractsByMonth(month: number): Observable<any[]> {
            return this.http.get<any[]>(`${environment.apiUrl}/api/contracts/contractsByMonth`, { params: { month: month.toString() } });
        }
        
        
        /**
        * Recherche des contrats.
        *
        * Envoie une requête GET avec un paramètre de requête pour rechercher des contrats.
        * @param query La chaîne de caractères pour filtrer les contrats.
        * @returns Un Observable contenant un tableau de contrats filtrés.
        */
        searchContracts(query: string): Observable<any[]> {
            return this.http.get<any[]>(`${environment.apiUrl}/api/contracts/contract/search`, { params: { q: query } });
        }
        
        /**
        * Récupère un contrat par son identifiant.
        *
        * Envoie une requête GET pour obtenir un contrat par son identifiant.
        * @param id L'identifiant du contrat.
        * @returns Un Observable contenant le contrat.
        */
        getContractById(contractId: string): Observable<any> {
            return this.http.get<any>(`${environment.apiUrl}/api/contracts/contract/${contractId}`);
        }
        
        /**
        * Crée un nouveau contrat.
        * 
        * Envoie une requête POST pour créer un nouveau contrat avec les données fournies.
        * @param contractData Les données du contrat à créer.
        * @returns Un Observable contenant la réponse du serveur.
        */
        addContract(contractData: any): Observable<any> {
            return this.http.post<any>(`${environment.apiUrl}/api/contracts/contract`, contractData);
        }

        /**
         * Supprime un contrat par son identifiant.
         * 
         * Envoie une requête DELETE pour supprimer un contrat par son identifiant.
         * @param contractId L'identifiant du contrat à supprimer.
         * @returns Un Observable contenant la réponse du serveur.
         */
        deleteContract(contractId: string): Observable<any> {
            return this.http.delete<any>(`${environment.apiUrl}/api/contracts/contract/${contractId}`);
        }
        
        /**
        * Met à jour un contrat existant.
        * 
        * Envoie une requête PUT pour mettre à jour un contrat existant avec les données fournies.
        * @param contractId L'identifiant du contrat à mettre à jour.
        * @param contractData Les données du contrat à mettre à jour.
        * @returns Un Observable contenant la réponse du serveur.
        */ 
        updateContract(contractId: string, contractData: any): Observable<any> {
            return this.http.put<any>(`${environment.apiUrl}/api/contracts/contract/${contractId}`, contractData);
        }
  
        
        /**
        * Récupère les contrats en cours
        * 
        * Envoie une requête GET pour obtenir une liste de tous les contrats en cours.
        * @returns Un Observable contenant un tableau de contrats.
        */
        getOnGoingContracts(): Observable<any[]> {
            return this.http.get<any[]>(`${environment.apiUrl}/api/contracts/onGoingContracts`);
        }
        
        /**
        * Récupère les contrats qui ne sont pas en cours
        * 
        * Envoie une requête GET pour obtenir une liste de tous les contrats quine sont pas en cours.
        * @returns Un Observable contenant un tableau de contrats.
        */
        getNotOnGoingContracts(): Observable<any[]> {
            return this.http.get<any[]>(`${environment.apiUrl}/api/contracts/notOnGoingContracts`);
        }
        
        /**
        * Récupère les contrats en cours sous forme de stream à /streamOnGoingContracts
        * 
        * Envoie une requête GET pour obtenir une liste de tous les contrats en cours sous forme de stream.
        * @returns Un Observable contenant un tableau de contrats.
        */
        // getOnGoingContractsStream(): Observable<any[]> {
        //     return this.http.get<any[]>(`${environment.apiUrl}/api/contracts/streamOnGoingContracts`);
        // }
        getOnGoingContractsStream(): Observable<any[]> {
            const contractsSubject = new Subject<any[]>();
            
            const eventSource = new EventSource(`${environment.apiUrl}/api/contracts/streamOnGoingContracts`);
            eventSource.onmessage = event => {
                contractsSubject.next(JSON.parse(event.data));
            };
            eventSource.onerror = error => {
                contractsSubject.error(error);
                eventSource.close();
            };
            
            return contractsSubject.asObservable();
        }
        
        /**
        * Récupère les contrats qui ne sont pas en cours sous forme de stream à /streamNotOnGoingContracts
        * 
        * Envoie une requête GET pour obtenir une liste de tous les contrats qui ne sont pas en cours sous forme de stream.
        * @returns Un Observable contenant un tableau de contrats.
        */
        // getNotOnGoingContractsStream(): Observable<any[]> {
        //     return this.http.get<any[]>(`${environment.apiUrl}/api/contracts/streamNotOnGoingContracts`);
        // }
        getNotOnGoingContractsStream(): Observable<any[]> {
            const contractsSubject = new Subject<any[]>();
            
            const eventSource = new EventSource(`${environment.apiUrl}/api/contracts/streamNotOnGoingContracts`);
            eventSource.onmessage = event => {
                contractsSubject.next(JSON.parse(event.data));
            };
            eventSource.onerror = error => {
                contractsSubject.error(error);
                eventSource.close();
            };
            
            return contractsSubject.asObservable();
        }
        
        public closeEventSource(eventSource: EventSource) {
            if (eventSource) {
                eventSource.close();
            }
        }
        
        /**
        * Méthode pour '/internalNumbers' : Récupère les numéros internes des contrats
        * 
        * Envoie une requête GET pour obtenir une liste de tous les numéros internes des contrats.
        * @returns Un Observable contenant un tableau de numéros internes des contrats.
        */
        getInternalNumbers(): Observable<any[]> {
            return this.http.get<any[]>(`${environment.apiUrl}/api/contracts/internalNumbers`);
        }
        
        /**
        * Téléverse des fichiers pour un contrat donné.
        * 
        * Utilise FormData pour construire une requête multipart/form-data qui est la 
        * requête standard pour envoyer des fichiers via HTTP. Chaque fichier est ajouté 
        * à cette requête avec la clé 'files'.
        * 
        * @param contractId L'identifiant unique du contrat auquel les fichiers sont associés.
        * @param files Les fichiers à téléverser.
        * @param folderName (optionel) Le nom du dossier dans lequel les fichiers seront téléversés.
        * @returns Un Observable de l'événement Http qui inclut la réponse du serveur ou des erreurs.
        */
        uploadFiles(contractId: string, files: File[], folderName?: string): Observable<HttpEvent<any>> {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file, file.name);
                formData.append('contractId', contractId);
            });
        
            const url = `${environment.apiUrl}/api/files/upload` + (folderName ? `?folderName=${folderName}` : '');
            const req = new HttpRequest('POST', url, formData, {
                reportProgress: true,
                responseType: 'json'
            });
        
            return this.http.request(req);
        }
        
          

        /**
         * Supprime un fichier d'un contrat
         * 
         * @param fileId, l'id du fichier
         * @param contractId, l'id du contrat
         * @returns un Observable contenant la réponse du serveur
         */
        deleteFile(fileId: string, contractId: string): Observable<any>{
            return this.http.delete<any>(`${environment.apiUrl}/api/files/deleteFile`, { params: { contractId: contractId, fileId: fileId } });
        }

        /**
         * Met à jour les données additionnelles d'un fichier
         * 
         * @param fileId, l'id du fichier
         * @param updateData, les données à mettre à jour
         * @returns un Observable contenant la réponse du serveur
         */
        updateFile(fileId: string, updateData: any): Observable<any> {
            const body = { fileId, updateData };
            return this.http.put<any>(`${environment.apiUrl}/api/files/updateFile`, body);
          }

        /** 
         * Permet de récupérer un fichier par son id. La route est ${environment.apiUrl}/api/contracts/download
         * et les paramètres sont le contractId et le fileId
         * @param fileId, l'id du fichier
         * @param contractId, l'id du contrat
         * @returns un Observable contenant le fichier
         **/
        getFile(fileId: string, contractId: string): Observable<any> {
            // return this.http.get<any>(`${environment.apiUrl}/api/files/download`, { params: { fileId: fileId, contractId: contractId }, responseType: 'blob' as 'json' });
            const options = {
                params: { fileId: fileId, contractId: contractId },
                responseType: 'blob' as 'json',
                headers: new HttpHeaders({
                    'Access-Control-Allow-Origin': '*',
                })
            };
            return this.http.get<Blob>(`${environment.apiUrl}/api/files/download`, options);
        }

        /**
         * Permet d'obtenir le nom d'une prestation (benefit) par son id
         * @param benefitId, l'id de la prestation
         * @returns Un observable contenant le nom de la prestation
         */
        getBenefitById(benefitId: string): Observable<any>{
            return this.http.get<any>(`${environment.apiUrl}/api/benefits/benefit/${benefitId}`);
        }

        /**
         * Permet d'ajouter une observation à un contrat
         * 
         * @param contractId, l'id du contrat
         * @param observation, l'observation à ajouter
         * @returns Un observable contenant la réponse du serveur
         */
        addObservation(contractId: string, observation: string, dateAdd: string, user: string): Observable<any>{
            return this.http.post<any>(`${environment.apiUrl}/api/contracts/observation`, { comment: observation, contractId: contractId, dateAdd: dateAdd, user: user});
        }

        /**
         * Permet de supprimer une observation d'un contrat
         * 
         * @param contractId, l'id du contrat
         * @param observationId, l'id de l'observation
         * @returns Un observable contenant la réponse du serveur
         */
        deleteObservation(contractId: string, observationId: string): Observable<any>{
            return this.http.delete<any>(`${environment.apiUrl}/api/contracts/observation/${observationId}`);
        }

        /**
         * Permet de récupérer les observations d'un contrat
         * 
         * @param contractId, l'id du contrat
         * @returns Un observable contenant les observations du contrat
         */
        getObservations(contractId: string): Observable<any[]>{
            return this.http.get<any[]>(`${environment.apiUrl}/api/contracts/observations/${contractId}`);
        }

        /**
         * Permet d'ajouter un incident à un contrat
         * 
         * @param contractId, l'id du contrat
         * @param incident, l'incident à ajouter
         * @returns Un observable contenant la réponse du serveur
         */
        addIncident(contractId: string, incident: string, dateAdd: string, userId: string): Observable<any>{
            return this.http.post<any>(`${environment.apiUrl}/api/contracts/incident`, { comment: incident, contractId: contractId, dateAdd: dateAdd, user: userId});
        }

        /**
         * Permet de supprimer un incident d'un contrat
         * 
         * @param contractId, l'id du contrat
         * @param incidentId, l'id de l'incident
         * @returns Un observable contenant la réponse du serveur
         */
        deleteIncident(contractId: string, incidentId: string): Observable<any>{
            return this.http.delete<any>(`${environment.apiUrl}/api/contracts/incident/${incidentId}`);
        }

        /**
         * Permet de récupérer les incidents d'un contrat
         * 
         * @param contractId, l'id du contrat
         * @returns Un observable contenant les incidents du contrat
         */
        getIncidents(contractId: string): Observable<any[]>{
            return this.http.get<any[]>(`${environment.apiUrl}/api/contracts/incidents/${contractId}`);
        }
    }
