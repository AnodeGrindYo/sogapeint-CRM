const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const {
    sendEmail
} = require('../services/emailService');
const mongoose = require('mongoose');
const {
    isEmail
} = require('validator');

exports.login = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;
        if (!isEmail(email)) {
            return res.status(400).json({
                message: 'Adresse email invalide.'
            });
        }

        const user = await User.findOne({
            email,
            active: true,
            authorized_connection: true
        });

        if (!user) {
            return res.status(401).json({
                message: 'Utilisateur non trouvé ou non autorisé.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Mauvais mot de passe.'
            });
        }

        const tokenPayload = {
            userId: user._id,
            role: user.role,
            email: user.email,
            firstName: user.firstname,
            lastName: user.lastname,
            phone: user.phone,
            company: user.company
        };

        const expiresIn = req.body.rememberMe ? '7d' : '1h';

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: expiresIn
        });

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
        res.status(500).json({
            error: error.message
        });
    }
};

exports.resetPasswordFromAdmin = async (req, res) => {
    try {
        const {
            userId
        } = req.body;
        const newPassword = Math.random().toString(36).slice(-10);

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(userId), {
                password: hashedPassword
            }, {
                new: true
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé.'
            });
        }

        const formatFirstName = updatedUser.firstname.charAt(0).toUpperCase() + updatedUser.firstname.slice(1).toLowerCase();

        const formatLastName = updatedUser.lastname.toUpperCase();

        await sendEmail(updatedUser.email, 'Réinitialisation du mot de passe', {
                password: newPassword,
                CRM_URL: process.env.CRM_URL,
                firstname: formatFirstName,
                lastname: formatLastName
            },
            "passwordResetFromAdminTemplate"
        );

        res.status(200).json({
            message: 'Mot de passe réinitialisé avec succès et e-mail envoyé.'
        });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        res.status(500).json({
            error: error.message
        });
    }
};

exports.forgotPassword = async (req, res) => {

    try {
        const {
            email
        } = req.body;

        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(404).json({
                message: "Aucun utilisateur trouvé avec cet e-mail."
            });
        }

        const resetCode = crypto.randomBytes(4).toString('hex');
        const resetCodeExpiry = new Date(Date.now() + 3600000);

        await User.findByIdAndUpdate(user._id, {
            resetCode,
            resetCodeExpiry
        });

        const formatFirstName = user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1).toLowerCase();

        const formatLastName = user.lastname.toUpperCase();

        await sendEmail(user.email, 'Code de réinitialisation du mot de passe', {
                resetCode: resetCode,
                firstname: formatFirstName,
                lastname: formatLastName
            },
            'passwordResetCodeTemplate'
        );

        res.status(200).json({
            message: "Un e-mail avec un code de réinitialisation a été envoyé."
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.verifyResetCode = async (req, res) => {

    try {
        const {
            email,
            code
        } = req.body;

        const user = await User.findOne({
            email,
            resetCode: code,
            resetCodeExpiry: {
                $gt: Date.now()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Code de réinitialisation invalide ou expiré."
            });
        }

        res.status(200).json({
            message: "Le code de réinitialisation est valide.",
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {

    try {
        const {
            email,
            code,
            newPassword
        } = req.body;

        const user = await User.findOne({
            email,
            resetCode: code,
            resetCodeExpiry: {
                $gt: Date.now()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Code de réinitialisation invalide ou expiré."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetCode: null,
            resetCodeExpiry: null
        });

        res.status(200).json({
            message: "Mot de passe réinitialisé avec succès."
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};