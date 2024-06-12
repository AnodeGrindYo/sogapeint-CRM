import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractEmailSchedulerComponent } from './contract-email-scheduler.component';

describe('ContractEmailSchedulerComponent', () => {
  let component: ContractEmailSchedulerComponent;
  let fixture: ComponentFixture<ContractEmailSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractEmailSchedulerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContractEmailSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
