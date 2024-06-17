// models/EmailTask.js

const mongoose = require('mongoose');

const emailTaskSchema = new mongoose.Schema({
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    email: { type: String, required: true },
    replacements: { type: Map, of: String, default: {} },
    scheduledDate: { type: Date, required: true },
    templateName: { type: String, default: 'orderNotificationTemplate' },
    interval: { type: Number, default: 3 }, // interval en jours ouvrés
    mailSended: { type: Boolean, default: false }
});

module.exports = mongoose.model('EmailTask', emailTaskSchema);
