// src/content/Ticker.jsx
import React, { useEffect, useRef } from "react";
import TickerBlock from "./TickerBlock";
import "../css/styles.css";

const Ticker = ({
  blocks = [],
  visibleBlocks = 5,
  speed = "default",
  height = 200,
  heightMode,
  theme,
  borderRadius,
}) => {
  const tickerContentRef = useRef(null);
  const totalBlocks = blocks.length;

  useEffect(() => {
    // Apply theme and border radius to the body of the iframe
    document.body.className = `${theme} ${borderRadius}`;
  }, [theme, borderRadius]);

  // Duplicate blocks for seamless looping
  const tickerBlocks = [...blocks, ...blocks];

  // Use a ref to store currentIndex
  const currentIndexRef = useRef(0);

  // Calculate font sizes based on visibleBlocks and heightMode
  const calculateFontSizes = (visibleBlocks, heightMode) => {
    let baseFontSize;

    // Adjust base font size based on heightMode
    switch (heightMode) {
      case "shorter":
        baseFontSize = 10;
        break;
      case "taller":
        baseFontSize = 16;
        break;
      case "default":
      default:
        baseFontSize = 14;
        break;
    }

    // Adjust font size based on the number of visible blocks
    const scoreFontSize = baseFontSize * (8 / visibleBlocks);
    const statusFontSize = baseFontSize * (6 / visibleBlocks);
    const dateFontSize = baseFontSize * (4 / visibleBlocks);

    return { scoreFontSize, statusFontSize, dateFontSize };
  };

  const { scoreFontSize, statusFontSize, dateFontSize } = calculateFontSizes(
    visibleBlocks,
    heightMode
  );

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

    const stepWidth = 100 / visibleBlocks;
    const tickerContent = tickerContentRef.current;

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

  // Apply dynamic font sizes based on visibleBlocks and heightMode
  useEffect(() => {
    const tickerContainer = tickerContentRef.current?.parentElement;
    if (tickerContainer) {
      tickerContainer.style.setProperty(
        "--score-font-size",
        `${scoreFontSize}px`
      );
      tickerContainer.style.setProperty(
        "--status-font-size",
        `${statusFontSize}px`
      );
      tickerContainer.style.setProperty(
        "--date-font-size",
        `${dateFontSize}px`
      );
    }
  }, [visibleBlocks, heightMode, scoreFontSize, statusFontSize, dateFontSize]);

  return (
    <div
      className="ticker-container"
      style={{
        "--visible-blocks": visibleBlocks,
        height: `${height}px`,
      }}
    >
      {totalBlocks > 0 ? (
        <div className="ticker-content" ref={tickerContentRef}>
          {tickerBlocks.map((blockContent, index) => (
            <TickerBlock key={index} content={blockContent} />
          ))}
        </div>
      ) : (
        <div
          className="no-game-data"
          style={{
            height: `${height}px`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          No available game data, please choose a different preset.
        </div>
      )}
    </div>
  );
};

export default Ticker;
