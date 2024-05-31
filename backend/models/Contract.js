const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    file: [{ 
        path: String, 
        name: String, 
        size: String, 
        processed: Boolean, 
        contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' }
    }], 
    trash: Boolean,
    date_cde: Date,

    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    internal_number: String,

    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    benefit: String,
    status: String,

    external_contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    observation: [mongoose.Schema.Types.Mixed], 

    incident: [mongoose.Schema.Types.Mixed], 

    dateUpd: Date,
    dateAdd: Date,
    __v: Number,
    address: String,
    appartment_number: String,
    ss4: Boolean,
    quote_number: String,
    mail_sended: Boolean,
    invoice_number: String,
    amount_ht: Number,
    benefit_ht: Number,
    prevision_data_day: Number,
    prevision_data_hour: Number,
    execution_data_day: Number,
    execution_data_hour: Number,
    external_contributor_invoice_date: Date,

    internal_contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    subcontractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    external_contributor_amount: Number,
    subcontractor_amount: Number,
    start_date_works: Date,
    end_date_works: Date,
    end_date_customer: Date,
    billing_number: String,
    billing_amount: Number,
    situation_number: Number,
    occupied: Boolean,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedBy: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            date: Date
        }
    ] ,
    invoiceStatus: {
        type: String,
        enum: ['received', 'processed', 'pending'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Contract', contractSchema, 'orderforms');