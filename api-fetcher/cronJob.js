// cronJob.js
const cron = require('node-cron');
const fetchDataAndSave = require('./fetchDataAndSave');
const axios = require('axios');

const API_IDENTIFIERS = ['nfl', 'mlb', 'nhl', 'nba'];
const API_URLS = process.env.VITE_API_URLS
    ? process.env.VITE_API_URLS.split(',').map(url => url.trim())
    : [];

if (API_URLS.length !== API_IDENTIFIERS.length) {
    console.error(`❌ The number of API URLs (${API_URLS.length}) does not match the number of identifiers (${API_IDENTIFIERS.length}).`);
    process.exit(1);
}

const LEAGUES = {};
API_IDENTIFIERS.forEach((identifier, index) => {
    LEAGUES[identifier] = API_URLS[index];
});

const leagueTasks = {};

// Function to schedule or reschedule a cron job for a specific league
const scheduleLeagueJob = (leagueKey, leagueUrl, io, isLive) => {
    // Initialize the leagueTasks entry if it doesn't exist
    if (!leagueTasks[leagueKey]) {
        leagueTasks[leagueKey] = { isLive: isLive, task: null, counter: 0 }; // Add counter
    }

    // If a task already exists, stop it before rescheduling
    if (leagueTasks[leagueKey].task) {
        leagueTasks[leagueKey].task.stop();
        console.log(`🛑 Existing cron job stopped for ${leagueKey.toUpperCase()}.`);
    }

    // Determine the cron expression based on live status
    const cronExpression = isLive ? '*/1 * * * *' : '*/30 * * * *';

    // Schedule the new cron job
    const task = cron.schedule(cronExpression, async () => {
        console.log(`⏰ Cron job triggered for ${leagueKey.toUpperCase()}: Fetching data...`);
        const liveStatus = await fetchDataAndSave(leagueKey, leagueUrl, io);

        // Increment the counter each time an API call is made
        leagueTasks[leagueKey].counter += 1;
        console.log(`🔄 API call count for ${leagueKey.toUpperCase()}: ${leagueTasks[leagueKey].counter}`);

        if (liveStatus !== null && liveStatus !== leagueTasks[leagueKey].isLive) {
            leagueTasks[leagueKey].isLive = liveStatus;
            scheduleLeagueJob(leagueKey, leagueUrl, io, liveStatus);
            console.log(`🔄 Rescheduled cron job for ${leagueKey.toUpperCase()} to run ${liveStatus ? 'every 1 minute' : 'every 30 minutes'}.`);
        }
    });

    // Start the cron job
    task.start();
    leagueTasks[leagueKey].task = task;

    console.log(`🕒 Cron job scheduled for ${leagueKey.toUpperCase()} to run ${isLive ? 'every 1 minute' : 'every 30 minutes'}.`);
};

// Function to initialize all cron jobs
const startCronJobs = async (io) => {
    for (const [leagueKey, leagueUrl] of Object.entries(LEAGUES)) {
        const live = await fetchDataAndSave(leagueKey, leagueUrl, io);
        leagueTasks[leagueKey] = { isLive: live, task: null, counter: 0 }; // Initialize counter
        scheduleLeagueJob(leagueKey, leagueUrl, io, live);
    }

    console.log('✅ All cron jobs initialized.');
};

module.exports = startCronJobs;
