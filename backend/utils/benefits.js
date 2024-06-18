const Benefit = require('../models/benefit');

const getBenefitName = async (benefitId) => {
    try {
        const benefit = await Benefit.findById(benefitId);
        return benefit ? benefit.name : 'Prestation inconnue';
    } catch (error) {
        console.error('Erreur lors de la récupération de la prestation:', error);
        return 'Prestation inconnue';
    }
};

module.exports = {
    getBenefitName
};
