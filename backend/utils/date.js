const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
};

module.exports = {
    formatDate
};
