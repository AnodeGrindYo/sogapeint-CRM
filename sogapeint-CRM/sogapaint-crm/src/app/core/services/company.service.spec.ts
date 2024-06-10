import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CompanyService } from './company.service';
import { environment } from '../../../environments/environment';
import { EventService } from './event.service';

describe('CompanyService', () => {
  let service: CompanyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CompanyService]
    });

    service = TestBed.inject(CompanyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCompanies should return a list of companies', () => {
    const dummyCompanies = [
      { name: 'Company 1', id: 1 },
      { name: 'Company 2', id: 2 }
    ];

    service.getCompanies().subscribe(companies => {
      expect(companies.length).toBe(2);
      expect(companies).toEqual(dummyCompanies);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/companies/companies`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyCompanies);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // searchCompanies
  xit('searchCompanies should return a list of companies', () => {
    const dummyCompanies = [
      { name: 'Company 1', id: 1 },
      { name: 'Company 2', id: 2 }
    ];

    service.searchCompanies('Company').subscribe(companies => {
      expect(companies.length).toBe(2);
      expect(companies).toEqual(dummyCompanies);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/companies/search?q=Company`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyCompanies);
  });

});