// src/components/EventCard.js
import React from 'react';
import TeamInfo from './TeamInfo';
import ScoreDisplay from './ScoreDisplay';

const EventCard = ({ event }) => {
    const gameLink =
        event.links?.find(link => link.rel.includes('gamecast'))?.href ||
        event.links?.[0]?.href;

    const homeTeam = event.competitions[0].competitors.find(c => c.homeAway === 'home');
    const awayTeam = event.competitions[0].competitors.find(c => c.homeAway === 'away');

    const isGameOver = event.status?.type?.completed;
    const eventStatus = event.status?.type?.shortDetail;

    return (
        <div className="p-2">
            <div
                onClick={() => gameLink && window.open(gameLink, '_blank')}
                className="bg-surface0 rounded shadow p-4 h-full flex flex-col items-center justify-center cursor-pointer border-2 border-transparent hover:border-accent transition duration-300 hover:shadow-lg"
            >
                <div className="flex flex-col md:flex-row items-center w-full">
                    {/* Away Team */}
                    <div className="flex-1 flex justify-center min-w-0">
                        <TeamInfo team={awayTeam} />
                    </div>

                    {/* Score Display */}
                    <div className="flex flex-col items-center mx-4 min-w-0 w-5/12">
                        <ScoreDisplay
                            homeTeam={homeTeam}
                            awayTeam={awayTeam}
                            isGameOver={isGameOver}
                            eventStatus={eventStatus}
                        />
                    </div>

                    {/* Home Team */}
                    <div className="flex-1 flex justify-center min-w-0">
                        <TeamInfo team={homeTeam} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
