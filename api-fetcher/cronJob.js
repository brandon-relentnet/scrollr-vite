// cronJob.js
const cron = require('node-cron');
const fetchDataAndSave = require('./fetchDataAndSave');

// Schedule the fetchDataAndSave function to run every hour
cron.schedule('0 * * * *', fetchDataAndSave);

// Fetch data immediately on startup
fetchDataAndSave();
