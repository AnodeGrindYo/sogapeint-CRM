import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFilesManagementComponent } from './order-files-management.component';

describe('OrderFilesManagementComponent', () => {
  let component: OrderFilesManagementComponent;
  let fixture: ComponentFixture<OrderFilesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderFilesManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderFilesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
