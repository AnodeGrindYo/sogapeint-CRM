import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndlessAscensionComponent } from './endless-ascension.component';

describe('EndlessAscensionComponent', () => {
  let component: EndlessAscensionComponent;
  let fixture: ComponentFixture<EndlessAscensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndlessAscensionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EndlessAscensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
