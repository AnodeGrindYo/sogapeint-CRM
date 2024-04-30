import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailCocontractorComponent } from './order-detail-cocontractor.component';

describe('OrderDetailCocontractorComponent', () => {
  let component: OrderDetailCocontractorComponent;
  let fixture: ComponentFixture<OrderDetailCocontractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetailCocontractorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderDetailCocontractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
