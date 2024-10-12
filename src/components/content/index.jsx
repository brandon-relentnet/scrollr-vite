// src/content/ContentApp.jsx
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import Ticker from "./Ticker";
import { useFetchGames } from "../utils/useFetchGames";
import useStore from "/store";
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

  // Function to send the iframe's height to the parent
  const sendHeightToParent = () => {
    const height = document.body.scrollHeight;
    console.log("sendHeightToParent called. Height:", height);
    window.parent.postMessage({ type: "iframeHeight", height }, "*");
  };

  // Adjust iframe height when height changes
  useEffect(() => {
    sendHeightToParent();
  }, [height, blocks.length]);

  return <Ticker blocks={blocks} height={height} {...settings} />;
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ContentApp />);
