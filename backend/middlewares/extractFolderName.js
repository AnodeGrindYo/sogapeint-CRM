const extractFolderName = (req, res, next) => {
    // Exemple d'extraction de folderName à partir des headers
    const folderName = req.headers['x-folder-name']; // Utiliser un en-tête personnalisé pour passer folderName
    console.log(`Received folderName: ${folderName}`);
    if (folderName) {
        req.folderName = folderName;
        console.log(`folderName défini sur ${folderName}`);
    } else {
        // Gestion de l'absence de folderName, si nécessaire
        console.log("Aucun folderName spécifié dans les headers.");
        req.folderName = ''; // ou définissez une logique par défaut si nécessaire
    }

    next(); // Passer au middleware suivant, comme Multer
};

module.exports = extractFolderName;
