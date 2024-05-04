import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../../core/services/kpi.service'; 
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';


@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent implements OnInit {
  percentage: number = 69;
  startDate: string;
  endDate: string;
  form: FormGroup;


  constructor(
    private kpiService: KpiService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) { }
  
  ngOnInit(): void {
    this.initSettingsForm();
    this.onChanges();
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
  
}
