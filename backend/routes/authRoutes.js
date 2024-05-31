// routes/authRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const authController = require('../controllers/authController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');
const extractFolderName = require('../middlewares/extractFolderName');

console.log('authController', authController);

// Limiter pour la route de connexion
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite chaque IP à 5 tentatives de connexion
    message: 'Trop de tentatives de connexion depuis cette IP, veuillez réessayer après 15 minutes'
  });

// Route pour l'inscription
// router.post('/signup', authController.signup);

// Route pour ajouter un nouvel utilisateur
router.post('/addUser', isAdminOrSuperAdmin, authController.addUser);

// Route pour obtenir tous les utilisateurs (protégée par le middleware)
router.get('/allUsers', isConnected, authController.getAllUsers); // TODO: vérifier droits d'accès à cette route

// Route pour obtenir un utilisateur (protégée par le middleware)
router.get('/user/:userId', isConnected, authController.getUserById);

// Route pour modifier un utilisateur (protégée par le middleware isAdminOrSuperAdmin)
router.put('/user/:userId', isAdminOrSuperAdmin, authController.updateUser);

// Route pour supprimer un utilisateur (protégée par le middleware isAdminOrSuperAdmin)
router.delete('/user/:userId', isAdminOrSuperAdmin, authController.deleteUser);

// Route pour rechercher un utilisateur par nom, prénom ou email
router.get('/user-search', isConnected, authController.searchUsers);

// Route pour la connexion
router.post('/login',loginLimiter, authController.login);

// Route pour la réinitialisation du mot de passe par un administrateur
router.post('/resetPasswordFromAdmin', isAdminOrSuperAdmin, authController.resetPasswordFromAdmin);

// Route pour demander la réinitialisation du mot de passe par un utilisateur
router.post('/forgotPassword', authController.forgotPassword);

// Route pour vérifier le code de réinitialisation
router.post('/verifyResetCode', authController.verifyResetCode);

// Route pour réinitialiser le mot de passe
router.post('/resetPassword', authController.resetPassword);




//// ENTREPRISES 

// Route pour obtenir la liste de toutes les entreprises
router.get('/companies', isConnected, authController.getCompanies);

// Route pour obtenir la liste des noms d'entreprises
router.get('/companiesNames', isConnected, authController.getCompaniesNames);

// Route pour rechercher des entreprises
router.get('/company/search', isConnected, authController.searchCompanies);

// Route pour obtenir une entreprise (protégée par le middleware)
router.get('/company/:companyId', isConnected, authController.getCompanyById);

// Route pour ajouter une entreprise
router.post('/company', isAdminOrSuperAdmin, authController.addCompany);

// Route pour modifier une entreprise (protégée par le middleware isAdminOrSuperAdmin)
router.put('/company/:companyId', isAdminOrSuperAdmin, authController.updateCompany);

// Route pour supprimer une entreprise (protégée par le middleware isAdminOrSuperAdmin)
router.delete('/company/:companyId', isAdminOrSuperAdmin, authController.deleteCompany);

//////////// CONTRATS

// Route pour obtenir la liste de tous les contrats
router.get('/contracts', isConnected, authController.getContracts);

// Route pour obtenir la liste de tous les contrats pour un mois donné, pour l'année en cours
router.get('/contractsByMonth', isConnected, authController.getContractsByMonth);

// Route pour obtenir un contrat (protégée par le middleware)
router.get('/contract/:contractId', isConnected, authController.getContractById);

// Route pour ajouter un contrat
router.post('/contract', isAdminOrSuperAdmin, authController.addContract);

// Route pour modifier un contrat (protégée par le middleware isAdminOrSuperAdmin)
router.put('/contract/:contractId', isAdminOrSuperAdmin, authController.updateContract);

// Route pour supprimer un contrat (protégée par le middleware isAdminOrSuperAdmin)
router.delete('/contract/:contractId', isAdminOrSuperAdmin, authController.deleteContract);

// Route pour getOngoingContracts (protégée par le middleware isAdminOrSuperAdmin, obtient les contrats en cours)
router.get('/ongoingContracts', isConnected, authController.getOngoingContracts);

// Route pour getNotOngoingContracts (protégée par le middleware isAdminOrSuperAdmin, obtient les contrats non en cours)
router.get('/notOngoingContracts', isConnected, authController.getNotOngoingContracts);

// Route pour streamOnGoingContracts (obtient les contrats en cours)
router.get('/streamOnGoingContracts', authController.streamOnGoingContracts);

// Route pour streamNotOngoingContracts (obtient les contrats non en cours)
router.get('/streamNotOngoingContracts', authController.streamNotOnGoingContracts);

// Route pour streamOrdersByTag (obtient les contrats par tags)
router.get('/streamOrdersByTags', authController.streamOrdersByTag);

// Route pour obtenir la liste des internal_numbers des contrats
router.get('/internalNumbers', isConnected, authController.getContractsInternalNumbers);

// Route pour obtenir la liste des abbréviations des entreprises
router.get('/companiesAbbreviations', isConnected, authController.getCompaniesAbbreviations);

// route pour récupérer tous les contrats sous la forme d'un stream
// router.get('/contracts-stream', isAdminOrSuperAdmin, authController.getContractsAsStream);

// Route pour recevoir des fichiers (protégée par le middleware isConnected)
router.post('/upload', extractFolderName, upload.array('files'), isConnected, authController.uploadFiles);

// Route pour envoyer un fichier (protégée par le middleware isAdminOrSuperAdmin)
router.get('/download', isConnected, authController.downloadFile);

// Route pour supprimer un fichier (protégée par le middleware isAdminOrSuperAdmin)
router.delete('/deleteFile', isAdminOrSuperAdmin, authController.deleteFile);

// Route pour updateFile (protégée par le middleware isAdminOrSuperAdmin)
router.put('/updateFile', isAdminOrSuperAdmin, authController.updateFile);

// Route pour obtenir le nom d'une prestation par son id
router.get('/benefit/:benefitId', isConnected, authController.getBenefitNameById);

// Route pour checkBenefitInUse
router.get('/checkBenefitInUse', isConnected, authController.checkBenefitInUse);

// Route pour replaceBenefit
router.put('/replaceBenefit', isAdminOrSuperAdmin, authController.replaceBenefit);

// Route pour ajouter une observation à un contrat
router.post('/observation', isAdminOrSuperAdmin, authController.addObservation);

// Route pour supprimer une observation d'un contrat
router.delete('/observation/:observationId', isAdminOrSuperAdmin, authController.deleteObservation);

// Route pour obtenir les observations d'un contrat
router.get('/observations/:contractId', isConnected, authController.getObservations);

// Route pour ajouter un incident à un contrat
router.post('/incident', isAdminOrSuperAdmin, authController.addIncident);

// Route pour supprimer un incident d'un contrat
router.delete('/incident/:incidentId', isAdminOrSuperAdmin, authController.deleteIncident);

// Route pour obtenir les incidents d'un contrat
router.get('/incidents/:contractId', isConnected, authController.getIncidents);

//  Route pour obtenir la liste de tous les services
router.get('/benefits', isConnected, authController.getBenefits);

// Route pour ajouter un service
router.post('/benefit', isAdminOrSuperAdmin, authController.addBenefit);

// Route pour supprimer un service par son id
router.delete('/benefit/:benefitId', isAdminOrSuperAdmin, authController.deleteBenefit);

// Route pour getInvoices
router.get('/invoices', isConnected, authController.getInvoices);

module.exports = router;
