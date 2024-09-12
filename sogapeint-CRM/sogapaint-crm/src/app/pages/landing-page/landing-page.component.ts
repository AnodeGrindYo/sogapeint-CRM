import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfileService } from '../../core/services/user.service';
import { AuthenticationService } from '../../core/services/auth.service';
import { ToastService } from "angular-toastify";
import { ToastrService } from "ngx-toastr";
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit{
  currentUser: any;
  
    constructor(
      private router: Router,
      private userProfileService: UserProfileService,
      private authenticationService: AuthenticationService,
      private toastService: ToastService,
      private toastr: ToastrService
    ) { }
  
    ngOnInit(): void {
      this.currentUser = this.userProfileService.getCurrentUser();
      console.log(this.currentUser);
      console.log(this.currentUser.role);
      this.toastr.success('Bonjour ' + this.currentUser.firstName + ' !', 'Bienvenue');
      // si le role de l'utilisateur est admin ou superAdmin, on le redirige vers /dashboard au bout de 15 secondes
      const delay = 5000;
      if(this.currentUser.role === 'admin' || this.currentUser.role === 'superAdmin'){
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, delay);
      }
      // sinon, on redirige vers /manageOrders
      else{
        setTimeout(() => {
          this.router.navigate(['/manageOrders']);
        }, delay);
      }

    }

}
