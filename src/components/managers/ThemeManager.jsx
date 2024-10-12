// src/components/managers/ThemeManager.jsx
import React from "react";
import "../../css/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPalette,
  faCloud,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";

const ThemeManager = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    const themes = ["mocha", "macchiato", "frappe", "latte"];
    const currentThemeIndex = themes.indexOf(theme);
    const newTheme = themes[(currentThemeIndex + 1) % themes.length];
    setTheme(newTheme);
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === "mocha" ? (
        <FontAwesomeIcon icon={faPalette} className="svg-shadow" />
      ) : theme === "macchiato" ? (
        <FontAwesomeIcon icon={faCloud} className="svg-shadow" />
      ) : theme === "frappe" ? (
        <FontAwesomeIcon icon={faSun} className="svg-shadow" />
      ) : (
        <FontAwesomeIcon icon={faMoon} className="svg-shadow" />
      )}
    </button>
  );
};

export default ThemeManager;
