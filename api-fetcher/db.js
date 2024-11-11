// db.js
const mongoose = require('mongoose');

const mongoURI = process.env.VITE_MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

module.exports = mongoose;
