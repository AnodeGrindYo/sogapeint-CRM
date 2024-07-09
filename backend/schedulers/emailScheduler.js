const schedule = require('node-schedule');
const { sendEmail, sendEmailWithHandlebars } = require('../services/emailService');
const Contract = require('../models/Contract');
const EmailTask = require('../models/EmailTask');
const User = require('../models/User'); // Ajout pour vérifier le champ authorized_connection

const isTestMode = false; 

const scheduleEmailToContributor = async (email, replacements, scheduledDate, templateName = "orderNotificationTemplate") => {
    if (!email) {
        console.log('Aucune adresse email fournie.');
        return;
    }

    const user = await User.findOne({ email });
    if (!user || !user.authorized_connection) {
        console.log('L\'utilisateur n\'est pas autorisé à recevoir des emails:', email);
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

        const user = await User.findById(contracts[0].external_contributor._id);
        if (user && user.authorized_connection) {
            await scheduleEmailToContributor(
                user.email,
                replacements,
                nextBusinessDay,
                'reminderInvoiceTemplate'
            );
        }

        const emailTask = new EmailTask({
            contractId: contracts[0]._id,
            email: user ? user.email : contracts[0].subcontractor.email,
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
