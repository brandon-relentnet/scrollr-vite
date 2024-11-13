const cron = require('node-cron');
const fetchDataAndSave = require('./fetchDataAndSave');
const Bottleneck = require('bottleneck');
const winston = require('winston');

// Configuration for scheduling and frequency of updates
const config = {
    // Daily cron job at midnight to re-initialize polling based on updated game schedules
    dailyUpdateCron: process.env.CRON_DAILY_UPDATE || '0 0 * * *',
    // Frequency settings for live and pregame polling, specific to each league
    pollingFrequencies: {
        live: leagueKey => process.env[`CRON_${leagueKey.toUpperCase()}_LIVE_FREQUENCY`] || '*/1 * * * *',
        pregame: leagueKey => process.env[`CRON_${leagueKey.toUpperCase()}_PREGAME_FREQUENCY`] || '*/5 * * * *',
    },
};

// Setup Winston logger for structured logging
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

// Configure Bottleneck for API rate limiting
// Limits requests to 100 per minute, with a minimum interval of 100ms between requests
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

// Track all active scheduled tasks for each league and status
const leagueTasks = {};

// Helper function to determine the polling status based on game status
// Returns 'in' for live games, 'post' for completed games, and '' for all other cases
const determineStatus = (isEventLive, isEventOver) => (isEventLive ? 'in' : isEventOver ? 'post' : '');

// Helper function to schedule a job with a specified delay (in milliseconds)
const scheduleDelayedJob = (delay, job) => setTimeout(job, delay);

/**
 * Schedules the polling job for a specific league and status.
 * The job polls at different intervals based on the game status:
 * - Every minute for live games (status 'in')
 * - Every 5 minutes for pregame (status 'pre')
 */
const schedulePolling = (leagueKey, leagueUrl, io, status) => {
    // Determine polling frequency based on game status
    const cronFrequency = status === 'in'
        ? config.pollingFrequencies.live(leagueKey)
        : config.pollingFrequencies.pregame(leagueKey);

    // Stop and replace any existing task for this league and status
    if (leagueTasks[`${leagueKey}_${status}`]) {
        leagueTasks[`${leagueKey}_${status}`].stop();
        logger.info(`🛑 Existing polling cron job stopped for ${leagueKey.toUpperCase()} with status '${status}'.`);
    }

    // Schedule the polling task
    const task = cron.schedule(cronFrequency, async () => {
        try {
            
            logger.info(`⏰ Polling ${leagueKey.toUpperCase()} API for status '${status}'...`);
            const result = await limiter.schedule(() => fetchDataAndSave(leagueKey, leagueUrl, io));
            console.log(`\x1b[0m\n${'-'.repeat(50)}\n`);

            if (result) {
                // Determine if status has changed, and reschedule polling if it has
                const { isEventLive, isEventOver } = result;
                const newStatus = determineStatus(isEventLive, isEventOver);
                
                if (newStatus && newStatus !== status) {
                    logger.info(`🔄 Status change detected for ${leagueKey.toUpperCase()}: ${status} → ${newStatus}. Rescheduling polling.`);
                    schedulePolling(leagueKey, leagueUrl, io, newStatus);
                }
            }
        } catch (error) {
            logger.error(`Error polling ${leagueKey.toUpperCase()}: ${error.message}`);
        }
    });

    // Start the task and save reference for future tracking or cancellation
    task.start();
    leagueTasks[`${leagueKey}_${status}`] = task;
    logger.info(`🕒 Polling cron job scheduled for ${leagueKey.toUpperCase()} with frequency '${cronFrequency}' (Status: ${status}).`);
};

/**
 * Initialize polling for each league by checking the game status and scheduling tasks accordingly.
 * Also, sets a delayed cron job to start polling close to the next game time.
 */
const initializePolling = async (io) => {
    for (const [leagueKey, leagueUrl] of Object.entries(LEAGUES)) {
        
        try {
            // Fetch current game data and determine if live, completed, or pre-game
            const result = await limiter.schedule(() => fetchDataAndSave(leagueKey, leagueUrl, io));
            if (result) {
                const { isEventLive, isEventOver, nextEventStartTime, range } = result;
                const status = determineStatus(isEventLive, isEventOver);

                // Schedule range-based polling with a delay if `nextEventStartTime` and `range` are provided
                if (nextEventStartTime && range) {
                    const delay = nextEventStartTime * 60 * 1000;
                    logger.info(`⏳ Delaying rangeCronJob for ${leagueKey.toUpperCase()} by ${nextEventStartTime} minutes.`);
                    scheduleDelayedJob(delay, () => {
                        rangeCronJob(range, async () => {
                            await limiter.schedule(() => fetchDataAndSave(leagueKey, leagueUrl, io));
                        });
                        logger.info(`✅ Started rangeCronJob for ${leagueKey.toUpperCase()} with duration ${range} minutes.`);
                    });
                }

                // Schedule regular polling if the game is live
                if (status === 'in') {
                    schedulePolling(leagueKey, leagueUrl, io, status);
                    console.log(`\x1b[0m\n${'-'.repeat(50)}\n`);
                } else {
                    logger.info(`${leagueKey.toUpperCase()} has no active games. Polling not scheduled.`);
                    console.log(`\x1b[0m\n${'-'.repeat(50)}\n`);
                }
            } else {
                logger.warn(`⚠️ Unable to determine game status for ${leagueKey.toUpperCase()}. Polling not scheduled.`);
                console.log(`\x1b[0m\n${'-'.repeat(50)}\n`);
            }
        } catch (error) {
            logger.error(`Error initializing polling for ${leagueKey.toUpperCase()}: ${error.message}`);
            console.log(`\x1b[0m\n${'-'.repeat(50)}\n`);
        }
        
    }
    
};

/**
 * Schedules a daily cron job to refresh and reinitialize all polling tasks at midnight.
 * This ensures polling jobs are aligned with any new game schedules each day.
 */
const scheduleDailyUpdate = (io) => {
    cron.schedule(config.dailyUpdateCron, async () => {
        logger.info(`🗓️ Daily update triggered. Re-initializing polling based on new game schedules...`);

        // Stop all existing polling tasks before reinitializing
        for (const [leagueKey, task] of Object.entries(leagueTasks)) {
            task.stop();
            delete leagueTasks[leagueKey];
            logger.info(`🛑 Stopped polling cron job for ${leagueKey.toUpperCase()}.`);
        }

        // Reinitialize polling with updated game data
        await initializePolling(io);
    });
    logger.info(`📅 Daily update cron job scheduled to run at '${config.dailyUpdateCron}'.`);
};

/**
 * Starts all cron jobs, including initializing polling for current game data and scheduling daily updates.
 * This function is called once to start the cron-based polling system.
 */
const startCronJobs = async (io) => {
    await initializePolling(io);
    scheduleDailyUpdate(io);
    logger.info('✅ All cron jobs initialized.');
};

// Export the `startCronJobs` function to allow it to be invoked in other modules
module.exports = startCronJobs;
