import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Observable, combineLatest, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ContractService } from '../../core/services/contract.service';
import { UserProfileService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-contract-activity',
  templateUrl: './contract-activity.component.html',
  styleUrls: ['./contract-activity.component.scss']
})
export class ContractActivityComponent implements OnInit {
  @Input() contractId: string;
  @Input() userId: string;
  @Input() isReadOnly: boolean = false;
  activities: any[] = [];
  selectedType: string = 'Observation';
  placeholderText: string = 'Ajouter une activité...';
  @ViewChild('activityInput') activityInput: ElementRef;
  
  constructor(
    private contractService: ContractService,
    private userProfileService: UserProfileService
    ) {}
  
  ngOnInit() {
    if (this.contractId) {
      this.loadActivities();
    }
    console.log("userId", this.userId);
    console.log("contractId", this.contractId);
    this.updatePlaceholder('Observation');
  }
  

  loadActivities() {
    const observations = this.contractService.getObservations(this.contractId).pipe(catchError(() => of([])));
    const incidents = this.contractService.getIncidents(this.contractId).pipe(catchError(() => of([])));
    console.log("observations", observations);
    console.log("incidents", incidents);
    forkJoin({
      observations: observations,
      incidents: incidents
    }).pipe(
      map(({ observations, incidents }) => {
        let formattedObservations = [];
        let formattedIncidents = [];
        if (observations && observations.length !== 0 && observations !== undefined && observations !== null) {
          formattedObservations = observations.map(o => ({...o, type: 'Observation'}));
        } 
        if (incidents && incidents.length !== 0 && incidents !== undefined && incidents !== null) {
          formattedIncidents = incidents.map(i => ({...i, type: 'Incident'}));
        } 
        return [...formattedObservations, ...formattedIncidents]
        .sort((a, b) => new Date(b.dateAdd).getTime() - new Date(a.dateAdd).getTime());
      })
      ).subscribe(combinedActivities => {
        this.activities = combinedActivities;
        console.log("combinedActivities", combinedActivities);
      });
    }

    onTypeChange() {
      this.placeholderText = this.selectedType === 'Observation' 
        ? 'Ajouter une observation...' 
        : 'Ajouter un incident...';
    }

    updatePlaceholder(type: string) {
      if (type === 'Observation') {
        this.placeholderText = 'Ajouter une observation...';
      } else if (type === 'Incident') {
        this.placeholderText = 'Ajouter un incident...';
      }
    }
    
    addActivity(comment: string, type: string) {
      const dateToConvert = new Date();
      // convertit la date au format 2022-01-04T06:51:13.464+00:00
      const dateAdd = dateToConvert.toISOString();
      if (type === 'Observation') {
        this.contractService.addObservation(this.contractId, comment, dateAdd, this.userId).subscribe(() => {
          this.loadActivities();
        });
      } else if (type === 'Incident') {
        this.contractService.addIncident(this.contractId, comment, dateAdd, this.userId).subscribe(() => {
          this.loadActivities();
        });
      }
      this.activityInput.nativeElement.value = '';
      this.updatePlaceholder(type);
    }
    
    deleteActivity(activityId: string, type: string, event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
      console.log("activityId", activityId);
      if (type === 'Observation') {
        this.contractService.deleteObservation(this.contractId, activityId).subscribe(() => {
          this.loadActivities();
        });
      } else if (type === 'Incident') {
        this.contractService.deleteIncident(this.contractId, activityId).subscribe(() => {
          this.loadActivities();
        });
      }
    }
  }
