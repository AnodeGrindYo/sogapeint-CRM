import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailCustomerComponent } from './order-detail-customer.component';

describe('OrderDetailCustomerComponent', () => {
  let component: OrderDetailCustomerComponent;
  let fixture: ComponentFixture<OrderDetailCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetailCustomerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderDetailCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
