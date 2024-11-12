// src/components/EventCard.js
import React from 'react';
import TeamInfo from './TeamInfo';
import ScoreDisplay from './ScoreDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { pinEvent, unpinEvent } from '../../store/pinnedEventsSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const EventCard = ({ event }) => {
    const gameLink =
        event.links?.find(link => link.rel.includes('gamecast'))?.href ||
        event.links?.[0]?.href;

    const homeTeam = event.competitions[0].competitors.find(c => c.homeAway === 'home');
    const awayTeam = event.competitions[0].competitors.find(c => c.homeAway === 'away');

    const isGameOver = event.status?.type?.completed;
    const eventStatus = event.status?.type?.shortDetail;

    const dispatch = useDispatch();
    const pinnedEvents = useSelector((state) => state.pinnedEvents);
    const isPinned = pinnedEvents.includes(event.id); // Ensure event.id exists

    const handlePinClick = (e) => {
        e.stopPropagation(); // Prevent click event from propagating to parent
        if (isPinned) {
            dispatch(unpinEvent(event.id));
        } else {
            dispatch(pinEvent(event.id));
        }
    };

    return (
        <div className="p-2">
            <div
                onClick={() => gameLink && window.open(gameLink, '_blank')}
                className="relative bg-surface0 rounded shadow p-4 h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-transparent hover:border-accent transition duration-300 hover:shadow-lg"
            >
                <div className="flex flex-col md:flex-row items-center w-full">
                    {/* Away Team */}
                    <div className="flex-1 flex justify-center min-w-0">
                        <TeamInfo team={awayTeam} />
                    </div>

                    {/* Score Display */}
                    <div className="flex flex-col items-center mx-2 min-w-0 w-1/4">
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
                {/* Pin/Unpin Button */}
                <button
                    onClick={handlePinClick}
                    className="absolute top-1 right-1 py-1 px-3 rounded hover:bg-surface1 transition duration-300"
                    title={isPinned ? 'Unpin Event' : 'Pin Event'}
                >
                    <FontAwesomeIcon
                        icon={isPinned ? 'times' : 'map-pin'}
                        className={`text-lg ${isPinned ? 'text-red' : 'text-overlay1'}`}
                    />
                </button>
            </div>
        </div>
    );
};

export default EventCard;
