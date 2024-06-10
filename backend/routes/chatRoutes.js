const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

module.exports = (io) => {
  /**
   * @swagger
   * /:
   *   get:
   *     summary: Récupérer les messages de chat avec pagination
   *     description: Récupère les messages de chat pour une plage de temps spécifiée. Par défaut, récupère les messages des 7 derniers jours.
   *     tags: [Chat]
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: integer
   *           default: 7
   *         required: false
   *         description: Nombre de jours pour lesquels récupérer les messages
   *     responses:
   *       200:
   *         description: Liste des messages de chat
   *       500:
   *         description: Erreur serveur
   */
  router.get('/', chatController.getAllMessages);

  /**
   * @swagger
   * /:
   *   post:
   *     summary: Ajouter un nouveau message de chat
   *     description: Ajoute un nouveau message de chat et l'envoie à tous les clients connectés via WebSocket.
   *     tags: [Chat]
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
   *               message:
   *                 type: string
   *                 example: "Bonjour, comment ça va ?"
   *     responses:
   *       201:
   *         description: Message de chat ajouté avec succès
   *       400:
   *         description: Erreur lors de l'ajout du message
   */
  router.post('/', chatController.addMessage(io));

  return router;
};
