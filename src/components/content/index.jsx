// ContentApp.jsx
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import Ticker from "./Ticker";
import useStore from "/store";
import { defaultSettings } from "/defaultSettings";
import "../css/styles.css";

const ContentApp = () => {
  const { settings, setSettings } = useStore();

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
        const newSettings = { ...settings };
        for (let key in changes) {
          newSettings[key] = changes[key].newValue;
        }
        setSettings(newSettings);
      }
    });
  }, [setSettings]);

  return <Ticker />;
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<ContentApp />);
