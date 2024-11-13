const { 
    compareDatesAndTimeDifference, 
    isSameDate, 
    convertUTCToEST, 
    getCurrentESTISO, 
    addValueIfNotNegative 
    } = require('./utils');
require('dotenv').config();

const axios = require('axios');
const Data = require('../models/Data');
const mongoose = require('mongoose');

let range = null;
let dataSetCounter = 0;

/**
 * Fetch data from a single API URL with retry mechanism.
 * @param {string} url - The API endpoint to fetch data from.
 * @param {number} retries - Number of retry attempts.
 * @param {number} delay - Initial delay between retries in ms.
 * @returns {object|null} - Fetched data or null if an error occurs.
 */
const fetchData = async (url, retries = 3, delay = 1000) => {
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
    const currentISO = getCurrentESTISO();

    let numbers = [];
    const eventSummaries = [];

    data.events.forEach((event) => {
        const { date: eventDateWithTime, shortName: eventName } = event;
        if (!eventDateWithTime) return;

        const eventISO = convertUTCToEST(eventDateWithTime);
        let diffInMinutes = null;
        let eventStatus = 'Unknown';

        if (eventISO) {
            diffInMinutes = compareDatesAndTimeDifference(currentISO, eventISO);
            addValueIfNotNegative(diffInMinutes, numbers);
            if (isSameDate(currentISO, eventISO)) {
                eventStatus = event.status.type.state;
                isEventLive = isEventLive || eventStatus === 'in';
                isEventOver = isEventOver || eventStatus === 'post';
            }
        }

        eventSummaries.push({
            name: eventName,
            isoTime: eventISO || 'Invalid date format',
            status: eventStatus,
            timeDiff: diffInMinutes !== null ? `${diffInMinutes} mins` : 'N/A',
        });
    });

    numbers = numbers.filter(n => n >= 0).sort((a, b) => a - b);
    nextEventStartTime = numbers.length ? numbers[0] : null;
    range = numbers.length > 1 ? numbers[numbers.length - 1] - numbers[0] : null;

    console.log(`\n\x1b[34m📆 Event Details for Dataset #${dataSetCounter}\x1b[0m`);
    eventSummaries.forEach((event, idx) => {
        console.log(`Event ${idx + 1}: ${event.name} | Time: ${event.isoTime} | Status: ${event.status} | Time Difference: ${event.timeDiff}`);
    });

    console.log(`\n\x1b[33m📊 Polling Statistics for Dataset #${dataSetCounter}\x1b[0m`);
    console.log(`Upcoming Event Start Time: ${nextEventStartTime !== null ? `${nextEventStartTime} mins` : 'No upcoming events'}`);
    console.log(`Range: ${range !== null ? `${range} mins` : 'No valid time differences found.'}`);

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
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.VITE_MONGO_URI);
            console.log('🎉 Connected to MongoDB.');
        }

        
        const data = await fetchData(leagueUrl);
        if (!data) return null;
        

        await Data.findOneAndUpdate(
            { _id: leagueKey },
            { data, fetchedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        dataSetCounter++;
        console.log(`\n\x1b[32m📍 Dataset #${dataSetCounter}\x1b[0m`);
        console.log(`✅ Data saved to MongoDB for (${leagueKey})`);

        io.emit('dataUpdate', { identifier: leagueKey, data, fetchedAt: new Date() });
        console.log(`📤 Emitted 'dataUpdate' event for (${leagueKey}).`);

        const { isEventLive, isEventOver, nextEventStartTime } = determineGameStatus(data);
        console.log(`\x1b[0m\n${'-'.repeat(50)}\n`);
        console.log(`\x1b[33m💾 Summary for ${leagueKey.toUpperCase()}\x1b[0m`);
        console.log(`${leagueKey.toUpperCase()} has live events: ${isEventLive}, finished events: ${isEventOver}, next event in: ${nextEventStartTime} mins.`);
        

        return { isEventLive, isEventOver, nextEventStartTime, range };
    } catch (error) {
        console.error(`❌ Error processing data for (${leagueKey}):`, error.message);
        return null;
    }
};

module.exports = fetchDataAndSave;
