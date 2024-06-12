const schedule = require('node-schedule');
const { sendEmail } = require('../services/emailService');
const Contract = require('../models/Contract');
const User = require('../models/User');

// Planifie l'envoi d'un email à un contributeur
const scheduleEmailToContributor = async (email, replacements, scheduledDate, templateName = "orderNotificationTemplate") => {
    if (!email) {
        console.log('Aucune adresse email fournie.');
        return;
    }
    
    if (scheduledDate > new Date()) {
        schedule.scheduleJob(scheduledDate, () => {
            sendEmail(
                email,
                'Notification de commande',
                replacements,
                templateName
            );
            console.log(`Email programmé pour ${email} le ${scheduledDate.toISOString()}`);
        });
    } else {
        console.log('La date programmée est passée, aucun email ne sera envoyé.');
    }
};

// Obtenez le jour ouvrable suivant
const getNextBusinessDay = (date, daysToAdd) => {
    let resultDate = new Date(date);
    let addedDays = 0;
    
    while (addedDays < daysToAdd) {
        resultDate.setDate(resultDate.getDate() + 1);
        // Skip weekends
        if (resultDate.getDay() !== 0 && resultDate.getDay() !== 6) {
            addedDays++;
        }
    }
    
    return resultDate;
};

// Planifie des emails récurrents pour les contrats
// const scheduleRecurringEmails = async (contractId) => {
//     const contract = await Contract.findById(contractId).populate('external_contributor subcontractor');
//     if (!contract) {
//         console.log('Contrat non trouvé.');
//         return;
//     }
    
//     const replacements = {
//         'contract.internal_number': contract.internal_number || '',
//         'CRM_URL': process.env.CRM_URL
//     };
    
//     const reminderEmails = async () => {
//         if (!contract.mail_sended) {
//             const today = new Date();
//             const nextBusinessDay = getNextBusinessDay(today, 3);
            
//             if (contract.external_contributor && contract.external_contributor.email) {
//                 await scheduleEmailToContributor(
//                     contract.external_contributor.email,
//                     replacements,
//                     nextBusinessDay,
//                     'reminderInvoiceTemplate'
//                 );
//             }
            
//             if (contract.subcontractor && contract.subcontractor.email) {
//                 await scheduleEmailToContributor(
//                     contract.subcontractor.email,
//                     replacements,
//                     nextBusinessDay,
//                     'reminderInvoiceTemplate'
//                 );
//             }
            
//             // Reschedule the function to run again in 3 business days
//             schedule.scheduleJob(nextBusinessDay, reminderEmails);
//         }
//     };
    
//     // Start the first reminder immediately
//     reminderEmails();
// };
// const scheduleRecurringEmails = async (contractId, startDate) => {
//     const contract = await Contract.findById(contractId).populate('external_contributor subcontractor');
//     if (!contract) {
//         console.log('Contrat non trouvé.');
//         return;
//     }

//     if (!startDate) {
//         console.log('Date de fin client non renseignée. Aucune planification d\'emails récurrents.');
//         return;
//     }

//     const replacements = {
//         'contract.internal_number': contract.internal_number || '',
//         'CRM_URL': process.env.CRM_URL
//     };

//     const reminderEmails = async () => {
//         if (!contract.mail_sended) {
//             const today = new Date();
//             const nextBusinessDay = getNextBusinessDay(today, 3);

//             if (contract.external_contributor && contract.external_contributor.email) {
//                 await scheduleEmailToContributor(
//                     contract.external_contributor.email,
//                     replacements,
//                     nextBusinessDay,
//                     'reminderInvoiceTemplate'
//                 );
//             }

//             if (contract.subcontractor && contract.subcontractor.email) {
//                 await scheduleEmailToContributor(
//                     contract.subcontractor.email,
//                     replacements,
//                     nextBusinessDay,
//                     'reminderInvoiceTemplate'
//                 );
//             }

//             // Reschedule the function to run again in 3 business days
//             schedule.scheduleJob(nextBusinessDay, reminderEmails);
//         }
//     };

//     // Start the first reminder at the specified start date
//     const startReminderEmails = new Date(startDate);
//     schedule.scheduleJob(startReminderEmails, reminderEmails);
// };
const scheduleRecurringEmails = async (contractId, startDate) => {
    const contract = await Contract.findById(contractId).populate('external_contributor subcontractor');
    if (!contract) {
        console.log('Contrat non trouvé.');
        return;
    }

    // Vérifier si la date de début est fournie
    if (!startDate) {
        console.log('Date de fin client non renseignée. Aucune planification d\'emails récurrents.');
        return;
    }

    const replacements = {
        'contract.internal_number': contract.internal_number || '',
        'CRM_URL': process.env.CRM_URL
    };

    const reminderEmails = async () => {
        if (!contract.mail_sended) {
            const today = new Date();
            const nextBusinessDay = getNextBusinessDay(today, 3);

            if (contract.external_contributor && contract.external_contributor.email) {
                await scheduleEmailToContributor(
                    contract.external_contributor.email,
                    replacements,
                    nextBusinessDay,
                    'reminderInvoiceTemplate'
                );
            }

            if (contract.subcontractor && contract.subcontractor.email) {
                await scheduleEmailToContributor(
                    contract.subcontractor.email,
                    replacements,
                    nextBusinessDay,
                    'reminderInvoiceTemplate'
                );
            }

            // Replanifier la fonction pour s'exécuter à nouveau dans 3 jours ouvrables
            schedule.scheduleJob(nextBusinessDay, reminderEmails);
        }
    };

    // Démarrer le premier rappel à la date de début spécifiée
    const startReminderEmails = new Date(startDate);
    schedule.scheduleJob(startReminderEmails, reminderEmails);
};





module.exports = { scheduleEmailToContributor, scheduleRecurringEmails };
