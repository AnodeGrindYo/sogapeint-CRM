const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { isConnected } = require('../middlewares/authMiddleware');

// Route pour obtenir la liste des factures
router.get('/invoices', isConnected, invoiceController.getInvoices);

module.exports = router;
