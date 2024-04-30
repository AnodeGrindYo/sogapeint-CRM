import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderUpdateCocontractorComponent } from './order-update-cocontractor.component';

describe('OrderUpdateCocontractorComponent', () => {
  let component: OrderUpdateCocontractorComponent;
  let fixture: ComponentFixture<OrderUpdateCocontractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderUpdateCocontractorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderUpdateCocontractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
