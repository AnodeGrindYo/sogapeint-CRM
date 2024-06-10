const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');

// Route pour obtenir la liste de tous les contrats
router.get('/contracts', isConnected, contractController.getContracts);

// Route pour obtenir la liste de tous les contrats pour un mois donné, pour l'année en cours
router.get('/contractsByMonth', isConnected, contractController.getContractsByMonth);

// Route pour obtenir un contrat (protégée par le middleware)
router.get('/contract/:contractId', isConnected, contractController.getContractById);

// Route pour ajouter un contrat
router.post('/contract', isAdminOrSuperAdmin, contractController.addContract);

// Route pour modifier un contrat (protégée par le middleware isAdminOrSuperAdmin)
router.put('/contract/:contractId', isAdminOrSuperAdmin, contractController.updateContract);

// Route pour supprimer un contrat (protégée par le middleware isAdminOrSuperAdmin)
router.delete('/contract/:contractId', isAdminOrSuperAdmin, contractController.deleteContract);

// Route pour obtenir les contrats en cours
router.get('/ongoingContracts', isConnected, contractController.getOngoingContracts);

// Route pour obtenir les contrats non en cours
router.get('/notOngoingContracts', isConnected, contractController.getNotOngoingContracts);

// Route pour obtenir les contrats en cours sous forme de stream
router.get('/streamOnGoingContracts', contractController.streamOnGoingContracts);

// Route pour obtenir les contrats non en cours sous forme de stream
router.get('/streamNotOnGoingContracts', contractController.streamNotOnGoingContracts);

// Route pour obtenir les contrats par tags sous forme de stream
router.get('/streamOrdersByTags', contractController.streamOrdersByTag);

// Route pour obtenir la liste des internal_numbers des contrats
router.get('/internalNumbers', isConnected, contractController.getContractsInternalNumbers);

// Route pour ajouter une observation à un contrat
router.post('/observation', isAdminOrSuperAdmin, contractController.addObservation);

// Route pour supprimer une observation d'un contrat
router.delete('/observation/:observationId', isAdminOrSuperAdmin, contractController.deleteObservation);

// Route pour obtenir les observations d'un contrat
router.get('/observations/:contractId', isConnected, contractController.getObservations);

// Route pour ajouter un incident à un contrat
router.post('/incident', isAdminOrSuperAdmin, contractController.addIncident);

// Route pour supprimer un incident d'un contrat
router.delete('/incident/:incidentId', isAdminOrSuperAdmin, contractController.deleteIncident);

// Route pour obtenir les incidents d'un contrat
router.get('/incidents/:contractId', isConnected, contractController.getIncidents);

module.exports = router;
