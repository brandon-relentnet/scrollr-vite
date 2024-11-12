// src/store/leagueSlice.js
import { createSlice } from '@reduxjs/toolkit';

const leagueSlice = createSlice({
    name: 'league',
    initialState: 'api-data-nhl', // Default league identifier
    reducers: {
        setLeague: (state, action) => action.payload, // Set league based on payload
    },
});

export const { setLeague } = leagueSlice.actions;
export default leagueSlice.reducer;
