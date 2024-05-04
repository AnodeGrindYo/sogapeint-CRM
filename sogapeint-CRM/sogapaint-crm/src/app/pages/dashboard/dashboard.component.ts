import { Component, OnInit } from '@angular/core';
import { UserProfileService } from 'src/app/core/services/user.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
  breadCrumbItems: Array<{ label: string; url?: string; active?: boolean }> = [];
  pageTitle: string = 'Dashboard';
  
  
  constructor(
    private userProfileService: UserProfileService
  ) {
    
  }
  
  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Sogapeint' }, { label: this.pageTitle, active: true }];
  }
  
  
}
