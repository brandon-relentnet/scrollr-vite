// src/components/managers/SportsPresetManager.jsx
import React from "react";

const SportsPresetManager = ({ selectedSport, setSelectedSport }) => {
  const sports = ["football", "hockey", "baseball", "basketball"];

  const handleSportChange = (e) => {
    const newSport = e.target.value;
    setSelectedSport(newSport);
  };

  return (
    <div className="sports-preset-manager">
      <label htmlFor="sports">Select Sport:</label>
      <select id="sports" value={selectedSport} onChange={handleSportChange}>
        {sports.map((sport) => (
          <option key={sport} value={sport}>
            {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SportsPresetManager;
