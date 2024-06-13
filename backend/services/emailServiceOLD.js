// emailService.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Fonction pour lire le template HTML
const readTemplate = (templateName, replacements) => {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, { encoding: 'utf-8' });
  
    // Remplacez les placeholders par les valeurs réelles
    Object.keys(replacements).forEach((key) => {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
    });
  
    return template;
};


// Fonction pour envoyer l'e-mail
const sendEmail = async (to, subject, replacements, templateName) => {
    console.log('Envoi d\'un e-mail');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Replacements:', replacements);
    const htmlContent = readTemplate(templateName, replacements);
    console.log('HTML content:', htmlContent);
  
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      html: htmlContent, // Utiliser 'html' au lieu de 'text' pour envoyer le HTML
    };
  
    // Envoi de l'e-mail
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });
};

module.exports = { sendEmail };
