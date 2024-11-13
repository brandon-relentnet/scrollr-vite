const cron = require('node-cron');
const fetchDataAndSave = require('./fetchDataAndSave');
const Bottleneck = require('bottleneck');
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' }),
    ],
});

// Configure Bottleneck for rate limiting
const limiter = new Bottleneck({
    reservoir: 100, // Number of requests
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 60 * 1000, // 1 minute
    maxConcurrent: 5,
    minTime: 100, // At least 100ms between requests
});

// Define API identifiers and URLs
const API_IDENTIFIERS = ['nfl', 'mlb', 'nhl', 'nba'];
const API_URLS = process.env.VITE_API_URLS
    ? process.env.VITE_API_URLS.split(',').map(url => url.trim())
    : [];

// Validate configuration
if (API_URLS.length !== API_IDENTIFIERS.length) {
    logger.error(`The number of API URLs (${API_URLS.length}) does not match the number of identifiers (${API_IDENTIFIERS.length}).`);
    process.exit(1);
}

// Map identifiers to URLs
const LEAGUES = {};
API_IDENTIFIERS.forEach((identifier, index) => {
    LEAGUES[identifier] = API_URLS[index];
});

const leagueTasks = {}; // To keep track of scheduled cron jobs

/**
 * Schedule a cron job to poll for a specific duration in minutes.
 * @param {number} durationInMinutes - Duration to run polling in minutes.
 * @param {function} job - The polling job to run.
 */
function rangeCronJob(durationInMinutes, job) {
    const durationInMilliseconds = durationInMinutes * 60 * 1000;
    const intervalId = setInterval(job, 60000); // Poll every minute

    // Stop the cron job after the specified duration
    setTimeout(() => {
        clearInterval(intervalId);
        logger.info(`Cron job stopped after ${durationInMinutes} minutes.`);
    }, durationInMilliseconds);
}

/**
 * Schedule a polling cron job for a league based on its status.
 * @param {string} leagueKey - Identifier for the league (e.g., 'nfl').
 * @param {string} leagueUrl - API URL for the league.
 * @param {object} io - Socket.io instance for emitting events.
 * @param {string} status - Current status of the league's games ('in', 'pre', 'post').
 */
const schedulePolling = (leagueKey, leagueUrl, io, status) => {
    let cronExpression = '';
    if (status === 'in') {
        cronExpression = process.env[`CRON_${leagueKey.toUpperCase()}_LIVE_FREQUENCY`] || '*/1 * * * *'; // Every 1 minute
    } else if (status === 'pre') {
        cronExpression = process.env[`CRON_${leagueKey.toUpperCase()}_PREGAME_FREQUENCY`] || '*/5 * * * *'; // Every 5 minutes
    } else {
        logger.info(`${leagueKey.toUpperCase()} has no active games. Polling not scheduled.`);
        return;
    }

    if (leagueTasks[leagueKey]) {
        leagueTasks[leagueKey].stop();
        logger.info(`🛑 Existing polling cron job stopped for ${leagueKey.toUpperCase()}.`);
    }

    const task = cron.schedule(cronExpression, async () => {
        logger.info(`⏰ Polling ${leagueKey.toUpperCase()} API...`);
        const result = await limiter.schedule(() => fetchDataAndSave(leagueKey, leagueUrl, io));

        if (result) {
            const { isEventLive, isEventOver } = result;
            let newStatus = '';
            if (isEventLive) {
                newStatus = 'in';
            } else if (isEventOver) {
                newStatus = 'post';
            }

            if (newStatus !== status) {
                logger.info(`🔄 Status change detected for ${leagueKey.toUpperCase()}: ${status} → ${newStatus}. Rescheduling polling.`);
                schedulePolling(leagueKey, leagueUrl, io, newStatus);
            }
        }
    });

    task.start();
    leagueTasks[leagueKey] = task;
    logger.info(`🕒 Polling cron job scheduled for ${leagueKey.toUpperCase()} with frequency '${cronExpression}' (Status: ${status}).`);
};

/**
 * Initialize polling for all leagues based on their current game statuses.
 * @param {object} io - Socket.io instance for emitting events.
 */
const initializePolling = async (io) => {
    for (const [leagueKey, leagueUrl] of Object.entries(LEAGUES)) {
        const result = await limiter.schedule(() => fetchDataAndSave(leagueKey, leagueUrl, io));

        if (result) {
            const { isEventLive, isEventOver, nextEventStartTime, range } = result;

            let status = '';
            if (isEventLive) {
                status = 'in';
            } else if (isEventOver) {
                status = 'post';
            }

            console.log(nextEventStartTime);
            // Schedule the rangeCronJob only after `nextEventStartTime` minutes
            if (nextEventStartTime && range) {
                const delayInMilliseconds = nextEventStartTime * 60 * 1000; // Convert minutes to milliseconds

                logger.info(`⏳ Delaying rangeCronJob for ${leagueKey.toUpperCase()} by ${nextEventStartTime} minutes.`);

                setTimeout(() => {
                    rangeCronJob(range, async () => {
                        await limiter.schedule(() => fetchDataAndSave(leagueKey, leagueUrl, io));
                    });
                    logger.info(`✅ Started rangeCronJob for ${leagueKey.toUpperCase()} with a duration of ${range} minutes.`);
                }, delayInMilliseconds);
            }

            if (status === 'in') {
                schedulePolling(leagueKey, leagueUrl, io, status);
            } else {
                logger.info(`${leagueKey.toUpperCase()} has no active games. Polling not scheduled.`);
            }
        } else {
            logger.warn(`⚠️ Unable to determine game status for ${leagueKey.toUpperCase()}. Polling not scheduled.`);
        }
    }
};


/**
 * Schedule a daily cron job to update polling schedules based on new game data.
 * @param {object} io - Socket.io instance for emitting events.
 */
const scheduleDailyUpdate = (io) => {
    const dailyCronExpression = process.env.CRON_DAILY_UPDATE || '0 0 * * *'; // Every day at midnight

    cron.schedule(dailyCronExpression, async () => {
        logger.info(`🗓️ Daily update triggered. Re-initializing polling based on new game schedules...`);

        for (const [leagueKey, task] of Object.entries(leagueTasks)) {
            task.stop();
            logger.info(`🛑 Stopped polling cron job for ${leagueKey.toUpperCase()}.`);
        }

        for (const leagueKey of Object.keys(leagueTasks)) {
            delete leagueTasks[leagueKey];
        }

        await initializePolling(io);
    });

    logger.info(`📅 Daily update cron job scheduled to run at '${dailyCronExpression}'.`);
};

/**
 * Start all necessary cron jobs.
 * @param {object} io - Socket.io instance for emitting events.
 */
const startCronJobs = async (io) => {
    await initializePolling(io);
    scheduleDailyUpdate(io);
    logger.info('✅ All cron jobs initialized.');
};

module.exports = startCronJobs;
