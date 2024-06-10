const ContractModel = require('../models/Contract');
const mongoose = require('mongoose');
const fs = require('fs');

exports.getInvoices = async (req, res) => {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Début de l'exécution de getInvoices`);
    
    try {
        const contracts = await ContractModel.find(
            { 'file.name': /^invoice_/ }, 
            { file: 1, _id: 0 } 
        ).sort({ 'file.uploadDate': -1 });
        
        if (!contracts || contracts.length === 0) {
            console.log(`[${new Date().toISOString()}] Aucune facture trouvée`);
            return res.status(404).send("Aucune facture trouvée.");
        }
        
        const invoices = contracts.flatMap(contract => contract.file)
        .filter(file => file.name.startsWith('invoice_'))
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        const endTime = Date.now();
        console.log(`[${new Date().toISOString()}] Fin de l'exécution de getInvoices`);
        console.log(`[${new Date().toISOString()}] Durée de l'exécution: ${endTime - startTime}ms`);
        
        res.status(200).send(invoices);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Erreur lors de la récupération des factures:`, error);
        res.status(500).send(error);
    }
};
