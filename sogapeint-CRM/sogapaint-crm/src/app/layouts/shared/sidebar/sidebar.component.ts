import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import MetisMenu from 'metismenujs';
import { Router, NavigationEnd } from '@angular/router';

import { EventService } from '../../../core/services/event.service';


import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { UserProfileService } from 'src/app/core/services/user.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {
  
  menu: any;
  
  menuItems = [];
  
  @ViewChild('sideMenu') sideMenu: ElementRef;
  
  constructor(private eventService: EventService, private router: Router, private userProfileService: UserProfileService) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
      }
    });
  }
  
  ngOnInit(): void {
    // this.initialize();
    // this.addDocumentationLinkIfSuperAdmin(); // Méthode pour gérer l'ajout conditionnel du lien de documentation
    // this.addEditionLinkIfSuperAdmin(); // Méthode pour gérer l'ajout conditionnel des liens d'édition

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.initialize();  // Réinitialise le menu à chaque fin de navigation
    });
  
    this.initialize();  // Initialise également le menu au chargement initial
  }
  
  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
    
    this._activateMenuDropdown();
  }
  
  /**
  * remove active and mm-active class
  */
  _removeAllClass(className) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }
  
  /**
  * Activate the parent dropdown
  */
  // _activateMenuDropdown() {
  //   this._removeAllClass('mm-active');
  //   this._removeAllClass('mm-show');
  //   const links = document.getElementsByClassName('side-nav-link-ref');
  //   let menuItemEl = null;
    
  //   const paths = [];
  //   // tslint:disable-next-line: prefer-for-of
  //   for (let i = 0; i < links.length; i++) {
  //     // tslint:disable-next-line: no-string-literal
  //     paths.push(links[i]['pathname']);
  //   }
  //   const itemIndex = paths.indexOf(window.location.pathname);
  //   if (itemIndex === -1) {
  //     const strIndex = window.location.pathname.lastIndexOf('/');
  //     const item = window.location.pathname.substr(0, strIndex).toString();
  //     menuItemEl = links[paths.indexOf(item)];
  //   } else {
  //     menuItemEl = links[itemIndex];
  //   }
    
  //   if (menuItemEl) {
  //     menuItemEl.classList.add('active');
  //     const parentEl = menuItemEl.parentElement;
      
  //     if (parentEl) {
  //       parentEl.classList.add('mm-active');
        
  //       const parent2El = parentEl.parentElement.closest('ul');
  //       if (parent2El && parent2El.id !== 'side-menu') {
  //         parent2El.classList.add('mm-show');
  //         const parent3El = parent2El.parentElement;
          
  //         if (parent3El && parent3El.id !== 'side-menu') {
  //           parent3El.classList.add('mm-active');
  //           const childAnchor = parent3El.querySelector('.has-arrow');
  //           const childDropdown = parent3El.querySelector('.has-dropdown');
            
  //           if (childAnchor) { childAnchor.classList.add('mm-active'); }
  //           if (childDropdown) { childDropdown.classList.add('mm-active'); }
            
  //           const parent4El = parent3El.parentElement;
  //           if (parent4El && parent4El.id !== 'side-menu') {
  //             parent4El.classList.add('mm-show');
  //             const parent5El = parent4El.parentElement;
  //             if (parent5El && parent5El.id !== 'side-menu') {
  //               parent5El.classList.add('mm-active');
  //               const childanchor = parent5El.querySelector('.is-parent');
  //               if (childanchor && parent5El.id !== 'side-menu') { childanchor.classList.add('mm-active'); }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
  _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl = null;
  
    const paths = [];
  
    for (let i = 0; i < links.length; i++) {
      paths.push(links[i]['pathname']);
    }
    const itemIndex = paths.indexOf(window.location.pathname);
    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf('/');
      const item = window.location.pathname.substr(0, strIndex).toString();
      menuItemEl = links[paths.indexOf(item)];
    } else {
      menuItemEl = links[itemIndex];
    }
  
    if (menuItemEl) {
      menuItemEl.classList.add('active');
      const parentEl = menuItemEl.parentElement;
  
      if (parentEl) {
        parentEl.classList.add('mm-active');
  
        const parent2El = parentEl.parentElement.closest('ul');
        if (parent2El && parent2El.id !== 'side-menu') {
          parent2El.classList.add('mm-show');
          const parent3El = parent2El.parentElement;
  
          if (parent3El && parent3El.id !== 'side-menu') {
            parent3El.classList.add('mm-active');
            const childAnchor = parent3El.querySelector('.has-arrow');
            const childDropdown = parent3El.querySelector('.has-dropdown');
  
            if (childAnchor) { childAnchor.classList.add('mm-active'); }
            if (childDropdown) { childDropdown.classList.add('mm-active'); }
  
            const parent4El = parent3El.parentElement;
            if (parent4El && parent4El.id !== 'side-menu') {
              parent4El.classList.add('mm-show');
              const parent5El = parent4El.parentElement;
              if (parent5El && parent5El.id !== 'side-menu') {
                parent5El.classList.add('mm-active');
                const childanchor = parent5El.querySelector('.is-parent');
                if (childanchor && parent5El.id !== 'side-menu') { childanchor.classList.add('mm-active'); }
              }
            }
          }
        }
      }
    }
  }
  
  
  /**
  * Initialize
  */
  initialize(): void {
    // this.menuItems = MENU;
    const user = this.userProfileService.getCurrentUser();
    
    // Menus spécifiques pour le Super Admin
    if (user && user.role === 'superAdmin') {
      this.menuItems = [
        {
          id: 1,
          label: 'Tableau de bord',
          icon: 'ri-dashboard-line',
          link: '/dashboard'
        },
        // {
        //   id: 10,
        //   label: 'Dashboard (fake)',
        //   icon: 'ri-dashboard-line',
        //   link: '/dashboard-fake'
        // },
        {
          id: 2,
          label: 'Gestion des utilisateurs',
          icon: 'ri-contacts-book-fill',
          link: '/manageUsers'
        },
        {
          id: 3,
          label: 'Ajouter un utilisateur',
          icon: 'ri-contacts-book-upload-line',
          link: '/createUser'
        },
        {
          id: 4,
          label: 'Gestion des entreprises',
          icon: 'ri-building-2-line',
          link: '/manageCompanies'
        },
        {
          id: 5,
          label: 'Ajouter une entreprise',
          icon: 'ri-building-2-fill',
          link: '/company-create'
        },
        {
          id: 6,
          label: 'Gestion des commandes',
          icon: 'ri-shopping-cart-2-fill',
          link: '/manageOrders'
        },
        {
          id: 7,
          label: 'Saisir une commande',
          icon: 'ri-shopping-cart-2-line',
          link: '/order-form'
        },
        // {
        //   id: 8,
        //   label: 'FAQ',
        //   icon: 'ri-question-answer-line',
        //   link: '/FAQ'
        // },
        {
          id: 9,
          label: 'Documentation',
          icon: 'ri-file-text-line',
          link: '/documentation'
        }
      ];
    } else {
      // Menu de base pour tous les autres utilisateurs
      this.menuItems = [
        {
          id: 6,
          label: 'Gestion des commandes',
          icon: 'ri-shopping-cart-2-fill',
          link: '/manageOrders'
        }
      ];
    }
  }
  
  /**
  * Returns true or false if given menu item has child or not
  * @param item menuItem
  */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }
  
  /**
  * Change the layout onclick
  * @param layout Change the layout
  */
  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }
  
  /**
  * Light sidebar
  */
  lightSidebar() {
    document.body.setAttribute('data-sidebar', 'light');
    document.body.setAttribute('data-topbar', 'dark');
    document.body.removeAttribute('data-sidebar-size');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.classList.remove('vertical-collpsed');
  }
  
  /**
  * Compact sidebar
  */
  compactSidebar() {
    document.body.setAttribute('data-sidebar-size', 'small');
    document.body.setAttribute('data-sidebar', 'dark');
    document.body.removeAttribute('data-topbar');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.classList.remove('sidebar-enable');
    document.body.classList.remove('vertical-collpsed');
  }
  
  /**
  * Icon sidebar
  */
  iconSidebar() {
    document.body.classList.add('sidebar-enable');
    document.body.classList.add('vertical-collpsed');
    document.body.setAttribute('data-sidebar', 'dark');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.removeAttribute('data-topbar');
  }
  
  /**
  * Boxed layout
  */
  boxedLayout() {
    document.body.setAttribute('data-keep-enlarged', 'true');
    document.body.setAttribute('data-layout-size', 'boxed');
    document.body.setAttribute('data-sidebar', 'dark');
    document.body.classList.add('vertical-collpsed');
    document.body.classList.remove('sidebar-enable');
    document.body.removeAttribute('data-topbar');
  }
  
  /**
  * Colored sidebar
  */
  coloredSidebar() {
    document.body.setAttribute('data-sidebar', 'colored');
    document.body.removeAttribute('data-sidebar-size');
    document.body.removeAttribute('data-layout-size');
    document.body.classList.remove('vertical-collpsed');
    document.body.removeAttribute('data-topbar');
  }
  
  addDocumentationLinkIfSuperAdmin() {
    const user = this.userProfileService.getCurrentUser(); // Obtient les informations de l'utilisateur actuel
    if (user && user.role === 'superAdmin') {
      // Vérifie si l'élément de menu "Documentation" existe déjà pour éviter les doublons
      const documentationExists = this.menuItems.some(item => item.id === 666); // Utilise l'ID  attribué au lien de la documentation
      if (!documentationExists) {
        // Ajoute l'élément de menu pour la documentation si l'utilisateur est un superAdmin et s'il n'existe pas déjà
        this.menuItems.push({
          id: 666, // Un ID unique pour l'élément de menu Documentation
          label: 'Documentation',
          icon: 'ri-file-text-line', // icône de documentation
          link: '/documentation'
        });
      }
    }
  }
  
  addEditionLinkIfSuperAdmin() {
    const user = this.userProfileService.getCurrentUser(); // Obtient les informations de l'utilisateur actuel
    if (user && user.role === 'superAdmin') {
      // Vérifie si les élément de menu concernant l'édition et les trucs de superAdmin existent déjà pour éviter les doublons
      /**
      * Les éléments de menu pour l'édition sont les éléments avec les ID suivants:
      * 0: 'Dashboard',
      * 2: 'Ajouter un contact',
      * 4: 'Ajouter une entreprise',
      * 6: 'Saisir une commande'
      */
      const editionItemsLinks = [0,2,4,6];
      const editionExists = this.menuItems.some(item => editionItemsLinks.includes(item.id)); // Utilise l'ID  attribué au lien de la documentation
      if (!editionExists) {
        // Ajoute l'élément de menu pour la documentation si l'utilisateur est un superAdmin et s'il n'existe pas déjà
        this.menuItems.push({
          id: 0, // Un ID unique pour l'élément de menu Dashboard
          label: 'Dashboard',
          icon: 'ri-dashboard-line', // icône de dashboard
          link: '/dashboard'
        });
        this.menuItems.push({
          id: 2, // Un ID unique pour l'élément de menu Ajouter un contact
          label: 'Ajouter un contact',
          icon: 'ri-user-add-line', // icône d'ajout de contact
          link: '/createUser'
        });
        this.menuItems.push({
          id: 4, // Un ID unique pour l'élément de menu Ajouter une entreprise
          label: 'Ajouter une entreprise',
          icon: 'ri-building-2-line', // icône d'ajout d'entreprise
          link: '/company-create'
        });
        this.menuItems.push({
          id: 6, // Un ID unique pour l'élément de menu Saisir une commande
          label: 'Saisir une commande',
          icon: 'ri-shopping-cart-2-line', // icône de saisie de commande
          link: '/order-form'
        });
      }
    }
  }
  
}
