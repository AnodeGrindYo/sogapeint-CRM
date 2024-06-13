const User = require('../models/User');
const Benefit = require('../models/benefit');

const getStatus = (status) => {
  const statusDict = {
    'in_progress': 'En cours',
    'null': 'En cours',
    null: 'En cours',
    'achieve': 'Réalisé',
    'canceled': 'Annulé',
    'invoiced': 'Facturé',
    'anomaly': 'Anomalie'
  };
  return statusDict[status] || 'Status inconnu';
};

const getEmailReplacements = async (contract) => {
  const customerDetails = await User.findById(contract.customer);
  const externalContributorDetails = await User.findById(contract.external_contributor);
  const contactDetails = await User.findById(contract.contact);
  const formattedDate = contract.date_cde ? new Date(contract.date_cde).toISOString().split('T')[0] : 'Aucune date fournie';
  const occupiedText = contract.occupied ? 'Oui' : 'Non';
  const statusText = getStatus(contract.status);
  const benefitDetails = await Benefit.findById(contract.benefit).exec();
  const benefitName = benefitDetails ? benefitDetails.name : 'Prestation inconnue';

  return {
    'contract.internal_number': contract.internal_number || '',
    'contract.date_cde': formattedDate,
    'customer.firstname': customerDetails.firstname || '',
    'customer.lastname': customerDetails.lastname || '',
    'contact.firstname': contactDetails ? contactDetails.firstname : '',
    'contact.lastname': contactDetails ? contactDetails.lastname : '',
    'benefit_name': benefitName,
    'contract.status': statusText,
    'contract.address': contract.address || '',
    'contract.appartment_number': contract.appartment_number || '',
    'contract.occupied': occupiedText,
    'CRM_URL': process.env.CRM_URL
  };
};

module.exports = { getEmailReplacements };
