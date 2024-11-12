// routes.js
const express = require('express');
const Data = require('./models/Data');

const router = express.Router();

// Fetch specific API data based on identifier
router.get('/api/events/:id', async (req, res) => {
    const { id } = req.params; // Extract 'id' from the URL

    try {
        // Validate the 'id' parameter
        const validIds = ['api-data-nfl', 'api-data-mlb', 'api-data-nhl', 'api-data-nba'];
        if (!validIds.includes(id)) {
            return res.status(400).json({ message: 'Invalid identifier' });
        }

        // Fetch the document with the specified _id
        const dataDocument = await Data.findById(id);

        if (!dataDocument) {
            return res.status(404).json({ message: 'Data not found for the given identifier' });
        }

        // Ensure that 'events' exist within the nested 'data' object
        if (!dataDocument.data || !dataDocument.data.events) {
            return res.status(404).json({ message: 'Events data not available' });
        }

        res.json(dataDocument.data.events); // Return the 'events' array
    } catch (error) {
        console.error(`Error fetching data for identifier (${id}):`, error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
