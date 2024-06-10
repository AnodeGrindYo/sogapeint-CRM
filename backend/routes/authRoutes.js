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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion de l'utilisateur
 *     description: Authentifie un utilisateur avec son email et mot de passe.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               rememberMe:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Adresse email invalide
 *       401:
 *         description: Utilisateur non trouvé ou non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', loginLimiter, authController.login);

/**
 * @swagger
 * /resetPasswordFromAdmin:
 *   post:
 *     summary: Réinitialisation du mot de passe par un administrateur
 *     description: Permet à un administrateur de réinitialiser le mot de passe d'un utilisateur.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5b9c456789"
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/resetPasswordFromAdmin', authController.resetPasswordFromAdmin);

/**
 * @swagger
 * /forgotPassword:
 *   post:
 *     summary: Demande de réinitialisation du mot de passe par un utilisateur
 *     description: Permet à un utilisateur de demander un code de réinitialisation pour son mot de passe.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Un e-mail avec un code de réinitialisation a été envoyé
 *       404:
 *         description: Aucun utilisateur trouvé avec cet e-mail
 *       500:
 *         description: Erreur serveur
 */
router.post('/forgotPassword', authController.forgotPassword);

/**
 * @swagger
 * /verifyResetCode:
 *   post:
 *     summary: Vérification du code de réinitialisation
 *     description: Vérifie le code de réinitialisation envoyé à l'utilisateur.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 example: "1a2b3c4d"
 *     responses:
 *       200:
 *         description: Le code de réinitialisation est valide
 *       400:
 *         description: Code de réinitialisation invalide ou expiré
 *       500:
 *         description: Erreur serveur
 */
router.post('/verifyResetCode', authController.verifyResetCode);

/**
 * @swagger
 * /resetPassword:
 *   post:
 *     summary: Réinitialisation du mot de passe
 *     description: Réinitialise le mot de passe de l'utilisateur avec un nouveau mot de passe.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 example: "1a2b3c4d"
 *               newPassword:
 *                 type: string
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Code de réinitialisation invalide ou expiré
 *       500:
 *         description: Erreur serveur
 */
router.post('/resetPassword', authController.resetPassword);

module.exports = router;
