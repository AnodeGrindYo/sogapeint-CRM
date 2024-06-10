const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { isConnected } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Obtenir la liste des factures
 *     description: Retourne une liste de toutes les factures triées par date de téléchargement.
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: Liste des factures
 *       404:
 *         description: Aucune facture trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/invoices', isConnected, invoiceController.getInvoices);

module.exports = router;
