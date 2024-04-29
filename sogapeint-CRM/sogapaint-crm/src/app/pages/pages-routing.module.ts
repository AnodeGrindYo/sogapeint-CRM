import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { ManageCompaniesComponent } from './manage-companies/manage-companies.component';
import { CompanyDetailComponent } from './company-detail/company-detail.component';
import { CompanyUpdateComponent } from './company-update/company-update.component';
import { CompanyCreateComponent } from './company-create/company-create.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { FAQComponent } from './faq/faq.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardFakeComponent } from './dashboard-fake/dashboard-fake.component';
import { OrderFormComponent } from './order-form/order-form.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { ManageOrdersComponent } from './manage-orders/manage-orders.component';
import { OrderUpdateComponent } from './order-update/order-update.component';
import { RoleGuard } from '../core/guards/role.guard';
import { AuthGuard } from '../core/guards/auth.guard';



const routes: Routes = [
    { path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule) },
    { path: 'manageUsers', component: ManageUsersComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] }}, // auth: Admin
    { path: 'createUser', component: CreateUserComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] } }, // auth: Admin
    { path: 'user-detail/:userId', component: UserDetailComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] } }, // auth: Admin
    { path: 'manageCompanies', component: ManageCompaniesComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] }}, // auth: Admin
    { path: 'company-detail/:companyId', component: CompanyDetailComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] }}, // auth: Admin
    { path: 'company-update/:companyId', component: CompanyUpdateComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] }}, // auth: Admin
    { path: 'company-create', component: CompanyCreateComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] }}, // auth: Admin
    { path: 'dashboard', component: DashboardFakeComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] }}, // auth: Admin
    { path: 'FAQ', component: FAQComponent , canActivate: [RoleGuard], data: { roles: ['Admin'] }}, // auth: Admin
    { path: 'order-form', component: OrderFormComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] } }, // auth: Admin
    { path: 'order-detail/:orderId', component: OrderDetailComponent, canActivate: [AuthGuard] }, // auth: any role for connected users
    { path: 'manageOrders', component: ManageOrdersComponent, data: { roles: ['Admin', 'subcontractor', 'coContractor'] }}, // auth: Admin, subcontractor, coContractor
    { path: 'order-update/:orderId', component: OrderUpdateComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'subcontractor', 'coContractor'] } }, // auth: Admin, subcontractor, coContractor
    // route pour la landing page
    { path: '', component: LandingPageComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
