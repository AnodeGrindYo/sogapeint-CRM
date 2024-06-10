// routes.js
const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

/**
 * @swagger
 * /company-list/{companyName}:
 *   get:
 *     summary: Obtenir une liste d'entreprises correspondant à un nom
 *     description: Retourne une liste d'entreprises correspondant au nom donné, filtrée par région si spécifiée.
 *     tags: [Scraper]
 *     parameters:
 *       - in: path
 *         name: companyName
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom de l'entreprise à rechercher
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Région pour filtrer les entreprises (par défaut Occitanie)
 *     responses:
 *       200:
 *         description: Liste d'entreprises correspondant au nom donné
 *       500:
 *         description: Erreur serveur
 */
router.get('/company-list/:companyName', scraperController.getCompanyList);

/**
 * @swagger
 * /enriched-company/{companyName}/{postalCode}:
 *   get:
 *     summary: Obtenir des données enrichies pour une entreprise sélectionnée
 *     description: Retourne des données enrichies pour une entreprise correspondant au nom et au code postal donnés.
 *     tags: [Scraper]
 *     parameters:
 *       - in: path
 *         name: companyName
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom de l'entreprise
 *       - in: path
 *         name: postalCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Code postal de l'entreprise
 *     responses:
 *       200:
 *         description: Données enrichies de l'entreprise
 *       404:
 *         description: Aucune donnée enrichie trouvée pour cette entreprise
 *       500:
 *         description: Erreur serveur
 */
router.get('/enriched-company/:companyName/:postalCode', scraperController.getEnrichedCompanyData);

module.exports = router;
