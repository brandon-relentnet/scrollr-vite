// src/content/index.jsx
import React, { useState, useEffect } from "react";
import Ticker from "./Ticker";
import { useFetchGames } from "../utils/useFetchGames";
import { createRoot } from "react-dom/client";
import "../css/styles.css";

const ContentApp = () => {
  const defaultSettings = {
    visibleBlocks: 4,
    speed: "default",
    heightMode: "default",
    weekRange: "current",
    selectedSport: "football",
    theme: "mocha",
    borderRadius: "border-radius-6",
  };

  const [settings, setSettings] = useState(defaultSettings);

  // Use your custom hook to fetch games based on settings
  const blocks = useFetchGames(settings);

  // Compute height based on settings.heightMode
  const getHeightFromMode = (heightMode) => {
    switch (heightMode) {
      case "shorter":
        return 150; // Adjust as needed
      case "taller":
        return 250; // Adjust as needed
      case "default":
      default:
        return 200; // Adjust as needed
    }
  };

  const height = getHeightFromMode(settings.heightMode);

  // Apply theme and border radius to the body of the iframe
  useEffect(() => {
    document.body.className = `${settings.theme} ${settings.borderRadius}`;
    document.body.style.background = "transparent"; // Ensure background is transparent
  }, [settings.theme, settings.borderRadius]);

  // Function to send the iframe's height to the parent
  const sendHeightToParent = () => {
    const height = document.body.scrollHeight;
    console.log("sendHeightToParent called. Height:", height);
    window.parent.postMessage({ type: "iframeHeight", height }, "*");
  };

  // Adjust iframe height when height changes
  useEffect(() => {
    sendHeightToParent();
  }, [height]);

  // Load settings from chrome.storage and listen for changes
  useEffect(() => {
    // Load initial settings
    chrome.storage.sync.get(defaultSettings, (result) => {
      console.log("Content script: Loaded settings", result);
      setSettings(result);
    });

    // Listen for changes in chrome.storage
    chrome.storage.onChanged.addListener((changes, areaName) => {
      console.log("Content script: Storage changed", changes, areaName);
      if (areaName === "sync") {
        setSettings((prevSettings) => {
          const newSettings = { ...prevSettings };
          for (let key in changes) {
            newSettings[key] = changes[key].newValue;
          }
          return newSettings;
        });
      }
    });
  }, []);

  return <Ticker blocks={blocks} height={height} {...settings} />;
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ContentApp />);
