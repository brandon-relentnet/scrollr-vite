// src/components/DataDisplay.js
import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import EventsDisplay from './events/EventsDisplay';

const fetchEvents = async (identifier) => {
    const response = await axios.get(`http://localhost:3000/api/events/${identifier}`);
    return response.data;
};

const DataDisplay = ({ identifier }) => { // Accept 'identifier' as a prop
    const {
        data: events,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['events', identifier],
        queryFn: () => fetchEvents(identifier),
        staleTime: 60000, // Optional: data is fresh for 60 seconds
        cacheTime: 300000, // Optional: cache data for 5 minutes
        retry: 2, // Optional: retry failed requests up to 2 times
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });

    if (isLoading) return <p>Loading events...</p>;
    if (isError) {
        console.error('Error fetching events:', error);
        return <p>Error fetching events data: {error.message}</p>;
    }

    return (
        <div>
            <EventsDisplay events={events} />
        </div>
    );
};

export default DataDisplay;
