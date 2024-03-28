const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    // file: [mongoose.Schema.Types.Mixed], // Assuming mixed types in the array
    files: [{ path: String, name: String, size: String }], // Un tableau d'objets contenant des informations de fichier
    trash: Boolean,
    date_cde: Date,
    // customer: mongoose.Schema.Types.ObjectId,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    internal_number: String,
    // contact: mongoose.Schema.Types.ObjectId,
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    benefit: String,
    status: String,
    // external_contributor: mongoose.Schema.Types.ObjectId,
    external_contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    observation: [mongoose.Schema.Types.Mixed], // Assuming mixed types in the array
    // observation: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Observation' }],
    incident: [mongoose.Schema.Types.Mixed], // Assuming mixed types in the array
    // incident: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }],
    dateUpd: Date,
    dateAdd: Date,
    __v: Number,
    address: String,
    appartment_number: String,
    quote_number: String,
    mail_sended: Boolean,
    invoice_number: String,
    amount_ht: Number,
    benefit_ht: Number,
    execution_data_day: Number,
    execution_data_hour: Number,
    external_contributor_invoice_date: Date,
    // internal_contributor: String,
    internal_contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // subcontractor: String,
    subcontractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    external_contributor_amount: Number,
    subcontractor_amount: Number,
    start_date_works: Date,
    end_date_works: Date,
    end_date_customer: Date,
    billing_number: String,
    billing_amount: Number,
    situation_number: Number,
    occupied: Boolean
});

module.exports = mongoose.model('Contract', contractSchema, 'orderforms');
