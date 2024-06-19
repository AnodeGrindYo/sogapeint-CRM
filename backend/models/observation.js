const mongoose = require('mongoose');

const observationModel = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  dateAdd: {
    type: Date,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: false
  },
  processed: {
    type: Boolean,
    default: false
  }
});

const Observation = mongoose.model('Observation', observationModel);

module.exports = Observation;
