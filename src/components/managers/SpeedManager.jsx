// src/components/managers/SpeedManager.jsx
import React from "react";

const SpeedManager = ({ speed, setSpeed }) => {
  const handleSpeedChange = (e) => {
    const newSpeed = e.target.value;
    setSpeed(newSpeed);
  };

  return (
    <div className="speed-manager">
      <label>Speed:</label>
      <div className="select-wrapper">
        <select value={speed} onChange={handleSpeedChange}>
          <option value="fast">Faster</option>
          <option value="default">Classic</option>
          <option value="slow">Slower</option>
        </select>
      </div>
    </div>
  );
};

export default SpeedManager;
