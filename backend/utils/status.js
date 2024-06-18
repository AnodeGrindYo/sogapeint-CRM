const translateStatus = (status) => {
    const statusDict = {
        'in_progress': 'En cours',
        'null': 'En cours',
        null: 'En cours',
        'achieve': 'Réalisé',
        'canceled': 'Annulé',
        'invoiced': 'Facturé',
        'anomaly': 'Anomalie'
    };
    return statusDict[status] || 'Statut inconnu';
};

module.exports = {
    translateStatus
};
