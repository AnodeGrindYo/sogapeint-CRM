const swaggerAutogen = require('swagger-autogen')();
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const doc = {
    info: {
        title: 'API Sogapeint',
        version: '1.0.0',
        description: 'API backend de l\'application Sogapeint.',
    },
    host: 'localhost:3000',
    schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/*.js']; // Chemins vers vos fichiers de routes

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    const express = require('express');
    const swaggerFile = require('./swagger-output.json'); // Fichier généré
    const app = express();

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Documentation API Sogapeint',
    }));

    // Démarrer le serveur
    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
});
