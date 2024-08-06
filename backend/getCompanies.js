const mongoose = require('mongoose');
const fs = require('fs');

// Schéma et modèle de l'utilisateur
const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  active: Boolean,
  phone: String,
  company: String,
  role: String,
  authorized_connection: Boolean,
  access_token: String,
  salt: String,
  customer: mongoose.Schema.Types.ObjectId,
  bgcolor: String,
  dateUpd: Date,
  dateAdd: Date,
  resetCode: String,
  resetCodeExpiry: Date
});

const User = mongoose.model('User', userSchema);

// Schéma et modèle de l'entreprise
const companySchema = new mongoose.Schema({
  names: [String],
  normalized_name: String,
  abbreviation: String,
  address: String,
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  industry: [String],
  websites: [String],
  phone: [String],
  email: [String],
  additionalFields: mongoose.Schema.Types.Mixed,
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  contractsAsCustomer: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  }],
  contractsAsContact: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  }],
  contractsAsExternalContributor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  }]
});

const Company = mongoose.model('Company', companySchema);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/mongodb_sogapeint', { useNewUrlParser: true, useUnifiedTopology: true });

// Fonction pour extraire les emails des utilisateurs
async function extractUserEmails() {
  const users = await User.find({}, { email: 1, _id: 0 });
  const emails = users.map(user => user.email);
  fs.writeFileSync('user_emails.txt', emails.join('\n'));
}

// Fonction pour extraire les noms normalisés des entreprises
async function extractCompanyNames() {
  const companies = await Company.find({}, { normalized_name: 1, _id: 0 });
  const companyNames = companies.map(company => company.normalized_name);
  fs.writeFileSync('company_names.txt', companyNames.join('\n'));
}

// Fonction principale
async function main() {
  await extractUserEmails();
  await extractCompanyNames();
  mongoose.connection.close();
}

main().catch(err => console.error(err));
