const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-dist');

const outputDir = path.join(__dirname, 'swagger-docs');

// Créer le répertoire de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

// Copier les fichiers Swagger UI dans le répertoire de sortie
fs.readdirSync(swaggerUi.getAbsoluteFSPath()).forEach(file => {
  fs.copyFileSync(path.join(swaggerUi.getAbsoluteFSPath(), file), path.join(outputDir, file));
});

// Créer un fichier index.html personnalisé pour utiliser votre fichier swagger.json
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>API Documentation</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" >
    <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
    <style>
        html
        {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *,
        *:before,
        *:after
        {
            box-sizing: inherit;
        }

        body {
            margin:0;
            background: #fafafa;
        }
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
        url: "./swagger.json",
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
