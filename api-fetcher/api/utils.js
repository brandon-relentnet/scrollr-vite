function getCurrentESTISO() {
    const now = new Date();
    // Convert to UTC and adjust for EST timezone (UTC - 5 hours)
    now.setUTCHours(now.getUTCHours() - 5);
    // Format as ISO string and replace 'Z' to indicate EST offset
    return now.toISOString().replace('Z', '-05:00');
}

function isSameDate(isoDate1, isoDate2) {
    // Compare date parts only
    return isoDate1.slice(0, 10) === isoDate2.slice(0, 10); // YYYY-MM-DD
}

function timeDifferenceInMinutes(isoStartTime, isoEndTime) {
    // Use Date.parse for faster direct parsing
    const start = Date.parse(isoStartTime);
    const end = Date.parse(isoEndTime);
    // Return the difference in minutes, rounded
    return Math.round((end - start) / 60000);
}

function compareDatesAndTimeDifference(isoStartTime, isoEndTime) {
    return isSameDate(isoStartTime, isoEndTime)
        ? timeDifferenceInMinutes(isoStartTime, isoEndTime)
        : null;
}

function convertUTCToEST(isoDateString) {
    const utcDate = new Date(isoDateString);
    // Automatically calculate offset for DST and EST
    const offset = utcDate.toLocaleTimeString('en-US', { timeZone: 'America/New_York' }).includes('PM') ? -5 : -4;
    const easternDate = new Date(utcDate.getTime() + offset * 3600000);
    // Format as ISO with correct offset
    return easternDate.toISOString().replace('Z', offset === -4 ? '-04:00' : '-05:00');
}

function addValueIfNotNegative(value, numbers) {
    // Directly add positive values only
    if (value >= 0) numbers.push(value);
}

module.exports = {
    compareDatesAndTimeDifference,
    isSameDate,
    getCurrentESTISO,
    convertUTCToEST,
    addValueIfNotNegative,
};
