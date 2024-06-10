const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const mongoose = require('mongoose');

const userService = {
    findUserByEmail: async (email) => {
        return await User.findOne({ email, active: true, authorized_connection: true });
    },
    
    comparePassword: async (inputPassword, userPassword) => {
        return await bcrypt.compare(inputPassword, userPassword);
    },
    
    generateTokenPayload: (user) => {
        return { 
            userId: user._id, 
            role: user.role, 
            email: user.email,
            firstName: user.firstname,
            lastName: user.lastname,
            phone: user.phone,
            company: user.company
        };
    },
    
    hashPassword: async (password) => {
        return await bcrypt.hash(password, 10);
    },
    
    updateUserPassword: async (userId, hashedPassword) => {
        return await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(userId),
            { password: hashedPassword },
            { new: true }
        );
    },
    
    sendPasswordResetEmail: async (user, newPassword) => {
        const formatFirstName = user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
        const formatLastName = user.lastname.toUpperCase();
        await sendEmail(user.email, 'Réinitialisation du mot de passe', {
            password: newPassword,
            CRM_URL: process.env.CRM_URL,
            firstname: formatFirstName,
            lastname: formatLastName
        }, "passwordResetFromAdminTemplate");
    },
    
    generateResetCode: () => {
        return crypto.randomBytes(4).toString('hex');
    },
    
    updateUserResetCode: async (userId, resetCode, resetCodeExpiry) => {
        return await User.findByIdAndUpdate(userId, { resetCode, resetCodeExpiry });
    },
    
    sendResetCodeEmail: async (user, resetCode) => {
        const formatFirstName = user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
        const formatLastName = user.lastname.toUpperCase();
        await sendEmail(user.email, 'Code de réinitialisation du mot de passe', {
            resetCode,
            firstname: formatFirstName,
            lastname: formatLastName
        }, 'passwordResetCodeTemplate');
    }
};

module.exports = userService;
