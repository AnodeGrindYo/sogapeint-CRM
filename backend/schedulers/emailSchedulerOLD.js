const schedule = require('node-schedule');
const { sendEmail } = require('../services/emailService');
const Contract = require('../models/Contract');
const User = require('../models/User');


const scheduleEmailToContributor = async (email, replacements, scheduledDate, templateName="orderNotificationTemplate") => {
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
                templateName
            );
            console.log(`Email scheduled for ${email} on ${scheduledDate.toISOString()}`);
        });
    } else {
        console.log('The scheduled date has passed, no email will be sent.');
    }
};

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

const scheduleRecurringEmails = async (contractId) => {
    const contract = await Contract.findById(contractId).populate('external_contributor subcontractor');
    if (!contract) {
        console.log('Contract not found.');
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
                    'reminderInvoiceTemplate' // New template for invoice reminder
                );
            }

            if (contract.subcontractor && contract.subcontractor.email) {
                await scheduleEmailToContributor(
                    contract.subcontractor.email,
                    replacements,
                    nextBusinessDay,
                    'reminderInvoiceTemplate' // New template for invoice reminder
                );
            }

            // Reschedule the function to run again in 3 business days
            schedule.scheduleJob(nextBusinessDay, reminderEmails);
        }
    };

    // Start the first reminder immediately
    reminderEmails();
};


module.exports = { scheduleEmailToContributor, scheduleRecurringEmails };

