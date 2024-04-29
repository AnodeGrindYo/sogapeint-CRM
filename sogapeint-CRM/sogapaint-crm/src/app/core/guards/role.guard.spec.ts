import { BehaviorSubject } from 'rxjs';

class MockAuthService {
    private currentUserSubject = new BehaviorSubject<any>({ userId: '123', role: 'Admin' });
    public get currentUserValue() {
        return this.currentUserSubject.value;
    }
    public setUser(user: any) {
        this.currentUserSubject.next(user);
    }
}

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, RouterStateSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthenticationService } from '../services/auth.service';

describe('RoleGuard', () => {
    let guard: RoleGuard;
    let router: Router;
    let authService: any;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            providers: [
                RoleGuard,
                { provide: AuthenticationService, useClass: MockAuthService }
            ]
        });

        guard = TestBed.inject(RoleGuard);
        router = TestBed.inject(Router);
        authService = TestBed.inject(AuthenticationService);
        spyOn(router, 'navigate');
    });

    function getMockSnapshot(url: string): RouterStateSnapshot {
      return { url } as RouterStateSnapshot;
  }

  it('should allow the authenticated user with correct role to access the route', () => {
      const routeMock: any = { data: { roles: ['Admin'] } };
      authService.setUser({ userId: '123', role: 'Admin' });
      expect(guard.canActivate(routeMock, getMockSnapshot('/somepath'))).toBeTrue();
  });

  it('should not allow the authenticated user with incorrect role to access the route', () => {
      authService.setUser({ userId: '123', role: 'User' });
      const routeMock: any = { data: { roles: ['Admin'] } };
      guard.canActivate(routeMock, getMockSnapshot('/somepath'));
      expect(router.navigate).toHaveBeenCalledWith([''], { queryParams: { returnUrl: '/somepath' } });
  });

  it('should not allow access if no user is authenticated', () => {
      authService.setUser(null);
      const routeMock: any = { data: { roles: ['Admin'] } };
      guard.canActivate(routeMock, getMockSnapshot('/somepath'));
      expect(router.navigate).toHaveBeenCalledWith([''], { queryParams: { returnUrl: '/somepath' } });
  });
});
