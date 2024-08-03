const mongoose = require('mongoose');

const liveChatSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    messages: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

const LiveChat = mongoose.model('LiveChat', liveChatSchema);

module.exports = LiveChat;