function convertToISO(dateString) {
    // Get the current year
    const currentYear = new Date().getFullYear();

    // Remove day suffixes (like "12th" to "12") and "at"/"EST" for easier parsing
    const cleanedDateString = dateString
        .replace(/(\d{1,2})(st|nd|rd|th)/, '$1') // Remove day suffixes
        .replace(' at', '')                      // Remove " at"
        .replace(' EST', '');                    // Remove " EST"

    // Add the current year if it’s missing
    const dateWithYear = `${cleanedDateString} ${currentYear}`;

    // Parse the cleaned date string
    const parsedDate = new Date(dateWithYear);

    // Ensure the parsed date is valid
    return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
}

function getCurrentESTISO() {
    const now = new Date();

    // Convert to UTC and adjust for EST timezone (UTC - 5 hours)
    now.setUTCHours(now.getUTCHours() - 5);

    // Format as ISO string
    return now.toISOString().replace('Z', '-05:00'); // Replacing 'Z' to indicate EST offset
}

function isSameDate(isoDate1, isoDate2) {
    // Extract date parts from the ISO strings (format: YYYY-MM-DD)
    const date1 = isoDate1.split('T')[0];
    const date2 = isoDate2.split('T')[0];

    // Compare the date parts
    return date1 === date2;
}

function timeDifferenceInMinutes(isoStartTime, isoEndTime) {
    const start = new Date(isoStartTime);
    const end = new Date(isoEndTime);

    // Calculate the difference in milliseconds and convert to minutes
    const diffInMilliseconds = end - start;
    return Math.round(diffInMilliseconds / 60000); // Convert to minutes
}

function compareDatesAndTimeDifference(isoStartTime, isoEndTime) {
    if (isSameDate(isoStartTime, isoEndTime)) {
        // If dates match, calculate the time difference in minutes
        const minutesDifference = timeDifferenceInMinutes(isoStartTime, isoEndTime);
        console.log(`Dates match. Time difference: ${minutesDifference} minutes`);
        return minutesDifference;
    } else {
        console.log("Dates do not match.");
        return null;
    }
}

function convertUTCToEST(isoDateString) {
    // Parse the UTC date
    const utcDate = new Date(isoDateString);

    // Check if the date is in Daylight Saving Time (EDT) or Standard Time (EST)
    const isDST = utcDate.getMonth() >= 2 && utcDate.getMonth() <= 10; // March to November
    const offset = isDST ? -4 : -5; // EDT is UTC-4, EST is UTC-5

    // Adjust the UTC date by the correct offset
    const easternDate = new Date(utcDate.getTime() + offset * 60 * 60 * 1000);

    // Format as ISO and replace 'Z' with the correct offset
    return easternDate.toISOString().replace('Z', isDST ? '-04:00' : '-05:00');
}

function addValueIfNotNegative(value, numbers) {
    if (value >= 0) {
        numbers.push(value);
    }
}

function sortAscendingArray(numbers) {
    // Sort the array from lowest to highest
    numbers = numbers.filter(n => n !== null);
    numbers = numbers.filter(n => n >= 0).sort((a, b) => a - b);
}

module.exports = { compareDatesAndTimeDifference, sortAscendingArray, isSameDate, convertToISO, getCurrentESTISO, convertUTCToEST, addValueIfNotNegative };