const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Contract = require('./models/Contract');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Fichier d'erreurs
const errorLogPath = path.join(__dirname, 'updateErrors.log');

// Fonction pour écrire des erreurs dans un fichier
function logError(errorMessage) {
  fs.appendFileSync(errorLogPath, errorMessage + '\n');
}

// Fonction de mise à jour
async function updateInternalNumbers() {
  try {
    // Récupérer toutes les commandes qui n'ont pas l'année dans le numéro interne (format sans année)
    const contracts = await Contract.find({ internal_number: { $regex: /^[A-Z]+-\d{3}$/ } });
    
    console.log(`Nombre de commandes à mettre à jour : ${contracts.length}`);
    
    for (const contract of contracts) {
      let year;

      // Priorité 1: Prendre l'année de `date_cde`
      if (contract.date_cde) {
        year = new Date(contract.date_cde).getFullYear();
      }
      // Priorité 2: Prendre l'année de `start_date_works`
      else if (contract.start_date_works) {
        year = new Date(contract.start_date_works).getFullYear();
      }
      // Priorité 3: Prendre l'année de `dateAdd`
      else if (contract.dateAdd) {
        year = new Date(contract.dateAdd).getFullYear();
      }

      // Si aucune année n'a pu être déterminée, enregistrer une erreur
      if (!year) {
        const errorMessage = `Erreur : Impossible de déterminer l'année pour la commande ID ${contract._id}.\nDétails : ${JSON.stringify(contract, null, 2)}\n`;
        console.error(errorMessage);
        logError(errorMessage);
        continue;
      }

      // Mise à jour du numéro interne avec l'année
      const parts = contract.internal_number.split('-');
      const abbr = parts[0];
      const num = parts[1];
      const newInternalNumber = `${abbr}-${year}-${num}`;

      try {
        // Mise à jour dans la base de données
        await Contract.updateOne({ _id: contract._id }, { $set: { internal_number: newInternalNumber } });
        console.log(`Mise à jour du numéro interne de ${contract.internal_number} à ${newInternalNumber}`);
      } catch (updateError) {
        const errorMessage = `Erreur lors de la mise à jour de la commande ID ${contract._id}.\nDétails : ${JSON.stringify(contract, null, 2)}\nErreur : ${updateError.message}\n`;
        console.error(errorMessage);
        logError(errorMessage);
      }
    }

    console.log('Mise à jour terminée.');
    mongoose.disconnect();
  } catch (error) {
    const errorMessage = `Erreur lors de la mise à jour des numéros internes : ${error.message}\n`;
    console.error(errorMessage);
    logError(errorMessage);
    mongoose.disconnect();
  }
}

// Exécuter la fonction de mise à jour
updateInternalNumbers();
