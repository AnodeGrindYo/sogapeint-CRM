const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Fonction pour lire et remplacer les placeholders du template HTML
const readTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  let template = fs.readFileSync(templatePath, { encoding: 'utf-8' });

  // Remplacez les placeholders par les valeurs réelles
  Object.keys(replacements).forEach((key) => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
  });

  return template;
};

// Fonction pour envoyer l'email
const sendEmail = async (to, subject, replacements, templateName) => {
  console.log('Envoi d\'un e-mail à:', to);
  const htmlContent = readTemplate(templateName, replacements);

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: to,
    subject: subject,
    html: htmlContent, // Utiliser 'html' au lieu de 'text' pour envoyer le HTML
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé: ' + info.response);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
};

module.exports = { sendEmail };
