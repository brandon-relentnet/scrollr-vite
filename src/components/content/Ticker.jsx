// src/content/Ticker.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import TickerBlock from "./TickerBlock";
import { debounce } from "../utils/debounce"; // Adjust the import path as necessary
import { useStore, initializeStore } from "/store"; // Adjust the import path

const Ticker = ({ blocks = [] }) => {
  const { settings } = useStore();
  const { theme, borderRadius, speed } = settings;
  const tickerContainerRef = useRef(null);
  const tickerContentRef = useRef(null);
  const totalBlocks = blocks.length;

  // State for dynamic visibleBlocks
  const [visibleBlocks, setVisibleBlocks] = useState(1);

  useEffect(() => {
    // Initialize the store
    initializeStore();
  }, []);

  useEffect(() => {
    // Apply theme and border radius classes to the iframe's body
    const applyClasses = () => {
      const { theme, borderRadius } = settings;

      // Define available themes and border radii
      const themes = ["mocha", "latte", "frappe", "macchiato", "light"];
      const borderRadii = ["0", "6", "18"];

      // Remove existing theme classes
      themes.forEach((t) => document.body.classList.remove(t));

      // Add the current theme class
      if (theme && themes.includes(theme)) {
        document.body.classList.add(theme);
        console.log(`Ticker: Applied theme: ${theme}`);
      }

      // Remove existing border-radius classes
      borderRadii.forEach((r) =>
        document.body.classList.remove(`border-radius-${r}`)
      );

      // Add the current border-radius class
      if (
        borderRadius !== undefined &&
        borderRadii.includes(String(borderRadius))
      ) {
        document.body.classList.add(`border-radius-${borderRadius}`);
        console.log(`Ticker: Applied border-radius-${borderRadius}`);
      } else {
        console.log(`Ticker: Invalid borderRadius value: ${borderRadius}`);
      }
    };

    applyClasses();
  }, [settings.theme, settings.borderRadius]);

  // Duplicate blocks for seamless looping
  const tickerBlocks = [...blocks, ...blocks];

  // Ref to store currentIndex
  const currentIndexRef = useRef(0);

  // Function to calculate visibleBlocks based on container width
  const updateVisibleBlocks = useCallback(() => {
    if (tickerContainerRef.current) {
      const containerWidth = tickerContainerRef.current.offsetWidth;
      const minBlockWidth = 250; // Desired minimum block width in pixels
      const calculatedVisibleBlocks = Math.max(
        1,
        Math.floor(containerWidth / minBlockWidth)
      );
      setVisibleBlocks(calculatedVisibleBlocks);
      console.log(`Ticker: Visible blocks set to: ${calculatedVisibleBlocks}`);
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
    console.log(
      `Ticker: Ticker interval set with stepDuration: ${stepDuration}ms`
    );

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