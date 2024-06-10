const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');

// Route pour ajouter un nouvel utilisateur
router.post('/addUser', isAdminOrSuperAdmin, userController.addUser);

// Route pour obtenir tous les utilisateurs (protégée par le middleware)
router.get('/allUsers', isConnected, userController.getAllUsers);

// Route pour obtenir un utilisateur (protégée par le middleware)
router.get('/user/:userId', isConnected, userController.getUserById);

// Route pour modifier un utilisateur (protégée par le middleware isAdminOrSuperAdmin)
router.put('/user/:userId', isAdminOrSuperAdmin, userController.updateUser);

// Route pour supprimer un utilisateur (protégée par le middleware isAdminOrSuperAdmin)
router.delete('/user/:userId', isAdminOrSuperAdmin, userController.deleteUser);

// Route pour rechercher un utilisateur par nom, prénom ou email
router.get('/user-search', isConnected, userController.searchUsers);

module.exports = router;
