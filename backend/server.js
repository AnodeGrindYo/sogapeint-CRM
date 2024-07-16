const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');
const { rescheduleAllEmails } = require('./schedulers/emailScheduler');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Importation des routes
const apiRoutes = require('./routes/index');
const chatRoutes = require('./routes/chatRoutes');

// Initialisation d'Express
const app = express();
const server = http.createServer(app);
const frontendUrl = process.env.FRONTEND_URL;
const frontendPort = process.env.FRONTEND_PORT;
const io = socketIo(server, {
    cors: {
        origin: `http://${frontendUrl}:${frontendPort}`, // frontend Angular
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    }
});
console.log('cors', cors);

// Configuration des middlewares
// app.use(cors());
app.use(cors({
  origin: `http://${frontendUrl}:${frontendPort}`, // frontend Angular
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB', err));

// Utilisation des routes
app.use('/api', apiRoutes);
app.use('/api/chat', chatRoutes(io));

// Configuration Swagger
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'API Sogapeint',
      version: '1.0.0',
      description: 'API backend de l\'application Sogapeint',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  };
  
  const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'],
  };
  
  const swaggerSpec = swaggerJsdoc(options);
  
  const customCss = `
    .swagger-ui .topbar { display: none; }
  `;
  
  app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
    res.set('Content-Security-Policy', "script-src 'self' 'unsafe-inline';");
    next();
  }, swaggerUi.setup(swaggerSpec, {
    customCss,
    customSiteTitle: "API Sogapeint Documentation"
  }));

// Middleware pour la gestion des erreurs
app.use((err, req, res, next) => {
    res.status(500).json({ message: "Une erreur est survenue sur le serveur", error: err });
});

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Fonction pour lister les routes
const listRoutes = (app) => {
    const getRoutes = (stack, path = '') => {
        const routes = [];
        
        stack.forEach(layer => {
            if (layer.route) {
                const routePath = path + layer.route.path;
                layer.route.stack.forEach(subLayer => {
                    if (subLayer.method) {
                        routes.push({
                            method: subLayer.method.toUpperCase(),
                            path: routePath,
                        });
                    }
                });
            } else if (layer.name === 'router' && layer.handle.stack) {
                const routerPath = path + (layer.regexp.source
                    .replace(/\\\//g, '/')
                    .replace(/\/$/, '')
                    .replace(/^\^/, '')
                    .replace('/?(?=/|$)', ''));
                    const subRoutes = getRoutes(layer.handle.stack, routerPath);
                    routes.push(...subRoutes);
                }
            });
            
            return routes;
        };
        
        const routes = getRoutes(app._router.stack);
        
        console.log('Liste des routes disponibles:');
        routes.forEach(route => {
            console.log(`${route.method} ${route.path}`);
        });
};

// Replanifier les emails récurrents au démarrage
mongoose.connection.once('open', () => {
  console.log('Connexion à MongoDB établie.');
  rescheduleAllEmails().then(() => {
      console.log('Reprogrammation des emails récurrents terminée.');
  }).catch(err => {
      console.error('Erreur lors de la reprogrammation des emails récurrents:', err);
  });
});
    
// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    listRoutes(app); // Afficher les routes après le démarrage
});
