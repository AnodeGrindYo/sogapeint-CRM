const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    user: { 
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        firstname: { type: String, required: true },
        lastname: { type: String, required: true }
    },
    message: { type: String, required: true },
    time: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
