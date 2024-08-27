import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserProfileService } from '../../core/services/user.service';
import { User } from 'src/app/core/models/auth.models';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import { CompanyService } from '../../core/services/company.service';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';



@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  // Items pour le fil d'Ariane
  breadCrumbItems: Array<{ label: string; url?: string; active?: boolean }> = [];
  // Titre de la page
  pageTitle: string = 'Détail utilisateur';
  user: User;
  id: string;
  currentUser: User;
  userForm: FormGroup;
  editMode: boolean = false;
  companies: any[];
  companyInput$ = new Subject<string>();
  unsubscribe$ = new Subject<void>();
  public successMessage: string; // TODO
  public errorMessage: string; // TODO
  confirmationInput: string = '';
  companyName: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router
    ) {
      this.route.params.subscribe(params => {
        this.id = params['userId'];
        console.log("UserId : "+this.id);
        // NMaintenant, nous avons l'identifiant de l'utilisateur, 
        // nous pouvons le charger depuis le backend
        
      });
      
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      this.userForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        role: ['customer', Validators.required], // la valeur par défaut est 'user'
        status: true, // la valeur par défaut est 'active'
        authorized_connection: true, // la valeur par défaut est 'authorized',
        phone: ['',  Validators.pattern(phoneRegex)],
        address: [''], // facultatif
        company: ['', Validators.required]
      });
    }
    
    async ngOnInit(): Promise<void> {
      this.breadCrumbItems = [{ label: 'Sogapeint' }, { label: this.pageTitle, active: true }];
      this.currentUser = this.userProfileService.getCurrentUser();
      try {
        await this._fetchData(this.id);
        this.loadUserData();
      } catch (error) {
        console.error("Une erreur a eu lieu lors de la récupération des données de l'utilisateur", error);
      }
      this.loadInitialCompanies();
      this.companyInput$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.companyService.searchCompanies(term)),
        takeUntil(this.unsubscribe$)
        ).subscribe(companies => {
          this.companies = companies;
        });
      }
      
      loadUserData() {
        
        
        const company = this.companyService.searchCompanies(this.user.company).subscribe(company => {
          // this.userForm.get('company').setValue(company[0]);
          // console.log("Entreprise trouvée: ", company[0]);
          this.userForm.patchValue({
            firstName: this.user.firstName ?? '',
            lastName: this.user.lastName ?? '',
            role: this.user.role ?? '',
            email: this.user.email ?? '',
            // company: company[0] ?? '', 
            company: this.user.company ?? '',
            // company: company ?? '',
            phone: this.user.phone ?? '', // facultatif
            status: this.user.active ?? '',
            authorized_connection: this.user.authorized_connection ?? '',
            address: this.user.address ?? '' // facultatif  
          });
        }
        );
      }

      compareWithFn = (o1, o2) => {
        return (o1._id === o2._id) && (o1.normalized_name === o2.normalized_name);
      }


      
      isAdminOrSuperAdmin(): boolean {
        return this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'superAdmin');
      }
      
      enableEditMode() {
        if (this.isAdminOrSuperAdmin()) {
          this.editMode = true;
        }
      }
      
      disableEditMode() {
        this.editMode = false;
      }
      
      resetDirty(controlName: string) {
        let control = this.userForm.get(controlName);
        if (control.value === this.user[controlName]) {
          control.markAsPristine();
          control.markAsUntouched();
        }
      }
      
      resetField(controlName: string) {
        const originalValue = this.user[controlName];
        this.userForm.get(controlName).setValue(originalValue);
        this.userForm.get(controlName).markAsPristine();
        this.userForm.get(controlName).markAsUntouched();
      }
      
      
      private _fetchData(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
          this.userProfileService.getOne(id).subscribe(
            (data: any) => {
              this.user = new User();
              this.user.active = data.active;
              this.user.authorized_connection = data.authorized_connection;
              this.user.company = data.company;
              this.user.email = data.email;
              this.user.firstName = data.firstname
              this.user.lastName = data.lastname;
              this.user.phone = data.phone;
              this.user.role = data.role;
              this.user.id = id;
              console.log("Utilisateur récupéré: ", this.user);
              resolve();
            },
            (error: any) => {
              console.log("Erreur pendant la récupération de l'utilisateur: ", error);
              reject(error);
            }
            );
          });
        }
        
        getRoleClass(role: string): string {
          const roleClassMap = {
            'superAdmin': 'badge-superadmin',
            'cocontractor': 'badge-cocontractor',
            'subcontractor': 'badge-subcontractor',
            'customer': 'badge-customer',
            'comanager': 'badge-comanager',
            'supermanager': 'badge-supermanager'
          };
          return roleClassMap[role] || 'badge-default';
        }
        
        /**
        * Charge la liste des entreprises.
        */
        loadInitialCompanies() {
          this.companyService.getCompanies() 
          .subscribe(companies => this.companies = companies);
        }
        
        /**
        * Filtre la liste des entreprises en fonction de la valeur saisie dans le champ de recherche.
        * @param val La valeur saisie dans le champ de recherche.
        * @returns Un Observable contenant un tableau d'entreprises filtrées.
        */
        filterCompanies(val: string): Observable<any[]> {
          return this.companyService.searchCompanies(val);
        }
        
        /**
        * Ajoute une nouvelle entreprise à la liste des entreprises si elle n'existe pas déjà.
        * Cette fonction est appelée lorsque le champ de recherche perd le focus. et permet
        * à l'utilisateur d'ajouter une nouvelle entreprise à la liste, et donc de conserver
        * le nom d'une nouvelle entreprise dans le formulaire.
        * @param event L'événement de saisie dans le champ de recherche.
        */
        onCompanyInputBlur(event: any): void {
          console.log("onCompanyInputBlur");
          console.log("Entreprises: ", this.companies);
          console.log("Valeur saisie: ", this.userForm.get('company').value);
          this.companyName = this.userForm.get('company').value;
          const inputValue = event.target.value;
          if (inputValue && !this.companies.includes(inputValue)) {
            // Ajoute inputValue à la liste des entreprises
            this.companies = [...this.companies, inputValue];
            // S'assure que la valeur est sélectionnée
            this.userForm.get('company').setValue(inputValue);
            console.log("Entreprise ajoutée: ", inputValue);
          }
        }

        openConfirmationModalForModification(content: any) {
          console.log("openConfirmationModalForModification for content: ", content);
          if (this.userForm.valid) {
            // log de tout l'userForm
            // for (const value in this.userForm.value) {
            //   console.log(value + ': ' + this.userForm.value[value]);
            //   if (value === 'company') {
            //     console.log('company: ' + this.userForm.value[value].value);
            //     console.log('this user company: ' + this.user.company); 
            //     console.log('this user lastname: ' + this.user.lastName);
            //   }
            // }
            const modalRef = this.modalService.open(content);
            modalRef.result.then((result) => {
              if (result === 'Confirm') {
                // Logique de confirmation (par exemple, enregistrer les modifications)
                this.validateUserModification();
              }
            }, (reason) => {
              // Logique en cas d'annulation ou de fermeture du modal
            });
          }
        }

        openDeleteConfirmationModal(deleteModal: any) {
          this.confirmationInput = ''; // Réinitialiser le texte de confirmation
          this.modalService.open(deleteModal);
        }
      
        confirmDeletion() {
          if (this.confirmationInput === (this.user?.firstName + ' ' + this.user?.lastName)) {
            // Logique de suppression de l'utilisateur
            // Par exemple: this.userProfileService.deleteUser(this.user.id).subscribe(...);
            this.userProfileService.delete(this.user.id).subscribe(
              response => {
                console.log('Suppression réussie', response);
                this.successMessage = 'Utilisateur supprimé avec succès.';
                // Rediriger vers la liste des utilisateurs ici
                this.router.navigate(['/manageUsers']);

              },
              error => {
                console.error('Erreur lors de la suppression', error);
                this.errorMessage = 'Erreur lors de la suppression de l’utilisateur.';
              }
            );
            console.log('Utilisateur supprimé');
          } else {
            console.log('Texte de confirmation incorrect');
          }
        }

        isTextMatching(): boolean {
          return this.confirmationInput === (this.user?.firstName + ' ' + this.user?.lastName);
        }
        
        
        validateUserModification() {
          console.log("validateUserModification");
          if (this.userForm.valid) {
            let updatedUser = new User();
            updatedUser.id = this.user.id;
            updatedUser.firstName = this.userForm.get('firstName').value;
            updatedUser.lastName = this.userForm.get('lastName').value;
            updatedUser.email = this.userForm.get('email').value;
            updatedUser.role = this.userForm.get('role').value;
            updatedUser.company = this.userForm.get('company').value;
            updatedUser.phone = this.userForm.get('phone').value;
            updatedUser.active = this.userForm.get('status').value;
            updatedUser.authorized_connection = this.userForm.get('authorized_connection').value;
            updatedUser.address = this.userForm.get('address').value;
            console.log("Utilisateur prêt à être mis à jour: ", updatedUser);
            this.userProfileService.update(this.user.id, updatedUser).subscribe(
              response => {
                console.log('Mise à jour réussie', response);
                this.successMessage = 'Utilisateur mis à jour avec succès.';
                // this.editMode = false;
                this._fetchData(this.user.id);
                this.disableEditMode();
                
              },
              error => {
                console.error('Erreur lors de la mise à jour', error);
                this.errorMessage = 'Erreur lors de la mise à jour de l’utilisateur.';
              }
            );
          } else {
            this.errorMessage = 'Veuillez remplir correctement le formulaire.';
            Object.keys(this.userForm.controls).forEach(field => {
              const control = this.userForm.get(field);
              control.markAsTouched({ onlySelf: true });
            });
          }
        }
        

        

        openResetPasswordModal(resetPasswordModal: any) {
          const modalRef = this.modalService.open(resetPasswordModal);
          modalRef.result.then((result) => {
            if (result === 'Confirm') {
              this.resetPassword();
            }
          }, (reason) => {
            // Modal dismissed
          });
        }

        resetPassword() {
          console.log("resetPassword");
          console.log("Utilisateur à réinitialiser: ", this.user);
          console.log("user id: ", this.user.id );
          this.userProfileService.resetPasswordByAdmin(this.user.id).subscribe({
            next: (response) => {
              // Affiche un message de succès :
              this.successMessage = 'Mot de passe réinitialisé avec succès et e-mail envoyé.';
              this.modalService.dismissAll();
              this.disableEditMode();
            },
            error: (error) => {
              // Affiche un message d'erreur:
              this.errorMessage = 'Erreur lors de la réinitialisation du mot de passe: ' + (error?.error?.message || ' ');
              
            }
          });
        }

        translateRole(role: string): string {
          const roleTranslationMap = {
            'superAdmin': 'superAdmin',
            'cocontractor': 'co-traitant',
            'subcontractor': 'sous-traitant',
            'customer': 'client',
            'comanager': 'régisseur',
            'supermanager': 'chef régisseur'
          };
          return roleTranslationMap[role] || role;
        }

        isFieldInvalid(fieldName: string): boolean {
          const control = this.userForm.get(fieldName);
          return control.invalid && (control.dirty || control.touched);
        }
        
        onBlur(fieldName: string): void {
          const control = this.userForm.get(fieldName);
          control.markAsTouched();
          if (control.invalid) {
            this.errorMessage = 'Certains champs sont invalides. Veuillez les corriger avant de continuer.';
          }
        }
        
        
        
      }
