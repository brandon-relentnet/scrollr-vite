// fetchDataAndSave.js
const { compareDatesAndTimeDifference, sortAscendingArray, isSameDate, convertUTCToEST, getCurrentESTISO, addValueIfNotNegative } = require('./formatDate');
require('dotenv').config();

const axios = require('axios');
const Data = require('./models/Data');
const mongoose = require('mongoose');

let range = null;

let dataSetCounter = 1;

/**
 * Fetch data from a single API URL with retry mechanism.
 * @param {string} url - The API endpoint to fetch data from.
 * @param {number} retries - Number of retry attempts.
 * @param {number} delay - Initial delay between retries in ms.
 * @returns {object|null} - Fetched data or null if an error occurs.
 */
const fetchData = async (url, retries = 3, delay = 1000) => {
    console.log();
    console.log(`\x1b[32m📍 Dataset #${dataSetCounter}\x1b[0m`);
    try {
        const response = await axios.get(url);
        console.log(`📥 Data fetched from API (${url})`);
        return response.data;
    } catch (error) {
        if (retries > 0) {
            console.warn(`⚠️ Retry fetching data from API (${url}). Retries left: ${retries}`);
            await new Promise(res => setTimeout(res, delay));
            return fetchData(url, retries - 1, delay * 2); // Exponential backoff
        } else {
            console.error(`❌ Failed to fetch data from API (${url}) after multiple attempts:`, error.message);
            return null;
        }
    }
};

/**
 * Determine if there are games scheduled for today and their statuses.
 * @param {object} data - The data fetched from the API.
 * @returns {object} - Contains flags for live games, pre-games, and the earliest game time.
 */
const determineGameStatus = (data) => {
    if (!data || !data.events) return { isEventLive: false, isEventOver: false, nextEventStartTime: null };

    let isEventLive = false;
    let isEventOver = false;
    let nextEventStartTime = null;
    
    // Get the current date with time
    const currentISO = getCurrentESTISO();
    console.log();
    console.log(`\x1b[33m🕜 Current ISO Time: ${currentISO}\x1b[0m`);
    console.log();

    let eventCounter = 0;
    let numbers = [];
    data.events.forEach(event => {
        if (!event.date) return;
        console.log(`\x1b[34m📆 Event ${eventCounter}\x1b[0m`);
        eventCounter++;

        const eventName = event.shortName;
        const eventDateWithTime = event.date;

        const eventISO = convertUTCToEST(eventDateWithTime);
        console.log(`Event Name: ${eventName} | Event ISO Time: ${eventISO}`);
        
        // Only calculate the difference if eventISO is valid
        if (eventISO) {
            const diffInMinutes = compareDatesAndTimeDifference(currentISO, eventISO);
            addValueIfNotNegative(diffInMinutes, numbers);
        } else {
            console.log(`Event ${eventName} has an invalid date format: ${eventDateWithTime}`);
        }

        // Check if the event is today
        if (isSameDate(currentISO, eventISO)) {
            // Determine the status of the game
            const status = event.status.type.state;

            console.log(`🏁 Game Status: ${status}`);

            if (status === 'in') {
                isEventLive = true;
            } else if (status === 'post') {
                isEventOver = true;
            }

            numbers = numbers.filter(n => n !== null);
            numbers = numbers.filter(n => n >= 0).sort((a, b) => a - b);

            if (numbers > 0) {
                nextEventStartTime = numbers[0];
                console.log(nextEventStartTime);
            } 
        }
        console.log();
    });
    
    numbers = numbers.filter(n => n !== null);
    numbers = numbers.filter(n => n >= 0).sort((a, b) => a - b);

    if (numbers.length > 1) {
        range = numbers[numbers.length - 1] - numbers[0];
        console.log(`\x1b[33m📊 Range\x1b[0m`);
        console.log(numbers);
        console.log(range);
    } else {
        range = null;
        console.log(`\x1b[33m📊 Range\x1b[0m`);
        console.log('No valid time differences found.'); 
    }
    
    return { isEventLive, isEventOver, nextEventStartTime, range };
};

/**
 * Fetch data, save to MongoDB, emit via WebSocket, and determine game presence.
 * @param {string} leagueKey - Identifier for the league (e.g., 'nfl').
 * @param {string} leagueUrl - API URL for the league.
 * @param {object} io - Socket.io instance for emitting events.
 * @returns {object|null} - Contains flags for live games, pre-games, and next game time.
 */
const fetchDataAndSave = async (leagueKey, leagueUrl, io) => {
    try {
        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.VITE_MONGO_URI);
            console.log('🎉 Connected to MongoDB.');
        }

        const data = await fetchData(leagueUrl);
        if (!data) return null;
        dataSetCounter++;

        // Save data to MongoDB
        await Data.findOneAndUpdate(
            { _id: leagueKey },
            { data, fetchedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`✅ Data saved to MongoDB for (${leagueKey})`);

        // Emit data via WebSocket
        io.emit('dataUpdate', { identifier: leagueKey, data, fetchedAt: new Date() });
        console.log(`📤 Emitted 'dataUpdate' event for (${leagueKey}).`);

        // Determine if there are games today and their statuses
        const { isEventLive, isEventOver, nextEventStartTime } = determineGameStatus(data);
        console.log(`\x1b[33m💾 Statistics\x1b[0m`);
        console.log(`${leagueKey.toUpperCase()} has live events: ${isEventLive}, finished-events: ${isEventOver}, next event in ${nextEventStartTime} minutes.`);
        
        return { isEventLive, isEventOver, nextEventStartTime, range };
    } catch (error) {
        console.error(`❌ Error processing data for (${leagueKey}):`, error.message);
        return null;
    }
};

module.exports = fetchDataAndSave;
