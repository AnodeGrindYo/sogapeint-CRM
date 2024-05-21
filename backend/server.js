const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');
require('dotenv').config();

// Importation des routes
const authRoutes = require('./routes/authRoutes');
const scraperRoutes = require('./routes/scraperRoutes');
const kpiRoutes = require('./routes/kpiRoutes');
const chatRoutes = require('./routes/chatRoutes'); // Importer les routes de chat

// Initialisation d'Express
const app = express();
const server = http.createServer(app);
const frontendUrl = process.env.FRONTEND_URL;
const frontendPort = process.env.FRONTEND_PORT;
const io = socketIo(server, {
  cors: {
    // origin:"http://localhost:4200", // frontend Angular
    origin: `http://${frontendUrl}:${frontendPort}`, // frontend Angular
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Configuration des middlewares
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB', err));

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/scrape', scraperRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/chat', chatRoutes(io)); // Utiliser les routes de chat

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

// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
