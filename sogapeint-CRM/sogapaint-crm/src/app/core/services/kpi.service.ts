import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class KpiService {
    private kpiUrlPart = '/api/kpi';
    
    constructor(private http: HttpClient) {}
    
    getTotalOrders(): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/totalOrders`);
    }
    
    getOrdersByDate(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/ordersByDate`, { params: { startDate, endDate } });
    }
    
    getActiveOrders(): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/activeOrders`);
    }
    
    getActiveOrdersByDate(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/activeOrdersByDate`, { params: { startDate, endDate } });
    }
    
    getInactiveOrders(): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/inactiveOrders`);
    }
    
    getInactiveOrdersByDate(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/inactiveOrdersByDate`, { params: { startDate, endDate } });
    }
    
    getCompletedOrders(): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/completedOrders`);
    }
    
    getCompletedOrdersByDate(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/completedOrdersByDate`, { params: { startDate, endDate } });
    }
    
    getAverageExecutionTime(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/averageExecutionTime`, { params: { startDate, endDate } });
    }
    
    // Continuez à ajouter des méthodes pour chaque endpoint...
    
    getTotalRevenue(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/totalRevenue`, { params: { startDate, endDate } });
    }
    
    getAverageRevenue(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/averageRevenue`, { params: { startDate, endDate } });
    }
    
    getOrdersByService(): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/ordersByService`);
    }
    
    getOrdersByServiceByDate(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/ordersByServiceByDate`, { params: { startDate, endDate } });
    }
    
    getOrdersWithIncidents(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/ordersWithIncidents`, { params: { startDate, endDate } });
    }
    
    getMailResponseRate(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/mailResponseRate`, { params: { startDate, endDate } });
    }
    
    getContributorsEfficiency(): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/contributorsEfficiency`);
    }
    
    getOccupationRate(): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/occupationRate`);
    }
    
    getAverageBillingAmount(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/averageBillingAmount`, { params: { startDate, endDate } });
    }
    
    getAverageExternalContributorPaymentDelay(): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/averageExternalContributorPaymentDelay`);
    }
    
    getOrdersStatusDistribution(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/ordersStatusDistribution`, { params: { startDate, endDate } });
    }
    
    getCustomerRenewalRate(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}${this.kpiUrlPart}/customerRenewalRate`, { params: { startDate, endDate } });
    }

    getOrderAmount(userId: string, dateStart: string, dateEnd: string): Observable<any> {
        // Création des paramètres HTTP
        const params = new HttpParams()
        .set('userId', userId)
        .set('dateStart', dateStart)
        .set('dateEnd', dateEnd);

        // Appel HTTP GET
        return this.http.get<any[]>(`${environment.apiUrl}${this.kpiUrlPart}/order-amount`, { params });
    }

    getOrdersAmountThisMonth(userId: string): Observable<any> {
        // Création des paramètres HTTP
        const params = new HttpParams()
        .set('userId', userId);

        // Appel HTTP GET
        return this.http.get<any[]>(`${environment.apiUrl}${this.kpiUrlPart}/order-amount-this-month`, { params });
    }

    getAverageOrderAmount(userId: string, dateStart: string, dateEnd: string): Observable<any> {
        // Création des paramètres HTTP
        const params = new HttpParams()
        .set('userId', userId)
        .set('dateStart', dateStart)
        .set('dateEnd', dateEnd);

        // Appel HTTP GET
        return this.http.get<any[]>(`${environment.apiUrl}${this.kpiUrlPart}/average-order-amount`, { params });
    }
    
}
