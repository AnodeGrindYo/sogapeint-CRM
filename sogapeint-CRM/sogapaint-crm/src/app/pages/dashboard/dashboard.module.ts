import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { KpiCardComponent } from './kpi-card/kpi-card.component';
import { ChartCardComponent } from './chart-card/chart-card.component';
import { TableCardComponent } from './table-card/table-card.component';
import { MapCardComponent } from './map-card/map-card.component';
import { TimelineCardComponent } from './timeline-card/timeline-card.component';
import { StatSummaryCardComponent } from './stat-summary-card/stat-summary-card.component';
import { ChatCardComponent } from './chat-card/chat-card.component';
import { PickerCardComponent } from './picker-card/picker-card.component';
import { UiModule } from 'src/app/shared/ui/ui.module';
// import { FormsModule } from '@angular/forms';
import { GridsterModule } from 'angular-gridster2';
import {GridsterComponent, GridsterItemComponent} from 'angular-gridster2';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DonutCardComponent } from './donut-card/donut-card.component';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { InvoicesManagementComponent } from './invoices-management/invoices-management.component';
// Import NgbTooltipModule
// import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DashboardComponent, 
    KpiCardComponent,
    ChartCardComponent,
    TableCardComponent,
    MapCardComponent,
    TimelineCardComponent,
    StatSummaryCardComponent,
    ChatCardComponent,
    PickerCardComponent,
    DonutCardComponent,
    InvoicesManagementComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    UiModule,
    ReactiveFormsModule,
    // FormsModule,
    GridsterModule,
    GridsterComponent,
    GridsterItemComponent,
    NgApexchartsModule, 
    EmojiModule,
    PickerComponent,
    // InvoicesManagementComponent,
    // NgbTooltipModule    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }

