const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = require('./models/User');

async function updatePassword() {
    const userId = '5ee9c26668f2b9a83eba9446';
    const newPassword = 'test1234';

    try {
        await mongoose.connect('mongodb://localhost:27017/mongodb_sogapeint', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const user = await userSchema.findByIdAndUpdate(
            userId,
            { password: hashedPassword, salt: salt },
            { new: true }
        );

        if (user) {
            console.log(`Le mot de passe de l'utilisateur ${user.email} a été mis à jour avec succès.`);
        } else {
            console.log('Utilisateur non trouvé.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
    }
}

updatePassword();
