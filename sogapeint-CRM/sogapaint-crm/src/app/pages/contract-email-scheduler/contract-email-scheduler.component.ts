// /pages/contract-email-scheduler.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailSchedulerService } from '../../core/services/email-scheduler.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-contract-email-scheduler',
  templateUrl: './contract-email-scheduler.component.html',
  styleUrls: ['./contract-email-scheduler.component.scss', '../order-detail/order-detail.component.scss'],
  providers: [DatePipe]
})
export class ContractEmailSchedulerComponent implements OnInit {
  @Input() contractId: string;
  emailScheduleForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  emailSchedule: any;

  constructor(
    private fb: FormBuilder,
    private emailSchedulerService: EmailSchedulerService,
    private datePipe: DatePipe
  ) {
    this.emailScheduleForm = this.fb.group({
      nextEmailDate: ['', Validators.required],
      interval: [3, [Validators.required, Validators.min(1)]],
      enabled: [false]
    });
  }

  ngOnInit(): void {
    console.log('Contract ID:', this.contractId);
    this.getEmailSchedule();
  }

  getEmailSchedule(): void {
    this.isLoading = true;
    this.emailSchedulerService.getEmailSchedule(this.contractId).subscribe(
      (data) => {
        if (data) {
          this.emailSchedule = data; // Stocker les données récupérées
          this.emailScheduleForm.patchValue({
            nextEmailDate: this.transformDate(data.nextEmailDate),
            interval: data.interval,
            enabled: data.enabled
          });
        } else {
          this.emailSchedule = {
            nextEmailDate: null,
            interval: 3,
            enabled: false
          };
        }
        this.isLoading = false;
        console.log('Planning des emails:', data);
      },
      (error) => {
        console.error('Erreur lors de la récupération du planning des emails:', error);
        this.errorMessage = 'Erreur lors de la récupération du planning des emails.';
        this.isLoading = false;
      }
    );
  }

  transformDate(date: string): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  updateEmailSchedule(): void {
    if (this.emailScheduleForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.emailSchedulerService.updateEmailSchedule(this.contractId, this.emailScheduleForm.value).subscribe(
      (response) => {
        console.log('Planning des emails mis à jour:', response);
        this.successMessage = 'Planning des emails mis à jour avec succès.';
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du planning des emails:', error);
        this.errorMessage = 'Erreur lors de la mise à jour du planning des emails.';
        this.isLoading = false;
      }
    );
  }
}
