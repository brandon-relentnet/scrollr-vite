// src/store.js
import { create } from "zustand";
import { defaultSettings } from "./defaultSettings";

const useStore = create((set) => ({
  settings: defaultSettings,
  setSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),
  scalingMode: "classic", // Default mode
  setScalingMode: (mode) => set({ scalingMode: mode }),
}));

let isStoreInitialized = false;

const initializeStore = () => {
  if (isStoreInitialized) return;
  isStoreInitialized = true;

  chrome.storage.sync.get(defaultSettings, (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading settings:", chrome.runtime.lastError);
      return;
    }
    useStore.getState().setSettings(result);
    if (result.scalingMode) {
      useStore.getState().setScalingMode(result.scalingMode);
    }
  });

  // Listen for changes in chrome.storage.sync
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync") {
      const updatedSettings = {};
      for (let key in changes) {
        updatedSettings[key] = changes[key].newValue;
      }
      useStore.getState().setSettings(updatedSettings);
      if (updatedSettings.scalingMode) {
        useStore.getState().setScalingMode(updatedSettings.scalingMode);
      }
    }
  });
};

export { useStore, initializeStore };
