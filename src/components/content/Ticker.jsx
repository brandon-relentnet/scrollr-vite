// Ticker.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import TickerBlock from "./TickerBlock";
import "../css/styles.css";
import { debounce } from "../utils/debounce"; // Adjust the import path as necessary

const Ticker = ({ blocks = [], speed = "default", theme, borderRadius }) => {
  const tickerContainerRef = useRef(null);
  const tickerContentRef = useRef(null);
  const totalBlocks = blocks.length;

  // State for dynamic visibleBlocks
  const [visibleBlocks, setVisibleBlocks] = useState(1);

  useEffect(() => {
    // Apply theme and border radius to the body
    document.body.className = `${theme} ${borderRadius}`;
  }, [theme, borderRadius]);

  // Duplicate blocks for seamless looping
  const tickerBlocks = [...blocks, ...blocks];

  // Ref to store currentIndex
  const currentIndexRef = useRef(0);

  // Function to calculate visibleBlocks based on container width
  const updateVisibleBlocks = useCallback(() => {
    if (tickerContainerRef.current) {
      const containerWidth = tickerContainerRef.current.offsetWidth;
      const minBlockWidth = 200; // Desired minimum block width in pixels
      const calculatedVisibleBlocks = Math.max(
        1,
        Math.floor(containerWidth / minBlockWidth)
      );
      setVisibleBlocks(calculatedVisibleBlocks);
    }
  }, []);

  useEffect(() => {
    // Initial calculation
    updateVisibleBlocks();

    // Add event listener for window resize with debounce
    const handleResize = debounce(updateVisibleBlocks, 100); // Debounce with 100ms delay

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateVisibleBlocks]);

  useEffect(() => {
    if (totalBlocks === 0) return;

    let stepDuration;
    let transitionDuration;

    switch (speed) {
      case "fast":
        stepDuration = 2500;
        transitionDuration = 1200;
        break;
      case "slow":
        stepDuration = 4500;
        transitionDuration = 2500;
        break;
      default:
        stepDuration = 3500;
        transitionDuration = 1800;
        break;
    }

    const tickerContent = tickerContentRef.current;
    const stepWidth = 100 / visibleBlocks;

    tickerContent.style.transition = "none";
    tickerContent.style.transform = `translateX(-${
      currentIndexRef.current * stepWidth
    }%)`;

    const moveNext = () => {
      currentIndexRef.current++;
      tickerContent.style.transition = `transform ${transitionDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
      tickerContent.style.transform = `translateX(-${
        currentIndexRef.current * stepWidth
      }%)`;

      if (currentIndexRef.current >= totalBlocks) {
        setTimeout(() => {
          tickerContent.style.transition = "none";
          tickerContent.style.transform = `translateX(0%)`;
          tickerContent.getBoundingClientRect(); // Force reflow
          currentIndexRef.current = 0;
        }, transitionDuration);
      }
    };

    const intervalId = setInterval(moveNext, stepDuration);

    return () => {
      clearInterval(intervalId);
    };
  }, [totalBlocks, visibleBlocks, speed]);

  return (
    <div className="ticker-container" ref={tickerContainerRef}>
      {totalBlocks > 0 ? (
        <div className="ticker-content" ref={tickerContentRef}>
          {tickerBlocks.map((blockContent, index) => (
            <TickerBlock
              key={index}
              content={blockContent}
              visibleBlocks={visibleBlocks}
            />
          ))}
        </div>
      ) : (
        <div className="no-game-data">
          No available game data, please choose a different preset.
        </div>
      )}
    </div>
  );
};

export default Ticker;
