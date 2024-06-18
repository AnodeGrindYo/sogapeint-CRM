const mongoose = require('mongoose');

const emailTaskSchema = new mongoose.Schema({
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    email: { type: String, required: true },
    replacements: {
        contracts: [
            {
                internal_number: String,
                benefit: String,
                end_date_customer: Date,
                status: String,
                address: String,
                appartment_number: String,
                external_contributor_name: String
            }
        ],
        CRM_URL: String
    },
    scheduledDate: { type: Date, required: true },
    templateName: { type: String, required: true },
    interval: { type: Number, required: true },
    mailSended: { type: Boolean, required: true }
});

module.exports = mongoose.model('EmailTask', emailTaskSchema);
