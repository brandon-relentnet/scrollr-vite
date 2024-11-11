import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Slider from 'react-slick';
import EventCard from './EventCard';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const EventsDisplay = ({ events }) => {
    if (!events || events.length === 0) return <p>No events data available.</p>;

    const speed = useSelector((state) => state.carouselSpeed) || 'classic';
    const pinnedEvents = useSelector((state) => state.pinnedEvents) || [];
    const unpinnedEvents = events.filter(event => !pinnedEvents.includes(event.id));

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

    const sliderRef = useRef(null);
    const carouselContainerRef = useRef(null);

    // State to manage slidesToShow
    const [slidesToShow, setSlidesToShow] = useState(3);

    // Minimum width per slide in pixels
    const minSlideWidth = 300; // Adjust as needed

    // Function to calculate slidesToShow based on container width
    const calculateSlidesToShow = () => {
        if (!carouselContainerRef.current) return;
        const containerWidth = carouselContainerRef.current.offsetWidth;
        const newSlidesToShow = Math.max(
            1,
            Math.floor(containerWidth / minSlideWidth)
        );
        setSlidesToShow(newSlidesToShow);
    };

    useEffect(() => {
        // Initial calculation
        calculateSlidesToShow();

        // Create a ResizeObserver to monitor container size changes
        const resizeObserver = new ResizeObserver(() => {
            calculateSlidesToShow();
        });

        if (carouselContainerRef.current) {
            resizeObserver.observe(carouselContainerRef.current);
        }

        // Cleanup on unmount
        return () => {
            resizeObserver.disconnect();
        };
    }, [pinnedEvents]); // Recalculate when pinnedEvents change

    // Slider settings without 'responsive'
    const settings = {
        dots: false,
        arrows: false,
        infinite: unpinnedEvents.length > slidesToShow,
        speed: animationSpeed,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: autoplaySpeed,
        slidesToShow: slidesToShow,
        // Removed 'responsive' settings
    };

    return (
        <div className="mt-4 bg-base overflow-hidden">
            <div className="flex items-stretch">
                {/* Pinned Events Section */}
                {pinnedEvents.length > 0 && (
                    <div className="flex flex-shrink-0 h-full overflow-hidden mr-4">
                        {events
                            .filter(event => pinnedEvents.includes(event.id))
                            .map(event => (
                                <div key={event.id} className="event-slide mx-2">
                                    <EventCard event={event} />
                                </div>
                            ))}
                    </div>
                )}

                {/* Carousel for Unpinned Events */}
                {unpinnedEvents.length > 0 ? (
                    <div className="overflow-hidden h-full flex-grow" ref={carouselContainerRef}>
                        <Slider key={`slider-${slidesToShow}`} ref={sliderRef} {...settings}>
                            {unpinnedEvents.map(event => (
                                <div key={event.id} className="event-slide">
                                    <EventCard event={event} />
                                </div>
                            ))}
                        </Slider>
                    </div>
                ) : (
                    <p>No more events to display.</p>
                )}
            </div>
        </div>
    );
};

export default EventsDisplay;
