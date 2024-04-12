const schedule = require('node-schedule');
const { sendEmail } = require('../services/emailService');
const User = require('../models/User');

const scheduleEmailToContributor = async (contract) => {
    const { external_contributor, external_contributor_invoice_date } = contract;
    
    const user = await User.findById(external_contributor);
    if (!user || !user.email) {
        console.log('Aucun email trouvé pour l\'external_contributor');
        return;
    }
    
    const emailDate = new Date(external_contributor_invoice_date);
    if (emailDate > new Date()) {
        schedule.scheduleJob(emailDate, () => {
            sendEmail(
                user.email,
                'Facturation pour votre contribution',
                { name: user.name, date: emailDate.toISOString().slice(0, 10) },
                'invoiceTemplate'
            );
        });
        console.log(`Email programmé pour ${user.email} à la date ${emailDate}`);
    } else {
        console.log('La date de facturation est passée, aucun email ne sera envoyé.');
    }
};

module.exports = { scheduleEmailToContributor };
