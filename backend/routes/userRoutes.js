const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /addUser:
 *   post:
 *     summary: Ajouter un nouvel utilisateur
 *     description: Crée un nouvel utilisateur avec les informations fournies.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               role:
 *                 type: string
 *               active:
 *                 type: boolean
 *               authorized_connection:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Requête invalide
 *       500:
 *         description: Erreur serveur
 */
router.post('/addUser', isAdminOrSuperAdmin, userController.addUser);

/**
 * @swagger
 * /allUsers:
 *   get:
 *     summary: Obtenir tous les utilisateurs
 *     description: Récupère la liste de tous les utilisateurs.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       500:
 *         description: Erreur serveur
 */
router.get('/allUsers', isConnected, userController.getAllUsers);

/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: Obtenir un utilisateur par ID
 *     description: Récupère les informations d'un utilisateur spécifique par ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur à récupérer
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:userId', isConnected, userController.getUserById);

/**
 * @swagger
 * /user/{userId}:
 *   put:
 *     summary: Modifier un utilisateur
 *     description: Met à jour les informations d'un utilisateur spécifique par ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               role:
 *                 type: string
 *               active:
 *                 type: boolean
 *               authorized_connection:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/user/:userId', isAdminOrSuperAdmin, userController.updateUser);

/**
 * @swagger
 * /user/{userId}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Supprime un utilisateur spécifique par ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur à supprimer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/user/:userId', isAdminOrSuperAdmin, userController.deleteUser);

/**
 * @swagger
 * /user-search:
 *   get:
 *     summary: Rechercher un utilisateur par nom, prénom ou email
 *     description: Recherche des utilisateurs par nom, prénom ou email.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Chaîne de recherche pour le nom, prénom ou email
 *     responses:
 *       200:
 *         description: Liste des utilisateurs correspondant à la recherche
 *       500:
 *         description: Erreur serveur
 */
router.get('/user-search', isConnected, userController.searchUsers);

module.exports = router;
