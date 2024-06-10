const CompanyModel = require('../models/Company');
const mongoose = require('mongoose');

exports.getCompanies = async (req, res) => {

    try {
        const companies = await CompanyModel.find({}).populate('employees').populate('documents').populate('contractsAsCustomer').populate('contractsAsContact').populate('contractsAsExternalContributor');

        res.json(companies);
    } catch (error) {
        res.status(500).send({
            message: "Erreur lors de la récupération des entreprises",
            error
        });
        console.error('Erreur lors de la récupération des entreprises:', error);
    }
};

exports.searchCompanies = async (req, res) => {
    console.log('Recherche d’entreprises');
    console.log('Request :', req.query);
    try {
        const query = req.query.q;
        const companies = await CompanyModel.find({
            $or: [{
                    normalized_name: new RegExp(query, 'i')
                },
                {
                    names: new RegExp(query, 'i')
                }
            ]
        }).select('normalized_name names _id');
        res.json(companies);
    } catch (error) {
        res.status(500).send({
            message: "Erreur lors de la recherche des entreprises",
            error
        });
    }
};

exports.getCompanyById = async (req, res) => {
    try {

        const {
            companyId
        } = req.params;

        const company = await CompanyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: 'Entreprise non trouvée.'
            });
        }

        res.status(200).json(company);
    } catch (error) {
        console.error('Error retrieving company:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.updateCompany = async (req, res) => {

    try {

        const {
            companyId
        } = req.params;
        const {
            names,
            normalized_name,
            abbreviation,
            industry,
            address,
            city,
            postalCode,
            country,
            phone,
            email,
            website,
            employees,
            documents,
            contractsAsCustomer,
            contractsAsContact,
            contractsAsExternalContributor,
            additionalFields
        } = req.body;

        const updatedCompany = await CompanyModel.findByIdAndUpdate(new mongoose.Types.ObjectId(companyId), {
            names,
            normalized_name,
            abbreviation,
            industry,
            address,
            city,
            postalCode,
            country,
            phone,
            email,
            website,
            employees,
            documents,
            contractsAsCustomer,
            contractsAsContact,
            contractsAsExternalContributor,
            additionalFields
        }, {
            new: true
        });

        if (!updatedCompany) {
            return res.status(404).json({
                message: 'Entreprise non trouvée.'
            });
        }

        res.status(200).json(updatedCompany);
    } catch (error) {
        console.error('Erreur lors de la modification de l’entreprise:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.deleteCompany = async (req, res) => {
    try {

        const {
            companyId
        } = req.params;

        const deletedCompany = await CompanyModel.findByIdAndDelete(companyId);

        if (!deletedCompany) {
            return res.status(404).json({
                message: 'Entreprise non trouvée.'
            });
        }

        res.status(200).json({
            message: 'Entreprise supprimée avec succès.'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l’entreprise:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.addCompany = async (req, res) => {
    try {

        const {
            names,
            normalized_name,
            abbreviation,
            industry,
            address,
            city,
            postalCode,
            country,
            phone,
            email,
            website,
            employees,
            documents,
            contractsAsCustomer,
            contractsAsContact,
            contractsAsExternalContributor,
            additionalFields
        } = req.body;
        let company = await CompanyModel.findOne({
            normalized_name
        });
        if (company) {
            return res.status(400).json({
                message: 'Une entreprise avec ce nom existe déjà.'
            });
        }
        const newCompany = new CompanyModel({
            names,
            normalized_name,
            abbreviation,
            industry,
            address,
            city,
            postalCode,
            country,
            phone,
            email,
            website,
            employees,
            documents,
            contractsAsCustomer,
            contractsAsContact,
            contractsAsExternalContributor,
            additionalFields
        });
        await newCompany.save();

        res.status(201).json({
            message: 'Entreprise créée avec succès.',
            companyId: newCompany._id
        });
    } catch (error) {
        console.error('Erreur lors de l’ajout d’une nouvelle entreprise:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getCompaniesNames = async (req, res) => {
    try {

        const companies = await CompanyModel.find().select('name');

        res.status(200).json(companies);
    } catch (error) {
        console.error('Error retrieving companies names:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getCompaniesAbbreviations = async (req, res) => {
    try {
        console.log('Récupération des abbréviations des entreprises');
        const companies = await CompanyModel.find().select('abbreviation');
        const abbreviations = companies.map(company => company.abbreviation);
        console.log(`Found ${companies.length} companies`);
        res.status(200).json(abbreviations);
    } catch (error) {
        console.error('Erreur lors de la récupération des abbréviations des entreprises:', error);
        res.status(500).json({
            error: error.message
        });
    }
};