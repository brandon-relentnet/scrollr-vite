// src/components/EventsDisplay.js
import React from 'react';
import { useSelector } from 'react-redux';
import Slider from 'react-slick';
import EventCard from './EventCard';

const EventsDisplay = ({ events }) => {
    if (!events || events.length === 0) return <p>No events data available.</p>;

    const speed = useSelector((state) => state.carouselSpeed); // Get speed from Redux store

    // Determine the speed settings based on the speed
    let autoplaySpeed = 3000; // default for 'classic'
    let animationSpeed = 1000; // default animation speed

    if (speed === 'slower') {
        autoplaySpeed = 5000; // slower autoplay speed
        animationSpeed = 1500; // slower animation speed
    } else if (speed === 'faster') {
        autoplaySpeed = 1500; // faster autoplay speed
        animationSpeed = 500; // faster animation speed
    }

    const maxSlidesToShow = Math.min(events.length, 8); // Maximum slides to show is 8 or total events
    const settings = {
        dots: false,
        arrows: false,
        infinite: events.length > maxSlidesToShow, // Disable infinite loop if not enough slides
        speed: animationSpeed,
        slidesToShow: maxSlidesToShow,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: autoplaySpeed,
        responsive: [
            // Breakpoints adjusted to not exceed events.length
            {
                breakpoint: 2560,
                settings: {
                    slidesToShow: Math.min(events.length, 7),
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1920,
                settings: {
                    slidesToShow: Math.min(events.length, 6),
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1600,
                settings: {
                    slidesToShow: Math.min(events.length, 5),
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1366,
                settings: {
                    slidesToShow: Math.min(events.length, 4),
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(events.length, 3),
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 800,
                settings: {
                    slidesToShow: Math.min(events.length, 2),
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div className="mt-4 bg-base">
            <Slider {...settings}>
                {events.map((event, index) => (
                    <div key={index}>
                        <EventCard event={event} />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default EventsDisplay;
