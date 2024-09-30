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
import { OrderDetailCocontractorComponent } from './order-detail-cocontractor/order-detail-cocontractor.component';
import { OrderDetailCustomerComponent } from './order-detail-customer/order-detail-customer.component';
import { ManageOrdersComponent } from './manage-orders/manage-orders.component';
import { OrderUpdateComponent } from './order-update/order-update.component';
import { OrderUpdateCocontractorComponent } from './order-update-cocontractor/order-update-cocontractor.component';
import { RoleGuard } from '../core/guards/role.guard';
import { AuthGuard } from '../core/guards/auth.guard';
import { RoleRedirectGuard } from '../core/guards/roleRedirect.guard';
import { EndlessAscensionComponent } from './endless-ascension/endless-ascension.component';
import { CalendarComponent } from './calendar/calendar.component';


const routes: Routes = [
    { path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule) },
    { path: 'manageUsers', component: ManageUsersComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] }}, // auth: Admin
    { path: 'createUser', component: CreateUserComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] } }, // auth: Admin
    { path: 'user-detail/:userId', component: UserDetailComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] } }, // auth: Admin
    { path: 'manageCompanies', component: ManageCompaniesComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] }}, // auth: Admin
    { path: 'company-detail/:companyId', component: CompanyDetailComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] }}, // auth: Admin
    { path: 'company-update/:companyId', component: CompanyUpdateComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] }}, // auth: Admin
    { path: 'company-create', component: CompanyCreateComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] }}, // auth: Admin
    { path: 'dashboard', component: DashboardComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] }}, // auth: Admin
    // { path: 'dashboard-fake', component: DashboardFakeComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] }},
    { path: 'FAQ', component: FAQComponent , canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] }}, // auth: Admin
    { path: 'order-form', component: OrderFormComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] } }, // auth: Admin
    { path: 'order-detail/:orderId', component: OrderDetailComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin', 'comanager', 'supermanager']} }, // auth: any role for connected users
    { path: 'order-detail-cocontractor/:orderId', component: OrderDetailCocontractorComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin', 'subcontractor', 'cocontractor'] } }, // auth: Admin, subcontractor, coContractor
    { path: 'manageOrders', component: ManageOrdersComponent, data: { roles: ['Admin', 'superAdmin', 'subcontractor', 'coContractor', 'supermanager', 'comanager'] }}, // auth: Admin, subcontractor, coContractor
    { path: 'order-update/:orderId', component: OrderUpdateComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin'] } }, // auth: Admin, subcontractor, coContractor
    { path: 'order-update-cocontractor/:orderId', component: OrderUpdateCocontractorComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'superAdmin', 'subcontractor', 'cocontractor'] } },
    { path: 'order-detail-customer/:orderId', component: OrderDetailCustomerComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'customer', 'supermanager', 'comanager'] } },
    // route pour la landing page
    { path: '', component: LandingPageComponent},
    //  la route par défaut dépend du rôle de l'utilisateur : dashboard pour admin et superAdmin, manageOrders pour les autres
    // { path: '', component: DashboardComponent, data: { roles: ['Admin', 'superAdmin'] }},
    // { path: '', component: ManageOrdersComponent, data: { roles: ['subcontractor', 'coContractor', 'supermanager', 'comanager'] }},
    // { path: '', canActivate: [RoleRedirectGuard], pathMatch: 'full' },
    { path: 'endless-ascension', component: EndlessAscensionComponent, canActivate: [AuthGuard] },
    { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'superAdmin'] } }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
