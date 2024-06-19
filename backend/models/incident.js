const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
  comment: {
    type: String,
    required: true
  },
  dateAdd: {
    type: Date,
    required: true
  },
  processed: {
    type: Boolean,
    default: false
  }
});

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;
