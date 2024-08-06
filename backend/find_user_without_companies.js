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

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/mongodb_sogapeint', { useNewUrlParser: true, useUnifiedTopology: true });

// Fonction pour extraire les utilisateurs sans entreprise renseignée
async function findUsersWithoutCompany() {
  const users = await User.find({ company: { $exists: false } }, { email: 1, _id: 0 });
  const usersWithoutCompany = users.map(user => user.email);
  fs.writeFileSync('users_without_company.txt', usersWithoutCompany.join('\n'));
}

// Fonction principale
async function main() {
  await findUsersWithoutCompany();
  mongoose.connection.close();
}

main().catch(err => console.error(err));
