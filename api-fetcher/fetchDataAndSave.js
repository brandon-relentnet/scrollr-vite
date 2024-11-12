// fetchDataAndSave.js

require('dotenv').config(); // Load environment variables first

const axios = require('axios');
const Data = require('./models/Data');
const mongoose = require('mongoose');

/**
 * Function to fetch data from a single API URL.
 * @param {string} url - The API endpoint to fetch data from.
 * @returns {object|null} - Returns the fetched data or null if an error occurs.
 */
const fetchData = async (url) => {
    try {
        const response = await axios.get(url);
        console.log(`📥 Data fetched from API (${url})`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error fetching data from API (${url}):`, error.message);
        return null;
    }
};

/**
 * Function to determine if there are live games in the fetched data.
 * @param {object} data - The data fetched from the API.
 * @returns {boolean} - Returns true if there are live games, otherwise false.
 */
const determineLiveStatus = (data) => {
    if (!data || !data.events) return false;

    return data.events.some(event =>
        event.status &&
        event.status.type &&
        event.status.type.state &&
        event.status.type.state.toLowerCase() === 'in'
    );
};

/**
 * Function to fetch data from an API, save it to MongoDB, emit via WebSocket,
 * and determine the live game status.
 * @param {string} leagueKey - The identifier for the league (e.g., 'nfl', 'mlb').
 * @param {string} leagueUrl - The API URL for the league.
 * @param {object} io - The Socket.io instance for emitting events.
 * @returns {boolean|null} - Returns the live status (true/false) or null if an error occurs.
 */
const fetchDataAndSave = async (leagueKey, leagueUrl, io) => {
    try {
        // Ensure MongoDB is connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.VITE_MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('✅ Connected to MongoDB.');
        }

        // Fetch data for the specific league
        const data = await fetchData(leagueUrl);

        if (data) {
            // Determine if there are live games
            const isLive = determineLiveStatus(data);

            // Update or insert the data in MongoDB
            await Data.findOneAndUpdate(
                { _id: leagueKey },
                { data, fetchedAt: new Date() },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`✅ Data saved to MongoDB for league (${leagueKey})`);

            // Emit a 'dataUpdate' event via WebSocket
            io.emit('dataUpdate', { identifier: leagueKey, data, fetchedAt: new Date() });
            console.log(`📤 Emitted 'dataUpdate' event for league (${leagueKey}).`);

            // Return the live status
            return isLive;
        } else {
            console.error(`❌ No data fetched for league (${leagueKey}).`);
            // Returning null to indicate that live status could not be determined
            return null;
        }
    } catch (error) {
        console.error(`❌ Error saving data for league (${leagueKey}):`, error.message);
        // Returning null to indicate that live status could not be determined due to an error
        return null;
    }
};

module.exports = fetchDataAndSave;
