// src/components/popup/Popup.jsx
import React, { useEffect } from "react";
import ThemeManager from "../managers/ThemeManager";
import SpeedManager from "../managers/SpeedManager";
import DisplayedWeekManager from "../managers/DisplayedWeekManager";
import BorderRadiusManager from "../managers/BorderRadiusManager";
import SportsPresetManager from "../managers/SportsPresetManager";
import { useStore, initializeStore } from "/store"; // Adjusted relative path
import ScalingModeManager from "../managers/ScalingModeManager";

const Popup = () => {
  const { settings, scalingMode } = useStore();

  useEffect(() => {
    // Initialize the store
    initializeStore();
  }, []);

  // Apply theme and border radius classes to the popup's body
  useEffect(() => {
    const { theme, borderRadius } = settings;

    // Define available themes and border radii
    const themes = ["mocha", "latte", "frappe", "macchiato", "light"];
    const borderRadii = ["0", "6", "18"];

    // Remove existing theme classes
    themes.forEach((t) => document.body.classList.remove(t));

    // Add the current theme class
    if (theme && themes.includes(theme)) {
      document.body.classList.add(theme);
      console.log(`Applied theme: ${theme}`);
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
      console.log(`Applied border-radius-${borderRadius}`);
    }
  }, [settings.theme, settings.borderRadius]);

  const updateSetting = (key, value) => {
    const newSetting = { [key]: value };
    useStore.getState().setSettings(newSetting); // Update Zustand store
    chrome.storage.sync.set(newSetting, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error setting ${key}:`, chrome.runtime.lastError);
      } else {
        console.log(`Successfully set ${key} to`, value);
      }
    });
  };

  const updateScalingMode = (mode) => {
    useStore.getState().setScalingMode(mode);
    chrome.storage.sync.set({ scalingMode: mode }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error setting scalingMode:", chrome.runtime.lastError);
      } else {
        console.log("Successfully set scalingMode to", mode);
      }
    });
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
      {/* Scaling Mode Selector */}
      <ScalingModeManager
        scalingMode={scalingMode}
        setScalingMode={updateScalingMode}
      />
    </div>
  );
};

export default Popup;
