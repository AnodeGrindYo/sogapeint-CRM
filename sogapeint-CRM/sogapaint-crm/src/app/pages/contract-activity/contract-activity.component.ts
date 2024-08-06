import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ContractService } from '../../core/services/contract.service';
import { UserProfileService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-contract-activity',
  templateUrl: './contract-activity.component.html',
  styleUrls: ['./contract-activity.component.scss', '../order-detail/order-detail.component.scss']
})
export class ContractActivityComponent implements OnInit {
  @Input() contractId: string;
  @Input() userId: string;
  @Input() isReadOnly: boolean = false;
  activities: any[] = [];
  selectedType: string = 'Observation';
  placeholderText: string = 'Ajouter une activité...';
  messages: { text: string, type: string }[] = [];
  particles = Array(30).fill(0);
  @ViewChild('activityInput') activityInput: ElementRef;
  currentUser: any;

  constructor(
    private contractService: ContractService,
    private userProfileService: UserProfileService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.currentUser = this.userProfileService.getCurrentUser();
    if (this.contractId) {
      this.loadActivities();
    }
    this.updatePlaceholder('Observation');

    if (this.isComanagerOrSuperManager()) {
      this.isReadOnly = true;
    }
  }

  isAdminOrSuperAdmin(): boolean {
    const result = this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'superAdmin');
    // console.log('isAdminOrSuperAdmin:', result);
    return result;
  }

  isComanagerOrSuperManager(): boolean {
    const result = this.currentUser && (this.currentUser.role === 'comanager' || this.currentUser.role === 'supermanager');
    // console.log('isComanagerOrSuperManager:', result);
    return result;
  }

  loadActivities() {
    const observations = this.contractService.getObservations(this.contractId).pipe(catchError(() => of([])));
    const incidents = this.contractService.getIncidents(this.contractId).pipe(catchError(() => of([])));
    forkJoin({
      observations: observations,
      incidents: incidents
    }).pipe(
      map(({ observations, incidents }) => {
        let formattedObservations = [];
        let formattedIncidents = [];
        if (observations && observations.length !== 0 && observations !== undefined && observations !== null) {
          formattedObservations = observations.map(o => ({ ...o, type: 'Observation' }));
        }
        if (incidents && incidents.length !== 0 && incidents !== undefined && incidents !== null) {
          formattedIncidents = incidents.map(i => ({ ...i, type: 'Incident' }));
        }
        return [...formattedObservations, ...formattedIncidents]
          .sort((a, b) => new Date(b.dateAdd).getTime() - new Date(a.dateAdd).getTime());
      })
    ).subscribe(combinedActivities => {
      this.activities = combinedActivities;
    });
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
    const dateAdd = dateToConvert.toISOString();
    if (type === 'Observation') {
      this.contractService.addObservation(this.contractId, comment, dateAdd, this.userId).subscribe(() => {
        this.loadActivities();
        this.addMessage('Observation ajoutée avec succès', 'success');
      }, () => {
        this.addMessage('Erreur lors de l\'ajout de l\'observation', 'error');
      });
    } else if (type === 'Incident') {
      this.contractService.addIncident(this.contractId, comment, dateAdd, this.userId).subscribe(() => {
        this.loadActivities();
        this.addMessage('Incident ajouté avec succès', 'success');
      }, () => {
        this.addMessage('Erreur lors de l\'ajout de l\'incident', 'error');
      });
    }
    this.activityInput.nativeElement.value = '';
    this.updatePlaceholder(type);
  }

  deleteActivity(activityId: string, type: string, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (type === 'Observation') {
      this.contractService.deleteObservation(this.contractId, activityId).subscribe(() => {
        this.loadActivities();
        this.addMessage('Observation supprimée avec succès', 'success');
      }, () => {
        this.addMessage('Erreur lors de la suppression de l\'observation', 'error');
      });
    } else if (type === 'Incident') {
      this.contractService.deleteIncident(this.contractId, activityId).subscribe(() => {
        this.loadActivities();
        this.addMessage('Incident supprimé avec succès', 'success');
      }, () => {
        this.addMessage('Erreur lors de la suppression de l\'incident', 'error');
      });
    }
  }

  toggleProcessed(activity: any) {
    const newProcessedStatus = !activity.processed;
    if (activity.type === 'Observation') {
      this.contractService.updateObservationProcessedStatus(activity._id, newProcessedStatus).subscribe(() => {
        activity.processed = newProcessedStatus;
        this.addMessage('Statut de l\'observation mis à jour avec succès', 'success');
      }, () => {
        this.addMessage('Erreur lors de la mise à jour du statut de l\'observation', 'error');
      });
    } else if (activity.type === 'Incident') {
      this.contractService.updateIncidentProcessedStatus(activity._id, newProcessedStatus).subscribe(() => {
        activity.processed = newProcessedStatus;
        this.addMessage('Statut de l\'incident mis à jour avec succès', 'success');
      }, () => {
        this.addMessage('Erreur lors de la mise à jour du statut de l\'incident', 'error');
      });
    }
  }

  triggerParticle(event: MouseEvent) {
    const button = event.target as HTMLElement;
    for (let i = 0; i < 20; i++) {
      const particle = this.renderer.createElement('span');
      this.renderer.addClass(particle, 'particle');
      this.renderer.setStyle(particle, 'left', `${event.clientX - button.getBoundingClientRect().left}px`);
      this.renderer.setStyle(particle, 'top', `${event.clientY - button.getBoundingClientRect().top}px`);
      this.renderer.appendChild(button, particle);
      setTimeout(() => {
        this.renderer.removeChild(button, particle);
      }, 500);
    }
  }

  addMessage(text: string, type: string) {
    const message = { text, type };
    this.messages.push(message);
    if (type === 'success') {
      setTimeout(() => {
        this.removeMessage(message);
      }, 3000);
    }
  }

  removeMessage(message: { text: string, type: string }) {
    this.messages = this.messages.filter(msg => msg !== message);
  }
}
