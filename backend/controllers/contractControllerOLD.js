const ContractModel = require('../models/Contract');
const User = require('../models/User');
const mongoose = require('mongoose');
const {
    scheduleEmailToContributor,
    scheduleRecurringEmails
} = require('../schedulers/emailScheduler');
const Benefit = require('../models/benefit');

exports.getContractById = async (req, res) => {
    try {
        console.log('Fetching contract by id');
        console.log('Request :', req);
        const {
            contractId
        } = req.params;
        
        const contract = await ContractModel.findById(contractId);
        if (!contract) {
            return res.status(404).json({
                message: 'Contrat non trouvé.'
            });
        }
        
        res.status(200).json(contract);
    } catch (error) {
        console.error('Error retrieving contract:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getContracts = async (req, res) => {
    try {
        
        const contracts = await ContractModel.find()
        .populate('customer')
        .populate('contact')
        .populate('external_contributor')
        .populate('subcontractor');
        
        contracts.forEach(contract => {
            if (contract.customer) {
                if (contract.customer.password) {
                    contract.customer.password = undefined;
                }
                if (contract.customer.salt) {
                    contract.customer.salt = undefined;
                }
            }
            if (contract.contact) {
                if (contract.contact.password) {
                    contract.contact.password = undefined;
                }
                if (contract.contact.salt) {
                    contract.contact.salt = undefined;
                }
            }
            if (contract.external_contributor) {
                if (contract.external_contributor.password) {
                    contract.external_contributor.password = undefined;
                }
                if (contract.external_contributor.salt) {
                    contract.external_contributor.salt = undefined;
                }
            }
            if (contract.subcontractor) {
                if (contract.subcontractor.password) {
                    contract.subcontractor.password = undefined;
                }
                if (contract.subcontractor.salt) {
                    contract.subcontractor.salt = undefined;
                }
            }
        });
        
        res.json(contracts);
    } catch (error) {
        res.status(500).send({
            message: "Erreur lors de la récupération des contrats",
            error
        });
        console.error('Erreur lors de la récupération des contrats:', error);
    }
};

exports.getContractsByMonth = async (req, res) => {
    try {
        const {
            month
        } = req.query;
        const currentYear = new Date().getFullYear();
        
        const monthNumber = parseInt(month, 10);
        if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
            return res.status(400).send({
                message: "Le mois spécifié est invalide"
            });
        }
        
        const startDate = new Date(currentYear, monthNumber - 1, 1);
        const endDate = new Date(currentYear, monthNumber, 0, 23, 59, 59);
        
        const contracts = await ContractModel.find({
            dateAdd: {
                $gte: startDate,
                $lt: endDate
            }
        })
        .populate('customer')
        .populate('contact')
        .populate('external_contributor')
        .populate('subcontractor');
        
        contracts.forEach(contract => {
            if (contract.customer) {
                contract.customer.password = undefined;
                contract.customer.salt = undefined;
            }
            if (contract.contact) {
                contract.contact.password = undefined;
                contract.contact.salt = undefined;
            }
            if (contract.external_contributor) {
                contract.external_contributor.password = undefined;
                contract.external_contributor.salt = undefined;
            }
            if (contract.subcontractor) {
                contract.subcontractor.password = undefined;
                contract.subcontractor.salt = undefined;
            }
        });
        
        res.json(contracts);
    } catch (error) {
        res.status(500).send({
            message: "Erreur lors de la récupération des contrats pour le mois donné",
            error
        });
        console.error('Erreur lors de la récupération des contrats pour le mois donné:', error);
    }
};

exports.getOngoingContracts = async (req, res) => {
    try {
        
        const contracts = await ContractModel.find({
            status: 'in_progress'
        })
        .populate('customer')
        .populate('contact')
        .populate('external_contributor')
        .populate('subcontractor');
        
        contracts.forEach(contract => {
            if (contract.customer) {
                if (contract.customer.password) {
                    contract.customer.password = undefined;
                }
                if (contract.customer.salt) {
                    contract.customer.salt = undefined;
                }
            }
            if (contract.contact) {
                if (contract.contact.password) {
                    contract.contact.password = undefined;
                }
                if (contract.contact.salt) {
                    contract.contact.salt = undefined;
                }
            }
            if (contract.external_contributor) {
                if (contract.external_contributor.password) {
                    contract.external_contributor.password = undefined;
                }
                if (contract.external_contributor.salt) {
                    contract.external_contributor.salt = undefined;
                }
            }
            if (contract.subcontractor) {
                if (contract.subcontractor.password) {
                    contract.subcontractor.password = undefined;
                }
                if (contract.subcontractor.salt) {
                    contract.subcontractor.salt = undefined;
                }
            }
        });
        
        res.json(contracts);
    } catch (error) {
        res.status(500).send({
            message: "Erreur lors de la récupération des contrats en cours",
            error
        });
        console.error('Erreur lors de la récupération des contrats en cours:', error);
    }
};

exports.getNotOngoingContracts = async (req, res) => {
    try {
        
        const contracts = await ContractModel.find({
            status: {
                $ne: 'in_progress'
            }
        })
        .populate('customer')
        .populate('contact')
        .populate('external_contributor')
        .populate('subcontractor');
        
        contracts.forEach(contract => {
            if (contract.customer) {
                if (contract.customer.password) {
                    contract.customer.password = undefined;
                }
                if (contract.customer.salt) {
                    contract.customer.salt = undefined;
                }
            }
            if (contract.contact) {
                if (contract.contact.password) {
                    contract.contact.password = undefined;
                }
                if (contract.contact.salt) {
                    contract.contact.salt = undefined;
                }
            }
            if (contract.external_contributor) {
                if (contract.external_contributor.password) {
                    contract.external_contributor.password = undefined;
                }
                if (contract.external_contributor.salt) {
                    contract.external_contributor.salt = undefined;
                }
            }
            if (contract.subcontractor) {
                if (contract.subcontractor.password) {
                    contract.subcontractor.password = undefined;
                }
                if (contract.subcontractor.salt) {
                    contract.subcontractor.salt = undefined;
                }
            }
        });
        
        res.json(contracts);
    } catch (error) {
        res.status(500).send({
            message: "Erreur lors de la récupération des contrats non en cours",
            error
        });
        console.error('Erreur lors de la récupération des contrats non en cours:', error);
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
        status: {
            $in: ['in_progress', null]
        },
        dateAdd: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - period))
        }
    };
    
    if (filter_trash) {
        filter.trash = false;
    }
    
    const cursor = ContractModel.find(filter)
    .sort({
        dateAdd: -1
    })
    .populate('customer')
    .populate('contact')
    .populate('external_contributor')
    .populate('subcontractor')
    .cursor();
    
    cursor.eachAsync((contract) => {
        
        sanitizeContract(contract);
        
        res.write(`data: ${JSON.stringify(contract)}\n\n`);
    })
    .then(() => {
        res.end();
    })
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
    
    const cursor = ContractModel.find({
        status: {
            $ne: 'in_progress'
        }
    })
    .sort({
        'dateAdd': 'desc'
    })
    .populate('customer')
    .populate('contact')
    .populate('external_contributor')
    .populate('subcontractor')
    .cursor();
    
    cursor.eachAsync((contract) => {
        
        sanitizeContract(contract);
        
        res.write(`data: ${JSON.stringify(contract)}\n\n`);
    })
    .then(() => {
        res.end();
    })
    .catch(err => {
        console.error('Erreur lors du streaming des contrats non en cours:', err);
        res.status(500).end();
    });
};

exports.streamOrdersByTag = (req, res) => {
    const {
        status,
        incident = false
    } = req.query;
    
    let query = {};
    if (status) {
        query.status = status;
    }
    if (incident) {
        query.incident = {
            $exists: true,
            $not: {
                $size: 0
            }
        };
    }
    
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    
    const sortOrder = status === 'in_progress' ? 'asc' : 'desc';
    
    Contract.find(query)
    .sort({
        'internal_number': 1,
        'dateAdd': sortOrder
    })
    .populate('customer contact external_contributor subcontractor')
    .then(contracts => {
        
        const groupedContracts = groupByInternalNumber(contracts);
        for (const group of groupedContracts) {
            
            group.forEach(contract => sanitizeContract(contract));
            
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
        
        const getStatus = (status) => {
            const statusDict = {
                'in_progress': 'En cours',
                'null': 'En cours',
                null: 'En cours',
                'achieve': 'Réalisé',
                'canceled': 'Annulé',
                'invoiced': 'Facturé',
                'anomaly': 'Anomalie'
            };
            return statusDict[status] || 'Status inconnu';
        };
        
        const customerDetails = await User.findById(newContract.customer);
        const externalContributorDetails = await User.findById(newContract.external_contributor);
        const contactDetails = await User.findById(newContract.contact);
        const formattedDate = newContract.date_cde ? new Date(newContract.date_cde).toISOString().split('T')[0] : 'Aucune date fournie';
        const occupiedText = newContract.occupied ? 'Oui' : 'Non';
        const statusText = getStatus(newContract.status);
        const benefitDetails = await Benefit.findById(newContract.benefit).exec();
        const benefitName = benefitDetails ? benefitDetails.name : 'Prestation inconnue';
        
        const replacements = {
            'contract.internal_number': newContract.internal_number || '',
            'contract.date_cde': formattedDate,
            'customer.firstname': customerDetails.firstname || '',
            'customer.lastname': customerDetails.lastname || '',
            'contact.firstname': contactDetails ? contactDetails.firstname : '',
            'contact.lastname': contactDetails ? contactDetails.lastname : '',
            'benefit_name': benefitName,
            'contract.status': statusText,
            'contract.address': newContract.address || '',
            'contract.appartment_number': newContract.appartment_number || '',
            'contract.occupied': occupiedText,
            'CRM_URL': process.env.CRM_URL
        };
        
        const delayInMinutes = 1;
        const futureDate = new Date();
        futureDate.setMinutes(futureDate.getMinutes() + delayInMinutes);
        
        if (customerDetails && customerDetails.email) {
            await scheduleEmailToContributor(
                customerDetails.email,
                replacements,
                futureDate,
                'orderNotificationTemplate'
            );
        }
        
        if (externalContributorDetails && externalContributorDetails.email) {
            await scheduleEmailToContributor(
                externalContributorDetails.email,
                replacements,
                futureDate,
                'orderNotificationTemplate'
            );
        }
        
        if (subcontractor && subcontractor.email) {
            await scheduleEmailToContributor(
                subcontractor.email,
                replacements,
                futureDate,
                'orderNotificationTemplate.html'
            );
        }
        
        await scheduleRecurringEmails(newContract._id);
        
        res.status(201).json({
            message: 'Contrat créé avec succès.',
            contractId: newContract._id,
            contract: newContract
        });
    } catch (error) {
        console.error('Erreur lors de l’ajout d’un nouveau contrat:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.updateContract = async (req, res) => {
    try {
        const {
            contractId
        } = req.params;
        const updateData = {
            ...req.body
        };
        console.log('Modification du contrat', contractId, updateData);
        console.log('liste des champs à modifier', Object.keys(updateData).join(', '));
        
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
            updateData, {
                new: true,
                runValidators: true
            }
        );
        
        if (!updatedContract) {
            return res.status(404).json({
                message: 'Contrat non trouvé.',
                contractId
            });
        }
        
        const customerDetails = await User.findById(updatedContract.customer);
        const contactDetails = await User.findById(updatedContract.contact);
        const externalContributorDetails = await User.findById(updatedContract.external_contributor);
        const formattedDate = updatedContract.date_cde ? new Date(updatedContract.date_cde).toISOString().split('T')[0] : 'Aucune date fournie';
        const occupiedText = updatedContract.occupied ? 'Oui' : 'Non';
        const statusText = getStatus(updatedContract.status);
        const benefitDetails = await Benefit.findById(updatedContract.benefit).exec();
        const benefitName = benefitDetails ? benefitDetails.name : 'Prestation inconnue';
        
        const replacements = {
            'contract.internal_number': updatedContract.internal_number || '',
            'contract.date_cde': formattedDate,
            'customer.firstname': customerDetails.firstname || '',
            'customer.lastname': customerDetails.lastname || '',
            'contact.firstname': contactDetails ? contactDetails.firstname : '',
            'contact.lastname': contactDetails ? contactDetails.lastname : '',
            'benefit_name': benefitName,
            'contract.status': statusText,
            'contract.address': updatedContract.address || '',
            'contract.appartment_number': updatedContract.appartment_number || '',
            'contract.occupied': occupiedText,
            'CRM_URL': process.env.CRM_URL
        };
        
        const delayInMinutes = 2;
        const futureDate = new Date();
        futureDate.setMinutes(futureDate.getMinutes() + delayInMinutes);
        
        if (customerDetails && customerDetails.email) {
            await scheduleEmailToContributor(
                customerDetails.email,
                replacements,
                futureDate,
                'orderUpdateNotificationTemplate'
            );
        }
        
        if (externalContributorDetails && externalContributorDetails.email) {
            await scheduleEmailToContributor(
                externalContributorDetails.email,
                replacements,
                futureDate,
                'orderUpdateNotificationTemplate'
            );
        }
        
        if (updatedContract.subcontractor && updatedContract.subcontractor.email) {
            await scheduleEmailToContributor(
                updatedContract.subcontractor.email,
                replacements,
                futureDate,
                'orderUpdateNotificationTemplate'
            );
        }
        
        res.status(200).json({
            contract: updatedContract,
            message: 'Contrat modifié avec succès.'
        });
    } catch (error) {
        console.error('Erreur lors de la modification du contrat:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.deleteContract = async (req, res) => {
    try {
        
        const {
            contractId
        } = req.params;
        
        const deletedContract = await ContractModel.findById
        AndDelete(contractId);
        
        if (!deletedContract) {
            return res.status(404).json({
                message: 'Contrat non trouvé.'
            });
        }
        
        res.status(200).json({
            message: 'Contrat supprimé avec succès.'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du contrat:', error);
        res.status(500).json({
            error: error.message
        });
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
        res.status(500).json({
            error: error.message
        });
    }
};

exports.addObservation = async (req, res) => {
    console.log('Tentative d\'ajout d\'une observation à un contrat');
    try {
        const {
            contractId,
            dateAdd,
            user,
            comment
        } = req.body;
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
            }, {
                new: true,
                useFindAndModify: false
            }
        );
        
        if (!updatedContract) {
            console.log('Contrat non trouvé.');
            return res.status(404).json({
                message: 'Contrat non trouvé.'
            });
        }
        
        console.log('Observation ajoutée avec succès.');
        res.status(200).json(updatedContract);
        
        const customerDetails = await User.findById(updatedContract.customer);
        const externalContributorDetails = await User.findById(updatedContract.external_contributor);
        const internalContributorDetails = await User.findById(updatedContract.internal_contributor);
        const contactDetails = await User.findById(updatedContract.contact);
        
        const formattedDateAdd = new Date(dateAdd).toISOString().split('T')[0];
        
        const replacements = {
            'contract.internal_number': updatedContract.internal_number || '',
            'observation.dateAdd': formattedDateAdd,
            'observation.comment': comment || '',
            'CRM_URL': process.env.CRM_URL
        };
        
        const delayInMinutes = 2;
        const futureDate = new Date();
        futureDate.setMinutes(futureDate.getMinutes() + delayInMinutes);
        
        if (customerDetails && customerDetails.email) {
            await scheduleEmailToContributor(
                customerDetails.email,
                replacements,
                futureDate,
                'observationNotificationTemplate'
            );
        }
        
        if (externalContributorDetails && externalContributorDetails.email) {
            await scheduleEmailToContributor(
                externalContributorDetails.email,
                replacements,
                futureDate,
                'observationNotificationTemplate'
            );
        }
        
        if (internalContributorDetails && internalContributorDetails.email) {
            await scheduleEmailToContributor(
                internalContributorDetails.email,
                replacements,
                futureDate,
                'observationNotificationTemplate'
            );
        }
        
        if (contactDetails && contactDetails.email) {
            await scheduleEmailToContributor(
                contactDetails.email,
                replacements,
                futureDate,
                'observationNotificationTemplate'
            );
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'observation:', error);
        res.status(500).json({
            error: error.message
        });
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
        }, {
            new: true
        });
        
        if (!updatedContract) {
            return res.status(404).json({
                message: 'Observation non trouvée.'
            });
        }
        
        res.status(200).json({
            message: 'Observation supprimée avec succès.',
            contract: updatedContract
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'observation:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getObservations = async (req, res) => {
    try {
        const {
            contractId
        } = req.params;
        const contract = await ContractModel.findById(contractId)
        .populate({
            path: 'observation.user',
            select: 'firstname lastname'
        })
        .select('observation');
        console.log('Récupération des observations d\'un contrat');
        if (!contract) {
            return res.status(404).json({
                message: 'Contrat non trouvé.'
            });
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
        res.status(500).json({
            error: error.message
        });
    }
};

exports.addIncident = async (req, res) => {
    console.log('Tentative d\'ajout d\'un incident à un contrat');
    console.log('Corps de la requête:', req.body);
    try {
        const {
            contractId,
            dateAdd,
            user,
            comment
        } = req.body;
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
            }, {
                new: true
            }
        );
        
        if (!updatedContract) {
            console.log('Contrat non trouvé.');
            return res.status(404).json({
                message: 'Contrat non trouvé.'
            });
        }
        
        console.log('Incident ajouté avec succès.');
        res.status(200).json(updatedContract);
        
        const customerDetails = await User.findById(updatedContract.customer);
        const externalContributorDetails = await User.findById(updatedContract.external_contributor);
        const internalContributorDetails = await User.findById(updatedContract.internal_contributor);
        const contactDetails = await User.findById(updatedContract.contact);
        
        const formattedDateAdd = new Date(dateAdd).toISOString().split('T')[0];
        
        const replacements = {
            'contract.internal_number': updatedContract.internal_number || '',
            'incident.dateAdd': formattedDateAdd,
            'incident.comment': comment || '',
            'CRM_URL': process.env.CRM_URL
        };
        
        const delayInMinutes = 2;
        const futureDate = new Date();
        futureDate.setMinutes(futureDate.getMinutes() + delayInMinutes);
        
        if (customerDetails && customerDetails.email) {
            await scheduleEmailToContributor(
                customerDetails.email,
                replacements,
                futureDate,
                'incidentNotificationTemplate'
            );
        }
        
        if (externalContributorDetails && externalContributorDetails.email) {
            await scheduleEmailToContributor(
                externalContributorDetails.email,
                replacements,
                futureDate,
                'incidentNotificationTemplate'
            );
        }
        
        if (internalContributorDetails && internalContributorDetails.email) {
            await scheduleEmailToContributor(
                internalContributorDetails.email,
                replacements,
                futureDate,
                'incidentNotificationTemplate'
            );
        }
        
        if (contactDetails && contactDetails.email) {
            await scheduleEmailToContributor(
                contactDetails.email,
                replacements,
                futureDate,
                'incidentNotificationTemplate'
            );
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'incident:', error);
        res.status(500).json({
            error: error.message
        });
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
        }, {
            new: true
        });
        
        if (!updatedContract) {
            return res.status(404).json({
                message: 'Incident non trouvé.'
            });
        }
        
        res.status(200).json({
            message: 'Incident supprimé avec succès.',
            contract: updatedContract
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'incident:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getIncidents = async (req, res) => {
    console.log('Tentative de récupération des incidents d\'un contrat');
    try {
        const {
            contractId
        } = req.params;
        
        const contract = await ContractModel.findById(contractId)
        .select('incident');
        
        if (!contract) {
            console.log('Contrat non trouvé.');
            return res.status(404).json({
                message: 'Contrat non trouvé.'
            });
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
        res.status(500).json({
            error: error.message
        });
    }
};

function sanitizeContract(contract) {
    ['customer', 'contact', 'external_contributor', 'subcontractor'].forEach(role => {
      if (contract[role]) {
        delete contract[role].password;
        delete contract[role].salt;
      }
    });
  };