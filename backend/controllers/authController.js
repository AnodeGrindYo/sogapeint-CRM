const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const benefit = require('../models/benefit');
const CompanyModel = require('../models/Company');
const ContractModel = require('../models/Contract');
const Observation = require('../models/observation');
const Incident = require('../models/incident');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');
const upload = require('../middlewares/uploadMiddleware');
const multer = require('multer');
const fs = require('fs');

// Le middleware multer pour gérer le téléversement
const uploadMiddleware = upload.array('files'); // 'files' est le nom du champ dans le formulaire

// // console.log('Importation du authController');

const { isEmail } = require('validator');

exports.login = async (req, res) => {
  try {
    // // console.log('Tentative de connexion');
    const { email, password } = req.body;
    if (!isEmail(email)) {
      return res.status(400).json({ message: 'Adresse email invalide.' });
    }
    
    // // console.log('Email:', email);
    
    // Recherche de l'utilisateur avec des conditions supplémentaires (actif et autorisé)
    const user = await User.findOne({ email, active: true, authorized_connection: true });
    // // console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé ou non autorisé.' });
    }
    
    // // console.log('Vérification du mot de passe');
    const isMatch = await bcrypt.compare(password, user.password);
    // // console.log('Le mot de passe correspond:', isMatch ? 'Oui' : 'Non');
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Mauvais mot de passe.' });
    }
    
    // // console.log('Génération du token JWT');
    const tokenPayload = { 
      userId: user._id, 
      role: user.role, 
      email: user.email,
      firstName: user.firstname,
      lastName: user.lastname,
      phone: user.phone,
      company: user.company
    };
    // const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Vérifie si l'utilisateur a coché "Se souvenir de moi"
    const expiresIn = req.body.rememberMe ? '7d' : '1h'; // 7 jours si "Se souvenir de moi" est coché, sinon 1 heure
    // // console.log('Expiration du token:', expiresIn);
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: expiresIn });
    
    // // console.log('Connexion réussie, token généré');
    res.status(200).json({
      userId: user._id,
      token,
      role: user.role,
      firstName: user.firstname,
      lastName: user.lastname,
      phone: user.phone,
      company: user.company
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// réinitialisation du mot de passe par un super admin
exports.resetPasswordFromAdmin = async (req, res) => {
  try {
    // // console.log('Réinitialisation du mot de passe');
    // // console.log('Request :', req);
    // // console.log('Request body:', req.body);
    // // console.log('Request params:', req.params);
    const { userId } = req.body;
    const newPassword = Math.random().toString(36).slice(-10); // Génération d'un mot de passe aléatoire
    
    // // console.log('User id:', userId);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      { password: hashedPassword },
      { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      
      // Capitalise la première lettre du prénom et met le reste en minuscule
      const formatFirstName = updatedUser.firstname.charAt(0).toUpperCase() + updatedUser.firstname.slice(1).toLowerCase();
      
      // Met le nom de famille en majuscule
      const formatLastName = updatedUser.lastname.toUpperCase();
      // Envoi de l'e-mail avec le nouveau mot de passe
      await sendEmail(updatedUser.email, 'Réinitialisation du mot de passe', {
        password: newPassword,
        CRM_URL: process.env.CRM_URL,
        firstname: formatFirstName,
        lastname: formatLastName
      },
      "passwordResetFromAdminTemplate"
      );
      
      // // console.log('Mot de passe réinitialisé avec succès');
      res.status(200).json({ message: 'Mot de passe réinitialisé avec succès et e-mail envoyé.' });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  
  // Fonction pour demander la réinitialisation du mot de passe par un utilisateur
  exports.forgotPassword = async (req, res) => {
    // // console.log('Demande de réinitialisation du mot de passe');
    // // console.log('Request :', req);
    // // console.log('Request body:', req.body);
    // // console.log('Request params:', req.params);
    try {
      const { email } = req.body;
      // Vérifier si l'utilisateur existe dans la base de données
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet e-mail." });
      }
      
      // Générer un code de réinitialisation aléatoire
      const resetCode = crypto.randomBytes(4).toString('hex');
      const resetCodeExpiry = new Date(Date.now() + 3600000); // Code valide pour 1 heure
      
      // Sauvegarder le code et sa date d'expiration dans la base de données
      await User.findByIdAndUpdate(user._id, { resetCode, resetCodeExpiry });
      
      // Capitalise la première lettre du prénom et met le reste en minuscule
      const formatFirstName = user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
      
      // Met le nom de famille en majuscule
      const formatLastName = user.lastname.toUpperCase();
      
      // Envoyer le code à l'utilisateur par e-mail
      await sendEmail(user.email, 'Code de réinitialisation du mot de passe', {
        resetCode: resetCode,
        firstname: formatFirstName,
        lastname: formatLastName 
      },
      'passwordResetCodeTemplate'
      );
      
      res.status(200).json({ message: "Un e-mail avec un code de réinitialisation a été envoyé." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour vérifier le code de réinitialisation
  exports.verifyResetCode = async (req, res) => {
    // // console.log('Vérification du code de réinitialisation');
    // // console.log('Request :', req);
    // // console.log('Request body:', req.body);
    // // console.log('Request params:', req.params);
    try {
      const { email, code } = req.body;
      // // console.log('Email:', email);
      // // console.log('Code:', code);
      // Vérifier si le code et l'email correspondent et si le code n'a pas expiré
      const user = await User.findOne({
        email,
        resetCode: code,
        resetCodeExpiry: { $gt: Date.now() }
      });
      
      // const userTest = await User.findOne({
      //   email
      // });
      // // // console.log('User:', userTest);
      
      if (!user) {
        return res.status(400).json({ message: "Code de réinitialisation invalide ou expiré." });
      }
      
      res.status(200).json({ message: "Le code de réinitialisation est valide.", userId: user._id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour réinitialiser le mot de passe
  exports.resetPassword = async (req, res) => {
    // // console.log('Réinitialisation du mot de passe');
    try {
      const { email, code, newPassword } = req.body;
      // // console.log('email:', email);
      // // console.log('code:', code);
      // // // console.log('New password:', newPassword);
      
      // Vérifier si le code et l'email correspondent et si le code n'a pas expiré
      const user = await User.findOne({
        email,
        resetCode: code,
        resetCodeExpiry: { $gt: Date.now() }
      });
      
      if (!user) {
        return res.status(400).json({ message: "Code de réinitialisation invalide ou expiré." });
      }
      
      // Hasher le nouveau mot de passe avant de le sauvegarder
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(user._id, { password: hashedPassword, resetCode: null, resetCodeExpiry: null });
      
      res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
  
  // Fonction pour obtenir tous les utilisateurs
  exports.getAllUsers = async (req, res) => {
    try {
      // // console.log('Fetching all users');
      const users = await User.find();
      // // console.log(`Found ${users.length} users`);
      // supprimer le mot de passe de chaque utilisateur
      users.forEach(user => {
        user.password = undefined;
        // supprimer le code de réinitialisation et sa date d'expiration de chaque utilisateur
        user.resetCode = undefined;
        user.resetCodeExpiry = undefined;
        // supprime le sel de chaque utilisateur
        user.salt = undefined;
      })
      
      res.status(200).json(users);
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour ajouter un nouvel utilisateur
  exports.addUser = async (req, res) => {
    try {
      // // console.log('Adding new user');
      const { email, password, firstname, lastname, phone, company, role, active, authorized_connection } = req.body;
      if (!isEmail(email)) {
        return res.status(400).json({ message: 'Adresse email invalide.' });
      }
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'Un utilisateur avec cette adresse email existe déjà.' });
      }
      // cherche un utilisateur avec le même nom et prénom (insensible à la casse)
      user = await User.findOne({ firstname: { $regex: new RegExp(`^${firstname}$`, 'i') }, lastname: { $regex: new RegExp(`^${lastname}$`, 'i') } });
      if (user) {
        return res.status(400).json({ message: 'Un utilisateur avec ce nom et prénom existe déjà.' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password: hashedPassword,
        firstname,
        lastname,
        phone,
        company,
        role,
        active,
        authorized_connection,
      });
      await newUser.save();
      // // console.log('New user added');
      res.status(201).json({ message: 'Utilisateur créé avec succès.', userId: newUser._id });
    } catch (error) {
      console.error('Error adding new user:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour avoir un utilisateur par son id
  exports.getUserById = async (req, res) => {
    try {
      // // console.log('Fetching user by id');
      // // // console.log('Request :', req);
      const { userId } = req.params;
      // // console.log('User id:', userId);
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      // // console.log('Found user:', user);
      // supprimer le mot de passe de la réponse
      user.password = undefined;
      // supprimer le code de réinitialisation et sa date d'expiration de la réponse
      user.resetCode = undefined;
      user.resetCodeExpiry = undefined;
      // supprime le sel de la réponse
      user.salt = undefined;
      res.status(200).json(user);
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour modifier un utilisateur
  exports.updateUser = async (req, res) => {
    // // console.log('Modification de l’utilisateur');
    // // console.log('Request :', req);
    // // console.log('Request body:', req.body);
    // // console.log('Request params:', req.params);
    try {
      // // console.log('Modification de l’utilisateur');
      const { userId } = req.params;
      const { email, firstname, lastname, phone, company, role, active, authorized_connection } = req.body;
      // // console.log('User id:', userId);
      // Mise à jour de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {
        email, firstname, lastname, phone, company, role, active, authorized_connection
      }, { new: true });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      
      // // console.log('Utilisateur modifié avec succès');
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Erreur lors de la modification de l’utilisateur:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  
  // Fonction pour supprimer un utilisateur
  exports.deleteUser = async (req, res) => {
    try {
      // // console.log('Suppression de l’utilisateur');
      const { userId } = req.params;
      
      const deletedUser = await User.findByIdAndDelete(userId);
      
      if (!deletedUser) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      
      // // console.log('Utilisateur supprimé avec succès');
      res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l’utilisateur:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour rechercher un utilisateur par nom, prénom ou email (insensible à la casse)
  exports.searchUsers = async (req, res) => {
    // console.log('Recherche d\’utilisateurs');
    try {
      // console.log('Recherche d\’utilisateurs');
      // console.log('Request :', req.query);
      const query = req.query.q;
      // Recherche insensible à la casse, selon une partie du prénom, du nom ou de l'email
      const users = await User.find({
        $or: [
          { firstname: { $regex: query, $options: 'i' } },
          { lastname: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      });
      // console.log('Nombre d\’utilisateurs trouvés:', users.length);
      // console.log('Users:', users);
      res.json(users);
    } catch (error) {
      res.status(500).send({ message: "Erreur lors de la recherche des utilisateurs", error });
    }
  };
  
  
  
  //// ENTREPRISES TEST
  
  
  exports.getCompanies = async (req, res) => {
    // // console.log('Récupération des entreprises');
    try {
      const companies = await CompanyModel.find({}).populate('employees').populate('documents').populate('contractsAsCustomer').populate('contractsAsContact').populate('contractsAsExternalContributor');
      // // console.log(`Found ${companies.length} companies`);
      res.json(companies);
    } catch (error) {
      res.status(500).send({ message: "Erreur lors de la récupération des entreprises", error });
      console.error('Erreur lors de la récupération des entreprises:', error);
    }
  };
  
  // Fonction pour rechercher des entreprises par nom
  // Si aucune entreprise n'est trouvée, renvoie un tableau vide
  exports.searchCompanies = async (req, res) => {
    try {
      const query = req.query.q;
      const companies = await CompanyModel.find({
        $or: [
          { normalized_name: new RegExp(query, 'i') },
          { names: new RegExp(query, 'i') }
        ]
      }).select('normalized_name names -_id');
      res.json(companies);
    } catch (error) {
      res.status(500).send({ message: "Erreur lors de la recherche des entreprises", error });
    }
  };
  
  // Fonction pour avoir une entreprise par son id
  exports.getCompanyById = async (req, res) => {
    try {
      // // console.log('Fetching company by id');
      // // // console.log('Request :', req);
      const { companyId } = req.params;
      // // console.log('Company id:', companyId);
      const company = await CompanyModel.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Entreprise non trouvée.' });
      }
      // // // console.log('Found company:', company);
      res.status(200).json(company);
    } catch (error) {
      console.error('Error retrieving company:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour modifier une entreprise
  exports.updateCompany = async (req, res) => {
    // // console.log('Modification de l’entreprise');
    // // console.log('Request :', req);
    // // console.log('Request body:', req.body);
    // // console.log('Request params:', req.params);
    try {
      // // console.log('Modification de l’entreprise');
      const { companyId } = req.params;
      const { names, normalized_name, abbreviation, industry, address, city, postalCode, country, phone, email, website, employees, documents, contractsAsCustomer, contractsAsContact, contractsAsExternalContributor, additionalFields } = req.body;
      // // console.log('Company id:', companyId);
      // Mise à jour de l'entreprise
      const updatedCompany = await CompanyModel.findByIdAndUpdate(new mongoose.Types.ObjectId(companyId), {
        names, normalized_name, abbreviation, industry, address, city, postalCode, country, phone, email, website, employees, documents, contractsAsCustomer, contractsAsContact, contractsAsExternalContributor, additionalFields
      }, { new: true });
      
      if (!updatedCompany) {
        return res.status(404).json({ message: 'Entreprise non trouvée.' });
      }
      
      // // console.log('Entreprise modifiée avec succès');
      res.status(200).json(updatedCompany);
    } catch (error) {
      console.error('Erreur lors de la modification de l’entreprise:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour supprimer une entreprise
  exports.deleteCompany = async (req, res) => {
    try {
      // // console.log('Suppression de l’entreprise');
      const { companyId } = req.params;
      
      const deletedCompany = await CompanyModel.findByIdAndDelete(companyId);
      
      if (!deletedCompany) {
        return res.status(404).json({ message: 'Entreprise non trouvée.' });
      }
      
      // // console.log('Entreprise supprimée avec succès');
      res.status(200).json({ message: 'Entreprise supprimée avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l’entreprise:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour ajouter une entreprise
  exports.addCompany = async (req, res) => {
    try {
      // // console.log('Ajout d’une nouvelle entreprise');
      const { names, normalized_name, abbreviation, industry, address, city, postalCode, country, phone, email, website, employees, documents, contractsAsCustomer, contractsAsContact, contractsAsExternalContributor, additionalFields } = req.body;
      let company = await CompanyModel.findOne({ normalized_name });
      if (company) {
        return res.status(400).json({ message: 'Une entreprise avec ce nom existe déjà.' });
      }
      const newCompany = new CompanyModel({
        names, normalized_name, abbreviation, industry, address, city, postalCode, country, phone, email, website, employees, documents, contractsAsCustomer, contractsAsContact, contractsAsExternalContributor, additionalFields
      });
      await newCompany.save();
      // // console.log('Nouvelle entreprise ajoutée');
      res.status(201).json({ message: 'Entreprise créée avec succès.', companyId: newCompany._id });
    } catch (error) {
      console.error('Erreur lors de l’ajout d’une nouvelle entreprise:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour obtenir uniquement la liste des noms des entreprises
  exports.getCompaniesNames = async (req, res) => {
    try {
      // // console.log('Fetching companies names');
      const companies = await CompanyModel.find().select('name');
      // // console.log(`Found ${companies.length} companies`);
      res.status(200).json(companies);
    } catch (error) {
      console.error('Error retrieving companies names:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour obtenir un contrat par son id
  exports.getContractById = async (req, res) => {
    try {
      // // console.log('Fetching contract by id');
      // // console.log('Request :', req);
      const { contractId } = req.params;
      // // console.log('Contract id:', contractId);
      const contract = await ContractModel.findById(contractId);
      if (!contract) {
        return res.status(404).json({ message: 'Contrat non trouvé.' });
      }
      // // // console.log('Found contract:', contract);
      res.status(200).json(contract);
    } catch (error) {
      console.error('Error retrieving contract:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  /// Contrats
  
  // Fonction pour obtenir la liste de tous les contrats
  exports.getContracts = async (req, res) => {
    try {
      // console.log('Récupération de tous les contrats');
      // Récupère tous les contrats, remplace les objectId contenus 
      // dans customer, contact, external_contributor et 
      // subcontractor par les user complets
      const contracts = await ContractModel.find()
      .populate('customer')
      .populate('contact')
      .populate('external_contributor')
      .populate('subcontractor');
      
      // supprime les mots de passe et le sel de chaque utilisateur
      contracts.forEach(contract => {
        if (contract.customer){
          if (contract.customer.password){
            contract.customer.password = undefined;
          }
          if (contract.customer.salt){
            contract.customer.salt = undefined;
          }
        }
        if (contract.contact){
          if (contract.contact.password){
            contract.contact.password = undefined;
          }
          if (contract.contact.salt){
            contract.contact.salt = undefined;
          }
        }
        if (contract.external_contributor){
          if (contract.external_contributor.password){
            contract.external_contributor.password = undefined;
          }
          if (contract.external_contributor.salt){
            contract.external_contributor.salt = undefined;
          }
        }
        if (contract.subcontractor){
          if (contract.subcontractor.password){
            contract.subcontractor.password = undefined;
          }
          if (contract.subcontractor.salt){
            contract.subcontractor.salt = undefined;
          }
        }
      });
      
      // console.log(`Found ${contracts.length} contracts`);
      res.json(contracts);
    } catch (error) {
      res.status(500).send({ message: "Erreur lors de la récupération des contrats", error });
      console.error('Erreur lors de la récupération des contrats:', error);
    }
  };
  
  // Fonction pour obtenir uniquement les contrats avec un statut "En cours"
  exports.getOngoingContracts = async (req, res) => {
    try {
      // console.log('Récupération des contrats en cours');
      const contracts = await ContractModel.find({ status: 'in_progress' })
      .populate('customer')
      .populate('contact')
      .populate('external_contributor')
      .populate('subcontractor');
      
      // supprime les mots de passe et le sel de chaque utilisateur
      // supprime les mots de passe et le sel de chaque utilisateur
      contracts.forEach(contract => {
        if (contract.customer){
          if (contract.customer.password){
            contract.customer.password = undefined;
          }
          if (contract.customer.salt){
            contract.customer.salt = undefined;
          }
        }
        if (contract.contact){
          if (contract.contact.password){
            contract.contact.password = undefined;
          }
          if (contract.contact.salt){
            contract.contact.salt = undefined;
          }
        }
        if (contract.external_contributor){
          if (contract.external_contributor.password){
            contract.external_contributor.password = undefined;
          }
          if (contract.external_contributor.salt){
            contract.external_contributor.salt = undefined;
          }
        }
        if (contract.subcontractor){
          if (contract.subcontractor.password){
            contract.subcontractor.password = undefined;
          }
          if (contract.subcontractor.salt){
            contract.subcontractor.salt = undefined;
          }
        }
      });
      // console.log(`Found ${contracts.length} ongoing contracts`);
      res.json(contracts);
    } catch (error) {
      res.status(500).send({ message: "Erreur lors de la récupération des contrats en cours", error });
      console.error('Erreur lors de la récupération des contrats en cours:', error);
    }
  };
  
  // Fonction pour obtenir tous les contrats qui n'ont pas le statut "En cours"
  exports.getNotOngoingContracts = async (req, res) => {
    try {
      // console.log('Récupération des contrats non en cours');
      const contracts = await ContractModel.find({ status: { $ne: 'in_progress' } })
      .populate('customer')
      .populate('contact')
      .populate('external_contributor')
      .populate('subcontractor');
      
      // supprime les mots de passe et le sel de chaque utilisateur
      contracts.forEach(contract => {
        if (contract.customer){
          if (contract.customer.password){
            contract.customer.password = undefined;
          }
          if (contract.customer.salt){
            contract.customer.salt = undefined;
          }
        }
        if (contract.contact){
          if (contract.contact.password){
            contract.contact.password = undefined;
          }
          if (contract.contact.salt){
            contract.contact.salt = undefined;
          }
        }
        if (contract.external_contributor){
          if (contract.external_contributor.password){
            contract.external_contributor.password = undefined;
          }
          if (contract.external_contributor.salt){
            contract.external_contributor.salt = undefined;
          }
        }
        if (contract.subcontractor){
          if (contract.subcontractor.password){
            contract.subcontractor.password = undefined;
          }
          if (contract.subcontractor.salt){
            contract.subcontractor.salt = undefined;
          }
        }
      });
      // console.log(`Found ${contracts.length} not ongoing contracts`);
      res.json(contracts);
    } catch (error) {
      res.status(500).send({ message: "Erreur lors de la récupération des contrats non en cours", error });
      console.error('Erreur lors de la récupération des contrats non en cours:', error);
    }
  };
  
  // Streaming de contrats "En cours"
  exports.streamOnGoingContracts = (req, res) => {
    // Initialiser le flux de données
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    
    // Récupérer les paramètres ou utiliser les valeurs par défaut
    const period = parseInt(req.query.period) || 2; // Nombre d'années
    const filter_trash = req.query.filter_trash !== 'false'; // Convertit en boolean, true par défaut
    
    // Construire le filtre de base
    let filter = {
      status: 'in_progress',
      date_cde: {
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - period))
      }
    };
    
    // Si filter_trash est vrai, ajouter la condition pour filtrer les trash à false
    if (filter_trash) {
      filter.trash = false;
    }
    
    const cursor = ContractModel.find(filter)
    .populate('customer')
    .populate('contact')
    .populate('external_contributor')
    .populate('subcontractor')
    .cursor();
    
    cursor.eachAsync((contract) => {
      // Supprimer les informations sensibles
      sanitizeContract(contract);
      // Envoyer le contrat au client
      res.write(`data: ${JSON.stringify(contract)}\n\n`);
    })
    .then(() => {
      res.end(); // Fin du flux de données
    })
    .catch(err => {
      console.error('Erreur lors du streaming des contrats en cours:', err);
      res.status(500).end();
    });
  };
  
  // Streaming de contrats non "En cours"
  exports.streamNotOnGoingContracts = (req, res) => {
    // Initialiser le flux de données
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
  
    const cursor = ContractModel.find({ status: { $ne: 'in_progress' } })
    .populate('customer')
    .populate('contact')
    .populate('external_contributor')
    .populate('subcontractor')
    .cursor();
  
    cursor.eachAsync((contract) => {
      // Supprimer les informations sensibles
      sanitizeContract(contract);
      // Envoyer le contrat au client
      res.write(`data: ${JSON.stringify(contract)}\n\n`);
    })
    .then(() => {
      res.end(); // Fin du flux de données
    })
    .catch(err => {
      console.error('Erreur lors du streaming des contrats non en cours:', err);
      res.status(500).end();
    });
  };
  
  
  
  function sanitizeContract(contract) {
    ['customer', 'contact', 'external_contributor', 'subcontractor'].forEach(role => {
      if (contract[role]) {
        delete contract[role].password;
        delete contract[role].salt;
      }
    });
  };
  
  exports.streamOrdersByTag = (req, res) => {
    const { status, incident = false } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    if (incident) {
      query.incident = { $exists: true, $not: {$size: 0} };
    }
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    
    const sortOrder = status === 'in_progress' ? 'asc' : 'desc';
    
    Contract.find(query)
    .sort({ 'internal_number': 1, 'dateAdd': sortOrder })
    .populate('customer contact external_contributor subcontractor')
    .then(contracts => {
      // Grouper les contrats par internal_number en mémoire. Note: ceci est une simplification.
      const groupedContracts = groupByInternalNumber(contracts);
      for (const group of groupedContracts) {
        // Assurez-vous d'implémenter sanitizeContract pour nettoyer chaque contrat
        // Ici, group pourrait être un tableau de contrats ayant le même internal_number
        group.forEach(contract => sanitizeContract(contract));
        // Envoyer chaque groupe de contrats au client
        res.write(`data: ${JSON.stringify(group)}\n\n`);
      }
      res.end(); // Fin du flux de données
    })
    .catch(err => {
      console.error('Erreur lors du streaming des contrats:', err);
      res.status(500).end();
    });
  };
  
  function groupByInternalNumber(contracts) {
    const groupedContracts = [];
    let currentInternalNumber = null;
    let currentGroup = [];
    for (const contract of contracts) {
      if (contract.internal_number !== currentInternalNumber) {
        if (currentGroup.length > 0) {
          groupedContracts.push(currentGroup);
        }
        currentGroup = [];
        currentInternalNumber = contract.internal_number;
      }
      currentGroup.push(contract);
    }
    if (currentGroup.length > 0) {
      groupedContracts.push(currentGroup);
    }
    return groupedContracts;
  };
  
  // Fonction pour ajouter un nouveau contrat
  exports.addContract = async (req, res) => {
    try {
      // Extraction des champs nécessaires du corps de la requête
      const {
        internal_number,
        customer,
        contact,
        internal_contributor,
        external_contributor,
        external_contributor_amount,
        subcontractor,
        subcontractor_amount,
        address,
        appartment_number,
        quote_number,
        mail_sended,
        invoice_number,
        amount_ht,
        benefit_ht,
        execution_data_day,
        execution_data_hour,
        prevision_data_day,
        prevision_data_hour,
        benefit,
        status,
        occupied,
        start_date_works,
        end_date_works,
        end_date_customer,
        trash,
        date_cde,
        billing_amount
      } = req.body;
      
      
      
      // Création d'un nouveau contrat avec les champs adaptés
      const newContract = new ContractModel({
        internal_number,
        customer,
        contact,
        internal_contributor,
        external_contributor,
        external_contributor_amount,
        subcontractor,
        subcontractor_amount,
        address,
        appartment_number,
        quote_number,
        mail_sended,
        invoice_number,
        amount_ht,
        benefit_ht,
        execution_data_day,
        execution_data_hour,
        prevision_data_day,
        prevision_data_hour,
        benefit,
        status,
        occupied,
        start_date_works,
        end_date_works,
        end_date_customer,
        trash,
        date_cde,
        billing_amount
      });
      
      
      // Enregistrement du nouveau contrat dans la base de données
      await newContract.save();
      
      // Réponse indiquant la réussite de l'ajout du contrat
      res.status(201).json({ message: 'Contrat créé avec succès.', contractId: newContract._id });
    } catch (error) {
      console.error('Erreur lors de l’ajout d’un nouveau contrat:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction pour modifier un contrat
  exports.updateContract = async (req, res) => {
    // console.log('Modification du contrat');
    // console.log('Request :', req);
    // console.log('Request body:', req.body);
    // console.log('Request params:', req.params);
    try {
      // console.log('Modification du contrat');
      const { contractId } = req.params;
      const {
        internal_number,
        customer,
        contact,
        external_contributor,
        external_contributor_amount,
        subcontractor,
        subcontractor_amount,
        address,
        appartment_number,
        quote_number,
        mail_sended,
        invoice_number,
        amount_ht,
        benefit_ht,
        execution_data_day,
        execution_data_hour,
        prevision_data_day,
        prevision_data_hour,
        benefit,
        status,
        occupied,
        start_date_works,
        end_date_works,
        end_date_customer,
        trash,
        date_cde,
        billing_amount
      } = req.body;
      
      // Mise à jour du contrat
      const updatedContract = await ContractModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(contractId),
        {
          internal_number,
          customer,
          contact,
          external_contributor,
          external_contributor_amount,
          subcontractor,
          subcontractor_amount,
          address,
          appartment_number,
          quote_number,
          mail_sended,
          invoice_number,
          amount_ht,
          benefit_ht,
          execution_data_day,
          execution_data_hour,
          prevision_data_day,
          prevision_data_hour,
          benefit,
          status,
          occupied,
          start_date_works,
          end_date_works,
          end_date_customer,
          trash,
          date_cde,
          billing_amount
        },
        { new: true }
        );
        
        
        if (!updatedContract) {
          return res.status(404).json({ message: 'Contrat non trouvé.' });
        }
        
        // console.log('Contrat modifié avec succès');
        res.status(200).json(updatedContract);
      } catch (error) {
        console.error('Erreur lors de la modification du contrat:', error);
        res.status(500).json({ error: error.message });
      }
      
    };
    
    // Fonction pour renvoyer la liste des internal_number des contrats dont date_cde concernae l'année en cours
    exports.getContractsInternalNumbers = async (req, res) => {
      try {
        console.log('Récupération des numéros internes des contrats pour l\'année ', new Date().getFullYear());
        const contracts = await ContractModel.find({ date_cde: { $gte: new Date(new Date().getFullYear(), 0, 1), $lt: new Date(new Date().getFullYear() + 1, 0, 1) } });
        console.log(`Found ${contracts.length} contracts`);
        // const contracts = await ContractModel.find().select('internal_number');
        // extrait seulement les numéros internes des contrats et en fait une liste
        const internalNumbers = contracts.map(contract => contract.internal_number);
        // console.log(`Found ${contracts.length} contracts`);
        // res.status(200).json(contracts);
        res.status(200).json(internalNumbers);
      } catch (error) {
        console.error('Erreur lors de la récupération des numéros internes des contrats:', error);
        res.status(500).json({ error: error.message });
      }
    };
    
    // Fonction pour ajouter une observation à un contrat
    exports.addObservation = async (req, res) => {
      console.log('Tentative d\'ajout d\'une observation à un contrat');
      try {
        const { contractId, dateAdd, user, comment } = req.body;
        const userObjectId = new mongoose.Types.ObjectId(user);
        
        // Trouver le contrat et ajouter l'observation directement
        const updatedContract = await ContractModel.findByIdAndUpdate(
          contractId,
          {
            $push: {
              observation: { 
                dateAdd: dateAdd, 
                user: userObjectId, 
                comment: comment,
                _id: new mongoose.Types.ObjectId() // Crée un nouvel ObjectId pour l'observation
              }
            }
          },
          { new: true, useFindAndModify: false }
          );
          
          if (!updatedContract) {
            console.log('Contrat non trouvé.');
            return res.status(404).json({ message: 'Contrat non trouvé.' });
          }
          
          console.log('Observation ajoutée avec succès.');
          res.status(200).json(updatedContract);
        } catch (error) {
          console.error('Erreur lors de l\'ajout de l\'observation:', error);
          res.status(500).json({ error: error.message });
        }
      };
      
      
      
      // Fonction pour supprimer une observation d'un contrat
      exports.deleteObservation = async (req, res) => {
        try {
          const observationId = req.params.observationId; // L'ID de l'observation est obtenu de l'URL
          console.log('Suppression de l\'observation avec l\'ID:', observationId);
          // conversion de l'ID en ObjectId
          const observationObjectId = new mongoose.Types.ObjectId(observationId);
          
          // Trouver le contrat qui contient l'observation et la retirer
          const updatedContract = await ContractModel.findOneAndUpdate(
            { 'observation._id': observationObjectId },
            { $pull: { observation: { _id: observationObjectId } } },
            { new: true }
            );
            
            if (!updatedContract) {
              return res.status(404).json({ message: 'Observation non trouvée.' });
            }
            
            res.status(200).json({ message: 'Observation supprimée avec succès.', contract: updatedContract });
          } catch (error) {
            console.error('Erreur lors de la suppression de l\'observation:', error);
            res.status(500).json({ error: error.message });
          }
        };
        
        
        // Fonction pour retourner toutes les observations d'un contrat
        exports.getObservations = async (req, res) => {
          try {
            const { contractId } = req.params;
            const contract = await ContractModel.findById(contractId)
            .populate({
              path: 'observation.user',
              select: 'firstname lastname'
            })
            .select('observation');
            console.log('Récupération des observations d\'un contrat');
            if (!contract) {
              return res.status(404).json({ message: 'Contrat non trouvé.' });
            }
            
            const observationsWithUserDetails = await Promise.all(
              contract.observation.map(async (obs) => {
                const user = await User.findById(obs.user).select('firstname lastname');
                return { ...obs, user: user ? { firstname: user.firstname, lastname: user.lastname } : null };
              })
              );
              
              console.log("Observation: ", observationsWithUserDetails);
              res.status(200).json(observationsWithUserDetails);
            } catch (error) {
              console.error('Erreur lors de la récupération des observations d\'un contrat:', error);
              res.status(500).json({ error: error.message });
            }
          };
          
          
          
          // Fonction pour ajouter un incident à un contrat
          exports.addIncident = async (req, res) => {
            console.log('Tentative d\'ajout d\'un incident à un contrat');
            console.log('Corps de la requête:', req.body);
            try {
              const { contractId, dateAdd, user, comment } = req.body;
              const userObjectId = new mongoose.Types.ObjectId(user);
              
              // Trouver le contrat par son ID et ajouter le nouvel incident directement
              const updatedContract = await ContractModel.findByIdAndUpdate(
                contractId,
                { $push: 
                  { incident: 
                    { 
                      comment: comment, 
                      dateAdd: dateAdd, 
                      user: userObjectId,
                      _id: new mongoose.Types.ObjectId() // Crée un nouvel ObjectId pour l'incident
                    } 
                  } 
                },
                { new: true }
                );
                
                if (!updatedContract) {
                  console.log('Contrat non trouvé.');
                  return res.status(404).json({ message: 'Contrat non trouvé.' });
                }
                
                console.log('Incident ajouté avec succès.');
                res.status(200).json(updatedContract);
              } catch (error) {
                console.error('Erreur lors de l\'ajout de l\'incident:', error);
                res.status(500).json({ error: error.message });
              }
            };
            
            // Fonction pour supprimer un incident d'un contrat
            exports.deleteIncident = async (req, res) => {
              try {
                const incidentId = req.params.incidentId; // L'ID de l'incident est obtenu de l'URL
                console.log('Suppression de l\'incident avec l\'ID:', incidentId);
                // conversion de l'ID en ObjectId
                const incidentObjectId = new mongoose.Types.ObjectId(incidentId);
                
                // Trouver le contrat qui contient l'incident et le retirer
                const updatedContract = await ContractModel.findOneAndUpdate(
                  { 'incident._id': incidentObjectId },
                  { $pull: { incident: { _id: incidentObjectId } } },
                  { new: true }
                  );
                  
                  if (!updatedContract) {
                    return res.status(404).json({ message: 'Incident non trouvé.' });
                  }
                  
                  res.status(200).json({ message: 'Incident supprimé avec succès.', contract: updatedContract });
                } catch (error) {
                  console.error('Erreur lors de la suppression de l\'incident:', error);
                  res.status(500).json({ error: error.message });
                }
              };
              
              
              // Fonction pour récupérer tous les incidents d'un contrat
              exports.getIncidents = async (req, res) => {
                console.log('Tentative de récupération des incidents d\'un contrat');
                try {
                  const { contractId } = req.params;
                  
                  // Récupération du contrat avec ses incidents
                  const contract = await ContractModel.findById(contractId)
                  .select('incident');
                  
                  if (!contract) {
                    console.log('Contrat non trouvé.');
                    return res.status(404).json({ message: 'Contrat non trouvé.' });
                  }
                  
                  const incidentsWithUserDetails = await Promise.all(
                    contract.incident.map(async (incident) => {
                      const user = await User.findById(incident.user).select('firstname lastname');
                      return { ...incident, user: user ? { firstname: user.firstname, lastname: user.lastname } : null };
                    })
                    );
                    
                    console.log('Incidents récupérés avec succès.');
                    // res.status(200).json(contract.incident);
                    res.status(200).json(incidentsWithUserDetails);
                  } catch (error) {
                    console.error('Erreur lors de la récupération des incidents:', error);
                    res.status(500).json({ error: error.message });
                  }
                };
                
                
                
                
                // Fonction pour renvoyer la liste des abbréviations des entreprises
                exports.getCompaniesAbbreviations = async (req, res) => {
                  try {
                    console.log('Récupération des abbréviations des entreprises');
                    const companies = await CompanyModel.find().select('abbreviation');
                    const abbreviations = companies.map(company => company.abbreviation);
                    console.log(`Found ${companies.length} companies`);
                    res.status(200).json(abbreviations);
                  } catch (error) {
                    console.error('Erreur lors de la récupération des abbréviations des entreprises:', error);
                    res.status(500).json({ error: error.message });
                  }
                };
                
                // Fonction pour uploader des fichiers
                exports.uploadFiles = async (req, res) => {
                  console.log("Tentative de téléversement de fichiers");
                  console.log("Corps de la requête:", req.body);
                  console.log("contractId", req.body.contractId);
                  console.log("Fichiers:", req.files);
                  
                  if (!req.files || req.files.length === 0) {
                    return res.status(400).send("Aucun fichier n'a été téléversé.");
                  }
                  
                  // Convertir contractId en ObjectId pour garantir la compatibilité avec MongoDB
                  const contractId = req.body.contractId;
                  
                  // Préparer les chemins des fichiers pour être enregistrés dans la base de données
                  const filesPaths = req.files.map((file) => ({
                    path: file.path,
                    name: file.originalname,
                    size: file.size,
                  }));
                  
                  try {
                    const contract = await ContractModel.findByIdAndUpdate(
                      contractId,
                      { $push: { file: { $each: filesPaths } } }, // Assurez-vous que 'files' correspond au champ dans votre modèle
                      { new: true, useFindAndModify: false }
                      );
                      
                      if (!contract) {
                        console.log("Contrat non trouvé. id: " + contractId);
                        return res.status(404).send("Contrat non trouvé. id: " + contractId);
                      }
                      
                      console.log("Fichiers téléversés et enregistrés avec succès.");
                      res.status(200).send({
                        message: "Fichiers téléversés et enregistrés avec succès.",
                        files: contract.file,
                      });
                    } catch (error) {
                      console.error("Erreur lors de l'enregistrement des fichiers:", error);
                      res.status(500).send(error);
                    }
                  };
                  
                  // Fonction pour envoyer un fichier au client
                  exports.downloadFile = async (req, res) => {
                    try {
                      const { contractId, fileId } = req.query;
                      
                      if (!mongoose.Types.ObjectId.isValid(contractId)) {
                        return res.status(400).send('ID de contrat invalide.');
                      }
                      
                      if (!mongoose.Types.ObjectId.isValid(fileId)) {
                        return res.status(400).send('ID de fichier invalide.');
                      }
                      
                      const contract = await ContractModel.findById(contractId, 'file');
                      if (!contract) {
                        return res.status(404).send('Contrat non trouvé.');
                      }
                      
                      const file = contract.file.id(fileId);
                      if (!file) {
                        return res.status(404).send('Fichier non trouvé.');
                      }
                      
                      // Vérification de l'existence du fichier dans le système de fichiers
                      fs.access(file.path, fs.constants.R_OK, (err) => {
                        if (err) {
                          console.error('Le fichier n\'est pas accessible:', err);
                          return res.status(404).send('Fichier non trouvé sur le serveur.');
                        }
                        // Envoi du fichier au client
                        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
                        res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
                        res.setHeader('cache', 'no-cache'); // Proxies.
                        res.setHeader('Expires', '0'); // Proxies.
                        
                        res.download(file.path, file.name, (downloadErr) => {
                          if (downloadErr) {
                            console.error('Erreur lors de l\'envoi du fichier:', downloadErr);
                            // Si l'erreur est autre que l'annulation du téléchargement par l'utilisateur
                            if (downloadErr.code !== 'ECONNABORTED' && downloadErr.code !== 'ECONNRESET') {
                              res.status(500).send('Erreur lors du téléchargement du fichier.');
                            }
                          }
                        });
                      });
                    } catch (error) {
                      console.error('Erreur lors de la tentative de téléchargement du fichier:', error);
                      res.status(500).send(error);
                    }
                  };
                  
                  // Fonction pour supprimer un fichier d'un contrat
                  exports.deleteFile = async (req, res) => {
                    try {
                      const { contractId, fileId } = req.query;
                      console.log('Suppression du fichier avec l\'ID:', fileId);
                      console.log('Contrat ID:', contractId);
                      // Vérification de la validité des IDs
                      if (!mongoose.Types.ObjectId.isValid(contractId)) {
                        return res.status(400).send('ID de contrat invalide.');
                      }
                      if (!mongoose.Types.ObjectId.isValid(fileId)) {
                        return res.status(400).send('ID de fichier invalide.');
                      }
                      // Supprime le fichier du système de fichiers
                      const contract = await ContractModel.findById(contractId, 'file');
                      if (!contract) {
                        return res.status(404).send('Contrat non trouvé.');
                      }
                      const file = contract.file.id(fileId);
                      if (!file) {
                        return res.status(404).send('Fichier non trouvé.');
                      }
                      fs.unlink(file.path, async (err) => {
                        if (err) {
                          console.error('Erreur lors de la suppression du fichier:', err);
                          return res.status(500).send('Erreur lors de la suppression du fichier.');
                        }
                        // Trouver le contrat qui contient le fichier et le retirer
                        const updatedContract = await ContractModel.findByIdAndUpdate(
                          contractId,
                          { $pull: { file: { _id: fileId } } },
                          { new: true }
                          );
                          if (!updatedContract) {
                            return res.status(404).send('Fichier non trouvé.');
                          }
                          res.status(200).send({ message: 'Fichier supprimé avec succès.', contract: updatedContract });
                        });
                        
                      } catch (error) {
                        console.error('Erreur lors de la suppression du fichier:', error);
                        res.status(500).json({ error: error.message });
                      }
                    };
                    
                    // Fonction pour avoir le nom d'une prestation par son _id
                    exports.getBenefitNameById = async (req, res) => {
                      try {
                        // console.log('Fetching service name by id');
                        // console.log('Request :', req);
                        const { benefitId } = req.params;
                        // console.log('Service id:', benefitId);
                        const service = await benefit.findById(benefitId);
                        if (!service) {
                          return res.status(404).json({ message: 'Service non trouvé.' });
                        }
                        console.log('Found service:', service);
                        res.status(200).json(service.name);
                      } catch (error) {
                        console.error('Error retrieving service name:', error);
                        res.status(500).json({ error: error.message });
                      }
                    };
                    
                    // Fonction pour obtenir la liste de tous les services
                    exports.getBenefits = async (req, res) => {
                      try {
                        // console.log('Récupération de tous les services');
                        const services = await benefit.find();
                        // console.log(`Found ${services.length} services`);
                        res.json(services);
                      } catch (error) {
                        res.status(500).send({ message: "Erreur lors de la récupération des services", error });
                        console.error('Erreur lors de la récupération des services:', error);
                      }
                    };
                    
                    // Fonction pour ajouter un nouveau service
                    exports.addBenefit = async (req, res) => {
                      try {
                        // console.log('Ajout d’un nouveau service');
                        const { name } = req.body;
                        // normalisation du nom pour éviter les doublons : première lettre en majuscule, le reste en minuscule
                        const normalized_name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                        let service = await benefit.findOne({ normalized_name });
                        if (service) {
                          return res.status(400).json({ message: 'Un service avec ce nom existe déjà.' });
                        }
                        const newService = new benefit({
                          normalized_name
                        });
                        await newService.save();
                        // console.log('Nouveau service ajouté');
                        res.status(201).json({ message: 'Service créé avec succès.', benefitId: newService._id });
                      } catch (error) {
                        console.error('Erreur lors de l’ajout d’un nouveau service:', error);
                        res.status(500).json({ error: error.message });
                      }
                    };
                    
                    // Fonction pour supprimer un service par son id
                    exports.deleteBenefit = async (req, res) => {
                      try {
                        // console.log('Suppression du service');
                        const { benefitId } = req.params;
                        const deletedService = await benefit.findByIdAndDelete(benefitId);
                        if (!deletedService) {
                          return res.status(404).json({ message: 'Service non trouvé.' });
                        }
                        // console.log('Service supprimé avec succès');
                        res.status(200).json({ message: 'Service supprimé avec succès.' });
                      } catch (error) {
                        console.error('Erreur lors de la suppression du service:', error);
                        res.status(500).json({ error: error.message });
                      }
                    };
