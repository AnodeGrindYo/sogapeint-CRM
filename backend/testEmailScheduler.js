// testScheduler.js
require('dotenv').config();
const mongoose = require('mongoose');
const { scheduleEmailToContributor } = require('./schedulers/emailScheduler.js');
const moment = require('moment'); // Utiliser moment pour gérer les dates facilement

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB', err));

// Simuler un contrat avec une date d'envoi dans 5 minutes
const contract = {
    external_contributor: '658aaaee2995b7664d9c36ab', // Remplacer par un ID valide de ta base de données
    external_contributor_invoice_date: moment().add(5, 'minutes').toDate() // Date actuelle + 5 minutes
};

// Appel de la fonction pour planifier l'email
scheduleEmailToContributor(contract);
