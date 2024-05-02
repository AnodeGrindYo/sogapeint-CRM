const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fonction pour déterminer si une partie du formulaire doit être traitée comme un fichier
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "files") { // Vérifier le nom du champ
    console.log("Fichier trouvé");
    cb(null, true);
  } else {
    console.log("Fichier non trouvé");
    cb(null, false); // Ignorer les autres champs
  }
};

// Configuration du stockage de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("req.query.folderName", req.query.folderName);
      const folderName = req.query.folderName || '';
      const uploadsDir = path.join(__dirname, '../uploads', folderName);

      if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
      }

      cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const folderName = req.query.folderName || '';
      let filename = '';
      if (folderName == "invoices") {
        filename = `invoice_${timestamp}-${file.originalname}`;
      } else {
        filename = `${timestamp}-${file.originalname}`;
      }
      cb(null, filename);
  }
});


const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;