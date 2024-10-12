// src/popup/Popup.jsx
import React, { useState, useEffect } from "react";
import TotalBlocksManager from "../components/managers/TotalBlocksManager";
import ThemeManager from "../components/managers/ThemeManager";
import HeightManager from "../components/managers/HeightManager";
import SpeedManager from "../components/managers/SpeedManager";
import DisplayedWeekManager from "../components/managers/DisplayedWeekManager";
import BorderRadiusManager from "../components/managers/BorderRadiusManager";
import SportsPresetManager from "../components/managers/SportsPresetManager";

const Popup = () => {
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
    // Load settings from chrome.storage
    chrome.storage.sync.get(defaultSettings, (result) => {
      setSettings(result);
    });
  }, []);

  // Update individual settings
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Save to chrome.storage
    chrome.storage.sync.set({ [key]: value });
  };

  return (
    <div className="popup-controls">
      <TotalBlocksManager
        visibleBlocks={settings.visibleBlocks}
        setVisibleBlocks={(value) => updateSetting("visibleBlocks", value)}
      />

      <SportsPresetManager
        selectedSport={settings.selectedSport}
        setSelectedSport={(value) => updateSetting("selectedSport", value)}
      />

      <SpeedManager
        speed={settings.speed}
        setSpeed={(value) => updateSetting("speed", value)}
      />

      <HeightManager
        heightMode={settings.heightMode}
        setHeightMode={(value) => updateSetting("heightMode", value)}
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
    </div>
  );
};

export default Popup;