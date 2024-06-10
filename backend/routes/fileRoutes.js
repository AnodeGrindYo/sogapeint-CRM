const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { isAdminOrSuperAdmin, isConnected } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const extractFolderName = require('../middlewares/extractFolderName');

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Téléverser des fichiers
 *     description: Permet de téléverser des fichiers et de les associer à un contrat.
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               contractId:
 *                 type: string
 *                 description: ID du contrat
 *                 example: "60c72b2f9b1e8a5b9c456789"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Fichiers téléversés et enregistrés avec succès
 *       400:
 *         description: Aucun fichier n'a été téléversé
 *       404:
 *         description: Contrat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/upload', extractFolderName, upload.array('files'), isConnected, fileController.uploadFiles);

/**
 * @swagger
 * /download:
 *   get:
 *     summary: Télécharger un fichier
 *     description: Permet de télécharger un fichier associé à un contrat.
 *     tags: [Files]
 *     parameters:
 *       - in: query
 *         name: contractId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du contrat
 *       - in: query
 *         name: fileId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du fichier
 *     responses:
 *       200:
 *         description: Fichier téléchargé avec succès
 *       400:
 *         description: ID de contrat ou de fichier invalide
 *       404:
 *         description: Contrat ou fichier non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/download', isConnected, fileController.downloadFile);

/**
 * @swagger
 * /deleteFile:
 *   delete:
 *     summary: Supprimer un fichier
 *     description: Permet de supprimer un fichier associé à un contrat.
 *     tags: [Files]
 *     parameters:
 *       - in: query
 *         name: contractId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du contrat
 *       - in: query
 *         name: fileId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du fichier
 *     responses:
 *       200:
 *         description: Fichier supprimé avec succès
 *       400:
 *         description: ID de contrat ou de fichier invalide
 *       404:
 *         description: Contrat ou fichier non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/deleteFile', isAdminOrSuperAdmin, fileController.deleteFile);

/**
 * @swagger
 * /updateFile:
 *   put:
 *     summary: Mettre à jour un fichier
 *     description: Permet de mettre à jour les informations d'un fichier associé à un contrat.
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileId:
 *                 type: string
 *                 description: ID du fichier
 *                 example: "60c72b2f9b1e8a5b9c456789"
 *               updateData:
 *                 type: object
 *                 description: Données de mise à jour
 *                 properties:
 *                   name:
 *                     type: string
 *                   processed:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Fichier mis à jour avec succès
 *       400:
 *         description: ID de fichier invalide
 *       404:
 *         description: Fichier non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/updateFile', isAdminOrSuperAdmin, fileController.updateFile);

module.exports = router;
