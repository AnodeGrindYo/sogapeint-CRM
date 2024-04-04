const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const benefitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    _id: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Benefit', benefitSchema, 'benefits');