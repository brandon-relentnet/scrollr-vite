// fetchDataAndSave.js
const {
    compareDatesAndTimeDifference,
    isSameDate,
    convertUTCToEST,
    getCurrentESTISO,
    addValueIfNotNegative
} = require('./api/utils');
require('dotenv').config();

const axios = require('axios');
const Data = require('./models/Data');
const mongoose = require('mongoose');

let dataSetCounter = 0;

/**
 * Fetch data from a single API URL with retry mechanism.
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
        }
        console.error(`❌ Failed to fetch data from API (${url}) after multiple attempts:`, error.message);
        return null;
    }
};

/**
 * Logs detailed event information.
 */
const logEventDetails = (eventSummaries, dataSetCounter) => {
    console.log(`\n\x1b[33m📆 Event Details for Dataset #${dataSetCounter}\x1b[0m`);
    eventSummaries.forEach((event, idx) => {
        if (event) { // Ensure event is not null
            console.log(`Event ${idx + 1}: ${event.name} | Date: ${event.isoTime} | Status: ${event.status} | Time Until: ${event.timeDiff} | Remaining: ${event.remaining}`);
        }
    });
};

/**
 * Logs summary statistics.
 */
const logPollingStatistics = (nextEventStartTime, range, dataSetCounter) => {
    console.log(`\n\x1b[33m📊 Polling Statistics for Dataset #${dataSetCounter}\x1b[0m`);
    console.log(`Upcoming Event Start Time: ${nextEventStartTime ? `${nextEventStartTime} mins` : 'No upcoming events'}`);
    console.log(`Range: ${range !== null ? `${range} mins` : 'No valid time differences found.'}\n`);
};

/**
 * Process events to determine statuses and calculate polling times.
 */
const determineGameStatus = (data) => {
    if (!data?.events) return { isEventLive: false, isEventOver: false, nextEventStartTime: null, pollingCategory: 'low' };

    let isEventLive = false;
    let isEventOver = false;
    let nextEventStartTime = null;
    const currentISO = getCurrentESTISO();
    let timeDifferences = [];

    const eventSummaries = data.events.map((event, idx) => {
        const { date: eventDateWithTime, shortName: eventName } = event;
        const eventISO = eventDateWithTime ? convertUTCToEST(eventDateWithTime) : null;
        const diffInMinutes = eventISO ? compareDatesAndTimeDifference(currentISO, eventISO) : null;

        if (diffInMinutes !== null) addValueIfNotNegative(diffInMinutes, timeDifferences);

        // Revised Logic: Do not rely solely on isSameDate
        const eventStatus = event?.status?.type?.state || 'Unknown';
        const remaining = event?.status?.displayClock || 'N/A';

        // Determine live and over statuses based on eventStatus
        if (eventStatus === 'in') {
            isEventLive = true;
        } else if (eventStatus === 'post') {
            isEventOver = true;
        }

        return {
            name: eventName,
            isoTime: eventISO || 'Invalid date format',
            status: eventStatus,
            timeDiff: diffInMinutes !== null ? `${diffInMinutes} mins` : 'N/A',
            remaining,
        };
    });

    // Determine the next event start time
    timeDifferences = timeDifferences.filter(n => n >= 0).sort((a, b) => a - b);
    nextEventStartTime = timeDifferences[0] || null;
    const range = timeDifferences.length > 1 ? timeDifferences[timeDifferences.length - 1] - timeDifferences[0] : null;

    logEventDetails(eventSummaries, dataSetCounter);
    logPollingStatistics(nextEventStartTime, range, dataSetCounter++);

    // Determine polling category based on next event timing
    let pollingCategory = 'low'; // Default
    if (nextEventStartTime !== null) {
        if (nextEventStartTime <= 60) { // Within the next hour
            pollingCategory = 'high';
        } else if (nextEventStartTime <= 360) { // Within the next 6 hours
            pollingCategory = 'medium';
        } else {
            pollingCategory = 'low';
        }
    }

    return { isEventLive, isEventOver, nextEventStartTime, range, pollingCategory };
};

/**
 * Fetch data, save to MongoDB, emit via WebSocket, and determine game presence.
 * @param {string} leagueKey - The identifier for the league (e.g., 'nfl').
 * @param {string} leagueUrl - The API URL for the league.
 * @param {object} io - The Socket.IO server instance.
 * @returns {object|null} - An object containing event status flags or null on failure.
 */
const fetchDataAndSave = async (leagueKey, leagueUrl, io) => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.VITE_MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('🎉 Connected to MongoDB.');
        }

        const data = await fetchData(leagueUrl);
        if (!data) return null;

        await Data.findOneAndUpdate(
            { _id: leagueKey },
            { data, fetchedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`\n\x1b[32m📍 Dataset #${dataSetCounter}\x1b[0m`);
        console.log(`✅ Data saved to MongoDB for (${leagueKey})`);

        if (io) {
            io.emit('dataUpdate', { identifier: leagueKey, data, fetchedAt: new Date() });
            console.log(`📤 Emitted 'dataUpdate' event for (${leagueKey}).`);
        } else {
            console.warn(`⚠️ 'io' is undefined. Skipping Socket.IO emission for (${leagueKey}).`);
        }

        const { isEventLive, isEventOver, nextEventStartTime, range, pollingCategory } = determineGameStatus(data);

        console.log(`\x1b[34m💾 Summary for ${leagueKey.toUpperCase()}\x1b[0m`);
        console.log(`${leagueKey.toUpperCase()} has live events: ${isEventLive}, finished events: ${isEventOver}, next event in: ${nextEventStartTime || 'N/A'} mins.`);

        return { isEventLive, isEventOver, nextEventStartTime, range, pollingCategory };
    } catch (error) {
        console.error(`❌ Error processing data for (${leagueKey}):`, error.message);
        return null;
    }
};

module.exports = fetchDataAndSave;
