const express = require('express');
const router = express.Router();
const benefitController = require('../controllers/benefitController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');

// Route pour obtenir le nom d'une prestation par son id
router.get('/benefit/:benefitId', isConnected, benefitController.getBenefitNameById);

// Route pour vérifier si une prestation est utilisée
router.get('/checkBenefitInUse', isConnected, benefitController.checkBenefitInUse);

// Route pour remplacer une prestation
router.put('/replaceBenefit', isAdminOrSuperAdmin, benefitController.replaceBenefit);

// Route pour obtenir la liste de tous les services
router.get('/benefits', isConnected, benefitController.getBenefits);

// Route pour ajouter un service
router.post('/benefit', isAdminOrSuperAdmin, benefitController.addBenefit);

// Route pour supprimer un service par son id
router.delete('/benefit/:benefitId', isAdminOrSuperAdmin, benefitController.deleteBenefit);

module.exports = router;
