// src/features/league/LeagueDropdown.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLeague } from '../../store/leagueSlice';
import Dropdown from '../../components/Dropdown';

const leagueOptions = [
    { value: 'api-data-nfl', label: 'NFL' },
    { value: 'api-data-mlb', label: 'MLB' },
    { value: 'api-data-nhl', label: 'NHL' },
    { value: 'api-data-nba', label: 'NBA' },
];

function LeagueDropdown() {
    const dispatch = useDispatch();
    const selectedLeague = useSelector((state) => state.league);

    const handleLeagueSelect = (league) => {
        dispatch(setLeague(league));
    };

    return (
        <div className="mb-4">
            <Dropdown
                options={leagueOptions}
                onSelect={handleLeagueSelect}
                label="Select League"
                selectedValue={selectedLeague}
            />
        </div>
    );
}

export default LeagueDropdown;
