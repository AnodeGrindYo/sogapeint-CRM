const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');

// Route pour obtenir la liste de toutes les entreprises
router.get('/companies', isConnected, companyController.getCompanies);

// Route pour obtenir la liste des noms d'entreprises
router.get('/companiesNames', isConnected, companyController.getCompaniesNames);

// Route pour rechercher des entreprises
router.get('/company/search', isConnected, companyController.searchCompanies);

// Route pour obtenir une entreprise (protégée par le middleware)
router.get('/company/:companyId', isConnected, companyController.getCompanyById);

// Route pour ajouter une entreprise
router.post('/company', isAdminOrSuperAdmin, companyController.addCompany);

// Route pour modifier une entreprise (protégée par le middleware isAdminOrSuperAdmin)
router.put('/company/:companyId', isAdminOrSuperAdmin, companyController.updateCompany);

// Route pour supprimer une entreprise (protégée par le middleware isAdminOrSuperAdmin)
router.delete('/company/:companyId', isAdminOrSuperAdmin, companyController.deleteCompany);

// Route pour obtenir la liste des abbréviations des entreprises
router.get('/companiesAbbreviations', isConnected, companyController.getCompaniesAbbreviations);

module.exports = router;
