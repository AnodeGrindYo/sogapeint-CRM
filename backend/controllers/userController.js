const User = require('../models/User');
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().lean(); // Utilisation de lean() pour obtenir des objets bruts

        users.forEach(user => {
            // Supprimer explicitement les champs sensibles
            delete user.password;
            delete user.resetCode;
            delete user.resetCodeExpiry;
            delete user.salt;
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.addUser = async (req, res) => {
    try {
        let {
            email,
            password,
            firstname,
            lastname,
            phone,
            company,
            role,
            active,
            authorized_connection
        } = req.body;

        // Si aucun email n'est fourni, on en génère un par défaut
        if (!email) {
            email = `${firstname.toLowerCase()}.${lastname.toLowerCase()}@example.com`;
        }

        // Vérification de l'email uniquement si l'email n'est pas généré automatiquement
        if (email && !isEmail(email)) {
            return res.status(400).json({ message: 'Adresse email invalide.' });
        }

        // Vérification de l'existence de l'utilisateur par email uniquement si un email est fourni
        if (email) {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'Un utilisateur avec cette adresse email existe déjà.' });
            }
        }

        // Vérification de l'existence de l'utilisateur par prénom et nom
        let user = await User.findOne({
            firstname: { $regex: new RegExp(`^${firstname}$`, 'i') },
            lastname: { $regex: new RegExp(`^${lastname}$`, 'i') }
        });
        if (user) {
            return res.status(400).json({ message: 'Un utilisateur avec ce nom et prénom existe déjà.' });
        }

        // Génération d'un mot de passe par défaut si aucun n'est fourni
        if (!password) {
            password = 'defaultPassword123';  // Vous pouvez améliorer cette partie en générant un mot de passe plus sécurisé
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
            authorized_connection
        });
        await newUser.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès.', userId: newUser._id });
    } catch (error) {
        console.error('Error adding new user:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).lean(); // Utilisation de lean() pour obtenir un objet brut
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Supprimer explicitement les champs sensibles
        delete user.password;
        delete user.resetCode;
        delete user.resetCodeExpiry;
        delete user.salt;

        res.status(200).json(user);
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ error: error.message });
    }
};


// exports.updateUser = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const {
//             email,
//             firstname,
//             lastname,
//             phone,
//             company,
//             role,
//             active,
//             authorized_connection
//         } = req.body;

//         const updatedUser = await User.findByIdAndUpdate(
//             new mongoose.Types.ObjectId(userId),
//             {
//                 email,
//                 firstname,
//                 lastname,
//                 phone,
//                 company,
//                 role,
//                 active,
//                 authorized_connection
//             },
//             { new: true }
//         );

//         if (!updatedUser) {
//             return res.status(404).json({ message: 'Utilisateur non trouvé.' });
//         }

//         res.status(200).json(updatedUser);
//     } catch (error) {
//         console.error('Erreur lors de la modification de l’utilisateur:', error);
//         res.status(500).json({ error: error.message });
//     }
// };
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            email,
            firstname,
            lastname,
            phone,
            company,
            role,
            active,
            authorized_connection
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(userId),
            {
                email,
                firstname,
                lastname,
                phone,
                company,
                role,
                active,
                authorized_connection
            },
            { new: true }
        ).lean(); // Utilisation de lean() pour obtenir un objet brut

        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Supprimer explicitement les champs sensibles
        delete updatedUser.password;
        delete updatedUser.resetCode;
        delete updatedUser.resetCodeExpiry;
        delete updatedUser.salt;

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Erreur lors de la modification de l’utilisateur:', error);
        res.status(500).json({ error: error.message });
    }
};



exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l’utilisateur:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.searchUsers = async (req, res) => {
    try {
        const query = req.query.q;

        const users = await User.find({
            $or: [
                { firstname: { $regex: query, $options: 'i' } },
                { lastname: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).lean(); // Utilisation de lean() pour obtenir des objets bruts

        users.forEach(user => {
            // Supprimer explicitement les champs sensibles
            delete user.password;
            delete user.resetCode;
            delete user.resetCodeExpiry;
            delete user.salt;
        });

        res.json(users);
    } catch (error) {
        console.error('Erreur lors de la recherche des utilisateurs:', error);
        res.status(500).send({ message: "Erreur lors de la recherche des utilisateurs", error });
    }
};

