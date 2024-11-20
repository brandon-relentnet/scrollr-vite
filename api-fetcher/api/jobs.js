// api/jobs.js
const { agenda, logger } = require('../agenda');
const fetchDataAndSave = require('../fetchDataAndSave');
const Bottleneck = require('bottleneck');

// Define polling configurations per category
const pollingConfigs = {
    high: {
        cron: process.env.POLLING_HIGH_CRON || '*/1 * * * *', // Every 1 minute
        description: 'High frequency polling',
    },
    medium: {
        cron: process.env.POLLING_MEDIUM_CRON || '*/5 * * * *', // Every 5 minutes
        description: 'Medium frequency polling',
    },
    low: {
        cron: process.env.POLLING_LOW_CRON || '*/15 * * * *', // Every 15 minutes
        description: 'Low frequency polling',
    },
};

// Configuration for scheduling and frequency of updates
const config = {
    dailyUpdateCron: process.env.CRON_DAILY_UPDATE || '0 0 * * *', // Every day at midnight
};

// Configure Bottleneck for API rate limiting
const limiter = new Bottleneck({
    reservoir: 100,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 60 * 1000, // Refresh limit every 1 minute
    maxConcurrent: 5,
    minTime: 100,
});

// Set up league identifiers and URLs from environment variables
const API_IDENTIFIERS = ['nfl', 'mlb', 'nhl', 'nba'];
const API_URLS = process.env.VITE_API_URLS
    ? process.env.VITE_API_URLS.split(',').map(url => url.trim())
    : [];

// Validate environment configuration to ensure URLs match league identifiers
if (API_URLS.length !== API_IDENTIFIERS.length) {
    logger.error(`API URLs (${API_URLS.length}) do not match identifiers (${API_IDENTIFIERS.length}). Check environment configuration.`);
    process.exit(1);
}

// Map league identifiers to their respective API URLs for easy access
const LEAGUES = API_IDENTIFIERS.reduce((acc, identifier, index) => {
    acc[identifier] = API_URLS[index];
    return acc;
}, {});

// Track each league's current status ('in', 'post', etc.)
const leagueStatusMap = {};

// Current count of active leagues with 'in' status
let currentActiveLeaguesCount = 0;

// Module-level `io` instance
let ioInstance = null;

/**
 * Helper function to determine the polling status based on game status.
 * Returns 'in' for live games, 'post' for completed games, and 'pregame' for upcoming games.
 */
const determineStatus = (isEventLive, isEventOver) => (isEventLive ? 'in' : isEventOver ? 'post' : 'pregame');

/**
 * Schedules a one-time job to adjust the polling frequency at a specific time.
 * @param {string} leagueKey - The identifier for the league (e.g., 'nfl').
 * @param {string} targetPollingCategory - The target polling category ('high', 'medium', 'low').
 * @param {Date} adjustTime - The time at which to adjust the polling frequency.
 */
const schedulePollingAdjustment = async (leagueKey, targetPollingCategory, adjustTime) => {
    const jobName = 'adjust polling';
    await agenda.schedule(adjustTime, jobName, { leagueKey, targetPollingCategory });
    logger.info(`🕒 Scheduled polling adjustment for ${leagueKey.toUpperCase()} to '${targetPollingCategory}' at ${adjustTime}.`);
    // Added console log for scheduled polling adjustment time
    console.log(`🕒 Scheduled polling adjustment for ${leagueKey.toUpperCase()} to '${targetPollingCategory}' at ${adjustTime.toLocaleString()}.`);
};

/**
 * Reschedule polling for a league based on its new status and polling category.
 * @param {string} leagueKey - The identifier for the league (e.g., 'nfl').
 * @param {string} status - The new status of the league ('in', 'post', 'pregame').
 * @param {string} pollingCategory - The urgency category ('high', 'medium', 'low').
 * @param {number|null} nextEventStartTime - Time in minutes until the next event starts.
 */
const reschedulePolling = async (leagueKey, status, pollingCategory, nextEventStartTime) => {
    const jobName = 'poll league';
    // Determine current polling category
    const currentJobs = await agenda.jobs({ name: jobName, 'data.leagueKey': leagueKey });
    let currentPollingCategory = null;

    if (currentJobs.length > 0) {
        const cronExpression = currentJobs[0].attrs.repeatInterval;
        if (pollingConfigs.high.cron === cronExpression) {
            currentPollingCategory = 'high';
        } else if (pollingConfigs.medium.cron === cronExpression) {
            currentPollingCategory = 'medium';
        } else if (pollingConfigs.low.cron === cronExpression) {
            currentPollingCategory = 'low';
        }
    }

    // Only reschedule if pollingCategory has changed
    if (currentPollingCategory !== pollingCategory) {
        await agenda.cancel({ name: jobName, 'data.leagueKey': leagueKey });
        // Cancel any existing 'adjust polling' jobs for this league
        await agenda.cancel({ name: 'adjust polling', 'data.leagueKey': leagueKey });

        const selectedPollingConfig = pollingConfigs[pollingCategory] || pollingConfigs.low;
        const cronExpression = selectedPollingConfig.cron;

        logger.info(`🔄 Rescheduling polling for ${leagueKey.toUpperCase()} with interval '${cronExpression}' (${selectedPollingConfig.description}).`);
        console.log(`\x1b[0m\n${'-'.repeat(50)}\n`);
        console.log(`🔄 Rescheduling polling for ${leagueKey.toUpperCase()} with interval '${cronExpression}' (${selectedPollingConfig.description}).`);

        await agenda.every(cronExpression, jobName, { leagueKey, status });

        // Schedule polling adjustments if necessary
        if (nextEventStartTime !== null) {
            const now = new Date();
            // Schedule adjustment to 'medium' at 60 minutes before the game
            if (nextEventStartTime > 60 && pollingCategory === 'low') {
                const adjustTime = new Date(now.getTime() + (nextEventStartTime - 60) * 60 * 1000);
                await schedulePollingAdjustment(leagueKey, 'medium', adjustTime);
            }

            // Schedule adjustment to 'high' at 5 minutes before the game
            if (nextEventStartTime > 5 && pollingCategory !== 'high') {
                const adjustTime = new Date(now.getTime() + (nextEventStartTime - 5) * 60 * 1000);
                await schedulePollingAdjustment(leagueKey, 'high', adjustTime);
            }
        }
    } else {
        logger.info(`📌 Polling category for ${leagueKey.toUpperCase()} remains '${pollingCategory}'. No rescheduling needed.`);
        console.log(`📌 Polling category for ${leagueKey.toUpperCase()} remains '${pollingCategory}'. No rescheduling needed.`);
    }
};

// Define the 'adjust polling' job
agenda.define('adjust polling', async (job, done) => {
    const { leagueKey, targetPollingCategory } = job.attrs.data;
    try {
        logger.info(`⏳ Executing polling adjustment for ${leagueKey.toUpperCase()} to '${targetPollingCategory}'.`);
        console.log(`⏳ Executing polling adjustment for ${leagueKey.toUpperCase()} to '${targetPollingCategory}'.`);

        // Fetch the latest data to determine the current status
        const result = await limiter.schedule(() => fetchDataAndSave(leagueKey, LEAGUES[leagueKey], ioInstance));
        if (result) {
            const { isEventLive, isEventOver, nextEventStartTime } = result;
            const status = determineStatus(isEventLive, isEventOver);

            // Reschedule polling to the target category
            await reschedulePolling(leagueKey, status, targetPollingCategory, nextEventStartTime);
        }

        done();
    } catch (error) {
        logger.error(`❌ Error adjusting polling for ${leagueKey.toUpperCase()}: ${error.message}`);
        console.error(`❌ Error adjusting polling for ${leagueKey.toUpperCase()}: ${error.message}`);
        done(error);
    }
});

// Modify calls to reschedulePolling in 'poll league' job
agenda.define('poll league', async (job, done) => {
    const { leagueKey, status } = job.attrs.data;

    try {
        logger.info(`⏰ Polling ${leagueKey.toUpperCase()} API for status '${status}'...`);
        console.log(`⏰ Polling ${leagueKey.toUpperCase()} API for status '${status}'...`);
        const result = await limiter.schedule(() => fetchDataAndSave(leagueKey, LEAGUES[leagueKey], ioInstance));

        if (result) {
            const { isEventLive, isEventOver, nextEventStartTime, pollingCategory } = result;
            const newStatus = determineStatus(isEventLive, isEventOver);
            const previousStatus = leagueStatusMap[leagueKey] || '';

            if (previousStatus !== newStatus) {
                // Handle status transition
                if (previousStatus === 'in' && newStatus !== 'in') {
                    currentActiveLeaguesCount--;
                    logger.info(`🔻 League ${leagueKey.toUpperCase()} has become inactive. Active leagues count: ${currentActiveLeaguesCount}`);
                    console.log(`🔻 League ${leagueKey.toUpperCase()} has become inactive. Active leagues count: ${currentActiveLeaguesCount}`);
                } else if (previousStatus !== 'in' && newStatus === 'in') {
                    currentActiveLeaguesCount++;
                    logger.info(`🔺 League ${leagueKey.toUpperCase()} has become active. Active leagues count: ${currentActiveLeaguesCount}`);
                    console.log(`🔺 League ${leagueKey.toUpperCase()} has become active. Active leagues count: ${currentActiveLeaguesCount}`);
                }

                // Update the leagueStatusMap
                leagueStatusMap[leagueKey] = newStatus;
            }

            // Reschedule polling based on the new status and polling category
            await reschedulePolling(leagueKey, newStatus, pollingCategory, nextEventStartTime);
        }

        done();
    } catch (error) {
        logger.error(`❌ Error polling ${leagueKey.toUpperCase()}: ${error.message}`);
        console.error(`❌ Error polling ${leagueKey.toUpperCase()}: ${error.message}`);
        done(error);
    }
});

/**
 * Daily update job definition.
 * This job resets all polling tasks based on new game schedules.
 */
agenda.define('daily update', async (job, done) => {
    logger.info(`🗓️ Daily update triggered. Re-initializing polling based on new game schedules...`);
    console.log(`🗓️ Daily update triggered. Re-initializing polling based on new game schedules...`);

    // Reset statuses and active league count
    for (const leagueKey of API_IDENTIFIERS) {
        leagueStatusMap[leagueKey] = '';
    }
    currentActiveLeaguesCount = 0;

    // Cancel all existing 'poll league' jobs
    await agenda.cancel({ name: 'poll league' });

    // Reinitialize polling for all leagues
    for (const leagueKey of API_IDENTIFIERS) {
        try {
            const result = await fetchDataAndSave(leagueKey, LEAGUES[leagueKey], ioInstance);
            if (result) {
                const { isEventLive, isEventOver, nextEventStartTime, pollingCategory } = result;
                const status = determineStatus(isEventLive, isEventOver);
                leagueStatusMap[leagueKey] = status;

                if (status === 'in') {
                    currentActiveLeaguesCount++;
                }

                // Reschedule polling based on pollingCategory
                await reschedulePolling(leagueKey, status, pollingCategory, nextEventStartTime);
            }
        } catch (error) {
            logger.error(`❌ Error initializing polling for ${leagueKey.toUpperCase()}: ${error.message}`);
            console.error(`❌ Error initializing polling for ${leagueKey.toUpperCase()}: ${error.message}`);
        }
    }

    done();
});

/**
 * Function to initialize all jobs at startup.
 * @param {object} io - The Socket.IO server instance.
 */
const initializeJobs = async (io) => {
    // Set the module-level ioInstance
    ioInstance = io;

    for (const leagueKey of API_IDENTIFIERS) {
        try {
            const result = await fetchDataAndSave(leagueKey, LEAGUES[leagueKey], ioInstance);
            if (result) {
                const { isEventLive, isEventOver, nextEventStartTime, pollingCategory } = result;
                const status = determineStatus(isEventLive, isEventOver);
                leagueStatusMap[leagueKey] = status;

                if (status === 'in') {
                    currentActiveLeaguesCount++;
                }

                // Reschedule polling based on pollingCategory
                await reschedulePolling(leagueKey, status, pollingCategory, nextEventStartTime);
            }
        } catch (error) {
            logger.error(`❌ Error initializing polling for ${leagueKey.toUpperCase()}: ${error.message}`);
            console.error(`❌ Error initializing polling for ${leagueKey.toUpperCase()}: ${error.message}`);
        }
    }

    logger.info(`📊 Initialized polling with ${currentActiveLeaguesCount} active league(s).`);
    console.log(`📊 Initialized polling with ${currentActiveLeaguesCount} active league(s).`);
};

/**
 * Function to schedule the daily update job.
 * @param {object} io - The Socket.IO server instance.
 */
const scheduleDailyUpdate = async (io) => {
    // Ensure ioInstance is set
    ioInstance = io;

    await agenda.every(config.dailyUpdateCron, 'daily update');
    logger.info(`📅 Daily update job scheduled to run at '${config.dailyUpdateCron}'.`);
    console.log(`📅 Daily update job scheduled to run at '${config.dailyUpdateCron}'.`);
};

module.exports = { initializeJobs, scheduleDailyUpdate };
