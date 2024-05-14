// const schedule = require('node-schedule');
// const { sendEmail } = require('../services/emailService');
// const User = require('../models/User');

// const scheduleEmailToContributor = async (contract) => {
//     const { external_contributor, external_contributor_invoice_date } = contract;
    
//     const user = await User.findById(external_contributor);
//     if (!user || !user.email) {
//         console.log('Aucun email trouvé pour l\'external_contributor');
//         return;
//     }
    
//     const emailDate = new Date(external_contributor_invoice_date);
//     if (emailDate > new Date()) {
//         schedule.scheduleJob(emailDate, () => {
//             sendEmail(
//                 user.email,
//                 'Facturation pour votre contribution',
//                 { name: user.name, date: emailDate.toISOString().slice(0, 10) },
//                 'invoiceTemplate'
//             );
//         });
//         console.log(`Email programmé pour ${user.email} à la date ${emailDate}`);
//     } else {
//         console.log('La date de facturation est passée, aucun email ne sera envoyé.');
//     }
// };

// module.exports = { scheduleEmailToContributor };

const schedule = require('node-schedule');
const { sendEmail } = require('../services/emailService');
const Contract = require('../models/Contract');
const User = require('../models/User');

// const scheduleEmailToContributor = async (contractId) => {
//     const contract = await Contract.findById(contractId)
//         .populate('customer')
//         .populate('contact')
//         .populate('internal_contributor')
//         .populate('external_contributor');
    
//     if (!contract || !contract.external_contributor || !contract.external_contributor.email) {
//         console.log('No email found for the external contributor or missing contract details.');
//         return;
//     }

//     const emailDate = new Date(contract.external_contributor_invoice_date);
//     if (emailDate > new Date()) {
//         schedule.scheduleJob(emailDate, () => {
//             const replacements = {
//                 firstname: contract.external_contributor.firstname,
//                 lastname: contract.external_contributor.lastname,
//                 contract_number: contract.internal_number,
//                 external_contributor_amount: contract.external_contributor_amount.toFixed(2),
//                 invoice_date: emailDate.toISOString().slice(0, 10),
//                 // Add more details from contract as needed
//             };
//             sendEmail(
//                 contract.external_contributor.email,
//                 'Facturation pour votre contribution',
//                 replacements,
//                 'invoiceTemplate'
//             );
//         });
//         console.log(`Email scheduled for ${contract.external_contributor.email} on ${emailDate.toISOString()}`);
//     } else {
//         console.log('The invoice date has passed, no email will be sent.');
//     }
// };
const scheduleEmailToContributor = async (email, replacements, scheduledDate) => {
    if (!email) {
        console.log('No email address provided.');
        return;
    }

    if (scheduledDate > new Date()) {
        schedule.scheduleJob(scheduledDate, () => {
            sendEmail(
                email,
                'Notification de commande',
                replacements,
                'orderNotificationTemplate'
            );
            console.log(`Email scheduled for ${email} on ${scheduledDate.toISOString()}`);
        });
    } else {
        console.log('The scheduled date has passed, no email will be sent.');
    }
};

module.exports = { scheduleEmailToContributor };

