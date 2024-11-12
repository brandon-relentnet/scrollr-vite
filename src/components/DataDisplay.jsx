// src/components/DataDisplay.js
import React, { useEffect } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import EventsDisplay from './events/EventsDisplay';

// Initialize Socket.IO outside the component to prevent multiple connections
const socket = io('http://localhost:3000', { // Ensure this URL is correct
    transports: ['websocket'], // Optional: enforce WebSocket transport
    reconnectionAttempts: 5, // Optional: limit reconnection attempts
});

const fetchEvents = async (identifier) => {
    const response = await axios.get(`http://localhost:3000/api/events/${identifier}`);
    return response.data;
};

const DataDisplay = ({ identifier }) => { // Accept 'identifier' as a prop
    const queryClient = useQueryClient();

    const {
        data: events,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['events', identifier],
        queryFn: () => fetchEvents(identifier),
        staleTime: 60000, // Data is fresh for 60 seconds
        cacheTime: 300000, // Cache data for 5 minutes
        retry: 2, // Retry failed requests up to 2 times
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });

    useEffect(() => {
        // Listen for data updates
        const handleDataUpdate = (update) => {
            console.log('Received dataUpdate:', update);
            if (update.identifier === identifier) {
                console.log(`Invalidating queries for identifier: ${identifier}`);
                queryClient.invalidateQueries(['events', identifier]);
            }
        };

        // Listen for game updates
        const handleGameUpdate = (update) => {
            console.log('Received gameUpdate:', update);
            if (update.identifier === identifier) {
                console.log(`Invalidating queries for identifier: ${identifier} due to game update`);
                queryClient.invalidateQueries(['events', identifier]);
            }
        };

        socket.on('dataUpdate', handleDataUpdate);
        socket.on('gameUpdate', handleGameUpdate);

        // Cleanup on unmount
        return () => {
            socket.off('dataUpdate', handleDataUpdate);
            socket.off('gameUpdate', handleGameUpdate);
        };
    }, [identifier, queryClient]);

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
