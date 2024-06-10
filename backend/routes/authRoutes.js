const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');

// Limiter pour la route de connexion // limite tentatives de connexion
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limite chaque IP à 15 tentatives de connexion
    message: 'Trop de tentatives de connexion depuis cette IP, veuillez réessayer après 15 minutes'
});

// Route pour la connexion
router.post('/login', loginLimiter, authController.login);

// Route pour la réinitialisation du mot de passe par un administrateur
router.post('/resetPasswordFromAdmin', authController.resetPasswordFromAdmin);

// Route pour demander la réinitialisation du mot de passe par un utilisateur
router.post('/forgotPassword', authController.forgotPassword);

// Route pour vérifier le code de réinitialisation
router.post('/verifyResetCode', authController.verifyResetCode);

// Route pour réinitialiser le mot de passe
router.post('/resetPassword', authController.resetPassword);

module.exports = router;
