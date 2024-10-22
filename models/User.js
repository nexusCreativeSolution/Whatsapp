const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true }, 
    balance: { type: Number, default: 1000 },
    isMod: { type: Boolean, default: false },
    lastClaim: { type: Date },
    modRole: { type: String, default: '' } // New field for storing the moderator role
});

module.exports = mongoose.model('User', userSchema);
