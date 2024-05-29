import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { KpiService } from '../../../core/services/kpi.service'; 
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { UserProfileService } from 'src/app/core/services/user.service';
import { Subject, takeUntil } from 'rxjs'


@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent implements OnInit, OnDestroy {
  percentage: number = 69;
  startDate: any;
  endDate: any;
  form: FormGroup;
  kpiModes = [
    'nb_lines_today',
    'nb_orders_from_last_month',
    'avg_order_amount'
  ];
  @Input() mode: string;
  currentUser: any;
  kpi_value: number;
  kpi_evolution_percent: number;
  kpi_title: string;
  kpi_subtitle: string;
  private ngUnsubscribe = new Subject<void>();
  
  
  constructor(
    private kpiService: KpiService,
    private modalService: NgbModal,
    private userProfileService: UserProfileService,
    private fb: FormBuilder
  ) { }
  
  ngOnInit(): void {
    this.currentUser = this.userProfileService.getCurrentUser();
    this.initSettingsForm();
    this.initKpi();
    this.onChanges();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  
  initKpi() {
    switch (this.mode) {
      case 'nb_lines_today':
        console.log('nb_lines_today');

        this.kpi_title = "Lignes aujourd'hui";
        
        // Créer les dates de début et de fin pour la journée en cours
        this.startDate = new Date();
        this.startDate.setHours(0, 0, 0, 0); // Minuit local
        
        this.endDate = new Date();
        this.endDate.setHours(23, 59, 59, 999); // Fin de la journée à 23:59:59 local
        
        // Convertir en chaîne sans décalage de fuseau horaire
        this.startDate = this.startDate.getFullYear() + '-' +
        ('0' + (this.startDate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + this.startDate.getDate()).slice(-2) + 'T00:00:00';
        
        this.endDate = this.endDate.getFullYear() + '-' +
        ('0' + (this.endDate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + this.endDate.getDate()).slice(-2) + 'T23:59:59';
        
        this.kpiService.getOrderAmount(this.currentUser.userId, this.startDate, this.endDate)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          console.log("data received: ", data);
          this.kpi_value = data.data.amount_current_period;
          this.kpi_evolution_percent = (data.data.amount_current_period - data.data.amount_last_period) / data.data.amount_last_period * 100;
        });
      break;
      case 'nb_orders_from_last_month':
        this.kpi_title = "Commandes ce mois-ci";

        // Créer les dates de début et de fin pour le mois en cours
        this.startDate = new Date();
        this.startDate.setDate(1); // Premier jour du mois
        this.startDate.setHours(0, 0, 0, 0); // Minuit local

        this.endDate = new Date();
        this.endDate.setHours(23, 59, 59, 999); // Fin de la journée à 23:59:59 local

        // Convertir en chaîne sans décalage de fuseau horaire
        this.startDate = this.startDate.getFullYear() + '-' +
        ('0' + (this.startDate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + this.startDate.getDate()).slice(-2) + 'T00:00:00';

        this.endDate = this.endDate.getFullYear() + '-' +
        ('0' + (this.endDate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + this.endDate.getDate()).slice(-2) + 'T23:59:59';

        this.kpiService.getOrdersAmountThisMonth(this.currentUser.userId).subscribe((data: any) => {
          console.log("data received: ", data);
          this.kpi_value = data.data.amount_this_month;
          this.kpi_evolution_percent = (data.data.amount_this_month - data.data.amount_last_month) / data.data.amount_last_month * 100;
        });
      console.log('nb_orders_from_last_month');
      break;
      case 'avg_order_amount':
        this.kpi_title = "Montant moy. des cmd.";

        // Créer les dates de début et de fin pour le mois en cours
        this.startDate = new Date();
        this.startDate.setDate(1); // Premier jour du mois
        this.startDate.setHours(0, 0, 0, 0); // Minuit local

        this.endDate = new Date();
        this.endDate.setHours(23, 59, 59, 999); // Fin de la journée à 23:59:59 local

        // Convertir en chaîne sans décalage de fuseau horaire
        this.startDate = this.startDate.getFullYear() + '-' +
        ('0' + (this.startDate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + this.startDate.getDate()).slice(-2) + 'T00:00:00';

        this.endDate = this.endDate.getFullYear() + '-' +
        ('0' + (this.endDate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + this.endDate.getDate()).slice(-2) + 'T23:59:59';

        this.kpiService.getAverageOrderAmount(this.currentUser.userId, this.startDate, this.endDate).subscribe((data: any) => {
          console.log("data received: ", data);
          this.kpi_value = data.data.average_amount_current_period;
          this.kpi_evolution_percent = (data.data.average_amount_current_period - data.data.average_amount_last_period) / data.data.average_amount_last_period * 100;
        });
      console.log('avg_order_amount');
      break;
    }
  }
  
  initSettingsForm() {
    // Initialiser ce putain de formulaire
    this.form = this.fb.group({
      preset: [''],
      startDate: [''],
      endDate: ['']
    });
    
  }
  
  openSettingsModal(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log(reason);
    });
  }
  
  onChanges(): void {
    this.form.get('preset').valueChanges.subscribe(val => {
      this.onPresetChange(val);
    });
  }
  
  onPresetChange(preset: string) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    switch (preset) {
      case 'week':
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      this.form.patchValue({
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      });
      break;
      case 'month':
      this.form.patchValue({
        startDate: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
        endDate: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
      });
      break;
      case 'quarter':
      const startMonth = currentMonth - (currentMonth % 3);
      this.form.patchValue({
        startDate: new Date(currentYear, startMonth, 1).toISOString().split('T')[0],
        endDate: new Date(currentYear, startMonth + 3, 0).toISOString().split('T')[0]
      });
      break;
      case 'year':
      this.form.patchValue({
        startDate: new Date(currentYear, 0, 1).toISOString().split('T')[0],
        endDate: new Date(currentYear, 11, 31).toISOString().split('T')[0]
      });
      break;
    }
  }
  
  
  
  saveSettings() {
    // On implémentera la logique bientôt...
    console.log('Settings saved:', this.startDate, this.endDate);
  }

  isNan(value: any) {
    return isNaN(value);
  }
  
}
