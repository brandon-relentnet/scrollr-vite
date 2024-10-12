import React, { useEffect, useRef } from "react";
import TickerBlock from "./TickerBlock";
import "../css/styles.css";
import { debounce } from "../utils/debounce";
import useStore from "/store";
import { useFetchGames } from "../utils/useFetchGames";

const Ticker = () => {
  const tickerContainerRef = useRef(null);
  const tickerContentRef = useRef(null);

  // Get settings from Zustand store
  const { settings } = useStore();
  const {
    speed = "default",
    theme,
    borderRadius,
    visibleBlocks = 5, // Use visibleBlocks from settings
  } = settings;

  // Fetch blocks using useFetchGames hook
  const blocks = useFetchGames(settings);
  const totalBlocks = blocks.length;

  // Duplicate blocks for seamless looping
  const tickerBlocks = React.useMemo(() => [...blocks, ...blocks], [blocks]);

  const currentIndexRef = useRef(0);
  const stepWidth = 100 / visibleBlocks;

  // Apply theme and border radius to the body
  useEffect(() => {
    document.body.className = `${theme} ${borderRadius}`;
  }, [theme, borderRadius]);

  // Reset currentIndex when visibleBlocks or totalBlocks change
  useEffect(() => {
    currentIndexRef.current = 0;
  }, [visibleBlocks, totalBlocks]);

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
  }, [totalBlocks, visibleBlocks, speed, stepWidth]);

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
