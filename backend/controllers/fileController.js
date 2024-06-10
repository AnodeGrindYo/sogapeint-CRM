const ContractModel = require('../models/Contract');
const mongoose = require('mongoose');
const fs = require('fs');
const upload = require('../middlewares/uploadMiddleware');

const uploadMiddleware = upload.array('files');

exports.uploadFiles = async (req, res) => {
    console.log("Tentative de téléversement de fichiers");
    console.log("Corps de la requête:", req.body);
    console.log("contractId", req.body.contractId);
    console.log("Fichiers:", req.files);

    if (!req.files || req.files.length === 0) {
        return res.status(400).send("Aucun fichier n'a été téléversé.");
    }

    const contractId = req.body.contractId;
    let filesPaths;

    if (req.query.folderName == "invoices") {
        filesPaths = req.files.map((file) => ({
            path: file.path,
            name: 'invoice_' + file.originalname,
            size: file.size,
            contractId: contractId,
            processed: false
        }));
    } else {
        filesPaths = req.files.map((file) => ({
            path: file.path,
            name: file.originalname,
            size: file.size,
        }));
    }

    try {
        const contract = await ContractModel.findByIdAndUpdate(
            contractId, {
                $push: {
                    file: {
                        $each: filesPaths
                    }
                }
            }, {
                new: true,
                useFindAndModify: false
            }
        );

        if (!contract) {
            console.log("Contrat non trouvé. id: " + contractId);
            return res.status(404).send("Contrat non trouvé. id: " + contractId);
        }

        console.log("Fichiers téléversés et enregistrés avec succès.");
        res.status(200).send({
            message: "Fichiers téléversés et enregistrés avec succès.",
            files: contract.file,
        });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement des fichiers:", error);
        res.status(500).send(error);
    }
};

exports.downloadFile = async (req, res) => {
    console.log('Tentative de téléchargement du fichier');
    console.log('Requête:', req.query);
    try {
        const {
            contractId,
            fileId
        } = req.query;

        if (!mongoose.Types.ObjectId.isValid(contractId)) {
            console.log("ID de contrat invalide : ", contractId);
            return res.status(400).send('ID de contrat invalide.');
        }

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            console.log("ID de fichier invalide : ", fileId);
            return res.status(400).send('ID de fichier invalide.');
        }

        const contract = await ContractModel.findById(contractId, 'file');
        if (!contract) {
            return res.status(404).send('Contrat non trouvé.');
        }

        const file = contract.file.id(fileId);
        if (!file) {
            return res.status(404).send('Fichier non trouvé.');
        }

        fs.access(file.path, fs.constants.R_OK, (err) => {
            if (err) {
                console.error('Le fichier n\'est pas accessible:', err);
                return res.status(404).send('Fichier non trouvé sur le serveur.');
            }

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('cache', 'no-cache');
            res.setHeader('Expires', '0');

            res.download(file.path, file.name, (downloadErr) => {
                console.log('Envoi du fichier au client');
                if (downloadErr) {
                    console.error('Erreur lors de l\'envoi du fichier:', downloadErr);

                    if (downloadErr.code !== 'ECONNABORTED' && downloadErr.code !== 'ECONNRESET') {
                        res.status(500).send('Erreur lors du téléchargement du fichier.');
                    }
                }
            });
        });
    } catch (error) {
        console.error('Erreur lors de la tentative de téléchargement du fichier:', error);
        res.status(500).send(error);
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const {
            contractId,
            fileId
        } = req.query;
        console.log('Suppression du fichier avec l\'ID:', fileId);
        console.log('Contrat ID:', contractId);

        if (!mongoose.Types.ObjectId.isValid(contractId)) {
            return res.status(400).send('ID de contrat invalide.');
        }
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).send('ID de fichier invalide.');
        }

        const contract = await ContractModel.findById(contractId, 'file');
        if (!contract) {
            return res.status(404).send('Contrat non trouvé.');
        }
        const file = contract.file.id(fileId);
        if (!file) {
            return res.status(404).send('Fichier non trouvé.');
        }
        fs.unlink(file.path, async (err) => {
            if (err) {
                console.error('Erreur lors de la suppression du fichier:', err);
                return res.status(500).send('Erreur lors de la suppression du fichier.');
            }

            const updatedContract = await ContractModel.findByIdAndUpdate(
                contractId, {
                    $pull: {
                        file: {
                            _id: fileId
                        }
                    }
                }, {
                    new: true
                }
            );
            if (!updatedContract) {
                return res.status(404).send('Fichier non trouvé.');
            }
            res.status(200).send({
                message: 'Fichier supprimé avec succès.',
                contract: updatedContract
            });
        });

    } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.updateFile = async (req, res) => {
    try {
        const {
            fileId,
            updateData
        } = req.body;
        console.log('Mise à jour du fichier avec l\'ID:', fileId);
        console.log('Données de mise à jour:', updateData);

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).send('ID de fichier invalide.');
        }

        const updateFields = {};
        for (const [key, value] of Object.entries(updateData)) {
            updateFields[`file.$.${key}`] = value;
        }

        const updatedContract = await ContractModel.findOneAndUpdate({
            'file._id': fileId
        }, {
            $set: updateFields
        }, {
            new: true
        });

        if (!updatedContract) {
            return res.status(404).send('Fichier non trouvé.');
        }

        res.status(200).send({
            message: 'Fichier mis à jour avec succès.',
            contract: updatedContract
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du fichier:', error);
        res.status(500).json({
            error: error.message
        });
    }
};