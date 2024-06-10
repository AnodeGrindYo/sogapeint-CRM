const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: Obtenir la liste de tous les contrats
 *     description: Retourne une liste de tous les contrats avec leurs détails.
 *     tags: [Contracts]
 *     responses:
 *       200:
 *         description: Liste des contrats
 *       500:
 *         description: Erreur serveur
 */
router.get('/contracts', isConnected, contractController.getContracts);

/**
 * @swagger
 * /contractsByMonth:
 *   get:
 *     summary: Obtenir la liste de tous les contrats pour un mois donné, pour l'année en cours
 *     description: Retourne une liste de tous les contrats pour un mois donné, pour l'année en cours.
 *     tags: [Contracts]
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           description: Le mois pour lequel récupérer les contrats (1-12)
 *     responses:
 *       200:
 *         description: Liste des contrats pour le mois donné
 *       400:
 *         description: Mois spécifié invalide
 *       500:
 *         description: Erreur serveur
 */
router.get('/contractsByMonth', isConnected, contractController.getContractsByMonth);

/**
 * @swagger
 * /contract/{contractId}:
 *   get:
 *     summary: Obtenir un contrat par son ID
 *     description: Retourne les détails d'un contrat donné son ID.
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: contractId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du contrat
 *     responses:
 *       200:
 *         description: Détails du contrat
 *       404:
 *         description: Contrat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/contract/:contractId', isConnected, contractController.getContractById);

/**
 * @swagger
 * /contract:
 *   post:
 *     summary: Ajouter un contrat
 *     description: Ajoute un nouveau contrat.
 *     tags: [Contracts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               internal_number:
 *                 type: string
 *                 example: "12345"
 *               customer:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456789"
 *               contact:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456780"
 *               internal_contributor:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456781"
 *               external_contributor:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456782"
 *               external_contributor_amount:
 *                 type: number
 *                 example: 5000
 *               subcontractor:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456783"
 *               subcontractor_amount:
 *                 type: number
 *                 example: 3000
 *               address:
 *                 type: string
 *                 example: "123 Rue Exemple"
 *               appartment_number:
 *                 type: string
 *                 example: "45A"
 *               ss4:
 *                 type: boolean
 *                 example: false
 *               quote_number:
 *                 type: string
 *                 example: "QT-2022-001"
 *               mail_sended:
 *                 type: boolean
 *                 example: false
 *               invoice_number:
 *                 type: string
 *                 example: "INV-2022-001"
 *               amount_ht:
 *                 type: number
 *                 example: 10000
 *               benefit_ht:
 *                 type: number
 *                 example: 1500
 *               execution_data_day:
 *                 type: number
 *                 example: 1
 *               execution_data_hour:
 *                 type: number
 *                 example: 2
 *               prevision_data_day:
 *                 type: number
 *                 example: 3
 *               prevision_data_hour:
 *                 type: number
 *                 example: 4
 *               benefit:
 *                 type: string
 *                 example: "Prestation Exemple"
 *               status:
 *                 type: string
 *                 example: "in_progress"
 *               occupied:
 *                 type: boolean
 *                 example: false
 *               start_date_works:
 *                 type: string
 *                 example: "2022-01-01T00:00:00.000Z"
 *               end_date_works:
 *                 type: string
 *                 example: "2022-01-10T00:00:00.000Z"
 *               end_date_customer:
 *                 type: string
 *                 example: "2022-01-15T00:00:00.000Z"
 *               trash:
 *                 type: boolean
 *                 example: false
 *               date_cde:
 *                 type: string
 *                 example: "2022-01-01T00:00:00.000Z"
 *               billing_amount:
 *                 type: number
 *                 example: 12000
 *               createdBy:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456784"
 *     responses:
 *       201:
 *         description: Contrat créé avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/contract', isAdminOrSuperAdmin, contractController.addContract);

/**
 * @swagger
 * /contract/{contractId}:
 *   put:
 *     summary: Modifier un contrat par son ID
 *     description: Met à jour les détails d'un contrat donné son ID.
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: contractId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du contrat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               internal_number:
 *                 type: string
 *                 example: "12345"
 *               customer:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456789"
 *               contact:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456780"
 *               internal_contributor:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456781"
 *               external_contributor:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456782"
 *               external_contributor_amount:
 *                 type: number
 *                 example: 5000
 *               subcontractor:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456783"
 *               subcontractor_amount:
 *                 type: number
 *                 example: 3000
 *               address:
 *                 type: string
 *                 example: "123 Rue Exemple"
 *               appartment_number:
 *                 type: string
 *                 example: "45A"
 *               ss4:
 *                 type: boolean
 *                 example: false
 *               quote_number:
 *                 type: string
 *                 example: "QT-2022-001"
 *               mail_sended:
 *                 type: boolean
 *                 example: false
 *               invoice_number:
 *                 type: string
 *                 example: "INV-2022-001"
 *               amount_ht:
 *                 type: number
 *                 example: 10000
 *               benefit_ht:
 *                 type: number
 *                 example: 1500
 *               execution_data_day:
 *                 type: number
 *                 example: 1
 *               execution_data_hour:
 *                 type: number
 *                 example: 2
 *               prevision_data_day:
 *                 type: number
 *                 example: 3
 *               prevision_data_hour:
 *                 type: number
 *                 example: 4
 *               benefit:
 *                 type: string
 *                 example: "Prestation Exemple"
 *               status:
 *                 type: string
 *                 example: "in_progress"
 *               occupied:
 *                 type: boolean
 *                 example: false
 *               start_date_works:
 *                 type: string
 *                 example: "2022-01-01T00:00:00.000Z"
 *               end_date_works:
 *                 type: string
 *                 example: "2022-01-10T00:00:00.000Z"
 *               end_date_customer:
 *                 type: string
 *                 example: "2022-01-15T00:00:00.000Z"
 *               trash:
 *                 type: boolean
 *                 example: false
 *               date_cde:
 *                 type: string
 *                 example: "2022-01-01T00:00:00.000Z"
 *               billing_amount:
 *                 type: number
 *                 example: 12000
 *     responses:
 *       200:
 *         description: Contrat modifié avec succès
 *       404:
 *         description: Contrat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/contract/:contractId', isAdminOrSuperAdmin, contractController.updateContract);

/**
 * @swagger
 * /contract/{contractId}:
 *   delete:
 *     summary: Supprimer un contrat par son ID
 *     description: Supprime un contrat donné son ID.
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: contractId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du contrat
 *     responses:
 *       200:
 *         description: Contrat supprimé avec succès
 *       404:
 *         description: Contrat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/contract/:contractId', isAdminOrSuperAdmin, contractController.deleteContract);

/**
 * @swagger
 * /ongoingContracts:
 *   get:
 *     summary: Obtenir les contrats en cours
 *     description: Retourne une liste de tous les contrats en cours.
 *     tags: [Contracts]
 *     responses:
 *       200:
 *         description: Liste des contrats en cours
 *       500:
 *         description: Erreur serveur
 */
router.get('/ongoingContracts', isConnected, contractController.getOngoingContracts);

/**
 * @swagger
 * /notOngoingContracts:
 *   get:
 *     summary: Obtenir les contrats non en cours
 *     description: Retourne une liste de tous les contrats non en cours.
 *     tags: [Contracts]
 *     responses:
 *       200:
 *         description: Liste des contrats non en cours
 *       500:
 *         description: Erreur serveur
 */
router.get('/notOngoingContracts', isConnected, contractController.getNotOngoingContracts);

/**
 * @swagger
 * /streamOnGoingContracts:
 *   get:
 *     summary: Obtenir les contrats en cours sous forme de stream
 *     description: Retourne une liste de tous les contrats en cours sous forme de stream.
 *     tags: [Contracts]
 *     responses:
 *       200:
 *         description: Liste des contrats en cours (stream)
 *       500:
 *         description: Erreur serveur
 */
router.get('/streamOnGoingContracts', contractController.streamOnGoingContracts);

/**
 * @swagger
 * /streamNotOnGoingContracts:
 *   get:
 *     summary: Obtenir les contrats non en cours sous forme de stream
 *     description: Retourne une liste de tous les contrats non en cours sous forme de stream.
 *     tags: [Contracts]
 *     responses:
 *       200:
 *         description: Liste des contrats non en cours (stream)
 *       500:
 *         description: Erreur serveur
 */
router.get('/streamNotOnGoingContracts', contractController.streamNotOnGoingContracts);

/**
 * @swagger
 * /streamOrdersByTags:
 *   get:
 *     summary: Obtenir les contrats par tags sous forme de stream
 *     description: Retourne une liste de tous les contrats par tags sous forme de stream.
 *     tags: [Contracts]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Le statut des contrats à filtrer
 *       - in: query
 *         name: incident
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Si vrai, filtre les contrats avec des incidents
 *     responses:
 *       200:
 *         description: Liste des contrats par tags (stream)
 *       500:
 *         description: Erreur serveur
 */
router.get('/streamOrdersByTags', contractController.streamOrdersByTag);

/**
 * @swagger
 * /internalNumbers:
 *   get:
 *     summary: Obtenir la liste des internal_numbers des contrats
 *     description: Retourne une liste des internal_numbers de tous les contrats.
 *     tags: [Contracts]
 *     responses:
 *       200:
 *         description: Liste des internal_numbers des contrats
 *       500:
 *         description: Erreur serveur
 */
router.get('/internalNumbers', isConnected, contractController.getContractsInternalNumbers);

/**
 * @swagger
 * /observation:
 *   post:
 *     summary: Ajouter une observation à un contrat
 *     description: Ajoute une observation à un contrat existant.
 *     tags: [Contracts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractId:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456789"
 *               dateAdd:
 *                 type: string
 *                 example: "2022-01-01T00:00:00.000Z"
 *               user:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456781"
 *               comment:
 *                 type: string
 *                 example: "Observation sur le contrat"
 *     responses:
 *       200:
 *         description: Observation ajoutée avec succès
 *       404:
 *         description: Contrat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/observation', isAdminOrSuperAdmin, contractController.addObservation);

/**
 * @swagger
 * /observation/{observationId}:
 *   delete:
 *     summary: Supprimer une observation d'un contrat
 *     description: Supprime une observation d'un contrat donné son ID.
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: observationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'observation
 *     responses:
 *       200:
 *         description: Observation supprimée avec succès
 *       404:
 *         description: Observation non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/observation/:observationId', isAdminOrSuperAdmin, contractController.deleteObservation);

/**
 * @swagger
 * /observations/{contractId}:
 *   get:
 *     summary: Obtenir les observations d'un contrat
 *     description: Retourne une liste des observations d'un contrat donné son ID.
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: contractId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du contrat
 *     responses:
 *       200:
 *         description: Liste des observations du contrat
 *       404:
 *         description: Contrat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/observations/:contractId', isConnected, contractController.getObservations);

/**
 * @swagger
 * /incident:
 *   post:
 *     summary: Ajouter un incident à un contrat
 *     description: Ajoute un incident à un contrat existant.
 *     tags: [Contracts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractId:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456789"
 *               dateAdd:
 *                 type: string
 *                 example: "2022-01-01T00:00:00.000Z"
 *               user:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456781"
 *               comment:
 *                 type: string
 *                 example: "Incident sur le contrat"
 *     responses:
 *       200:
 *         description: Incident ajouté avec succès
 *       404:
 *         description: Contrat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/incident', isAdminOrSuperAdmin, contractController.addIncident);

/**
 * @swagger
 * /incident/{incidentId}:
 *   delete:
 *     summary: Supprimer un incident d'un contrat
 *     description: Supprime un incident d'un contrat donné son ID.
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: incidentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'incident
 *     responses:
 *       200:
 *         description: Incident supprimé avec succès
 *       404:
 *         description: Incident non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/incident/:incidentId', isAdminOrSuperAdmin, contractController.deleteIncident);

/**
 * @swagger
 * /incidents/{contractId}:
 *   get:
 *     summary: Obtenir les incidents d'un contrat
 *     description: Retourne une liste des incidents d'un contrat donné son ID.
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: contractId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du contrat
 *     responses:
 *       200:
 *         description: Liste des incidents du contrat
 *       404:
 *         description: Contrat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/incidents/:contractId', isConnected, contractController.getIncidents);

module.exports = router;
