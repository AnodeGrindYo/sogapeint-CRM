const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const debug = require('debug')('emailService');
const User = require('../models/User'); // Ajout pour vérifier le champ authorized_connection
require('dotenv').config();

const secure = process.env.SMTP_SECURE === 'true';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    debug('Erreur de connexion au serveur SMTP:', error);
  } else {
    debug('Connexion au serveur SMTP réussie');
  }
});

const readTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  debug('Lecture du template:', templatePath);

  let template;
  try {
    template = fs.readFileSync(templatePath, { encoding: 'utf-8' });
  } catch (error) {
    debug('Erreur lors de la lecture du template:', error);
    throw error;
  }

  Object.keys(replacements).forEach((key) => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
  });

  return template;
};

const sendEmail = async (to, subject, replacements, templateName) => {
  debug('Envoi d\'un e-mail à:', to);

  const user = await User.findOne({ email: to });
  if (!user || !user.authorized_connection) {
    debug('L\'utilisateur n\'est pas autorisé à recevoir des emails:', to);
    return;
  }

  const htmlContent = readTemplate(templateName, replacements);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    debug('Email envoyé:', info.response);
  } catch (error) {
    debug('Erreur lors de l\'envoi de l\'email:', error);
  }
};

const readTemplateForHandlebars = (templateName, replacements) => {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  debug('Lecture du template pour Handlebars:', templatePath);

  let template;
  try {
    template = fs.readFileSync(templatePath, { encoding: 'utf-8' });
  } catch (error) {
    debug('Erreur lors de la lecture du template:', error);
    throw error;
  }

  const compiledTemplate = Handlebars.compile(template);
  return compiledTemplate(replacements);
};

const sendEmailWithHandlebars = async (to, subject, replacements, templateName) => {
  debug('Envoi d\'un e-mail à:', to);

  const user = await User.findOne({ email: to });
  if (!user || !user.authorized_connection) {
    debug('L\'utilisateur n\'est pas autorisé à recevoir des emails:', to);
    return;
  }

  const htmlContent = readTemplateForHandlebars(templateName, replacements);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    debug('Email envoyé:', info.response);
  } catch (error) {
    debug('Erreur lors de l\'envoi de l\'email:', error);
  }
};

module.exports = { sendEmail, sendEmailWithHandlebars };
