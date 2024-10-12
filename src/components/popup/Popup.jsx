// src/popup/Popup.jsx
import React, { useEffect } from "react";
import ThemeManager from "../managers/ThemeManager";
import SpeedManager from "../managers/SpeedManager";
import DisplayedWeekManager from "../managers/DisplayedWeekManager";
import BorderRadiusManager from "../managers/BorderRadiusManager";
import SportsPresetManager from "../managers/SportsPresetManager";
import "../css/styles.css";
import useStore from "/store";
import { defaultSettings } from "/defaultSettings";
import VisibleBlocksManager from '../managers/VisibleBlocksManager'; // Import the new manager

const Popup = () => {
  const { settings, setSettings } = useStore();

  // Load settings from chrome.storage and listen for changes
  useEffect(() => {
    // Load initial settings
    chrome.storage.sync.get(defaultSettings, (result) => {
      console.log("Popup: Loaded settings", result);
      setSettings(result);
    });

    // Listen for changes in chrome.storage
    chrome.storage.onChanged.addListener((changes, areaName) => {
      console.log("Popup: Storage changed", changes, areaName);
      if (areaName === "sync") {
        const newSettings = { ...settings };
        for (let key in changes) {
          newSettings[key] = changes[key].newValue;
        }
        setSettings(newSettings);
      }
    });
  }, [setSettings]);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    chrome.storage.sync.set({ [key]: value });
  };

  return (
    <div className="popup-controls">
      {/* Existing Managers */}
      <SportsPresetManager
        selectedSport={settings.selectedSport}
        setSelectedSport={(value) => updateSetting("selectedSport", value)}
      />
      <SpeedManager
        speed={settings.speed}
        setSpeed={(value) => updateSetting("speed", value)}
      />
      <DisplayedWeekManager
        weekRange={settings.weekRange}
        setWeekRange={(value) => updateSetting("weekRange", value)}
      />
      <ThemeManager
        theme={settings.theme}
        setTheme={(value) => updateSetting("theme", value)}
      />
      <BorderRadiusManager
        borderRadius={settings.borderRadius}
        setBorderRadius={(value) => updateSetting("borderRadius", value)}
      />
      <VisibleBlocksManager
        visibleBlocks={settings.visibleBlocks}
        setVisibleBlocks={(value) => updateSetting("visibleBlocks", value)}
      />
    </div>
  );
};

export default Popup;
