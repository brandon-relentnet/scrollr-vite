// routes.js
const express = require('express');
const Data = require('./models/Data');

const router = express.Router();

// Fetch season data
router.get('/api/season', async (req, res) => {
    try {
        const data = await Data.findOne().sort({ fetchedAt: -1 });
        res.json(data.data.season); // Access season inside the nested data object
    } catch (error) {
        console.error('Error fetching season:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch week data
router.get('/api/week', async (req, res) => {
    try {
        const data = await Data.findOne().sort({ fetchedAt: -1 });
        res.json(data.data.week); // Access week inside the nested data object
    } catch (error) {
        console.error('Error fetching week:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch events data
router.get('/api/events', async (req, res) => {
    try {
        const data = await Data.findOne().sort({ fetchedAt: -1 });
        res.json(data.data.events); // Access events inside the nested data object
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
