import React, { useEffect, useLayoutEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import Ticker from "./Ticker";
import { useFetchGames } from "../utils/useFetchGames";
import { useStore } from "/store";
import { defaultSettings } from "/defaultSettings";
import "../css/styles.css";

const ContentApp = () => {
  const { settings, setSettings } = useStore();
  const blocks = useFetchGames(settings);

  // Apply theme and border radius to the body of the iframe
  useEffect(() => {
    document.body.className = `${settings.theme} ${settings.borderRadius}`;
    document.body.style.background = "transparent"; // Ensure background is transparent
  }, [settings.theme, settings.borderRadius]);

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
        const newSettings = {};
        for (let key in changes) {
          newSettings[key] = changes[key].newValue;
        }
        setSettings(newSettings);
      }
    });
  }, [setSettings]);

  return <Ticker blocks={blocks} {...settings} />;
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ContentApp />);
