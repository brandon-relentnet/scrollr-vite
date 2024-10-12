// store.js
import { create } from "zustand";
import { defaultSettings } from "./defaultSettings";

const useStore = create((set) => ({
  settings: defaultSettings,
  setSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),
}));

export default useStore;
