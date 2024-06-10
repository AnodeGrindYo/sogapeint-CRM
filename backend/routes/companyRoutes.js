const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Obtenir la liste de toutes les entreprises
 *     description: Retourne une liste de toutes les entreprises avec leurs détails.
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: Liste des entreprises
 *       500:
 *         description: Erreur serveur
 */
router.get('/companies', isConnected, companyController.getCompanies);

/**
 * @swagger
 * /companiesNames:
 *   get:
 *     summary: Obtenir la liste des noms d'entreprises
 *     description: Retourne une liste des noms de toutes les entreprises.
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: Liste des noms d'entreprises
 *       500:
 *         description: Erreur serveur
 */
router.get('/companiesNames', isConnected, companyController.getCompaniesNames);

/**
 * @swagger
 * /company/search:
 *   get:
 *     summary: Rechercher des entreprises
 *     description: Permet de rechercher des entreprises par nom.
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom ou partie du nom de l'entreprise à rechercher
 *     responses:
 *       200:
 *         description: Liste des entreprises trouvées
 *       500:
 *         description: Erreur serveur
 */
router.get('/company/search', isConnected, companyController.searchCompanies);

/**
 * @swagger
 * /company/{companyId}:
 *   get:
 *     summary: Obtenir une entreprise par son ID
 *     description: Retourne les détails d'une entreprise donnée son ID.
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'entreprise
 *     responses:
 *       200:
 *         description: Détails de l'entreprise
 *       404:
 *         description: Entreprise non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/company/:companyId', isConnected, companyController.getCompanyById);

/**
 * @swagger
 * /company:
 *   post:
 *     summary: Ajouter une entreprise
 *     description: Ajoute une nouvelle entreprise.
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               names:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Nom Complet"]
 *               normalized_name:
 *                 type: string
 *                 example: "Nom Complet"
 *               abbreviation:
 *                 type: string
 *                 example: "NC"
 *               industry:
 *                 type: string
 *                 example: "Technologie"
 *               address:
 *                 type: string
 *                 example: "123 Rue Exemple"
 *               city:
 *                 type: string
 *                 example: "Exempleville"
 *               postalCode:
 *                 type: string
 *                 example: "12345"
 *               country:
 *                 type: string
 *                 example: "France"
 *               phone:
 *                 type: string
 *                 example: "0102030405"
 *               email:
 *                 type: string
 *                 example: "contact@exemple.com"
 *               website:
 *                 type: string
 *                 example: "http://www.exemple.com"
 *               employees:
 *                 type: array
 *                 items:
 *                   type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *               contractsAsCustomer:
 *                 type: array
 *                 items:
 *                   type: string
 *               contractsAsContact:
 *                 type: array
 *                 items:
 *                   type: string
 *               contractsAsExternalContributor:
 *                 type: array
 *                 items:
 *                   type: string
 *               additionalFields:
 *                 type: object
 *     responses:
 *       201:
 *         description: Entreprise créée avec succès
 *       400:
 *         description: Une entreprise avec ce nom existe déjà
 *       500:
 *         description: Erreur serveur
 */
router.post('/company', isAdminOrSuperAdmin, companyController.addCompany);

/**
 * @swagger
 * /company/{companyId}:
 *   put:
 *     summary: Modifier une entreprise par son ID
 *     description: Met à jour les détails d'une entreprise donnée son ID.
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'entreprise
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               names:
 *                 type: array
 *                 items:
 *                   type: string
 *               normalized_name:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               industry:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *               employees:
 *                 type: array
 *                 items:
 *                   type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *               contractsAsCustomer:
 *                 type: array
 *                 items:
 *                   type: string
 *               contractsAsContact:
 *                 type: array
 *                 items:
 *                   type: string
 *               contractsAsExternalContributor:
 *                 type: array
 *                 items:
 *                   type: string
 *               additionalFields:
 *                 type: object
 *     responses:
 *       200:
 *         description: Entreprise mise à jour avec succès
 *       404:
 *         description: Entreprise non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/company/:companyId', isAdminOrSuperAdmin, companyController.updateCompany);

/**
 * @swagger
 * /company/{companyId}:
 *   delete:
 *     summary: Supprimer une entreprise par son ID
 *     description: Supprime une entreprise donnée son ID.
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'entreprise
 *     responses:
 *       200:
 *         description: Entreprise supprimée avec succès
 *       404:
 *         description: Entreprise non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/company/:companyId', isAdminOrSuperAdmin, companyController.deleteCompany);

/**
 * @swagger
 * /companiesAbbreviations:
 *   get:
 *     summary: Obtenir la liste des abréviations des entreprises
 *     description: Retourne une liste des abréviations de toutes les entreprises.
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: Liste des abréviations des entreprises
 *       500:
 *         description: Erreur serveur
 */
router.get('/companiesAbbreviations', isConnected, companyController.getCompaniesAbbreviations);

module.exports = router;
