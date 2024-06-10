const fs = require('fs');
const path = require('path');
const swaggerAutogen = require('swagger-autogen')();
const swaggerUi = require('swagger-ui-dist');

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
const endpointsFiles = ['./server.js']; // Chemins vers vos fichiers de routes

const outputDir = path.join(__dirname, 'swagger-docs');

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    // Créer le répertoire de sortie s'il n'existe pas
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }

    // Copier les fichiers Swagger UI dans le répertoire de sortie
    fs.readdirSync(swaggerUi.getAbsoluteFSPath()).forEach(file => {
        fs.copyFileSync(path.join(swaggerUi.getAbsoluteFSPath(), file), path.join(outputDir, file));
    });

    // Copier le fichier swagger-output.json généré
    fs.copyFileSync(path.join(__dirname, 'swagger-output.json'), path.join(outputDir, 'swagger-output.json'));

    // Créer un fichier index.html personnalisé pour utiliser votre fichier swagger-output.json
    const indexHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Documentation API Sogapeint</title>
        <link rel="stylesheet" type="text/css" href="./swagger-ui.css" >
        <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
        <style>
            .swagger-ui .topbar { display: none }
            .swagger-ui .info .title { font-size: 2em; font-weight: bold; }
        </style>
    </head>

    <body>
        <div id="swagger-ui"></div>

        <script src="./swagger-ui-bundle.js"> </script>
        <script src="./swagger-ui-standalone-preset.js"> </script>
        <script>
        window.onload = function() {
          // Begin Swagger UI call region
          const ui = SwaggerUIBundle({
            url: "./swagger-output.json",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
          })
          // End Swagger UI call region

          window.ui = ui
        }
      </script>
    </body>
    </html>
    `;

    fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);

    console.log('Swagger documentation generated successfully in', outputDir);
}).catch(error => {
    console.error('Error generating Swagger documentation:', error);
});
