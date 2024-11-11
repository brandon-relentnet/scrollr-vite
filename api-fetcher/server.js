// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./db'); // Establish database connection
const routes = require('./routes');
require('./cronJob'); // Start cron job

const app = express();
const PORT = process.env.VITE_PORT || 3000;

app.use(cors());
app.use(routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
