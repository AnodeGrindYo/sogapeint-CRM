const nodemailer = require('nodemailer');
require('dotenv').config(); // Charger les variables d'environnement depuis le fichier .env

// Configuration de Nodemailer pour l'envoi d'email
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true pour le port 465, sinon false
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Fonction pour envoyer l'email
async function sendObservationEmail() {
    const observation = {
        internal_number: '815147', // Numéro de commande fictif
        customer: {
            email: 'mr.a.godoy@gmail.com', // Destinataire du test
            firstname: 'Andrés',
            lastname: 'Godoy'
        },
        address: '24 rue Raymond Grimaud, 31700 BLAGNAC', // Adresse fictive
        appartment_number: 'Apt 123', // Numéro d'appartement fictif
        user: 'John Doe', // Utilisateur fictif ayant ajouté l'observation
        comment: 'Rendez-vous pris pour le 05.09.24.' // Détail de l'observation
    };

    const mailOptions = {
        from: process.env.SMTP_USER, // L'email de l'expéditeur
        to: observation.customer.email, // Destinataire
        subject: `[SOGAPEINT] - Nouvelle observation ajoutée pour la commande : ${observation.internal_number}`,
        html: `
            <p>Bonjour ${observation.customer.firstname},</p>
            <p>Une observation a été ajoutée à votre commande portant le numéro ${observation.internal_number} pour notre intervention à l'adresse : ${observation.appartment_number} ${observation.address}.</p>
            <p>Observation renseignée par : ${observation.user} <br/>
            Détails de l'observation : ${observation.comment}.</p>
            <p>Vous pouvez consulter l’état d'avancement de votre commande sur l'application <a href="${process.env.FRONTEND_URL}">Sogapeint</a> dans l'espace qui vous est dédié.</p>
            <p>Cordialement,<br/>L'équipe de Sogapeint</p>
            <p><strong>Contact :</strong> <br/>
            05 61 57 97 37 <br/>
            travaux.logements@sogapeint.fr <br/>
            www.sogapeint.fr <br/>
            24 rue Raymond Grimaud 31700 BLAGNAC</p>
        `
    };

    // Envoi de l'email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email envoyé avec succès : ${info.response}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'email : ${error.message}`);
    }
}

// Appel de la fonction pour envoyer l'email
sendObservationEmail();
