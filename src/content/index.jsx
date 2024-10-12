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

  useEffect(() => {
    // Load initial settings from chrome.storage
    chrome.storage.sync.get(defaultSettings, (result) => {
      setSettings(result);
    });

    // Listen for changes in chrome.storage
    chrome.storage.onChanged.addListener((changes, areaName) => {
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

  // Use your custom hook to fetch games based on settings
  const blocks = useFetchGames(settings);

  return <Ticker blocks={blocks} {...settings} />;
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ContentApp />);