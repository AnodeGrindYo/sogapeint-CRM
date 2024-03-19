// routes/authRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const authController = require('../controllers/authController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');

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

// Route pour obtenir un contrat (protégée par le middleware)
router.get('/contract/:contractId', isConnected, authController.getContractById);

// Route pour ajouter un contrat
router.post('/contract', isAdminOrSuperAdmin, authController.addContract);

// Route pour modifier un contrat (protégée par le middleware isAdminOrSuperAdmin)
router.put('/contract/:contractId', isAdminOrSuperAdmin, authController.updateContract);

// Route pour getOngoingContracts (protégée par le middleware isAdminOrSuperAdmin, obtient les contrats en cours)
router.get('/ongoingContracts', isAdminOrSuperAdmin, authController.getOngoingContracts);

// Route pour getNotOngoingContracts (protégée par le middleware isAdminOrSuperAdmin, obtient les contrats non en cours)
router.get('/notOngoingContracts', isAdminOrSuperAdmin, authController.getNotOngoingContracts);

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

// Route pour recevoir des fichiers (protégée par le middleware isAdminOrSuperAdmin)
router.post('/upload', upload.array('files'), isAdminOrSuperAdmin, authController.uploadFiles);

// Route pour envoyer un fichier (protégée par le middleware isAdminOrSuperAdmin)
router.get('/download', isAdminOrSuperAdmin, authController.downloadFile);

// Route pour obtenir le nom d'une prestation par son id
router.get('/benefit/:benefitId', isConnected, authController.getBenefitNameById);

module.exports = router;
