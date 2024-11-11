// fetchDataAndSave.js
const axios = require('axios');
const Data = require('./models/Data');

const API_URL = process.env.VITE_API_URL;

// Function to fetch data from the external API
async function fetchData() {
    try {
        const response = await axios.get(API_URL);
        console.log('Data fetched from API:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        return null;
    }
}

// Function to fetch data and update MongoDB
async function fetchDataAndSave() {
    try {
        const data = await fetchData();
        if (data) {
            // Use a fixed _id to ensure only one document exists
            await Data.findOneAndUpdate(
                { _id: 'singleton-nfl' },
                { data, fetchedAt: new Date() },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log('Data saved to MongoDB (updated singleton document)');
        }
    } catch (error) {
        console.error('Error saving data to MongoDB:', error);
    }
}

module.exports = fetchDataAndSave;
