const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

module.exports = (io) => {
  // Route pour récupérer les messages de chat avec pagination
  // `days` paramètre pour définir la plage de temps (par défaut 7 jours)
  router.get('/', chatController.getAllMessages);

  // Route pour ajouter un nouveau message de chat
  router.post('/', chatController.addMessage(io));

  return router;
};
