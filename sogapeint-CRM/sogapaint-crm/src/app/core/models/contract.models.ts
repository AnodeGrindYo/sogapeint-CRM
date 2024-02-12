export class Contract {
    _id: string;
    file: any[]; // Remplacer par un type plus spécifique si nécessaire
    trash: boolean;
    date_cde: Date | null;
    customer: string;
    internal_number: string;
    contact: string;
    benefit: string;
    status: string | null;
    external_contributor: string | null;
    observation: any[]; // Remplacer par un type plus spécifique si nécessaire
    incident: any[]; // Remplacer par un type plus spécifique si nécessaire
    dateUpd: Date;
    dateAdd: Date;
    __v: number;
    address: string;
    appartment_number: string;
    quote_number: string;
    mail_sended: boolean;
    invoice_number: string;
    amount_ht: number | null;
    benefit_ht: number | null;
    execution_data_day: number | null;
    execution_data_hour: number | null;
    external_contributor_invoice_date: Date | null;
    internal_contributor: string;
    external_contributor_amount: number;
    start_date_works: Date | null;
    end_date_works: Date | null;
    end_date_customer: Date | null;
    start_date_customer: Date | null; // optional
    billing_number: string;
    billing_amount: number | null;
    situation_number: number;
    occupied: boolean | null;
    
    constructor() {
        // Initialiser les valeurs par défaut ici si nécessaire
    }
}
