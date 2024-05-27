'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">sogapaint-crm documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AccountModule.html" data-type="entity-link" >AccountModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AccountRoutingModule.html" data-type="entity-link" >AccountRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-4f23422a2463ed66bab52e1d47d30d527ff61cafd441066d1c60379688b8a0334aa6dbb5150a60d5ab83be2e54419419356fdf57f513ce9a3509bdee085e34e4"' : 'data-bs-target="#xs-components-links-module-AppModule-4f23422a2463ed66bab52e1d47d30d527ff61cafd441066d1c60379688b8a0334aa6dbb5150a60d5ab83be2e54419419356fdf57f513ce9a3509bdee085e34e4"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-4f23422a2463ed66bab52e1d47d30d527ff61cafd441066d1c60379688b8a0334aa6dbb5150a60d5ab83be2e54419419356fdf57f513ce9a3509bdee085e34e4"' :
                                            'id="xs-components-links-module-AppModule-4f23422a2463ed66bab52e1d47d30d527ff61cafd441066d1c60379688b8a0334aa6dbb5150a60d5ab83be2e54419419356fdf57f513ce9a3509bdee085e34e4"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProtectedDocumentationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProtectedDocumentationComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-4f23422a2463ed66bab52e1d47d30d527ff61cafd441066d1c60379688b8a0334aa6dbb5150a60d5ab83be2e54419419356fdf57f513ce9a3509bdee085e34e4"' : 'data-bs-target="#xs-injectables-links-module-AppModule-4f23422a2463ed66bab52e1d47d30d527ff61cafd441066d1c60379688b8a0334aa6dbb5150a60d5ab83be2e54419419356fdf57f513ce9a3509bdee085e34e4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-4f23422a2463ed66bab52e1d47d30d527ff61cafd441066d1c60379688b8a0334aa6dbb5150a60d5ab83be2e54419419356fdf57f513ce9a3509bdee085e34e4"' :
                                        'id="xs-injectables-links-module-AppModule-4f23422a2463ed66bab52e1d47d30d527ff61cafd441066d1c60379688b8a0334aa6dbb5150a60d5ab83be2e54419419356fdf57f513ce9a3509bdee085e34e4"' }>
                                        <li class="link">
                                            <a href="injectables/AuthenticationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthenticationService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AuthModule-59434f76b2f3c1fa59531df3a7df423ec56466e2cfa4099ecc91230acf2ba8dfaa0a55920e2e9af585dccaba81c02bb8cd5cd99a4c429c36412de15531dee927"' : 'data-bs-target="#xs-components-links-module-AuthModule-59434f76b2f3c1fa59531df3a7df423ec56466e2cfa4099ecc91230acf2ba8dfaa0a55920e2e9af585dccaba81c02bb8cd5cd99a4c429c36412de15531dee927"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AuthModule-59434f76b2f3c1fa59531df3a7df423ec56466e2cfa4099ecc91230acf2ba8dfaa0a55920e2e9af585dccaba81c02bb8cd5cd99a4c429c36412de15531dee927"' :
                                            'id="xs-components-links-module-AuthModule-59434f76b2f3c1fa59531df3a7df423ec56466e2cfa4099ecc91230acf2ba8dfaa0a55920e2e9af585dccaba81c02bb8cd5cd99a4c429c36412de15531dee927"' }>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PasswordresetComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PasswordresetComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SignupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SignupComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthRoutingModule.html" data-type="entity-link" >AuthRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DashboardModule.html" data-type="entity-link" >DashboardModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DashboardModule-ecd5262b596686d027dbd83ad4bf0cbf834206a881922ad8f93427a322e0301e001c800d15f2ba2335983062f9bf4fdfdc3aae1cf952a86198f344071a21c7da"' : 'data-bs-target="#xs-components-links-module-DashboardModule-ecd5262b596686d027dbd83ad4bf0cbf834206a881922ad8f93427a322e0301e001c800d15f2ba2335983062f9bf4fdfdc3aae1cf952a86198f344071a21c7da"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DashboardModule-ecd5262b596686d027dbd83ad4bf0cbf834206a881922ad8f93427a322e0301e001c800d15f2ba2335983062f9bf4fdfdc3aae1cf952a86198f344071a21c7da"' :
                                            'id="xs-components-links-module-DashboardModule-ecd5262b596686d027dbd83ad4bf0cbf834206a881922ad8f93427a322e0301e001c800d15f2ba2335983062f9bf4fdfdc3aae1cf952a86198f344071a21c7da"' }>
                                            <li class="link">
                                                <a href="components/ChartCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChartCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChatCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChatCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DonutCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DonutCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InvoicesManagementComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InvoicesManagementComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/KpiCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >KpiCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MapCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MapCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PickerCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PickerCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StatSummaryCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StatSummaryCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TableCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TableCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TimelineCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TimelineCardComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/IconsModule.html" data-type="entity-link" >IconsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-IconsModule-eb8085ade6f4b4bb3ebd7ce09616e94cfb1b4ad4deeb161c4f9191e93206f27c0fb69952935669fbe04115496b72183b6a0fda44869f3f5988260b9ffef048ea"' : 'data-bs-target="#xs-components-links-module-IconsModule-eb8085ade6f4b4bb3ebd7ce09616e94cfb1b4ad4deeb161c4f9191e93206f27c0fb69952935669fbe04115496b72183b6a0fda44869f3f5988260b9ffef048ea"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-IconsModule-eb8085ade6f4b4bb3ebd7ce09616e94cfb1b4ad4deeb161c4f9191e93206f27c0fb69952935669fbe04115496b72183b6a0fda44869f3f5988260b9ffef048ea"' :
                                            'id="xs-components-links-module-IconsModule-eb8085ade6f4b4bb3ebd7ce09616e94cfb1b4ad4deeb161c4f9191e93206f27c0fb69952935669fbe04115496b72183b6a0fda44869f3f5988260b9ffef048ea"' }>
                                            <li class="link">
                                                <a href="components/DripiconsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DripiconsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FontawesomeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FontawesomeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MaterialdesignComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MaterialdesignComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RemixComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RemixComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/IconsRoutingModule.html" data-type="entity-link" >IconsRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/LayoutsModule.html" data-type="entity-link" >LayoutsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-LayoutsModule-eea27604ba3324b01caec3b9df419d69ed8901c98e391ed40ff986640a431ff9bbd0f41801f4acd9590d39bdc15858293ab16787707fbf4c63a23b489e71d43b"' : 'data-bs-target="#xs-components-links-module-LayoutsModule-eea27604ba3324b01caec3b9df419d69ed8901c98e391ed40ff986640a431ff9bbd0f41801f4acd9590d39bdc15858293ab16787707fbf4c63a23b489e71d43b"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-LayoutsModule-eea27604ba3324b01caec3b9df419d69ed8901c98e391ed40ff986640a431ff9bbd0f41801f4acd9590d39bdc15858293ab16787707fbf4c63a23b489e71d43b"' :
                                            'id="xs-components-links-module-LayoutsModule-eea27604ba3324b01caec3b9df419d69ed8901c98e391ed40ff986640a431ff9bbd0f41801f4acd9590d39bdc15858293ab16787707fbf4c63a23b489e71d43b"' }>
                                            <li class="link">
                                                <a href="components/HorizontalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HorizontalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserInfoBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserInfoBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VerticalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VerticalComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/PagesModule.html" data-type="entity-link" >PagesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-PagesModule-5f6b5d72aec86ed654ecb0bacf952ae25ec8a556c72e5ff037bf8e5f2763119304539f4e8372af8804b2552f026d773e3b7248faa81eea147788879529e43c8e"' : 'data-bs-target="#xs-components-links-module-PagesModule-5f6b5d72aec86ed654ecb0bacf952ae25ec8a556c72e5ff037bf8e5f2763119304539f4e8372af8804b2552f026d773e3b7248faa81eea147788879529e43c8e"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-PagesModule-5f6b5d72aec86ed654ecb0bacf952ae25ec8a556c72e5ff037bf8e5f2763119304539f4e8372af8804b2552f026d773e3b7248faa81eea147788879529e43c8e"' :
                                            'id="xs-components-links-module-PagesModule-5f6b5d72aec86ed654ecb0bacf952ae25ec8a556c72e5ff037bf8e5f2763119304539f4e8372af8804b2552f026d773e3b7248faa81eea147788879529e43c8e"' }>
                                            <li class="link">
                                                <a href="components/CompanyCreateComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompanyCreateComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompanyDetailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompanyDetailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompanyUpdateComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompanyUpdateComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ContractActivityComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ContractActivityComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CreateUserComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CreateUserComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardFakeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardFakeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ManageCompaniesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ManageCompaniesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ManageOrdersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ManageOrdersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ManageUsersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ManageUsersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderDetailCocontractorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderDetailCocontractorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderDetailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderDetailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderDetailCustomerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderDetailCustomerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderFilesManagementComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderFilesManagementComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderFormComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderUpdateCocontractorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderUpdateCocontractorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderUpdateComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderUpdateComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserDetailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserDetailComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-PagesModule-5f6b5d72aec86ed654ecb0bacf952ae25ec8a556c72e5ff037bf8e5f2763119304539f4e8372af8804b2552f026d773e3b7248faa81eea147788879529e43c8e"' : 'data-bs-target="#xs-pipes-links-module-PagesModule-5f6b5d72aec86ed654ecb0bacf952ae25ec8a556c72e5ff037bf8e5f2763119304539f4e8372af8804b2552f026d773e3b7248faa81eea147788879529e43c8e"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-PagesModule-5f6b5d72aec86ed654ecb0bacf952ae25ec8a556c72e5ff037bf8e5f2763119304539f4e8372af8804b2552f026d773e3b7248faa81eea147788879529e43c8e"' :
                                            'id="xs-pipes-links-module-PagesModule-5f6b5d72aec86ed654ecb0bacf952ae25ec8a556c72e5ff037bf8e5f2763119304539f4e8372af8804b2552f026d773e3b7248faa81eea147788879529e43c8e"' }>
                                            <li class="link">
                                                <a href="pipes/FileSizePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileSizePipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/FilterPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilterPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/PagesRoutingModule.html" data-type="entity-link" >PagesRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link" >SharedModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link" >SharedModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-SharedModule-294fd83040092a2f72b3850fafcdba076964f84e070bde34e8ef79e9e17009c7e79dcf74b6f4c9d186866488e89e6d01ec5a22ce2ee4cb931e6e931b1e1608b3-1"' : 'data-bs-target="#xs-components-links-module-SharedModule-294fd83040092a2f72b3850fafcdba076964f84e070bde34e8ef79e9e17009c7e79dcf74b6f4c9d186866488e89e6d01ec5a22ce2ee4cb931e6e931b1e1608b3-1"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SharedModule-294fd83040092a2f72b3850fafcdba076964f84e070bde34e8ef79e9e17009c7e79dcf74b6f4c9d186866488e89e6d01ec5a22ce2ee4cb931e6e931b1e1608b3-1"' :
                                            'id="xs-components-links-module-SharedModule-294fd83040092a2f72b3850fafcdba076964f84e070bde34e8ef79e9e17009c7e79dcf74b6f4c9d186866488e89e6d01ec5a22ce2ee4cb931e6e931b1e1608b3-1"' }>
                                            <li class="link">
                                                <a href="components/FooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HorizontalnavbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HorizontalnavbarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HorizontaltopbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HorizontaltopbarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RightsidebarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RightsidebarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidebarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SidebarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TopbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TopbarComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UIModule.html" data-type="entity-link" >UIModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-UIModule-5ced52369b8ba99f4af43ebddc9ca53d6ea9ccdbd2226c8fb90b0e488de8f49bfc7da58a72a10ee1b8c1466fd1b7fa45ae9326d8f77684bf6e96f85d6c6b60a1"' : 'data-bs-target="#xs-components-links-module-UIModule-5ced52369b8ba99f4af43ebddc9ca53d6ea9ccdbd2226c8fb90b0e488de8f49bfc7da58a72a10ee1b8c1466fd1b7fa45ae9326d8f77684bf6e96f85d6c6b60a1"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UIModule-5ced52369b8ba99f4af43ebddc9ca53d6ea9ccdbd2226c8fb90b0e488de8f49bfc7da58a72a10ee1b8c1466fd1b7fa45ae9326d8f77684bf6e96f85d6c6b60a1"' :
                                            'id="xs-components-links-module-UIModule-5ced52369b8ba99f4af43ebddc9ca53d6ea9ccdbd2226c8fb90b0e488de8f49bfc7da58a72a10ee1b8c1466fd1b7fa45ae9326d8f77684bf6e96f85d6c6b60a1"' }>
                                            <li class="link">
                                                <a href="components/AlertsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AlertsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ButtonsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ButtonsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CardsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CardsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CarouselComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CarouselComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DropdownsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DropdownsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GeneralComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GeneralComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GridComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GridComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImagesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImagesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoadingComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoadingComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ModalsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ModalsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProgressbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProgressbarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RangesliderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RangesliderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SweetalertComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SweetalertComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TabsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TabsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TypographyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TypographyComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VideoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VideoComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiModule.html" data-type="entity-link" >UiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-UiModule-a653c920100463928cb5758b564580aff1df16f3b120cfe505f1fc6b512c4e900cd72be08d3e4b04bb5a160adc702aa325b29f4739634299ddb8ba2e3f83ae04"' : 'data-bs-target="#xs-components-links-module-UiModule-a653c920100463928cb5758b564580aff1df16f3b120cfe505f1fc6b512c4e900cd72be08d3e4b04bb5a160adc702aa325b29f4739634299ddb8ba2e3f83ae04"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UiModule-a653c920100463928cb5758b564580aff1df16f3b120cfe505f1fc6b512c4e900cd72be08d3e4b04bb5a160adc702aa325b29f4739634299ddb8ba2e3f83ae04"' :
                                            'id="xs-components-links-module-UiModule-a653c920100463928cb5758b564580aff1df16f3b120cfe505f1fc6b512c4e900cd72be08d3e4b04bb5a160adc702aa325b29f4739634299ddb8ba2e3f83ae04"' }>
                                            <li class="link">
                                                <a href="components/PagetitleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PagetitleComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UiRoutingModule.html" data-type="entity-link" >UiRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/WidgetModule.html" data-type="entity-link" >WidgetModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-WidgetModule-000c94e5ae5c77bb56c1e03401d0bd14066bdcd1a181d5bd22a806d4df6ddceda16ce974751edd5a7e6dc30792d65fd1a2f8f76f7d16805f7f71467d3019f4dd"' : 'data-bs-target="#xs-components-links-module-WidgetModule-000c94e5ae5c77bb56c1e03401d0bd14066bdcd1a181d5bd22a806d4df6ddceda16ce974751edd5a7e6dc30792d65fd1a2f8f76f7d16805f7f71467d3019f4dd"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-WidgetModule-000c94e5ae5c77bb56c1e03401d0bd14066bdcd1a181d5bd22a806d4df6ddceda16ce974751edd5a7e6dc30792d65fd1a2f8f76f7d16805f7f71467d3019f4dd"' :
                                            'id="xs-components-links-module-WidgetModule-000c94e5ae5c77bb56c1e03401d0bd14066bdcd1a181d5bd22a806d4df6ddceda16ce974751edd5a7e6dc30792d65fd1a2f8f76f7d16805f7f71467d3019f4dd"' }>
                                            <li class="link">
                                                <a href="components/StatComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StatComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/FAQComponent.html" data-type="entity-link" >FAQComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LandingPageComponent.html" data-type="entity-link" >LandingPageComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Address.html" data-type="entity-link" >Address</a>
                            </li>
                            <li class="link">
                                <a href="classes/Contract.html" data-type="entity-link" >Contract</a>
                            </li>
                            <li class="link">
                                <a href="classes/FirebaseAuthBackend.html" data-type="entity-link" >FirebaseAuthBackend</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthenticationService.html" data-type="entity-link" >AuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthfakeauthenticationService.html" data-type="entity-link" >AuthfakeauthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BenefitService.html" data-type="entity-link" >BenefitService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChatService.html" data-type="entity-link" >ChatService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompanyService.html" data-type="entity-link" >CompanyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ContractService.html" data-type="entity-link" >ContractService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EventService.html" data-type="entity-link" >EventService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InvoicesService.html" data-type="entity-link" >InvoicesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/KpiService.html" data-type="entity-link" >KpiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LanguageService.html" data-type="entity-link" >LanguageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserProfileService.html" data-type="entity-link" >UserProfileService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interceptors-links"' :
                            'data-bs-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/ErrorInterceptor.html" data-type="entity-link" >ErrorInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/FakeBackendInterceptor.html" data-type="entity-link" >FakeBackendInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/JwtInterceptor.html" data-type="entity-link" >JwtInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/DocGuard.html" data-type="entity-link" >DocGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/RoleGuard.html" data-type="entity-link" >RoleGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AlertColor.html" data-type="entity-link" >AlertColor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartType.html" data-type="entity-link" >ChartType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartType-1.html" data-type="entity-link" >ChartType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Chat.html" data-type="entity-link" >Chat</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Chat-1.html" data-type="entity-link" >Chat</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChatMessage.html" data-type="entity-link" >ChatMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Company.html" data-type="entity-link" >Company</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Document.html" data-type="entity-link" >Document</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Event.html" data-type="entity-link" >Event</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Incident.html" data-type="entity-link" >Incident</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Invoice.html" data-type="entity-link" >Invoice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuItem.html" data-type="entity-link" >MenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuItem-1.html" data-type="entity-link" >MenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Observation.html" data-type="entity-link" >Observation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Stat.html" data-type="entity-link" >Stat</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Stat-1.html" data-type="entity-link" >Stat</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transaction.html" data-type="entity-link" >Transaction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transaction-1.html" data-type="entity-link" >Transaction</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/FileSizePipe-1.html" data-type="entity-link" >FileSizePipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});