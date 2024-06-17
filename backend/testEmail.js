const { sendEmail } = require('./services/emailService');
const debug = require('debug')('testEmail');
require('dotenv').config();

const main = async () => {
  debug('Début du test d\'envoi d\'email');
  const to = 'mr.a.godoy@gmail.com'; // Remplacez par l'adresse email du destinataire
  const subject = 'Test Email';
  const replacements = { name: 'John Doe' };
  const templateName = 'testEmail';

  await sendEmail(to, subject, replacements, templateName);
  debug('Fin du test d\'envoi d\'email');
};

main();
