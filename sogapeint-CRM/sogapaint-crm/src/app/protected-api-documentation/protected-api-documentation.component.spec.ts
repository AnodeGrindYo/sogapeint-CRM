import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedApiDocumentationComponent } from './protected-api-documentation.component';

describe('ProtectedApiDocumentationComponent', () => {
  let component: ProtectedApiDocumentationComponent;
  let fixture: ComponentFixture<ProtectedApiDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtectedApiDocumentationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProtectedApiDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
