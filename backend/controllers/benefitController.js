const Benefit = require('../models/benefit');
const ContractModel = require('../models/Contract');
const mongoose = require('mongoose');

exports.getBenefitNameById = async (req, res) => {
    try {

        const {
            benefitId
        } = req.params;

        const service = await Benefit.findById(benefitId);
        if (!service) {
            return res.status(404).json({
                message: 'Service non trouvé.'
            });
        }
        console.log('Found service:', service);
        res.status(200).json(service.name);
    } catch (error) {
        console.error('Error retrieving service name:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getBenefits = async (req, res) => {
    try {

        const services = await Benefit.find();

        res.json(services);
    } catch (error) {
        res.status(500).send({
            message: "Erreur lors de la récupération des services",
            error
        });
        console.error('Erreur lors de la récupération des services:', error);
    }
};

// exports.addBenefit = async (req, res) => {
//     try {

//         const {
//             name
//         } = req.body;

//         const normalized_name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
//         let service = await Benefit.findOne({
//             normalized_name
//         });
//         if (service) {
//             return res.status(400).json({
//                 message: 'Un service avec ce nom existe déjà.'
//             });
//         }
//         const newService = new benefit({
//             name: normalized_name
//         });
//         await newService.save();

//         res.status(201).json({
//             message: 'Service créé avec succès.',
//             benefit: newService
//         });
//     } catch (error) {
//         console.error('Erreur lors de l’ajout d’un nouveau service:', error);
//         res.status(500).json({
//             error: error.message
//         });
//     }
// };
exports.addBenefit = async (req, res) => {
    try {
        const { name } = req.body;

        const normalized_name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        let service = await Benefit.findOne({ name: normalized_name });
        if (service) {
            return res.status(400).json({ message: 'Un service avec ce nom existe déjà.' });
        }

        const newService = new Benefit({ name: normalized_name });
        await newService.save();

        res.status(201).json({
            message: 'Service créé avec succès.',
            benefit: newService
        });
    } catch (error) {
        console.error('Erreur lors de l’ajout d’un nouveau service:', error);
        res.status(500).json({ error: error.message });
    }
};



exports.deleteBenefit = async (req, res) => {
    try {

        const {
            benefitId
        } = req.params;
        console.log('Suppression du service avec l\'ID:', benefitId);
        const deletedService = await Benefit.findByIdAndDelete(benefitId);
        if (!deletedService) {
            return res.status(404).json({
                message: 'Service non trouvé.'
            });
        }

        res.status(200).json({
            message: 'Service supprimé avec succès.'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du service:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.checkBenefitInUse = async (req, res) => {
    console.log('Vérification de l\'utilisation d\'une prestation dans des commandes');
    try {
        const benefitId = req.query.benefitId;
        console.log('benefitId:', benefitId);

        if (!mongoose.Types.ObjectId.isValid(benefitId)) {
            console.error('Invalid benefitId:', benefitId);
            return res.status(400).json({
                error: 'Invalid benefitId'
            });
        }

        const contracts = await ContractModel.find({
            benefit: benefitId
        });
        console.log('contracts:', contracts);
        console.log('Nombre de contrats:', contracts.length);

        res.json(contracts.length > 0);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error);
    }
};

exports.replaceBenefit = async (req, res) => {
    console.log('Début du remplacement de la prestation');
    try {
        const {
            oldBenefitId,
            newBenefitId
        } = req.body;
        console.log('oldBenefitId:', oldBenefitId);
        console.log('newBenefitId:', newBenefitId);

        if (!mongoose.Types.ObjectId.isValid(oldBenefitId) || !mongoose.Types.ObjectId.isValid(newBenefitId)) {
            console.error('Invalid benefitId(s):', {
                oldBenefitId,
                newBenefitId
            });
            return res.status(400).json({
                error: 'Invalid benefitId(s)'
            });
        }

        const oldBenefit = await Benefit.findById(oldBenefitId);
        const newBenefit = await Benefit.findById(newBenefitId);
        if (!oldBenefit || !newBenefit) {
            console.error('Benefit(s) not found:', {
                oldBenefit,
                newBenefit
            });
            return res.status(404).json({
                error: 'Benefit(s) not found'
            });
        }

        console.log('oldBenefit:', oldBenefit);
        console.log('newBenefit:', newBenefit);

        const updateResult = await ContractModel.updateMany({
            benefit: oldBenefitId
        }, {
            benefit: newBenefitId
        });

        const deleteResult = await Benefit.findByIdAndDelete(oldBenefitId);

        console.log('updateResult:', updateResult);
        console.log('deleteResult:', deleteResult);

        res.status(200).json({
            message: 'Prestation remplacée avec succès.'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error);
    }
};

// exports.getBenefitNameById = async (req, res) => {
//     try {

//         const {
//             benefitId
//         } = req.params;

//         const service = await Benefit.findById(benefitId);
//         if (!service) {
//             return res.status(404).json({
//                 message: 'Service non trouvé.'
//             });
//         }
//         console.log('Found service:', service);
//         res.status(200).json(service.name);
//     } catch (error) {
//         console.error('Error retrieving service name:', error);
//         res.status(500).json({
//             error: error.message
//         });
//     }
// };