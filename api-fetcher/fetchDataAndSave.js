// fetchDataAndSave.js
require('dotenv').config(); // Load environment variables first

const axios = require('axios');
const connectDB = require('./db'); // Import the connection function
const Data = require('./models/Data');

const API_URLS = process.env.VITE_API_URLS
    ? process.env.VITE_API_URLS.split(',').map(url => url.trim())
    : [];

if (API_URLS.length === 0) {
    console.error('❌ No API URLs provided. Please set VITE_API_URLS in your environment variables.');
    process.exit(1);
}

// Mapping of APIs to meaningful identifiers
const API_IDENTIFIERS = ['nfl', 'mlb', 'nhl', 'nba']; // Adjust as per your APIs

// Function to fetch data from a single API URL
const fetchData = async (url) => {
    try {
        const response = await axios.get(url);
        console.log(`📥 Data fetched from API (${url}):`, response.data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error fetching data from API (${url}):`, error.message);
        return null;
    }
};

// Helper function to generate a unique identifier based on the API name
const generateIdentifier = (name) => {
    return `api-data-${name}`; // e.g., api-data-nfl, api-data-mlb, etc.
};

// Function to fetch data from all APIs and update MongoDB
const fetchDataAndSave = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Fetch data concurrently
        const fetchPromises = API_URLS.map((url, index) =>
            fetchData(url).then(data => ({
                url,
                data,
                identifier: generateIdentifier(API_IDENTIFIERS[index]),
            }))
        );
        const results = await Promise.all(fetchPromises);

        // Process each result
        for (const result of results) {
            const { url, data, identifier } = result;
            if (data) {
                await Data.findOneAndUpdate(
                    { _id: identifier },
                    { data, fetchedAt: new Date() },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                console.log(`✅ Data saved to MongoDB for API (${url}) with identifier (${identifier})`);
            }
        }
    } catch (error) {
        console.error('❌ Error saving data to MongoDB:', error.message);
    }
};

// Execute the function if this script is run directly
if (require.main === module) {
    fetchDataAndSave()
        .then(() => {
            console.log('🎉 All data fetched and saved successfully.');
            process.exit(0); // Exit the process successfully
        })
        .catch((error) => {
            console.error('❌ An error occurred:', error);
            process.exit(1); // Exit the process with failure
        });
}

module.exports = fetchDataAndSave;
