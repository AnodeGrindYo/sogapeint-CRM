const express = require('express');
const router = express.Router();
const benefitController = require('../controllers/benefitController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /benefit/{benefitId}:
 *   get:
 *     summary: Obtenir le nom d'une prestation par son ID
 *     description: Retourne le nom d'une prestation donnée son ID.
 *     tags: [Benefits]
 *     parameters:
 *       - in: path
 *         name: benefitId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la prestation
 *     responses:
 *       200:
 *         description: Nom de la prestation
 *       404:
 *         description: Prestation non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/benefit/:benefitId', isConnected, benefitController.getBenefitNameById);

/**
 * @swagger
 * /checkBenefitInUse:
 *   get:
 *     summary: Vérifier si une prestation est utilisée
 *     description: Vérifie si une prestation est utilisée dans des contrats.
 *     tags: [Benefits]
 *     parameters:
 *       - in: query
 *         name: benefitId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la prestation
 *     responses:
 *       200:
 *         description: Prestation utilisée
 *       400:
 *         description: ID de la prestation invalide
 *       500:
 *         description: Erreur serveur
 */
router.get('/checkBenefitInUse', isConnected, benefitController.checkBenefitInUse);

/**
 * @swagger
 * /replaceBenefit:
 *   put:
 *     summary: Remplacer une prestation
 *     description: Remplace une prestation par une autre dans les contrats.
 *     tags: [Benefits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldBenefitId:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456789"
 *               newBenefitId:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456780"
 *     responses:
 *       200:
 *         description: Prestation remplacée avec succès
 *       400:
 *         description: ID de la prestation invalide
 *       404:
 *         description: Prestation non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/replaceBenefit', isAdminOrSuperAdmin, benefitController.replaceBenefit);

/**
 * @swagger
 * /benefits:
 *   get:
 *     summary: Obtenir la liste de tous les services
 *     description: Retourne une liste de toutes les prestations disponibles.
 *     tags: [Benefits]
 *     responses:
 *       200:
 *         description: Liste des prestations
 *       500:
 *         description: Erreur serveur
 */
router.get('/benefits', isConnected, benefitController.getBenefits);

/**
 * @swagger
 * /benefit:
 *   post:
 *     summary: Ajouter un service
 *     description: Ajoute un nouveau service à la liste des prestations.
 *     tags: [Benefits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nouveau Service"
 *     responses:
 *       201:
 *         description: Service créé avec succès
 *       400:
 *         description: Un service avec ce nom existe déjà
 *       500:
 *         description: Erreur serveur
 */
router.post('/benefit', isAdminOrSuperAdmin, benefitController.addBenefit);

/**
 * @swagger
 * /benefit/{benefitId}:
 *   delete:
 *     summary: Supprimer un service par son ID
 *     description: Supprime un service de la liste des prestations données son ID.
 *     tags: [Benefits]
 *     parameters:
 *       - in: path
 *         name: benefitId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la prestation
 *     responses:
 *       200:
 *         description: Service supprimé avec succès
 *       404:
 *         description: Service non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/benefit/:benefitId', isAdminOrSuperAdmin, benefitController.deleteBenefit);

module.exports = router;
