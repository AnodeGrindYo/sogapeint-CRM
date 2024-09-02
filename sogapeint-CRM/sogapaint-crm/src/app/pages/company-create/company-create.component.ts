import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';
import { CompanyService } from '../../core/services/company.service';
import { Router } from '@angular/router';
import { NaturesJuridiques } from 'src/app/core/data/natures-juridiques';


@Component({
  selector: 'app-company-create',
  templateUrl: './company-create.component.html',
  styleUrls: ['./company-create.component.scss']
})
export class CompanyCreateComponent implements OnInit {
  companyForm: FormGroup;
  existingCompanyNames: string[] = [];
  filteredCompanyNames: Observable<string[]>;
  errorMessage: string = '';
  successMessage: string = '';
  breadCrumbItems: Array<{ label: string; url?: string; active?: boolean }> = [];
  pageTitle: string = 'Ajouter une entreprise';
  scrapedCompanies: any[] = [];
  isLoading = false;
  subscriptions: any[] = [];
  
  constructor(
    private fb: FormBuilder, 
    private companyService: CompanyService,
    private router: Router
    ) { }
    
    ngOnInit(): void {
      this.companyForm = this.fb.group({
        normalized_name: ['', Validators.required],
        // abbreviation: ['', [Validators.required, this.consonantValidator]],
        abbreviation: ['', Validators.required],
        names: ['', Validators.required],
        industry: [''],
        email: ['', Validators.email],
        address: [''],
        websites: this.fb.array([this.fb.control('')]), // Commence avec un champ vide
        phone: this.fb.array([this.fb.control('')]), // Commence avec un champ vide
        additionalFields: this.fb.array([])
      });
      
      this.getCompaniesNames();
      
      this.subscriptions.push(this.companyForm.get('abbreviation').valueChanges
      .subscribe(value => {
        this.companyForm.get('abbreviation').setValue(value.toUpperCase(), { emitEvent: false });
      }));

      // Écoute pour les événements blur sur le champ 'names'
      const namesField = this.companyForm.get('names');
      const addressField = this.companyForm.get('address');
    }

    ngOnDestroy(): void {
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    
    // Validateur personnalisé pour le champ abbréviation
    consonantValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value || '';
      const consonants = value.replace(/[^BCDFGHJKLMNPQRSTVWXZ]/gi, '');
      if (consonants.length === 5 && value === consonants) {
        return null; // La validation réussit
      }
      return { consonants: true }; // Retourner un objet d'erreur si la validation échoue
    }
    
    // Méthode pour générer l'abbréviation à partir du nom de l'entreprise
    generateAbbreviation(name: string): string {
      // Normaliser le nom et retirer les accents
      const normalized = this.normalizeCompanyName(name);
      // Filtrer uniquement les consonnes et les convertir en majuscules
      let consonants = normalized
      .toUpperCase()
      .replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/g, ''); // Ne garder que les consonnes en majuscule
      // Retourner les 5 premières consonnes
      return consonants.substr(0, 5);
    }
    
    getCompaniesNames(): void {
      this.subscriptions.push(this.companyService.getCompaniesNames().subscribe({
        next: (names) => {
          this.existingCompanyNames = names;
          this.setupNameAutocomplete();
        },
        error: (error) => {
          console.error('Error fetching company names', error);
        }
      }));
    }
    
    setupNameAutocomplete() {
      this.filteredCompanyNames = this.companyForm.controls['names'].valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
        );
      }
      
      private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.existingCompanyNames.filter(option => option.toLowerCase().includes(filterValue));
      }
      
      checkCompanyName() {
        const name = this.companyForm.get('names').value;
        const normalized = this.normalizeCompanyName(name);
        this.companyForm.get('normalized_name').setValue(normalized, {emitEvent: false});
        // Génération et mise à jour de l'abbréviation lors de la vérification du nom de l'entreprise
        const abbreviation = this.generateAbbreviation(normalized);
        this.companyForm.get('abbreviation').setValue(abbreviation);
        if (this.existingCompanyNames.includes(normalized)) {
          this.errorMessage = 'Une entreprise avec ce nom existe déjà.';
        } else {
          this.errorMessage = '';
        }
      }
      
      normalizeCompanyName(name: string): string {
        return name
        .toUpperCase() // Convertir en majuscules
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Retirer les accents
        .replace(/\d+/g, "") // Retirer tous les chiffres
        .trim() // Retirer les espaces au début et à la fin
        .replace(/\s{2,}/g, ' '); // Remplacer les espaces multiples par un seul espace
      }
      
      
      onSubmit() {
        this.companyForm.addControl('normalized_name', this.fb.control(''));
        this.companyForm.get('normalized_name').setValue(this.normalizeCompanyName(this.companyForm.get('names').value));
        if (this.companyForm.valid && this.errorMessage === '') {
          let formValue = this.companyForm.value;
          // Accès aux champs supplémentaires
          const additionalFields = formValue.additionalFields;
          // remplace les "_" par des espaces dans les clés des champs supplémentaires
          additionalFields.forEach((field: any) => {
            field.key = field.key.replace(/_/g, ' ');
          });

          if (formValue.industry.length > 0) {
            // formvalue.industry doit être un tableau de string
            formValue.industry = [formValue.industry];
          }

          if (formValue.names.length > 0) {
            formValue.names = [formValue.names];
          }

          
          console.log('Champs supplémentaires:', additionalFields);
          this.subscriptions.push(this.companyService.createCompany(formValue).subscribe({
            next: (response) => {
              this.successMessage = 'Entreprise créée avec succès.';
              this.companyForm.reset();
              // Retourne à manage-companies après 2 secondes
              setTimeout(() => {
                // navique vers la page de gestion des entreprises
                this.router.navigate(['/manageCompanies']);
              }, 2000);
            },
            error: (error) => {
              console.error('Error creating company', error);
              this.errorMessage = 'Erreur lors de la création de l’entreprise.';
            }
          }));
        }
      }
      
      
      // Méthode pour récupérer un FormArray
      getFormArray(arrayName: string): FormArray {
        return this.companyForm.get(arrayName) as FormArray;
      }
      
      // Méthodes pour ajouter un élément à un FormArray
      addWebsite(): void {
        const websites = this.getFormArray('websites');
        websites.push(this.fb.control('', Validators.required));
      }
      
      addPhone(): void {
        const phoneNumbers = this.getFormArray('phone');
        phoneNumbers.push(this.fb.control('', Validators.required));
      }
      
      
      addAdditionalField(): void {
        const additionalFields = this.companyForm.get('additionalFields') as FormArray;
        const group = this.fb.group({
          key: ['', Validators.required], // Peut-être devrait-on ajouter des validateurs ici
          value: [''] // Peut-être devrait-on ajouter des validateurs ici
        });
        additionalFields.push(group);
      }

      addPredefinedAdditionalField(key: string, value: string): void {
        const additionalFields = this.companyForm.get('additionalFields') as FormArray;
        additionalFields.push(this.fb.group({
          key: [key, Validators.required],
          value: [value]
        }));
      }
      
      removeAdditionalField(index: number): void {
        const additionalFields = this.companyForm.get('additionalFields') as FormArray;
        additionalFields.removeAt(index);
      }
      
      // Getter pour les additionalFields en tant que FormArray
      get additionalFields(): FormArray {
        return this.companyForm.get('additionalFields') as FormArray;
      }
      
      // Méthodes pour supprimer un élément d'un FormArray
      removeWebsite(index: number): void {
        const websites = this.getFormArray('websites');
        websites.removeAt(index);
      }
      
      removePhone(index: number): void {
        const phoneNumbers = this.getFormArray('phone');
        phoneNumbers.removeAt(index);
      }
      
      // Cette méthode retourne les clés des champs supplémentaires
      additionalFieldsKeys(): string[] {
        const additionalFields = this.companyForm.get('additionalFields') as FormGroup;
        return Object.keys(additionalFields.controls);
      }
      
      // Cette méthode retourne les contrôles d'un champ supplémentaire
      removeFormArrayItem(fieldName: string, index: number): void {
        const formArray = this.getFormArray(fieldName);
        formArray.removeAt(index);
      }
      
      addFormArrayItem(fieldName: string): void {
        const formArray = this.getFormArray(fieldName);
        formArray.push(this.fb.control(''));
      }

      isThereAZipCode(address: string): boolean {
        const res = /\b\d{5}\b/.test(address);
        console.log('Zip code found:', res);
        return res;
      }

      extractZipCode(address: string): string {
        const zipCode = address.match(/\b\d{5}\b/g);
        const res = zipCode ? zipCode[0] : '';
        console.log('Zip code extracted:', res);
        return res;
      }

      // vérifie que les champs name et address sont remplis,
      areNameAndAddressFilled(): boolean {
        const name = this.companyForm.get('names').value;
        const address = this.companyForm.get('address').value;
        return name && address;
      }


      // vérifie que les champs name et address sont remplis, 
      // puis que le code postal est présent dans l'adresse. 
      // Enfin, extrait le code postal  puis scrape les données 
      // de l'entreprise en utilisant companyService.scrapeCompanyData
      scrapeCompanyData(): void {
        if (this.areNameAndAddressFilled()) {
          const zipCode = this.extractZipCode(this.companyForm.get('address').value);
          this.subscriptions.push(this.companyService.scrapeCompanyData(this.companyForm.get('names').value, zipCode).subscribe({
            next: (data) => {
              this.scrapedCompanies = data;
              console.log('Scraped data:', data);
            },
            error: (error) => console.error('Error scraping company data:', error)
          }));
        }
      }

      scrapeCompanyList(): void {
        this.isLoading = true;
        const companyName = this.companyForm.get('names').value;
        // const region = 'Occitanie';
    
        this.subscriptions.push(this.companyService.scrapeCompanyList(companyName)
          .pipe(catchError(error => {
            console.error('Erreur lors de la récupération de la liste des entreprises', error);
            this.isLoading = false;
            return of([]); // Observable de fallback en cas d'erreur
          }))
          .subscribe(data => {
            this.scrapedCompanies = data;
            console.log('Entreprises trouvées:', data);
            // si on a une entreprise correspondant exactement aux données du formulaire, on ne garde que celle-ci
            const matchingCompany = this.checkIfACompanyFromTheListCorrespondsExactly(data);
            if (matchingCompany !== undefined) {
              this.scrapedCompanies = [matchingCompany];
              console.log('Entreprise correspondant exactement trouvée:', matchingCompany);
            }
            this.isLoading = false;
          }));
      }

      // vérifie si une entreprise de la liste correspond exactement aux données du formulaire (normalized_name et code postal dans l'adresse)
      // Si on en trouve une et une seule, on ne retourne que cette entreprise
      checkIfACompanyFromTheListCorrespondsExactly(data: any[]): any {
        const name = this.normalizeCompanyName(this.companyForm.get('names').value);
        const zipCode = this.extractZipCode(this.companyForm.get('address').value);
        return data.find((company: any) => 
          this.normalizeCompanyName(company.title) === name && 
          company.addresses.some((address: string) => address.includes(zipCode))
        );
      }
      
      fillFormWithScrapedData(company: any): void {
        this.isLoading = true; // Commencer l'animation de chargement
        const postalCode = this.extractZipCode(company.addresses[0]);

        this.companyForm.patchValue({
          industry: company.activity
        });
      
        // Appel au service pour récupérer des données supplémentaires
        this.subscriptions.push(this.companyService.scrapeCompanyData(company.title, postalCode)
          .subscribe({
            next: (data) => {
              console.log('Données enrichies de l’entreprise :', data);
              this.isLoading = false; // Arrêter l'animation de chargement
      
              // Ajouter chaque champ s'il est présent
              if (data.siren) this.addPredefinedAdditionalField('siren', data.siren);
              if (data.siege?.siret) this.addPredefinedAdditionalField('siret', data.siege.siret);
              if (data.nom_raison_sociale) this.addPredefinedAdditionalField('nom_raison_sociale', data.nom_raison_sociale);
              
              // Inclure le champ CA s'il est présent
              if (data.ca) this.addPredefinedAdditionalField('CA', data.ca);
      
              if (data.nombre_etablissements !== undefined) this.addPredefinedAdditionalField('nombre_etablissements', data.nombre_etablissements.toString());
              if (data.nombre_etablissements_ouverts !== undefined) this.addPredefinedAdditionalField('nombre_etablissements_ouverts', data.nombre_etablissements_ouverts.toString());
              if (data.categorie_entreprise) this.addPredefinedAdditionalField('categorie_entreprise', data.categorie_entreprise);
              if (data.date_creation) this.addPredefinedAdditionalField('date_creation', data.date_creation);
              if (data.etat_administratif) this.addPredefinedAdditionalField('etat_administratif', data.etat_administratif);
              if (data.nature_juridique) this.addPredefinedAdditionalField('nature_juridique', this.getNatureJuridiqueDescription(data.nature_juridique));
              if (data.siege?.adresse) {
                // this.addPredefinedAdditionalField('adresse_siege', data.siege.adresse);
                this.companyForm.patchValue({ address: data.siege.adresse });
              }
              if (data.siege?.tranche_effectif_salarie) this.addPredefinedAdditionalField('tranche_effectif_salarie_siege', data.siege.tranche_effectif_salarie);
              if (data.siege?.date_creation) this.addPredefinedAdditionalField('date_creation_siege', data.siege.date_creation);
              if (data.siege?.date_debut_activite) this.addPredefinedAdditionalField('date_debut_activite_siege', data.siege.date_debut_activite);
            },
            error: (error) => {
              console.error('Erreur lors de la récupération des données enrichies de l’entreprise:', error);
              this.isLoading = false; // Arrêter l'animation de chargement
            }
          }));
      }
      
      
      getNatureJuridiqueDescription(code: string): string {
        return NaturesJuridiques[code] || 'Non spécifié';
      }
    }
