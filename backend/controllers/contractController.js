const ContractModel = require('../models/Contract');
const User = require('../models/User');
const mongoose = require('mongoose');
const { scheduleEmailToContributor, scheduleRecurringEmails } = require('../schedulers/emailScheduler');
const EmailUtils = require('../utils/emailUtils');
const EmailService = require('../services/emailService');
const EmailTask = require('../models/EmailTask');
const { getBenefitName } = require('../utils/benefits');
const { formatDate } = require('../utils/date');
const { translateStatus } = require('../utils/status');

// Variable booléenne pour basculer entre la version de test et la version normale
const isTestMode = false; // Mettez à false pour la version normale

const sanitizeContract = (contract) => {
    ['customer', 'contact', 'external_contributor', 'subcontractor'].forEach(role => {
        if (contract[role]) {
            delete contract[role].password;
            delete contract[role].salt;
        }
    });
};

exports.getContractById = async (req, res) => {
    try {
        console.log('Fetching contract by id');
        const { contractId } = req.params;
        const contract = await ContractModel.findById(contractId);
        if (!contract) {
            return res.status(404).json({ message: 'Contrat non trouvé.' });
        }
        res.status(200).json(contract);
    } catch (error) {
        console.error('Error retrieving contract:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getContracts = async (req, res) => {
    try {
        const contracts = await ContractModel.find()
        .populate('customer')
        .populate('contact')
        .populate('external_contributor')
        .populate('subcontractor');
        
        contracts.forEach(sanitizeContract);
        res.json(contracts);
    } catch (error) {
        console.error('Erreur lors de la récupération des contrats:', error);
        res.status(500).send({ message: "Erreur lors de la récupération des contrats", error });
    }
};

exports.getContractsByInternalNumber = async (req, res) => {
    try {
        const { internalNumber } = req.query;
        const contracts = await ContractModel.find({ internal_number: internalNumber })
        .populate('customer')
        .populate('contact')
        .populate('external_contributor')

        contracts.forEach(sanitizeContract);
        res.json(contracts);
    } catch (error) {
        console.error('Erreur lors de la récupération des contrats par numéro interne:', error);
        res.status(500).send({ message: "Erreur lors de la récupération des contrats par numéro interne", error });
    }
};

exports.getContractsByMonth = async (req, res) => {
    try {
        const { month } = req.query;
        const currentYear = new Date().getFullYear();
        const monthNumber = parseInt(month, 10);
        if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
            return res.status(400).send({ message: "Le mois spécifié est invalide" });
        }
        
        const startDate = new Date(currentYear, monthNumber - 1, 1);
        const endDate = new Date(currentYear, monthNumber, 0, 23, 59, 59);
        
        const contracts = await ContractModel.find({
            dateAdd: { $gte: startDate, $lt: endDate }
        })
        .populate('customer')
        .populate('contact')
        .populate('external_contributor')
        .populate('subcontractor');
        
        contracts.forEach(sanitizeContract);
        res.json(contracts);
    } catch (error) {
        console.error('Erreur lors de la récupération des contrats pour le mois donné:', error);
        res.status(500).send({ message: "Erreur lors de la récupération des contrats pour le mois donné", error });
    }
};

exports.getOngoingContracts = async (req, res) => {
    try {
        const contracts = await ContractModel.find({ status: 'in_progress' })
        .populate('customer')
        .populate('contact')
        .populate('external_contributor')
        .populate('subcontractor');
        
        contracts.forEach(sanitizeContract);
        res.json(contracts);
    } catch (error) {
        console.error('Erreur lors de la récupération des contrats en cours:', error);
        res.status(500).send({ message: "Erreur lors de la récupération des contrats en cours", error });
    }
};

exports.getNotOngoingContracts = async (req, res) => {
    try {
        const contracts = await ContractModel.find({ status: { $ne: 'in_progress' } })
        .populate('customer')
        .populate('contact')
        .populate('external_contributor')
        .populate('subcontractor');
        
        contracts.forEach(sanitizeContract);
        res.json(contracts);
    } catch (error) {
        console.error('Erreur lors de la récupération des contrats non en cours:', error);
        res.status(500).send({ message: "Erreur lors de la récupération des contrats non en cours", error });
    }
};

exports.streamOnGoingContracts = (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    
    const period = parseInt(req.query.period) || 2;
    const filter_trash = req.query.filter_trash !== 'false';
    
    let filter = {
        status: { $in: ['in_progress', null] },
        dateAdd: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - period)) }
    };
    
    if (filter_trash) {
        filter.trash = false;
    }
    
    const cursor = ContractModel.find(filter)
    .sort({ dateAdd: -1 })
    .populate('customer')
    .populate('contact')
    .populate('external_contributor')
    .populate('subcontractor')
    .cursor();
    
    cursor.eachAsync((contract) => {
        sanitizeContract(contract);
        res.write(`data: ${JSON.stringify(contract)}\n\n`);
    })
    .then(() => res.end())
    .catch(err => {
        console.error('Erreur lors du streaming des contrats en cours:', err);
        res.status(500).end();
    });
};

exports.streamNotOnGoingContracts = (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    
    const cursor = ContractModel.find({ status: { $ne: 'in_progress' } })
    .sort({ 'dateAdd': 'desc' })
    .populate('customer')
    .populate('contact')
    .populate('external_contributor')
    .populate('subcontractor')
    .cursor();
    
    cursor.eachAsync((contract) => {
        sanitizeContract(contract);
        res.write(`data: ${JSON.stringify(contract)}\n\n`);
    })
    .then(() => res.end())
    .catch(err => {
        console.error('Erreur lors du streaming des contrats non en cours:', err);
        res.status(500).end();
    });
};

exports.streamOrdersByTag = (req, res) => {
    const { status, incident = false } = req.query;
    
    let query = {};
    if (status) {
        query.status = status;
    }
    if (incident) {
        query.incident = { $exists: true, $not: { $size: 0 } };
    }
    
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    
    const sortOrder = status === 'in_progress' ? 'asc' : 'desc';
    
    Contract.find(query)
    .sort({ 'internal_number': 1, 'dateAdd': sortOrder })
    .populate('customer contact external_contributor subcontractor')
    .then(contracts => {
        const groupedContracts = groupByInternalNumber(contracts);
        for (const group of groupedContracts) {
            group.forEach(sanitizeContract);
            res.write(`data: ${JSON.stringify(group)}\n\n`);
        }
        res.end();
    })
    .catch(err => {
        console.error('Erreur lors du streaming des contrats:', err);
        res.status(500).end();
    });
};

function groupByInternalNumber(contracts) {
    const groupedContracts = [];
    let currentInternalNumber = null;
    let currentGroup = [];
    for (const contract of contracts) {
        if (contract.internal_number !== currentInternalNumber) {
            if (currentGroup.length > 0) {
                groupedContracts.push(currentGroup);
            }
            currentGroup = [];
            currentInternalNumber = contract.internal_number;
        }
        currentGroup.push(contract);
    }
    if (currentGroup.length > 0) {
        groupedContracts.push(currentGroup);
    }
    return groupedContracts;
};


exports.addContract = async (req, res) => {
    try {
        const {
            internal_number = '',
            customer = null,
            contact = null,
            internal_contributor = null,
            external_contributor = null,
            external_contributor_amount = 0,
            subcontractor = null,
            subcontractor_amount = 0,
            address = '',
            appartment_number = '',
            ss4 = false,
            quote_number = '',
            mail_sended = false,
            invoice_number = '',
            amount_ht = 0,
            benefit_ht = 0,
            execution_data_day = 0,
            execution_data_hour = 0,
            prevision_data_day = 0,
            prevision_data_hour = 0,
            benefit = '',
            status = '',
            occupied = false,
            start_date_works = null,
            end_date_works = null,
            end_date_customer = null,
            trash = false,
            date_cde = null,
            billing_amount = 0,
            createdBy = null
        } = req.body;

        const currentDate = new Date();
        const dateAdd = currentDate;
        const external_contributor_invoice_date = new Date();
        external_contributor_invoice_date.setDate(currentDate.getDate() + 2);

        const newContract = new ContractModel({
            internal_number: internal_number || 'Default-Number',
            customer: customer ? new mongoose.Types.ObjectId(customer) : null,
            contact: contact ? new mongoose.Types.ObjectId(contact) : null,
            internal_contributor: internal_contributor ? new mongoose.Types.ObjectId(internal_contributor) : null,
            external_contributor: external_contributor ? new mongoose.Types.ObjectId(external_contributor) : null,
            external_contributor_amount,
            subcontractor: subcontractor ? new mongoose.Types.ObjectId(subcontractor) : null,
            subcontractor_amount,
            address,
            appartment_number,
            ss4,
            quote_number,
            mail_sended,
            invoice_number,
            amount_ht,
            benefit_ht,
            execution_data_day,
            execution_data_hour,
            prevision_data_day,
            prevision_data_hour,
            benefit,
            status,
            occupied,
            start_date_works: start_date_works ? new Date(start_date_works) : null,
            end_date_works: end_date_works ? new Date(end_date_works) : null,
            end_date_customer: end_date_customer ? new Date(end_date_customer) : null,
            trash,
            date_cde: date_cde ? new Date(date_cde) : new Date(),
            billing_amount,
            dateAdd: dateAdd,
            external_contributor_invoice_date,
            createdBy: createdBy ? new mongoose.Types.ObjectId(internal_contributor) : null
        });

        await newContract.save();

        const replacements = await EmailUtils.getEmailReplacements(newContract);
        await EmailService.sendEmail(newContract.customer.email, 'Notification de commande', replacements, 'orderNotificationTemplate');

        // if (newContract.end_date_customer) {
        //     await scheduleRecurringEmails(newContract._id, newContract.end_date_customer);
        // }

        res.status(201).json({
            message: 'Contrat créé avec succès.',
            contractId: newContract._id,
            contract: newContract
        });
    } catch (error) {
        console.error('Erreur lors de l’ajout d’un nouveau contrat:', error);
        res.status(500).json({ error: error.message });
    }
};

// exports.updateContract = async (req, res) => {
//     try {
//         const { contractId } = req.params;
//         const updateData = { ...req.body };
//         console.log('Modification du contrat', contractId, updateData);
        
//         ['customer', 'contact', 'external_contributor', 'subcontractor'].forEach(key => {
//             if (updateData[key] && mongoose.isValidObjectId(updateData[key])) {
//                 updateData[key] = new mongoose.Types.ObjectId(updateData[key]);
//             }
//         });
        
//         ['start_date_works', 'end_date_works', 'end_date_customer', 'date_cde'].forEach(dateKey => {
//             if (updateData[dateKey] && isNaN(Date.parse(updateData[dateKey]))) {
//                 delete updateData[dateKey];
//             } else if (updateData[dateKey]) {
//                 updateData[dateKey] = new Date(updateData[dateKey]);
//             }
//         });
        
//         const updatedContract = await ContractModel.findByIdAndUpdate(
//             contractId,
//             updateData, { new: true, runValidators: true }
//         );
        
//         if (!updatedContract) {
//             return res.status(404).json({ message: 'Contrat non trouvé.', contractId });
//         }
        
//         const replacements = await EmailUtils.getEmailReplacements(updatedContract);
//         await EmailService.sendEmail(updatedContract.customer.email, 'Mise à jour de la commande', replacements, 'orderUpdateNotificationTemplate');
        
//         res.status(200).json({
//             contract: updatedContract,
//             message: 'Contrat modifié avec succès.'
//         });
//     } catch (error) {
//         console.error('Erreur lors de la modification du contrat:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// exports.updateContract = async (req, res) => {
//     try {
//         const { contractId } = req.params;
//         const updateData = { ...req.body };
//         console.log('Modification du contrat', contractId, updateData);

//         ['customer', 'contact', 'external_contributor', 'subcontractor'].forEach(key => {
//             if (updateData[key] && mongoose.isValidObjectId(updateData[key])) {
//                 updateData[key] = new mongoose.Types.ObjectId(updateData[key]);
//             }
//         });

//         ['start_date_works', 'end_date_works', 'end_date_customer', 'date_cde'].forEach(dateKey => {
//             if (updateData[dateKey] && isNaN(Date.parse(updateData[dateKey]))) {
//                 delete updateData[dateKey];
//             } else if (updateData[dateKey]) {
//                 updateData[dateKey] = new Date(updateData[dateKey]);
//             }
//         });

//         const updatedContract = await ContractModel.findByIdAndUpdate(
//             contractId,
//             updateData, { new: true, runValidators: true }
//         ).populate('external_contributor');

//         if (!updatedContract) {
//             return res.status(404).json({ message: 'Contrat non trouvé.', contractId });
//         }

//         const replacements = await EmailUtils.getEmailReplacements(updatedContract);
//         await EmailService.sendEmail(updatedContract.customer.email, 'Mise à jour de la commande', replacements, 'orderUpdateNotificationTemplate');

//         // Check if status is changed and if it is 'achieved' or 'cancelled'
//         if (updateData.status && (updateData.status === 'achieved' || updateData.status === 'cancelled')) {
//             const currentYear = new Date().getFullYear();
//             const startDate = new Date(currentYear, 0, 1);
//             const endDate = new Date(currentYear + 1, 0, 1);

//             const contracts = await ContractModel.find({
//                 internal_number: updatedContract.internal_number,
//                 dateAdd: { $gte: startDate, $lt: endDate }
//             }).populate('external_contributor');

//             const allAchievedOrCancelled = contracts.every(contract => 
//                 contract.status === 'achieved' || contract.status === 'cancelled'
//             );

//             if (allAchievedOrCancelled) {
//                 const nextDay = new Date(updatedContract.end_date_customer);
//                 nextDay.setDate(nextDay.getDate() + 1);

//                 const replacements = {
//                     'contracts': await Promise.all(contracts.map(async c => ({
//                         'internal_number': c.internal_number,
//                         'benefit': await getBenefitName(c.benefit),
//                         'end_date_customer': formatDate(c.end_date_customer),
//                         'status': translateStatus(c.status),
//                         'address': c.address,
//                         'appartment_number': c.appartment_number,
//                         'external_contributor_name': `${c.external_contributor.firstname} ${c.external_contributor.lastname}`
//                     }))),
//                     'CRM_URL': process.env.CRM_URL
//                 };

//                 await scheduleRecurringEmails(updatedContract.internal_number, nextDay, 3, replacements);
//             }
//         }

//         res.status(200).json({
//             contract: updatedContract,
//             message: 'Contrat modifié avec succès.'
//         });
//     } catch (error) {
//         console.error('Erreur lors de la modification du contrat:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

const sendFinalizedOrderSummaryEmail = async (customerEmail, contracts) => {
    const replacements = {
        'contracts': await Promise.all(contracts.map(async contract => ({
            'internal_number': contract.internal_number,
            'benefit': await getBenefitName(contract.benefit),
            'end_date_customer': formatDate(contract.end_date_customer),
            'status': translateStatus(contract.status),
            'address': contract.address,
            'appartment_number': contract.appartment_number,
            'external_contributor_name': `${contract.external_contributor.firstname} ${contract.external_contributor.lastname}`
        }))),
        'CRM_URL': process.env.CRM_URL
    };

    await EmailService.sendEmail(customerEmail, 'Récapitulatif des commandes terminées/annulées', replacements, 'orderSummaryTemplate');
};


exports.updateContract = async (req, res) => {
    try {
        const { contractId } = req.params;
        const updateData = { ...req.body };
        console.log('Modification du contrat', contractId, updateData);

        ['customer', 'contact', 'external_contributor', 'subcontractor'].forEach(key => {
            if (updateData[key] && mongoose.isValidObjectId(updateData[key])) {
                updateData[key] = new mongoose.Types.ObjectId(updateData[key]);
            }
        });

        ['start_date_works', 'end_date_works', 'end_date_customer', 'date_cde'].forEach(dateKey => {
            if (updateData[dateKey] && isNaN(Date.parse(updateData[dateKey]))) {
                delete updateData[dateKey];
            } else if (updateData[dateKey]) {
                updateData[dateKey] = new Date(updateData[dateKey]);
            }
        });

        const updatedContract = await ContractModel.findByIdAndUpdate(
            contractId,
            updateData, { new: true, runValidators: true }
        ).populate('external_contributor customer');

        if (!updatedContract) {
            return res.status(404).json({ message: 'Contrat non trouvé.', contractId });
        }

        const replacements = await EmailUtils.getEmailReplacements(updatedContract);
        await EmailService.sendEmail(updatedContract.customer.email, 'Mise à jour de la commande', replacements, 'orderUpdateNotificationTemplate');

        if (updateData.status && (updateData.status === 'achieved' || updateData.status === 'cancelled')) {
            const currentYear = new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear + 1, 0, 1);

            const contracts = await ContractModel.find({
                internal_number: updatedContract.internal_number,
                dateAdd: { $gte: startDate, $lt: endDate }
            }).populate('external_contributor customer');

            const allAchievedOrCancelled = contracts.every(contract => 
                contract.status === 'achieved' || contract.status === 'cancelled'
            );

            if (allAchievedOrCancelled) {
                const nextDay = new Date(updatedContract.end_date_customer);
                nextDay.setDate(nextDay.getDate() + 1);

                const replacementsForContractors = {
                    'contracts': await Promise.all(contracts.map(async c => ({
                        'internal_number': c.internal_number,
                        'benefit': await getBenefitName(c.benefit),
                        'end_date_customer': formatDate(c.end_date_customer),
                        'status': translateStatus(c.status),
                        'address': c.address,
                        'appartment_number': c.appartment_number,
                        'external_contributor_name': `${c.external_contributor.firstname} ${c.external_contributor.lastname}`
                    }))),
                    'CRM_URL': process.env.CRM_URL
                };

                await scheduleRecurringEmails(updatedContract.internal_number, nextDay, 3, replacementsForContractors);

                const customerContracts = contracts.map(contract => ({
                    'internal_number': contract.internal_number,
                    'benefit': getBenefitName(contract.benefit),
                    'end_date_customer': formatDate(contract.end_date_customer),
                    'status': translateStatus(contract.status),
                    'address': contract.address,
                    'appartment_number': contract.appartment_number,
                    'external_contributor_name': `${contract.external_contributor.firstname} ${contract.external_contributor.lastname}`
                }));

                await sendFinalizedOrderSummaryEmail(updatedContract.customer.email, customerContracts);
            }
        }

        res.status(200).json({
            contract: updatedContract,
            message: 'Contrat modifié avec succès.'
        });
    } catch (error) {
        console.error('Erreur lors de la modification du contrat:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.deleteContract = async (req, res) => {
    try {
        const { contractId } = req.params;
        const deletedContract = await ContractModel.findByIdAndDelete(contractId);
        
        if (!deletedContract) {
            return res.status(404).json({ message: 'Contrat non trouvé.' });
        }
        
        res.status(200).json({ message: 'Contrat supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression du contrat:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getContractsInternalNumbers = async (req, res) => {
    try {
        console.log('Récupération des numéros internes des contrats pour l\'année ', new Date().getFullYear());
        const contracts = await ContractModel.find({
            date_cde: {
                $gte: new Date(new Date().getFullYear(), 0, 1),
                $lt: new Date(new Date().getFullYear() + 1, 0, 1)
            }
        });
        console.log(`Found ${contracts.length} contracts`);
        
        const internalNumbers = contracts.map(contract => contract.internal_number);
        res.status(200).json(internalNumbers);
    } catch (error) {
        console.error('Erreur lors de la récupération des numéros internes des contrats:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.addObservation = async (req, res) => {
    console.log('Tentative d\'ajout d\'une observation à un contrat');
    try {
        const { contractId, dateAdd, user, comment } = req.body;
        const userObjectId = new mongoose.Types.ObjectId(user);
        
        const updatedContract = await ContractModel.findByIdAndUpdate(
            contractId, {
                $push: {
                    observation: {
                        dateAdd: dateAdd,
                        user: userObjectId,
                        comment: comment,
                        _id: new mongoose.Types.ObjectId()
                    }
                }
            }, { new: true, useFindAndModify: false }
        );
        
        if (!updatedContract) {
            console.log('Contrat non trouvé.');
            return res.status(404).json({ message: 'Contrat non trouvé.' });
        }
        
        console.log('Observation ajoutée avec succès.');
        res.status(200).json(updatedContract);
        
        const replacements = await EmailUtils.getEmailReplacements(updatedContract, {
            'observation.dateAdd': new Date(dateAdd).toISOString().split('T')[0],
            'observation.comment': comment || ''
        });
        
        await EmailService.sendEmail(updatedContract.customer.email, 'Nouvelle observation ajoutée', replacements, 'observationNotificationTemplate');
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'observation:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteObservation = async (req, res) => {
    try {
        const observationId = req.params.observationId;
        console.log('Suppression de l\'observation avec l\'ID:', observationId);
        
        const observationObjectId = new mongoose.Types.ObjectId(observationId);
        
        const updatedContract = await ContractModel.findOneAndUpdate({
            'observation._id': observationObjectId
        }, {
            $pull: {
                observation: {
                    _id: observationObjectId
                }
            }
        }, { new: true });
        
        if (!updatedContract) {
            return res.status(404).json({ message: 'Observation non trouvée.' });
        }
        
        res.status(200).json({
            message: 'Observation supprimée avec succès.',
            contract: updatedContract
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'observation:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getObservations = async (req, res) => {
    try {
        const { contractId } = req.params;
        const contract = await ContractModel.findById(contractId)
        .populate({
            path: 'observation.user',
            select: 'firstname lastname'
        })
        .select('observation');
        console.log('Récupération des observations d\'un contrat');
        if (!contract) {
            return res.status(404).json({ message: 'Contrat non trouvé.' });
        }
        
        const observationsWithUserDetails = await Promise.all(
            contract.observation.map(async (obs) => {
                const user = await User.findById(obs.user).select('firstname lastname');
                return {
                    ...obs,
                    user: user ? {
                        firstname: user.firstname,
                        lastname: user.lastname
                    } : null
                };
            })
        );
        
        console.log("Observation: ", observationsWithUserDetails);
        res.status(200).json(observationsWithUserDetails);
    } catch (error) {
        console.error('Erreur lors de la récupération des observations d\'un contrat:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.addIncident = async (req, res) => {
    console.log('Tentative d\'ajout d\'un incident à un contrat');
    try {
        const { contractId, dateAdd, user, comment } = req.body;
        const userObjectId = new mongoose.Types.ObjectId(user);
        
        const updatedContract = await ContractModel.findByIdAndUpdate(
            contractId, {
                $push: {
                    incident: {
                        comment: comment,
                        dateAdd: dateAdd,
                        user: userObjectId,
                        _id: new mongoose.Types.ObjectId()
                    }
                }
            }, { new: true }
        );
        
        if (!updatedContract) {
            console.log('Contrat non trouvé.');
            return res.status(404).json({ message: 'Contrat non trouvé.' });
        }
        
        console.log('Incident ajouté avec succès.');
        res.status(200).json(updatedContract);
        
        const replacements = await EmailUtils.getEmailReplacements(updatedContract, {
            'incident.dateAdd': new Date(dateAdd).toISOString().split('T')[0],
            'incident.comment': comment || ''
        });
        
        await EmailService.sendEmail(updatedContract.customer.email, 'Nouvel incident ajouté', replacements, 'incidentNotificationTemplate');
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'incident:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteIncident = async (req, res) => {
    try {
        const incidentId = req.params.incidentId;
        console.log('Suppression de l\'incident avec l\'ID:', incidentId);
        
        const incidentObjectId = new mongoose.Types.ObjectId(incidentId);
        
        const updatedContract = await ContractModel.findOneAndUpdate({
            'incident._id': incidentObjectId
        }, {
            $pull: {
                incident: {
                    _id: incidentObjectId
                }
            }
        }, { new: true });
        
        if (!updatedContract) {
            return res.status(404).json({ message: 'Incident non trouvé.' });
        }
        
        res.status(200).json({
            message: 'Incident supprimé avec succès.',
            contract: updatedContract
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'incident:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getIncidents = async (req, res) => {
    console.log('Tentative de récupération des incidents d\'un contrat');
    try {
        const { contractId } = req.params;
        const contract = await ContractModel.findById(contractId)
        .select('incident');
        
        if (!contract) {
            console.log('Contrat non trouvé.');
            return res.status(404).json({ message: 'Contrat non trouvé.' });
        }
        
        const incidentsWithUserDetails = await Promise.all(
            contract.incident.map(async (incident) => {
                const user = await User.findById(incident.user).select('firstname lastname');
                return {
                    ...incident,
                    user: user ? {
                        firstname: user.firstname,
                        lastname: user.lastname
                    } : null
                };
            })
        );
        
        console.log('Incidents récupérés avec succès.');
        res.status(200).json(incidentsWithUserDetails);
    } catch (error) {
        console.error('Erreur lors de la récupération des incidents:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateObservationProcessedStatus = async (req, res) => {
    console.log('Mise à jour du statut de traitement de l\'observation');
    try {
        const { observationId } = req.params;
        const { processed } = req.body;
        console.log('Observation ID:', observationId);
        console.log('Statut de traitement:', processed);

        const observationObjectId = new mongoose.Types.ObjectId(observationId);

        const updatedContract = await ContractModel.findOneAndUpdate(
            { 'observation._id': observationObjectId },
            { $set: { 'observation.$[elem].processed': processed } },
            {
                arrayFilters: [{ 'elem._id': observationObjectId }],
                new: true
            }
        );

        if (!updatedContract) {
            return res.status(404).json({ message: 'Observation non trouvée.' });
        }

        res.status(200).json(updatedContract);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateIncidentProcessedStatus = async (req, res) => {
    console.log('Mise à jour du statut de traitement de l\'incident');
    try {
        const { incidentId } = req.params;
        const { processed } = req.body;
        console.log('Incident ID:', incidentId);
        console.log('Statut de traitement:', processed);

        const incidentObjectId = new mongoose.Types.ObjectId(incidentId);

        const updatedContract = await ContractModel.findOneAndUpdate(
            { 'incident._id': incidentObjectId },
            { $set: { 'incident.$[elem].processed': processed } },
            {
                arrayFilters: [{ 'elem._id': incidentObjectId }],
                new: true
            }
        );

        if (!updatedContract) {
            return res.status(404).json({ message: 'Incident non trouvé.' });
        }

        res.status(200).json(updatedContract);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};





  


exports.getEmailSchedule = async (req, res) => {
    console.log('Récupération de la planification des emails');
    try {
        const { contractId } = req.params;
        const emailTask = await EmailTask.findOne({ contractId });
        
        if (!emailTask) {
            return res.status(200).json({
                message: 'Aucune planification des emails trouvée.',
                nextEmailDate: null,
                interval: null,
                enabled: false,
                endDateCustomer: null
            });
        }

        res.status(200).json({
            nextEmailDate: emailTask.scheduledDate,
            interval: emailTask.interval,
            enabled: emailTask.mailSended,
            endDateCustomer: emailTask.scheduledDate || null
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la planification des emails:', error);
        res.status(500).json({ error: error.message });
    }
};


// exports.updateEmailSchedule = async (req, res) => {
//     try {
//         const { contractId } = req.params;
//         const { nextEmailDate, interval, enabled } = req.body;

//         console.log('Mise à jour de la planification des emails pour le contrat', contractId);
//         console.log('Données de mise à jour :', req.body);

//         const updateData = {
//             contractId: contractId,
//             scheduledDate: nextEmailDate ? new Date(nextEmailDate) : null,
//             interval: interval,
//             mailSended: enabled
//         };

//         const emailTask = await EmailTask.findOneAndUpdate(
//             { contractId },
//             updateData,
//             { new: true, upsert: true, setDefaultsOnInsert: true }
//         );

//         console.log('Planification des emails après mise à jour:', emailTask);
//         res.status(200).json({ message: 'Planification des emails mise à jour.', emailTask });
//     } catch (error) {
//         console.error('Erreur lors de la mise à jour de la planification des emails:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// exports.updateEmailSchedule = async (req, res) => {
//     try {
//         const { contractId } = req.params;
//         const { nextEmailDate, interval, enabled } = req.body;

//         console.log('Mise à jour de la planification des emails pour le contrat', contractId);
//         console.log('Données de mise à jour :', req.body);

//         const updateData = {
//             contractId: contractId,
//             scheduledDate: nextEmailDate ? new Date(nextEmailDate) : null,
//             interval: interval,
//             mailSended: enabled
//         };

//         const emailTask = await EmailTask.findOneAndUpdate(
//             { contractId },
//             updateData,
//             { new: true, upsert: true, setDefaultsOnInsert: true }
//         );

//         if (enabled) {
//             const contract = await ContractModel.findById(contractId);
//             const contracts = await ContractModel.find({ internal_number: contract.internal_number });

//             const replacements = {
//                 'contracts': contracts.map(c => ({
//                     'internal_number': c.internal_number,
//                     'benefit': c.benefit,
//                     'end_date_customer': c.end_date_customer,
//                     'status': c.status
//                 })),
//                 'CRM_URL': process.env.CRM_URL
//             };

//             await scheduleRecurringEmails(contract.internal_number, nextEmailDate, interval, replacements);
//         }

//         console.log('Planification des emails après mise à jour:', emailTask);
//         res.status(200).json({ message: 'Planification des emails mise à jour.', emailTask });
//     } catch (error) {
//         console.error('Erreur lors de la mise à jour de la planification des emails:', error);
//         res.status(500).json({ error: error.message });
//     }
// };


// exports.updateEmailSchedule = async (req, res) => {
//     try {
//         const { contractId } = req.params;
//         const { nextEmailDate, interval, enabled } = req.body;

//         console.log('Mise à jour de la planification des emails pour le contrat', contractId);
//         console.log('Données de mise à jour :', req.body);

//         let updateData;

//         if (isTestMode) {
//             const currentDate = new Date();
//             const currentDateUTC = new Date(
//                 Date.UTC(
//                     currentDate.getUTCFullYear(),
//                     currentDate.getUTCMonth(),
//                     currentDate.getUTCDate(),
//                     currentDate.getUTCHours(),
//                     currentDate.getUTCMinutes(),
//                     currentDate.getUTCSeconds()
//                 )
//             );
//             const currentDatePlusOneMinute = new Date(currentDateUTC.getTime() + 60000);

//             updateData = {
//                 contractId: contractId,
//                 scheduledDate: currentDatePlusOneMinute, // dans une minute en UTC
//                 interval: interval * 60,  // Utilise des secondes pour les tests
//                 mailSended: enabled
//             };
//         } else {
//             updateData = {
//                 contractId: contractId,
//                 scheduledDate: nextEmailDate ? new Date(nextEmailDate) : null,
//                 interval: interval,  // intervalle en jours
//                 mailSended: enabled
//             };
//         }

//         const emailTask = await EmailTask.findOneAndUpdate(
//             { contractId },
//             updateData,
//             { new: true, upsert: true, setDefaultsOnInsert: true }
//         );

//         if (enabled) {
//             const contract = await ContractModel.findById(contractId).populate('external_contributor');
//             const contracts = await ContractModel.find({ internal_number: contract.internal_number }).populate('external_contributor');
//             console.log('Contrats trouvés pour le numéro interne:', contract.internal_number);
//             console.log('Contrats trouvés:', contracts);

//             const replacements = {
//                 contracts: contracts.map(c => ({
//                     internal_number: c.internal_number,
//                     benefit: c.benefit,
//                     end_date_customer: c.end_date_customer,
//                     status: c.status,
//                     address: c.address,
//                     appartment_number: c.appartment_number,
//                     external_contributor_name: `${c.external_contributor.firstname} ${c.external_contributor.lastname}`
//                 })),
//                 CRM_URL: process.env.CRM_URL
//             };

//             console.log('replacements:', replacements);

//             updateData.replacements = replacements; // Ajouter les remplacements aux données de mise à jour

//             await scheduleRecurringEmails(contract.internal_number, updateData.scheduledDate, updateData.interval, replacements); // Utilisez des secondes pour les tests
//         }

//         console.log('Planification des emails après mise à jour:', emailTask);
//         res.status(200).json({ message: 'Planification des emails mise à jour.', emailTask });
//     } catch (error) {
//         console.error('Erreur lors de la mise à jour de la planification des emails:', error);
//         res.status(500).json({ error: error.message });
//     }
// };


// exports.updateEmailSchedule = async (req, res) => {
//     try {
//         const { contractId } = req.params;
//         const { nextEmailDate, interval, enabled } = req.body;

//         console.log('Mise à jour de la planification des emails pour le contrat', contractId);
//         console.log('Données de mise à jour :', req.body);

//         const contract = await ContractModel.findById(contractId).populate('external_contributor');
//         const contracts = await ContractModel.find({ internal_number: contract.internal_number }).populate('external_contributor');
//         console.log('Contrats trouvés pour le numéro interne:', contract.internal_number);
//         console.log('Contrats trouvés:', contracts);

//         // const replacements = {
//         //     contracts: contracts.map(c => ({
//         //         internal_number: c.internal_number,
//         //         benefit: c.benefit,
//         //         end_date_customer: c.end_date_customer,
//         //         status: c.status,
//         //         address: c.address,
//         //         appartment_number: c.appartment_number,
//         //         external_contributor_name: `${c.external_contributor.firstname} ${c.external_contributor.lastname}`
//         //     })),
//         //     CRM_URL: process.env.CRM_URL
//         // };
//         const replacements = {
//             'contracts': await Promise.all(contracts.map(async c => ({
//                 'internal_number': c.internal_number,
//                 'benefit': await getBenefitName(c.benefit),
//                 'end_date_customer': formatDate(c.end_date_customer),
//                 'status': translateStatus(c.status),
//                 'address': c.address,
//                 'appartment_number': c.appartment_number,
//                 'external_contributor_name': `${c.external_contributor.firstname} ${c.external_contributor.lastname}`
//             }))),
//             'CRM_URL': process.env.CRM_URL
//         };

//         let updateData;

//         if (isTestMode) {
//             const currentDate = new Date();
//             const currentDateUTC = new Date(
//                 Date.UTC(
//                     currentDate.getUTCFullYear(),
//                     currentDate.getUTCMonth(),
//                     currentDate.getUTCDate(),
//                     currentDate.getUTCHours(),
//                     currentDate.getUTCMinutes(),
//                     currentDate.getUTCSeconds()
//                 )
//             );
//             const currentDatePlusOneMinute = new Date(currentDateUTC.getTime() + 60000);

//             updateData = {
//                 contractId: contractId,
//                 scheduledDate: currentDatePlusOneMinute, // dans une minute en UTC
//                 interval: interval * 60,  // Utilise des secondes pour les tests
//                 mailSended: enabled,
//                 replacements: replacements
//             };
//         } else {
//             updateData = {
//                 contractId: contractId,
//                 scheduledDate: nextEmailDate ? new Date(nextEmailDate) : null,
//                 interval: interval,  // intervalle en jours
//                 mailSended: enabled,
//                 replacements: replacements
//             };
//         }

//         const emailTask = await EmailTask.findOneAndUpdate(
//             { contractId },
//             updateData,
//             { new: true, upsert: true, setDefaultsOnInsert: true }
//         );

//         if (enabled) {
//             await scheduleRecurringEmails(contract.internal_number, updateData.scheduledDate, updateData.interval, replacements); // Utilisez des secondes pour les tests
//         }

//         console.log('Planification des emails après mise à jour:', emailTask);
//         res.status(200).json({ message: 'Planification des emails mise à jour.', emailTask });
//     } catch (error) {
//         console.error('Erreur lors de la mise à jour de la planification des emails:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// exports.updateEmailSchedule = async (req, res) => {
//     try {
//         const { contractId } = req.params;
//         const { nextEmailDate, interval, enabled } = req.body;

//         console.log('Mise à jour de la planification des emails pour le contrat', contractId);
//         console.log('Données de mise à jour :', req.body);

//         const contract = await ContractModel.findById(contractId).populate('external_contributor');
//         const contracts = await ContractModel.find({ internal_number: contract.internal_number }).populate('external_contributor');
//         console.log('Contrats trouvés pour le numéro interne:', contract.internal_number);
//         console.log('Contrats trouvés:', contracts);

//         const formattedContracts = await Promise.all(contracts.map(async c => ({
//             internal_number: c.internal_number,
//             benefit: await getBenefitName(c.benefit),
//             end_date_customer: c.end_date_customer,
//             status: translateStatus(c.status),
//             address: c.address,
//             appartment_number: c.appartment_number,
//             external_contributor_name: `${c.external_contributor.firstname} ${c.external_contributor.lastname}`
//         })));

//         const replacements = {
//             contracts: formattedContracts,
//             CRM_URL: process.env.CRM_URL
//         };

//         let updateData;

//         if (isTestMode) {
//             const currentDate = new Date();
//             const currentDateUTC = new Date(
//                 Date.UTC(
//                     currentDate.getUTCFullYear(),
//                     currentDate.getUTCMonth(),
//                     currentDate.getUTCDate(),
//                     currentDate.getUTCHours(),
//                     currentDate.getUTCMinutes(),
//                     currentDate.getUTCSeconds()
//                 )
//             );
//             const currentDatePlusOneMinute = new Date(currentDateUTC.getTime() + 60000);

//             updateData = {
//                 contractId: contractId,
//                 scheduledDate: currentDatePlusOneMinute, // dans une minute en UTC
//                 interval: interval * 60,  // Utilise des secondes pour les tests
//                 mailSended: enabled,
//                 replacements: replacements
//             };
//         } else {
//             updateData = {
//                 contractId: contractId,
//                 scheduledDate: nextEmailDate ? new Date(nextEmailDate) : null,
//                 interval: interval,  // intervalle en jours
//                 mailSended: enabled,
//                 replacements: replacements
//             };
//         }

//         const emailTask = await EmailTask.findOneAndUpdate(
//             { contractId },
//             updateData,
//             { new: true, upsert: true, setDefaultsOnInsert: true }
//         );

//         if (enabled) {
//             await scheduleRecurringEmails(contract.internal_number, updateData.scheduledDate, updateData.interval, replacements); // Utilisez des secondes pour les tests
//         }

//         console.log('Planification des emails après mise à jour:', emailTask);
//         res.status(200).json({ message: 'Planification des emails mise à jour.', emailTask });
//     } catch (error) {
//         console.error('Erreur lors de la mise à jour de la planification des emails:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

exports.updateEmailSchedule = async (req, res) => {
    try {
        const { contractId } = req.params;
        const { nextEmailDate, interval, enabled } = req.body;

        console.log('Mise à jour de la planification des emails pour le contrat', contractId);
        console.log('Données de mise à jour :', req.body);

        const contract = await ContractModel.findById(contractId).populate('external_contributor');
        const contracts = await ContractModel.find({ internal_number: contract.internal_number }).populate('external_contributor');
        console.log('Contrats trouvés pour le numéro interne:', contract.internal_number);
        console.log('Contrats trouvés:', contracts);

        const replacements = {
            'contracts': await Promise.all(contracts.map(async c => ({
                'internal_number': c.internal_number,
                'benefit': await getBenefitName(c.benefit),
                'end_date_customer': c.end_date_customer,
                'status': translateStatus(c.status),
                'address': c.address,
                'appartment_number': c.appartment_number,
                'external_contributor_name': `${c.external_contributor.firstname} ${c.external_contributor.lastname}`
            }))),
            'CRM_URL': process.env.CRM_URL
        };

        if (!enabled) {
            // Désactiver les emails récurrents
            const result = await EmailTask.findOneAndDelete({ contractId });
            if (!result) {
                return res.status(404).json({ message: 'Planification des emails non trouvée.' });
            }
            console.log('Planification des emails supprimée:', result);
            return res.status(200).json({ message: 'Planification des emails désactivée avec succès.' });
        }

        let updateData;

        if (isTestMode) {
            const currentDate = new Date();
            const currentDateUTC = new Date(
                Date.UTC(
                    currentDate.getUTCFullYear(),
                    currentDate.getUTCMonth(),
                    currentDate.getUTCDate(),
                    currentDate.getUTCHours(),
                    currentDate.getUTCMinutes(),
                    currentDate.getUTCSeconds()
                )
            );
            const currentDatePlusOneMinute = new Date(currentDateUTC.getTime() + 60000);

            updateData = {
                contractId: contractId,
                scheduledDate: currentDatePlusOneMinute,
                interval: interval * 60,
                mailSended: enabled,
                replacements: replacements
            };
        } else {
            updateData = {
                contractId: contractId,
                scheduledDate: nextEmailDate ? new Date(nextEmailDate) : null,
                interval: interval,
                mailSended: enabled,
                replacements: replacements
            };
        }

        const emailTask = await EmailTask.findOneAndUpdate(
            { contractId },
            updateData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (enabled) {
            await scheduleRecurringEmails(contract.internal_number, updateData.scheduledDate, updateData.interval, replacements);
        }

        console.log('Planification des emails après mise à jour:', emailTask);
        res.status(200).json({ message: 'Planification des emails mise à jour.', emailTask });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la planification des emails:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEmailSchedule = async (req, res) => {
    try {
        const { contractId } = req.params;
        console.log('Suppression de la planification des emails pour le contrat', contractId);

        const result = await EmailTask.findOneAndDelete({ contractId });

        if (!result) {
            return res.status(404).json({ message: 'Planification des emails non trouvée.' });
        }

        console.log('Planification des emails supprimée:', result);
        res.status(200).json({ message: 'Planification des emails supprimée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la planification des emails:', error);
        res.status(500).json({ error: error.message });
    }
};
