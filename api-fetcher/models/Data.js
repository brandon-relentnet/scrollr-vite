// models/Data.js
const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    _id: { type: String, default: 'singleton' },
    data: mongoose.Schema.Types.Mixed,
    fetchedAt: Date,
});

module.exports = mongoose.model('Data', dataSchema);
