const ChatMessage = require('../models/chatMessage');
const User = require('../models/User');
const mongoose = require('mongoose');

const getAllMessages = async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days) : 7;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  try {
    const messages = await ChatMessage.find({ time: { $gte: startDate, $lte: endDate } })
      .sort({ time: 1 })
      .exec();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addMessage = (io) => async (req, res) => {
  try {
    const user = await User.findById(req.body.userId).select('firstname lastname');
    const chatMessage = new ChatMessage({
      user: {
        _id: req.body.userId,
        firstname: user.firstname,
        lastname: user.lastname
      },
      message: req.body.message
    });

    const newMessage = await chatMessage.save();
    io.emit('chatMessage', newMessage);
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllMessages,
  addMessage
};
