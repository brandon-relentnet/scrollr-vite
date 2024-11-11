// src/components/ScoreDisplay.js
import React from 'react';

const ScoreDisplay = ({ homeTeam, awayTeam, isGameOver, eventStatus, eventDate }) => {
    const homeScore = parseInt(homeTeam.score);
    const awayScore = parseInt(awayTeam.score);

    let homeScoreClass = '';
    let awayScoreClass = '';

    if (isGameOver) {
        if (homeScore > awayScore) {
            homeScoreClass = 'text-green';
            awayScoreClass = 'text-red';
        } else if (awayScore > homeScore) {
            awayScoreClass = 'text-green';
            homeScoreClass = 'text-red';
        }
    }

    return (
        <div className="flex flex-col items-center mx-4">
            <div className="flex items-center font-bold text-text">
                <span className={`text-lg ${awayScoreClass}`}>{awayTeam.score}</span>
                <span className="mx-1">-</span>
                <span className={`text-lg ${homeScoreClass}`}>{homeTeam.score}</span>
            </div>
            <p className="text-sm text-subtext0 text-center break-words">
                {eventStatus}
            </p>
        </div>
    );
};

export default ScoreDisplay;
