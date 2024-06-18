// // schedulers/emailScheduler.js

// const schedule = require('node-schedule');
// const { sendEmail } = require('../services/emailService');
// const Contract = require('../models/Contract');
// const EmailTask = require('../models/EmailTask');

// const scheduleEmailToContributor = async (email, replacements, scheduledDate, templateName = "orderNotificationTemplate") => {
//     if (!email) {
//         console.log('Aucune adresse email fournie.');
//         return;
//     }

//     if (scheduledDate > new Date()) {
//         schedule.scheduleJob(scheduledDate, () => {
//             sendEmail(
//                 email,
//                 'Notification de commande',
//                 replacements,
//                 templateName
//             );
//             console.log(`Email programmé pour ${email} le ${scheduledDate.toISOString()}`);
//         });
//     } else {
//         console.log('La date programmée est passée, aucun email ne sera envoyé.');
//     }
// };

// const getNextBusinessDay = (date, daysToAdd) => {
//     let resultDate = new Date(date);
//     let addedDays = 0;

//     while (addedDays < daysToAdd) {
//         resultDate.setDate(resultDate.getDate() + 1);

//         if (resultDate.getDay() !== 0 && resultDate.getDay() !== 6) {
//             addedDays++;
//         }
//     }

//     return resultDate;
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
//         const today = new Date();
//         const nextBusinessDay = getNextBusinessDay(today, contract.interval || 3);

//         if (contract.external_contributor && contract.external_contributor.email) {
//             await scheduleEmailToContributor(
//                 contract.external_contributor.email,
//                 replacements,
//                 nextBusinessDay,
//                 'reminderInvoiceTemplate'
//             );
//         }

//         if (contract.subcontractor && contract.subcontractor.email) {
//             await scheduleEmailToContributor(
//                 contract.subcontractor.email,
//                 replacements,
//                 nextBusinessDay,
//                 'reminderInvoiceTemplate'
//             );
//         }

//         const emailTask = new EmailTask({
//             contractId: contract._id,
//             email: contract.external_contributor ? contract.external_contributor.email : contract.subcontractor.email,
//             replacements,
//             scheduledDate: nextBusinessDay,
//             templateName: 'reminderInvoiceTemplate',
//             interval: contract.interval || 3,
//             mailSended: true
//         });

//         await emailTask.save();

//         schedule.scheduleJob(nextBusinessDay, reminderEmails);
//     };

//     const startReminderEmails = new Date(startDate);
//     schedule.scheduleJob(startReminderEmails, reminderEmails);
// };

// const rescheduleAllEmails = async () => {
//     const emailTasks = await EmailTask.find({ scheduledDate: { $exists: true, $ne: null }, mailSended: true });
//     emailTasks.forEach(task => {
//         const scheduledDate = new Date(task.scheduledDate);
//         if (scheduledDate > new Date()) {
//             schedule.scheduleJob(scheduledDate, async () => {
//                 await scheduleRecurringEmails(task.contractId, scheduledDate);
//             });
//         }
//     });
// };

// module.exports = { scheduleEmailToContributor, scheduleRecurringEmails, rescheduleAllEmails };


// schedulers/emailScheduler.js

// const schedule = require('node-schedule');
// const { sendEmail } = require('../services/emailService');
// const Contract = require('../models/Contract');
// const EmailTask = require('../models/EmailTask');

// const scheduleEmailToContributor = async (email, replacements, scheduledDate, templateName = "orderNotificationTemplate") => {
//     if (!email) {
//         console.log('Aucune adresse email fournie.');
//         return;
//     }

//     if (scheduledDate > new Date()) {
//         schedule.scheduleJob(scheduledDate, () => {
//             sendEmail(
//                 email,
//                 'Notification de commande',
//                 replacements,
//                 templateName
//             );
//             console.log(`Email programmé pour ${email} le ${scheduledDate.toISOString()}`);
//         });
//     } else {
//         console.log('La date programmée est passée, aucun email ne sera envoyé.');
//     }
// };

// const getNextBusinessDay = (date, daysToAdd) => {
//     let resultDate = new Date(date);
//     let addedDays = 0;

//     while (addedDays < daysToAdd) {
//         resultDate.setDate(resultDate.getDate() + 1);

//         if (resultDate.getDay() !== 0 && resultDate.getDay() !== 6) {
//             addedDays++;
//         }
//     }

//     return resultDate;
// };

// const scheduleRecurringEmails = async (internalNumber, startDate, interval, replacements) => {
//     const contracts = await Contract.find({ internal_number: internalNumber });

//     if (!contracts || contracts.length === 0) {
//         console.log('Aucun contrat trouvé avec ce numéro interne.');
//         return;
//     }

//     const reminderEmails = async () => {
//         const today = new Date();
//         const nextBusinessDay = getNextBusinessDay(today, interval || 3);

//         if (contracts[0].external_contributor && contracts[0].external_contributor.email) {
//             await scheduleEmailToContributor(
//                 contracts[0].external_contributor.email,
//                 replacements,
//                 nextBusinessDay,
//                 'reminderInvoiceTemplate'
//             );
//         }

//         const emailTask = new EmailTask({
//             contractId: contracts[0]._id,
//             email: contracts[0].external_contributor ? contracts[0].external_contributor.email : contracts[0].subcontractor.email,
//             replacements,
//             scheduledDate: nextBusinessDay,
//             templateName: 'reminderInvoiceTemplate',
//             interval: interval || 3,
//             mailSended: true
//         });

//         await emailTask.save();

//         schedule.scheduleJob(nextBusinessDay, reminderEmails);
//     };

//     const startReminderEmails = new Date(startDate);
//     schedule.scheduleJob(startReminderEmails, reminderEmails);
// };

// const rescheduleAllEmails = async () => {
//     const emailTasks = await EmailTask.find({ scheduledDate: { $exists: true, $ne: null }, mailSended: true });
//     emailTasks.forEach(task => {
//         const scheduledDate = new Date(task.scheduledDate);
//         if (scheduledDate > new Date()) {
//             schedule.scheduleJob(scheduledDate, async () => {
//                 await scheduleRecurringEmails(task.contractId, scheduledDate, task.interval, task.replacements);
//             });
//         }
//     });
// };

// module.exports = { scheduleEmailToContributor, scheduleRecurringEmails, rescheduleAllEmails };








// schedulers/emailScheduler.js

const schedule = require('node-schedule');
const { sendEmail, sendEmailWithHandlebars } = require('../services/emailService');
const Contract = require('../models/Contract');
const EmailTask = require('../models/EmailTask');

// Variable booléenne pour basculer entre la version de test et la version normale
const isTestMode = false; // Mettez à false pour la version normale

// const scheduleEmailToContributor = async (email, replacements, scheduledDate, templateName = "orderNotificationTemplate") => {
//     if (!email) {
//         console.log('Aucune adresse email fournie.');
//         return;
//     }

//     console.log('replacements dans scheduleEmailToContributor', replacements);

//     if (scheduledDate > new Date()) {
//         schedule.scheduleJob(scheduledDate, () => {
//             sendEmail(
//                 email,
//                 'Notification de commande',
//                 replacements,
//                 templateName
//             );
//             console.log(`Email programmé pour ${email} le ${scheduledDate.toISOString()}`);
//         });
//     } else {
//         console.log('La date programmée est passée, aucun email ne sera envoyé.');
//     }
// };

const scheduleEmailToContributor = async (email, replacements, scheduledDate, templateName = "orderNotificationTemplate") => {
    if (!email) {
        console.log('Aucune adresse email fournie.');
        return;
    }

    console.log('replacements dans scheduleEmailToContributor', replacements);

    if (scheduledDate > new Date()) {
        schedule.scheduleJob(scheduledDate, () => {
            sendEmailWithHandlebars(
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

const getNextBusinessDay = (date, daysToAdd) => {
    let resultDate = new Date(date);

    if (isTestMode) {
        resultDate.setSeconds(resultDate.getSeconds() + daysToAdd);
    } else {
        let addedDays = 0;
        while (addedDays < daysToAdd) {
            resultDate.setDate(resultDate.getDate() + 1);
            if (resultDate.getDay() !== 0 && resultDate.getDay() !== 6) {
                addedDays++;
            }
        }
    }

    return resultDate;
};

const scheduleRecurringEmails = async (internalNumber, startDate, interval, replacements) => {
    const contracts = await Contract.find({ internal_number: internalNumber }).populate('external_contributor');

    if (!contracts || contracts.length === 0) {
        console.log('Aucun contrat trouvé avec ce numéro interne.');
        return;
    }

    console.log('replacements dans scheduleRecurringEmails', replacements);

    const reminderEmails = async () => {
        const today = new Date();
        const nextBusinessDay = getNextBusinessDay(today, interval || 3);

        if (contracts[0].external_contributor && contracts[0].external_contributor.email) {
            await scheduleEmailToContributor(
                contracts[0].external_contributor.email,
                replacements,
                nextBusinessDay,
                'reminderInvoiceTemplate'
            );
        }

        const emailTask = new EmailTask({
            contractId: contracts[0]._id,
            email: contracts[0].external_contributor ? contracts[0].external_contributor.email : contracts[0].subcontractor.email,
            replacements,
            scheduledDate: nextBusinessDay,
            templateName: 'reminderInvoiceTemplate',
            interval: interval || 3,
            mailSended: true
        });

        await emailTask.save();

        schedule.scheduleJob(nextBusinessDay, reminderEmails);
    };

    const startReminderEmails = new Date(startDate);
    schedule.scheduleJob(startReminderEmails, reminderEmails);
};

const rescheduleAllEmails = async () => {
    const emailTasks = await EmailTask.find({ scheduledDate: { $exists: true, $ne: null }, mailSended: true });
    emailTasks.forEach(task => {
        const scheduledDate = new Date(task.scheduledDate);
        if (scheduledDate > new Date()) {
            schedule.scheduleJob(scheduledDate, async () => {
                await scheduleRecurringEmails(task.contractId, scheduledDate, task.interval, task.replacements);
            });
        }
    });
};

module.exports = { scheduleEmailToContributor, scheduleRecurringEmails, rescheduleAllEmails };

