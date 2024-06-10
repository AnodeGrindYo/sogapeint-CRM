const User = require('../models/User');
const mongoose = require('mongoose');
const {
    isEmail
} = require('validator');

exports.getAllUsers = async (req, res) => {
    try {

        const users = await User.find();

        users.forEach(user => {
            user.password = undefined;

            user.resetCode = undefined;
            user.resetCodeExpiry = undefined;

            user.salt = undefined;
        })

        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.addUser = async (req, res) => {
    try {

        const {
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
        if (!isEmail(email)) {
            return res.status(400).json({
                message: 'Adresse email invalide.'
            });
        }
        let user = await User.findOne({
            email
        });
        if (user) {
            return res.status(400).json({
                message: 'Un utilisateur avec cette adresse email existe déjà.'
            });
        }

        user = await User.findOne({
            firstname: {
                $regex: new RegExp(`^${firstname}$`, 'i')
            },
            lastname: {
                $regex: new RegExp(`^${lastname}$`, 'i')
            }
        });
        if (user) {
            return res.status(400).json({
                message: 'Un utilisateur avec ce nom et prénom existe déjà.'
            });
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

        res.status(201).json({
            message: 'Utilisateur créé avec succès.',
            userId: newUser._id
        });
    } catch (error) {
        console.error('Error adding new user:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getUserById = async (req, res) => {
    try {

        const {
            userId
        } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé.'
            });
        }

        user.password = undefined;

        user.resetCode = undefined;
        user.resetCodeExpiry = undefined;

        user.salt = undefined;
        res.status(200).json(user);
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.updateUser = async (req, res) => {

    try {

        const {
            userId
        } = req.params;
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

        const updatedUser = await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {
            email,
            firstname,
            lastname,
            phone,
            company,
            role,
            active,
            authorized_connection
        }, {
            new: true
        });

        if (!updatedUser) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé.'
            });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Erreur lors de la modification de l’utilisateur:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {

        const {
            userId
        } = req.params;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé.'
            });
        }

        res.status(200).json({
            message: 'Utilisateur supprimé avec succès.'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l’utilisateur:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.searchUsers = async (req, res) => {

    try {

        const query = req.query.q;

        const users = await User.find({
            $or: [{
                    firstname: {
                        $regex: query,
                        $options: 'i'
                    }
                },
                {
                    lastname: {
                        $regex: query,
                        $options: 'i'
                    }
                },
                {
                    email: {
                        $regex: query,
                        $options: 'i'
                    }
                }
            ]
        });

        res.json(users);
    } catch (error) {
        res.status(500).send({
            message: "Erreur lors de la recherche des utilisateurs",
            error
        });
    }
};