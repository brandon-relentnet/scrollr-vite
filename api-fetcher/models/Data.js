// models/Data.js
const mongoose = require('mongoose'); // Uses the already connected mongoose instance

const { Schema } = mongoose;

const DataSchema = new Schema({
    _id: {
        type: String, // Using a string identifier for each API data
        required: true,
    },
    data: {
        type: Schema.Types.Mixed, // Adjust based on your API responses
        required: true,
    },
    fetchedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: 'data', // Specify your collection name if different
});

// Create and export the model
module.exports = mongoose.model('Data', DataSchema);
