// const path = require('path');
// const multer = require('multer');
// const fs = require('fs');

// const DEBUG = true;

// // Fonction d'aide pour les logs conditionnels
// function debugLog(...messages) {
//   if (DEBUG) {
//     console.log(...messages);
//   }
// }

// // Configuration du stockage de multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadsDir = path.join(__dirname, '../uploads');
//     debugLog('Vérification de l\'existence du dossier uploads...');
//     if (!fs.existsSync(uploadsDir)) {
//       debugLog('Le dossier uploads n\'existe pas. Création en cours...');
//       fs.mkdirSync(uploadsDir, { recursive: true }); // Créer le dossier s'il n'existe pas.
//       debugLog('Dossier uploads créé.');
//     }
//     cb(null, uploadsDir);
//   },
//   filename: (req, file, cb) => {
//     // Vous pouvez ajouter des logiques supplémentaires pour le nom de fichier si nécessaire.
//     const filename = Date.now() + '-' + file.originalname;
//     debugLog(`Génération du nom de fichier : ${filename}`);
//     cb(null, filename);
//   }
// });

// // Initialisez multer avec la configuration de stockage
// const upload = multer({ storage: storage });

// // Exportez le middleware de multer configuré pour une utilisation dans les routes
// module.exports = upload;


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fonction pour déterminer si une partie du formulaire doit être traitée comme un fichier
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "files") { // Assurez-vous que seuls les champs avec le nom "files" sont traités
    console.log("Fichier trouvé");
    cb(null, true);
  } else {
    console.log("Fichier non trouvé");
    cb(null, false); // Ignorer les autres champs
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    console.log("uploadsDir", uploadsDir);
    if (!fs.existsSync(uploadsDir)) {
      console.log("Dossier uploads inexistant. Création en cours...");
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("Dossier uploads créé.");
    }
    console.log("Dossier uploads existant.");
    console.log("Enregistrement du fichier dans le dossier uploads...");
    cb(null, uploadsDir);
    console.log("Fichier enregistré dans le dossier uploads.");
  },
  filename: (req, file, cb) => {
    console.log("Génération du nom de fichier...");
    console.log("file", file);
    const filename = Date.now() + '-' + file.originalname;
    console.log("filename", filename);
    cb(null, filename);
  }
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;