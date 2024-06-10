const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const extractFolderName = require('../middlewares/extractFolderName');

// Route pour recevoir des fichiers (protégée par le middleware isConnected)
router.post('/upload', extractFolderName, upload.array('files'), isConnected, fileController.uploadFiles);

// Route pour envoyer un fichier (protégée par le middleware isAdminOrSuperAdmin)
router.get('/download', isConnected, fileController.downloadFile);

// Route pour supprimer un fichier (protégée par le middleware isAdminOrSuperAdmin)
router.delete('/deleteFile', isAdminOrSuperAdmin, fileController.deleteFile);

// Route pour updateFile (protégée par le middleware isAdminOrSuperAdmin)
router.put('/updateFile', isAdminOrSuperAdmin, fileController.updateFile);

module.exports = router;
